'use client';
import { useRef, useEffect, useState } from 'react';

interface Props {
  letter: string;
  onTraceComplete?: () => void;
}

export function TracingCanvas({ letter, onTraceComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setCelebrating(false);
    ctx.beginPath();
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      clearCanvas();
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [letter]); // redraw when letter changes

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath(); // Reset path for next stroke
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Get coordinates
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'var(--rf-indigo)'; // Riso-folk indigo ink

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const finishTracing = () => {
    setCelebrating(true);
    onTraceComplete?.();
  };

  return (
    <div className="relative w-full h-64 bg-white rounded-xl border-2 overflow-hidden touch-none" style={{ borderColor: 'var(--rf-ink)' }}>
      {/* Background guide letter */}
      <div 
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-20"
        style={{ fontFamily: 'var(--font-gujarati)' }}
      >
        <span className="text-[180px] leading-none text-gray-400">{letter}</span>
      </div>

      {/* Drawing canvas */}
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseMove={draw}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={endDrawing}
          onTouchMove={draw}
          className="w-full h-full cursor-crosshair"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        {hasDrawn && (
          <>
            <button
              onClick={clearCanvas}
              className="p-2 bg-white rounded-full shadow-md border-2 text-sm font-bold active:scale-95 transition-transform"
              style={{ borderColor: 'var(--rf-ink)' }}
            >
              🗑️ Clear
            </button>
            <button
              onClick={finishTracing}
              className="p-2 rounded-full shadow-md border-2 text-sm font-bold text-white active:scale-95 transition-transform"
              style={{ borderColor: 'var(--rf-ink)', background: 'var(--rf-saffron)' }}
            >
              ✍️ Done tracing!
            </button>
          </>
        )}
      </div>

      {/* Hint */}
      {!hasDrawn && (
        <div className="absolute top-3 left-3 text-sm font-bold text-gray-500 bg-white/80 px-2 py-1 rounded-lg">
          ✍️ Trace the letter
        </div>
      )}

      {/* Celebration */}
      {celebrating && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in"
          style={{ background: 'rgba(255,255,255,0.85)' }}
        >
          <div className="animate-scale-in text-center">
            <p className="text-5xl">🌟</p>
            <p className="mt-1 text-lg font-black" style={{ color: 'var(--rf-indigo)' }}>Great job!</p>
          </div>
        </div>
      )}
    </div>
  );
}
