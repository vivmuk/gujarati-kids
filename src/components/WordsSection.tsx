'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { categoryMeta, words, type WordItem } from '@/data/gujarati';
import { getWordAudio, getWordImage } from '@/data/assets';
import { useSpeak } from './useSpeak';
import { useWordImage } from './useWordImage';
import { categoryIcon, Icon } from './Icon';
import { Art, Chip, Deck, EmptyState, LearnedStamp, Meter, PlayButton, SayItBack, SectionHeader, SpeakButton } from './ui';

interface Props {
  wordsLearned: string[];
  onWordLearned: (word: string) => void;
}

/* ------------------------------------------------------------- Deck card */

function WordCard({
  word,
  speak,
  currentlyPlaying,
  ttsLoading,
  ttsProgress,
  failedId,
  onWordLearned,
}: {
  word: WordItem;
  speak: (text: string, id: string, fallbackText?: string) => void;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  ttsProgress: number;
  failedId: string | null;
  onWordLearned: (word: string) => void;
}) {
  const cardId = `word-card-${word.roman}`;
  const meta = categoryMeta[word.category];
  const { src, loading, generate, handleStaticError } = useWordImage(word.roman, word.english, true);

  // Opening a card plays it and counts it as met.
  useEffect(() => {
    speak(getWordAudio(word.roman) || word.gujarati, cardId, word.gujarati);
    onWordLearned(word.gujarati);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.gujarati]);

  return (
    <div
      className="rf-surface flex flex-col items-center"
      style={{
        gap: 'var(--s-3)',
        padding: 'var(--s-5)',
        boxShadow: 'var(--lift-3) var(--ink-indigo), var(--shadow-float)',
      }}
    >
      <div
        className="rf-art-frame flex w-full items-center justify-center"
        style={{ height: 200 }}
      >
        {loading ? (
          <div className="rf-skeleton h-full w-full" />
        ) : src ? (
          <img
            src={src}
            alt={word.english}
            onError={handleStaticError}
            className="rf-art h-full w-full"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center" style={{ gap: 'var(--s-2)', color: 'var(--text-3)' }}>
            <Icon name={categoryIcon(word.category)} size={44} />
            <button type="button" onClick={generate} className="rf-btn rf-btn--paper">
              <Icon name="image" size={16} />
              Draw this word
            </button>
          </div>
        )}
      </div>

      <span
        className="rf-chip"
        style={{ background: meta?.color, color: 'var(--text-on-ink)', minHeight: 32, pointerEvents: 'none' }}
      >
        <Icon name={categoryIcon(word.category)} size={15} strokeWidth={2.3} />
        {meta?.label ?? word.category}
      </span>

      <p
        className="rf-gujarati text-center"
        style={{ fontSize: 'var(--t-3xl)', fontWeight: 800, lineHeight: 1.2, color: 'var(--ink-indigo)' }}
      >
        {word.gujarati}
      </p>
      <p style={{ fontSize: 'var(--t-lg)', fontWeight: 600, color: 'var(--text-2)', marginTop: 'calc(var(--s-2) * -1)' }}>
        {word.roman}
      </p>
      <p style={{ fontSize: 'var(--t-xl)', fontWeight: 700 }}>{word.english}</p>

      <PlayButton
        id={cardId}
        label={`Hear ${word.gujarati}`}
        onClick={() => speak(getWordAudio(word.roman) || word.gujarati, cardId, word.gujarati)}
        currentlyPlaying={currentlyPlaying}
        ttsLoading={ttsLoading}
        ttsProgress={ttsProgress}
        failedId={failedId}
        size={62}
      />

      <SayItBack target={word.gujarati} hint="Hold the mic and say the word" />
    </div>
  );
}

/* ---------------------------------------------------------------- Section */

export function WordsSection({ wordsLearned, onWordLearned }: Props) {
  const [activeCategory, setActiveCategory] = useState('animal');
  const [deckIndex, setDeckIndex] = useState<number | null>(null);
  const { speak, currentlyPlaying, ttsLoading, ttsProgress, failedId } = useSpeak();

  const categories = useMemo(() => [...new Set(words.map(word => word.category))], []);
  const filtered = useMemo(
    () => words.filter(word => word.category === activeCategory),
    [activeCategory]
  );
  const learnedHere = filtered.filter(word => wordsLearned.includes(word.gujarati)).length;
  const meta = categoryMeta[activeCategory];

  const closeDeck = useCallback(() => setDeckIndex(null), []);

  return (
    <div className="rf-grid" style={{ gap: 'var(--s-4)' }}>
      <SectionHeader
        icon="words"
        title="Learn words"
        gujarati="શબ્દો શીખો"
        action={
          <span className="text-right" style={{ color: 'var(--text-on-ink)' }}>
            <span className="block tabular-nums" style={{ fontSize: 'var(--t-xl)', fontWeight: 700, lineHeight: 1 }}>
              {words.length}
            </span>
            <span className="rf-label" style={{ color: 'var(--text-on-ink-2)' }}>
              words
            </span>
          </span>
        }
      />

      <div
        className="rf-scroll-x"
        style={{ gap: 'var(--s-2)', margin: '0 calc(var(--s-4) * -1)', padding: '0 var(--s-4) var(--s-1)' }}
        role="group"
        aria-label="Word groups"
      >
        {categories.map(category => (
          <Chip
            key={category}
            active={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            icon={categoryIcon(category)}
            ink={categoryMeta[category]?.color}
          >
            {categoryMeta[category]?.label ?? category}
          </Chip>
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ gap: 'var(--s-3)' }}>
        <h2 style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>
          {meta?.label ?? activeCategory}
          {meta?.gujarati && (
            <span className="rf-gujarati" style={{ fontWeight: 600, color: 'var(--text-2)' }}>
              {' '}
              · {meta.gujarati}
            </span>
          )}
        </h2>
        <span
          className="tabular-nums"
          style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--text-2)', flex: 'none' }}
        >
          {learnedHere}/{filtered.length}
        </span>
      </div>

      <Meter
        value={learnedHere}
        max={filtered.length}
        ink={meta?.color}
        label={`${learnedHere} of ${filtered.length} ${meta?.label ?? activeCategory} words met`}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="words"
          title="Nothing in this group yet"
          body="This group has no words yet. Pick another group above to keep going."
        />
      ) : (
        <div className="rf-grid rf-grid--cards">
          {filtered.map((word, index) => {
            const id = `word-${word.roman}`;
            const isLearned = wordsLearned.includes(word.gujarati);
            return (
              <div
                key={word.roman}
                className={`rf-press rf-surface relative ${
                  isLearned ? 'rf-lift-leaf' : 'rf-lift-saffron'
                }`}
                style={{ padding: 'var(--s-3)' }}
              >
                {/* The card opens the deck; the speak control sits above it.
                    Two sibling buttons, never one nested inside the other. */}
                <button
                  type="button"
                  onClick={() => setDeckIndex(index)}
                  aria-label={`Open ${word.english}, ${word.gujarati}${isLearned ? ', already learned' : ''}`}
                  className="absolute inset-0"
                  style={{ background: 'none', border: 0, borderRadius: 'var(--r-lg)', cursor: 'pointer' }}
                />

                {isLearned && (
                  <span
                    style={{ position: 'absolute', top: -10, right: -8, zIndex: 2, pointerEvents: 'none' }}
                  >
                    <LearnedStamp />
                  </span>
                )}

                <Art
                  src={getWordImage(word.roman)}
                  alt=""
                  icon={categoryIcon(word.category)}
                  className="rf-art-frame w-full"
                  style={{ height: 96, marginBottom: 'var(--s-2)' }}
                />

                <div className="relative flex items-start justify-between" style={{ gap: 'var(--s-2)', pointerEvents: 'none' }}>
                  <p
                    className="rf-gujarati min-w-0 flex-1 truncate"
                    style={{ fontSize: 'var(--t-xl)', fontWeight: 800, lineHeight: 1.25 }}
                  >
                    {word.gujarati}
                  </p>
                  <span style={{ pointerEvents: 'auto' }}>
                    <SpeakButton
                      id={id}
                      label={`Hear ${word.gujarati}`}
                      onClick={() => {
                        speak(getWordAudio(word.roman) || word.gujarati, id, word.gujarati);
                        onWordLearned(word.gujarati);
                      }}
                      currentlyPlaying={currentlyPlaying}
                      ttsLoading={ttsLoading}
                      ttsProgress={ttsProgress}
                failedId={failedId}
                    />
                  </span>
                </div>

                <p className="relative" style={{ fontSize: 'var(--t-xs)', fontWeight: 600, color: 'var(--text-2)', pointerEvents: 'none' }}>
                  {word.roman}
                </p>
                <p className="relative" style={{ fontSize: 'var(--t-sm)', fontWeight: 700, pointerEvents: 'none' }}>
                  {word.english}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {deckIndex !== null && filtered[deckIndex] && (
        <Deck
          count={filtered.length}
          index={deckIndex}
          onIndex={setDeckIndex}
          onClose={closeDeck}
          title={`${meta?.label ?? activeCategory} words`}
        >
          <WordCard
            key={filtered[deckIndex].roman}
            word={filtered[deckIndex]}
            speak={speak}
            currentlyPlaying={currentlyPlaying}
            ttsLoading={ttsLoading}
            ttsProgress={ttsProgress}
            failedId={failedId}
            onWordLearned={onWordLearned}
          />
        </Deck>
      )}
    </div>
  );
}
