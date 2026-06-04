#!/usr/bin/env tsx
/**
 * Parallel image pre-generator — splits work across N workers for ~Nx speedup.
 * Reads the data file the same way as pregenerate.cts but only does images.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STYLE + MODEL CONSTANTS — see docs/STYLE_GUIDE.md for details  ║
 * ║  Edit STYLE_PREFIX / IMAGE_MODEL below to re-skin the app.      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Usage (from project root):
 *   npx tsx scripts/pregen-images.cts 0 4 &   # worker 1 of 4
 *   npx tsx scripts/pregen-images.cts 1 4 &   # worker 2 of 4
 *   npx tsx scripts/pregen-images.cts 2 4 &
 *   npx tsx scripts/pregen-images.cts 3 4 &
 *   wait
 */
import * as fs from 'fs';
import * as path from 'path';

const VENICE_API_KEY = process.env.VENICE_API_KEY!;
const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';
const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const IMAGE_DIR = path.join(PUBLIC_DIR, 'images', 'gen');

// === STYLE & MODEL CONSTANTS (edit here to re-skin the app) ===
const IMAGE_MODEL = 'grok-imagine-image';
const IMAGE_ASPECT_RATIO = '1:1';
const IMAGE_FORMAT = 'webp';
const IMAGE_SAFE_MODE = true;

// Prepended to every image prompt — 1990s Indian school textbook style.
const STYLE_PREFIX =
  '1990s Indian school textbook illustration style, hand-drawn watercolor look, warm earthy tones, simple clean lines, flat perspective, educational diagram aesthetic, muted colors on off-white paper background:';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function loadData() {
  const srcPath = path.join(PROJECT_ROOT, 'src', 'data', 'gujarati.ts');
  const src = fs.readFileSync(srcPath, 'utf-8');
  function extractArray(name: string): string {
    const start = src.indexOf(`export const ${name}`);
    if (start < 0) return '[]';
    const eqIdx = src.indexOf('=', start);
    const openBracket = src.indexOf('[', eqIdx);
    if (openBracket < 0) return '[]';
    let depth = 0;
    for (let i = openBracket; i < src.length; i++) {
      const ch = src[i];
      if (ch === '[' || ch === '{') depth++;
      else if (ch === ']' || ch === '}') {
        depth--;
        if (depth === 0) return src.slice(openBracket, i + 1);
      }
    }
    return '[]';
  }
  // eslint-disable-next-line no-new-func
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

interface Job {
  slug: string;
  prompt: string;
}

function buildJobs(data: any, workerIndex: number, totalWorkers: number): Job[] {
  const jobs: Job[] = [];
  // Letters
  for (const letter of [...data.swar, ...data.vyanjan]) {
    jobs.push({
      slug: `letter-${letter.roman}`,
      prompt: `a ${letter.exampleEnglish} (for Gujarati letter ${letter.gujarati} = "${letter.roman}"), simple labeled educational illustration`,
    });
  }
  // Words
  for (const word of data.words) {
    jobs.push({
      slug: `word-${word.roman}`,
      prompt: `a ${word.english.toLowerCase()} (${word.gujarati}), labeled with both English and Gujarati text, educational vocabulary illustration`,
    });
  }
  // Phrases
  for (const phrase of data.phrases) {
    const slug = phrase.roman.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    jobs.push({
      slug: `phrase-${slug}`,
      prompt: `illustration of "${phrase.english}" concept, person saying "${phrase.gujarati}", labeled bilingual educational illustration`,
    });
  }
  // Stories
  for (const story of data.stories) {
    jobs.push({
      slug: `story-${story.id}`,
      prompt: `illustration for children's story "${story.titleEnglish}", Indian village scene, warm and inviting`,
    });
    for (let i = 0; i < story.lines.length; i++) {
      const line = story.lines[i];
      jobs.push({
        slug: `story-${story.id}-line${i}`,
        prompt: `illustration of: ${line.english}, Gujarati story scene, simple and clear for children`,
      });
    }
  }
  // Shard across workers
  return jobs.filter((_, idx) => idx % totalWorkers === workerIndex);
}

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
        console.error(`  [w${process.pid}] ${res.status} for "${prompt.slice(0, 40)}": ${(await res.text()).slice(0, 200)}`);
        if (attempt < retries - 1) await sleep(3000 * (attempt + 1));
        continue;
      }
      const data: any = await res.json();
      if (!data.images?.[0]) {
        if (attempt < retries - 1) await sleep(3000);
        continue;
      }
      const imgBuffer = Buffer.from(data.images[0], 'base64');
      try {
        const sharpMod: any = await import('sharp');
        const sharp = sharpMod.default || sharpMod;
        const webpBuffer = await sharp(imgBuffer).webp({ quality: 90 }).toBuffer();
        fs.writeFileSync(filePath, webpBuffer);
      } catch {
        fs.writeFileSync(filePath, imgBuffer);
      }
      console.log(`  ✓ [w${process.pid}] ${path.relative(PROJECT_ROOT, filePath)}`);
      return true;
    } catch (err) {
      console.error(`  [w${process.pid}] error for "${prompt.slice(0, 40)}":`, err);
      if (attempt < retries - 1) await sleep(3000 * (attempt + 1));
    }
  }
  return false;
}

async function run(workerIndex: number, totalWorkers: number) {
  const data = await loadData();
  const jobs = buildJobs(data, workerIndex, totalWorkers);
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  console.log(`[w${process.pid}] Worker ${workerIndex + 1}/${totalWorkers}: ${jobs.length} jobs`);
  let done = 0, skipped = 0;
  for (const job of jobs) {
    const filePath = path.join(IMAGE_DIR, `${job.slug}.webp`);
    if (fs.existsSync(filePath)) { skipped++; continue; }
    await generateImage(job.prompt, filePath);
    done++;
    await sleep(500); // light rate limit between calls
  }
  console.log(`[w${process.pid}] Done. ${done} generated, ${skipped} skipped.`);
}

const workerIndex = parseInt(process.argv[2] || '0', 10);
const totalWorkers = parseInt(process.argv[3] || '3', 10);
run(workerIndex, totalWorkers).catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
