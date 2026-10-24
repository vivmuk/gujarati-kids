'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { categoryMeta, words, type WordItem } from '@/data/gujarati';
import { getWordAudio, getWordImage } from '@/data/assets';
import { useSpeak } from './useSpeak';
import { useSfx } from './useSfx';
import { categoryIcon, Icon } from './Icon';
import { Art, Chip, Confetti, Meter, SectionHeader, usePrefersReducedMotion } from './ui';

/**
 * સાંભળો · શોધો — Listen, then find the picture.
 *
 * The one skill every other section assumes: hearing a Gujarati word and
 * knowing what it means without reading anything. Cards carry no captions
 * until a child has had two goes at a round, so the ear does the work.
 */

const ROUNDS = 8;
const OPTIONS = 4;
const ADVANCE_MS = 1150;

type Round = { word: WordItem; options: WordItem[]; answer: number };

const GROUPS = Object.entries(categoryMeta)
  .filter(([key]) => words.some(word => word.category === key))
  .map(([key, meta]) => ({ key, ...meta, count: words.filter(word => word.category === key).length }))
  .sort((a, b) => b.count - a.count);

function shuffled<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(groups: string[]): Round[] {
  const pool = words.filter(word => groups.length === 0 || groups.includes(word.category));
  const rounds: Round[] = [];
  const used = new Set<string>();

  for (let i = 0; i < ROUNDS; i++) {
    // A word never repeats inside one game; if the pool runs dry, allow reuse.
    const fresh = pool.filter(word => !used.has(word.roman));
    const source = fresh.length >= OPTIONS ? fresh : pool;
    const word = source[Math.floor(Math.random() * source.length)];
    used.add(word.roman);

    // Distractors come from the same group first — a lion among animals is a
    // real choice, a lion among four fruits is a giveaway.
    const siblings = shuffled(pool.filter(item => item.roman !== word.roman && item.category === word.category));
    const others = shuffled(pool.filter(item => item.roman !== word.roman && item.category !== word.category));
    const options = shuffled([word, ...siblings, ...others].slice(0, OPTIONS));
    rounds.push({ word, options, answer: options.findIndex(option => option.roman === word.roman) });
  }
  return rounds;
}

export function ListenFind({ onWordLearned }: { onWordLearned: (word: string) => void }) {
  const { speak, currentlyPlaying } = useSpeak();
  const { play: playSfx } = useSfx();
  const reduced = usePrefersReducedMotion();

  const [groups, setGroups] = useState<string[]>([]);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [deck, setDeck] = useState<Round[]>([]);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [stars, setStars] = useState(0);
  const timer = useRef<number | null>(null);

  const current = deck[round];
  const hint = wrong.length >= 2;

  const clearTimer = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const say = useCallback(
    (word: WordItem) => {
      const id = `listen-find-${word.roman}`;
      speak(getWordAudio(word.roman) || word.gujarati, id, word.gujarati);
    },
    [speak]
  );

  // Every new round speaks itself. A short beat first, so the pictures land
  // before the voice starts talking over them.
  useEffect(() => {
    if (phase !== 'playing' || !current) return;
    const id = window.setTimeout(() => say(current.word), reduced ? 0 : 380);
    return () => window.clearTimeout(id);
  }, [phase, current, say, reduced]);

  const start = () => {
    playSfx('tap');
    setDeck(buildDeck(groups));
    setRound(0);
    setPicked(null);
    setWrong([]);
    setStars(0);
    setPhase('playing');
  };

  const answer = (index: number) => {
    if (!current || picked !== null || wrong.includes(index)) return;

    if (index === current.answer) {
      const firstTry = wrong.length === 0;
      setPicked(index);
      playSfx('correct');
      if (firstTry) {
        setStars(value => value + 1);
        window.setTimeout(() => playSfx('star'), 260);
        onWordLearned(current.word.gujarati);
      }
      clearTimer();
      timer.current = window.setTimeout(() => {
        if (round + 1 >= deck.length) {
          setPhase('done');
          if (stars + (firstTry ? 1 : 0) >= 6) playSfx('win');
        } else {
          setRound(value => value + 1);
          setPicked(null);
          setWrong([]);
        }
      }, reduced ? 380 : ADVANCE_MS);
    } else {
      playSfx('retry');
      setWrong(value => [...value, index]);
    }
  };

  const heardId = current ? `listen-find-${current.word.roman}` : '';
  const listening = Boolean(heardId) && currentlyPlaying === heardId;

  const meta = useMemo(() => (current ? categoryMeta[current.word.category] : null), [current]);

  return (
    <div className="rf-stack" style={{ gap: 'var(--s-4)' }}>
      <SectionHeader
        icon="ear"
        title="Listen & Find"
        gujarati="સાંભળો · શોધો"
        art="/images/gen/listen-find-hero.webp"
        action={
          phase === 'playing' ? (
            <span className="rf-label" style={{ color: 'var(--text-on-ink-2)' }}>
              {round + 1} / {deck.length}
            </span>
          ) : undefined
        }
      />

      {phase === 'intro' && (
        <div className="rf-surface flex flex-col" style={{ gap: 'var(--s-4)', padding: 'var(--s-5)' }}>
          <div>
            <p className="rf-label">A listening game</p>
            <h2 style={{ fontSize: 'var(--t-2xl)', fontWeight: 700, marginTop: 2 }}>
              Hear a word. Tap its picture.
            </h2>
            <p style={{ fontSize: 'var(--t-sm)', color: 'var(--text-2)', marginTop: 'var(--s-2)' }}>
              Eight rounds. No reading needed — the ear does the work. Words you find
              are counted as learned.
            </p>
          </div>

          <div className="flex flex-wrap" style={{ gap: 'var(--s-2)' }}>
            <Chip active={groups.length === 0} onClick={() => { playSfx('tap'); setGroups([]); }}>
              Everything
            </Chip>
            {GROUPS.slice(0, 7).map(group => (
              <Chip
                key={group.key}
                active={groups.includes(group.key)}
                ink={group.color}
                icon={categoryIcon(group.key)}
                onClick={() => {
                  playSfx('tap');
                  setGroups(value =>
                    value.includes(group.key) ? value.filter(key => key !== group.key) : [...value, group.key]
                  );
                }}
              >
                {group.label}
              </Chip>
            ))}
          </div>

          <button type="button" className="rf-btn rf-btn--primary rf-btn--lg rf-btn--block" onClick={start}>
            <Icon name="speakerLoud" size={19} />
            Start listening
          </button>
        </div>
      )}

      {phase === 'playing' && current && (
        <>
          <div
            className="rf-surface flex flex-col items-center"
            style={{ gap: 'var(--s-3)', padding: 'var(--s-4)' }}
          >
            <button
              type="button"
              onClick={() => { playSfx('tap'); say(current.word); }}
              aria-label="Hear the word again"
              className="relative inline-flex items-center justify-center"
              style={{
                width: 96,
                height: 96,
                borderRadius: 'var(--r-pill)',
                background: 'var(--ink-saffron)',
                color: 'var(--text-on-ink)',
                border: 'var(--key)',
                boxShadow: 'var(--lift-2) var(--ink-key)',
              }}
            >
              {listening && !reduced && (
                <>
                  <span className="lf-ring" aria-hidden="true" />
                  <span className="lf-ring lf-ring--late" aria-hidden="true" />
                </>
              )}
              <Icon name={listening ? 'wave' : 'speakerLoud'} size={38} strokeWidth={2.1} />
            </button>
            <p className="rf-label" aria-live="polite">
              {listening ? 'Listening…' : 'Tap to hear it again'}
            </p>
            {meta && (
              <span
                className="inline-flex items-center"
                style={{ gap: 6, fontSize: 'var(--t-xs)', color: 'var(--text-2)', fontWeight: 600 }}
              >
                <Icon name={categoryIcon(current.word.category)} size={15} />
                {meta.label}
              </span>
            )}
          </div>

          <div className="lf-grid">
            {current.options.map((option, index) => {
              const isAnswer = index === current.answer;
              const isPicked = picked === index;
              const isWrong = wrong.includes(index);
              const reveal = hint || isPicked;
              return (
                <button
                  key={option.roman}
                  type="button"
                  onClick={() => answer(index)}
                  disabled={isWrong || picked !== null}
                  aria-label={reveal ? `${option.gujarati} — ${option.english}` : 'A picture to choose'}
                  className={`lf-tile${isWrong ? ' rf-shake' : ''}${isPicked ? ' lf-tile--right' : ''}${
                    hint && isAnswer && picked === null ? ' lf-tile--hint' : ''
                  }`}
                  style={{ opacity: isWrong ? 0.4 : 1 }}
                >
                  <span className="lf-tile__art">
                    <Art src={getWordImage(option.roman)} alt={reveal ? option.english : ''} icon="image" />
                  </span>
                  {reveal && (
                    <span className="lf-tile__caption">
                      <span className="rf-gujarati" style={{ fontWeight: 700 }}>
                        {option.gujarati}
                      </span>
                      <span style={{ fontSize: 'var(--t-2xs)', color: 'var(--text-2)' }}>{option.english}</span>
                    </span>
                  )}
                  {isPicked && (
                    <span className="lf-tile__stamp" aria-hidden="true">
                      <Icon name="star" size={22} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between" style={{ gap: 'var(--s-3)' }}>
            <Meter value={round + (picked === null ? 0 : 1)} max={deck.length} label={`${round} of ${deck.length} found`} />
            <button
              type="button"
              className="rf-btn rf-btn--quiet"
              onClick={() => { playSfx('tap'); setPhase('done'); clearTimer(); }}
            >
              Finish
            </button>
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="rf-surface flex flex-col items-center" style={{ gap: 'var(--s-4)', padding: 'var(--s-6)' }}>
          {stars >= 5 && <Confetti pieces={44} />}
          <span
            className="inline-flex items-center justify-center"
            style={{
              width: 76,
              height: 76,
              borderRadius: 'var(--r-pill)',
              background: 'var(--ink-indigo)',
              color: 'var(--text-on-ink)',
              border: 'var(--key)',
              boxShadow: 'var(--lift-2) var(--ink-saffron)',
            }}
          >
            <Icon name="trophy" size={36} />
          </span>
          <h2 style={{ fontSize: 'var(--t-2xl)', fontWeight: 700, textAlign: 'center' }}>
            {stars} of {deck.length} heard right the first time
          </h2>
          <p style={{ fontSize: 'var(--t-sm)', color: 'var(--text-2)', textAlign: 'center' }}>
            {stars >= 6
              ? 'Your ear is getting sharp. Try a trickier group next.'
              : 'Every go trains the ear — again is always allowed.'}
          </p>
          <div className="flex w-full flex-col" style={{ gap: 'var(--s-2)' }}>
            <button type="button" className="rf-btn rf-btn--primary rf-btn--lg rf-btn--block" onClick={start}>
              <Icon name="refresh" size={18} />
              Play again
            </button>
            <button
              type="button"
              className="rf-btn rf-btn--paper rf-btn--block"
              onClick={() => { playSfx('tap'); setPhase('intro'); }}
            >
              Choose another group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
