'use client';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { Guju, PlayTriangleIcon } from './RisoFolk';

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
const STARTERS = [
  { label: '🐄 પ્રાણીઓ શીખવો', send: 'Teach me some animals in Gujarati' },
  { label: '🔢 Count to 10', send: 'Help me count from 1 to 10 in Gujarati' },
  { label: '📖 વાર્તા કહો', send: 'Tell me a short fun story in Gujarati' },
  { label: '🎨 Colors', send: 'Teach me colors in Gujarati' },
  { label: '👋 Greetings', send: 'How do I greet people in Gujarati?' },
  { label: '🍲 Gujarati food', send: 'Tell me about a famous Gujarati food' },
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

const IMAGE_LOADING_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#fef3c7"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14" fill="#92400e">🎨 drawing...</text>
    </svg>`
  );

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
        <span className="absolute inset-0 rounded-full border-2 opacity-40 animate-ping" style={{ borderColor: 'var(--rf-saffron)' }} />
        <Guju size={28} sw={2.3} />
      </span>
      <span className="flex items-end gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="h-2 w-2 rounded-full animate-bounce"
            style={{ background: i % 2 === 0 ? 'var(--rf-saffron)' : 'var(--rf-indigo)', animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
    </div>
  );
}

export function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'greeting', role: 'assistant', content: 'નમસ્તે! 🙏 I\'m ગુજુ (Guju), your Gujarati learning buddy! Ask me anything — words, phrases, grammar, or just chat in Gujarati!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true); // auto-speak Guju's replies
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoUrlsRef = useRef<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
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
        body: JSON.stringify({ message: text, history }),
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
      const finalText = visible || 'Sorry, I couldn\'t understand that. 🙏';
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
      patch(botId, { content: 'Oops! Something went wrong. Try again? 🙏', streaming: false, imageLoading: false });
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
        } catch {
          // silently fail
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      // mic not available
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const showStarters = messages.length <= 1 && !isLoading;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 112px)' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div
          className="relative overflow-hidden bg-white"
          style={{ borderRadius: 'var(--rf-radius-card)', border: 'var(--rf-border)', boxShadow: 'var(--rf-shadow-saffron)' }}
        >
          <div className="flex items-center gap-3 p-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white"
              style={{ border: '2px solid var(--rf-ink)', boxShadow: '3px 3px 0 var(--rf-indigo)' }}
            >
              <Guju size={36} sw={2.5} />
            </span>
            <div className="flex-1">
              <p className="font-bold" style={{ color: 'var(--rf-indigo)' }}>Guju</p>
              <p className="text-xs" style={{ fontFamily: 'var(--font-gujarati)', color: 'var(--rf-muted)' }}>ગુજુ - તમારો ગુજરાતી મિત્ર</p>
            </div>
            {/* Auto-speak toggle */}
            <button
              onClick={() => setVoiceOn(v => !v)}
              aria-label={voiceOn ? 'Turn voice off' : 'Turn voice on'}
              title={voiceOn ? 'Voice on — Guju reads replies aloud' : 'Voice off'}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: voiceOn ? 'var(--rf-saffron)' : 'var(--rf-cream)', color: voiceOn ? '#fff' : 'var(--rf-ink)', border: '2px solid var(--rf-ink)' }}
            >
              {voiceOn ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={onMessagesScroll}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-3 chat-scroll"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? 'text-white rounded-br-md' : 'glass-card rounded-bl-md'}`}
                style={isUser ? { background: 'var(--gradient-saffron)' } : {}}>
                {!isUser && msg.streaming && !msg.content ? (
                  <GujuThinking />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.content}
                    {msg.streaming && <span className="inline-block w-1.5 h-4 ml-0.5 align-middle rounded-sm animate-pulse" style={{ background: 'var(--rf-saffron)' }} />}
                  </p>
                )}

                {/* Generated Venice illustration, kept fully visible for kids. */}
                {!isUser && (msg.image || msg.imageLoading) && (
                  <div
                    className="mt-2 overflow-hidden rounded-xl bg-white"
                    style={{ border: '2px solid var(--rf-ink)' }}
                  >
                    {msg.image ? (
                      <img
                        src={imageSrc(msg.image)}
                        alt="Guju's illustration"
                        className="h-auto max-h-72 w-full object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      <img
                        src={IMAGE_LOADING_PLACEHOLDER}
                        alt="drawing..."
                        className="h-32 w-full object-contain p-2 animate-pulse"
                      />
                    )}
                  </div>
                )}

                {!isUser && msg.image && (
                  <div className="mt-2">
                    {!msg.video && (
                      <button
                        type="button"
                        onClick={() => generateVideo(msg)}
                        disabled={msg.videoLoading}
                        className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
                        style={{
                          background: 'var(--rf-saffron)',
                          color: '#fff',
                          border: '2px solid var(--rf-ink)',
                          boxShadow: '2px 2px 0 var(--rf-ink)',
                        }}
                      >
                        <PlayTriangleIcon className="h-3.5 w-3.5" />
                        {msg.videoLoading ? 'Making video...' : 'Make video'}
                      </button>
                    )}
                    {msg.videoError && (
                      <p className="mt-1 text-[11px] font-semibold" style={{ color: 'var(--rf-saffron)' }}>
                        {msg.videoError}
                      </p>
                    )}
                    {msg.video && (
                      <video
                        src={msg.video}
                        controls
                        playsInline
                        className="mt-2 max-h-72 w-full rounded-xl bg-white object-contain"
                        style={{ border: '2px solid var(--rf-ink)' }}
                      />
                    )}
                  </div>
                )}

                {!isUser && !msg.streaming && msg.followups?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2" aria-label="Follow-up prompts">
                    {msg.followups.map((followup, index) => (
                      <button
                        key={`${msg.id}-followup-${index}`}
                        type="button"
                        onClick={() => sendMessage(followup.send)}
                        disabled={isLoading}
                        className="max-w-full rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold leading-snug transition-all active:scale-95 disabled:opacity-50"
                        style={{
                          background: 'var(--rf-cream)',
                          color: 'var(--rf-indigo)',
                          border: '1px solid rgba(30, 64, 175, 0.22)',
                        }}
                      >
                        <span className="mr-1 opacity-60">L{followup.level}</span>
                        {followup.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {!isUser && !msg.streaming && msg.content && (
                  <button onClick={() => speak(msg.content, msg.id)} className="mt-1 text-xs opacity-60 hover:opacity-100 transition-opacity">
                    <SpeakIcon id={msg.id} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} /> Listen
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Conversation starters */}
      {showStarters && (
        <div className="px-4 pb-2 flex-shrink-0">
          <p className="text-[11px] font-bold text-gray-400 mb-1.5">Try asking…</p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.send)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 active:scale-95 transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input — flex-shrink-0 keeps it always visible */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={stopRecording}
            onPointerCancel={stopRecording}
            aria-label="Hold to speak"
            title="Hold to speak"
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all select-none touch-none ${isRecording ? 'bg-red-500 text-white scale-110 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
            {isRecording ? '⏺' : '🎙'}
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={isRecording ? 'Listening… 🎧' : 'Type in English or Gujarati...'}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-all disabled:opacity-40"
            style={{ background: 'var(--gradient-saffron)' }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
