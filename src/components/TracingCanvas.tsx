'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

interface Props {
  letter: string;
  onTraceComplete?: () => void;
}

/** Canvas takes real colour values — a CSS custom property here silently
 *  falls back to black, which is what used to happen. */
const TRACE_INK = '#1d3c6e';
const TRACE_WIDTH = 14;

export function TracingCanvas({ letter, onTraceComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setHasDrawn(false);
    setCelebrating(false);
  }, []);

  // Size the backing store to the device pixel ratio, or strokes come out soft.
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = container.clientWidth * dpr;
    canvas.height = container.clientHeight * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineWidth = TRACE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = TRACE_INK;
    }
    clearCanvas();
  }, [clearCanvas]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [letter, resizeCanvas]);

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setHasDrawn(true);
    const { x, y } = pointFrom(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // A tap alone should leave a dot.
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pointFrom(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
    canvasRef.current?.getContext('2d')?.beginPath();
  };

  return (
    <div
      className="rf-art-frame relative w-full touch-none"
      style={{ height: 260, borderWidth: 'var(--key-w)' }}
    >
      {/* Guide glyph underneath */}
      {/* The guide is a printed screen, not a tint: paper-sunk on paper was
          1.23:1 and simply could not be seen. */}
      <div
        className="rf-gujarati pointer-events-none absolute inset-0 flex select-none items-center justify-center"
        aria-hidden="true"
      >
        <span
          style={{
            fontSize: 180,
            lineHeight: 1,
            color: 'rgba(29, 60, 110, 0.18)',
            // 0.58 puts the outline at 3.3:1 — over the 3:1 non-text floor,
            // and still well under the child's own 10.7:1 stroke.
            WebkitTextStroke: '3px rgba(29, 60, 110, 0.58)',
          }}
        >
          {letter}
        </span>
      </div>

      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-full w-full"
          style={{ cursor: 'crosshair', touchAction: 'none' }}
          aria-label={`Tracing area for the letter ${letter}. Draw over the guide with a finger or mouse.`}
          role="application"
        />
      </div>

      {!hasDrawn && (
        <p
          className="pointer-events-none absolute flex items-center"
          style={{
            top: 'var(--s-3)',
            left: 'var(--s-3)',
            gap: 'var(--s-2)',
            padding: 'var(--s-1) var(--s-2)',
            borderRadius: 'var(--r-sm)',
            background: 'var(--paper)',
            border: 'var(--key-thin)',
            fontSize: 'var(--t-xs)',
            fontWeight: 700,
            color: 'var(--text-2)',
          }}
        >
          <Icon name="pencil" size={15} />
          Trace over the letter with your finger
        </p>
      )}

      {hasDrawn && !celebrating && (
        <div
          className="absolute flex"
          style={{ bottom: 'var(--s-3)', right: 'var(--s-3)', gap: 'var(--s-2)' }}
        >
          <button type="button" onClick={clearCanvas} className="rf-btn rf-btn--paper">
            <Icon name="refresh" size={16} />
            Start over
          </button>
          <button
            type="button"
            onClick={() => {
              setCelebrating(true);
              onTraceComplete?.();
            }}
            className="rf-btn rf-btn--primary"
          >
            <Icon name="check" size={16} strokeWidth={2.6} />
            Done
          </button>
        </div>
      )}

      {celebrating && (
        <div
          className="rf-rise absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: 'rgba(255, 253, 247, 0.9)', gap: 'var(--s-2)' }}
          role="status"
        >
          <span
            className="rf-pop inline-flex items-center justify-center rounded-full"
            style={{
              width: 64,
              height: 64,
              background: 'var(--ink-saffron)',
              color: 'var(--text-on-ink)',
              border: 'var(--key)',
            }}
          >
            <Icon name="star" size={32} />
          </span>
          <p style={{ fontSize: 'var(--t-lg)', fontWeight: 800, color: 'var(--ink-indigo)' }}>
            Nicely traced!
          </p>
          <button type="button" onClick={clearCanvas} className="rf-btn rf-btn--paper">
            <Icon name="refresh" size={16} />
            Trace it again
          </button>
        </div>
      )}
    </div>
  );
}
