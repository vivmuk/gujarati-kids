#!/usr/bin/env tsx
/**
 * Dump the story catalogue to JSON so the ffmpeg film builder (plain Python,
 * no TS toolchain) can read it without regex-parsing gujarati.ts.
 *
 * Usage: npx tsx scripts/export-stories.mts [outfile]
 */
import fs from 'node:fs';
import path from 'node:path';
import { stories } from '../src/data/gujarati';

const out = path.resolve(process.argv[2] ?? '.cache/stories.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(stories, null, 2));
console.log(`wrote ${stories.length} stories → ${out}`);
