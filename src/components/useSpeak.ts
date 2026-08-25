'use client';
import { useState, useRef, useCallback } from 'react';

export function useSpeak() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  // Which clip refused to play. Audio is the product, so a failure has to be
  // visible on the control the child just tapped rather than only in console.
  const [failedId, setFailedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const speak = useCallback(async (textOrPath: string, id: string, fallbackText?: string, onEnded?: () => void) => {
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
    setFailedId(null);

    // Check if this is a pre-generated audio path (starts with /audio/)
    const isPreGenerated = textOrPath.startsWith('/audio/');

    const playTts = async (text: string) => {
      setTtsLoading(true);

      // Venice TTS returns the whole clip in one response — there's no real
      // progress signal. Simulate one (fast climb, asymptotic near the end)
      // so the percentage keeps moving instead of stalling on a spinner.
      const start = performance.now();
      setTtsProgress(4);
      progressTimerRef.current = window.setInterval(() => {
        const elapsed = performance.now() - start;
        setTtsProgress(Math.min(92, Math.round(92 * (1 - Math.exp(-elapsed / 1100)))));
      }, 80);

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

        if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
        setTtsProgress(100);
        await new Promise(r => setTimeout(r, 150));

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setCurrentlyPlaying(null);
          URL.revokeObjectURL(url);
          onEnded?.();
        };
        audio.onerror = () => {
          setCurrentlyPlaying(null);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      } catch (err) {
        console.error('TTS error:', err);
        setCurrentlyPlaying(null);
        setFailedId(id);
      } finally {
        if (progressTimerRef.current) {
          window.clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        setTtsLoading(false);
        setTtsProgress(0);
      }
    };

    if (isPreGenerated) {
      // Play pre-generated audio file directly — no API call, instant playback
      try {
        const audio = new Audio(textOrPath);
        audioRef.current = audio;
        audio.onended = () => {
          setCurrentlyPlaying(null);
          onEnded?.();
        };
        audio.onerror = () => {
          audioRef.current = null;
          if (fallbackText) void playTts(fallbackText);
          else {
            setCurrentlyPlaying(null);
            setFailedId(id);
          }
        };
        await audio.play();
      } catch {
        if (fallbackText) await playTts(fallbackText);
        else {
          setCurrentlyPlaying(null);
          setFailedId(id);
        }
      }
    } else {
      // Fall back to TTS API for dynamic text (e.g., chat messages)
      await playTts(textOrPath);
    }
  }, [currentlyPlaying]);

  return { speak, currentlyPlaying, ttsLoading, ttsProgress, failedId };
}
