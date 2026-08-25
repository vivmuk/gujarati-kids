'use client';

import { useEffect, useRef } from 'react';
import type { Balgeet } from '@/data/gujarati';
import { useSingAlong } from './useSingAlong';
import { Icon } from './Icon';
import { Overlay } from './ui';

interface Props {
  song: Balgeet;
  onClose: () => void;
}

export function SingAlong({ song, onClose }: Props) {
  const { activeLineIndex, isPlaying, start, stop } = useSingAlong();
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    start(song);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id]);

  // Keep the line being sung in view on a short phone screen.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeLineIndex]);

  const handleClose = () => {
    stop();
    onClose();
  };

  return (
    <Overlay onClose={handleClose} labelledBy="singalong-title">
      <div className="relative">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close sing along"
          className="rf-icon-btn absolute"
          style={{ top: -14, right: -8, zIndex: 2, width: 40, height: 40 }}
        >
          <Icon name="close" size={20} strokeWidth={2.4} />
        </button>

        <div
          className="rf-surface flex flex-col"
          style={{
            gap: 'var(--s-3)',
            padding: 'var(--s-5)',
            boxShadow: 'var(--lift-3) var(--ink-indigo), var(--shadow-float)',
          }}
        >
          <div className="flex flex-col items-center" style={{ gap: 'var(--s-1)' }}>
            <span
              className="inline-flex items-center justify-center rounded-full"
              style={{
                width: 46,
                height: 46,
                background: 'var(--ink-saffron)',
                color: 'var(--text-on-ink)',
                border: 'var(--key-thin)',
              }}
            >
              <Icon name="music" size={24} />
            </span>
            <p className="rf-label">Sing along</p>
            <h2
              id="singalong-title"
              className="rf-gujarati text-center"
              style={{ fontSize: 'var(--t-xl)', fontWeight: 700 }}
            >
              {song.titleGujarati}
            </h2>
          </div>

          <ol
            className="rf-stack"
            style={{ maxHeight: '46vh', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}
          >
            {song.lines.map((line, index) => {
              const isActive = activeLineIndex === index;
              return (
                <li
                  key={index}
                  ref={isActive ? activeRef : undefined}
                  aria-current={isActive ? 'true' : undefined}
                  style={{
                    padding: 'var(--s-3)',
                    borderRadius: 'var(--r-md)',
                    background: isActive ? 'var(--ink-saffron)' : 'var(--paper-sunk)',
                    color: isActive ? 'var(--text-on-ink)' : 'var(--text-1)',
                    border: isActive ? 'var(--key-thin)' : '2px solid transparent',
                    boxShadow: isActive ? 'var(--lift-1) var(--ink-key)' : 'none',
                    opacity: isActive || activeLineIndex === null ? 1 : 0.62,
                    transition: 'all var(--dur-2) var(--ease)',
                  }}
                >
                  <p className="rf-gujarati" style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>
                    {line.gujarati}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--t-xs)',
                      color: isActive ? 'var(--text-on-ink-2)' : 'var(--text-2)',
                    }}
                  >
                    {line.roman}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--t-xs)',
                      fontWeight: 600,
                      color: isActive ? 'var(--text-on-ink-2)' : 'var(--text-2)',
                    }}
                  >
                    {line.english}
                  </p>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={() => (isPlaying ? stop() : start(song))}
            className={`rf-btn rf-btn--block rf-btn--lg ${isPlaying ? 'rf-btn--paper' : 'rf-btn--primary'}`}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={18} />
            {isPlaying ? 'Stop' : 'Sing it again'}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
