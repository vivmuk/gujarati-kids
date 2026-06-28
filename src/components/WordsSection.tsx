'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { words, categoryMeta, type WordItem } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { getWordImage, getWordAudio } from '@/data/assets';
import { HalftoneOverlay } from './RisoFolk';
import { useWordImage } from './useWordImage';
import { usePronunciation } from './usePronunciation';

const categoryImages: Record<string, string> = {
  animal: '/images/animal.webp', fruit: '/images/fruit.webp', color: '/images/color.webp',
  body: '/images/body.webp', family: '/images/family.webp', food: '/images/food.webp',
  nature: '/images/nature.webp', number: '/images/number.webp',
  surat: '/images/surat.webp',
};

interface Props {
  wordsLearned: string[];
  onWordLearned: (word: string) => void;
}

// ─── Word Popup ───────────────────────────────────────────────────────────────

interface WordDeckProps {
  deck: WordItem[];
  startIndex: number;
  onClose: () => void;
  speak: (text: string, id: string) => void;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  onWordLearned: (word: string) => void;
}

function WordDeckCard({ word, speak, currentlyPlaying, ttsLoading, onWordLearned }: {
  word: WordItem;
  speak: (text: string, id: string) => void;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  onWordLearned: (word: string) => void;
}) {
  const popupId = `popup-${word.gujarati}`;
  const meta = categoryMeta[word.category];
  const { src, loading, generate, handleStaticError } = useWordImage(word.roman, word.english, true);
  const { isRecording, isProcessing, score, startPronunciationCheck, stopPronunciationCheck } = usePronunciation();

  // Auto-play audio + mark learned whenever the card it's mounted for changes
  useEffect(() => {
    const audioPath = getWordAudio(word.roman);
    speak(audioPath || word.gujarati, popupId);
    onWordLearned(word.gujarati);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.gujarati]);

  const handlePlay = useCallback(() => {
    const audioPath = getWordAudio(word.roman);
    speak(audioPath || word.gujarati, popupId);
  }, [word.roman, word.gujarati, speak, popupId]);

  const isPlaying = currentlyPlaying === popupId;

  return (
    <div
      className="relative bg-white rounded-3xl shadow-2xl w-full p-6 flex flex-col items-center gap-4"
      style={{ border: '2.5px solid var(--rf-indigo, #3B3596)', boxShadow: '6px 6px 0 var(--rf-indigo, #3B3596)' }}
    >
      {/* Image area */}
      <div
        className="w-full rounded-2xl overflow-hidden flex items-center justify-center bg-white"
        style={{ height: 200, border: '1.5px solid #e5e7eb' }}
      >
        {loading ? (
          <div className="w-full h-full rounded-2xl animate-pulse" style={{ background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%' }} />
        ) : src ? (
          <img
            src={src}
            alt={word.english}
            className="w-full h-full object-contain rounded-2xl"
            onError={handleStaticError}
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <span className="text-5xl">{meta?.emoji || '🖼️'}</span>
            <button
              onClick={generate}
              className="text-xs text-gray-400 underline hover:text-gray-600"
            >
              Generate image
            </button>
          </div>
        )}
      </div>

      {/* Gujarati word */}
      <p
        className="text-4xl font-black text-center leading-tight"
        style={{ fontFamily: 'var(--font-gujarati)', color: 'var(--rf-indigo, #3B3596)' }}
      >
        {word.gujarati}
      </p>

      {/* Roman transliteration */}
      <p className="text-lg text-gray-500 font-semibold -mt-2">{word.roman}</p>

      {/* English meaning */}
      <p className="text-xl font-bold" style={{ color: 'var(--rf-ink, #1a1a1a)' }}>{word.english}</p>

      {/* Play button */}
      <button
        onClick={handlePlay}
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
        style={{
          background: isPlaying ? 'var(--saffron-200, #FDE68A)' : 'var(--saffron-500, #FFA63D)',
          color: 'white',
          fontSize: 28,
        }}
        aria-label="Play pronunciation"
      >
        <SpeakIcon id={popupId} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
      </button>

      {/* Pronunciation Practice */}
      <div className="w-full mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Practice Pronunciation</p>
        <div className="flex items-center gap-3">
          <button
            onMouseDown={() => startPronunciationCheck(word.gujarati)}
            onMouseUp={stopPronunciationCheck}
            onTouchStart={() => startPronunciationCheck(word.gujarati)}
            onTouchEnd={stopPronunciationCheck}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg scale-110' : 'bg-gray-100 text-gray-600 active:scale-95'}`}
          >
            🎤
          </button>
          <div className="flex-1">
            {isRecording ? (
              <p className="text-sm font-bold text-red-500">Listening... Release to score</p>
            ) : isProcessing ? (
              <p className="text-sm font-bold text-gray-500 animate-pulse">Checking...</p>
            ) : score !== null ? (
              <div className="flex items-center gap-1">
                <span className="text-xl">{score >= 1 ? '⭐' : '❌'}</span>
                <span className="text-xl">{score >= 2 ? '⭐' : '⬛'}</span>
                <span className="text-xl">{score >= 3 ? '⭐' : '⬛'}</span>
                <span className="text-xs font-bold text-gray-500 ml-2">
                  {score === 3 ? 'Perfect!' : score > 0 ? 'Good try!' : 'Try again'}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Hold mic and say the word</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WordDeck({ deck, startIndex, onClose, speak, currentlyPlaying, ttsLoading, onWordLearned }: WordDeckProps) {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const goNext = useCallback(() => setIndex(i => Math.min(i + 1, deck.length - 1)), [deck.length]);
  const goPrev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) < 50 || dy > Math.abs(dx) * 0.8) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const word = deck[index];
  if (!word) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={handleBackdrop}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full max-w-sm">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 bg-white shadow-md hover:bg-gray-100 transition-colors text-lg font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Prev / Next arrows */}
        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous word"
            className="absolute left-[-14px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md text-lg font-black active:scale-90"
            style={{ color: 'var(--rf-indigo)' }}
          >
            ‹
          </button>
        )}
        {index < deck.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next word"
            className="absolute right-[-14px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md text-lg font-black active:scale-90"
            style={{ color: 'var(--rf-indigo)' }}
          >
            ›
          </button>
        )}

        <WordDeckCard
          key={word.gujarati}
          word={word}
          speak={speak}
          currentlyPlaying={currentlyPlaying}
          ttsLoading={ttsLoading}
          onWordLearned={onWordLearned}
        />

        {/* Position dots */}
        <p className="text-center text-white text-xs font-bold mt-3 drop-shadow">
          {index + 1} / {deck.length} · swipe to browse
        </p>
      </div>
    </div>
  );
}

// ─── Words Section ────────────────────────────────────────────────────────────

export function WordsSection({ wordsLearned, onWordLearned }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('animal');
  const [deckStartIndex, setDeckStartIndex] = useState<number | null>(null);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const categories = [...new Set(words.map(w => w.category))];
  const filtered = words.filter(w => w.category === activeCategory);

  const handleCardClick = useCallback((index: number) => {
    setDeckStartIndex(index);
  }, []);

  const handleCloseDeck = useCallback(() => {
    setDeckStartIndex(null);
  }, []);

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--rf-indigo)', border: 'var(--rf-border)', boxShadow: 'var(--rf-shadow-saffron)' }}>
        <HalftoneOverlay alpha={0.1} size={7} />
        <div className="relative flex items-center gap-3 p-4 text-white">
          <img
            src={categoryImages[activeCategory] || '/images/gen/category-surat.webp'}
            alt=""
            className="w-14 h-14 rounded-xl object-contain border-2 border-white/30"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/animal.webp'; }}
          />
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
          const imgPath = getWordImage(word.roman);
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(i); }}
              className={`word-card ${isLearned ? 'learned' : ''} p-3.5 cursor-pointer`}
              style={{ position: 'relative', border: 'var(--rf-border)', boxShadow: isLearned ? '3px 3px 0 var(--emerald-400)' : 'var(--rf-shadow-saffron)' }}
            >
              {imgPath && (
                <img
                  src={imgPath}
                  alt={word.english}
                  className="w-full h-20 object-contain rounded-lg mb-2"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <p className="text-xl font-black leading-tight" style={{ fontFamily: 'var(--font-gujarati)' }}>{word.gujarati}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const audioPath = getWordAudio(word.roman);
                    speak(audioPath || word.gujarati, id);
                    onWordLearned(word.gujarati);
                  }}
                  className="speak-btn w-8 h-8 rounded-full flex items-center justify-center text-xs"
                  style={{ background: isPlaying ? 'var(--saffron-200)' : `${meta?.color || '#FFA63D'}18`, color: meta?.color || '#FFA63D' }}
                >
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

      {/* Swipeable word deck */}
      {deckStartIndex !== null && (
        <WordDeck
          deck={filtered}
          startIndex={deckStartIndex}
          onClose={handleCloseDeck}
          speak={speak}
          currentlyPlaying={currentlyPlaying}
          ttsLoading={ttsLoading}
          onWordLearned={onWordLearned}
        />
      )}
    </div>
  );
}
