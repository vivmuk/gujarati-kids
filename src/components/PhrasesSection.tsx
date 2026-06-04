'use client';
import { useState } from 'react';
import { phrases, categoryMeta } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';

interface Props {
  phrasesLearned: string[];
  onPhraseLearned: (phrase: string) => void;
}

export function PhrasesSection({ phrasesLearned, onPhraseLearned }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('greeting');
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const categories = [...new Set(phrases.map(p => p.category))];
  const filtered = phrases.filter(p => p.category === activeCategory);

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-forest)' }}>
        <div className="flex items-center gap-3 p-4 text-white">
          <img src="/images/greeting.webp" alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
          <div>
            <p className="font-bold text-lg">Everyday Phrases</p>
            <p className="text-white/70 text-xs font-medium" style={{ fontFamily: 'var(--font-gujarati)' }}>રોજિંદા વાક્યો</p>
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
              style={isActive ? { background: meta?.color || '#0EA5E9' } : {}}>
              <span>{meta?.emoji}</span>
              <span>{meta?.label || cat}</span>
            </button>
          );
        })}
      </div>

      {/* Phrase cards */}
      <div className="space-y-3 stagger-children">
        {filtered.map((phrase, i) => {
          const id = `phrase-${phrase.gujarati}`;
          const isLearned = phrasesLearned.includes(phrase.gujarati);
          const isPlaying = currentlyPlaying === id;
          return (
            <div key={i} className={`glass-card-strong p-4 ${isLearned ? 'border-emerald-200 bg-emerald-50/50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{phrase.gujarati}</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">{phrase.roman}</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{phrase.english}</p>
                </div>
                <button onClick={() => { speak(phrase.gujarati, id); if (!isLearned) onPhraseLearned(phrase.gujarati); }}
                  className="speak-btn w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: isPlaying ? 'var(--saffron-200)' : 'var(--gradient-saffron)', color: isPlaying ? 'var(--saffron-700)' : 'white' }}>
                  <SpeakIcon id={id} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
