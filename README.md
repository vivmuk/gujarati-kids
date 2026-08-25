# ગુજરાતી શીખો — Learn Gujarati for Kids 🪷

A beautiful, interactive web app for kids (ages 4–12) to learn Gujarati using AI-powered **speech**, **images**, and **conversation**. Built on **Krashen's Comprehensible Input / Natural Approach** methodology — listen first, understand through context, then speak. No pressure, just fun! 🎉

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Venice AI](https://img.shields.io/badge/Powered%20by-Venice%20AI-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Alphabet
- **13 swar (vowels)** and **34 vyanjan (consonants)**, each with its own audio and illustration
- Every letter has an example word in Gujarati, romanisation, and English
- Two practice modes per letter: **listen**, and **trace** it with a finger
- Hold the mic to say it back and get a gentle three-star read

Retroflex letters carry IAST diacritics (ટ `ṭa`, ઠ `ṭha`, ડ `ḍa`, ઢ `ḍha`,
ણ `ṇa`, ષ `ṣa`, ળ `ḷa`) so they no longer collide with the dental row — which
had been making seven letters show the wrong picture and play the wrong sound.

### Vocabulary
- **283 words** across 10 groups: animals, fruit, colours, body, family, food,
  nature, numbers, festivals, and Surat
- Each group has its own ink and its own drawn mark
- Every word has audio and an illustration; tap a card for a swipeable deck

### Phrases
- **20+ essential phrases**: Greetings, Questions, Daily Use, Polite Expressions, Emotions
- **3 difficulty levels** (i, i+1, i+2) based on Comprehensible Input theory
- Listen & repeat approach — hear first, then speak

### Stories and nursery rhymes
- **48 bilingual stories**, including familiar Indian children's-book classics
- **9 balgeet (nursery rhymes)** — ચક્કીબેન, એક બિલાડી જાડી, મામાનું ઘર કેટલે,
  હાથીભાઈ તો જાડા, આવ રે વરસાદ, વારતા રે વારતા, ચાંદો સૂરજ, અડકો દડકો, તાળી પાડો —
  each with a sing-along that highlights the line being sung
- **Narrated story films**: a title shot, one animated shot per story line held
  for exactly as long as its Gujarati narration, and a closing moral card
- Comprehensible Input stories: understand Gujarati from context
- Simple bilingual lines and clear morals for each lesson
- Tap the story title or individual lines to hear audio

### Quiz
- Dynamic quiz generator for Letters, Words, and Phrases
- **3 difficulty levels** with randomized questions
- Confetti animation on good scores! 🎊
- Track stars earned across sessions

### ગુજુ (Guju), the AI tutor
- Chat with Guju, your friendly Gujarati-speaking AI tutor
- **Voice input**: Press & hold the mic button to speak in Gujarati or English
- **Voice output**: Tap 🔊 to hear Guju's responses
- Learn about culture: Navratri, Uttarayan, Dhokla, Garba, and more
- Starter and follow-up prompt chips that get gradually harder over the conversation

### Progress
- Track letters, words, phrases, and stories learned
- Earn badges as you progress: 🚀 → 🌱 → 🎯 → 🌟 → 🏆
- Quiz accuracy stats
- Progress persists in localStorage

## 🧠 Learning Method

Based on **Stephen Krashen's Natural Approach**:

1. **Comprehensible Input (i+1)**: Content is slightly above current level
2. **Low Anxiety**: No penalty for mistakes — gentle correction by repeating the right way
3. **Meaningful Context**: Learn through stories, cultural references, and real conversations
4. **Listening First**: Hear sounds before attempting to speak (audio-first design)
5. **Play-Based**: Quizzes, animations, and achievements keep kids engaged
6. **Retrieval + Spacing**: Guju recommends follow-up prompts that review, interleave, and add one harder step

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS with custom animations
- **Fonts**: Noto Sans Gujarati + Space Grotesk
- **AI Engine**: [Venice.ai API](https://venice.ai)
  - **TTS**: `tts-xai-v1` (eve voice, `language: 'gu'` for proper Gujarati pronunciation)
  - **STT**: `openai/whisper-large-v3` (Guju voice input transcription, with Gujarati `language: 'gu'` hint)
  - **Chat**: `openai-gpt-4o-mini-2024-07-18` (fast bilingual tutor through Venice)
  - **Image Gen**: `grok-imagine-image-quality` (Riso-Folk Gujarati folk style, safe mode)
  - **Video Gen**: `seedance-2-0-fast-reference-to-video` (short square animations from generated lesson images)
- **Data**: 400+ curated Gujarati learning items, every one backed by a
  pre-generated audio file and illustration on disk

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Venice.ai](https://venice.ai) API key

### Installation

```bash
# Clone the repo
git clone https://github.com/vivmuk/gujarati-kids.git
cd gujarati-kids

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your Venice API key
```

### Environment Variables

```env
VENICE_API_KEY=your_venice_api_key_here
VENICE_BASE_URL=https://api.venice.ai/api/v1
VENICE_STT_MODEL=openai/whisper-large-v3
VENICE_IMAGE_MODEL=grok-imagine-image-quality
VENICE_VIDEO_MODEL=seedance-2-0-fast-reference-to-video
```

### Run

```bash
# What is missing? (reports only, no API calls, no spend)
npx tsx scripts/audit-assets.mts
npx tsx scripts/generate-missing.mts --dry

# Fill every gap — only writes files that do not exist, so rerunning is free
npx tsx scripts/generate-missing.mts

# Build a narrated film for a story (needs ffmpeg on PATH)
npx tsx scripts/make-story-films.mts thirsty-crow hare-tortoise

# Redraw the app icons, maskable icons, and the social card (no API calls)
npx tsx scripts/make-icons.mts

# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # tts · transcribe · image · video · chat (Venice)
│   ├── globals.css             # THE design system: tokens, components, shell
│   ├── layout.tsx              # Fonts, metadata, PWA, direction contract
│   └── page.tsx                # App shell (responsive nav) + Home
├── components/
│   ├── Icon.tsx                # Authored SVG icon set — the only glyph source
│   ├── ui.tsx                  # Shared primitives (deck, play, chips, overlay…)
│   ├── RisoFolk.tsx            # Guju the mascot + Ajrakh block-print band
│   ├── AlphabetSection.tsx     # Letters, tracing, say-it-back
│   ├── WordsSection.tsx        # 283 words in 10 groups
│   ├── PhrasesSection.tsx      # 21 phrases
│   ├── StoriesSection.tsx      # 48 stories + 9 nursery rhymes + films
│   ├── QuizSection.tsx         # Generated quiz, standard and timed
│   ├── SettingsSection.tsx     # Progress, streak, Gujarat journey map
│   ├── ChatSection.tsx         # Guju, the AI tutor
│   └── use*.ts                 # speak · pronunciation · word image · sing-along
├── data/
│   ├── gujarati.ts             # All lesson data + quiz generators
│   └── assets.ts               # Slug → audio/image/video path manifest
└── lib/
    ├── venice.ts               # Venice API client wrapper
    └── streaks.ts              # Streak + belt tiers

public/
├── audio/                      # 760 pre-generated TTS files
├── images/gen/                 # 715 generated illustrations
├── images/*.webp               # Category cover art
├── icons/                      # PWA + maskable + apple-touch icons
└── videos/                     # Narrated story films

scripts/
├── audit-assets.mts            # What is expected but missing on disk
├── generate-missing.mts        # Fill every audio/image gap (preferred)
├── make-story-films.mts        # Narrated, shot-by-shot story films
├── make-icons.mts              # App icons + OG card, drawn locally
├── pregenerate.cts             # Legacy one-shot pre-generator (regex-parsed)
└── pregen-images.cts           # Legacy parallel image generator
```

## Design

The interface is a **two-colour risograph print**, the same world the 700+
generated illustrations live in — saffron `#ef5a23` and indigo `#1d3c6e` inks on
cream `#f6efdd` paper with visible fibre grain, hard 2.5px ink keylines, flat
offset second-pass shadows, halftone screens, and Ajrakh lozenge borders.

- **One token system.** `src/app/globals.css` holds every ink, space, radius,
  type step, and motion value. There is no second palette.
- **One component vocabulary.** `src/components/ui.tsx` owns the card decks,
  the play button, chips, segmented tabs, meters, overlays, and the
  say-it-back panel. A control defined there is never re-implemented inline.
- **Drawn marks, never emoji.** `src/components/Icon.tsx` is an authored SVG
  set on one 24×24 grid at 2px stroke.
- **Audio first.** Anything a child can see, they can hear in one tap.
- **Never punish.** The lowest outcome anywhere is "have another go".
- **Structurally responsive.** A phone gets a bottom tab bar and a floating
  Guju button; a tablet gets an icon rail; a desktop gets a labelled sidebar
  and multi-column content. Nothing is merely a stretched phone.
- **Motion conveys state.** Pressing anything pushes it into the paper and its
  offset ink pass collapses underneath. `prefers-reduced-motion` is honoured.

## 📄 License

MIT — feel free to use this for your own language learning projects!

---

**આવજો! ગુજરાતી શીખો!** 🙏  
*Come! Learn Gujarati!*
