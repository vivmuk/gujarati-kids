'use client';
export function SpeakIcon({ id, currentlyPlaying, ttsLoading }: { id: string; currentlyPlaying: string | null; ttsLoading: boolean }) {
  if (ttsLoading && currentlyPlaying === id) return <span className="animate-pulse">⏳</span>;
  if (currentlyPlaying === id) return <span>🔊</span>;
  return <span>🔈</span>;
}
