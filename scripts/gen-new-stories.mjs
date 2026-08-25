/**
 * Generate images + audio for new stories only.
 * Reads story IDs from command line or uses a default list.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const API_KEY = process.env.VENICE_API_KEY;
if (!API_KEY) {
  console.error('VENICE_API_KEY is not set. Export it (or source .env.local) before running.');
  process.exit(1);
}
const BASE = 'https://api.venice.ai/api/v1';
const IMAGE_MODEL = 'grok-imagine-image-quality';
const TTS_MODEL = 'tts-xai-v1';
const TTS_VOICE = 'eve';
const TTS_SPEED = 0.9;

const STYLE_PREFIX = `Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents, garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook clarity, clean line art, soft paper texture, light cream or white background, centered composition with the full subject visible and generous padding, no cropping:`;

const ROOT = path.resolve('.');
const GEN_IMGS = path.join(ROOT, 'public', 'images', 'gen');
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');

// New story IDs
const NEW_STORY_IDS = [
  'tenali-brinjal',
  'tenali-cat-rice',
  'krishna-butter',
  'krishna-kalia',
  'tenali-fool-list',
  'deer-lion-rabbit',
  'mouse-lion-grateful',
  'cobra-mongoose',
  'frogs-rope-snake',
  'sparrow-grain',
  'old-lamp-new',
  'four-brahmins-lion',
];

// Parse stories from gujarati.ts
function parseStories() {
  const ts = readFileSync(path.join(ROOT, 'src/data/gujarati.ts'), 'utf-8');
  const stories = [];
  const blockRe = /\{\s*id:\s*'([^']+)'([\s\S]*?)(?=\n  \{|\n\];)/g;
  let m;
  while ((m = blockRe.exec(ts)) !== null) {
    const id = m[1];
    const body = m[2];
    if (!NEW_STORY_IDS.includes(id)) continue;
    
    const titleEn = (body.match(/titleEnglish:\s*'([^']+)'/) ?? [])[1] ?? '';
    const titleGu = (body.match(/titleGujarati:\s*'([^']+)'/) ?? [])[1] ?? '';
    const lineMatches = [...body.matchAll(/\{\s*gujarati:\s*'([^']+)'[^}]*roman:\s*'([^']*)'[^}]*english:\s*'([^']*)'[^}]*\}/g)];
    // Filter: lines have roman that ends with a period or exclamation, focus words don't
    const lines = lineMatches
      .map(lm => ({ gujarati: lm[1], roman: lm[2], english: lm[3] }))
      .filter(l => l.roman.endsWith('.') || l.roman.endsWith('!') || l.roman.endsWith('?') || l.roman.endsWith('"'));
    
    stories.push({ id, titleGujarati: titleGu, titleEnglish: titleEn, lines });
  }
  return stories;
}

async function generateImage(prompt, outPath) {
  const res = await fetch(`${BASE}/images/generations`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: STYLE_PREFIX + ' ' + prompt,
      n: 1,
      response_format: 'b64_json',
    }),
  });
  if (!res.ok) throw new Error(`Image gen failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image returned');
  writeFileSync(outPath, Buffer.from(b64, 'base64'));
}

async function generateTTS(text, outPath, lang = 'gu') {
  const res = await fetch(`${BASE}/audio/speech`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: TTS_MODEL,
      voice: TTS_VOICE,
      input: text,
      response_format: 'mp3',
      speed: TTS_SPEED,
      language: lang,
    }),
  });
  if (!res.ok) throw new Error(`TTS failed (${res.status}): ${await res.text()}`);
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function retryWithBackoff(fn, label, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await sleep(2000 * (attempt + 1)); // delay before each attempt
      return await fn();
    } catch (e) {
      const isRateLimit = e.message.includes('429');
      console.warn(`    ⚠ ${label} attempt ${attempt+1} failed: ${e.message.slice(0, 100)}`);
      if (isRateLimit && attempt < maxRetries - 1) {
        console.log(`    ⏳ Waiting 30s before retry...`);
        await sleep(30000);
      } else if (attempt === maxRetries - 1) {
        throw e;
      }
    }
  }
}

async function main() {
  mkdirSync(GEN_IMGS, { recursive: true });
  mkdirSync(AUDIO_DIR, { recursive: true });
  
  const stories = parseStories();
  console.log(`\nFound ${stories.length} new stories to generate assets for:\n`);
  stories.forEach(s => console.log(`  ${s.id} — ${s.titleEnglish} (${s.lines.length} lines)`));
  
  let imgCount = 0, audioCount = 0, errors = 0;
  
  for (const story of stories) {
    console.log(`\n━━━ ${story.titleEnglish} ━━━`);
    
    // Hero image
    const heroPath = path.join(GEN_IMGS, `story-${story.id}.webp`);
    if (!existsSync(heroPath)) {
      try {
        console.log(`  🎨 Hero image...`);
        await retryWithBackoff(() => generateImage(
          `wordless illustration for children's story "${story.titleEnglish}", Indian village scene, warm and inviting, no text, no letters, no labels, no captions, no speech bubbles`,
          heroPath
        ), `Hero image`);
        imgCount++;
      } catch (e) { console.warn(`  ⚠ Hero image failed: ${e.message}`); errors++; }
    } else {
      console.log(`  ✓ Hero image exists`);
    }

    // Title audio
    const titleAudioPath = path.join(AUDIO_DIR, `story-${story.id}-title.mp3`);
    if (!existsSync(titleAudioPath)) {
      try {
        console.log(`  🔊 Title audio...`);
        await retryWithBackoff(() => generateTTS(`${story.titleGujarati}. ${story.titleEnglish}.`, titleAudioPath, 'gu'), `Title audio`);
        audioCount++;
      } catch (e) { console.warn(`  ⚠ Title audio failed: ${e.message}`); errors++; }
    } else {
      console.log(`  ✓ Title audio exists`);
    }
    
    // Line images + audio
    for (let i = 0; i < story.lines.length; i++) {
      const line = story.lines[i];
      const lineImgPath = path.join(GEN_IMGS, `story-${story.id}-line${i}.webp`);
      const lineAudioPath = path.join(AUDIO_DIR, `story-${story.id}-line${i}.mp3`);
      
      if (!existsSync(lineImgPath)) {
        try {
          console.log(`  🎨 Line ${i+1}/${story.lines.length}: ${line.english.slice(0, 50)}...`);
          await retryWithBackoff(() => generateImage(
            `wordless illustration of: ${line.english}, Gujarati story scene, simple and clear for children, no text, no letters, no labels, no captions, no speech bubbles`,
            lineImgPath
          ), `Line ${i} image`);
          imgCount++;
        } catch (e) { console.warn(`  ⚠ Line ${i} image failed: ${e.message}`); errors++; }
      }

      if (!existsSync(lineAudioPath)) {
        try {
          await retryWithBackoff(() => generateTTS(line.gujarati, lineAudioPath, 'gu'), `Line ${i} audio`);
          audioCount++;
        } catch (e) { console.warn(`  ⚠ Line ${i} audio failed: ${e.message}`); errors++; }
      }
    }
  }
  
  console.log(`\n\n✅ Done! Generated ${imgCount} images, ${audioCount} audio files, ${errors} errors`);
}

main().catch(err => { console.error(err); process.exit(1); });
