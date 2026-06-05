#!/usr/bin/env tsx
/**
 * Pre-generate all TTS audio and images for the Gujarati Kids app.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STYLE + PROMPT TEMPLATES — see docs/STYLE_GUIDE.md for details  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * To change the visual style, edit STYLE_PREFIX below AND in:
 *   - scripts/pregen-images.cts
 *   - src/app/api/image/route.ts
 *   - src/app/api/chat/route.ts
 *
 * To change the TTS model/voice/language, edit generateAudio() below AND:
 *   - src/lib/venice.ts (veniceTTS defaults)
 *   - src/app/api/tts/route.ts
 *
 * Usage:
 *   VENICE_API_KEY=xxx npx tsx scripts/pregenerate.cts          # generate everything
 *   VENICE_API_KEY=xxx npx tsx scripts/pregenerate.cts --audio  # audio only
 *   VENICE_API_KEY=xxx npx tsx scripts/pregenerate.cts --images # images only
 *
 * Outputs:
 *   public/audio/<slug>.mp3        — TTS for every word, phrase, story line, and letter
 *   public/audio/manifest.json    — maps slugs to file paths
 *   public/images/gen/<slug>.webp  — AI-generated illustrations
 *   public/images/gen/manifest.json — maps slugs to file paths
 */

// === STYLE & MODEL CONSTANTS (edit here to re-skin the app) ===
const IMAGE_MODEL = process.env.VENICE_IMAGE_MODEL || 'grok-imagine-image-quality';
const IMAGE_ASPECT_RATIO = '1:1';
const IMAGE_FORMAT = 'webp';
const IMAGE_SAFE_MODE = true;

const TTS_MODEL = 'tts-xai-v1';
const TTS_VOICE = 'eve';
const TTS_SPEED = 0.9;
const TTS_LANG_GUJARATI = 'gu';
const TTS_LANG_LATIN = 'en';

// Prepended to every image prompt — Riso-Folk Gujarati folk style.
const STYLE_PREFIX =
  'Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents, garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook clarity, clean line art, soft paper texture, light cream or white background, centered composition with the full subject visible and generous padding, no cropping:';

import * as fs from 'fs';
import * as path from 'path';

const VENICE_API_KEY = process.env.VENICE_API_KEY!;
const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';
// The script is always run from the project root, so CWD is the project root
const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');
const IMAGE_DIR = path.join(PUBLIC_DIR, 'images', 'gen');

// Rate limiting helper
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// Slugify text for filenames
function slugify(text: string): string {
  return text
    .replace(/[\u0A80-\u0AFF]/g, '') // remove Gujarati chars from slug
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'item';
}

// ===== DATA (inline — mirrors src/data/gujarati.ts) =====
interface LetterItem { gujarati: string; roman: string; example: string; exampleEnglish: string; category: string; level: number; }
interface WordItem { gujarati: string; roman: string; english: string; category: string; level: number; }
interface PhraseItem { gujarati: string; roman: string; english: string; category: string; level: number; }
interface StoryItem { id: string; titleEnglish: string; lines: Array<{ gujarati: string; english: string }>; level: number; }

// We import the actual data at runtime. The compiled JS lives in .next/ when run via Next,
// so we read the TS source directly and extract the data arrays via regex — simpler and
// works in any Node mode. (Avoids ESM/CJS dynamic-import issues with .ts extensions.)
async function loadData() {
  const srcPath = path.join(PROJECT_ROOT, 'src', 'data', 'gujarati.ts');
  const src = fs.readFileSync(srcPath, 'utf-8');

  // Find each `export const NAME: Type[] = [ ... ];` block. Use a balanced-bracket walker
  // to find the matching `]`. Each data array is its own const.
  function extractArray(name: string): string {
    const start = src.indexOf(`export const ${name}`);
    if (start < 0) return '[]';
    // Skip past `=` to the first `[`
    const eqIdx = src.indexOf('=', start);
    const openBracket = src.indexOf('[', eqIdx);
    if (openBracket < 0) return '[]';
    // Walk forward, tracking depth for [ and { (objects inside arrays)
    let depth = 0;
    let i = openBracket;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (ch === '[' || ch === '{') depth++;
      else if (ch === ']' || ch === '}') {
        depth--;
        if (depth === 0) {
          // Include the closing bracket
          return src.slice(openBracket, i + 1);
        }
      }
    }
    return '[]';
  }

  // Evaluate the extracted arrays in an isolated scope
  const fn = new Function(`
    const swar = ${extractArray('swar')};
    const vyanjan = ${extractArray('vyanjan')};
    const words = ${extractArray('words')};
    const phrases = ${extractArray('phrases')};
    const stories = ${extractArray('stories')};
    return { swar, vyanjan, words, phrases, stories };
  `);
  return fn();
}

// ===== AUDIO GENERATION =====
async function generateAudio(text: string, filePath: string, retries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const hasGujarati = /[\u0A80-\u0AFF]/.test(text);
      const body: Record<string, unknown> = {
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: text,
        response_format: 'mp3',
        speed: TTS_SPEED,
      };
      if (hasGujarati) body.language = TTS_LANG_GUJARATI;

      const res = await fetch(`${VENICE_BASE_URL}/audio/speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VENICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error(`  Audio error ${res.status} for "${text}": ${await res.text()}`);
        if (attempt < retries - 1) await sleep(2000 * (attempt + 1));
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      console.log(`  ✓ Audio: ${path.relative(PROJECT_ROOT, filePath)} (${buffer.length} bytes)`);
      return true;
    } catch (err) {
      console.error(`  Audio attempt ${attempt + 1} failed for "${text}":`, err);
      if (attempt < retries - 1) await sleep(2000 * (attempt + 1));
    }
  }
  return false;
}

// ===== IMAGE GENERATION =====
async function generateImage(prompt: string, filePath: string, retries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${VENICE_BASE_URL}/image/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VENICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt: `${STYLE_PREFIX} ${prompt}`,
          aspect_ratio: IMAGE_ASPECT_RATIO,
          format: IMAGE_FORMAT,
          return_binary: false,
          safe_mode: IMAGE_SAFE_MODE,
        }),
      });

      if (!res.ok) {
        console.error(`  Image error ${res.status} for "${prompt}": ${await res.text()}`);
        if (attempt < retries - 1) await sleep(3000 * (attempt + 1));
        continue;
      }

      const data = await res.json() as { images?: string[] };
      if (!data.images?.[0]) {
        console.error(`  No image returned for "${prompt}"`);
        if (attempt < retries - 1) await sleep(3000);
        continue;
      }

      // grok-imagine returns JPEG regardless of format param, so convert with sharp if available
      const base64 = data.images[0];
      const imgBuffer = Buffer.from(base64, 'base64');

      // Try to convert JPEG -> WebP with sharp
      try {
        const { default: sharp } = await import('sharp');
        const webpBuffer = await sharp(imgBuffer).webp({ quality: 90 }).toBuffer();
        fs.writeFileSync(filePath, webpBuffer);
        console.log(`  ✓ Image: ${path.relative(PROJECT_ROOT, filePath)} (${webpBuffer.length} bytes, converted to webp)`);
      } catch {
        // No sharp available, save as-is (will be JPEG even with .webp extension)
        fs.writeFileSync(filePath, imgBuffer);
        console.log(`  ✓ Image: ${path.relative(PROJECT_ROOT, filePath)} (${imgBuffer.length} bytes, saved as-is)`);
      }
      return true;
    } catch (err) {
      console.error(`  Image attempt ${attempt + 1} failed for "${prompt}":`, err);
      if (attempt < retries - 1) await sleep(3000 * (attempt + 1));
    }
  }
  return false;
}

// ===== MAIN =====
async function main() {
  const args = process.argv.slice(2);
  const doAudio = args.length === 0 || args.includes('--audio');
  const doImages = args.length === 0 || args.includes('--images');

  if (!VENICE_API_KEY) {
    console.error('Error: VENICE_API_KEY environment variable is required');
    process.exit(1);
  }

  // Create output directories
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  fs.mkdirSync(IMAGE_DIR, { recursive: true });

  const data = await loadData();
  const audioManifest: Record<string, string> = {};
  const imageManifest: Record<string, string> = {};

  // ===== AUDIO PRE-GENERATION =====
  if (doAudio) {
    console.log('\n🎙️ Generating audio files...\n');

    // Letters (swar + vyanjan) — pronounce the letter and its example
    for (const letter of [...data.swar, ...data.vyanjan]) {
      const slug = `letter-${letter.roman}`;
      const filePath = path.join(AUDIO_DIR, `${slug}.mp3`);
      audioManifest[slug] = `/audio/${slug}.mp3`;

      if (fs.existsSync(filePath)) {
        console.log(`  ⏩ Skip existing: ${slug}`);
        continue;
      }
      // For letters, speak: "અ, અનાર" (letter then example word)
      const text = `${letter.gujarati}, ${letter.example}`;
      await generateAudio(text, filePath);
      await sleep(500);
    }

    // Words
    for (const word of data.words) {
      const slug = `word-${word.roman}`;
      const filePath = path.join(AUDIO_DIR, `${slug}.mp3`);
      audioManifest[slug] = `/audio/${slug}.mp3`;

      if (fs.existsSync(filePath)) {
        console.log(`  ⏩ Skip existing: ${slug}`);
        continue;
      }
      await generateAudio(word.gujarati, filePath);
      await sleep(500);
    }

    // Phrases
    for (const phrase of data.phrases) {
      const slug = `phrase-${phrase.roman.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
      const filePath = path.join(AUDIO_DIR, `${slug}.mp3`);
      audioManifest[slug] = `/audio/${slug}.mp3`;

      if (fs.existsSync(filePath)) {
        console.log(`  ⏩ Skip existing: ${slug}`);
        continue;
      }
      await generateAudio(phrase.gujarati, filePath);
      await sleep(500);
    }

    // Story lines
    for (const story of data.stories) {
      for (let i = 0; i < story.lines.length; i++) {
        const line = story.lines[i];
        const slug = `story-${story.id}-line${i}`;
        const filePath = path.join(AUDIO_DIR, `${slug}.mp3`);
        audioManifest[slug] = `/audio/${slug}.mp3`;

        if (fs.existsSync(filePath)) {
          console.log(`  ⏩ Skip existing: ${slug}`);
          continue;
        }
        await generateAudio(line.gujarati, filePath);
        await sleep(500);
      }
      // Story title
      const titleSlug = `story-${story.id}-title`;
      const titlePath = path.join(AUDIO_DIR, `${titleSlug}.mp3`);
      audioManifest[titleSlug] = `/audio/${titleSlug}.mp3`;
      if (!fs.existsSync(titlePath)) {
        await generateAudio(story.titleEnglish, titlePath);
        await sleep(500);
      }
    }

    // Write audio manifest
    fs.writeFileSync(path.join(AUDIO_DIR, 'manifest.json'), JSON.stringify(audioManifest, null, 2));
    console.log(`\n✅ Audio manifest: ${Object.keys(audioManifest).length} files`);
  }

  // ===== IMAGE PRE-GENERATION =====
  if (doImages) {
    console.log('\n🎨 Generating image files...\n');

    // Letters — illustrate the example word
    for (const letter of [...data.swar, ...data.vyanjan]) {
      const slug = `letter-${letter.roman}`;
      const filePath = path.join(IMAGE_DIR, `${slug}.webp`);
      imageManifest[slug] = `/images/gen/${slug}.webp`;

      if (fs.existsSync(filePath)) {
        console.log(`  ⏩ Skip existing: ${slug}`);
        continue;
      }
      const prompt = `a ${letter.exampleEnglish} (for Gujarati letter ${letter.gujarati} = "${letter.roman}"), simple labeled educational illustration`;
      await generateImage(prompt, filePath);
      await sleep(1500);
    }

    // Words — one image per word
    for (const word of data.words) {
      const slug = `word-${word.roman}`;
      const filePath = path.join(IMAGE_DIR, `${slug}.webp`);
      imageManifest[slug] = `/images/gen/${slug}.webp`;

      if (fs.existsSync(filePath)) {
        console.log(`  ⏩ Skip existing: ${slug}`);
        continue;
      }
      const prompt = `a ${word.english.toLowerCase()} (${word.gujarati}), labeled with both English and Gujarati text, educational vocabulary illustration`;
      await generateImage(prompt, filePath);
      await sleep(1500);
    }

    // Phrases — illustrate the concept
    for (const phrase of data.phrases) {
      const slug = `phrase-${phrase.roman.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
      const filePath = path.join(IMAGE_DIR, `${slug}.webp`);
      imageManifest[slug] = `/images/gen/${slug}.webp`;

      if (fs.existsSync(filePath)) {
        console.log(`  ⏩ Skip existing: ${slug}`);
        continue;
      }
      const prompt = `illustration of "${phrase.english}" concept, person saying "${phrase.gujarati}", labeled bilingual educational illustration`;
      await generateImage(prompt, filePath);
      await sleep(1500);
    }

    // Stories — one scene per story
    for (const story of data.stories) {
      const slug = `story-${story.id}`;
      const filePath = path.join(IMAGE_DIR, `${slug}.webp`);
      imageManifest[slug] = `/images/gen/${slug}.webp`;

      if (fs.existsSync(filePath)) {
        console.log(`  ⏩ Skip existing: ${slug}`);
        continue;
      }
      const prompt = `illustration for children's story "${story.titleEnglish}", Indian village scene, warm and inviting`;
      await generateImage(prompt, filePath);
      await sleep(1500);

      // Also generate per-line images
      for (let i = 0; i < story.lines.length; i++) {
        const line = story.lines[i];
        const lineSlug = `story-${story.id}-line${i}`;
        const linePath = path.join(IMAGE_DIR, `${lineSlug}.webp`);
        imageManifest[lineSlug] = `/images/gen/${lineSlug}.webp`;

        if (fs.existsSync(linePath)) {
          console.log(`  ⏩ Skip existing: ${lineSlug}`);
          continue;
        }
        const linePrompt = `illustration of: ${line.english}, Gujarati story scene, simple and clear for children`;
        await generateImage(linePrompt, linePath);
        await sleep(1500);
      }
    }

    // Write image manifest
    fs.writeFileSync(path.join(IMAGE_DIR, 'manifest.json'), JSON.stringify(imageManifest, null, 2));
    console.log(`\n✅ Image manifest: ${Object.keys(imageManifest).length} files`);
  }

  console.log('\n🎉 Pre-generation complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
