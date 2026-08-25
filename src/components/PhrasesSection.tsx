'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { categoryMeta, phrases, type PhraseItem } from '@/data/gujarati';
import { getPhraseAudio, getPhraseImage } from '@/data/assets';
import { useSpeak } from './useSpeak';
import { categoryIcon, Icon } from './Icon';
import { Art, Chip, Deck, EmptyState, LearnedStamp, Meter, PlayButton, SayItBack, SectionHeader, SpeakButton } from './ui';

interface Props {
  phrasesLearned: string[];
  onPhraseLearned: (phrase: string) => void;
}

const LEVEL_LABEL: Record<number, string> = {
  1: 'Starter',
  2: 'Next step',
  3: 'Stretch',
};

/* ------------------------------------------------------------- Deck card */

function PhraseCard({
  phrase,
  speak,
  currentlyPlaying,
  ttsLoading,
  ttsProgress,
  failedId,
  onPhraseLearned,
}: {
  phrase: PhraseItem;
  speak: (text: string, id: string, fallbackText?: string) => void;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  ttsProgress: number;
  failedId: string | null;
  onPhraseLearned: (phrase: string) => void;
}) {
  const cardId = `phrase-card-${phrase.roman}`;
  const meta = categoryMeta[phrase.category];

  useEffect(() => {
    speak(getPhraseAudio(phrase.roman) || phrase.gujarati, cardId, phrase.gujarati);
    onPhraseLearned(phrase.gujarati);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase.gujarati]);

  return (
    <div
      className="rf-surface flex flex-col items-center"
      style={{
        gap: 'var(--s-3)',
        padding: 'var(--s-5)',
        boxShadow: 'var(--lift-3) var(--ink-indigo), var(--shadow-float)',
      }}
    >
      <Art
        src={getPhraseImage(phrase.roman)}
        alt={phrase.english}
        icon={categoryIcon(phrase.category)}
        className="rf-art-frame w-full"
        style={{ height: 180 }}
      />

      <span
        className="rf-chip"
        style={{ background: meta?.color, color: 'var(--text-on-ink)', minHeight: 32, pointerEvents: 'none' }}
      >
        <Icon name={categoryIcon(phrase.category)} size={15} strokeWidth={2.3} />
        {meta?.label ?? phrase.category}
      </span>

      <p
        className="rf-gujarati text-center"
        style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, lineHeight: 1.3, color: 'var(--ink-indigo)' }}
      >
        {phrase.gujarati}
      </p>
      <p style={{ fontSize: 'var(--t-md)', fontWeight: 600, color: 'var(--text-2)', marginTop: 'calc(var(--s-2) * -1)' }}>
        {phrase.roman}
      </p>
      <p className="text-center" style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>
        {phrase.english}
      </p>

      <PlayButton
        id={cardId}
        label={`Hear ${phrase.gujarati}`}
        onClick={() => speak(getPhraseAudio(phrase.roman) || phrase.gujarati, cardId, phrase.gujarati)}
        currentlyPlaying={currentlyPlaying}
        ttsLoading={ttsLoading}
        ttsProgress={ttsProgress}
        failedId={failedId}
        size={62}
      />

      <SayItBack target={phrase.gujarati} hint="Hold the mic and say the phrase" />
    </div>
  );
}

/* ---------------------------------------------------------------- Section */

export function PhrasesSection({ phrasesLearned, onPhraseLearned }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [deckIndex, setDeckIndex] = useState<number | null>(null);
  const { speak, currentlyPlaying, ttsLoading, ttsProgress, failedId } = useSpeak();

  const categories = useMemo(() => [...new Set(phrases.map(phrase => phrase.category))], []);
  const filtered = useMemo(
    () => (activeCategory === 'all' ? phrases : phrases.filter(p => p.category === activeCategory)),
    [activeCategory]
  );
  const learnedHere = filtered.filter(phrase => phrasesLearned.includes(phrase.gujarati)).length;

  const closeDeck = useCallback(() => setDeckIndex(null), []);

  return (
    <div className="rf-grid" style={{ gap: 'var(--s-4)' }}>
      <SectionHeader
        icon="phrases"
        title="Say it out loud"
        gujarati="વાક્યો બોલો"
        action={
          <span className="text-right" style={{ color: 'var(--text-on-ink)' }}>
            <span className="block tabular-nums" style={{ fontSize: 'var(--t-xl)', fontWeight: 700, lineHeight: 1 }}>
              {learnedHere}
              <span style={{ fontSize: 'var(--t-sm)', color: 'var(--text-on-ink-2)' }}>/{filtered.length}</span>
            </span>
            <span className="rf-label" style={{ color: 'var(--text-on-ink-2)' }}>
              heard
            </span>
          </span>
        }
      />

      <div
        className="rf-scroll-x"
        style={{ gap: 'var(--s-2)', margin: '0 calc(var(--s-4) * -1)', padding: '0 var(--s-4) var(--s-1)' }}
        role="group"
        aria-label="Phrase groups"
      >
        <Chip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} icon="phrases">
          All phrases
        </Chip>
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

      <Meter
        value={learnedHere}
        max={filtered.length}
        label={`${learnedHere} of ${filtered.length} phrases heard`}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="phrases"
          title="No phrases in this group"
          body="Pick another group above, or tap All phrases to see everything."
          action={
            <button type="button" className="rf-btn rf-btn--primary" onClick={() => setActiveCategory('all')}>
              Show all phrases
            </button>
          }
        />
      ) : (
        <div className="rf-grid rf-grid--list">
          {filtered.map((phrase, index) => {
            const id = `phrase-${phrase.roman}`;
            const isLearned = phrasesLearned.includes(phrase.gujarati);
            const meta = categoryMeta[phrase.category];
            return (
              <div
                key={phrase.roman}
                className={`rf-press rf-surface relative flex items-center ${
                  isLearned ? 'rf-lift-leaf' : 'rf-lift-indigo'
                }`}
                style={{ gap: 'var(--s-3)', padding: 'var(--s-3)' }}
              >
                <button
                  type="button"
                  onClick={() => setDeckIndex(index)}
                  aria-label={`Open ${phrase.english}${isLearned ? ', already learned' : ''}`}
                  className="absolute inset-0"
                  style={{ background: 'none', border: 0, borderRadius: 'var(--r-lg)', cursor: 'pointer' }}
                />
                <Art
                  src={getPhraseImage(phrase.roman)}
                  alt=""
                  icon={categoryIcon(phrase.category)}
                  className="rf-art-frame"
                  style={{ width: 72, height: 72, flex: 'none' }}
                />

                <div className="relative min-w-0 flex-1" style={{ pointerEvents: 'none' }}>
                  <div className="flex items-center" style={{ gap: 'var(--s-2)' }}>
                    <span
                      className="rf-label"
                      style={{ color: meta?.color, letterSpacing: '0.06em' }}
                    >
                      {meta?.label ?? phrase.category} · {LEVEL_LABEL[phrase.level] ?? `Level ${phrase.level}`}
                    </span>
                    {isLearned && <LearnedStamp />}
                  </div>
                  <p
                    className="rf-gujarati truncate"
                    style={{ fontSize: 'var(--t-lg)', fontWeight: 700, lineHeight: 1.3 }}
                  >
                    {phrase.gujarati}
                  </p>
                  <p className="truncate" style={{ fontSize: 'var(--t-sm)', fontWeight: 600 }}>
                    {phrase.english}
                  </p>
                  <p className="truncate" style={{ fontSize: 'var(--t-xs)', color: 'var(--text-2)' }}>
                    {phrase.roman}
                  </p>
                </div>

                <span className="relative">
                  <SpeakButton
                    id={id}
                    label={`Hear ${phrase.gujarati}`}
                    onClick={() => {
                      speak(getPhraseAudio(phrase.roman) || phrase.gujarati, id, phrase.gujarati);
                      onPhraseLearned(phrase.gujarati);
                    }}
                    currentlyPlaying={currentlyPlaying}
                    ttsLoading={ttsLoading}
                    ttsProgress={ttsProgress}
                failedId={failedId}
                  />
                </span>
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
          title="Phrases"
        >
          <PhraseCard
            key={filtered[deckIndex].roman}
            phrase={filtered[deckIndex]}
            speak={speak}
            currentlyPlaying={currentlyPlaying}
            ttsLoading={ttsLoading}
            ttsProgress={ttsProgress}
            failedId={failedId}
            onPhraseLearned={onPhraseLearned}
          />
        </Deck>
      )}
    </div>
  );
}
