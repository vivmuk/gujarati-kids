'use client';
import { useState, useRef, useLayoutEffect, useEffect, type CSSProperties } from 'react';
import { useSpeak } from './useSpeak';
import { Guju } from './RisoFolk';
import { Icon, type IconName } from './Icon';
import { SpeakGlyph } from './ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  followups?: FollowupPrompt[];
  image?: string | null; // base64 data URL from grok-imagine
  imageLoading?: boolean; // shows shimmer while the image is being generated
  imagePrompt?: string | null;
  video?: string | null;
  videoLoading?: boolean;
  videoError?: string | null;
  streaming?: boolean; // true while tokens are still arriving
}

interface FollowupPrompt {
  label: string;
  send: string;
  level: number;
}

// Tappable conversation starters so kids who can't type yet can dive in.
const CHARACTERS = [
  { id: 'guju', name: 'Guju', blurb: 'A friendly bird', icon: 'namaste', color: 'var(--ink-saffron)' },
  { id: 'nani', name: 'Nani', blurb: 'Your grandmother', icon: 'family', color: 'var(--ink-indigo)' },
  { id: 'tiger', name: 'Vagh', blurb: 'A jungle tiger', icon: 'paw', color: 'var(--ink-leaf)' },
] as const;
const STARTERS: Array<{ label: string; icon: IconName; send: string }> = [
  { label: 'Scavenger hunt', icon: 'quiz', send: "Let's play a scavenger hunt! Give me something to find in Gujarati!" },
  { label: 'પ્રાણીઓ · Animals', icon: 'paw', send: 'Teach me some animals in Gujarati' },
  { label: 'Count to 10', icon: 'numbers', send: 'Help me count from 1 to 10 in Gujarati' },
  { label: 'વાર્તા · A story', icon: 'stories', send: 'Tell me a short fun story in Gujarati' },
  { label: 'Colours', icon: 'palette', send: 'Teach me colors in Gujarati' },
  { label: 'Gujarati food', icon: 'bowl', send: 'Tell me about a famous Gujarati food' },
];

const FALLBACK_FOLLOWUPS: Record<number, string[]> = {
  1: [
    'Teach me 3 more easy Gujarati words',
    'Ask me to repeat one word from this',
    'Show me one picture word in Gujarati',
    'Teach me an animal word and a food word',
  ],
  2: [
    'Give me a short Gujarati phrase using this',
    'Quiz me with one missing word',
    'Teach me the polite way to say this',
    'Help me say this to my family',
  ],
  3: [
    'Help me make a full Gujarati sentence',
    'Ask me a simple Gujarati question',
    'Give me a tiny dialogue using this',
    'Teach me the opposite or related word',
  ],
  4: [
    'Explain the grammar pattern in this sentence',
    'Show me how gender changes this phrase',
    'Teach me present and past forms for this idea',
    'Compare the Gujarati word order with English',
  ],
  5: [
    'Make a 4-line Gujarati dialogue about this',
    'Tell me a tiny story using these words',
    'Connect this to a Gujarati festival or custom',
    'Ask me to retell this in simple Gujarati',
  ],
  6: [
    'Role-play a real conversation using this',
    'Help me explain my opinion in Gujarati',
    'Compare Gujarati and Hindi for this idea',
    'Give me a harder mixed quiz on this topic',
  ],
};

let uidCounter = 0;
const uid = () => `m${Date.now()}-${uidCounter++}`;

function imageSrc(image: string): string {
  return image.startsWith('data:') ? image : `data:image/webp;base64,${image}`;
}

// Hide the silent `IMAGE: ...` instruction (and any partial marker still being
// typed at the very end) from what the child sees while tokens stream in.
function liveVisible(raw: string): string {
  const i = raw.search(/\n(?:IMAGE|FOLLOWUP(?:\s*\d+)?)\s*:/i);
  let v = i >= 0 ? raw.slice(0, i) : raw;
  v = v.replace(/\nI(?:M(?:A(?:G(?:E)?)?)?)?:?\s*$/i, '');
  v = v.replace(/\nF(?:O(?:L(?:L(?:O(?:W(?:U(?:P)?)?)?)?)?)?)?(?:\s*\d*)?:?\s*$/i, '');
  return v.trim();
}

// Final parse once the stream is complete: split the visible reply from the
// optional image prompt and silent follow-up prompts.
function parseFinal(raw: string): { visible: string; imagePrompt: string | null; followups: FollowupPrompt[] } {
  const lines = raw.split('\n');
  let imagePrompt: string | null = null;
  const followups: FollowupPrompt[] = [];
  const kept: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*IMAGE:\s*(.+)$/i);
    const f = line.match(/^\s*FOLLOWUP(?:\s*\d+)?\s*:\s*(.+)$/i);
    if (m) imagePrompt = m[1].trim();
    else if (f) {
      const normalized = normalizeFollowup(f[1]);
      if (normalized) followups.push({ label: normalized, send: normalized, level: 1 });
    } else if (!/^\s*FOLLOWUPS?\s*:?\s*$/i.test(line)) {
      kept.push(line);
    }
  }
  return { visible: kept.join('\n').trim(), imagePrompt, followups: followups.slice(0, 3) };
}

function normalizeFollowup(text: string): string | null {
  const value = text
    .replace(/^\s*[-*\d.)]+\s*/, '')
    .replace(/^["']|["']$/g, '')
    .trim();
  if (!value || value.length < 6) return null;
  return value.length > 130 ? `${value.slice(0, 127).trim()}...` : value;
}

function stageForTurn(userTurnCount: number): number {
  return Math.min(6, Math.max(1, 1 + Math.floor((userTurnCount - 1) / 2)));
}

function randomFollowups(userTurnCount: number, currentPrompt: string): FollowupPrompt[] {
  const level = stageForTurn(userTurnCount);
  const pool = [
    ...(FALLBACK_FOLLOWUPS[level] || []),
    ...(FALLBACK_FOLLOWUPS[Math.max(1, level - 1)] || []),
  ];
  const shuffled = [...new Set(pool)].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  if (!selected.length) selected.push(`Teach me one harder sentence about: ${currentPrompt}`);
  return selected.map(label => ({ label, send: label, level }));
}

function tagFollowupLevels(followups: FollowupPrompt[], userTurnCount: number): FollowupPrompt[] {
  const base = stageForTurn(userTurnCount);
  return followups.slice(0, 3).map((followup, index) => ({
    ...followup,
    level: Math.min(6, base + (index === 2 ? 1 : 0)),
  }));
}

function GujuThinking() {
  return (
    <div className="flex items-center gap-3 py-1" aria-label="Guju is thinking">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
        <span className="absolute inset-0 rounded-full border-2 opacity-40 rf-blink" style={{ borderColor: 'var(--ink-saffron)' }} />
        <Guju size={28} sw={2.3} />
      </span>
      <span className="flex items-end gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="rf-think h-2 w-2 rounded-full"
            style={{ background: i % 2 === 0 ? 'var(--ink-saffron)' : 'var(--ink-indigo)', animationDelay: `${i * 130}ms` }}
          />
        ))}
      </span>
    </div>
  );
}

export function ChatSection() {
  const [character, setCharacter] = useState('guju');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'greeting', role: 'assistant', content: 'નમસ્તે! I am ગુજુ (Guju), your Gujarati friend. Ask me anything — a word, a phrase, or just chat with me in Gujarati.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true); // auto-speak Guju's replies
  const { speak, currentlyPlaying, ttsLoading, ttsProgress, failedId } = useSpeak();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoUrlsRef = useRef<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    return () => {
      videoUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      videoUrlsRef.current = [];
    };
  }, []);

  // Keep the latest message in view as tokens stream — unless the user scrolled up to read.
  const [autoScroll, setAutoScroll] = useState(true);
  const onMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distanceFromBottom < 80);
  };
  useLayoutEffect(() => {
    if (autoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, autoScroll]);

  const patch = (id: string, p: Partial<ChatMessage>) =>
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, ...p } : m)));

  const generateVideo = async (msg: ChatMessage) => {
    if (!msg.image || msg.videoLoading) return;
    patch(msg.id, { videoLoading: true, videoError: null });

    try {
      const subject = msg.imagePrompt || 'the Gujarati learning illustration';
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageSrc(msg.image),
          prompt: `A gentle Gujarati folk riso-style learning animation of ${subject}. Keep the full subject visible with generous padding, a light cream or white background, subtle friendly motion, no cropping, no new text, no watermark.`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Video generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      videoUrlsRef.current.push(url);
      patch(msg.id, { video: url, videoLoading: false });
    } catch {
      patch(msg.id, {
        videoLoading: false,
        videoError: 'Video could not be generated for this picture. Try another prompt.',
      });
    }
  };

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || isLoading) return;
    setInput('');
    setAutoScroll(true);

    // Build clean history (visible text only) before adding the new turn.
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const userTurnCount = messages.filter(m => m.role === 'user').length + 1;

    const userId = uid();
    const botId = uid();
    setMessages(prev => [
      ...prev,
      { id: userId, role: 'user', content: text },
      { id: botId, role: 'assistant', content: '', streaming: true },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, character }),
      });
      if (!res.ok || !res.body) throw new Error('Chat error');

      // Read the streamed plain-text reply token by token.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        patch(botId, { content: liveVisible(acc) });
      }

      const { visible, imagePrompt, followups } = parseFinal(acc);
      const finalText = visible || 'Sorry, I did not understand that. Try asking me another way?';
      const nextPrompts = followups.length
        ? tagFollowupLevels(followups, userTurnCount)
        : randomFollowups(userTurnCount, text);
      patch(botId, {
        content: finalText,
        streaming: false,
        imageLoading: !!imagePrompt,
        imagePrompt,
        followups: nextPrompts,
      });

      // Auto-speak the reply for early readers.
      if (voiceOn && finalText) speak(finalText, botId);

      // Fire the illustration in the background — never block the chat on it.
      if (imagePrompt) {
        try {
          const imgRes = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: imagePrompt }),
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            patch(botId, { image: imgData.images?.[0] || null, imageLoading: false });
          } else {
            patch(botId, { imageLoading: false });
          }
        } catch {
          patch(botId, { imageLoading: false });
        }
      }
    } catch {
      patch(botId, {
        content: 'I could not reach my brain just then. Tap a question below to try again.',
        streaming: false,
        imageLoading: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    if (isRecording || isLoading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        try {
          const formData = new FormData();
          formData.append('file', blob, 'audio.webm');
          formData.append('language', 'gu');
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          if (!res.ok) throw new Error('STT failed');
          const data = await res.json();
          if (data.text?.trim()) setInput(data.text);
          else setMicError('I did not catch that. Hold the button and speak again.');
        } catch {
          setMicError('I could not understand the recording. Try once more?');
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setMicError(null);
      setIsRecording(true);
    } catch {
      setMicError('I cannot hear the microphone. Ask a grown-up to let me listen.');
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const showStarters = messages.length <= 1 && !isLoading;

  return (
    <div
      className="flex flex-col"
      style={{ height: 'var(--chat-h)', minHeight: 420 }}
    >
      {/* Who you are talking to */}
      <div
        className="rf-surface rf-lift-saffron flex flex-shrink-0 items-center"
        style={{ gap: 'var(--s-3)', padding: 'var(--s-3)' }}
      >
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            flex: 'none',
            borderRadius: 'var(--r-md)',
            background: 'var(--paper)',
            border: 'var(--key-thin)',
            boxShadow: 'var(--lift-1) var(--ink-indigo)',
          }}
        >
          <Guju size={34} sw={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 'var(--t-md)', fontWeight: 700, color: 'var(--ink-indigo)' }}>Guju</p>
          <p className="rf-gujarati truncate" style={{ fontSize: 'var(--t-xs)', color: 'var(--text-2)' }}>
            ગુજુ — તમારો ગુજરાતી મિત્ર
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVoiceOn(v => !v)}
          aria-label={voiceOn ? 'Turn the voice off' : 'Turn the voice on'}
          aria-pressed={voiceOn}
          className="rf-icon-btn"
        >
          <Icon name={voiceOn ? 'speakerLoud' : 'speakerOff'} size={19} />
        </button>
      </div>

      {/* Conversation */}
      <div
        ref={messagesContainerRef}
        onScroll={onMessagesScroll}
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ padding: 'var(--s-3) 0', display: 'grid', gap: 'var(--s-3)', alignContent: 'start' }}
      >
        {messages.length === 1 && (
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
              Who should teach you today?
            </legend>
            <div className="flex flex-wrap" style={{ gap: 'var(--s-2)' }}>
              {CHARACTERS.map(person => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setCharacter(person.id)}
                  aria-pressed={character === person.id}
                  className="rf-chip"
                  style={{ '--chip-ink': person.color } as CSSProperties}
                >
                  <Icon name={person.icon} size={17} strokeWidth={2.2} />
                  <span>
                    {person.name}
                    <span style={{ fontWeight: 500, opacity: 0.8 }}> · {person.blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                style={{
                  maxWidth: 'min(88%, 62ch)',
                  padding: 'var(--s-3) var(--s-4)',
                  borderRadius: 'var(--r-lg)',
                  border: 'var(--key-thin)',
                  background: isUser ? 'var(--ink-saffron-deep)' : 'var(--paper)',
                  color: isUser ? 'var(--text-on-ink)' : 'var(--text-1)',
                  borderBottomRightRadius: isUser ? 'var(--s-1)' : undefined,
                  borderBottomLeftRadius: isUser ? undefined : 'var(--s-1)',
                  boxShadow: isUser ? 'var(--lift-1) var(--ink-key)' : 'var(--lift-1) var(--ink-indigo)',
                }}
              >
                {!isUser && msg.streaming && !msg.content ? (
                  <GujuThinking />
                ) : (
                  <p style={{ fontSize: 'var(--t-sm)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                    {msg.streaming && (
                      <span
                        className="rf-blink"
                        style={{
                          display: 'inline-block',
                          width: 6,
                          height: 15,
                          marginLeft: 2,
                          verticalAlign: 'middle',
                          background: 'var(--ink-saffron)',
                        }}
                      />
                    )}
                  </p>
                )}

                {!isUser && (msg.image || msg.imageLoading) && (
                  <div className="rf-art-frame" style={{ marginTop: 'var(--s-2)' }}>
                    {msg.image ? (
                      <img
                        src={imageSrc(msg.image)}
                        alt={msg.imagePrompt || 'A picture Guju drew'}
                        className="rf-art w-full"
                        style={{ maxHeight: 288, padding: 'var(--s-2)' }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="rf-skeleton flex items-center justify-center"
                        style={{ height: 128, gap: 'var(--s-2)', color: 'var(--text-2)' }}
                      >
                        <Icon name="image" size={20} />
                        <span style={{ fontSize: 'var(--t-xs)', fontWeight: 700 }}>Guju is drawing...</span>
                      </div>
                    )}
                  </div>
                )}

                {!isUser && msg.image && (
                  <div style={{ marginTop: 'var(--s-2)' }}>
                    {!msg.video && (
                      <button
                        type="button"
                        onClick={() => generateVideo(msg)}
                        disabled={msg.videoLoading}
                        data-busy={msg.videoLoading ? 'true' : undefined}
                        className="rf-btn rf-btn--secondary"
                        style={{ minHeight: 38, fontSize: 'var(--t-xs)' }}
                      >
                        <Icon name="video" size={15} />
                        {msg.videoLoading ? 'Making it move...' : 'Make it move'}
                      </button>
                    )}
                    {msg.videoError && (
                      <p role="status" style={{ marginTop: 'var(--s-1)', fontSize: 'var(--t-2xs)', color: 'var(--ink-pink)' }}>
                        {msg.videoError}
                      </p>
                    )}
                    {msg.video && (
                      <video
                        src={msg.video}
                        controls
                        playsInline
                        className="rf-art-frame w-full"
                        style={{ marginTop: 'var(--s-2)', maxHeight: 288 }}
                      />
                    )}
                  </div>
                )}

                {!isUser && !msg.streaming && msg.followups?.length ? (
                  <div
                    className="flex flex-wrap"
                    style={{ gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}
                    aria-label="Things to ask next"
                  >
                    {msg.followups.map((followup, index) => (
                      <button
                        key={`${msg.id}-followup-${index}`}
                        type="button"
                        onClick={() => sendMessage(followup.send)}
                        disabled={isLoading}
                        className="rf-chip"
                        style={{
                          minHeight: 34,
                          padding: '0 var(--s-3)',
                          fontSize: 'var(--t-xs)',
                          whiteSpace: 'normal',
                          textAlign: 'left',
                          background: 'var(--paper-sunk)',
                        }}
                      >
                        {followup.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {!isUser && !msg.streaming && msg.content && (
                  <button
                    type="button"
                    onClick={() => speak(msg.content, msg.id)}
                    className="rf-btn rf-btn--quiet"
                    style={{ marginTop: 'var(--s-2)', padding: '0 var(--s-2)', fontSize: 'var(--t-xs)' }}
                  >
                    <SpeakGlyph
                      id={msg.id}
                      currentlyPlaying={currentlyPlaying}
                      ttsLoading={ttsLoading}
                      ttsProgress={ttsProgress}
                      failedId={failedId}
                      size={16}
                    />
                    {failedId === msg.id ? 'That did not play — tap to try again' : 'Read it to me'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Starters */}
      {showStarters && (
        <div className="flex-shrink-0" style={{ paddingBottom: 'var(--s-2)' }}>
          <p className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
            Try asking
          </p>
          <div className="flex flex-wrap" style={{ gap: 'var(--s-2)' }}>
            {STARTERS.map(starter => (
              <button
                key={starter.label}
                type="button"
                onClick={() => sendMessage(starter.send)}
                className="rf-chip"
                style={{ minHeight: 36, fontSize: 'var(--t-xs)' }}
              >
                <Icon name={starter.icon} size={15} strokeWidth={2.2} />
                {starter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div
        className="flex flex-shrink-0 items-center"
        style={{ gap: 'var(--s-2)', paddingTop: 'var(--s-3)', borderTop: 'var(--key-thin)' }}
      >
        <button
          type="button"
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerLeave={stopRecording}
          onPointerCancel={stopRecording}
          aria-label="Hold to speak"
          className={`rf-icon-btn ${isRecording ? 'rf-listening' : ''}`}
          style={{
            background: isRecording ? 'var(--ink-pink)' : 'var(--paper)',
            color: isRecording ? 'var(--text-on-ink)' : 'var(--ink-indigo)',
            touchAction: 'none',
          }}
        >
          <Icon name="mic" size={19} />
        </button>

        <label className="rf-sr" htmlFor="guju-input">
          Ask Guju something
        </label>
        <input
          id="guju-input"
          type="text"
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => event.key === 'Enter' && sendMessage()}
          placeholder={isRecording ? 'Listening...' : 'Type in English or Gujarati...'}
          className="rf-field"
          style={{ flex: 1, minWidth: 0 }}
        />

        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
          aria-label="Send"
          className="rf-icon-btn"
          style={{
            background: !input.trim() || isLoading ? 'var(--paper-sunk)' : 'var(--ink-saffron-deep)',
            color: !input.trim() || isLoading ? 'var(--text-2)' : 'var(--text-on-ink)',
          }}
        >
          <Icon name="send" size={19} />
        </button>
      </div>

      {micError && (
        <p
          role="status"
          className="flex flex-shrink-0 items-center"
          style={{
            gap: 'var(--s-2)',
            paddingTop: 'var(--s-2)',
            fontSize: 'var(--t-xs)',
            fontWeight: 600,
            color: 'var(--state-alert)',
          }}
        >
          <Icon name="mic" size={14} />
          {micError}
        </p>
      )}
    </div>
  );
}
