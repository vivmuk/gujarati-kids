'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  swar, vyanjan, words, phrases, stories, numbers,
  categoryMeta, generateQuiz,
  type LetterItem, type WordItem, type PhraseItem, type StoryItem,
} from '@/data/gujarati';

// ============ TYPES ============
type TabId = 'home' | 'alphabet' | 'words' | 'phrases' | 'stories' | 'quiz' | 'chat' | 'progress';

interface TabDef {
  id: TabId;
  label: string;
  emoji: string;
}

interface ProgressState {
  lettersLearned: string[];
  wordsLearned: string[];
  phrasesLearned: string[];
  quizScore: number;
  quizTotal: number;
  storiesRead: string[];
}

// ============ TABS ============
const TABS: TabDef[] = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'alphabet', label: 'Alphabet', emoji: '🔤' },
  { id: 'words', label: 'Words', emoji: '📚' },
  { id: 'phrases', label: 'Phrases', emoji: '💬' },
  { id: 'stories', label: 'Stories', emoji: '📖' },
  { id: 'quiz', label: 'Quiz', emoji: '🎯' },
  { id: 'chat', label: 'Guju AI', emoji: '🤖' },
  { id: 'progress', label: 'Progress', emoji: '⭐' },
];

// ============ MAIN APP ============
export default function GujaratiKidsApp() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [progress, setProgress] = useState<ProgressState>({
    lettersLearned: [],
    wordsLearned: [],
    phrasesLearned: [],
    quizScore: 0,
    quizTotal: 0,
    storiesRead: [],
  });
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gujarati-kids-progress');
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gujarati-kids-progress', JSON.stringify(progress));
    } catch {}
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
        body: JSON.stringify({ text, model: 'tts-kokoro', voice: 'af_sky', speed: 0.8 }),
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

  // ============ RENDER SECTIONS ============
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF1E6 50%, #FFE8D6 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-float">🪷</span>
            <div>
              <h1 className="gujarati-text text-xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
                ગુજરાતી શીખો
              </h1>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Learn Gujarati — Fun for Kids! 🎉
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-sparkle">⭐</span>
            <span className="font-extrabold text-lg" style={{ color: 'var(--accent-saffron)' }}>
              {progress.quizScore}
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[68px] z-40 backdrop-blur-lg bg-white/70 border-b border-orange-50">
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'home' && <HomeSection onNavigate={setActiveTab} progress={progress} />}
        {activeTab === 'alphabet' && <AlphabetSection speak={speak} currentlyPlaying={currentlyPlaying} progress={progress} setProgress={setProgress} />}
        {activeTab === 'words' && <WordsSection speak={speak} currentlyPlaying={currentlyPlaying} progress={progress} setProgress={setProgress} />}
        {activeTab === 'phrases' && <PhrasesSection speak={speak} currentlyPlaying={currentlyPlaying} progress={progress} setProgress={setProgress} />}
        {activeTab === 'stories' && <StoriesSection speak={speak} currentlyPlaying={currentlyPlaying} progress={progress} setProgress={setProgress} />}
        {activeTab === 'quiz' && <QuizSection speak={speak} progress={progress} setProgress={setProgress} />}
        {activeTab === 'chat' && <ChatSection speak={speak} />}
        {activeTab === 'progress' && <ProgressSection progress={progress} setProgress={setProgress} />}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <p>Made with ❤️ for kids learning Gujarati</p>
        <p className="text-xs mt-1 opacity-60">Powered by Venice AI • Natural Approach Method</p>
      </footer>
    </div>
  );
}

// ============ HOME SECTION ============
function HomeSection({ onNavigate, progress }: { onNavigate: (t: TabId) => void; progress: ProgressState }) {
  const totalItems = swar.length + vyanjan.length + words.length + phrases.length;
  const learnedItems = progress.lettersLearned.length + progress.wordsLearned.length + progress.phrasesLearned.length;
  const progressPercent = totalItems > 0 ? Math.round((learnedItems / totalItems) * 100) : 0;

  const quickLinks = [
    { id: 'alphabet' as TabId, emoji: '🔤', title: 'સ્વર & વ્યંજન', subtitle: 'Learn the Alphabet', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'words' as TabId, emoji: '📚', title: 'શબ્દો', subtitle: 'Build Vocabulary', color: '#2ECC71', bg: '#ECFDF5' },
    { id: 'phrases' as TabId, emoji: '💬', title: 'વાક્યો', subtitle: 'Speak Phrases', color: '#9B59B6', bg: '#F5F3FF' },
    { id: 'stories' as TabId, emoji: '📖', title: 'વાર્તાઓ', subtitle: 'Read Stories', color: '#E91E8A', bg: '#FDF2F8' },
    { id: 'quiz' as TabId, emoji: '🎯', title: 'રમત', subtitle: 'Play Quiz', color: '#F1C40F', bg: '#FFFBEB' },
    { id: 'chat' as TabId, emoji: '🤖', title: 'ગુજુ AI', subtitle: 'Chat & Learn', color: '#FF6B2B', bg: '#FFF7ED' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-float">🪷</div>
        <h2 className="gujarati-text text-4xl font-extrabold mb-2" style={{ color: 'var(--accent-saffron)' }}>
          નમસ્તે! 🙏
        </h2>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Welcome to your Gujarati learning journey!
        </p>
        <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
          Based on the <strong>Natural Approach</strong> — hear first, understand through context, then speak. 
          No pressure, just fun! 🎉
        </p>
      </div>

      {/* Progress Overview */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-lg">Your Journey</h3>
          <span className="font-extrabold text-2xl" style={{ color: 'var(--accent-saffron)' }}>{progressPercent}%</span>
        </div>
        <div className="progress-bar mb-4">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-xl" style={{ background: '#EFF6FF' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#3B82F6' }}>{progress.lettersLearned.length}</div>
            <div className="text-xs font-semibold" style={{ color: '#6B4226' }}>Letters</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: '#ECFDF5' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#2ECC71' }}>{progress.wordsLearned.length}</div>
            <div className="text-xs font-semibold" style={{ color: '#6B4226' }}>Words</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: '#F5F3FF' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#9B59B6' }}>{progress.phrasesLearned.length}</div>
            <div className="text-xs font-semibold" style={{ color: '#6B4226' }}>Phrases</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: '#FFFBEB' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#F1C40F' }}>{progress.quizScore}</div>
            <div className="text-xs font-semibold" style={{ color: '#6B4226' }}>Stars</div>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {quickLinks.map((link, i) => (
          <button
            key={link.id}
            className="card p-5 text-center animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
            onClick={() => onNavigate(link.id)}
          >
            <div className="text-4xl mb-2">{link.emoji}</div>
            <div className="gujarati-text font-extrabold text-lg" style={{ color: link.color }}>{link.title}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>{link.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Tip of the Day */}
      <div className="card p-5 mt-8" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)', borderLeft: '4px solid var(--accent-saffron)' }}>
        <h4 className="font-extrabold mb-2" style={{ color: 'var(--accent-saffron)' }}>💡 Learning Tip</h4>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong>Comprehensible Input:</strong> Listen to Gujarati sounds before trying to speak. 
          Click the 🔊 button on any letter, word, or phrase to hear it pronounced. 
          Repeat after listening — that&apos;s how kids naturally learn language! 🎧
        </p>
      </div>
    </div>
  );
}

// ============ ALPHABET SECTION ============
function AlphabetSection({ speak, currentlyPlaying, progress, setProgress }: {
  speak: (text: string, id: string) => void;
  currentlyPlaying: string | null;
  progress: ProgressState;
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>;
}) {
  const [subTab, setSubTab] = useState<'swar' | 'vyanjan'>('swar');
  const [selectedLetter, setSelectedLetter] = useState<LetterItem | null>(null);

  const letters = subTab === 'swar' ? swar : vyanjan;

  const handleLetterClick = (letter: LetterItem) => {
    setSelectedLetter(letter);
    speak(`${letter.gujarati}. ${letter.example}`, letter.gujarati);
    if (!progress.lettersLearned.includes(letter.gujarati)) {
      setProgress(p => ({ ...p, lettersLearned: [...p.lettersLearned, letter.gujarati] }));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="gujarati-text text-3xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
          {subTab === 'swar' ? 'સ્વર — Vowels' : 'વ્યંજન — Consonants'}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Tap a letter to hear it! 🔊 Listen first, then repeat.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          className={`tab-btn ${subTab === 'swar' ? 'active' : ''}`}
          onClick={() => setSubTab('swar')}
        >
          🔊 સ્વર ({swar.length})
        </button>
        <button
          className={`tab-btn ${subTab === 'vyanjan' ? 'active' : ''}`}
          onClick={() => setSubTab('vyanjan')}
        >
          🔤 વ્યંજન ({vyanjan.length})
        </button>
      </div>

      {/* Letters Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {letters.map((letter, i) => (
          <button
            key={letter.gujarati}
            className={`letter-card p-4 text-center ${currentlyPlaying === letter.gujarati ? 'speaking' : ''} ${selectedLetter?.gujarati === letter.gujarati ? 'ring-2 ring-orange-400' : ''}`}
            style={{ animationDelay: `${i * 0.03}s` }}
            onClick={() => handleLetterClick(letter)}
          >
            <div className="gujarati-text text-3xl sm:text-4xl font-extrabold mb-1" style={{ color: 'var(--accent-saffron)' }}>
              {letter.gujarati}
            </div>
            <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{letter.roman}</div>
            {progress.lettersLearned.includes(letter.gujarati) && (
              <div className="text-xs mt-1">✅</div>
            )}
          </button>
        ))}
      </div>

      {/* Selected Letter Detail */}
      {selectedLetter && (
        <div className="card p-6 mt-6 animate-slide-up" style={{ borderLeft: '4px solid var(--accent-saffron)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="gujarati-text text-6xl font-extrabold mb-2" style={{ color: 'var(--accent-saffron)' }}>
                {selectedLetter.gujarati}
              </div>
              <div className="text-xl font-bold mb-1">{selectedLetter.roman}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Example: <span className="gujarati-text font-bold">{selectedLetter.example}</span> ({selectedLetter.exampleRoman}) = {selectedLetter.exampleEnglish}
              </div>
            </div>
            <button
              className={`speak-btn ${currentlyPlaying === selectedLetter.gujarati ? 'speaking' : ''}`}
              onClick={() => speak(`${selectedLetter.gujarati}. ${selectedLetter.example}`, selectedLetter.gujarati)}
            >
              🔊
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ WORDS SECTION ============
function WordsSection({ speak, currentlyPlaying, progress, setProgress }: {
  speak: (text: string, id: string) => void;
  currentlyPlaying: string | null;
  progress: ProgressState;
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('animal');
  const categories = ['animal', 'fruit', 'color', 'body', 'family', 'food', 'nature', 'number'];

  const filteredWords = words.filter(w => w.category === selectedCategory);

  const handleWordClick = (word: WordItem) => {
    speak(`${word.gujarati}. ${word.english}`, word.gujarati);
    if (!progress.wordsLearned.includes(word.gujarati)) {
      setProgress(p => ({ ...p, wordsLearned: [...p.wordsLearned, word.gujarati] }));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="gujarati-text text-3xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
          શબ્દો — Words
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Learn words by category! Tap to hear pronunciation 🔊
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap" style={{ scrollbarWidth: 'none' }}>
        {categories.map(cat => {
          const meta = categoryMeta[cat];
          return (
            <button
              key={cat}
              className={`category-badge ${selectedCategory === cat ? 'ring-2 ring-offset-1' : ''}`}
              style={{
                background: selectedCategory === cat ? meta.color : `${meta.color}20`,
                color: selectedCategory === cat ? 'white' : meta.color,
                borderColor: meta.color,
                cursor: 'pointer',
                border: `2px solid ${meta.color}`,
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredWords.map((word, i) => {
          const meta = categoryMeta[word.category];
          return (
            <button
              key={word.gujarati}
              className={`word-card text-center ${currentlyPlaying === word.gujarati ? 'speaking' : ''}`}
              style={{ animationDelay: `${i * 0.05}s`, borderTop: `3px solid ${meta?.color || '#FF6B2B'}` }}
              onClick={() => handleWordClick(word)}
            >
              <div className="text-3xl mb-2">{meta?.emoji || '📝'}</div>
              <div className="gujarati-text text-2xl font-extrabold mb-1" style={{ color: meta?.color || 'var(--accent-saffron)' }}>
                {word.gujarati}
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>{word.roman}</div>
              <div className="text-sm font-semibold">{word.english}</div>
              <button
                className="speak-btn mt-3 mx-auto"
                style={{ width: 36, height: 36, fontSize: 16 }}
                onClick={(e) => { e.stopPropagation(); speak(word.gujarati, word.gujarati); }}
              >
                🔊
              </button>
              {progress.wordsLearned.includes(word.gujarati) && (
                <div className="text-xs mt-2 text-green-500 font-bold">✓ Learned</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ PHRASES SECTION ============
function PhrasesSection({ speak, currentlyPlaying, progress, setProgress }: {
  speak: (text: string, id: string) => void;
  currentlyPlaying: string | null;
  progress: ProgressState;
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('greeting');
  const phraseCategories = ['greeting', 'question', 'daily', 'polite', 'emotion'];

  const filteredPhrases = phrases.filter(p => p.category === selectedCategory);

  const handlePhraseClick = (phrase: PhraseItem) => {
    speak(phrase.gujarati, phrase.gujarati);
    if (!progress.phrasesLearned.includes(phrase.gujarati)) {
      setProgress(p => ({ ...p, phrasesLearned: [...p.phrasesLearned, phrase.gujarati] }));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="gujarati-text text-3xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
          વાક્યો — Phrases
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Useful phrases for everyday conversations! 🗣️
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {phraseCategories.map(cat => {
          const meta = categoryMeta[cat];
          return (
            <button
              key={cat}
              className={`category-badge ${selectedCategory === cat ? 'ring-2 ring-offset-1' : ''}`}
              style={{
                background: selectedCategory === cat ? meta?.color : `${meta?.color}20`,
                color: selectedCategory === cat ? 'white' : meta?.color,
                border: `2px solid ${meta?.color}`,
                cursor: 'pointer',
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {meta?.emoji} {meta?.label}
            </button>
          );
        })}
      </div>

      {/* Phrases List */}
      <div className="space-y-3">
        {filteredPhrases.map((phrase, i) => {
          const meta = categoryMeta[phrase.category];
          return (
            <button
              key={phrase.gujarati}
              className={`word-card w-full text-left ${currentlyPlaying === phrase.gujarati ? 'speaking' : ''}`}
              style={{ borderLeft: `4px solid ${meta?.color || '#FF6B2B'}`, animationDelay: `${i * 0.05}s` }}
              onClick={() => handlePhraseClick(phrase)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="gujarati-text text-xl font-extrabold mb-1" style={{ color: meta?.color || 'var(--accent-saffron)' }}>
                    {phrase.gujarati}
                  </div>
                  <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>{phrase.roman}</div>
                  <div className="text-sm font-semibold">{phrase.english}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${meta?.color}20`, color: meta?.color }}>
                      Level {phrase.level}
                    </span>
                    {progress.phrasesLearned.includes(phrase.gujarati) && (
                      <span className="text-xs text-green-500 font-bold">✓ Learned</span>
                    )}
                  </div>
                </div>
                <div className="speak-btn flex-shrink-0" style={{ width: 36, height: 36, fontSize: 16 }}
                  onClick={(e) => { e.stopPropagation(); speak(phrase.gujarati, phrase.gujarati); }}>
                  🔊
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ STORIES SECTION ============
function StoriesSection({ speak, currentlyPlaying, progress, setProgress }: {
  speak: (text: string, id: string) => void;
  currentlyPlaying: string | null;
  progress: ProgressState;
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>;
}) {
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [activeLine, setActiveLine] = useState<number>(0);

  const handleLineClick = (story: StoryItem, lineIdx: number) => {
    setActiveLine(lineIdx);
    const line = story.lines[lineIdx];
    speak(`${line.gujarati}. ${line.english}`, `${story.id}-${lineIdx}`);
  };

  const playFullStory = (story: StoryItem) => {
    setActiveLine(0);
    const fullText = story.lines.map(l => l.gujarati).join('. ');
    speak(fullText, story.id);
    if (!progress.storiesRead.includes(story.id)) {
      setProgress(p => ({ ...p, storiesRead: [...p.storiesRead, story.id] }));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="gujarati-text text-3xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
          વાર્તાઓ — Stories
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Comprehensible Input: Learn through stories! 📖 Listen and understand from context.
        </p>
      </div>

      {!selectedStory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stories.map((story, i) => (
            <button
              key={story.id}
              className="card p-6 text-left animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
              onClick={() => { setSelectedStory(story); setActiveLine(0); }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📖</span>
                <div>
                  <div className="gujarati-text text-xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
                    {story.titleGujarati}
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{story.titleEnglish}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: '#FFF7ED', color: 'var(--accent-saffron)' }}>
                  Level {story.level}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {story.lines.length} lines
                </span>
                {progress.storiesRead.includes(story.id) && (
                  <span className="text-xs text-green-500 font-bold">✓ Read</span>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button className="tab-btn mb-4" onClick={() => setSelectedStory(null)}>
            ← Back to Stories
          </button>

          <div className="card p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="gujarati-text text-2xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
                  {selectedStory.titleGujarati}
                </h3>
                <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{selectedStory.titleEnglish}</p>
              </div>
              <button className="speak-btn" onClick={() => playFullStory(selectedStory)}>
                🔊
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Tap each line to hear it. Try to understand the Gujarati before reading the English! 🤔
            </p>
          </div>

          <div className="space-y-1">
            {selectedStory.lines.map((line, idx) => (
              <button
                key={idx}
                className={`story-line w-full text-left ${activeLine === idx ? 'active' : ''}`}
                onClick={() => handleLineClick(selectedStory, idx)}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: activeLine === idx ? 'var(--accent-saffron)' : '#F0E6DC', color: activeLine === idx ? 'white' : 'var(--text-secondary)' }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="gujarati-text text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {line.gujarati}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {line.roman} — {line.english}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-auto">
                    {currentlyPlaying === `${selectedStory.id}-${idx}` && (
                      <span className="animate-pulse text-orange-400">🔊</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {progress.storiesRead.includes(selectedStory.id) && (
            <div className="card p-4 mt-4 text-center" style={{ background: '#ECFDF5' }}>
              <span className="text-2xl">🎉</span>
              <p className="font-bold text-green-600 mt-1">Story completed! Great job!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ QUIZ SECTION ============
function QuizSection({ speak, progress, setProgress }: {
  speak: (text: string, id: string) => void;
  progress: ProgressState;
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>;
}) {
  const [quizType, setQuizType] = useState<'letter' | 'word' | 'phrase'>('word');
  const [quizLevel, setQuizLevel] = useState(1);
  const [questions, setQuestions] = useState(generateQuiz('word', 1, 5));
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [confetti, setConfetti] = useState<Array<{id: number; color: string; left: number}>>([]);

  const startQuiz = (type: 'letter' | 'word' | 'phrase', level: number) => {
    setQuizType(type);
    setQuizLevel(level);
    const q = generateQuiz(type, level, 5);
    setQuestions(q);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  };

  const handleAnswer = (ansIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(ansIdx);
    const isCorrect = ansIdx === questions[currentQ].answer;
    if (isCorrect) {
      setScore(s => s + 1);
      speak('ખરેખર! Correct!', 'correct');
    } else {
      speak('ફરી પ્રયાસ કરો. Try again next time!', 'wrong');
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        setProgress(p => ({
          ...p,
          quizScore: p.quizScore + score + (isCorrect ? 1 : 0),
          quizTotal: p.quizTotal + questions.length,
        }));
        if (score + (isCorrect ? 1 : 0) >= 3) {
          // Confetti!
          const pieces = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            color: ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#E91E8A'][i % 6],
            left: Math.random() * 100,
          }));
          setConfetti(pieces);
          setTimeout(() => setConfetti([]), 3000);
        }
      }
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} className="confetti-piece" style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.id * 0.1}s` }} />
      ))}

      <div className="text-center mb-6">
        <h2 className="gujarati-text text-3xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
          રમત — Quiz Time! 🎯
        </h2>
      </div>

      {showResult ? (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">{score >= 4 ? '🏆' : score >= 3 ? '🌟' : score >= 2 ? '👍' : '💪'}</div>
          <h3 className="text-3xl font-extrabold mb-2">
            {score}/{questions.length}
          </h3>
          <p className="text-lg font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
            {score >= 4 ? 'શાબાશ! Excellent!' : score >= 3 ? 'સારું! Good job!' : 'ફરી પ્રયાસ કરો! Keep trying!'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="tab-btn active" onClick={() => startQuiz(quizType, quizLevel)}>
              🔄 Play Again
            </button>
            <button className="tab-btn" onClick={() => startQuiz(quizType, Math.min(quizLevel + 1, 3))}>
              ⬆️ Next Level
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quiz Type & Level Selection */}
          <div className="card p-4 mb-6">
            <div className="flex gap-2 mb-3 flex-wrap">
              <button className={`tab-btn ${quizType === 'letter' ? 'active' : ''}`} onClick={() => startQuiz('letter', quizLevel)}>🔤 Letters</button>
              <button className={`tab-btn ${quizType === 'word' ? 'active' : ''}`} onClick={() => startQuiz('word', quizLevel)}>📚 Words</button>
              <button className={`tab-btn ${quizType === 'phrase' ? 'active' : ''}`} onClick={() => startQuiz('phrase', quizLevel)}>💬 Phrases</button>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(lvl => (
                <button key={lvl} className={`tab-btn ${quizLevel === lvl ? 'active' : ''}`} onClick={() => startQuiz(quizType, lvl)}>
                  Level {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="card p-8 mb-6 text-center">
            <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Question {currentQ + 1} of {questions.length}
            </div>
            <div className="progress-bar mb-6 max-w-xs mx-auto">
              <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>
            {questions[currentQ] && (
              <>
                <div className="gujarati-text text-5xl font-extrabold mb-6" style={{ color: 'var(--accent-saffron)' }}>
                  {questions[currentQ].gujarati}
                </div>
                <p className="text-lg font-bold mb-6">{questions[currentQ].question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {questions[currentQ].options.map((opt, i) => (
                    <button
                      key={i}
                      className={`quiz-option ${
                        selectedAnswer === i
                          ? i === questions[currentQ].answer ? 'correct' : 'wrong'
                          : ''
                      } ${selectedAnswer !== null && i === questions[currentQ].answer ? 'correct' : ''}`}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedAnswer !== null}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Score indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1">
              {questions.map((_, i) => (
                <span key={i} className="text-xl">
                  {i < currentQ ? '⭐' : i === currentQ ? '🎯' : '○'}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============ CHAT SECTION ============
function ChatSection({ speak }: { speak: (text: string, id: string) => void }) {
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([
    { role: 'assistant', content: 'નમસ્તે! 🙏 I\'m ગુજુ (Guju), your Gujarati friend! Ask me anything about Gujarati — words, phrases, culture, or just chat! 🎉\n\nTry: "How do I say \'I love you\' in Gujarati?" or "Tell me about Navratri!"' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const context = messages.slice(-6).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'માફ કરજો! Sorry, something went wrong. Try again! 🙏' }]);
    }
    setIsLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');
          formData.append('model', 'openai/whisper-large-v3');
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          if (!res.ok) throw new Error('Transcription failed');
          const data = await res.json();
          if (data.text) {
            setInput(data.text);
          }
        } catch (err) {
          console.error('STT error:', err);
        }
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-4">
        <h2 className="gujarati-text text-3xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
          ગુજુ AI — Your Gujarati Friend 🤖
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Chat in English or Gujarati! Ask about words, culture, or anything! 🎉
        </p>
      </div>

      {/* Chat Messages */}
      <div className="card p-4 mb-4" style={{ height: '450px', overflowY: 'auto' }}>
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`chat-bubble ${msg.role}`}>
                <div className="whitespace-pre-wrap" style={{ fontFamily: "'Nunito', 'Noto Sans Gujarati', sans-serif" }}>
                  {msg.content}
                </div>
                {msg.role === 'assistant' && (
                  <button className="mt-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => speak(msg.content, `chat-${i}`)}>
                    🔊 Listen
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble assistant">
                <span className="animate-bounce-gentle inline-block">વિચારી રહ્યો છું</span>
                <span className="animate-sparkle">🤔</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {[
          'How do I say "hello"?',
          'Tell me about Navratri 🪘',
          'Teach me colors 🎨',
          'What is dhokla? 🍲',
          'Count to 10 in Gujarati 🔢',
        ].map(prompt => (
          <button key={prompt} className="tab-btn text-xs whitespace-nowrap"
            style={{ background: '#FFF7ED', color: 'var(--accent-saffron)', border: '1px solid rgba(255,107,43,0.2)' }}
            onClick={() => { setInput(prompt); }}>
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center">
        <button
          className={`mic-btn flex-shrink-0 ${isRecording ? 'recording' : ''}`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
        >
          {isRecording ? '⏹️' : '🎙️'}
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Type in English or Gujarati..."
          className="flex-1 px-4 py-3 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none font-semibold text-base"
          style={{ background: 'var(--bg-card)' }}
          disabled={isLoading}
        />
        <button
          className="speak-btn flex-shrink-0"
          style={{ width: 52, height: 52, fontSize: 22, background: input.trim() ? 'linear-gradient(135deg, var(--accent-saffron), #FF8F5E)' : '#ccc' }}
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// ============ PROGRESS SECTION ============
function ProgressSection({ progress, setProgress }: { progress: ProgressState; setProgress: React.Dispatch<React.SetStateAction<ProgressState>> }) {
  const totalLetters = swar.length + vyanjan.length;
  const totalWords = words.length;
  const totalPhrases = phrases.length;
  const totalStories = stories.length;

  const stats = [
    { label: 'Letters Learned', gujarati: 'અક્ષરો', current: progress.lettersLearned.length, total: totalLetters, color: '#3B82F6', emoji: '🔤' },
    { label: 'Words Learned', gujarati: 'શબ્દો', current: progress.wordsLearned.length, total: totalWords, color: '#2ECC71', emoji: '📚' },
    { label: 'Phrases Learned', gujarati: 'વાક્યો', current: progress.phrasesLearned.length, total: totalPhrases, color: '#9B59B6', emoji: '💬' },
    { label: 'Stories Read', gujarati: 'વાર્તાઓ', current: progress.storiesRead.length, total: totalStories, color: '#E91E8A', emoji: '📖' },
  ];

  const overallPercent = Math.round(
    ((progress.lettersLearned.length + progress.wordsLearned.length + progress.phrasesLearned.length) /
    (totalLetters + totalWords + totalPhrases)) * 100
  );

  const getBadge = () => {
    if (overallPercent >= 80) return { emoji: '🏆', title: 'Gujarati Champion!', gujarati: 'ગુજરાતી વિજેતા' };
    if (overallPercent >= 60) return { emoji: '🌟', title: 'Star Learner!', gujarati: 'તારા વિદ્યાર્થી' };
    if (overallPercent >= 40) return { emoji: '🎯', title: 'Rising Star!', gujarati: 'ઉદય તારો' };
    if (overallPercent >= 20) return { emoji: '🌱', title: 'Growing Learner!', gujarati: 'વિકસતો વિદ્યાર્થી' };
    return { emoji: '🚀', title: 'Getting Started!', gujarati: 'શરૂઆત!' };
  };

  const badge = getBadge();

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="gujarati-text text-3xl font-extrabold" style={{ color: 'var(--accent-saffron)' }}>
          પ્રગતિ — Progress ⭐
        </h2>
      </div>

      {/* Badge */}
      <div className="card p-8 text-center mb-6" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)' }}>
        <div className="text-6xl mb-3 animate-float">{badge.emoji}</div>
        <h3 className="text-2xl font-extrabold mb-1">{badge.title}</h3>
        <p className="gujarati-text text-lg font-bold" style={{ color: 'var(--accent-saffron)' }}>{badge.gujarati}</p>
        <div className="mt-4">
          <span className="text-4xl font-extrabold animate-rainbow">{overallPercent}%</span>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>Overall Progress</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stat.emoji}</span>
                <div>
                  <div className="font-extrabold">{stat.label}</div>
                  <div className="gujarati-text text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.gujarati}</div>
                </div>
              </div>
              <div className="font-extrabold text-lg" style={{ color: stat.color }}>
                {stat.current}/{stat.total}
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stat.total > 0 ? (stat.current / stat.total) * 100 : 0}%`, background: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Stats */}
      <div className="card p-5 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <h3 className="font-extrabold">Quiz Stats</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl" style={{ background: '#FFFBEB' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#F1C40F' }}>{progress.quizScore}</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Stars Earned</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#EFF6FF' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#3B82F6' }}>{progress.quizTotal}</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Questions</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#ECFDF5' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#2ECC71' }}>
              {progress.quizTotal > 0 ? Math.round((progress.quizScore / progress.quizTotal) * 100) : 0}%
            </div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Accuracy</div>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="text-center mt-6">
        <button className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)', background: '#F0E6DC' }}
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone!')) {
              setProgress({ lettersLearned: [], wordsLearned: [], phrasesLearned: [], quizScore: 0, quizTotal: 0, storiesRead: [] });
              localStorage.removeItem('gujarati-kids-progress');
            }
          }}>
          🗑️ Reset Progress
        </button>
      </div>
    </div>
  );
}
