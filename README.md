# ગુજરાતી શીખો — Learn Gujarati for Kids 🪷

A beautiful, interactive web app for kids (ages 4–12) to learn Gujarati using AI-powered **speech**, **images**, and **conversation**. Built on **Krashen's Comprehensible Input / Natural Approach** methodology — listen first, understand through context, then speak. No pressure, just fun! 🎉

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Venice AI](https://img.shields.io/badge/Powered%20by-Venice%20AI-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔤 Alphabet Learning
- **12 Swar (Vowels)** and **34+ Vyanjan (Consonants)** with audio pronunciation
- Each letter has an example word with Gujarati, romanization, and English meaning
- Tap any letter to hear it spoken aloud via Venice AI TTS

### 📚 Vocabulary Builder
- **70+ words** across 8 categories: Animals 🦁, Fruits 🍎, Colors 🎨, Body Parts 🤚, Family 👨‍👩‍👧‍👦, Food 🍛, Nature 🌿, Numbers 🔢
- Color-coded category badges for easy navigation
- Audio pronunciation for every word

### 💬 Phrase Practice
- **20+ essential phrases**: Greetings, Questions, Daily Use, Polite Expressions, Emotions
- **3 difficulty levels** (i, i+1, i+2) based on Comprehensible Input theory
- Listen & repeat approach — hear first, then speak

### 📖 Interactive Stories
- **30 bilingual stories**, including familiar Indian children's-book classics
- Comprehensible Input stories: understand Gujarati from context
- Simple bilingual lines and clear morals for each lesson
- Tap the story title or individual lines to hear audio

### 🎯 Quiz Game
- Dynamic quiz generator for Letters, Words, and Phrases
- **3 difficulty levels** with randomized questions
- Confetti animation on good scores! 🎊
- Track stars earned across sessions

### 🤖 ગુજુ (Guju) AI Tutor
- Chat with Guju, your friendly Gujarati-speaking AI tutor
- **Voice input**: Press & hold the mic button to speak in Gujarati or English
- **Voice output**: Tap 🔊 to hear Guju's responses
- Learn about culture: Navratri, Uttarayan, Dhokla, Garba, and more
- Starter and follow-up prompt chips that get gradually harder over the conversation

### ⭐ Progress Tracker
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
- **Data**: 200+ curated Gujarati learning items

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
# Pre-generate all TTS audio + images (one-time, ~5 min with 4 parallel workers)
VENICE_API_KEY=xxx npm run pregen

# Pre-generate only audio or only images
npm run pregen:audio
npm run pregen:images

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
│   ├── api/
│   │   ├── tts/route.ts        # Text-to-speech endpoint (xAI)
│   │   ├── transcribe/route.ts # Speech-to-text endpoint
│   │   ├── image/route.ts      # Image generation endpoint (Venice)
│   │   ├── video/route.ts      # Video generation endpoint (Venice)
│   │   └── chat/route.ts       # AI tutor chat endpoint (with inline illustrations)
│   ├── globals.css             # Custom animations & kid-friendly styles
│   ├── layout.tsx              # Root layout with Gujarati fonts
│   └── page.tsx                # Main app (all sections)
├── components/                 # Section components: Alphabet, Words, Phrases, Stories, Quiz, Chat, Progress
├── data/
│   ├── gujarati.ts             # All lesson data (letters, words, phrases, stories, quiz generator)
│   └── assets.ts               # Pre-generated audio/image path manifest
├── lib/
│   └── venice.ts               # Venice API client wrapper
└── public/
    ├── audio/                  # Pre-generated TTS audio
    └── images/gen/             # Pre-generated illustrations

scripts/
├── pregenerate.cts             # One-shot TTS + image pre-generator
└── pregen-images.cts           # Parallel image generator (4 workers for ~4x speedup)
```

## 🎨 Design Philosophy

- **Warm, saffron-inspired color palette** — reflecting Gujarati culture
- **Large tap targets** — designed for little fingers
- **Smooth animations** — float, bounce, sparkle, slide-up
- **Audio-first** — every item is listenable, reducing reading pressure
- **Visual feedback** — speaking indicator, progress bars, confetti rewards
- **Responsive** — works on phones, tablets, and desktops

## 📄 License

MIT — feel free to use this for your own language learning projects!

---

**આવજો! ગુજરાતી શીખો!** 🙏  
*Come! Learn Gujarati!*
