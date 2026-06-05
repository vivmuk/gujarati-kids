'use client';
import { useState, useRef, useLayoutEffect } from 'react';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string | null; // base64 data URL from grok-imagine
  imageLoading?: boolean; // shows shimmer while the image is being generated
  streaming?: boolean; // true while tokens are still arriving
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

// Hide the silent `IMAGE: ...` instruction (and any partial marker still being
// typed at the very end) from what the child sees while tokens stream in.
function liveVisible(raw: string): string {
  const i = raw.search(/\nIMAGE:/i);
  let v = i >= 0 ? raw.slice(0, i) : raw;
  v = v.replace(/\nI(?:M(?:A(?:G(?:E)?)?)?)?:?\s*$/i, '');
  return v.trim();
}

// Final parse once the stream is complete: split the visible reply from the
// optional image prompt.
function parseFinal(raw: string): { visible: string; imagePrompt: string | null } {
  const lines = raw.split('\n');
  let imagePrompt: string | null = null;
  const kept: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*IMAGE:\s*(.+)$/i);
    if (m) imagePrompt = m[1].trim();
    else kept.push(line);
  }
  return { visible: kept.join('\n').trim(), imagePrompt };
}

export function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'greeting', role: 'assistant', content: 'નમસ્તે! 🙏 I\'m ગુજુ (Guju), your Gujarati learning buddy! Ask me anything — words, phrases, grammar, or just chat in Gujarati! 🤖✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true); // auto-speak Guju's replies
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || isLoading) return;
    setInput('');
    setAutoScroll(true);

    // Build clean history (visible text only) before adding the new turn.
    const history = messages.map(m => ({ role: m.role, content: m.content }));

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

      const { visible, imagePrompt } = parseFinal(acc);
      const finalText = visible || 'Sorry, I couldn\'t understand that. 🙏';
      patch(botId, { content: finalText, streaming: false, imageLoading: !!imagePrompt });

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
          formData.append('model', 'openai/whisper-large-v3');
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
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--gradient-berry)' }}>
          <div className="flex items-center gap-3 p-3 text-white">
            <span className="text-3xl">🤖</span>
            <div className="flex-1">
              <p className="font-bold">Guju AI</p>
              <p className="text-white/70 text-xs" style={{ fontFamily: 'var(--font-gujarati)' }}>ગુજુ - તમારો ગુજરાતી મિત્ર</p>
            </div>
            {/* Auto-speak toggle */}
            <button
              onClick={() => setVoiceOn(v => !v)}
              aria-label={voiceOn ? 'Turn voice off' : 'Turn voice on'}
              title={voiceOn ? 'Voice on — Guju reads replies aloud' : 'Voice off'}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
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
        className="flex-1 overflow-y-auto px-4 py-2 space-y-3 chat-scroll"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? 'text-white rounded-br-md' : 'glass-card rounded-bl-md'}`}
                style={isUser ? { background: 'var(--gradient-saffron)' } : {}}>
                <p className="text-sm whitespace-pre-wrap">
                  {msg.content}
                  {msg.streaming && <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-amber-400 animate-pulse rounded-sm" />}
                </p>

                {/* Generated illustration from grok-imagine — 90s Indian textbook style */}
                {!isUser && (msg.image || msg.imageLoading) && (
                  <div className="mt-2 rounded-xl overflow-hidden border-2 border-amber-200 bg-amber-50">
                    {msg.image ? (
                      <img
                        src={msg.image.startsWith('data:') ? msg.image : `data:image/webp;base64,${msg.image}`}
                        alt="Guju's illustration"
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <img
                        src={IMAGE_LOADING_PLACEHOLDER}
                        alt="drawing..."
                        className="w-full h-32 object-cover animate-pulse"
                      />
                    )}
                  </div>
                )}

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
        <div className="px-4 pb-2">
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

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
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
