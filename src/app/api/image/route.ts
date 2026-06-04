import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 1990s Indian school textbook style — applied to every generated image.
// See docs/STYLE_GUIDE.md for how to change this globally.
const STYLE_PREFIX =
  '1990s Indian school textbook illustration style, hand-drawn watercolor look, warm earthy tones, simple clean lines, flat perspective, educational diagram aesthetic, muted colors on off-white paper background:';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const VENICE_API_KEY = process.env.VENICE_API_KEY;
    const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';

    const res = await fetch(`${VENICE_BASE_URL}/image/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: `${STYLE_PREFIX} ${prompt}`,
        aspect_ratio: '1:1',
        format: 'webp',
        return_binary: false,
        safe_mode: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Image generation failed: ${res.status}`, details: errText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ images: data.images || [] });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
