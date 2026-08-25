/**
 * Asset audit — reports every expected audio/image/video slug that has no file on disk.
 * Run: npx tsx scripts/audit-assets.mts
 */
import fs from 'node:fs';
import path from 'node:path';
import { swar, vyanjan, words, phrases, stories } from '../src/data/gujarati';

const PUB = path.join(process.cwd(), 'public');
const has = (rel: string) => fs.existsSync(path.join(PUB, rel.replace(/^\//, '')));
const slug = (r: string) => r.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

type Row = { kind: string; slug: string; audio?: string; image?: string; label: string };
const rows: Row[] = [];

for (const l of [...swar, ...vyanjan])
  rows.push({ kind: 'letter', slug: `letter-${l.roman}`, audio: `/audio/letter-${l.roman}.mp3`, image: `/images/gen/letter-${l.roman}.webp`, label: `${l.gujarati} ${l.roman}` });
for (const w of words)
  rows.push({ kind: 'word', slug: `word-${w.roman}`, audio: `/audio/word-${w.roman}.mp3`, image: `/images/gen/word-${w.roman}.webp`, label: `${w.gujarati} ${w.english}` });
for (const p of phrases)
  rows.push({ kind: 'phrase', slug: `phrase-${slug(p.roman)}`, audio: `/audio/phrase-${slug(p.roman)}.mp3`, image: `/images/gen/phrase-${slug(p.roman)}.webp`, label: `${p.gujarati} — ${p.english}` });
for (const s of stories) {
  rows.push({ kind: 'story-hero', slug: `story-${s.id}`, audio: `/audio/story-${s.id}-title.mp3`, image: `/images/gen/story-${s.id}.webp`, label: s.titleEnglish });
  s.lines.forEach((ln: { english: string }, i: number) =>
    rows.push({ kind: 'story-line', slug: `story-${s.id}-line${i}`, audio: `/audio/story-${s.id}-line${i}.mp3`, image: `/images/gen/story-${s.id}-line${i}.webp`, label: ln.english }));
}

const missingAudio = rows.filter(r => r.audio && !has(r.audio));
const missingImage = rows.filter(r => r.image && !has(r.image));
const missingVideo = stories.filter(s => !has(`/videos/story-${s.id}.mp4`));

const byKind = (list: Row[]) => {
  const m: Record<string, number> = {};
  for (const r of list) m[r.kind] = (m[r.kind] || 0) + 1;
  return m;
};

console.log(`Expected slugs: ${rows.length}`);
console.log(`\n=== MISSING AUDIO (${missingAudio.length}) ===`, byKind(missingAudio));
missingAudio.slice(0, 60).forEach(r => console.log(`  ${r.slug}  — ${r.label}`));
console.log(`\n=== MISSING IMAGES (${missingImage.length}) ===`, byKind(missingImage));
missingImage.slice(0, 120).forEach(r => console.log(`  ${r.slug}  — ${r.label}`));
console.log(`\n=== MISSING STORY VIDEOS (${missingVideo.length}/${stories.length}) ===`);
missingVideo.slice(0, 40).forEach(s => console.log(`  story-${s.id} — ${s.titleEnglish}`));

// Orphans: files on disk with no expected slug
const expectedImgs = new Set(rows.filter(r => r.image).map(r => path.basename(r.image!)));
const genDir = path.join(PUB, 'images', 'gen');
const orphans = fs.existsSync(genDir) ? fs.readdirSync(genDir).filter(f => !expectedImgs.has(f)) : [];
console.log(`\n=== ORPHAN IMAGES in /images/gen (${orphans.length}) ===`);
orphans.slice(0, 40).forEach(f => console.log('  ' + f));
