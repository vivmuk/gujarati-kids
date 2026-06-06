'use client';

import { useCallback, useEffect, useMemo, useState, useRef, type MouseEvent } from 'react';
import { AlphabetSection } from '@/components/AlphabetSection';
import { WordsSection } from '@/components/WordsSection';
import { PhrasesSection } from '@/components/PhrasesSection';
import { StoriesSection } from '@/components/StoriesSection';
import { QuizSection } from '@/components/QuizSection';
import { ChatSection } from '@/components/ChatSection';
import { ProgressSection } from '@/components/ProgressSection';
import { BlockPrintBand, Guju, HalftoneOverlay, PlayTriangleIcon, ProgressRing, Starburst } from '@/components/RisoFolk';
import { useSpeak } from '@/components/useSpeak';
import { swar, vyanjan, words, categoryMeta, type LetterItem, type WordItem } from '@/data/gujarati';
import { getLetterAudio, getLetterImage, getWordImage } from '@/data/assets';

type TabId = 'home' | 'alphabet' | 'words' | 'phrases' | 'stories' | 'quiz' | 'chat' | 'progress';
type LessonPointer = { type: 'letter' | 'word' | 'phrase' | 'story'; id: string };

interface ProgressState {
  lettersLearned: string[];
  wordsLearned: string[];
  phrasesLearned: string[];
  quizScore: number;
  quizTotal: number;
  storiesRead: string[];
  streakDays: number;
  lastActiveDate: string;
  lastLesson?: LessonPointer;
}

const ALL_LETTERS = [...swar, ...vyanjan];
const TOTAL_LETTERS = ALL_LETTERS.length;

const DEFAULT_PROGRESS: ProgressState = {
  lettersLearned: [],
  wordsLearned: [],
  phrasesLearned: [],
  quizScore: 0,
  quizTotal: 0,
  storiesRead: [],
  streakDays: 0,
  lastActiveDate: '',
};

const SECTION_TILES: Array<{ id: Exclude<TabId, 'home' | 'progress'>; gu: string; en: string; sub: string }> = [
  { id: 'alphabet', gu: 'કક્કો', en: 'Letters', sub: 'સ્વર · વ્યંજન' },
  { id: 'words', gu: 'શબ્દો', en: 'Words', sub: '9 categories · Surat' },
  { id: 'phrases', gu: 'વાક્યો', en: 'Phrases', sub: 'Say it out loud' },
  { id: 'stories', gu: 'વાર્તા', en: 'Stories', sub: 'Read along' },
  { id: 'quiz', gu: 'રમત', en: 'Quiz', sub: 'Play & win stars' },
  { id: 'chat', gu: 'ગુજુ', en: 'Ask Guju', sub: 'Your tutor' },
];

const TAB_META: Record<TabId, { gu: string; en: string }> = {
  home: { gu: 'ઘર', en: 'Home' },
  alphabet: { gu: 'કક્કો', en: 'Letters' },
  words: { gu: 'શબ્દો', en: 'Words' },
  phrases: { gu: 'વાક્યો', en: 'Phrases' },
  stories: { gu: 'વાર્તા', en: 'Stories' },
  quiz: { gu: 'રમત', en: 'Quiz' },
  chat: { gu: 'ગુજુ', en: 'Guju' },
  progress: { gu: 'પ્રગતિ', en: 'Progress' },
};

const BOTTOM_TABS: Array<{ id: 'home' | 'alphabet' | 'quiz' | 'chat'; gu: string; en: string }> = [
  { id: 'home', gu: 'ઘર', en: 'Home' },
  { id: 'alphabet', gu: 'શીખો', en: 'Learn' },
  { id: 'quiz', gu: 'રમો', en: 'Play' },
  { id: 'chat', gu: 'ગુજુ', en: 'Guju' },
];

const TAB_ORDER: TabId[] = ['home', 'alphabet', 'words', 'phrases', 'stories', 'quiz', 'chat'];

function localISODate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localISODate(d);
}

function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function migrateProgress(raw: unknown): ProgressState {
  const saved = raw && typeof raw === 'object' ? (raw as Partial<ProgressState>) : {};
  const base: ProgressState = {
    ...DEFAULT_PROGRESS,
    lettersLearned: normalizeStringArray(saved.lettersLearned),
    wordsLearned: normalizeStringArray(saved.wordsLearned),
    phrasesLearned: normalizeStringArray(saved.phrasesLearned),
    quizScore: typeof saved.quizScore === 'number' ? saved.quizScore : 0,
    quizTotal: typeof saved.quizTotal === 'number' ? saved.quizTotal : 0,
    storiesRead: normalizeStringArray(saved.storiesRead),
    streakDays: typeof saved.streakDays === 'number' && saved.streakDays > 0 ? saved.streakDays : 0,
    lastActiveDate: typeof saved.lastActiveDate === 'string' ? saved.lastActiveDate : '',
    lastLesson: saved.lastLesson,
  };

  const today = localISODate();
  if (base.lastActiveDate === today) {
    return { ...base, streakDays: Math.max(1, base.streakDays) };
  }
  if (base.lastActiveDate === yesterdayISO()) {
    return { ...base, lastActiveDate: today, streakDays: Math.max(1, base.streakDays) + 1 };
  }
  return { ...base, lastActiveDate: today, streakDays: 1 };
}

function bottomActiveTab(activeTab: TabId): 'home' | 'alphabet' | 'quiz' | 'chat' {
  if (activeTab === 'home') return 'home';
  if (activeTab === 'chat') return 'chat';
  if (activeTab === 'quiz' || activeTab === 'progress') return 'quiz';
  return 'alphabet';
}

function firstUnlearnedLetter(learned: string[]): LetterItem {
  return ALL_LETTERS.find(letter => !learned.includes(letter.roman)) || ALL_LETTERS[0];
}

function wordOfTheDay(): WordItem {
  return words[(dayOfYear() - 1) % words.length] || words[0];
}

export default function GujaratiApp() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const { speak, currentlyPlaying } = useSpeak();

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only horizontal swipes (not scrolls)
    if (Math.abs(dx) < 60 || dy > Math.abs(dx) * 0.8) return;
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (dx < 0 && currentIndex < TAB_ORDER.length - 1) {
      // swipe left = go forward
      setActiveTab(TAB_ORDER[currentIndex + 1]);
    } else if (dx > 0 && currentIndex > 0) {
      // swipe right = go back
      setActiveTab(TAB_ORDER[currentIndex - 1]);
    }
  };

  useEffect(() => {
    let nextProgress = DEFAULT_PROGRESS;
    try {
      const saved = localStorage.getItem('gujarati-progress');
      nextProgress = migrateProgress(saved ? JSON.parse(saved) : null);
    } catch {
      nextProgress = migrateProgress(null);
    }

    const timer = window.setTimeout(() => {
      setProgress(nextProgress);
      setHasLoadedProgress(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedProgress) return;
    try {
      localStorage.setItem('gujarati-progress', JSON.stringify(progress));
    } catch {}
  }, [hasLoadedProgress, progress]);

  const markLetterLearned = useCallback((letter: string) => {
    setProgress(p => ({
      ...p,
      lettersLearned: p.lettersLearned.includes(letter) ? p.lettersLearned : [...p.lettersLearned, letter],
      lastLesson: { type: 'letter', id: letter },
    }));
  }, []);

  const markWordLearned = useCallback((word: string) => {
    setProgress(p => ({
      ...p,
      wordsLearned: p.wordsLearned.includes(word) ? p.wordsLearned : [...p.wordsLearned, word],
      lastLesson: { type: 'word', id: word },
    }));
  }, []);

  const markPhraseLearned = useCallback((phrase: string) => {
    setProgress(p => ({
      ...p,
      phrasesLearned: p.phrasesLearned.includes(phrase) ? p.phrasesLearned : [...p.phrasesLearned, phrase],
      lastLesson: { type: 'phrase', id: phrase },
    }));
  }, []);

  const markStoryRead = useCallback((storyId: string) => {
    setProgress(p => ({
      ...p,
      storiesRead: p.storiesRead.includes(storyId) ? p.storiesRead : [...p.storiesRead, storyId],
      lastLesson: { type: 'story', id: storyId },
    }));
  }, []);

  const continueLetter = useMemo(() => {
    const savedLetter =
      progress.lastLesson?.type === 'letter'
        ? ALL_LETTERS.find(letter => letter.roman === progress.lastLesson?.id)
        : undefined;
    return savedLetter || firstUnlearnedLetter(progress.lettersLearned);
  }, [progress.lastLesson, progress.lettersLearned]);

  const dailyWord = useMemo(() => wordOfTheDay(), []);

  const featuredWords = useMemo(() => {
    const categories = ['animal', 'fruit', 'food', 'color', 'nature', 'family', 'body'];
    return categories.map(cat => words.find(w => w.category === cat)).filter(Boolean) as WordItem[];
  }, []);

  const playContinueLetter = (event?: MouseEvent) => {
    event?.stopPropagation();
    const audio = getLetterAudio(continueLetter.roman);
    if (audio) speak(audio, `letter-${continueLetter.roman}`);
    else speak(continueLetter.gujarati, `letter-${continueLetter.roman}`);
    markLetterLearned(continueLetter.roman);
  };

  const renderHome = () => {
    const letterImage = getLetterImage(continueLetter.roman) || '/images/gen/letter-ka.webp';
    const wordImage = getWordImage(dailyWord.roman) || '/images/cow.webp';

    return (
      <div className="relative min-h-[calc(100dvh-96px)] pb-28 animate-fade-in">
        <BlockPrintBand />

        <div className="flex items-center gap-3 px-5 pt-4">
          <div
            className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl bg-white"
            style={{ border: '2px solid var(--rf-ink)', boxShadow: '3px 3px 0 var(--rf-saffron)' }}
          >
            <Guju size={42} sw={2.6} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--rf-muted)' }}>
              Hi! I&apos;m Guju.
            </p>
            <h1
              className="rf-gujarati truncate text-[25px] font-bold leading-[1.05]"
              style={{ color: 'var(--rf-indigo)', textShadow: '1.5px 1.5px 0 var(--rf-saffron)' }}
            >
              ગુજરાતી શીખો
            </h1>
          </div>
        </div>

        <section
          role="button"
          tabIndex={0}
          aria-label={`Continue Gujarati letter ${continueLetter.roman}`}
          onClick={() => setActiveTab('alphabet')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') setActiveTab('alphabet');
          }}
          className="rf-pressable relative mx-4 mt-4 cursor-pointer overflow-hidden p-3.5 text-white"
          style={{
            background: 'var(--rf-indigo)',
            borderRadius: 'var(--rf-radius-hero)',
            border: 'var(--rf-border)',
            boxShadow: 'var(--rf-shadow-saffron)',
          }}
        >
          <HalftoneOverlay alpha={0.1} size={7} />
          <div className="pointer-events-none absolute -right-3 -top-3 opacity-20">
            <svg width="110" height="110" viewBox="0 0 36 36" aria-hidden="true">
              <rect x="6" y="6" width="24" height="24" transform="rotate(45 18 18)" fill="none" stroke="#fff" strokeWidth="1.6" />
              <circle cx="18" cy="18" r="4" fill="#fff" />
            </svg>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[14px] border-2 border-white/50 bg-white">
              <img src={letterImage} alt="" className="rf-image-contain h-full w-full p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[1px]" style={{ color: 'var(--rf-saffron-pale)' }}>
                Continue · પાઠ ૧
              </p>
              <p className="rf-gujarati truncate text-[22px] font-bold leading-tight">
                અક્ષર {continueLetter.gujarati}{' '}
                <span className="font-sans text-sm font-medium opacity-70">&quot;{continueLetter.roman}&quot;</span>
              </p>
              <p className="truncate text-[13px] font-medium opacity-85">
                {continueLetter.exampleEnglish} · {continueLetter.example}
              </p>
            </div>
            <button
              type="button"
              onClick={playContinueLetter}
              aria-label={`Play ${continueLetter.gujarati}`}
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border-2 border-white text-white transition-transform active:scale-95"
              style={{ background: 'var(--rf-saffron)' }}
            >
              <PlayTriangleIcon className={`h-5 w-5 ${currentlyPlaying === `letter-${continueLetter.roman}` ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2.5 px-4 pt-4">
          {SECTION_TILES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className="rf-pressable relative min-h-[92px] overflow-hidden px-[13px] py-3 text-left text-white"
              style={{
                background: index % 2 === 0 ? 'var(--rf-saffron)' : 'var(--rf-indigo)',
                borderRadius: 'var(--rf-radius-card)',
                border: 'var(--rf-border)',
                boxShadow: 'var(--rf-shadow-ink)',
              }}
            >
              <HalftoneOverlay alpha={0.14} size={6} />
              <span className="absolute right-3 top-3 h-[9px] w-[9px] rotate-45 bg-white opacity-90" aria-hidden="true" />
              <span className="relative block">
                <span className="rf-gujarati block text-[21px] font-bold leading-none">{item.gu}</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.5px] opacity-95">{item.en}</span>
                <span className="mt-0.5 block text-[11px] font-medium opacity-80">{item.sub}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('words')}
          className="rf-pressable mx-4 mt-4 flex w-[calc(100%-2rem)] items-center gap-3 bg-white px-3 py-2.5 text-left"
          style={{ borderRadius: 'var(--rf-radius-card)', border: 'var(--rf-border)', boxShadow: 'var(--rf-shadow-indigo)' }}
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white" style={{ border: '2px solid var(--rf-ink)' }}>
            <img src={wordImage} alt="" className="rf-image-contain h-full w-full p-1" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: 'var(--rf-saffron)' }}>
              Word of the day
            </p>
            <p className="rf-gujarati truncate text-[22px] font-bold leading-none">
              {dailyWord.gujarati}{' '}
              <span className="font-sans text-[13px] font-semibold" style={{ color: 'var(--rf-muted)' }}>
                {dailyWord.roman}
              </span>
            </p>
            <p className="text-xs font-semibold" style={{ color: 'var(--rf-indigo)' }}>
              {dailyWord.english}
            </p>
          </div>
          <Starburst>NEW</Starburst>
        </button>

        {/* Featured Words Scroll */}
        <div className="mt-4">
          <p className="px-4 text-[11px] font-bold uppercase tracking-[1px] mb-2" style={{ color: 'var(--rf-muted)' }}>
            Featured Words
          </p>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
            {featuredWords.map((word, i) => {
              const img = getWordImage(word.roman);
              return (
                <button
                  key={word.roman}
                  type="button"
                  onClick={() => setActiveTab('words')}
                  className="rf-pressable flex-shrink-0 flex flex-col items-center gap-1 bg-white rounded-2xl p-2"
                  style={{
                    width: 80,
                    border: 'var(--rf-border)',
                    boxShadow: i % 2 === 0 ? 'var(--rf-shadow-saffron)' : 'var(--rf-shadow-indigo)'
                  }}
                >
                  {img ? (
                    <img src={img} alt={word.english} className="w-14 h-14 object-contain rounded-xl"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: 'var(--rf-cream)' }}>
                      {categoryMeta[word.category]?.emoji || '📝'}
                    </div>
                  )}
                  <p className="rf-gujarati text-xs font-bold text-center leading-tight" style={{ color: 'var(--rf-indigo)' }}>
                    {word.gujarati}
                  </p>
                  <p className="text-[9px] font-semibold text-gray-500 text-center">{word.english}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className="rf-pressable mx-4 mt-4 flex w-[calc(100%-2rem)] items-center gap-3 bg-white px-3.5 py-2 text-left"
          style={{ borderRadius: 'var(--rf-radius-card)', border: 'var(--rf-border)', boxShadow: 'var(--rf-shadow-saffron)' }}
        >
          <ProgressRing value={progress.lettersLearned.length} total={TOTAL_LETTERS} label="Letters learned" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              {progress.streakDays}-day streak!
            </p>
            <p className="truncate text-xs font-medium" style={{ color: 'var(--rf-muted)' }}>
              {progress.lettersLearned.length} letters · {progress.wordsLearned.length} words learned
            </p>
          </div>
          <span className="text-lg" aria-hidden="true">
            🔥
          </span>
        </button>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'alphabet':
        return <AlphabetSection onLetterLearned={markLetterLearned} />;
      case 'words':
        return <WordsSection wordsLearned={progress.wordsLearned} onWordLearned={markWordLearned} />;
      case 'phrases':
        return <PhrasesSection phrasesLearned={progress.phrasesLearned} onPhraseLearned={markPhraseLearned} />;
      case 'stories':
        return <StoriesSection storiesRead={progress.storiesRead} onStoryRead={markStoryRead} />;
      case 'quiz':
        return <QuizSection onQuizComplete={(s, t) => setProgress(p => ({ ...p, quizScore: p.quizScore + s, quizTotal: p.quizTotal + t }))} />;
      case 'chat':
        return <ChatSection />;
      case 'progress':
        return <ProgressSection progress={progress} />;
    }
  };

  const activeBottom = bottomActiveTab(activeTab);

  return (
    <div className="min-h-screen bg-[var(--rf-cream)]">
      {activeTab !== 'home' && (
        <header className="sticky top-0 z-40 border-b-2 bg-white" style={{ borderColor: 'var(--rf-ink)' }}>
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="rf-pressable flex min-h-11 items-center gap-2 rounded-xl px-2 text-left"
            >
              <span className="text-xl leading-none">←</span>
              <span>
                <span className="rf-gujarati block text-base font-bold leading-none" style={{ color: 'var(--rf-indigo)' }}>
                  {TAB_META[activeTab].gu}
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.6px]" style={{ color: 'var(--rf-muted)' }}>
                  {TAB_META[activeTab].en}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className="rf-pressable min-h-11 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-[0.6px]"
              style={{
                background: activeTab === 'progress' ? 'var(--rf-saffron)' : 'var(--rf-card)',
                color: activeTab === 'progress' ? '#fff' : 'var(--rf-indigo)',
                border: '2px solid var(--rf-ink)',
                boxShadow: '2px 2px 0 var(--rf-ink)',
              }}
            >
              {progress.wordsLearned.length} words
            </button>
          </div>
        </header>
      )}

      <main
        className="mx-auto max-w-lg pb-24"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {renderContent()}
      </main>

      {/* Guju AI branded badge */}
      <div className="fixed left-1/2 -translate-x-1/2 z-[51]" style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className="guju-badge flex items-center gap-1.5 px-4 py-1.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, var(--rf-saffron) 0%, var(--rf-indigo) 100%)',
            border: '2.5px solid var(--rf-ink)',
          }}
        >
          <Guju size={20} sw={2} />
          <span className="text-white font-black text-sm tracking-wide" style={{ fontFamily: 'var(--font-display)', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
            Guju AI
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--rf-saffron-pale)' }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#4ade80' }}></span>
          </span>
        </button>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -2px 0 var(--rf-ink)',
        }}
      >
        <div className="mx-auto max-w-lg">
          <BlockPrintBand height={9} opacity={0.45} />
          <div className="flex h-14 border-t-2 bg-white" style={{ borderColor: 'var(--rf-ink)' }}>
            {BOTTOM_TABS.map(tab => {
              const isActive = activeBottom === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-1 items-center justify-center"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className="flex min-h-11 min-w-12 flex-col items-center justify-center gap-0.5 px-3 py-1"
                    style={{
                      background: isActive ? 'var(--rf-saffron)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--rf-muted)',
                      borderRadius: 12,
                      border: isActive ? '2px solid var(--rf-ink)' : '2px solid transparent',
                    }}
                  >
                    <span className="rf-gujarati text-base font-bold leading-none">{tab.gu}</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.5px]">{tab.en}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
