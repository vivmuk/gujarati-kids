'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * The app's small voice: taps, right answers, gentle retries, a star, a win.
 * Files are pre-generated in the same folk-instrument palette as the nursery
 * rhymes (marimba, manjira, glockenspiel) — see scripts/venice-fill.mts.
 *
 * Sound is a preference, not a decoration: a child who taps "quiet" expects the
 * whole app to go quiet, so it is stored and read by every caller through here.
 */

export type SfxName = 'tap' | 'correct' | 'retry' | 'star' | 'swipe' | 'win';

const STORAGE_KEY = 'gujarati-kids-sound';

const VOLUME: Record<SfxName, number> = {
  tap: 0.22,
  swipe: 0.2,
  correct: 0.4,
  retry: 0.3,
  star: 0.4,
  win: 0.45,
};

let enabled = true;
let restored = false;
const cache = new Map<SfxName, HTMLAudioElement>();
const listeners = new Set<(on: boolean) => void>();

function restore(): void {
  if (restored || typeof window === 'undefined') return;
  restored = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'off') enabled = false;
  } catch {
    // Private mode: keep the default rather than throwing on first tap.
  }
}

export function isSfxEnabled(): boolean {
  restore();
  return enabled;
}

export function setSfxEnabled(on: boolean): void {
  restore();
  enabled = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    // Preference just won't survive the session.
  }
  for (const listener of listeners) listener(on);
}

/** Fire and forget — a missing or blocked sound must never break the tap. */
export function playSfx(name: SfxName): void {
  if (typeof window === 'undefined') return;
  restore();
  if (!enabled) return;
  try {
    let audio = cache.get(name);
    if (!audio) {
      audio = new Audio(`/audio/sfx-${name}.mp3`);
      audio.preload = 'auto';
      cache.set(name, audio);
    }
    audio.volume = VOLUME[name];
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Autoplay policy or a missing file: silence, not an error state.
    });
  } catch {
    // Never let a sound take a lesson down with it.
  }
}

export function useSfx() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    setOn(isSfxEnabled());
    const listener = (next: boolean) => setOn(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const toggle = useCallback(() => {
    setSfxEnabled(!isSfxEnabled());
  }, []);

  return { enabled: on, toggle, play: playSfx };
}
