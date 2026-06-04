'use client';
import { useState, useEffect, useCallback } from 'react';
import { AlphabetSection } from '@/components/AlphabetSection';
import { WordsSection } from '@/components/WordsSection';
import { PhrasesSection } from '@/components/PhrasesSection';
import { StoriesSection } from '@/components/StoriesSection';
import { QuizSection } from '@/components/QuizSection';
import { ChatSection } from '@/components/ChatSection';
import { ProgressSection } from '@/components/ProgressSection';

// ============ TYPES ============
type TabId = 'home' | 'alphabet' | 'words' | 'phrases' | 'stories' | 'quiz' | 'chat' | 'progress';

interface ProgressState {
  lettersLearned: string[];
  wordsLearned: string[];
  phrasesLearned: string[];
  quizScore: number;
  quizTotal: number;
  storiesRead: string[];
}

// ============ NAV CONFIG ============
const NAV_ITEMS: Array<{ id: TabId; label: string; icon: string; img?: string }> = [
  { id: 'home', label: 'Home', icon: '🏠', img: '/images/home.webp' },
  { id: 'alphabet', label: 'Letters', icon: '🔤', img: '/images/alphabet.webp' },
  { id: 'words', label: 'Words', icon: '📚', img: '/images/animal.webp' },
  { id: 'phrases', label: 'Phrases', icon: '💬', img: '/images/greeting.webp' },
  { id: 'stories', label: 'Stories', icon: '📖', img: '/images/story.webp' },
  { id: 'quiz', label: 'Quiz', icon: '🎯', img: '/images/quiz.webp' },
  { id: 'chat', label: 'Guju AI', icon: '🤖', img: '/images/chat.webp' },
  { id: 'progress', label: 'Progress', icon: '⭐', img: '/images/progress.webp' },
];

const DEFAULT_PROGRESS: ProgressState = {
  lettersLearned: [],
  wordsLearned: [],
  phrasesLearned: [],
  quizScore: 0,
  quizTotal: 0,
  storiesRead: [],
};

// ============ MAIN APP ============
export default function GujaratiApp() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gujarati-progress');
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
  }, []);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem('gujarati-progress', JSON.stringify(progress));
    } catch {}
  }, [progress]);

  const markLetterLearned = useCallback((letter: string) => {
    setProgress(p => p.lettersLearned.includes(letter) ? p : { ...p, lettersLearned: [...p.lettersLearned, letter] });
  }, []);
  const markWordLearned = useCallback((word: string) => {
    setProgress(p => p.wordsLearned.includes(word) ? p : { ...p, wordsLearned: [...p.wordsLearned, word] });
  }, []);
  const markPhraseLearned = useCallback((phrase: string) => {
    setProgress(p => p.phrasesLearned.includes(phrase) ? p : { ...p, phrasesLearned: [...p.phrasesLearned, phrase] });
  }, []);

  // ============ HOME ============
  const renderHome = () => (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6" style={{ background: 'var(--gradient-ocean)' }}>
        <div className="p-6 text-white text-center">
          <p className="text-5xl mb-3">🇮🇳</p>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-gujarati)' }}>ગુજરાતી</h1>
          <p className="text-white/80 text-lg font-semibold">Learn Gujarati!</p>
          <p className="text-white/60 text-sm mt-1" style={{ fontFamily: 'var(--font-gujarati)' }}>ગુજરાતી શીખો — રમત-રમતમાં!</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-black" style={{ color: 'var(--saffron-600)' }}>{progress.lettersLearned.length}</p>
          <p className="text-[10px] font-bold text-gray-500">Letters</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-black" style={{ color: 'var(--saffron-600)' }}>{progress.wordsLearned.length}</p>
          <p className="text-[10px] font-bold text-gray-500">Words</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-black" style={{ color: 'var(--saffron-600)' }}>{progress.phrasesLearned.length}</p>
          <p className="text-[10px] font-bold text-gray-500">Phrases</p>
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-2 gap-3">
        {NAV_ITEMS.filter(n => n.id !== 'home' && n.id !== 'progress').map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className="glass-card p-4 text-left hover:shadow-lg transition-all active:scale-95 group">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            {item.img && <img src={item.img} alt="" className="w-full h-16 object-cover rounded-lg opacity-70" />}
          </button>
        ))}
      </div>
    </div>
  );

  // ============ CONTENT ============
  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'alphabet': return <AlphabetSection onLetterLearned={markLetterLearned} />;
      case 'words': return <WordsSection wordsLearned={progress.wordsLearned} onWordLearned={markWordLearned} />;
      case 'phrases': return <PhrasesSection phrasesLearned={progress.phrasesLearned} onPhraseLearned={markPhraseLearned} />;
      case 'stories': return <StoriesSection />;
      case 'quiz': return <QuizSection onQuizComplete={(s, t) => setProgress(p => ({ ...p, quizScore: p.quizScore + s, quizTotal: p.quizTotal + t }))} />;
      case 'chat': return <ChatSection />;
      case 'progress': return <ProgressSection progress={progress} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {activeTab !== 'home' && (
              <button onClick={() => setActiveTab('home')} className="text-gray-500 hover:text-gray-800 transition-colors mr-1">←</button>
            )}
            <span className="text-xl font-black" style={{ color: 'var(--saffron-600)' }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.icon} {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </span>
          </div>
          <button onClick={() => setActiveTab('progress')} className="text-sm font-bold text-amber-600">
            {progress.wordsLearned.length} ✅
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto pb-24">
        {renderContent()}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-t border-gray-100">
        <div className="max-w-lg mx-auto flex">
          {NAV_ITEMS.slice(0, 5).map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-colors ${activeTab === item.id ? 'text-amber-600' : 'text-gray-400'}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
