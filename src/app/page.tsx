'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { AlphabetSection } from '@/components/AlphabetSection';
import { WordsSection } from '@/components/WordsSection';
import { PhrasesSection } from '@/components/PhrasesSection';
import { StoriesSection } from '@/components/StoriesSection';
import { QuizSection } from '@/components/QuizSection';
import { ChatSection } from '@/components/ChatSection';
import { SettingsSection } from '@/components/SettingsSection';
import { BlockPrintBand, Guju, Starburst } from '@/components/RisoFolk';
import { Icon, type IconName } from '@/components/Icon';
import { Art, ProgressRing } from '@/components/ui';
import { useSpeak } from '@/components/useSpeak';
import { swar, vyanjan, words, type LetterItem, type WordItem } from '@/data/gujarati';
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

const TAB_META: Record<TabId, { gu: string; en: string; icon: IconName }> = {
  home: { gu: 'ઘર', en: 'Home', icon: 'home' },
  alphabet: { gu: 'કક્કો', en: 'Letters', icon: 'letters' },
  words: { gu: 'શબ્દો', en: 'Words', icon: 'words' },
  phrases: { gu: 'વાક્યો', en: 'Phrases', icon: 'phrases' },
  stories: { gu: 'વાર્તા', en: 'Stories', icon: 'stories' },
  quiz: { gu: 'રમત', en: 'Play', icon: 'quiz' },
  chat: { gu: 'ગુજુ', en: 'Ask Guju', icon: 'spark' },
  progress: { gu: 'પ્રગતિ', en: 'Progress', icon: 'progress' },
};

/** What a child reaches for on a phone. Guju rides a floating button instead
 *  of stealing a tab slot, and Phrases/Progress live on Home and the sidebar. */
const PHONE_TABS: TabId[] = ['home', 'alphabet', 'words', 'stories', 'quiz'];

/** The full destination list, shown once there is room for it. */
const ALL_TABS: TabId[] = ['home', 'alphabet', 'words', 'phrases', 'stories', 'quiz', 'chat', 'progress'];

/** Swipe order on touch devices. */
const SWIPE_ORDER: TabId[] = ['home', 'alphabet', 'words', 'phrases', 'stories', 'quiz', 'chat'];

const SECTION_TILES: Array<{ id: TabId; sub: string }> = [
  { id: 'alphabet', sub: 'સ્વર · વ્યંજન · trace them' },
  { id: 'words', sub: '283 words · 10 groups' },
  { id: 'phrases', sub: 'Say it out loud' },
  { id: 'stories', sub: '48 stories · 9 rhymes' },
  { id: 'quiz', sub: 'Play and win stars' },
  { id: 'chat', sub: 'Your Gujarati buddy' },
];

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

function firstUnlearnedLetter(learned: string[]): LetterItem {
  return ALL_LETTERS.find(letter => !learned.includes(letter.roman)) || ALL_LETTERS[0];
}

function wordOfTheDay(): WordItem {
  return words[(dayOfYear() - 1) % words.length] || words[0];
}

/* ------------------------------------------------------------------- Nav */

function NavItem({
  tab,
  active,
  secondary,
  onSelect,
}: {
  tab: TabId;
  active: boolean;
  /** Not one of the five phone tabs — appears once there is a sidebar. */
  secondary: boolean;
  onSelect: (tab: TabId) => void;
}) {
  const meta = TAB_META[tab];
  return (
    <button
      type="button"
      className={`rf-nav__item${secondary ? ' rf-nav__item--secondary' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(tab)}
    >
      <span className="rf-nav__mark">
        <Icon name={meta.icon} size={20} strokeWidth={2.2} />
      </span>
      <span className="rf-nav__label">{meta.en}</span>
    </button>
  );
}

/* ------------------------------------------------------------------- App */

export default function GujaratiApp() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const { speak, currentlyPlaying } = useSpeak();

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isPoppingRef = useRef(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const dx = event.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(event.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) < 60 || dy > Math.abs(dx) * 0.8) return;
    const index = SWIPE_ORDER.indexOf(activeTab);
    if (index < 0) return;
    if (dx < 0 && index < SWIPE_ORDER.length - 1) setActiveTab(SWIPE_ORDER[index + 1]);
    else if (dx > 0 && index > 0) setActiveTab(SWIPE_ORDER[index - 1]);
  };

  // Each tab change pushes history so the platform back gesture pops in-app
  // navigation before it leaves the site.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab') as TabId | null;
    if (requested && requested in TAB_META && requested !== 'home') {
      isPoppingRef.current = true;
      const timer = window.setTimeout(() => setActiveTab(requested), 0);
      return () => window.clearTimeout(timer);
    }
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  useEffect(() => {
    if (isPoppingRef.current) {
      isPoppingRef.current = false;
      return;
    }
    const url = activeTab === 'home' ? window.location.pathname : `?tab=${activeTab}`;
    window.history.pushState(null, '', url);
  }, [activeTab]);

  useEffect(() => {
    const onPopState = () => {
      isPoppingRef.current = true;
      const tab = new URLSearchParams(window.location.search).get('tab') as TabId | null;
      setActiveTab(tab || 'home');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Moving between sections should start you at the top of the new one.
  useEffect(() => {
    mainRef.current?.scrollTo?.({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  useEffect(() => {
    let next = DEFAULT_PROGRESS;
    try {
      const saved = localStorage.getItem('gujarati-progress');
      next = migrateProgress(saved ? JSON.parse(saved) : null);
    } catch {
      next = migrateProgress(null);
    }
    const timer = window.setTimeout(() => {
      setProgress(next);
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

  const recordQuiz = useCallback((score: number, total: number) => {
    setProgress(p => ({ ...p, quizScore: p.quizScore + score, quizTotal: p.quizTotal + total }));
  }, []);

  const continueLetter = useMemo(() => {
    const saved =
      progress.lastLesson?.type === 'letter'
        ? ALL_LETTERS.find(letter => letter.roman === progress.lastLesson?.id)
        : undefined;
    return saved || firstUnlearnedLetter(progress.lettersLearned);
  }, [progress.lastLesson, progress.lettersLearned]);

  // Resolved after mount: this page is statically prerendered, so a
  // date-derived word baked in at build time mismatches on hydration.
  const dailyWord = hasLoadedProgress ? wordOfTheDay() : null;

  const featuredWords = useMemo(() => {
    const categories = ['animal', 'fruit', 'food', 'color', 'nature', 'family', 'body', 'number', 'festival'];
    return categories
      .map(category => words.find(word => word.category === category))
      .filter(Boolean) as WordItem[];
  }, []);

  const playContinueLetter = (event?: MouseEvent) => {
    event?.stopPropagation();
    const audio = getLetterAudio(continueLetter.roman);
    speak(audio || continueLetter.gujarati, `letter-${continueLetter.roman}`, continueLetter.gujarati);
    markLetterLearned(continueLetter.roman);
  };

  /* ----------------------------------------------------------------- Home */

  const renderHome = () => {
    const letterImage = getLetterImage(continueLetter.roman);
    const continueId = `letter-${continueLetter.roman}`;

    return (
      <div className="rf-home">
        {/* Masthead */}
        <div className="rf-home__lead flex items-center" style={{ gap: 'var(--s-3)' }}>
          <span
            className="inline-flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              flex: 'none',
              borderRadius: 'var(--r-md)',
              background: 'var(--paper)',
              border: 'var(--key)',
              boxShadow: 'var(--lift-1) var(--ink-saffron)',
            }}
          >
            <Guju size={40} sw={2.6} />
          </span>
          <div className="min-w-0 flex-1">
            <p style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--text-2)' }}>
              Hi! I&apos;m Guju.
            </p>
            <h1
              className="rf-gujarati truncate"
              style={{
                fontSize: 'var(--t-2xl)',
                fontWeight: 700,
                lineHeight: 1.1,
                color: 'var(--ink-indigo)',
              }}
            >
              ગુજરાતી શીખો
            </h1>
          </div>
        </div>

        {/* Continue where you left off — the one thing a returning child wants */}
        <section
          className="rf-press rf-lift-saffron rf-home__lead relative cursor-pointer overflow-hidden"
          role="button"
          tabIndex={0}
          aria-label={`Continue with the letter ${continueLetter.gujarati}`}
          onClick={() => setActiveTab('alphabet')}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setActiveTab('alphabet');
            }
          }}
          style={{
            background: 'var(--ink-indigo)',
            color: 'var(--text-on-ink)',
            border: 'var(--key)',
            borderRadius: 'var(--r-xl)',
            padding: 'var(--s-4)',
          }}
        >
          <span className="rf-halftone" aria-hidden="true" />
          <div className="relative flex items-center" style={{ gap: 'var(--s-4)' }}>
            <Art
              src={letterImage}
              alt=""
              icon="letters"
              style={{
                width: 82,
                height: 82,
                flex: 'none',
                borderRadius: 'var(--r-md)',
                border: '2px solid rgba(255,253,247,0.55)',
                padding: 4,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="rf-label" style={{ color: 'var(--ink-saffron-pale)' }}>
                Carry on
              </p>
              <p
                className="rf-gujarati truncate"
                style={{ fontSize: 'var(--t-2xl)', fontWeight: 700, lineHeight: 1.15 }}
              >
                {continueLetter.gujarati}{' '}
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--t-md)',
                    fontWeight: 500,
                    opacity: 0.75,
                  }}
                >
                  {continueLetter.roman}
                </span>
              </p>
              <p className="truncate" style={{ fontSize: 'var(--t-sm)', color: 'var(--text-on-ink-2)' }}>
                {continueLetter.example} — {continueLetter.exampleEnglish}
              </p>
            </div>
            <button
              type="button"
              onClick={playContinueLetter}
              aria-label={`Hear ${continueLetter.gujarati}`}
              className="rf-press inline-flex items-center justify-center rounded-full"
              style={{
                width: 52,
                height: 52,
                flex: 'none',
                background: 'var(--ink-saffron)',
                color: 'var(--text-on-ink)',
                border: '2.5px solid var(--text-on-ink)',
              }}
            >
              <Icon name={currentlyPlaying === continueId ? 'speakerLoud' : 'play'} size={22} />
            </button>
          </div>
        </section>

        {/* Everything the app can do */}
        <nav className="rf-home__lead" aria-label="Sections">
          <div className="rf-grid rf-grid--tiles">
            {SECTION_TILES.map((tile, index) => {
              const meta = TAB_META[tile.id];
              const saffron = index % 2 === 0;
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => setActiveTab(tile.id)}
                  className={`rf-press rf-tile ${saffron ? 'rf-lift-indigo' : 'rf-lift-saffron'} relative overflow-hidden text-left`}
                  style={{
                    padding: 'var(--s-3) var(--s-4)',
                    background: saffron ? 'var(--ink-saffron)' : 'var(--ink-indigo)',
                    // White cannot pass 4.5:1 on saffron, so the saffron half
                    // of the pair prints its text in key ink instead.
                    color: saffron ? 'var(--text-on-saffron)' : 'var(--text-on-ink)',
                    border: 'var(--key)',
                    borderRadius: 'var(--r-lg)',
                  }}
                >
                  <span className="rf-halftone" aria-hidden="true" />
                  <span className="relative flex h-full flex-col justify-between">
                    <Icon name={meta.icon} size={24} strokeWidth={2.2} />
                    <span className="block">
                      <span
                        className="rf-gujarati block truncate"
                        style={{ fontSize: 'var(--t-xl)', fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {meta.gu}
                      </span>
                      <span
                        className="block truncate"
                        style={{
                          fontSize: 'var(--t-xs)',
                          color: saffron ? 'var(--text-on-saffron-2)' : 'var(--text-on-ink-2)',
                        }}
                      >
                        {tile.sub}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Side column: word of the day, streak, featured words */}
        <div className="rf-home__side rf-grid" style={{ gap: 'var(--s-4)' }}>
          {dailyWord ? (
            <button
              type="button"
              onClick={() => setActiveTab('words')}
              className="rf-press rf-lift-saffron rf-surface flex w-full items-center text-left"
              style={{ gap: 'var(--s-3)', padding: 'var(--s-3)' }}
            >
              <Art
                src={getWordImage(dailyWord.roman)}
                alt=""
                icon="words"
                className="rf-art-frame"
                style={{ width: 60, height: 60, flex: 'none', padding: 4 }}
              />
              <span className="min-w-0 flex-1">
                <span className="rf-label" style={{ color: 'var(--ink-saffron-deep)' }}>
                  Word of the day
                </span>
                <span
                  className="rf-gujarati block truncate"
                  style={{ fontSize: 'var(--t-xl)', fontWeight: 700, lineHeight: 1.25 }}
                >
                  {dailyWord.gujarati}
                </span>
                <span
                  className="block truncate"
                  style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--ink-indigo)' }}
                >
                  {dailyWord.english}
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}> · {dailyWord.roman}</span>
                </span>
              </span>
              <Starburst>NEW</Starburst>
            </button>
          ) : (
            <div className="rf-skeleton" style={{ height: 86 }} aria-hidden="true" />
          )}

          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className="rf-press rf-lift-indigo rf-surface flex w-full items-center text-left"
            style={{ gap: 'var(--s-3)', padding: 'var(--s-3)' }}
          >
            <ProgressRing
              value={progress.lettersLearned.length}
              total={TOTAL_LETTERS}
              label={`${progress.lettersLearned.length} of ${TOTAL_LETTERS} letters learned`}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate" style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>
                {progress.streakDays === 1 ? 'First day!' : `${progress.streakDays}-day streak`}
              </span>
              <span
                className="block truncate"
                style={{ fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}
              >
                {progress.lettersLearned.length} letters · {progress.wordsLearned.length} words
              </span>
            </span>
            <Icon
              name="flame"
              size={24}
              style={{ color: 'var(--ink-saffron)', flex: 'none' }}
              title="Streak"
            />
          </button>

          <section>
            <h2 className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
              A word from each group
            </h2>
            <div className="rf-scroll-x rf-wordrow" style={{ gap: 'var(--s-3)', paddingBottom: 'var(--s-2)' }}>
              {featuredWords.map((word, index) => (
                <button
                  key={word.roman}
                  type="button"
                  onClick={() => setActiveTab('words')}
                  className={`rf-press rf-surface ${index % 2 === 0 ? 'rf-lift-saffron' : 'rf-lift-indigo'} flex flex-col items-center`}
                  style={{ width: 92, flex: 'none', gap: 4, padding: 'var(--s-2)' }}
                >
                  <Art
                    src={getWordImage(word.roman)}
                    alt=""
                    icon="image"
                    style={{ width: 60, height: 60, borderRadius: 'var(--r-sm)' }}
                  />
                  <span
                    className="rf-gujarati w-full truncate text-center"
                    style={{ fontSize: 'var(--t-sm)', fontWeight: 700, color: 'var(--ink-indigo)' }}
                  >
                    {word.gujarati}
                  </span>
                  <span
                    className="w-full truncate text-center"
                    style={{ fontSize: 'var(--t-2xs)', fontWeight: 600, color: 'var(--text-2)' }}
                  >
                    {word.english}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'alphabet':
        return <AlphabetSection lettersLearned={progress.lettersLearned} onLetterLearned={markLetterLearned} />;
      case 'words':
        return <WordsSection wordsLearned={progress.wordsLearned} onWordLearned={markWordLearned} />;
      case 'phrases':
        return <PhrasesSection phrasesLearned={progress.phrasesLearned} onPhraseLearned={markPhraseLearned} />;
      case 'stories':
        return (
          <StoriesSection
            storiesRead={progress.storiesRead}
            onStoryRead={markStoryRead}
            onQuizComplete={recordQuiz}
          />
        );
      case 'quiz':
        return <QuizSection onQuizComplete={recordQuiz} />;
      case 'chat':
        return <ChatSection />;
      case 'progress':
        return <SettingsSection progress={progress} />;
    }
  };

  const meta = TAB_META[activeTab];

  return (
    <div className="rf-app">
      <nav className="rf-nav rf-no-print" aria-label="Main">
        {/* The rail identifies the app once the home masthead is off-screen. */}
        <div
          className="rf-nav__brand"
          style={{ gap: 'var(--s-2)', padding: '0 var(--s-2) var(--s-4)' }}
        >
          <Guju size={30} sw={2.6} />
          <span
            className="rf-gujarati rf-from-desktop truncate"
            style={{ fontSize: 'var(--t-md)', fontWeight: 700, color: 'var(--ink-indigo)' }}
          >
            ગુજરાતી શીખો
          </span>
        </div>

        <div className="rf-nav__list">
          {ALL_TABS.map(tab => (
            <NavItem
              key={tab}
              tab={tab}
              active={activeTab === tab}
              secondary={!PHONE_TABS.includes(tab)}
              onSelect={setActiveTab}
            />
          ))}
        </div>

        <BlockPrintBand height={10} opacity={0.4} className="rf-from-tablet" />
      </nav>

      {/* Guju is one tap away on a phone without costing a tab slot — but not
          on the chat screen itself, where it covered the Send button. */}
      {activeTab !== 'chat' && (
        <button
          type="button"
          className="rf-guju-fab rf-no-print"
          aria-label="Ask Guju, your Gujarati tutor"
          onClick={() => setActiveTab('chat')}
        >
          <Guju size={26} sw={2.4} />
          <span>GUJU</span>
        </button>
      )}

      <main
        ref={mainRef}
        className="rf-main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeTab !== 'home' && (
          <header
            className="sticky top-0 z-40 rf-no-print"
            style={{
              background: 'var(--paper)',
              borderBottom: 'var(--key-thin)',
              paddingTop: 'var(--safe-top)',
            }}
          >
            <div
              className="rf-page flex items-center"
              style={{ gap: 'var(--s-2)', paddingTop: 'var(--s-2)', paddingBottom: 'var(--s-2)' }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="rf-btn rf-btn--quiet"
                style={{ paddingLeft: 'var(--s-2)', paddingRight: 'var(--s-3)' }}
              >
                <Icon name="arrowLeft" size={20} />
                <span className="text-left">
                  <span
                    className="rf-gujarati block"
                    style={{ fontSize: 'var(--t-md)', lineHeight: 1.1, color: 'var(--ink-indigo)' }}
                  >
                    {meta.gu}
                  </span>
                  <span className="rf-label block">{meta.en}</span>
                </span>
              </button>

              <span className="flex-1" />

              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                aria-label="Progress and settings"
                aria-pressed={activeTab === 'progress'}
                className="rf-icon-btn"
              >
                <Icon name="progress" size={20} />
              </button>
            </div>
          </header>
        )}

        <div className="rf-page">{renderContent()}</div>
      </main>
    </div>
  );
}
