import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text, model, voice, speed, language } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 });

    const VENICE_API_KEY = process.env.VENICE_API_KEY;
    const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';

    // Auto-detect Gujarati text to set language hint for proper pronunciation
    const hasGujarati = /[\u0A80-\u0AFF]/.test(text);
    const langHint = language || (hasGujarati ? 'gu' : undefined);

    const body: Record<string, unknown> = {
      model: model || 'tts-xai-v1',
      voice: voice || 'eve',
      input: text,
      response_format: 'mp3',
      speed: speed || 0.9,
    };
    // xAI supports ISO 639-1 language hints — critical for Gujarati pronunciation
    if (langHint) body.language = langHint;

    const res = await fetch(`${VENICE_BASE_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `TTS failed: ${res.status}`, details: errText }, { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
  }
}
