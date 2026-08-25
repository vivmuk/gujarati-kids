#!/usr/bin/env tsx
/**
 * Fill the asset gaps.
 *
 * Unlike scripts/pregenerate.cts (which regex-parses the data file), this
 * imports src/data/gujarati.ts directly, so it stays correct as that file's
 * shape changes. It only ever writes files that are missing — rerunning it is
 * free and safe.
 *
 * Covers:
 *   - every letter / word / phrase / story slug with no file on disk
 *   - category cover images under public/images/<category>.webp
 *   - balgeet song titles and lines (audio) and song hero art
 *
 * See docs/STYLE_GUIDE.md. The style prefix here must stay identical to the
 * one in scripts/pregenerate.cts, scripts/pregen-images.cts,
 * src/app/api/image/route.ts, and src/lib/venice.ts.
 *
 * Usage:
 *   npx tsx scripts/generate-missing.mts            # everything missing
 *   npx tsx scripts/generate-missing.mts --audio    # audio gaps only
 *   npx tsx scripts/generate-missing.mts --images   # image gaps only
 *   npx tsx scripts/generate-missing.mts --dry      # report, generate nothing
 */

import fs from 'node:fs';
import path from 'node:path';
import { balgeet, categoryMeta, phrases, stories, swar, vyanjan, words } from '../src/data/gujarati';

const STYLE_PREFIX =
  'Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents, garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook clarity, clean line art, soft paper texture, light cream or white background, centered composition with the full subject visible and generous padding, no cropping:';

const IMAGE_MODEL = process.env.VENICE_IMAGE_MODEL || 'grok-imagine-image-quality';
const TTS_MODEL = 'tts-xai-v1';
const TTS_VOICE = 'eve';
const TTS_SPEED = 0.9;

const API_KEY = process.env.VENICE_API_KEY;
const BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');
const GEN_DIR = path.join(PUBLIC_DIR, 'images', 'gen');
const COVER_DIR = path.join(PUBLIC_DIR, 'images');

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry');
const ONLY_AUDIO = args.has('--audio');
const ONLY_IMAGES = args.has('--images');
const doAudio = !ONLY_IMAGES;
const doImages = !ONLY_AUDIO;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const phraseSlug = (roman: string) =>
  roman.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

type Job = { kind: 'audio' | 'image'; file: string; payload: string; label: string };

/* ------------------------------------------------------------------ Venice */

async function generateAudio(text: string, file: string, retries = 3): Promise<boolean> {
  const hasGujarati = /[઀-૿]/.test(text);
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/audio/speech`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: TTS_MODEL,
          voice: TTS_VOICE,
          input: text,
          response_format: 'mp3',
          speed: TTS_SPEED,
          ...(hasGujarati ? { language: 'gu' } : {}),
        }),
      });
      if (!res.ok) {
        console.error(`   audio ${res.status}: ${(await res.text()).slice(0, 160)}`);
        await sleep(1500 * (attempt + 1));
        continue;
      }
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      return true;
    } catch (error) {
      console.error(`   audio attempt ${attempt + 1} failed:`, error);
      await sleep(1500 * (attempt + 1));
    }
  }
  return false;
}

async function generateImage(prompt: string, file: string, retries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/image/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt: `${STYLE_PREFIX} ${prompt}`,
          aspect_ratio: '1:1',
          format: 'webp',
          return_binary: false,
          safe_mode: true,
        }),
      });
      if (!res.ok) {
        console.error(`   image ${res.status}: ${(await res.text()).slice(0, 160)}`);
        await sleep(2500 * (attempt + 1));
        continue;
      }
      const data = (await res.json()) as { images?: string[] };
      if (!data.images?.[0]) {
        await sleep(2500);
        continue;
      }
      const raw = Buffer.from(data.images[0], 'base64');
      // grok-imagine returns JPEG whatever the format field says.
      try {
        const { default: sharp } = await import('sharp');
        fs.writeFileSync(file, await sharp(raw).webp({ quality: 90 }).toBuffer());
      } catch {
        fs.writeFileSync(file, raw);
      }
      return true;
    } catch (error) {
      console.error(`   image attempt ${attempt + 1} failed:`, error);
      await sleep(2500 * (attempt + 1));
    }
  }
  return false;
}

/* -------------------------------------------------------------- Job build */

function buildJobs(): Job[] {
  const jobs: Job[] = [];
  const audio = (slug: string, text: string, label: string) => {
    const file = path.join(AUDIO_DIR, `${slug}.mp3`);
    if (doAudio && !fs.existsSync(file)) jobs.push({ kind: 'audio', file, payload: text, label });
  };
  const image = (slug: string, prompt: string, label: string) => {
    const file = path.join(GEN_DIR, `${slug}.webp`);
    if (doImages && !fs.existsSync(file)) jobs.push({ kind: 'image', file, payload: prompt, label });
  };

  // Letters
  for (const letter of [...swar, ...vyanjan]) {
    audio(`letter-${letter.roman}`, letter.gujarati, `letter ${letter.gujarati}`);
    image(
      `letter-${letter.roman}`,
      `a ${letter.exampleEnglish} (for Gujarati letter ${letter.gujarati} = "${letter.roman}"), simple labeled educational illustration`,
      `letter ${letter.gujarati}`
    );
  }

  // Words (numbers included — they are part of `words` now)
  for (const word of words) {
    audio(`word-${word.roman}`, word.gujarati, `word ${word.english}`);
    image(
      `word-${word.roman}`,
      `a ${word.english.toLowerCase()} (${word.gujarati}), labeled with both English and Gujarati text, educational vocabulary illustration`,
      `word ${word.english}`
    );
  }

  // Phrases
  for (const phrase of phrases) {
    const slug = phraseSlug(phrase.roman);
    audio(`phrase-${slug}`, phrase.gujarati, `phrase ${phrase.english}`);
    image(
      `phrase-${slug}`,
      `illustration of "${phrase.english}" concept, person saying "${phrase.gujarati}", labeled bilingual educational illustration`,
      `phrase ${phrase.english}`
    );
  }

  // Stories
  for (const story of stories) {
    audio(`story-${story.id}-title`, story.titleGujarati, `story ${story.titleEnglish}`);
    image(
      `story-${story.id}`,
      `wordless illustration for children's story "${story.titleEnglish}", Indian village scene, warm and inviting, no text, no letters, no labels, no captions, no speech bubbles`,
      `story ${story.titleEnglish}`
    );
    story.lines.forEach((line, i) => {
      audio(`story-${story.id}-line${i}`, line.gujarati, `${story.titleEnglish} line ${i + 1}`);
      image(
        `story-${story.id}-line${i}`,
        `wordless illustration of: ${line.english}, Gujarati story scene, simple and clear for children, no text, no letters, no labels, no captions, no speech bubbles`,
        `${story.titleEnglish} line ${i + 1}`
      );
    });
  }

  // Balgeet — previously had no assets at all and fell back to live TTS.
  for (const song of balgeet) {
    audio(`balgeet-${song.id}-title`, song.titleGujarati, `song ${song.titleEnglish}`);
    image(
      `balgeet-${song.id}`,
      `wordless illustration for the Gujarati children's song "${song.titleEnglish}", playful and musical, Indian folk scene, no text, no letters, no labels, no captions`,
      `song ${song.titleEnglish}`
    );
    song.lines.forEach((line, i) => {
      audio(`balgeet-${song.id}-line${i}`, line.gujarati, `${song.titleEnglish} line ${i + 1}`);
    });
  }

  // Category covers live outside /gen because they are hand-placed hero art.
  const categoriesInUse = new Set<string>([
    ...words.map(word => word.category),
    ...phrases.map(phrase => phrase.category),
  ]);
  for (const category of categoriesInUse) {
    const file = path.join(COVER_DIR, `${category}.webp`);
    if (!doImages || fs.existsSync(file)) continue;
    const meta = categoryMeta[category];
    jobs.push({
      kind: 'image',
      file,
      payload: `a bold emblem for the theme "${meta?.label ?? category}" (${meta?.gujarati ?? ''}), single clear central subject, decorative Ajrakh border, educational category cover`,
      label: `category cover ${category}`,
    });
  }

  return jobs;
}

/* ------------------------------------------------------------------- Main */

async function main() {
  for (const dir of [AUDIO_DIR, GEN_DIR, COVER_DIR]) fs.mkdirSync(dir, { recursive: true });

  const jobs = buildJobs();
  const audioJobs = jobs.filter(job => job.kind === 'audio');
  const imageJobs = jobs.filter(job => job.kind === 'image');

  console.log(`Missing audio: ${audioJobs.length}`);
  console.log(`Missing images: ${imageJobs.length}`);
  for (const job of jobs) console.log(`  [${job.kind}] ${path.basename(job.file)} — ${job.label}`);

  if (DRY) {
    console.log('\n--dry: nothing generated.');
    return;
  }
  if (jobs.length === 0) {
    console.log('\nNothing to do — every expected asset already exists.');
    return;
  }
  if (!API_KEY) {
    console.error('\nVENICE_API_KEY is not set. Aborting before any network call.');
    process.exit(1);
  }

  let ok = 0;
  let failed = 0;
  for (const [index, job] of jobs.entries()) {
    process.stdout.write(`[${index + 1}/${jobs.length}] ${job.kind} ${path.basename(job.file)} … `);
    const success =
      job.kind === 'audio'
        ? await generateAudio(job.payload, job.file)
        : await generateImage(job.payload, job.file);
    if (success) {
      ok++;
      console.log('ok');
    } else {
      failed++;
      console.log('FAILED');
    }
    await sleep(220);
  }

  console.log(`\nDone. ${ok} written, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

void main();
