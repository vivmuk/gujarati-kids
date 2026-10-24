#!/usr/bin/env tsx
/**
 * Fill the gaps that only Venice can fill: narration for story morals, music
 * beds for the films and nursery rhymes, UI sound effects, and section art.
 *
 * Everything is resumable — a file that already exists is never re-bought.
 *
 * Usage:
 *   npx tsx scripts/venice-fill.mts tts [--force]
 *   npx tsx scripts/venice-fill.mts music
 *   npx tsx scripts/venice-fill.mts sfx
 *   npx tsx scripts/venice-fill.mts image
 *   npx tsx scripts/venice-fill.mts all
 */

import fs from 'node:fs';
import path from 'node:path';
import { balgeet, stories } from '../src/data/gujarati';

const API_KEY = process.env.VENICE_API_KEY;
const BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';
const ROOT = process.cwd();
const AUDIO = path.join(ROOT, 'public', 'audio');
const IMAGES = path.join(ROOT, 'public', 'images');

if (!API_KEY) {
  console.error('VENICE_API_KEY missing (check .env.local)');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const FORCE = process.argv.includes('--force');
const phase = (process.argv[2] || 'all').toLowerCase();

async function post(endpoint: string, body: unknown, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const balance = res.headers.get('x-venice-balance-usd');
      if (balance) process.stdout.write(`   [balance $${balance}]\n`);
      return res;
    } catch (error) {
      lastError = error;
      await sleep(1200 * attempt);
    }
  }
  throw lastError;
}

/* ------------------------------------------------------------------- TTS */

async function speak(text: string, file: string): Promise<boolean> {
  if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 1024) return false;
  const res = await post('/audio/speech', {
    model: 'tts-xai-v1',
    voice: 'eve',
    input: text,
    response_format: 'mp3',
    speed: 0.82,
    ...(/[઀-૿]/.test(text) ? { language: 'gu' } : {}),
  });
  if (!res.ok) {
    console.error(`  ✗ tts ${res.status}: ${(await res.text()).slice(0, 160)}`);
    return false;
  }
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function tts() {
  fs.mkdirSync(AUDIO, { recursive: true });
  const wanted: Array<{ file: string; text: string; label: string }> = [];
  for (const story of stories) {
    if (!story.moralGujarati) continue;
    wanted.push({
      file: path.join(AUDIO, `story-${story.id}-moral.mp3`),
      text: `${story.moralGujarati}. ${story.moralEnglish ?? ''}`.trim(),
      label: `${story.id} moral`,
    });
  }
  // Music bed for the story films — a real track beats silence between lines.
  console.log(`tts: ${wanted.length} moral lines`);
  let made = 0;
  for (const [i, item] of wanted.entries()) {
    const ok = await speak(item.text, item.file);
    if (ok) made++;
    console.log(`  [${i + 1}/${wanted.length}] ${ok ? '✓' : '·'} ${item.label}`);
  }
  console.log(`tts: ${made} new file(s)`);
}

/* ----------------------------------------------------------------- Music */

type MusicJob = {
  file: string;
  prompt: string;
  seconds: number;
  model?: string;
};

async function generateMusic(job: MusicJob): Promise<boolean> {
  if (!FORCE && fs.existsSync(job.file) && fs.statSync(job.file).size > 4096) return false;
  const model = job.model ?? 'sonilo-v1-1-music';
  const quote = await post('/audio/quote', { model, duration_seconds: job.seconds });
  if (!quote.ok) {
    console.error(`  ✗ quote ${quote.status}: ${(await quote.text()).slice(0, 160)}`);
    return false;
  }
  const { quote: usd } = (await quote.json()) as { quote: number };

  const queue = await post('/audio/queue', {
    model,
    prompt: job.prompt,
    duration_seconds: job.seconds,
  });
  if (queue.status === 402) throw new Error('out of credit');
  if (!queue.ok) {
    console.error(`  ✗ queue ${queue.status}: ${(await queue.text()).slice(0, 200)}`);
    return false;
  }
  const { queue_id } = (await queue.json()) as { queue_id: string };
  console.log(`   queued $${usd} · ${queue_id}`);

  const started = Date.now();
  while (Date.now() - started < 600_000) {
    await sleep(4000);
    const res = await post('/audio/retrieve', { model, queue_id, delete_media_on_completion: true });
    if (!res.ok) {
      if (res.status === 404) throw new Error('retrieve 404 — job expired');
      await sleep(2000);
      continue;
    }
    if (!(res.headers.get('content-type') ?? '').includes('json')) {
      fs.writeFileSync(job.file, Buffer.from(await res.arrayBuffer()));
      return true;
    }
    const status = (await res.json()) as { status?: string };
    if (status.status && !['PROCESSING', 'QUEUED', 'RUNNING'].includes(status.status)) {
      throw new Error(`generation ${status.status}`);
    }
  }
  throw new Error('timed out');
}

async function music() {
  fs.mkdirSync(AUDIO, { recursive: true });

  const jobs: MusicJob[] = [
    {
      file: path.join(AUDIO, 'bed-story.mp3'),
      seconds: 180,
      prompt:
        'Instrumental Gujarati folk lullaby bed for a childrens storybook. Soft tanpura drone, ' +
        'slow bansuri flute melody, occasional gentle manjira shimmer, warm and unhurried, ' +
        'no vocals, no drums, no big dynamic swells, sits under narration. Traditional Indian village evening.',
    },
  ];

  // One cheerful backing bed per nursery rhyme, matched to that rhyme's mood.
  const moods: Record<string, string> = {
    'aav-re-varsad': 'rainy day, soft falling-water shimmer, playful and gentle',
    'adko-dadko': 'bouncy skipping game, clapping rhythm, bright and cheeky',
    'chakki-ben': 'grinding wheel rhythm, steady hand-drum pulse, warm and funny',
    'chando-suraj': 'night to morning, twinkling bells, dreamy and calm',
    'ek-bilaadi': 'sneaky cat tiptoe, plucked strings, comic and light',
    'hathi-bhai': 'heavy elephant walk, deep drum, joyful and lumbering',
    'mama-nu-ghar': 'walking to a relatives house, cheerful travel rhythm',
    'tali-pado': 'clapping game, fast hand percussion, bright and giggly',
    'varta-re-varta': 'storytime hush, soft drone and flute, inviting',
  };

  for (const song of balgeet) {
    jobs.push({
      file: path.join(AUDIO, `balgeet-${song.id}-bed.mp3`),
      seconds: 90,
      prompt:
        `Instrumental Gujarati childrens nursery-rhyme backing track: ${moods[song.id] ?? 'playful folk'}. ` +
        'Dhol and manjira folk percussion, harmonium and bansuri, simple repeating 8-bar loop, ' +
        'bright but not loud, no vocals, leave room for a child singing on top.',
    });
  }

  console.log(`music: ${jobs.length} tracks`);
  for (const [i, job] of jobs.entries()) {
    console.log(`  [${i + 1}/${jobs.length}] ${path.basename(job.file)}`);
    try {
      const ok = await generateMusic(job);
      console.log(ok ? '   ✓ done' : '   · already present');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`   ✗ ${message}`);
      if (message.includes('out of credit')) return;
    }
  }
}

/* ------------------------------------------------------------------- SFX */

async function sfx() {
  fs.mkdirSync(AUDIO, { recursive: true });
  const jobs: Array<{ file: string; prompt: string; seconds: number }> = [
    { file: 'sfx-tap.mp3', seconds: 1, prompt: 'Single soft wooden marimba note, short, dry, friendly tap for a kids app button.' },
    { file: 'sfx-correct.mp3', seconds: 2, prompt: 'Bright ascending three-note marimba chime, warm and playful, happy success sound.' },
    { file: 'sfx-retry.mp3', seconds: 2, prompt: 'Gentle descending two-note soft bell, kind and encouraging, never harsh or buzzy.' },
    { file: 'sfx-star.mp3', seconds: 2, prompt: 'Sparkling glockenspiel shimmer with tiny bell twinkles, magical reward sparkle.' },
    { file: 'sfx-swipe.mp3', seconds: 1, prompt: 'Soft paper page turn, close and intimate, very short.' },
    { file: 'sfx-win.mp3', seconds: 4, prompt: 'Small celebratory tabla and manjira flourish with a warm chime, joyful but gentle for children.' },
  ];
  console.log(`sfx: ${jobs.length} sounds`);
  for (const [i, job] of jobs.entries()) {
    const file = path.join(AUDIO, job.file);
    if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 1024) {
      console.log(`  [${i + 1}/${jobs.length}] · ${job.file} present`);
      continue;
    }
    console.log(`  [${i + 1}/${jobs.length}] ${job.file}`);
    try {
      await generateMusic({ file, prompt: job.prompt, seconds: job.seconds, model: 'elevenlabs-sound-effects-v2' });
      console.log('   ✓');
    } catch (error) {
      console.error(`   ✗ ${error instanceof Error ? error.message : error}`);
    }
  }
}

/* ----------------------------------------------------------------- Image */

const STYLE =
  'Two-colour risograph Gujarati folk illustration, saffron orange and indigo ink on cream paper, ' +
  'visible paper fibre grain, flat offset second-pass shadows, halftone textures, Ajrakh block-print ' +
  'border, hand-drawn 1990s Indian childrens book clarity, warm and simple, generous negative space, ' +
  'no text, no letters, no watermark.';

async function image() {
  fs.mkdirSync(path.join(IMAGES, 'gen'), { recursive: true });
  const jobs: Array<{ file: string; prompt: string }> = [
    {
      file: 'listen-find-hero.webp',
      prompt:
        `${STYLE} A small child with cupped hand to one ear, eyes closed and smiling, listening to a ` +
        'friendly parrot perched on a branch beside them, sound ripples drawn as concentric arcs. ' +
        'Square composition, the child low and centred.',
    },
    {
      file: 'game-ear.webp',
      prompt: `${STYLE} A single large stylised ear made of folk block-print patterns, with three small ` +
        'concentric sound arcs radiating from it, on a plain cream field.',
    },
  ];
  for (const [i, job] of jobs.entries()) {
    const file = path.join(IMAGES, 'gen', job.file);
    if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 2048) {
      console.log(`  [${i + 1}/${jobs.length}] · ${job.file} present`);
      continue;
    }
    console.log(`  [${i + 1}/${jobs.length}] ${job.file}`);
    const res = await post('/image/generate', {
      model: 'grok-imagine-image-quality',
      prompt: job.prompt,
      aspect_ratio: '1:1',
      resolution: '1K',
      safe_mode: true,
      format: 'webp',
      return_binary: true,
    });
    if (!res.ok) {
      console.error(`   ✗ ${res.status}: ${(await res.text()).slice(0, 200)}`);
      continue;
    }
    if (res.headers.get('x-venice-is-content-violation') === 'true') {
      console.error('   ✗ content violation');
      continue;
    }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log('   ✓');
  }
}

async function main() {
  if (phase === 'tts' || phase === 'all') await tts();
  if (phase === 'music' || phase === 'all') await music();
  if (phase === 'sfx' || phase === 'all') await sfx();
  if (phase === 'image' || phase === 'all') await image();
}

void main();
