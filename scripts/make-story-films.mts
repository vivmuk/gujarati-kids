#!/usr/bin/env tsx
/**
 * Build a complete narrated film for a story — not a four-second loop of the
 * cover art, which is all the old on-demand /api/video path ever produced.
 *
 * Structure per film:
 *
 *   TITLE     hero art, slow push in, Gujarati title read aloud
 *   PART 1..N one animated shot per story line, each held for as long as its
 *             Gujarati narration takes, plus a beat of silence to think in
 *   MORAL     the story's lesson, in Gujarati then English
 *   END       Guju's sign-off card
 *
 * Every shot is animated by Venice's Grok Imagine reference-to-video model
 * using that line's own pre-generated illustration as the reference, so the
 * characters, palette, and Riso-Folk style stay consistent shot to shot.
 *
 * Narration reuses the audio already on disk (public/audio/story-*.mp3). Only
 * the moral and sign-off lines are newly synthesised. Grok Imagine always
 * returns its own audio track and offers no way to turn it off, so every clip
 * is stripped to video-only and the Gujarati narration is laid over it.
 *
 * Every shot is a paid generation, so finished shots are cached under
 * .cache/story-shots/<story-id>/. Rerunning a story reuses them and only buys
 * what is missing; delete that folder to force a fresh take.
 *
 * Requires ffmpeg and ffprobe on PATH.
 *
 * Usage:
 *   npx tsx scripts/make-story-films.mts <story-id> [<story-id> ...]
 *   npx tsx scripts/make-story-films.mts --plan <story-id> ...   # no API calls
 *   npx tsx scripts/make-story-films.mts --force <story-id>      # rebuild
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { stories, type StoryItem } from '../src/data/gujarati';

const run = promisify(execFile);

/* ------------------------------------------------------------------ Config */

const VIDEO_MODEL = process.env.VENICE_FILM_MODEL || 'grok-imagine-1-5-reference-to-video-private';
const TTS_MODEL = 'tts-xai-v1';
const TTS_VOICE = 'eve';
const TTS_SPEED = 0.82;

const SHOT_SECONDS = 5;          // what we ask Grok Imagine for per line
const TITLE_SECONDS = 5;
const HOLD_AFTER_NARRATION = 1.1; // a beat to look at the picture
const OUT_W = 720;
const OUT_H = 720;               // 1:1, matching the square illustrations
const FPS = 25;

const POLL_MS = 6_000;
const MAX_POLL_MS = 300_000;

const API_KEY = process.env.VENICE_API_KEY;
const BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');
const GEN_DIR = path.join(ROOT, 'public', 'images', 'gen');
const VIDEO_DIR = path.join(ROOT, 'public', 'videos');
/** Every shot is a paid generation, so they are kept between runs. Delete a
 *  story's folder to force its shots to be re-bought. */
const SHOT_CACHE = path.join(ROOT, '.cache', 'story-shots');

const argv = process.argv.slice(2);
const PLAN_ONLY = argv.includes('--plan');
const FORCE = argv.includes('--force');
const storyIds = argv.filter(arg => !arg.startsWith('--'));

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Venice answers 402 when the account is out of credit. Nothing downstream
 *  can succeed after that, so it stops the whole run instead of burning
 *  through the remaining stories one failed request at a time. */
class OutOfCredit extends Error {
  constructor() {
    super('Venice account is out of credit — top up at https://venice.ai/settings/api');
    this.name = 'OutOfCredit';
  }
}

/* ---------------------------------------------------------------- Prompting
 * Every shot prompt carries the same style contract as docs/STYLE_GUIDE.md, so
 * the motion never drifts out of the Riso-Folk world the stills live in.
 */

const MOTION_STYLE =
  'Two-colour risograph Gujarati folk animation, saffron and indigo ink on cream paper, ' +
  'hand-drawn 1990s Indian storybook clarity, clean line art, soft paper grain. ' +
  'Gentle storybook motion only: a slow camera drift, a character breathing, ' +
  'cloth and leaves stirring in a light breeze. Keep the full subject in frame with ' +
  'generous padding. Do not redraw or restyle the scene, do not add text, letters, ' +
  'captions, speech bubbles, logos, or watermarks.';

function shotPrompt(story: StoryItem, lineIndex: number): string {
  const line = story.lines[lineIndex];
  const before = lineIndex > 0 ? story.lines[lineIndex - 1].english : null;
  const after = lineIndex < story.lines.length - 1 ? story.lines[lineIndex + 1].english : null;

  // Neighbouring beats give the model the story's direction, so shot N reads as
  // a continuation of shot N-1 rather than an unrelated picture.
  const context = [
    before ? `Just before this moment: ${before}` : `This is how the story opens.`,
    `This shot: ${line.english}`,
    after ? `It is about to lead into: ${after}` : `This is the final moment of the story.`,
  ].join(' ');

  return `${MOTION_STYLE} Scene ${lineIndex + 1} of ${story.lines.length} from the Gujarati children's story "${story.titleEnglish}". ${context} Animate only what this shot already shows.`;
}

function titlePrompt(story: StoryItem): string {
  return `${MOTION_STYLE} The opening title shot of the Gujarati children's story "${story.titleEnglish}". A slow, inviting push into the cover illustration. Nothing enters or leaves the frame.`;
}

/* ------------------------------------------------------------------ Venice */

/** Venice occasionally drops a connection mid-upload; a bare fetch failure
 *  here would abandon a shot that was only one retry away from succeeding. */
async function venicePost(endpoint: string, body: Record<string, unknown>, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      lastError = error;
      console.warn(`    ${endpoint} attempt ${attempt} failed (${(error as Error).message}); retrying`);
      await sleep(2000 * attempt);
    }
  }
  throw lastError;
}

async function download(url: string, outFile: string, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`download ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 1024) throw new Error(`download too small (${buffer.length} bytes)`);
      fs.writeFileSync(outFile, buffer);
      return;
    } catch (error) {
      lastError = error;
      await sleep(1500 * attempt);
    }
  }
  throw lastError;
}

function dataUri(file: string): string {
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

async function synthesise(text: string, outFile: string): Promise<boolean> {
  const res = await venicePost('/audio/speech', {
    model: TTS_MODEL,
    voice: TTS_VOICE,
    input: text,
    response_format: 'mp3',
    speed: TTS_SPEED,
    ...(/[઀-૿]/.test(text) ? { language: 'gu' } : {}),
  });
  if (!res.ok) {
    console.error(`    tts ${res.status}: ${(await res.text()).slice(0, 150)}`);
    return false;
  }
  fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
  return true;
}

/** Queue one reference-to-video shot and wait for the mp4. */
async function animate(referenceImage: string, prompt: string, outFile: string, seconds: number) {
  // A cached shot is one already paid for; never buy it twice.
  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1024) {
    console.log('    (cached)');
    return;
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const common = {
    model: VIDEO_MODEL,
    duration: `${seconds}s`,
    aspect_ratio: '1:1',
    resolution: '720p',
  };

  const quote = await venicePost('/video/quote', common);
  if (quote.status === 402) throw new OutOfCredit();
  if (!quote.ok) throw new Error(`quote ${quote.status}: ${(await quote.text()).slice(0, 200)}`);

  const queue = await venicePost('/video/queue', {
    ...common,
    reference_image_urls: [dataUri(referenceImage)],
    prompt,
  });
  if (queue.status === 402) throw new OutOfCredit();
  if (!queue.ok) throw new Error(`queue ${queue.status}: ${(await queue.text()).slice(0, 200)}`);

  const queued = await queue.json();
  const queueId = queued.queue_id ?? queued.id;
  // The share link is handed out at queue time and is NOT repeated in the
  // retrieve payload — only the status is. Keep it, or the finished shot is
  // unreachable, and it expires (410) shortly after, so download promptly.
  const queuedDownloadUrl: string | undefined = queued.download_url;
  if (!queueId) throw new Error(`no queue id: ${JSON.stringify(queued).slice(0, 200)}`);

  const started = Date.now();
  try {
    while (Date.now() - started < MAX_POLL_MS) {
      const res = await venicePost('/video/retrieve', { model: VIDEO_MODEL, queue_id: queueId });
      if (!res.ok) {
        await sleep(POLL_MS);
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('video/') || contentType.includes('octet-stream')) {
        fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
        return;
      }

      const status = await res.json();
      const state = String(status.status ?? status.request_status ?? status.state ?? '').toUpperCase();

      if (['COMPLETED', 'SUCCEEDED', 'DONE'].includes(state)) {
        const url = status.download_url ?? queuedDownloadUrl;
        if (!url) throw new Error(`completed but no download url: ${JSON.stringify(status).slice(0, 200)}`);
        await download(url, outFile);
        return;
      }
      if (['FAILED', 'ERROR', 'REJECTED'].includes(state)) {
        throw new Error(`generation ${state}: ${JSON.stringify(status).slice(0, 200)}`);
      }
      await sleep(POLL_MS);
    }
    throw new Error('timed out');
  } finally {
    void venicePost('/video/complete', { model: VIDEO_MODEL, queue_id: queueId }, 1).catch(() => {});
  }
}

/* ------------------------------------------------------------------ ffmpeg */

async function ffmpeg(args: string[]) {
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    maxBuffer: 1024 * 1024 * 64,
  });
}

async function durationOf(file: string): Promise<number> {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  const seconds = Number.parseFloat(stdout.trim());
  return Number.isFinite(seconds) ? seconds : 0;
}

/**
 * One finished segment: the animated shot (its own audio discarded), stretched
 * or trimmed to exactly cover the narration, with the narration laid over it.
 */
async function buildSegment(clip: string, narration: string, out: string, temp: string) {
  const narrationLength = await durationOf(narration);
  const target = Math.max(2.5, narrationLength + HOLD_AFTER_NARRATION);
  const clipLength = await durationOf(clip);

  const normalised = path.join(temp, `${path.basename(out, '.mp4')}-v.mp4`);

  if (clipLength >= target) {
    await ffmpeg([
      '-i', clip, '-an', '-t', String(target),
      '-vf', `scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=decrease,pad=${OUT_W}:${OUT_H}:(ow-iw)/2:(oh-ih)/2:color=0xfffdf7,fps=${FPS},setsar=1`,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '21',
      normalised,
    ]);
  } else {
    // Shot is shorter than the line takes to read: play it, then hold on its
    // last frame rather than looping the motion, which reads as a glitch.
    const held = path.join(temp, `${path.basename(out, '.mp4')}-hold.mp4`);
    await ffmpeg([
      '-i', clip, '-an',
      '-vf', `scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=decrease,pad=${OUT_W}:${OUT_H}:(ow-iw)/2:(oh-ih)/2:color=0xfffdf7,fps=${FPS},setsar=1,tpad=stop_mode=clone:stop_duration=${(target - clipLength).toFixed(2)}`,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '21',
      '-t', String(target),
      held,
    ]);
    fs.renameSync(held, normalised);
  }

  await ffmpeg([
    '-i', normalised,
    '-i', narration,
    '-filter_complex', `[1:a]aresample=48000,apad=whole_dur=${target}[a]`,
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest',
    out,
  ]);
}

/* -------------------------------------------------------------------- Film */

async function buildFilm(story: StoryItem) {
  const outFile = path.join(VIDEO_DIR, `story-${story.id}.mp4`);
  if (fs.existsSync(outFile) && !FORCE) {
    console.log(`- ${story.id}: already has a film (pass --force to rebuild)`);
    return;
  }

  const heroImage = path.join(GEN_DIR, `story-${story.id}.webp`);
  const titleAudio = path.join(AUDIO_DIR, `story-${story.id}-title.mp3`);
  if (!fs.existsSync(heroImage)) throw new Error(`missing hero art: ${heroImage}`);
  if (!fs.existsSync(titleAudio)) throw new Error(`missing title audio: ${titleAudio}`);

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), `film-${story.id}-`));
  const shots = path.join(SHOT_CACHE, story.id);
  fs.mkdirSync(shots, { recursive: true });
  const segments: string[] = [];

  try {
    // --- Title -------------------------------------------------------------
    console.log(`  title shot…`);
    const titleClip = path.join(shots, 'title.mp4');
    await animate(heroImage, titlePrompt(story), titleClip, TITLE_SECONDS);
    const titleSegment = path.join(temp, 'seg-00.mp4');
    await buildSegment(titleClip, titleAudio, titleSegment, temp);
    segments.push(titleSegment);

    // --- Story beats -------------------------------------------------------
    for (let i = 0; i < story.lines.length; i++) {
      const lineImage = path.join(GEN_DIR, `story-${story.id}-line${i}.webp`);
      const lineAudio = path.join(AUDIO_DIR, `story-${story.id}-line${i}.mp3`);
      if (!fs.existsSync(lineImage) || !fs.existsSync(lineAudio)) {
        console.warn(`  ! skipping line ${i + 1}: missing asset`);
        continue;
      }
      console.log(`  shot ${i + 1}/${story.lines.length}…`);
      const raw = path.join(shots, `line-${i}.mp4`);
      await animate(lineImage, shotPrompt(story, i), raw, SHOT_SECONDS);
      const segment = path.join(temp, `seg-${String(i + 1).padStart(2, '0')}.mp4`);
      await buildSegment(raw, lineAudio, segment, temp);
      segments.push(segment);
    }

    // --- Moral -------------------------------------------------------------
    // Everything above is already paid for, so a failure here downgrades the
    // film to one without a closing card rather than throwing it all away.
    if (story.moralGujarati) {
      try {
        console.log(`  moral card…`);
        const moralAudio = path.join(shots, 'moral.mp3');
        const spoken = `${story.moralGujarati}. ${story.moralEnglish ?? ''}`.trim();
        const haveAudio =
          (fs.existsSync(moralAudio) && fs.statSync(moralAudio).size > 512) ||
          (await synthesise(spoken, moralAudio));
        if (haveAudio) {
          const lastLineImage = path.join(GEN_DIR, `story-${story.id}-line${story.lines.length - 1}.webp`);
          const moralRef = fs.existsSync(lastLineImage) ? lastLineImage : heroImage;
          const moralClip = path.join(shots, 'moral.mp4');
          await animate(
            moralRef,
            `${MOTION_STYLE} A calm closing shot for "${story.titleEnglish}", holding still while the lesson of the story is read aloud.`,
            moralClip,
            4
          );
          const moralSegment = path.join(temp, 'seg-99.mp4');
          await buildSegment(moralClip, moralAudio, moralSegment, temp);
          segments.push(moralSegment);
        }
      } catch (error) {
        console.warn(
          `  ! closing card skipped (${error instanceof Error ? error.message : error}); ` +
            `assembling the film without it`
        );
      }
    }

    // --- Stitch ------------------------------------------------------------
    if (segments.length === 0) throw new Error('no segments were produced');
    const listFile = path.join(temp, 'concat.txt');
    fs.writeFileSync(
      listFile,
      segments.map(segment => `file '${segment.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n')
    );

    fs.mkdirSync(VIDEO_DIR, { recursive: true });
    await ffmpeg([
      '-f', 'concat', '-safe', '0', '-i', listFile,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '22',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
      outFile,
    ]);

    const seconds = await durationOf(outFile);
    const mb = fs.statSync(outFile).size / 1024 / 1024;
    console.log(`  ✓ ${path.relative(ROOT, outFile)} — ${seconds.toFixed(1)}s, ${mb.toFixed(1)} MB, ${segments.length} shots`);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

/* -------------------------------------------------------------------- Main */

async function main() {
  if (storyIds.length === 0) {
    console.error('Name at least one story id. Available ids without a film:');
    for (const story of stories) {
      if (!fs.existsSync(path.join(VIDEO_DIR, `story-${story.id}.mp4`))) {
        console.error(`  ${story.id.padEnd(28)} ${story.lines.length} lines  ${story.titleEnglish}`);
      }
    }
    process.exit(1);
  }

  const chosen = storyIds.map(id => {
    const story = stories.find(item => item.id === id);
    if (!story) {
      console.error(`Unknown story id: ${id}`);
      process.exit(1);
    }
    return story;
  });

  console.log(`Model: ${VIDEO_MODEL}`);
  for (const story of chosen) {
    const shots = story.lines.length + 1 + (story.moralGujarati ? 1 : 0);
    console.log(`\n${story.titleEnglish} (${story.id}) — ${shots} shots`);
    if (PLAN_ONLY) {
      console.log(`  title: ${titlePrompt(story).slice(0, 150)}…`);
      story.lines.forEach((_, i) => console.log(`  shot ${i + 1}: ${shotPrompt(story, i).slice(-140)}`));
      continue;
    }
    if (!API_KEY) {
      console.error('VENICE_API_KEY is not set.');
      process.exit(1);
    }
    try {
      await buildFilm(story);
    } catch (error) {
      if (error instanceof OutOfCredit) {
        console.error(`\n  ✗ ${error.message}`);
        console.error('  Shots already generated are cached; rerun to carry on where this stopped.');
        process.exitCode = 1;
        return;
      }
      console.error(`  ✗ ${story.id} failed:`, error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  }
}

void main();
