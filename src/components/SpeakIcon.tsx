'use client';
export function SpeakIcon({ id, currentlyPlaying, ttsLoading, ttsProgress }: { id: string; currentlyPlaying: string | null; ttsLoading: boolean; ttsProgress?: number }) {
  if (ttsLoading && currentlyPlaying === id) {
    if (typeof ttsProgress === 'number') {
      return <span className="tabular-nums font-bold animate-pulse">{ttsProgress}%</span>;
    }
    return <span className="animate-pulse">⏳</span>;
  }
  if (currentlyPlaying === id) return <span>🔊</span>;
  return <span>🔈</span>;
}
