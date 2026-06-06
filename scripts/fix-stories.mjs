/**
 * Fix the broken merge:
 * 1. Keep the 10 good legacy stories (lines 413-691)
 * 2. Extract the 30 user stories from the junk section (after line 692)
 * 3. Filter out the 4 duplicate IDs (keep legacy version)
 * 4. Insert the 26 unique user stories into the array
 * 5. Remove the junk section
 */
import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/data/gujarati.ts';
const src = readFileSync(filePath, 'utf-8');
const lines = src.split('\n');

// ── Find the boundary markers ────────────────────────────────────────────────
// The good stories array ends at line 691 (index 690) with '];'
// The junk starts at line 692 (index 691) with ' = ['
// The junk ends at line 1143 (index 1142) with '];'
// After that is the category metadata etc.

let goodStoriesEndLine = -1;   // index of the ]; that closes the 10 good stories
let junkEndLine = -1;           // index of the ]; that closes the 30 user stories

for (let i = 680; i < lines.length; i++) {
  if (lines[i] && lines[i].trim() === '];') {
    if (goodStoriesEndLine === -1) {
      goodStoriesEndLine = i;
      console.log('Good stories end at line', i + 1);
    } else if (junkEndLine === -1) {
      junkEndLine = i;
      console.log('Junk stories end at line', i + 1);
      break;
    }
  }
}

if (goodStoriesEndLine === -1 || junkEndLine === -1) {
  console.error('Could not find story array boundaries');
  process.exit(1);
}

// Verify the junk section starts with ' = ['
const junkStartLine = goodStoriesEndLine + 1;
console.log('Junk starts at line', junkStartLine + 1, ':', JSON.stringify(lines[junkStartLine]?.substring(0, 20)));

// ── Extract the 30 user stories from the junk section ────────────────────────
function extractStoryBlocks(text) {
  const blocks = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf('\n  {', i);
    if (start === -1) break;
    // Track braces for story object depth
    let depth = 0;
    let j = start + 1;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') {
        depth--;
        if (depth === 0) { j++; break; }
      }
    }
    if (text[j] === ',') j++;
    const block = text.substring(start, j).trimEnd();
    const idMatch = block.match(/\bid:\s*'([^']+)'/);
    if (idMatch) blocks.push({ id: idMatch[1], text: block });
    i = j;
  }
  return blocks;
}

// The junk section is lines junkStartLine..junkEndLine
const junkText = lines.slice(junkStartLine, junkEndLine + 1).join('\n');
const userBlocks = extractStoryBlocks(junkText);
console.log('\nUser stories extracted:', userBlocks.length);
userBlocks.forEach((b, i) => console.log(' ', i + 1, b.id));

// ── Determine which are already in the good stories (legacy) ─────────────────
const legacyIdsInFile = new Set();
const goodStoriesText = lines.slice(0, goodStoriesEndLine + 1).join('\n');
for (const m of goodStoriesText.matchAll(/\bid:\s*'([^']+)'/g)) {
  legacyIdsInFile.add(m[1]);
}
console.log('\nLegacy story IDs already present:', [...legacyIdsInFile]);

// Filter out duplicates
const uniqueUserBlocks = userBlocks.filter(b => !legacyIdsInFile.has(b.id));
console.log('\nUnique user stories to add:', uniqueUserBlocks.length);
uniqueUserBlocks.forEach((b, i) => console.log(' ', i + 1, b.id));

// ── Rebuild the file ─────────────────────────────────────────────────────────
// Before the ]; of good stories: insert unique user stories
const uniqueUserStoriesText = uniqueUserBlocks.map(b => b.text).join(',\n');

// Lines 0..goodStoriesEndLine-1 = content of good stories array (without the ]; )
// Then add unique user stories
// Then ];
// Then everything after junkEndLine

const goodPart = lines.slice(0, goodStoriesEndLine).join('\n');
const afterJunk = lines.slice(junkEndLine + 1).join('\n');

const newFile =
  goodPart + ',\n' +
  uniqueUserStoriesText + ',\n' +
  '];\n' +
  afterJunk;

writeFileSync(filePath, newFile, 'utf-8');
console.log('\nSUCCESS: file rebuilt');

// Verify
const newContent = readFileSync(filePath, 'utf-8');
const newIds = [...newContent.matchAll(/\bid:\s*'([^']+)'/g)].map(m => m[1]);
const seenIds = new Set(), dupIds = [];
newIds.forEach(id => { if (seenIds.has(id)) dupIds.push(id); else seenIds.add(id); });
console.log('Total stories:', seenIds.size);
if (dupIds.length) console.warn('WARNING duplicates:', dupIds);
else console.log('No duplicates — clean!');
