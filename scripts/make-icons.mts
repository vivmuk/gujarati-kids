#!/usr/bin/env tsx
/**
 * Draw the app's icon set from the Riso-Folk marks, at the sizes each platform
 * actually needs. No network calls — everything here is vector, rendered by
 * sharp.
 *
 * The manifest previously shipped one 512px WebP marked "any maskable", which
 * meant: no maskable safe zone, no PNG for iOS (which ignores WebP for
 * apple-touch-icon), and no social card.
 *
 * Usage: npx tsx scripts/make-icons.mts
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.join(process.cwd(), 'public', 'icons');
const IMAGES = path.join(process.cwd(), 'public', 'images');

const SAFFRON = '#ef5a23';
const INDIGO = '#1d3c6e';
const KEY = '#241c12';
const CREAM = '#f6efdd';
const PAPER = '#fffdf7';

/** Guju, traced at icon scale. Same bird as RisoFolk.tsx. */
function guju(scale: number, cx: number, cy: number): string {
  const t = `translate(${cx} ${cy}) scale(${scale}) translate(-50 -58)`;
  return `<g transform="${t}" fill="none" stroke="${KEY}" stroke-width="3" stroke-linejoin="round">
    <polygon points="36,86 22,112 44,96" fill="#c8390f"/>
    <polygon points="46,90 40,114 58,98" fill="${SAFFRON}"/>
    <ellipse cx="52" cy="70" rx="29" ry="33" fill="${SAFFRON}"/>
    <ellipse cx="50" cy="78" rx="18" ry="22" fill="#f6d9a8"/>
    <ellipse cx="74" cy="68" rx="11" ry="20" fill="#c8390f" transform="rotate(14 74 68)"/>
    <circle cx="48" cy="36" r="26" fill="${SAFFRON}"/>
    <polygon points="40,11 46,2 50,13" fill="${INDIGO}"/>
    <polygon points="50,12 56,3 60,14" fill="${INDIGO}"/>
    <circle cx="40" cy="34" r="7.5" fill="#fff"/>
    <circle cx="58" cy="34" r="7.5" fill="#fff"/>
    <circle cx="41" cy="35" r="3.2" fill="${KEY}" stroke="none"/>
    <circle cx="57" cy="35" r="3.2" fill="${KEY}" stroke="none"/>
    <path d="M43 42 Q49 41 55 42 Q52 53 49 53 Q45 51 43 42 Z" fill="${INDIGO}"/>
    <circle cx="31" cy="44" r="4" fill="#f7b27e" stroke="none"/>
    <circle cx="66" cy="44" r="4" fill="#f7b27e" stroke="none"/>
  </g>`;
}

/** The Ajrakh block-print lozenge, used as the icon's ground pattern. */
function ajrakh(id: string, opacity: number): string {
  return `<pattern id="${id}" width="72" height="72" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="${INDIGO}" stroke-width="3" opacity="${opacity}">
      <rect x="12" y="12" width="48" height="48" transform="rotate(45 36 36)"/>
      <circle cx="36" cy="36" r="6" fill="${INDIGO}" stroke="none"/>
    </g>
  </pattern>`;
}

/**
 * @param safe Fraction of the canvas kept clear at the edges. Maskable icons
 *   get 20% because launchers crop to a circle.
 */
function appIcon(size: number, safe: number): string {
  const inset = size * safe;
  const inner = size - inset * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>${ajrakh('p', 0.18)}</defs>
    <rect width="${size}" height="${size}" fill="${CREAM}"/>
    <rect width="${size}" height="${size}" fill="url(#p)"/>
    <rect x="${inset}" y="${inset}" width="${inner}" height="${inner}" rx="${inner * 0.2}"
          fill="${PAPER}" stroke="${KEY}" stroke-width="${size * 0.028}"/>
    ${guju(inner / 150, size / 2, size / 2)}
  </svg>`;
}

/** 1200×630 social card. */
function ogCard(): string {
  const w = 1200;
  const h = 630;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>${ajrakh('p', 0.14)}</defs>
    <rect width="${w}" height="${h}" fill="${CREAM}"/>
    <rect width="${w}" height="${h}" fill="url(#p)"/>
    <rect x="40" y="40" width="${w - 80}" height="${h - 80}" rx="28"
          fill="${PAPER}" stroke="${KEY}" stroke-width="6"/>
    <rect x="56" y="56" width="${w - 112}" height="${h - 112}" rx="20"
          fill="none" stroke="${SAFFRON}" stroke-width="4"/>
    ${guju(1.5, 258, 315)}
    <text x="430" y="268" font-family="Georgia, serif" font-size="86" font-weight="700" fill="${INDIGO}">
      ગુજરાતી શીખો
    </text>
    <text x="430" y="342" font-family="Helvetica, Arial, sans-serif" font-size="42" font-weight="700" fill="${KEY}">
      Learn Gujarati, one sound at a time
    </text>
    <text x="430" y="404" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#6c5a42">
      47 letters · 283 words · 48 stories · 9 nursery rhymes
    </text>
    <rect x="430" y="440" width="240" height="8" rx="4" fill="${SAFFRON}"/>
  </svg>`;
}

async function write(name: string, svg: string, dir = OUT) {
  const file = path.join(dir, name);
  await sharp(Buffer.from(svg)).png().toFile(file);
  const { size } = fs.statSync(file);
  console.log(`  ✓ ${path.relative(process.cwd(), file)} (${(size / 1024).toFixed(1)} kB)`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('Drawing icons…');

  // Standard PWA icons keep a small margin; the art fills the tile.
  await write('icon-192.png', appIcon(192, 0.06));
  await write('icon-512.png', appIcon(512, 0.06));
  // Maskable icons need a 20% safe zone — launchers crop these to a circle.
  await write('icon-192-maskable.png', appIcon(192, 0.2));
  await write('icon-512-maskable.png', appIcon(512, 0.2));
  // iOS ignores WebP for apple-touch-icon and does not round-crop, so no margin.
  await write('apple-touch-icon.png', appIcon(180, 0.04));
  // Social card.
  await write('og.png', ogCard(), IMAGES);

  console.log('\nDone.');
}

void main();
