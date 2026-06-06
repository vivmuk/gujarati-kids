// Venice API client for Gujarati Kids app
const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';
const VENICE_API_KEY = process.env.VENICE_API_KEY;

export async function veniceChat(messages: Array<{role: string; content: string}>, options: Record<string, unknown> = {}) {
  const res = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VENICE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'openai-gpt-4o-mini-2024-07-18',
      messages,
      temperature: options.temperature || 0.7,
      max_completion_tokens: options.max_tokens || 2048,
      ...options,
    }),
  });
  if (!res.ok) throw new Error(`Venice chat error: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function veniceTTS(input: string, options: Record<string, unknown> = {}) {
  // Detect if input contains Gujarati characters to set language hint
  const hasGujarati = /[\u0A80-\u0AFF]/.test(input);
  const langHint = (options.language as string) || (hasGujarati ? 'gu' : 'en');

  const res = await fetch(`${VENICE_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VENICE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // xAI TTS is the canonical Gujarati voice on Venice —
      // gemini flash returns 500s on Indic language hints, kokoro sounds thin.
      model: options.model || 'tts-xai-v1',
      voice: options.voice || 'eve',
      input,
      response_format: 'mp3',
      speed: options.speed || 0.9,
      // ISO 639-1 language hint is critical for proper Gujarati pronunciation
      language: langHint,
      ...options,
    }),
  });
  if (!res.ok) throw new Error(`Venice TTS error: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}

export async function veniceTranscribe(audioBlob: Blob, options: Record<string, unknown> = {}) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', (options.model as string) || process.env.VENICE_STT_MODEL || 'openai/whisper-large-v3');
  formData.append('response_format', 'json');
  formData.append('language', 'gu');

  const res = await fetch(`${VENICE_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VENICE_API_KEY}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Venice STT error: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function veniceImageGenerate(prompt: string, options: Record<string, unknown> = {}) {
  // Riso-Folk style applied to every generated frame.
  const styledPrompt = `Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents, garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook clarity, clean line art, soft paper texture, light cream or white background, centered composition with the full subject visible and generous padding, no cropping: ${prompt}`;

  const res = await fetch(`${VENICE_BASE_URL}/image/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VENICE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Venice image model picked from the current model list.
      model: options.model || 'grok-imagine-image-quality',
      prompt: styledPrompt,
      aspect_ratio: options.aspect_ratio || '1:1',
      format: 'webp',
      return_binary: false,
      safe_mode: true,
      ...options,
    }),
  });
  if (!res.ok) throw new Error(`Venice image error: ${res.status} ${await res.text()}`);
  return res.json();
}
