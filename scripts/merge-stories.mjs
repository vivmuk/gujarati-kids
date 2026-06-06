/**
 * Merges legacyStories + stories into a single deduplicated stories array.
 * - Keeps the legacyStories version when IDs clash (it's richer).
 * - Adds the 6 legacyStories-only entries (hungry-cat, sun-moon, kite-wind,
 *   dadi-dhokla, rainy-peacock, akbar-birbal-line) that have pre-gen images.
 * - Removes the legacyStories export.
 */

import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/data/gujarati.ts';
const src = readFileSync(filePath, 'utf-8');

// ── helper: extract story objects between two known markers ──────────────────
function extractStoryBlocks(text) {
  const blocks = [];
  let i = 0;
  while (i < text.length) {
    // Find opening brace of a story object
    const start = text.indexOf('\n  {', i);
    if (start === -1) break;

    // Find the matching close brace (depth-tracking)
    let depth = 0;
    let j = start + 1;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') {
        depth--;
        if (depth === 0) { j++; break; }
      }
    }
    // Skip trailing comma + newline
    if (text[j] === ',') j++;

    const block = text.substring(start, j).trimEnd();
    const idMatch = block.match(/\bid:\s*'([^']+)'/);
    if (idMatch) blocks.push({ id: idMatch[1], text: block });

    i = j;
  }
  return blocks;
}

// ── Extract legacyStories section ────────────────────────────────────────────
const legacyStart = src.indexOf('export const legacyStories: StoryItem[]');
const legacyEnd   = src.indexOf('\nexport const stories: StoryItem[]');

if (legacyStart === -1 || legacyEnd === -1) {
  console.error('Could not find legacyStories or stories declarations');
  process.exit(1);
}

const legacySrc = src.substring(legacyStart, legacyEnd);
const legacyBlocks = extractStoryBlocks(legacySrc);
console.log('legacyStories IDs:', legacyBlocks.map(b => b.id).join(', '));

// ── Extract stories section ──────────────────────────────────────────────────
const storiesStart = src.indexOf('\nexport const stories: StoryItem[]');
// Find the closing ]; of the stories array
let depth2 = 0, k = storiesStart;
while (k < src.length) {
  if (src[k] === '[') depth2++;
  else if (src[k] === ']') { depth2--; if (depth2 === 0) { k++; break; } }
  k++;
}
// k now points after the closing ] of stories
const storiesSrc = src.substring(storiesStart, k);
const storyBlocks = extractStoryBlocks(storiesSrc);
console.log('stories IDs:', storyBlocks.map(b => b.id).join(', '));

// ── Merge: prefer legacyStories for duplicates ───────────────────────────────
const legacyIds = new Set(legacyBlocks.map(b => b.id));
const filteredNew = storyBlocks.filter(b => !legacyIds.has(b.id));
const merged = [...legacyBlocks, ...filteredNew];

console.log('\nMerged stories (', merged.length, '):');
merged.forEach((b, i) => console.log(' ', i + 1, b.id));

// ── Rebuild file ─────────────────────────────────────────────────────────────
const before = src.substring(0, legacyStart);
// Everything after the stories closing ];
const afterStories = src.substring(k);

const mergedBody = merged.map(b => b.text).join(',\n');

const newFile =
  before.trimEnd() +
  '\n\n// ===== STORIES =====\nexport const stories: StoryItem[] = [\n' +
  mergedBody +
  ',\n];\n' +
  afterStories;

writeFileSync(filePath, newFile, 'utf-8');
console.log('\nSUCCESS: stories merged and legacyStories removed.');

// Quick duplicate check
const dupCheck = [...newFile.matchAll(/\bid:\s*'([^']+)'/g)].map(m => m[1]);
const seen = new Set(), dups = [];
dupCheck.forEach(id => { if (seen.has(id)) dups.push(id); else seen.add(id); });
if (dups.length) console.warn('WARNING: still duplicated IDs:', dups);
else console.log('No duplicate IDs — clean!');
