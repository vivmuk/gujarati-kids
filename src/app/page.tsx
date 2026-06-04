'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  swar, vyanjan, words, phrases, stories, numbers,
  categoryMeta, generateQuiz,
  type LetterItem, type WordItem, type PhraseItem, type StoryItem,
} from '@/data/gujarati';

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

// ============ CONFETTI ============
function Confetti() {
  const colors = ['#FFA63D', '#F43F5E', '#8B5CF6', '#0EA5E9', '#10B981', '#FBBF24'];
  return (
    <div className="confetti-container">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${1.5 + Math.random() * 1.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

// ============ MAIN APP ============
export default function GujaratiKidsApp() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [progress, setProgress] = useState<ProgressState>({
    lettersLearned: [], wordsLearned: [], phrasesLearned: [],
    quizScore: 0, quizTotal: 0, storiesRead: [],
  });
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gujarati-kids-progress');
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('gujarati-kids-progress', JSON.stringify(progress)); } catch {}
  }, [progress]);

  // ============ TTS ============
  const speak = useCallback(async (text: string, id: string) => {
    if (currentlyPlaying === id) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setCurrentlyPlaying(null);
      return;
    }
    try {
      setCurrentlyPlaying(id);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model: 'tts-gemini-3-1-flash', voice: 'Aoede', speed: 0.85 }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setCurrentlyPlaying(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setCurrentlyPlaying(null); };
      audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setCurrentlyPlaying(null);
    }
  }, [currentlyPlaying]);

  // ============ MARK LEARNED ============
  const markLetterLearned = useCallback((letter: string) => {
    if (!progress.lettersLearned.includes(letter)) {
      setProgress(p => ({ ...p, lettersLearned: [...p.lettersLearned, letter] }));
    }
  }, [progress.lettersLearned]);

  const markWordLearned = useCallback((word: string) => {
    if (!progress.wordsLearned.includes(word)) {
      setProgress(p => ({ ...p, wordsLearned: [...p.wordsLearned, word] }));
    }
  }, [progress.wordsLearned]);

  // ============ HOME ============
  const renderHome = () => {
    const totalItems = swar.length + vyanjan.length + words.length + phrases.length;
    const learnedCount = progress.lettersLearned.length + progress.wordsLearned.length + progress.phrasesLearned.length;
    const pct = totalItems > 0 ? Math.round((learnedCount / totalItems) * 100) : 0;

    return (
      <div className="px-4 pt-4 pb-6 space-y-5 animate-fade-in">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden" style={{ background: 'var(--gradient-warm)' }}>
          <div className="px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl animate-float">🪷</span>
              <div>
                <h1 className="text-2xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>ગુજરાતી શીખો</h1>
                <p className="text-white/80 text-sm font-semibold">Learn Gujarati — ચાલો શીખીએ!</p>
              </div>
            </div>
            <p className="text-white/70 text-xs mt-3">Meet your tutor: <span className="font-bold text-white">ગુજુ (Guju)</span> 🤖</p>
            <div className="mt-4 bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-white/70 text-xs mt-1.5 font-medium">{pct}% complete • {learnedCount}/{totalItems} items learned</p>
          </div>
          <img src="/images/home.webp" alt="" className="absolute right-0 bottom-0 w-28 h-28 object-cover opacity-30 rounded-tl-3xl" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 stagger-children">
          {[
            { id: 'alphabet' as TabId, label: 'Letters', sublabel: 'સ્વર & વ્યંજન', emoji: '🔤', gradient: 'var(--gradient-ocean)', img: '/images/alphabet.webp' },
            { id: 'words' as TabId, label: 'Words', sublabel: 'શબ્દો', emoji: '📚', gradient: 'var(--gradient-berry)', img: '/images/animal.webp' },
            { id: 'phrases' as TabId, label: 'Phrases', sublabel: 'વાક્યો', emoji: '💬', gradient: 'var(--gradient-forest)', img: '/images/greeting.webp' },
            { id: 'stories' as TabId, label: 'Stories', sublabel: 'વાર્તાઓ', emoji: '📖', gradient: 'var(--gradient-sunset)', img: '/images/story.webp' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className="relative overflow-hidden rounded-2xl p-4 text-left text-white transition-transform active:scale-95"
              style={{ background: item.gradient }}>
              <span className="text-2xl mb-2 block">{item.emoji}</span>
              <span className="font-bold text-base block">{item.label}</span>
              <span className="text-white/70 text-xs font-medium" style={{ fontFamily: 'var(--font-gujarati)' }}>{item.sublabel}</span>
              <img src={item.img} alt="" className="absolute -right-3 -bottom-3 w-20 h-20 object-cover opacity-20 rounded-xl" />
            </button>
          ))}
        </div>

        {/* Today's Word */}
        <div className="glass-card-strong p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <span className="font-bold text-sm text-gray-500 uppercase tracking-wider">Today&apos;s Word</span>
          </div>
          {(() => {
            const dayIndex = new Date().getDate() % words.length;
            const w = words[dayIndex];
            return (
              <div className="flex items-center gap-4">
                <img src={`/images/${w.category}.webp`} alt={w.english} className="w-16 h-16 rounded-2xl object-cover border-2 border-saffron-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{w.gujarati}</p>
                  <p className="text-sm text-gray-500 font-medium">{w.roman} • {w.english}</p>
                </div>
                <button onClick={() => speak(w.gujarati, `home-word`)} className="speak-btn w-12 h-12 rounded-full flex items-center justify-center text-white text-lg" style={{ background: 'var(--gradient-saffron)' }}>
                  {currentlyPlaying === `home-word` ? '⏸' : '🔊'}
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  // ============ ALPHABET ============
  const renderAlphabet = () => {
    const [subTab, setSubTab] = useState<'swar' | 'vyanjan'>('swar');
    const data = subTab === 'swar' ? swar : vyanjan;

    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in">
        {/* Sub-tabs */}
        <div className="flex gap-2 mb-4">
          {(['swar', 'vyanjan'] as const).map(t => (
            <button key={t} onClick={() => setSubTab(t)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${subTab === t ? 'text-white shadow-lg' : 'glass-card text-gray-600'}`}
              style={subTab === t ? { background: t === 'swar' ? 'var(--gradient-ocean)' : 'var(--gradient-berry)' } : {}}>
              <span style={{ fontFamily: 'var(--font-gujarati)' }}>{t === 'swar' ? 'સ્વર' : 'વ્યંજન'}</span>
              <span className="block text-xs opacity-70">{t === 'swar' ? 'Vowels' : 'Consonants'}</span>
            </button>
          ))}
        </div>

        {/* Letter Grid */}
        <div className="grid grid-cols-4 gap-2.5 stagger-children">
          {data.map((letter, i) => {
            const id = `letter-${letter.gujarati}`;
            const isLearned = progress.lettersLearned.includes(letter.gujarati);
            const isPlaying = currentlyPlaying === id;
            return (
              <button key={i} onClick={() => { speak(letter.gujarati, id); markLetterLearned(letter.gujarati); }}
                className={`letter-tile ${isLearned ? 'learned' : ''} ${isPlaying ? 'animate-pulse-glow' : ''}`}>
                <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{letter.gujarati}</span>
                <span className="text-[10px] text-gray-400 font-bold mt-0.5">{letter.roman}</span>
                {isLearned && <span className="absolute top-1 right-1 text-[10px]">✅</span>}
              </button>
            );
          })}
        </div>

        {/* Example Word */}
        <div className="glass-card-strong mt-4 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Example Words</p>
          <div className="space-y-2">
            {data.slice(0, 4).map((letter, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl font-black w-8 text-center" style={{ fontFamily: 'var(--font-gujarati)' }}>{letter.gujarati}</span>
                <span className="text-gray-300">→</span>
                <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-gujarati)' }}>{letter.example}</span>
                <span className="text-xs text-gray-400 ml-auto">{letter.exampleEnglish}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============ WORDS ============
  const renderWords = () => {
    const [activeCategory, setActiveCategory] = useState<string>('animal');
    const categories = [...new Set(words.map(w => w.category))];
    const filtered = words.filter(w => w.category === activeCategory);

    const categoryImages: Record<string, string> = {
      animal: '/images/animal.webp', fruit: '/images/fruit.webp', color: '/images/color.webp',
      family: '/images/family.webp', food: '/images/food.webp', nature: '/images/nature.webp',
      body: '/images/body.webp', number: '/images/progress.webp',
    };

    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in">
        {/* Category header with illustration */}
        <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-saffron)' }}>
          <div className="flex items-center gap-3 p-4">
            <img src={categoryImages[activeCategory] || '/images/animal.webp'} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
            <div className="text-white">
              <p className="font-bold text-lg">{categoryMeta[activeCategory]?.label || activeCategory}</p>
              <p className="text-white/70 text-xs font-medium">{filtered.length} words</p>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
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
            const isLearned = progress.wordsLearned.includes(word.gujarati);
            const isPlaying = currentlyPlaying === id;
            const meta = categoryMeta[word.category];
            return (
              <div key={i} className={`word-card ${isLearned ? 'learned' : ''} p-3.5`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xl font-black leading-tight" style={{ fontFamily: 'var(--font-gujarati)' }}>{word.gujarati}</p>
                  <button onClick={() => { speak(word.gujarati, id); markWordLearned(word.gujarati); }}
                    className="speak-btn w-8 h-8 rounded-full flex items-center justify-center text-xs"
                    style={{ background: isPlaying ? 'var(--saffron-200)' : `${meta?.color || '#FFA63D'}18`, color: meta?.color || '#FFA63D' }}>
                    {isPlaying ? '⏸' : '🔊'}
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
  };

  // ============ PHRASES ============
  const renderPhrases = () => {
    const [activeCategory, setActiveCategory] = useState<string>('greeting');
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
            const isLearned = progress.phrasesLearned.includes(phrase.gujarati);
            const isPlaying = currentlyPlaying === id;
            return (
              <div key={i} className={`glass-card-strong p-4 ${isLearned ? 'border-emerald-200 bg-emerald-50/50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{phrase.gujarati}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">{phrase.roman}</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{phrase.english}</p>
                  </div>
                  <button onClick={() => { speak(phrase.gujarati, id); if (!isLearned) setProgress(p => ({ ...p, phrasesLearned: [...p.phrasesLearned, phrase.gujarati] })); }}
                    className="speak-btn w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: isPlaying ? 'var(--saffron-200)' : 'var(--gradient-saffron)', color: isPlaying ? 'var(--saffron-700)' : 'white' }}>
                    {isPlaying ? '⏸' : '🔊'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ============ STORIES ============
  const renderStories = () => {
    const [activeStory, setActiveStory] = useState<StoryItem | null>(null);

    if (activeStory) {
      return (
        <div className="px-4 pt-4 pb-6 animate-fade-in">
          <button onClick={() => setActiveStory(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-4">
            <span>←</span> Back to stories
          </button>
          <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-sunset)' }}>
            <div className="p-5 text-white">
              <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{activeStory.titleGujarati}</p>
              <p className="text-white/70 text-sm font-medium">{activeStory.titleEnglish}</p>
            </div>
            <img src="/images/story.webp" alt="" className="absolute right-0 bottom-0 w-20 h-20 object-cover opacity-20" />
          </div>

          <div className="space-y-3 stagger-children">
            {activeStory.lines.map((line, i) => {
              const id = `story-${activeStory.id}-${i}`;
              const isPlaying = currentlyPlaying === id;
              return (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--saffron-100)', color: 'var(--saffron-700)' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{line.gujarati}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{line.roman}</p>
                      <p className="text-sm text-gray-700 mt-1">{line.english}</p>
                    </div>
                    <button onClick={() => speak(line.gujarati, id)}
                      className="speak-btn w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: isPlaying ? 'var(--saffron-200)' : 'var(--gradient-saffron)', color: isPlaying ? 'var(--saffron-700)' : 'white' }}>
                      {isPlaying ? '⏸' : '🔊'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => { speak(activeStory.lines.map(l => l.gujarati).join('. '), `story-${activeStory.id}-all`); setProgress(p => ({ ...p, storiesRead: [...new Set([...p.storiesRead, activeStory.id])] })); }}
            className="w-full mt-5 py-3.5 rounded-2xl font-bold text-white text-base"
            style={{ background: 'var(--gradient-warm)' }}>
            🔊 Listen to Full Story
          </button>
        </div>
      );
    }

    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in">
        <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-sunset)' }}>
          <div className="flex items-center gap-3 p-4 text-white">
            <img src="/images/story.webp" alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
            <div>
              <p className="font-bold text-lg">Stories</p>
              <p className="text-white/70 text-xs font-medium" style={{ fontFamily: 'var(--font-gujarati)' }}>વાર્તાઓ</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 stagger-children">
          {stories.map((story) => {
            const isRead = progress.storiesRead.includes(story.id);
            return (
              <button key={story.id} onClick={() => setActiveStory(story)}
                className={`w-full text-left glass-card-strong p-4 transition-transform active:scale-[0.98] ${isRead ? 'border-emerald-200' : ''}`}>
                <div className="flex items-center gap-4">
                  <img src="/images/story.webp" alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{story.titleGujarati}</p>
                    <p className="text-sm text-gray-500 font-medium">{story.titleEnglish}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--saffron-100)', color: 'var(--saffron-700)' }}>
                        Level {story.level === 1 ? 'i' : story.level === 2 ? 'i+1' : 'i+2'}
                      </span>
                      <span className="text-xs text-gray-400">{story.lines.length} lines</span>
                      {isRead && <span className="text-xs text-emerald-500 font-bold">✓ Read</span>}
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ============ QUIZ ============
  const renderQuiz = () => {
    const [quizType, setQuizType] = useState<'letter' | 'word' | 'phrase'>('word');
    const [quizLevel, setQuizLevel] = useState(1);
    const [questions, setQuestions] = useState<ReturnType<typeof generateQuiz> | null>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const startQuiz = () => {
      const q = generateQuiz(quizType, quizLevel, 5);
      setQuestions(q);
      setCurrentQ(0);
      setSelectedAnswer(null);
      setScore(0);
      setShowResult(false);
    };

    const handleAnswer = (idx: number) => {
      if (selectedAnswer !== null) return;
      setSelectedAnswer(idx);
      const isCorrect = idx === questions![currentQ].answer;
      if (isCorrect) {
        setScore(s => s + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      setTimeout(() => {
        if (currentQ + 1 < questions!.length) {
          setCurrentQ(c => c + 1);
          setSelectedAnswer(null);
        } else {
          setProgress(p => ({ ...p, quizScore: p.quizScore + score + (isCorrect ? 1 : 0), quizTotal: p.quizTotal + questions!.length }));
          setShowResult(true);
        }
      }, 1200);
    };

    if (showResult && questions) {
      const pct = Math.round((score / questions.length) * 100);
      return (
        <div className="px-4 pt-8 pb-6 text-center animate-bounce-in">
          <img src="/images/progress.webp" alt="" className="w-24 h-24 mx-auto rounded-3xl object-cover mb-4" />
          <h2 className="text-3xl font-black mb-2">{pct >= 80 ? '🎉 Amazing!' : pct >= 50 ? '👍 Good job!' : '💪 Keep trying!'}</h2>
          <p className="text-5xl font-black mb-2" style={{ color: pct >= 80 ? 'var(--emerald-500)' : pct >= 50 ? 'var(--amber-500)' : 'var(--rose-500)' }}>{score}/{questions.length}</p>
          <p className="text-gray-500 font-medium mb-6">{pct}% correct</p>
          <button onClick={startQuiz} className="px-8 py-3.5 rounded-2xl font-bold text-white text-base" style={{ background: 'var(--gradient-warm)' }}>
            Try Again
          </button>
        </div>
      );
    }

    if (questions) {
      const q = questions[currentQ];
      return (
        <div className="px-4 pt-4 pb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-400">Question {currentQ + 1}/{questions.length}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--saffron-600)' }}>Score: {score}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'var(--gradient-saffron)' }} />
          </div>

          <div className="glass-card-strong p-6 text-center mb-6">
            <p className="text-4xl font-black mb-2" style={{ fontFamily: 'var(--font-gujarati)' }}>{q.gujarati}</p>
            <p className="text-sm text-gray-500 font-medium">{q.question}</p>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answer;
              const isSelected = i === selectedAnswer;
              let cls = 'quiz-option';
              if (selectedAnswer !== null) {
                if (isCorrect) cls += ' correct';
                else if (isSelected) cls += ' wrong';
              } else if (isSelected) {
                cls += ' selected';
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} className={cls} disabled={selectedAnswer !== null}>
                  <span className="font-bold">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in">
        <div className="relative rounded-2xl overflow-hidden mb-5" style={{ background: 'var(--gradient-berry)' }}>
          <div className="flex items-center gap-3 p-4 text-white">
            <img src="/images/quiz.webp" alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
            <div>
              <p className="font-bold text-lg">Quiz Time!</p>
              <p className="text-white/70 text-xs font-medium" style={{ fontFamily: 'var(--font-gujarati)' }}>ક્વિઝ સમય!</p>
            </div>
          </div>
        </div>

        <div className="glass-card-strong p-5 space-y-5">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Topic</p>
            <div className="flex gap-2">
              {([['letter', '🔤 Letters'], ['word', '📚 Words'], ['phrase', '💬 Phrases']] as const).map(([type, label]) => (
                <button key={type} onClick={() => setQuizType(type as 'letter' | 'word' | 'phrase')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${quizType === type ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                  style={quizType === type ? { background: 'var(--gradient-saffron)' } : {}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Level</p>
            <div className="flex gap-2">
              {([['1', 'i — Easy'], ['2', 'i+1 — Medium'], ['3', 'i+2 — Hard']] as const).map(([lvl, label]) => (
                <button key={lvl} onClick={() => setQuizLevel(Number(lvl))}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${quizLevel === Number(lvl) ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                  style={quizLevel === Number(lvl) ? { background: 'var(--gradient-ocean)' } : {}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startQuiz} className="w-full py-4 rounded-2xl font-bold text-white text-lg" style={{ background: 'var(--gradient-warm)' }}>
            Start Quiz 🎯
          </button>
        </div>
      </div>
    );
  };

  // ============ CHAT ============
  const renderChat = () => {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
      { role: 'assistant', content: 'નમસ્તે! 🙏 I\'m ગુજુ (Guju), your Gujarati learning buddy! Ask me anything — words, phrases, grammar, or just chat in Gujarati! 🤖✨' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
      if (!input.trim() || isLoading) return;
      const userMsg = input.trim();
      setInput('');
      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
      setIsLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] }),
        });
        if (!res.ok) throw new Error('Chat failed');
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t understand that. Try again! 🙏';
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong. Try again! 🙏' }]);
      }
      setIsLoading(false);
    };

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          stream.getTracks().forEach(t => t.stop());
          try {
            const formData = new FormData();
            formData.append('file', blob, 'audio.webm');
            const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('STT failed');
            const data = await res.json();
            if (data.text) { setInput(data.text); }
          } catch { /* ignore */ }
          setIsRecording(false);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    };

    const stopRecording = () => {
      mediaRecorderRef.current?.stop();
    };

    return (
      <div className="flex flex-col h-[calc(100dvh-140px)] animate-fade-in">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-3" style={{ background: 'linear-gradient(to bottom, var(--saffron-50), transparent)' }}>
          <img src="/images/chat.webp" alt="" className="w-9 h-9 rounded-xl object-cover" />
          <div>
            <p className="font-bold text-sm">ગુજુ (Guju) 🤖</p>
            <p className="text-[10px] text-emerald-500 font-semibold">● Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3 py-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                <p className="whitespace-pre-wrap" style={{ fontFamily: msg.role === 'assistant' ? 'var(--font-gujarati)' : undefined }}>{msg.content}</p>
                {msg.role === 'assistant' && (
                  <button onClick={() => speak(msg.content, `chat-${i}`)}
                    className="mt-1.5 text-xs font-bold opacity-60 hover:opacity-100 transition-opacity">
                    🔊 Listen
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble chat-bubble-ai">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white/80 backdrop-blur-xl border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={isRecording ? stopRecording : startRecording}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {isRecording ? <><span className="recording-dot inline-block w-3 h-3 bg-white rounded-full mr-0" /></> : '🎤'}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type in English or Gujarati..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-saffron-300 focus:ring-2 focus:ring-saffron-100 transition-all"
              style={{ fontFamily: 'var(--font-display)' }}
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-all active:scale-90"
              style={{ background: 'var(--gradient-saffron)' }}>
              ➤
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ PROGRESS ============
  const renderProgress = () => {
    const letterPct = swar.length + vyanjan.length > 0 ? Math.round((progress.lettersLearned.length / (swar.length + vyanjan.length)) * 100) : 0;
    const wordPct = words.length > 0 ? Math.round((progress.wordsLearned.length / words.length) * 100) : 0;
    const phrasePct = phrases.length > 0 ? Math.round((progress.phrasesLearned.length / phrases.length) * 100) : 0;
    const quizPct = progress.quizTotal > 0 ? Math.round((progress.quizScore / progress.quizTotal) * 100) : 0;
    const overallPct = Math.round((letterPct + wordPct + phrasePct) / 3);

    const Ring = ({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) => {
      const r = (size - 8) / 2;
      const circ = 2 * Math.PI * r;
      return (
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={6} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - (circ * pct / 100)} className="progress-ring-circle" />
        </svg>
      );
    };

    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in">
        {/* Overall */}
        <div className="glass-card-strong p-6 text-center mb-5">
          <img src="/images/progress.webp" alt="" className="w-16 h-16 mx-auto rounded-2xl object-cover mb-3" />
          <div className="relative inline-block mb-3">
            <Ring pct={overallPct} color="var(--saffron-500)" size={100} />
            <span className="absolute inset-0 flex items-center justify-center text-xl font-black">{overallPct}%</span>
          </div>
          <p className="font-bold text-lg">Overall Progress</p>
          <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: 'var(--font-gujarati)' }}>એકંદર પ્રગતિ</p>
        </div>

        {/* Category progress */}
        <div className="grid grid-cols-2 gap-3 stagger-children">
          {[
            { label: 'Letters', sublabel: 'અક્ષરો', pct: letterPct, count: `${progress.lettersLearned.length}/${swar.length + vyanjan.length}`, color: 'var(--sky-500)', emoji: '🔤' },
            { label: 'Words', sublabel: 'શબ્દો', pct: wordPct, count: `${progress.wordsLearned.length}/${words.length}`, color: 'var(--violet-500)', emoji: '📚' },
            { label: 'Phrases', sublabel: 'વાક્યો', pct: phrasePct, count: `${progress.phrasesLearned.length}/${phrases.length}`, color: 'var(--emerald-500)', emoji: '💬' },
            { label: 'Quiz', sublabel: 'ક્વિઝ', pct: quizPct, count: `${progress.quizScore}/${progress.quizTotal}`, color: 'var(--amber-500)', emoji: '🎯' },
          ].map(item => (
            <div key={item.label} className="glass-card p-4 text-center">
              <div className="relative inline-block mb-2">
                <Ring pct={item.pct} color={item.color} size={60} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{item.pct}%</span>
              </div>
              <p className="font-bold text-sm">{item.emoji} {item.label}</p>
              <p className="text-xs text-gray-400 font-medium" style={{ fontFamily: 'var(--font-gujarati)' }}>{item.sublabel}</p>
              <p className="text-xs text-gray-400 mt-1">{item.count}</p>
            </div>
          ))}
        </div>

        {/* Reset */}
        <button onClick={() => { if (confirm('Reset all progress?')) { setProgress({ lettersLearned: [], wordsLearned: [], phrasesLearned: [], quizScore: 0, quizTotal: 0, storiesRead: [] }); } }}
          className="w-full mt-5 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-400 transition-all hover:border-red-200 hover:text-red-400">
          Reset Progress
        </button>
      </div>
    );
  };

  // ============ MAIN RENDER ============
  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'alphabet': return renderAlphabet();
      case 'words': return renderWords();
      case 'phrases': return renderPhrases();
      case 'stories': return renderStories();
      case 'quiz': return renderQuiz();
      case 'chat': return renderChat();
      case 'progress': return renderProgress();
    }
  };

  return (
    <div className="min-h-dvh" style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF5E8 50%, #FFECD1 100%)' }}>
      {/* Content */}
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {NAV_ITEMS.slice(0, 5).map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setMoreOpen(false); }}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </button>
          ))}
          {/* More button — click-based for mobile */}
          <div className="relative">
            <button onClick={() => setMoreOpen(m => !m)}
              className={`nav-item ${moreOpen || NAV_ITEMS.slice(5).some(n => n.id === activeTab) ? 'active' : ''}`}>
              <span className="text-xl">⋯</span>
              <span className="nav-item-label">More</span>
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[160px] z-50 animate-slide-up">
                  {NAV_ITEMS.slice(5).map(item => (
                    <button key={item.id} onClick={() => { setActiveTab(item.id); setMoreOpen(false); }}
                      className={`w-full px-4 py-3.5 text-left text-sm font-semibold flex items-center gap-3 transition-colors active:bg-saffron-50 ${activeTab === item.id ? 'text-saffron-600 bg-saffron-50' : 'text-gray-700'}`}>
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  );
}
