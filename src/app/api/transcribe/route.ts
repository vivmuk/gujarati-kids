import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STT_MODEL = process.env.VENICE_STT_MODEL || 'openai/whisper-large-v3';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('file') as File | null;

    if (!audioBlob) return NextResponse.json({ error: 'No audio file' }, { status: 400 });

    const VENICE_API_KEY = process.env.VENICE_API_KEY;
    const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';

    const veniceForm = new FormData();
    veniceForm.append('file', audioBlob, audioBlob.name || 'audio.webm');
    veniceForm.append('model', STT_MODEL);
    veniceForm.append('response_format', 'json');
    veniceForm.append('language', 'gu');

    const res = await fetch(`${VENICE_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${VENICE_API_KEY}` },
      body: veniceForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `STT failed: ${res.status}`, details: errText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text || '' });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
