'use client';
import { useState, useRef, useCallback } from 'react';

export function useSpeak() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, id: string) => {
    if (currentlyPlaying === id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setCurrentlyPlaying(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentlyPlaying(id);
    setTtsLoading(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setCurrentlyPlaying(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setCurrentlyPlaying(null);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setCurrentlyPlaying(null);
    } finally {
      setTtsLoading(false);
    }
  }, [currentlyPlaying]);

  return { speak, currentlyPlaying, ttsLoading };
}
