'use client';
import { useCallback, useRef, useState, type MutableRefObject } from 'react';
import { useSpeak } from './useSpeak';
import type { Balgeet } from '@/data/gujarati';
import { getBalgeetLineAudio } from '@/data/assets';

type SpeakFn = (textOrPath: string, id: string, fallbackText?: string, onEnded?: () => void) => Promise<void>;

// Plain (non-hook) recursive helper — kept outside the hook so it isn't
// subject to the react-hooks self-reference/ref-during-render rules.
function playFrom(
  speak: SpeakFn,
  song: Balgeet,
  index: number,
  stoppedRef: MutableRefObject<boolean>,
  currentIdRef: MutableRefObject<string | null>,
  setActiveLineIndex: (index: number | null) => void,
  setIsPlaying: (playing: boolean) => void,
) {
  if (stoppedRef.current) return;
  if (index >= song.lines.length) {
    setIsPlaying(false);
    setActiveLineIndex(null);
    currentIdRef.current = null;
    return;
  }
  const line = song.lines[index];
  const id = `singalong-${song.id}-line-${index}`;
  currentIdRef.current = id;
  setActiveLineIndex(index);
  // Pre-generated audio keeps the rhythm of a rhyme intact; live TTS is the
  // fallback for a line whose file has not been generated yet.
  void speak(getBalgeetLineAudio(song.id, index) || line.gujarati, id, line.gujarati, () => {
    if (stoppedRef.current) return;
    playFrom(speak, song, index + 1, stoppedRef, currentIdRef, setActiveLineIndex, setIsPlaying);
  });
}

export function useSingAlong() {
  const { speak, ttsLoading } = useSpeak();
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const stoppedRef = useRef(false);
  const currentIdRef = useRef<string | null>(null);

  const start = useCallback((song: Balgeet) => {
    stoppedRef.current = false;
    setIsPlaying(true);
    playFrom(speak, song, 0, stoppedRef, currentIdRef, setActiveLineIndex, setIsPlaying);
  }, [speak]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (currentIdRef.current) {
      // Calling speak() again with the currently-playing id toggles playback off
      void speak('', currentIdRef.current);
    }
    currentIdRef.current = null;
    setIsPlaying(false);
    setActiveLineIndex(null);
  }, [speak]);

  return { activeLineIndex, isPlaying, ttsLoading, start, stop };
}
