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
      model: options.model || 'zai-org-glm-5-1',
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
  
  const res = await fetch(`${VENICE_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VENICE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'tts-xai-v1',
      voice: options.voice || 'ara',
      input,
      response_format: 'mp3',
      speed: options.speed || 0.85,
      // xAI supports ISO 639-1 language hints — critical for proper Gujarati pronunciation
      ...(hasGujarati ? { language: 'gu' } : {}),
      ...options,
    }),
  });
  if (!res.ok) throw new Error(`Venice TTS error: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}

export async function veniceTranscribe(audioBlob: Blob, options: Record<string, unknown> = {}) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', (options.model as string) || 'openai/whisper-large-v3');
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
  const res = await fetch(`${VENICE_BASE_URL}/image/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VENICE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'flux-2-max',
      prompt,
      width: options.width || 512,
      height: options.height || 512,
      format: 'webp',
      return_binary: true,
      safe_mode: true,
      ...options,
    }),
  });
  if (!res.ok) throw new Error(`Venice image error: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}
