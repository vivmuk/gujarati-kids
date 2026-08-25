# Image & Audio Style Guide

This document is the **source of truth** for the visual + audio style used in ગુજરાતી શીખો. Every image and audio file in the app is generated using the rules below. If you want to make additional edits while keeping the same look-and-feel, follow the patterns in this file.

> **TL;DR** — All images use `grok-imagine-image-quality` with a single global *style prefix* prepended to every prompt. All audio uses `tts-xai-v1` with the `eve` voice and `language: "gu"` ISO hint. To change style globally, edit the constants in the four files listed in [§ 6](#6-changing-the-global-style).

---

## 1. Visual style

**Theme:** Riso-Folk Gujarati learning art — two-colour risograph print personality, Ajrakh-inspired block-print accents, saffron and indigo inks, 1990s Indian textbook clarity, soft paper texture, and a light cream/white background. Subjects should be centered with generous padding so the full object or character remains visible.

The exact style prefix (prepended to every image prompt) is:

```
Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents,
garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook
clarity, clean line art, soft paper texture, light cream or white background,
centered composition with the full subject visible and generous padding, no
cropping:
```

**Why this matters:** every prompt sent to the image API must start with this prefix, or the generated image will drift away from the app's visual identity.

## 2. Audio style

- **TTS model:** `tts-xai-v1`
- **Voice:** `eve`
- **Speed:** `0.9` (slightly slower for kids)
- **Language hint:** `gu` (ISO 639-1 — *critical* for accurate Gujarati pronunciation; without it, xAI guesses the script and mangles diacritics)
- **Format:** `mp3`
- **STT model:** `openai/whisper-large-v3` for Guju voice input, with `language: "gu"` sent as a Gujarati hint.

For Latin-script text (English words, story titles, etc.) the language hint is `en` so the TTS picks a natural English voice instead of trying to read Latin as Gujarati.

## 3. Generation parameters

| Setting | Value |
|---|---|
| Image model | `grok-imagine-image-quality` |
| Aspect ratio | `1:1` |
| Format | `webp` (grok-imagine actually returns JPEG; we re-encode via `sharp`) |
| `safe_mode` | `true` |
| `return_binary` | `false` (we receive base64 in JSON) |
| TTS model | `tts-xai-v1` |
| TTS voice | `eve` |
| TTS speed | `0.9` |
| TTS language | `gu` (Gujarati script) or `en` (Latin script) |
| STT model | `openai/whisper-large-v3` |
| STT language | `gu` |
| Video model | `seedance-2-0-fast-reference-to-video` |
| Video duration | `4s` |
| Video resolution | `480p`, `1:1`, audio disabled |

## 4. Prompt templates by category

There are **five prompt templates** — one per data shape. Every image in the app is generated using one of these, with the data fields interpolated and the style prefix prepended.

### 4a. Letters (`swar` + `vyanjan` arrays)

```
[STYLE_PREFIX] a {exampleEnglish} (for Gujarati letter {gujarati} = "{roman}"),
simple labeled educational illustration
```

**Example (full prompt actually sent to the API):**

> Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents, garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook clarity, clean line art, soft paper texture, light cream or white background, centered composition with the full subject visible and generous padding, no cropping: **a pomegranate (for Gujarati letter અ = "a"), simple labeled educational illustration**

### 4b. Words

```
[STYLE_PREFIX] a {english_lower} ({gujarati}), labeled with both English and
Gujarati text, educational vocabulary illustration
```

**Example:**

> Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents, garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook clarity, clean line art, soft paper texture, light cream or white background, centered composition with the full subject visible and generous padding, no cropping: **a cow (ગાય), labeled with both English and Gujarati text, educational vocabulary illustration**

### 4c. Phrases

```
[STYLE_PREFIX] illustration of "{english}" concept, person saying "{gujarati}",
labeled bilingual educational illustration
```

**Example:**

> Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents, garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook clarity, clean line art, soft paper texture, light cream or white background, centered composition with the full subject visible and generous padding, no cropping: **illustration of "Hello" concept, person saying "નમસ્તે", labeled bilingual educational illustration**

### 4d. Story hero (one per story)

```
[STYLE_PREFIX] wordless illustration for children's story "{titleEnglish}",
Indian village scene, warm and inviting, no text, no letters, no labels,
no captions, no speech bubbles
```

### 4e. Story line (one per story sentence)

```
[STYLE_PREFIX] wordless illustration of: {english}, Gujarati story scene,
simple and clear for children, no text, no letters, no labels, no captions,
no speech bubbles
```

**Example:**

> Two-colour risograph Gujarati folk illustration, Ajrakh block-print accents, garba textile rhythm, saffron and indigo ink, hand-drawn 1990s Indian textbook clarity, clean line art, soft paper texture, light cream or white background, centered composition with the full subject visible and generous padding, no cropping: **illustration of: A mouse ran., Gujarati story scene, simple and clear for children**

## 5. AI chat illustrations

The `/api/chat` route triggers `/api/image`, which uses `grok-imagine-image-quality` with the same style prefix. When the LLM decides an image would help the child learn, it returns a short image prompt in its structured response; the image route prepends the style prefix and generates the illustration. Chat illustrations can then be sent to `/api/video` to produce a short square lesson animation.

**Chat prompt template:**

```
[STYLE_PREFIX] {image_prompt_from_llm}
```

The LLM is instructed to write short (≤20 word) image prompts describing one clear subject — see `src/app/api/chat/route.ts` for the system prompt that controls this. The same chat contract also returns silent `FOLLOWUP:` lines; the UI parses them into progressive prompt chips instead of showing or reading the marker text.

## 6. Changing the global style

The style prefix lives in **four files**. To re-skin the app, edit the `STYLE_PREFIX` constant (or its inline equivalent) in all four:

| File | Constant | Notes |
|---|---|---|
| `scripts/pregenerate.cts` | `STYLE_PREFIX` (in `generateImage()`) | Used by the one-shot pregen script |
| `scripts/pregen-images.cts` | `STYLE_PREFIX` (top of file) | Used by the parallel image pregen |
| `src/app/api/image/route.ts` | inline in the `prompt:` field | Used by the on-demand image API |
| `src/lib/venice.ts` | inline in `veniceImageGenerate()` | Used by shared Venice image client calls |

**TTS settings** (model, voice, language hint) live in:

| File | Notes |
|---|---|
| `scripts/pregenerate.cts` | `generateAudio()` body |
| `scripts/pregenerate.cts` | (audio section near top of `main()`) |
| `src/lib/venice.ts` | `veniceTTS()` defaults |
| `src/app/api/tts/route.ts` | dynamic TTS endpoint for chat messages |

## 7. Slug conventions

Every audio file, image file, and asset lookup uses the same slug scheme so they stay in sync:

| Data | Slug pattern | Audio | Image |
|---|---|---|---|
| Letter | `letter-{roman}` | `/audio/letter-{roman}.mp3` | `/images/gen/letter-{roman}.webp` |
| Word | `word-{roman}` | `/audio/word-{roman}.mp3` | `/images/gen/word-{roman}.webp` |
| Phrase | `phrase-{roman_slug}` | `/audio/phrase-{roman_slug}.mp3` | `/images/gen/phrase-{roman_slug}.webp` |
| Story hero | `story-{id}` | `/audio/story-{id}-title.mp3` | `/images/gen/story-{id}.webp` |
| Story line | `story-{id}-line{i}` | `/audio/story-{id}-line{i}.mp3` | `/images/gen/story-{id}-line{i}.webp` |

**Phrase slug rule:** lower-case the roman, replace runs of non-alphanumeric with `-`, trim leading/trailing `-`. Example: `marun naam ___ chhe` → `marun-naam-chhe`.

### Slug collisions — resolved

Seven Gujarati letters used to share a roman slug with another letter, so only
one image and one audio file was ever generated for each pair. The other letter
of the pair silently displayed the wrong picture and played the wrong sound.

The retroflex letters now carry IAST diacritics in their `roman` field, which
both fixes the slug and is the more accurate transliteration for a learner:

| Letter | Was | Now | Example |
|---|---|---|---|
| ટ | `ta` | `ṭa` | ટમેટા, tomato |
| ઠ | `tha` | `ṭha` | ઠંડા, cold |
| ડ | `da` | `ḍa` | ડુક્કર, pig |
| ઢ | `dha` | `ḍha` | ઢોલ, drum |
| ણ | `na` | `ṇa` | ણગણ, count |
| ષ | `sha` | `ṣa` | ષટકોણ, hexagon |
| ળ | `la` | `ḷa` | ળવવું, to take |

The dental row keeps its plain slugs (ત `ta`, થ `tha`, દ `da`, ધ `dha`,
ન `na`, શ `sha`, લ `la`) and its existing files. Every one of the 47 letters
now has its own image and its own audio.

**If you add a letter, check its `roman` is unique** across `swar` + `vyanjan`
before generating. `npx tsx scripts/audit-assets.mts` reports any expected slug
with no file on disk, which is how a collision now surfaces.

### Balgeet slugs

Nursery rhymes follow the story pattern:

| Data | Slug | Audio | Image |
|---|---|---|---|
| Song title | `balgeet-{id}-title` | `/audio/balgeet-{id}-title.mp3` | — |
| Song line | `balgeet-{id}-line{i}` | `/audio/balgeet-{id}-line{i}.mp3` | — |
| Song hero | `balgeet-{id}` | — | `/images/gen/balgeet-{id}.webp` |

### Category cover art

Each word/phrase category has a hero image at `/images/{category}.webp`, used by
the section headers. These sit outside `/images/gen/` because they are one per
category rather than one per item.

## 8. Adding a new letter, word, phrase, or story

The pregenerate script reads the data from `src/data/gujarati.ts` and re-derives every slug. To add a new item:

1. **Edit `src/data/gujarati.ts`** — append your item to the appropriate array (`swar`, `vyanjan`, `words`, `phrases`, or `stories`). Follow the TypeScript interface at the top of each array.
2. **Run the gap filler.** It imports `src/data/gujarati.ts` directly and only
   writes files that are missing, so rerunning it is free:

   ```bash
   npx tsx scripts/generate-missing.mts --dry   # report the gaps, generate nothing
   npx tsx scripts/generate-missing.mts         # fill every gap
   npx tsx scripts/generate-missing.mts --audio # audio gaps only
   ```

   `scripts/pregenerate.cts` still exists but parses the data file with a regex
   and does not know about balgeet or category covers. Prefer the script above.

3. **Use the same prompt template** for the new item (see [§ 4](#4-prompt-templates-by-category)). The pregen script applies the correct template automatically based on which array the item lives in.

4. **Commit the new audio/image files** so they're available in production:

   ```bash
   git add public/audio/ public/images/gen/
   git commit -m "feat: add <item>"
   ```

The `useSpeak` hook and section components (`AlphabetSection`, `WordsSection`, `PhrasesSection`, `StoriesSection`) automatically pick up the new asset via `getLetterAudio`, `getWordImage`, etc. — no code changes needed.

## 9. Regenerating everything from scratch

To wipe the assets and re-generate from scratch (e.g., after changing the style prefix):

```bash
rm -rf public/audio/ public/images/gen/
npx tsx scripts/pregenerate.cts
```

For faster image regeneration, use the 4-worker parallel variant:

```bash
# Manually launch 4 workers
npx tsx scripts/pregen-images.cts 0 4 &
npx tsx scripts/pregen-images.cts 1 4 &
npx tsx scripts/pregen-images.cts 2 4 &
npx tsx scripts/pregen-images.cts 3 4 &
wait
```

This shaves ~75% off wall-clock time (4-5 minutes vs ~15-20 minutes serial).

## 10. Adding a new data category

If you introduce a new data type (e.g., "verbs" or "shapes") in `src/data/gujarati.ts`:

1. Add the new array with a TypeScript interface (mirror the existing ones).
2. Add a prompt template in **all four style-prefix files** (see [§ 6](#6-changing-the-global-style)) and the prompt generation logic in both pregen scripts.
3. Add a `getXxxAudio()` / `getXxxImage()` helper in `src/data/assets.ts` and wire the slug into the `audioPaths` / `imagePaths` maps.
4. Build a section component (or extend an existing one) that calls those helpers.
5. Add the new data to the manifest emission loop in both pregen scripts.
6. Run pregen and commit.

The `prompts.json` file at the repo root contains the complete machine-readable audit trail of every prompt that was used to generate the current assets — use it as a reference when adding new categories.

## 11. Reference: file locations

| Concern | File |
|---|---|
| Data shapes (letters, words, phrases, stories) | `src/data/gujarati.ts` |
| Asset slug manifest (audio + image paths) | `src/data/assets.ts` |
| On-demand image generation (used by AI chat) | `src/app/api/image/route.ts` |
| AI chat route (with inline illustrations) | `src/app/api/chat/route.ts` |
| TTS endpoint (dynamic, for chat messages) | `src/app/api/tts/route.ts` |
| Venice API client wrapper | `src/lib/venice.ts` |
| Asset gap filler (preferred) | `scripts/generate-missing.mts` |
| Asset audit (what is missing) | `scripts/audit-assets.mts` |
| Narrated story films | `scripts/make-story-films.mts` |
| App + PWA icons, OG card | `scripts/make-icons.mts` |
| Audio pregen (legacy, regex-parsed) | `scripts/pregenerate.cts` |
| Image pregen (parallel, 4 workers) | `scripts/pregen-images.cts` |
| Complete prompt audit trail | `prompts.json` |
| Pre-generated audio files | `public/audio/*.mp3` |
| Pre-generated image files | `public/images/gen/*.webp` |
