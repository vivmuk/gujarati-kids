'use client';
import { useState } from 'react';
import { words, categoryMeta, type WordItem } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { getWordImage, getWordAudio } from '@/data/assets';

const categoryImages: Record<string, string> = {
  animal: '/images/animal.webp', fruit: '/images/fruit.webp', color: '/images/color.webp',
  body: '/images/body.webp', family: '/images/family.webp', food: '/images/food.webp',
  nature: '/images/nature.webp', number: '/images/number.webp',
};

interface Props {
  wordsLearned: string[];
  onWordLearned: (word: string) => void;
}

export function WordsSection({ wordsLearned, onWordLearned }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('animal');
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const categories = [...new Set(words.map(w => w.category))];
  const filtered = words.filter(w => w.category === activeCategory);

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-saffron)' }}>
        <div className="flex items-center gap-3 p-4 text-white">
          <img src={categoryImages[activeCategory] || '/images/animal.webp'} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
          <div>
            <p className="font-bold text-lg">Learn Words</p>
            <p className="text-white/70 text-xs font-medium" style={{ fontFamily: 'var(--font-gujarati)' }}>શબ્દો શીખો</p>
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {categories.map(cat => {
          const meta = categoryMeta[cat];
          const isActive = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`category-chip whitespace-nowrap ${isActive ? 'active text-white' : 'bg-gray-100 text-gray-600'}`}
              style={isActive ? { background: meta?.color || 'var(--saffron-500)' } : {}}>
              <span>{meta?.emoji}</span>
              <span>{meta?.label || cat}</span>
            </button>
          );
        })}
      </div>

      {/* Word cards */}
      <div className="grid grid-cols-2 gap-3 stagger-children">
        {filtered.map((word, i) => {
          const id = `word-${word.gujarati}`;
          const isLearned = wordsLearned.includes(word.gujarati);
          const isPlaying = currentlyPlaying === id;
          const meta = categoryMeta[word.category];
          // Use the AI-generated illustration from grok-imagine (90s Indian textbook style)
          const imgPath = getWordImage(word.roman);
          return (
            <div key={i} className={`word-card ${isLearned ? 'learned' : ''} p-3.5`}>
              {imgPath && (
                <img
                  src={imgPath}
                  alt={word.english}
                  className="w-full h-20 object-cover rounded-lg mb-2"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <p className="text-xl font-black leading-tight" style={{ fontFamily: 'var(--font-gujarati)' }}>{word.gujarati}</p>
                <button onClick={() => {
                    // Use pre-generated audio if available — instant playback, no API call
                    const audioPath = getWordAudio(word.roman);
                    speak(audioPath || word.gujarati, id);
                    onWordLearned(word.gujarati);
                  }}
                  className="speak-btn w-8 h-8 rounded-full flex items-center justify-center text-xs"
                  style={{ background: isPlaying ? 'var(--saffron-200)' : `${meta?.color || '#FFA63D'}18`, color: meta?.color || '#FFA63D' }}>
                  <SpeakIcon id={id} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                </button>
              </div>
              <p className="text-xs text-gray-500 font-semibold">{word.roman}</p>
              <p className="text-sm font-bold text-gray-700 mt-0.5">{word.english}</p>
              {isLearned && <span className="absolute top-2 right-2 text-xs">✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
