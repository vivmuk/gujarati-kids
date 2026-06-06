'use client';
import { useState, useEffect } from 'react';
import { swar, vyanjan, words, phrases, stories } from '@/data/gujarati';
import { HalftoneOverlay } from './RisoFolk';
import { getStreakData, getBeltForPercentage, updateStreak, type StreakData } from '@/lib/streaks';

interface ProgressState {
  lettersLearned: string[];
  wordsLearned: string[];
  phrasesLearned: string[];
  quizScore: number;
  quizTotal: number;
  storiesRead: string[];
}

const GUJARAT_MAP = [
  { id: 'ahmedabad', name: 'Ahmedabad', gujarati: 'અમદાવાદ', icon: '🏙️', req: 0, desc: 'Starting point! Sabarmati Ashram.' },
  { id: 'surat', name: 'Surat', gujarati: 'સુરત', icon: '💎', req: 20, desc: 'Diamond city & delicious Locho!' },
  { id: 'vadodara', name: 'Vadodara', gujarati: 'વડોદરા', icon: '🏛️', req: 40, desc: 'Cultural capital & Garba.' },
  { id: 'rajkot', name: 'Rajkot', gujarati: 'રાજકોટ', icon: '🎨', req: 60, desc: 'Colors of Saurashtra.' },
  { id: 'kutch', name: 'Kutch', gujarati: 'કચ્છ', icon: '🏜️', req: 80, desc: 'White Desert & Rann Utsav.' },
  { id: 'gir', name: 'Gir Forest', gujarati: 'ગીર જંગલ', icon: '🦁', req: 100, desc: 'Home of the Asiatic Lion!' },
];

export function ProgressSection({ progress }: { progress: ProgressState }) {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, lastLoginDate: null, bestStreak: 0 });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setStreak(updateStreak());
  }, []);

  const totalLetters = swar.length + vyanjan.length;
  const totalWords = words.length;
  const totalPhrases = phrases.length;
  const totalStories = stories.length;

  const letterPct = Math.round((progress.lettersLearned.length / totalLetters) * 100);
  const wordPct = Math.round((progress.wordsLearned.length / totalWords) * 100);
  const phrasePct = Math.round((progress.phrasesLearned.length / totalPhrases) * 100);
  const storyPct = Math.round((progress.storiesRead.length / totalStories) * 100);
  const quizPct = progress.quizTotal > 0 ? Math.round((progress.quizScore / progress.quizTotal) * 100) : 0;

  const items = [
    { label: 'Letters', emoji: '🔤', pct: letterPct, count: progress.lettersLearned.length, total: totalLetters, color: '#3B82F6' },
    { label: 'Words', emoji: '📚', pct: wordPct, count: progress.wordsLearned.length, total: totalWords, color: '#F59E0B' },
    { label: 'Phrases', emoji: '💬', pct: phrasePct, count: progress.phrasesLearned.length, total: totalPhrases, color: '#10B981' },
    { label: 'Stories', emoji: '📖', pct: storyPct, count: progress.storiesRead.length, total: totalStories, color: '#8B5CF6' },
    { label: 'Quiz', emoji: '🎯', pct: quizPct, count: progress.quizScore, total: progress.quizTotal, color: '#EF4444' },
  ];

  const overall = items.reduce((s, i) => s + i.pct, 0) / items.length;
  const belt = getBeltForPercentage(overall);

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--rf-indigo)', border: 'var(--rf-border)', boxShadow: 'var(--rf-shadow-saffron)' }}>
        <HalftoneOverlay alpha={0.1} size={7} />
        <div className="relative flex items-center gap-3 p-4 text-white">
          <img src="/images/progress.webp" alt="" className="w-14 h-14 rounded-xl object-contain border-2 border-white/30" />
          <div>
            <p className="font-bold text-lg">Your Progress</p>
            <p className="text-white/70 text-sm">See how much you've learned!</p>
          </div>
        </div>
      </div>

      {/* Streak Banner */}
      <div className="rf-card p-3 mb-4 flex items-center justify-between" style={{ boxShadow: 'var(--rf-shadow-saffron)', border: '2px solid var(--rf-saffron)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">🔥</span>
          <div>
            <p className="font-black text-sm text-orange-600">Day {streak.currentStreak} Streak!</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Best: {streak.bestStreak} days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-500">Keep learning daily</p>
        </div>
      </div>

      {/* Level badge */}
      <div className="rf-card p-5 text-center mb-4" style={{ boxShadow: 'var(--rf-shadow-indigo)' }}>
        <div className="mb-2">
          <span className={`inline-block px-4 py-1.5 rounded-full font-black text-sm tracking-wide shadow-sm ${belt.color}`}>
            {belt.name}
          </span>
        </div>
        <p className="text-3xl mb-1">{overall < 20 ? '🌱' : overall < 50 ? '🌿' : overall < 80 ? '🌳' : '🏆'}</p>
        <p className="text-sm text-gray-500 font-bold mt-2">{Math.round(overall)}% to next belt!</p>
      </div>

      {/* Map Unlock System */}
      <div className="mb-6 relative pb-4">
        <h3 className="font-black text-xl mb-4 text-center" style={{ color: 'var(--rf-indigo)' }}>Gujarat Journey</h3>
        <div className="absolute left-8 top-12 bottom-0 w-1.5 bg-gray-200 rounded-full" />
        
        <div className="space-y-6 relative z-10">
          {GUJARAT_MAP.map((city, idx) => {
            const isUnlocked = overall >= city.req;
            const isNext = !isUnlocked && (idx === 0 || overall >= GUJARAT_MAP[idx - 1].req);
            
            return (
              <div key={city.id} className={`flex items-start gap-4 transition-all ${isUnlocked ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 z-10 ${isUnlocked ? 'bg-white border-green-500' : isNext ? 'bg-amber-100 border-amber-400 animate-pulse' : 'bg-gray-100 border-gray-300'}`}>
                  <span className="text-xl">{isUnlocked ? city.icon : isNext ? '📍' : '🔒'}</span>
                </div>
                <div className={`rf-card p-3 flex-1 ${isNext ? 'ring-2 ring-amber-400' : ''}`} style={{ boxShadow: isUnlocked ? 'var(--rf-shadow-indigo)' : 'none', border: isUnlocked ? 'var(--rf-border)' : '2px solid #e5e7eb' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{city.name}</h4>
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-gujarati)' }}>{city.gujarati}</p>
                    </div>
                    {!isUnlocked && (
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-lg text-gray-500">
                        {city.req}% req
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">{city.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-3 rounded-2xl bg-gray-100 font-bold text-gray-600 mb-4 transition-colors hover:bg-gray-200"
      >
        {showDetails ? 'Hide Detailed Stats' : 'Show Detailed Stats'}
      </button>

      {/* Progress bars */}
      {showDetails && (
        <div className="space-y-3 animate-fade-in">
          {items.map(item => (
            <div key={item.label} className="rf-card p-3" style={{ boxShadow: 'var(--rf-shadow-saffron)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm">{item.emoji} {item.label}</span>
                <span className="text-xs text-gray-500">{item.count}/{item.total}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
