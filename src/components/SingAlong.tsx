'use client';
import { useEffect } from 'react';
import { type Balgeet } from '@/data/gujarati';
import { useSingAlong } from './useSingAlong';

interface Props {
  song: Balgeet;
  onClose: () => void;
}

export function SingAlong({ song, onClose }: Props) {
  const { activeLineIndex, isPlaying, start, stop } = useSingAlong();

  useEffect(() => {
    start(song);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id]);

  const handleClose = () => {
    stop();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="relative w-full max-w-sm">
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 bg-white shadow-md hover:bg-gray-100 transition-colors text-lg font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <div
          className="relative bg-white rounded-3xl shadow-2xl w-full p-5 flex flex-col gap-1"
          style={{ border: '2.5px solid var(--rf-indigo, #3B3596)', boxShadow: '6px 6px 0 var(--rf-indigo, #3B3596)' }}
        >
          <p className="text-center text-xs font-black uppercase tracking-[0.7px] text-gray-500">🎵 Sing Along</p>
          <p className="text-center font-bold text-lg mt-1" style={{ fontFamily: 'var(--font-gujarati)' }}>{song.titleGujarati}</p>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto mt-3">
            {song.lines.map((line, i) => {
              const isActive = activeLineIndex === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl p-3 transition-all ${isActive ? 'scale-[1.03]' : 'opacity-60'}`}
                  style={{
                    background: isActive ? 'var(--saffron-100)' : 'var(--rf-cream)',
                    border: isActive ? '2px solid var(--rf-saffron)' : '2px solid transparent',
                  }}
                >
                  <p className="font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{line.gujarati}</p>
                  <p className="text-xs text-gray-500">{line.roman}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-3">
            {isPlaying ? (
              <button
                onClick={stop}
                className="px-6 py-2.5 rounded-full font-bold text-white active:scale-95 transition-transform"
                style={{ background: 'var(--rf-ink)' }}
              >
                ⏸ Stop
              </button>
            ) : (
              <button
                onClick={() => start(song)}
                className="px-6 py-2.5 rounded-full font-bold text-white active:scale-95 transition-transform"
                style={{ background: 'var(--gradient-saffron)' }}
              >
                ▶ Sing Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
