'use client';
import { useState, useRef, useCallback } from 'react';

export function useSpeak() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (textOrPath: string, id: string, fallbackText?: string) => {
    // Toggle off if already playing this item
    if (currentlyPlaying === id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setCurrentlyPlaying(null);
      return;
    }
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setCurrentlyPlaying(id);

    // Check if this is a pre-generated audio path (starts with /audio/)
    const isPreGenerated = textOrPath.startsWith('/audio/');

    const playTts = async (text: string) => {
      setTtsLoading(true);
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            model: 'tts-xai-v1',
            voice: 'eve',
            speed: 0.9,
          }),
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
    };

    if (isPreGenerated) {
      // Play pre-generated audio file directly — no API call, instant playback
      try {
        const audio = new Audio(textOrPath);
        audioRef.current = audio;
        audio.onended = () => setCurrentlyPlaying(null);
        audio.onerror = () => {
          audioRef.current = null;
          if (fallbackText) void playTts(fallbackText);
          else setCurrentlyPlaying(null);
        };
        await audio.play();
      } catch {
        if (fallbackText) await playTts(fallbackText);
        else setCurrentlyPlaying(null);
      }
    } else {
      // Fall back to TTS API for dynamic text (e.g., chat messages)
      await playTts(textOrPath);
    }
  }, [currentlyPlaying]);

  return { speak, currentlyPlaying, ttsLoading };
}
