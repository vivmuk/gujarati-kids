'use client';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string | null; // base64 data URL from grok-imagine
  imageLoading?: boolean; // shows shimmer while the image is being generated
}

const IMAGE_LOADING_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#fef3c7"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14" fill="#92400e">🎨 drawing...</text>
    </svg>`
  );

export function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'નમસ્તે! 🙏 I\'m ગુજુ (Guju), your Gujarati learning buddy! Ask me anything — words, phrases, grammar, or just chat in Gujarati! 🤖✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Smooth scroll: useLayoutEffect fires synchronously after DOM mutation but before paint,
  // so the new message is in the DOM when we measure its position. Wrapping in rAF waits one
  // extra frame for nested flex children (image, etc.) to fully lay out.
  useLayoutEffect(() => {
    if (!chatEndRef.current) return;
    const id = requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    return () => cancelAnimationFrame(id);
  }, [messages]);

  // Detect when the user manually scrolls up — don't yank them back down while reading
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

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setAutoScroll(true); // re-engage autoscroll on new send
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Build context for the LLM — last 6 messages, plain text
    const context = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context }),
      });
      if (!res.ok) throw new Error('Chat error');
      const data = await res.json();

      // Add the text reply immediately with an imageLoading slot for the illustration
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Sorry, I couldn\'t understand that.',
          image: data.image || null,
          imageLoading: data.image === undefined ? false : !data.image, // only show shimmer if image was attempted
        },
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong. Try again? 🙏' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
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
          if (data.text?.trim()) {
            setInput(data.text);
          }
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

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--gradient-berry)' }}>
          <div className="flex items-center gap-3 p-3 text-white">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="font-bold">Guju AI</p>
              <p className="text-white/70 text-xs" style={{ fontFamily: 'var(--font-gujarati)' }}>ગુજુ - તમારો ગુજરાતી મિત્ર</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages — scroll-smooth on the container, plus rAF scrollIntoView for safety */}
      <div
        ref={messagesContainerRef}
        onScroll={onMessagesScroll}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-3 chat-scroll"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const id = `chat-${i}`;
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? 'text-white rounded-br-md' : 'glass-card rounded-bl-md'}`}
                style={isUser ? { background: 'var(--gradient-saffron)' } : {}}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

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

                {!isUser && (
                  <button onClick={() => speak(msg.content, id)} className="mt-1 text-xs opacity-60 hover:opacity-100 transition-opacity">
                    <SpeakIcon id={id} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} /> Listen
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <span className="animate-pulse text-sm">typing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button onClick={toggleRecording}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
            {isRecording ? '⏹' : '🎙'}
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type in English or Gujarati..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button onClick={sendMessage} disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-all disabled:opacity-40"
            style={{ background: 'var(--gradient-saffron)' }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
