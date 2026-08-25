'use client';

import { useState } from 'react';
import { swar, vyanjan, type LetterItem } from '@/data/gujarati';
import { getLetterAudio, getLetterImage } from '@/data/assets';
import { useSpeak } from './useSpeak';
import { Icon } from './Icon';
import { Art, Meter, PlayButton, SayItBack, SectionHeader, SegTabs } from './ui';
import { TracingCanvas } from './TracingCanvas';

export function AlphabetSection({
  lettersLearned,
  onLetterLearned,
}: {
  lettersLearned: string[];
  onLetterLearned: (letterRoman: string) => void;
}) {
  const [tab, setTab] = useState<'swar' | 'vyanjan'>('swar');
  const [selectedRoman, setSelectedRoman] = useState<string | null>(null);
  const [mode, setMode] = useState<'listen' | 'trace'>('listen');
  const { speak, currentlyPlaying, ttsLoading, ttsProgress, failedId } = useSpeak();

  const letters = tab === 'swar' ? swar : vyanjan;
  const selected = letters.find(letter => letter.roman === selectedRoman);
  const learnedHere = letters.filter(letter => lettersLearned.includes(letter.roman)).length;

  const play = (letter: LetterItem, id: string) => {
    speak(getLetterAudio(letter.roman) || letter.gujarati, id, letter.gujarati);
  };

  const openLetter = (letter: LetterItem) => {
    setSelectedRoman(letter.roman);
    setMode('listen');
    onLetterLearned(letter.roman);
    play(letter, `letter-${letter.roman}`);
  };

  return (
    <div className="rf-grid" style={{ gap: 'var(--s-4)' }}>
      <SectionHeader
        icon="letters"
        title="The Gujarati alphabet"
        gujarati="કક્કો"
        action={
          <span className="text-right" style={{ color: 'var(--text-on-ink)' }}>
            <span className="block tabular-nums" style={{ fontSize: 'var(--t-xl)', fontWeight: 700, lineHeight: 1 }}>
              {learnedHere}
              <span style={{ fontSize: 'var(--t-sm)', color: 'var(--text-on-ink-2)' }}>/{letters.length}</span>
            </span>
            <span className="rf-label" style={{ color: 'var(--text-on-ink-2)' }}>
              heard
            </span>
          </span>
        }
      />

      <SegTabs
        label="Letter group"
        value={tab}
        onChange={next => {
          setTab(next);
          setSelectedRoman(null);
        }}
        options={[
          { value: 'swar', label: `Vowels · સ્વર`, icon: 'wave' },
          { value: 'vyanjan', label: `Consonants · વ્યંજન`, icon: 'glyph' },
        ]}
      />

      {/* Selected letter sits above the grid so it never scrolls out of reach
          on a phone after a tap near the bottom of the board. */}
      {selected && (
        <section
          className="rf-surface rf-lift-saffron rf-rise"
          style={{ padding: 'var(--s-4)' }}
          aria-label={`Letter ${selected.gujarati}`}
        >
          <div className="flex items-start" style={{ gap: 'var(--s-4)' }}>
            <Art
              src={getLetterImage(selected.roman)}
              alt={selected.exampleEnglish}
              icon="image"
              className="rf-art-frame"
              style={{ width: 104, height: 104, flex: 'none', padding: 4 }}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between" style={{ gap: 'var(--s-3)' }}>
                <div className="min-w-0">
                  <h2
                    className="rf-gujarati"
                    style={{ fontSize: 'var(--t-4xl)', fontWeight: 800, lineHeight: 1.1 }}
                  >
                    {selected.gujarati}
                  </h2>
                  <p style={{ fontSize: 'var(--t-lg)', fontWeight: 600, color: 'var(--text-2)' }}>
                    {selected.roman}
                  </p>
                </div>
                <PlayButton
                  id={`letter-detail-${selected.roman}`}
                  label={`Hear ${selected.gujarati}`}
                  onClick={() => play(selected, `letter-detail-${selected.roman}`)}
                  currentlyPlaying={currentlyPlaying}
                  ttsLoading={ttsLoading}
                  ttsProgress={ttsProgress}
                failedId={failedId}
                />
              </div>

              <p
                className="rf-surface--sunk"
                style={{ marginTop: 'var(--s-3)', padding: 'var(--s-2) var(--s-3)', fontSize: 'var(--t-sm)' }}
              >
                <span className="rf-gujarati" style={{ fontWeight: 700 }}>
                  {selected.example}
                </span>
                <span style={{ color: 'var(--text-2)' }}> · {selected.exampleRoman} · </span>
                <span style={{ fontWeight: 600 }}>{selected.exampleEnglish}</span>
              </p>
            </div>
          </div>

          <div style={{ marginTop: 'var(--s-4)' }}>
            <SegTabs
              label="Practice mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'listen', label: 'Listen', icon: 'speakerLoud' },
                { value: 'trace', label: 'Trace', icon: 'pencil' },
              ]}
            />
          </div>

          <div style={{ marginTop: 'var(--s-4)' }}>
            {mode === 'trace' ? (
              <TracingCanvas
                letter={selected.gujarati}
                onTraceComplete={() => onLetterLearned(selected.roman)}
              />
            ) : (
              <SayItBack target={selected.example} hint={`Hold the mic and say ${selected.example}`} />
            )}
          </div>
        </section>
      )}

      {/* Letter board */}
      <div>
        <div
          className="flex items-center justify-between"
          style={{ gap: 'var(--s-3)', marginBottom: 'var(--s-2)' }}
        >
          <h2 className="rf-label">
            {tab === 'swar' ? 'Vowels' : 'Consonants'} · tap to hear
          </h2>
          <div style={{ width: 120 }}>
            <Meter
              value={learnedHere}
              max={letters.length}
              label={`${learnedHere} of ${letters.length} letters heard`}
            />
          </div>
        </div>

        <div className="rf-grid rf-grid--letters">
          {letters.map(letter => {
            const isSelected = selectedRoman === letter.roman;
            const isLearned = lettersLearned.includes(letter.roman);
            return (
              <button
                key={letter.gujarati}
                type="button"
                onClick={() => openLetter(letter)}
                aria-pressed={isSelected}
                aria-label={`${letter.gujarati}, ${letter.roman}, as in ${letter.exampleEnglish}${
                  isLearned ? ', already heard' : ''
                }`}
                className={`rf-press relative flex flex-col items-center justify-center ${
                  isSelected ? 'rf-lift-saffron' : 'rf-lift-key'
                }`}
                style={{
                  aspectRatio: '1',
                  minHeight: 62,
                  borderRadius: 'var(--r-md)',
                  border: 'var(--key-thin)',
                  background: isSelected ? 'var(--ink-saffron)' : 'var(--paper)',
                  color: isSelected ? 'var(--text-on-saffron)' : 'var(--text-1)',
                }}
              >
                {/* A check mark, not a coloured dot: meaning must not depend
                    on colour alone. */}
                {isLearned && !isSelected && (
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center"
                    style={{
                      position: 'absolute',
                      top: 3,
                      right: 3,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: 'var(--state-learned)',
                      color: 'var(--text-on-ink)',
                    }}
                  >
                    <Icon name="check" size={11} strokeWidth={3.4} />
                  </span>
                )}
                <span
                  className="rf-gujarati"
                  style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, lineHeight: 1 }}
                >
                  {letter.gujarati}
                </span>
                <span
                  style={{
                    fontSize: 'var(--t-2xs)',
                    fontWeight: 700,
                    marginTop: 2,
                    color: isSelected ? 'var(--text-on-saffron-2)' : 'var(--text-2)',
                  }}
                >
                  {letter.roman}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!selected && (
        <p
          className="flex items-center rf-surface--sunk"
          style={{ gap: 'var(--s-2)', padding: 'var(--s-3)', fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}
        >
          <Icon name="speakerLoud" size={18} style={{ flex: 'none', color: 'var(--ink-indigo)' }} />
          Tap any letter to hear it, see its picture word, and trace it.
        </p>
      )}
    </div>
  );
}
