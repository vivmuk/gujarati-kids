'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { phrases, categoryMeta, type PhraseItem } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { getPhraseImage, getPhraseAudio } from '@/data/assets';
import { HalftoneOverlay } from './RisoFolk';
import { usePronunciation } from './usePronunciation';

interface Props {
  phrasesLearned: string[];
  onPhraseLearned: (phrase: string) => void;
}

// ─── Phrase Popup Deck ─────────────────────────────────────────────────────

interface PhraseDeckProps {
  deck: PhraseItem[];
  startIndex: number;
  onClose: () => void;
  speak: (text: string, id: string) => void;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  onPhraseLearned: (phrase: string) => void;
}

function PhraseDeckCard({ phrase, speak, currentlyPlaying, ttsLoading, onPhraseLearned }: {
  phrase: PhraseItem;
  speak: (text: string, id: string) => void;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  onPhraseLearned: (phrase: string) => void;
}) {
  const popupId = `popup-phrase-${phrase.gujarati}`;
  const meta = categoryMeta[phrase.category];
  const imgPath = getPhraseImage(phrase.roman);
  const { isRecording, isProcessing, score, startPronunciationCheck, stopPronunciationCheck, setScore } = usePronunciation();

  useEffect(() => {
    const audioPath = getPhraseAudio(phrase.roman);
    speak(audioPath || phrase.gujarati, popupId);
    onPhraseLearned(phrase.gujarati);
    setScore(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase.gujarati]);

  const handlePlay = useCallback(() => {
    const audioPath = getPhraseAudio(phrase.roman);
    speak(audioPath || phrase.gujarati, popupId);
  }, [phrase.roman, phrase.gujarati, speak, popupId]);

  const isPlaying = currentlyPlaying === popupId;

  return (
    <div
      className="relative bg-white rounded-3xl shadow-2xl w-full p-6 flex flex-col items-center gap-4"
      style={{ border: '2.5px solid var(--rf-indigo, #3B3596)', boxShadow: '6px 6px 0 var(--rf-indigo, #3B3596)' }}
    >
      {/* Image area */}
      <div
        className="w-full rounded-2xl overflow-hidden flex items-center justify-center bg-white"
        style={{ height: 180, border: '1.5px solid #e5e7eb' }}
      >
        {imgPath ? (
          <img
            src={imgPath}
            alt={phrase.english}
            className="w-full h-full object-contain rounded-2xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            draggable={false}
          />
        ) : (
          <span className="text-5xl">{meta?.emoji || '💬'}</span>
        )}
      </div>

      {/* Gujarati phrase */}
      <p
        className="text-3xl font-black text-center leading-tight"
        style={{ fontFamily: 'var(--font-gujarati)', color: 'var(--rf-indigo, #3B3596)' }}
      >
        {phrase.gujarati}
      </p>

      {/* Roman transliteration */}
      <p className="text-lg text-gray-500 font-semibold -mt-2">{phrase.roman}</p>

      {/* English meaning */}
      <p className="text-xl font-bold" style={{ color: 'var(--rf-ink, #1a1a1a)' }}>{phrase.english}</p>

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
            onMouseDown={() => startPronunciationCheck(phrase.gujarati)}
            onMouseUp={stopPronunciationCheck}
            onTouchStart={() => startPronunciationCheck(phrase.gujarati)}
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
              <p className="text-sm text-gray-500">Hold mic and say the phrase</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhraseDeck({ deck, startIndex, onClose, speak, currentlyPlaying, ttsLoading, onPhraseLearned }: PhraseDeckProps) {
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

  const phrase = deck[index];
  if (!phrase) return null;

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
            aria-label="Previous phrase"
            className="absolute left-[-14px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md text-lg font-black active:scale-90"
            style={{ color: 'var(--rf-indigo)' }}
          >
            ‹
          </button>
        )}
        {index < deck.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next phrase"
            className="absolute right-[-14px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md text-lg font-black active:scale-90"
            style={{ color: 'var(--rf-indigo)' }}
          >
            ›
          </button>
        )}

        <PhraseDeckCard
          key={phrase.gujarati}
          phrase={phrase}
          speak={speak}
          currentlyPlaying={currentlyPlaying}
          ttsLoading={ttsLoading}
          onPhraseLearned={onPhraseLearned}
        />

        {/* Position dots */}
        <p className="text-center text-white text-xs font-bold mt-3 drop-shadow">
          {index + 1} / {deck.length} · swipe to browse
        </p>
      </div>
    </div>
  );
}

// ─── Phrases Section ────────────────────────────────────────────────────────

export function PhrasesSection({ phrasesLearned, onPhraseLearned }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('greeting');
  const [deckStartIndex, setDeckStartIndex] = useState<number | null>(null);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const categories = [...new Set(phrases.map(p => p.category))];
  const filtered = phrases.filter(p => p.category === activeCategory);

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
          <img src="/images/greeting.webp" alt="" className="w-14 h-14 rounded-xl object-contain border-2 border-white/30" />
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
          // AI-generated illustration in 90s Indian textbook style
          const imgPath = getPhraseImage(phrase.roman);
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(i); }}
              className="rf-card p-4 cursor-pointer"
              style={{ boxShadow: isLearned ? '4px 4px 0 var(--emerald-400)' : 'var(--rf-shadow-saffron)' }}
            >
              <div className="flex items-start gap-3">
                {imgPath && (
                  <img
                    src={imgPath}
                    alt={phrase.english}
                    className="w-20 h-20 rounded-xl object-contain flex-shrink-0 border-2 border-white shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{phrase.gujarati}</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">{phrase.roman}</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{phrase.english}</p>
                </div>
                <button onClick={(e) => {
                    e.stopPropagation();
                    const audioPath = getPhraseAudio(phrase.roman);
                    speak(audioPath || phrase.gujarati, id);
                    if (!isLearned) onPhraseLearned(phrase.gujarati);
                  }}
                  className="speak-btn w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: isPlaying ? 'var(--saffron-200)' : 'var(--gradient-saffron)', color: isPlaying ? 'var(--saffron-700)' : 'white' }}>
                  <SpeakIcon id={id} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swipeable phrase deck */}
      {deckStartIndex !== null && (
        <PhraseDeck
          deck={filtered}
          startIndex={deckStartIndex}
          onClose={handleCloseDeck}
          speak={speak}
          currentlyPlaying={currentlyPlaying}
          ttsLoading={ttsLoading}
          onPhraseLearned={onPhraseLearned}
        />
      )}
    </div>
  );
}
