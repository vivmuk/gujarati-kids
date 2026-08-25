/**
 * Production story video generator.
 *
 * Each story video:
 *   [Title Card]  → animated Ken Burns + Gujarati/English TTS title
 *   [Line 0..N]   → Venice animated clip per line image + Gujarati TTS narration
 *   [Moral Card]  → generated moral illustration + TTS moral
 *   [End Card]    → generated "The End" illustration + TTS sign-off
 *
 * All clips are merged audio+video then concatenated into one MP4.
 *
 * Usage:
 *   node scripts/generate-story-videos.mjs [--count 5] [--force]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { execFile as _execFile, exec as _exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execFile = promisify(_execFile);
const exec     = promisify(_exec);

// ── Config ────────────────────────────────────────────────────────────────────
const API_KEY      = process.env.VENICE_API_KEY;
if (!API_KEY) {
  console.error('VENICE_API_KEY is not set. Export it (or source .env.local) before running.');
  process.exit(1);
}
const BASE         = 'https://api.venice.ai/api/v1';
const VIDEO_MODEL  = 'seedance-2-0-fast-reference-to-video';
const IMAGE_MODEL  = 'grok-imagine-image-quality';
const TTS_MODEL    = 'tts-xai-v1';   // Only model with native Gujarati (language: 'gu')
const TTS_VOICE    = 'eve';           // Only voice supported by tts-xai-v1 on Venice
const TTS_SPEED    = 0.78;            // Slow, deliberate narration pace
const MIN_SCENE_S  = 6.5;            // Minimum seconds per story line (scene)
const PAUSE_AFTER  = 1.2;            // Seconds of silence after each narration
const OUT_W        = 854;
const OUT_H        = 480;
const FPS          = 25;

const ROOT     = path.resolve('.');
const GEN_IMGS = path.join(ROOT, 'public', 'images', 'gen');
const VIDEOS   = path.join(ROOT, 'public', 'videos');
const TEMP     = path.join(os.tmpdir(), 'story-prod-' + Date.now());

const FORCE      = process.argv.includes('--force');
const MAX_COUNT  = parseInt(
  process.argv.includes('--count')
    ? process.argv[process.argv.indexOf('--count') + 1]
    : '5',
  10,
);
const POLL_MS    = 10_000;
const MAX_POLL   = 200_000;

// ── Venice helpers ────────────────────────────────────────────────────────────
async function venicePost(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  return res;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fileToBase64(filePath) {
  const buf  = readFileSync(filePath);
  const ext  = path.extname(filePath).toLowerCase();
  const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' }[ext] ?? 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// ── TTS ───────────────────────────────────────────────────────────────────────
async function tts(text, lang = 'gu') {
  const res = await venicePost('/audio/speech', {
    model: TTS_MODEL, voice: TTS_VOICE,
    input: text, response_format: 'mp3',
    speed: TTS_SPEED, language: lang,
  });
  if (!res.ok) throw new Error(`TTS failed (${res.status}): ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function audioDuration(audioPath) {
  const { stdout } = await exec(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`,
  );
  return parseFloat(stdout.trim()) || 4;
}

// ── Image generation ──────────────────────────────────────────────────────────
async function generateImage(prompt) {
  const res = await venicePost('/images/generations', {
    model: IMAGE_MODEL, prompt, n: 1,
    response_format: 'b64_json',
    width: OUT_W, height: OUT_H,
    style_preset: 'Folk Art',
  });
  if (!res.ok) throw new Error(`Image gen failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const b64  = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image returned: ' + JSON.stringify(data));
  return Buffer.from(b64, 'base64');
}

// ── Venice video generation ───────────────────────────────────────────────────
async function generateVideoClip(imgPath, prompt) {
  const refUrl = fileToBase64(imgPath);

  // Quote (try 8s first for longer scenes, fall back to 4s)
  let clipDuration = '8s';
  let qRes = await venicePost('/video/quote', {
    model: VIDEO_MODEL, duration: clipDuration,
    aspect_ratio: '16:9', resolution: '480p', audio: false,
  });
  if (!qRes.ok) {
    clipDuration = '4s';
    qRes = await venicePost('/video/quote', {
      model: VIDEO_MODEL, duration: clipDuration,
      aspect_ratio: '16:9', resolution: '480p', audio: false,
    });
    if (!qRes.ok) throw new Error(`Video quote failed (${qRes.status}): ${await qRes.text()}`);
  }
  console.log(`      clip duration: ${clipDuration}`);

  // Queue
  const queueRes = await venicePost('/video/queue', {
    model: VIDEO_MODEL, duration: clipDuration,
    aspect_ratio: '16:9', resolution: '480p', audio: false,
    reference_image_urls: [refUrl], prompt,
  });
  if (!queueRes.ok) throw new Error(`Video queue failed (${queueRes.status}): ${await queueRes.text()}`);
  const queueData = await queueRes.json();
  const queueId   = queueData.queue_id ?? queueData.id;
  if (!queueId) throw new Error('No queue_id: ' + JSON.stringify(queueData));

  console.log(`      queued → ${queueId}`);
  const t0 = Date.now();

  while (Date.now() - t0 < MAX_POLL) {
    await sleep(POLL_MS);
    const r = await venicePost('/video/retrieve', { model: VIDEO_MODEL, queue_id: queueId });
    if (!r.ok) { console.warn('      retrieve error, retrying...'); continue; }

    const ct = r.headers.get('content-type') ?? '';
    if (ct.includes('video/') || ct.includes('octet-stream')) {
      venicePost('/video/complete', { model: VIDEO_MODEL, queue_id: queueId }).catch(() => {});
      return Buffer.from(await r.arrayBuffer());
    }

    const s = await r.json().catch(() => ({}));
    const status = String(s.status ?? s.request_status ?? s.state ?? '').toUpperCase();
    const dlUrl  = s.download_url;
    console.log(`      status: ${status}`);

    if ((['COMPLETED','SUCCEEDED','DONE'].includes(status)) && dlUrl) {
      venicePost('/video/complete', { model: VIDEO_MODEL, queue_id: queueId }).catch(() => {});
      return Buffer.from(await (await fetch(dlUrl)).arrayBuffer());
    }
    if (['FAILED','ERROR','REJECTED'].includes(status)) {
      venicePost('/video/complete', { model: VIDEO_MODEL, queue_id: queueId }).catch(() => {});
      throw new Error('Venice video failed: ' + JSON.stringify(s));
    }
  }
  throw new Error('Venice video timed out');
}

// ── ffmpeg helpers ────────────────────────────────────────────────────────────

/** Convert a still image to a Ken Burns zoom+pan video of `duration` seconds */
async function imageToVideo(imgPath, outPath, duration = 8) {
  const frames = duration * FPS;
  // Slow zoom-in 1.0 → 1.18, slight left-to-right pan for cinematic feel
  const zoomExpr = `min(zoom+0.0005,1.18)`;
  const xExpr    = `iw/2-(iw/zoom/2)+on*0.3`;   // slow pan right
  const yExpr    = `ih/2-(ih/zoom/2)`;
  await exec(
    `ffmpeg -y -loop 1 -i "${imgPath}" ` +
    `-vf "scale=${OUT_W * 2}:${OUT_H * 2}:force_original_aspect_ratio=increase,` +
         `crop=${OUT_W * 2}:${OUT_H * 2},` +
         `zoompan=z='${zoomExpr}':x='${xExpr}':y='${yExpr}':d=${frames}:s=${OUT_W}x${OUT_H}:fps=${FPS}" ` +
    `-t ${duration} -c:v libx264 -pix_fmt yuv420p -r ${FPS} "${outPath}"`,
  );
}

/** Merge a video with audio. Loops video to cover audio + silence padding, enforces MIN_SCENE_S. */
async function mergeAV(videoPath, audioPath, outPath, minDur = 0) {
  const ttsDur    = await audioDuration(audioPath);
  const totalDur  = Math.max(ttsDur + PAUSE_AFTER, minDur);

  // Pad audio with silence to reach totalDur, then merge with looping video
  await exec(
    `ffmpeg -y ` +
    `-stream_loop -1 -i "${videoPath}" ` +
    `-i "${audioPath}" ` +
    `-filter_complex "[1:a]apad=whole_dur=${totalDur}[aout]" ` +
    `-map 0:v -map "[aout]" ` +
    `-c:v libx264 -c:a aac -t ${totalDur} -pix_fmt yuv420p "${outPath}"`,
  );
}

/** Concatenate a list of video files into one. */
async function concat(clipPaths, outPath) {
  const listFile = path.join(path.dirname(outPath), '_concat.txt');
  writeFileSync(listFile, clipPaths.map(p => `file '${p.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
  await exec(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outPath}"`);
}

// ── Card generators ───────────────────────────────────────────────────────────

async function makeTitleCard(story, dir) {
  console.log('  🎬 Title card...');
  const imgOutPath = path.join(dir, 'title-card.webp');

  // Try pre-generated hero image first, else generate one
  const heroPath = path.join(GEN_IMGS, `story-${story.id}.webp`);
  let titleImgPath;
  if (existsSync(heroPath)) {
    titleImgPath = heroPath;
  } else {
    const prompt =
      `Gujarati children's storybook title illustration for "${story.titleEnglish}". ` +
      `Riso-folk art style, saffron and indigo ink, Ajrakh block-print patterns, ` +
      `decorative border, warm golden light, magical and inviting, no text.`;
    const buf = await generateImage(prompt);
    writeFileSync(imgOutPath, buf);
    titleImgPath = imgOutPath;
  }

  // Ken Burns video
  const titleVideoPath = path.join(dir, 'title-video.mp4');
  await imageToVideo(titleImgPath, titleVideoPath, 6);

  // TTS: announce title in Gujarati then English
  const titleText = `${story.titleGujarati}. ${story.titleEnglish}.`;
  const titleAudioBuf = await tts(titleText, 'gu');
  const titleAudioPath = path.join(dir, 'title-audio.mp3');
  writeFileSync(titleAudioPath, titleAudioBuf);

  const titleMergedPath = path.join(dir, 'title-merged.mp4');
  await mergeAV(titleVideoPath, titleAudioPath, titleMergedPath, 8);
  return titleMergedPath;
}

async function makeMoralCard(story, dir) {
  console.log('  🎭 Moral card...');
  const prompt =
    `Beautiful Gujarati folk art scene illustrating the moral: "${story.moralEnglish}". ` +
    `Warm and reflective mood, riso-folk style, saffron and indigo colors, ` +
    `decorative Ajrakh border, soft golden light, children's book illustration. No text.`;
  const buf = await generateImage(prompt);
  const imgPath = path.join(dir, 'moral-card.webp');
  writeFileSync(imgPath, buf);

  const moralVideoPath = path.join(dir, 'moral-video.mp4');
  await imageToVideo(imgPath, moralVideoPath, 12);

  const moralText = `${story.moralGujarati}. ${story.moralEnglish}.`;
  const moralAudioBuf = await tts(moralText, 'gu');
  const moralAudioPath = path.join(dir, 'moral-audio.mp3');
  writeFileSync(moralAudioPath, moralAudioBuf);

  const moralMergedPath = path.join(dir, 'moral-merged.mp4');
  await mergeAV(moralVideoPath, moralAudioPath, moralMergedPath, 10);
  return moralMergedPath;
}

async function makeEndCard(story, dir) {
  console.log('  🌟 End card...');
  const prompt =
    `"The End" Gujarati children's storybook final card. ` +
    `Joyful and celebratory folk art scene, riso-folk style, ` +
    `saffron orange and deep indigo, Ajrakh block-print decorative border, ` +
    `stars and flowers, warm sunset glow, magical storybook ending. No text.`;
  const buf = await generateImage(prompt);
  const imgPath = path.join(dir, 'end-card.webp');
  writeFileSync(imgPath, buf);

  const endVideoPath = path.join(dir, 'end-video.mp4');
  await imageToVideo(imgPath, endVideoPath, 10);

  const endText = `સ્ટોરીનો અંત. The End.`;
  const endAudioBuf = await tts(endText, 'gu');
  const endAudioPath = path.join(dir, 'end-audio.mp3');
  writeFileSync(endAudioPath, endAudioBuf);

  const endMergedPath = path.join(dir, 'end-merged.mp4');
  await mergeAV(endVideoPath, endAudioPath, endMergedPath, 8);
  return endMergedPath;
}

// ── Story processor ───────────────────────────────────────────────────────────
async function processStory(story) {
  const outPath = path.join(VIDEOS, `story-${story.id}.mp4`);
  if (!FORCE && existsSync(outPath)) {
    console.log(`  ↩  Already exists: story-${story.id}.mp4  (use --force to regenerate)`);
    return;
  }

  const dir = path.join(TEMP, story.id);
  mkdirSync(dir, { recursive: true });

  const allClips = [];

  // ── Title card ──────────────────────────────────────────────────────────────
  try {
    allClips.push(await makeTitleCard(story, dir));
  } catch (e) { console.warn(`  ⚠ Title card failed: ${e.message}`); }

  // ── Story line clips ────────────────────────────────────────────────────────
  for (let i = 0; i < story.lines.length; i++) {
    const line    = story.lines[i];
    const imgPath = path.join(GEN_IMGS, `story-${story.id}-line${i}.webp`);

    if (!existsSync(imgPath)) {
      console.warn(`  ⚠ No image for line ${i}, skipping`);
      continue;
    }

    console.log(`  📖 Line ${i + 1}/${story.lines.length}: "${line.english.slice(0, 50)}"`);

    try {
      // Venice animated video
      const videoPrompt =
        `Gujarati folk art animation: ${line.english}. ` +
        `Gentle motion, riso-folk style, saffron and indigo colors, children's storybook.`;
      console.log(`    🎞 Generating animated clip...`);
      const videoBuf = await generateVideoClip(imgPath, videoPrompt);
      const rawVideoPath = path.join(dir, `line${i}-raw.mp4`);
      writeFileSync(rawVideoPath, videoBuf);

      // TTS narration in Gujarati
      console.log(`    🔊 Generating Gujarati narration...`);
      const ttsBuf  = await tts(line.gujarati, 'gu');
      const audioPath = path.join(dir, `line${i}-audio.mp3`);
      writeFileSync(audioPath, ttsBuf);

      // Merge video + audio — enforce minimum scene duration
      const mergedPath = path.join(dir, `line${i}-merged.mp4`);
      await mergeAV(rawVideoPath, audioPath, mergedPath, MIN_SCENE_S);
      allClips.push(mergedPath);
      console.log(`    ✓ Line ${i + 1} done`);
    } catch (e) {
      console.warn(`  ⚠ Line ${i} failed: ${e.message}`);
    }
  }

  // ── Moral card ──────────────────────────────────────────────────────────────
  if (story.moralGujarati) {
    try {
      allClips.push(await makeMoralCard(story, dir));
    } catch (e) { console.warn(`  ⚠ Moral card failed: ${e.message}`); }
  }

  // ── End card ────────────────────────────────────────────────────────────────
  try {
    allClips.push(await makeEndCard(story, dir));
  } catch (e) { console.warn(`  ⚠ End card failed: ${e.message}`); }

  // ── Concatenate ─────────────────────────────────────────────────────────────
  if (allClips.length === 0) {
    console.warn(`  ✗ No clips for ${story.id}, skipping`);
    return;
  }

  console.log(`  🎬 Concatenating ${allClips.length} clips into story-${story.id}.mp4...`);
  await concat(allClips, outPath);
  console.log(`  ✅ Saved: public/videos/story-${story.id}.mp4`);
}

// ── Story parser ──────────────────────────────────────────────────────────────
function parseStories() {
  const ts = readFileSync(path.join(ROOT, 'src/data/gujarati.ts'), 'utf-8');

  const stories = [];
  // Match story blocks: find id, titleGujarati, titleEnglish, moralGujarati, moralEnglish, lines
  const blockRe = /\{\s*id:\s*'([^']+)'([\s\S]*?)(?=\n  \{|\n\];)/g;
  let m;
  while ((m = blockRe.exec(ts)) !== null) {
    const id   = m[1];
    const body = m[2];

    const titleGu = (body.match(/titleGujarati:\s*'([^']+)'/) ?? [])[1] ?? '';
    const titleEn = (body.match(/titleEnglish:\s*'([^']+)'/) ?? [])[1] ?? '';
    const moralGu = (body.match(/moralGujarati:\s*'([^']+)'/) ?? [])[1] ?? '';
    const moralEn = (body.match(/moralEnglish:\s*'([^']+)'/) ?? [])[1] ?? '';

    const lineMatches = [...body.matchAll(/\{\s*gujarati:\s*'([^']+)'[^}]*english:\s*'([^']+)'/g)];
    const lines = lineMatches.map(lm => ({ gujarati: lm[1], english: lm[2] }));

    const hasLineImg = existsSync(path.join(GEN_IMGS, `story-${id}-line0.webp`));
    if (hasLineImg) {
      stories.push({ id, titleGujarati: titleGu, titleEnglish: titleEn, moralGujarati: moralGu, moralEnglish: moralEn, lines });
    }
  }
  return stories;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(TEMP,   { recursive: true });
  mkdirSync(VIDEOS, { recursive: true });

  const stories = parseStories();
  console.log(`\nStories with images (${stories.length} total):`);
  stories.forEach((s, i) => console.log(`  ${i + 1}. ${s.id} — ${s.titleEnglish} (${s.lines.length} lines)`));

  const toProcess = stories.slice(0, MAX_COUNT);
  console.log(`\nGenerating videos for ${toProcess.length} stories${FORCE ? ' [--force]' : ''}...\n`);

  for (let i = 0; i < toProcess.length; i++) {
    const story = toProcess[i];
    console.log(`\n━━━ [${i + 1}/${toProcess.length}] ${story.titleEnglish} ━━━`);
    try {
      await processStory(story);
    } catch (err) {
      console.error(`  ✗ Story failed: ${err.message}`);
    }
  }

  console.log('\n\n✅ All done! Videos are in public/videos/');
}

main().catch(err => { console.error(err); process.exit(1); });
