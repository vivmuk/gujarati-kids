'use client';
import { useState, useEffect, useCallback } from 'react';
import { getWordImage } from '@/data/assets';

export function useWordImage(roman: string, englishLabel: string, autoGenerate = false) {
  const cacheKey = `word-img-${roman}`;
  const staticPath = getWordImage(roman);

  const [src, setSrc] = useState<string | null>(() => {
    if (typeof window === 'undefined') return staticPath || null;
    return sessionStorage.getItem(cacheKey) || staticPath || null;
  });
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const nextSrc = sessionStorage.getItem(cacheKey) || staticPath || null;
    const timer = window.setTimeout(() => {
      setSrc(current => (current === nextSrc ? current : nextSrc));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cacheKey, staticPath]);

  const generate = useCallback(async () => {
    if (loading || tried) return;
    setTried(true);
    setLoading(true);
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${englishLabel} — a colorful Gujarati folk illustration for children` }),
      });
      if (res.ok) {
        const data = await res.json();
        const imgData = data.images?.[0];
        if (imgData) {
          const url = imgData.startsWith('data:') ? imgData : `data:image/webp;base64,${imgData}`;
          setSrc(url);
          try { sessionStorage.setItem(cacheKey, url); } catch {}
        }
      }
    } catch {}
    setLoading(false);
  }, [cacheKey, englishLabel, loading, tried]);

  // Auto-generate if no static image and autoGenerate=true
  useEffect(() => {
    if (autoGenerate && !staticPath && !tried && !loading) {
      const timer = window.setTimeout(() => void generate(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [autoGenerate, staticPath, tried, loading, generate]);

  const handleStaticError = useCallback(() => {
    setSrc(null);
    if (autoGenerate && !tried) generate();
  }, [autoGenerate, tried, generate]);

  return { src, loading, generate, handleStaticError };
}
