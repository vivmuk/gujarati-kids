'use client';
import { useState, useRef, useEffect } from 'react';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'નમસ્તે! 🙏 I\'m ગુજુ (Guju), your Gujarati learning buddy! Ask me anything — words, phrases, grammar, or just chat in Gujarati! 🤖✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n') }),
      });
      if (!res.ok) throw new Error('Chat error');
      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.content || data.message || 'Sorry, I couldn\'t understand that.' };
      setMessages(prev => [...prev, assistantMsg]);
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const id = `chat-${i}`;
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? 'text-white rounded-br-md' : 'glass-card rounded-bl-md'}`}
                style={isUser ? { background: 'var(--gradient-saffron)' } : {}}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
