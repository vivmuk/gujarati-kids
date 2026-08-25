# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are the maintainer's own children, at home, on a phone or tablet, in short
repeated daily sessions. They are returning users, not strangers: they already know what the app
is and do not need to be sold on it. A parent is frequently nearby but is not the operator — the
child taps. Reading ability is partial; Gujarati script is being learned, English is the bridge
language, and audio carries most of the meaning.

## Product Purpose

Teach Gujarati to young children (roughly ages 4–12) through Comprehensible Input: hear it first,
understand it from context and picture, then try saying it. Success is a child voluntarily opening
the app again tomorrow and being able to recognize more letters, words, and phrases over weeks.
There is no score to maximize and no penalty for being wrong.

## Positioning

Every learning item is backed by a pre-generated, on-disk asset plus native-quality Gujarati
TTS — 760 audio files and 716 illustrations covering every letter, word, phrase, story hero,
story line, and nursery-rhyme line. Nothing waits on a network call at tap time. The interface
is drawn in the same two-colour risograph world as the illustrations rather than framing them.

## Operating Context

- Sessions are short, one-handed, and interruption-tolerant; a child may leave mid-story.
- Audio is the primary channel. Every item is tappable-to-hear; text is support, not the payload.
- Content is browsed by category and by swipe far more than it is searched.
- Progress lives in `localStorage` on one device. There is no account, no sync, and no server state.
- Asset generation is an offline pipeline (`scripts/pregenerate.cts`, `scripts/pregen-images.cts`)
  run by the maintainer, not by the child at runtime.

## Capabilities and Constraints

**Content (in `src/data/gujarati.ts`)**: 47 letters (13 swar, 34 vyanjan), 283 words across 10
categories, 21 phrases across 5 categories, 48 stories with 306 total lines, 9 balgeet
(nursery rhymes), and generated quizzes for letters, words, phrases, and individual stories.

**Sections**: Home, Letters (tracing canvas + pronunciation scoring), Words, Phrases,
Stories & Balgeet (per-story quiz, sing-along, narrated films), Quiz, Guju AI chat,
Progress (Gujarat journey map, streaks, belt tiers).

**Stack**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4. No component library.

**Venice AI** is the only external service: TTS `tts-xai-v1` (voice `eve`, speed 0.9,
`language:'gu'`), STT `openai/whisper-large-v3`, chat `openai-gpt-4o-mini`, images
`grok-imagine-image-quality`, story films `grok-imagine-1-5-reference-to-video-private`.
`tts-gemini-3-1-flash` is known to 500 on Gujarati script and must not be used.

**Resolved since the first draft of this file** (do not re-report as open):
- The seven roman-slug collisions are fixed; retroflex letters carry IAST diacritics
  (ટ `ṭa`, ઠ `ṭha`, ડ `ḍa`, ઢ `ḍha`, ણ `ṇa`, ષ `ṣa`, ળ `ḷa`) and every letter has its own
  image and audio.
- `numbers` is folded into `words` and rendered as its own category.
- `categoryMeta` covers every category in the data, including `festival`.
- Every word/phrase category has cover art; balgeet have hero art and per-line audio.
- The PWA ships 192/512 icons, maskable variants, a PNG apple-touch-icon, and an OG card.
- `scripts/audit-assets.mts` reports 0 missing audio and 0 missing images across 705 slugs.

**Open**:
- **Illustration consistency.** The Riso-Folk style prefix is applied to every newly
  generated image, and those are on-world. A large share of the *older* word images
  (cow, roti, mother, hand, "red") are naturalistic or stock-like, several carry baked-in
  English+Gujarati captions that are illegible below ~120px, and at least one has an
  opaque grey ground that `.rf-art`'s paper background cannot rescue. This is the largest
  remaining gap between the interface and its content, and it is a regeneration job.
- **Story films**: 6 of 48 stories have one. The Venice account ran out of credit
  part-way through; `scripts/make-story-films.mts` caches purchased shots and resumes.
- **Quiz answer options are English/roman text and are never spoken**, so the Play tab is
  not usable by a child who cannot yet read.
- **No parent controls**: no reset progress, no audio speed, no mute.

## Brand Commitments

- Name: **ગુજરાતી શીખો** (Learn Gujarati). Gujarati script leads, English supports.
- Mascot: **ગુજુ / Guju**, a saffron-and-indigo bird drawn as inline SVG in `RisoFolk.tsx`.
- Visual identity: **Riso-Folk** — two-colour risograph, Ajrakh block-print motifs, saffron `#ef5a23`
  and indigo `#1d3c6e` inks on cream `#f6efdd`, hard ink outlines, offset flat shadows, halftone.
  This is binding: all 689 pre-generated illustrations were produced in this style, and
  `docs/STYLE_GUIDE.md` is the source of truth for the generation prompts.
- Typefaces: Noto Sans Gujarati for Gujarati, Space Grotesk for display/Latin.

## Evidence on Hand

- `public/audio/` — 760 files; every expected slug has a real file. Verified by
  `scripts/audit-assets.mts`.
- `public/images/gen/` — 716 files; complete for every expected slug.
- `public/videos/` — 6 narrated story films, of 48 stories.
- `public/images/*.webp` — cover art for all 15 word/phrase categories.
- `public/icons/` — PWA, maskable, and apple-touch icons; `public/images/og.png` social card.
- `prompts.json` — the full audit trail of every generation prompt used.
- There are no users beyond the family, no testimonials, no usage data, and no revenue. Nothing in
  this project may claim otherwise.

## Product Principles

1. **Audio is the product.** Any item a child can see, they must be able to hear in one tap.
2. **Never punish.** Wrong answers get a gentle retry, never a loss, a lockout, or a red scold.
3. **Nothing waits.** Pre-generated assets are the default path; network generation is a bonus
   that must degrade to something useful, never to a broken image or a dead button.
4. **Gujarati first, English as the handrail.** Script leads visually; roman and English support it.
5. **One coherent world.** Every screen, control, and generated illustration belongs to the same
   Riso-Folk system — no second visual language anywhere in the app.

## Accessibility & Inclusion

Users are children with partial literacy: tap targets must stay large (44px minimum, larger where
a child is the target), meaning must never depend on colour alone, and every interactive element
needs an accessible name because much of the UI is glyphs and illustrations. Motion should be
purposeful and respect `prefers-reduced-motion`.
