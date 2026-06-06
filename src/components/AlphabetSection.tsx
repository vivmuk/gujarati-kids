'use client';
import { useState } from 'react';
import { swar, vyanjan } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { HalftoneOverlay } from './RisoFolk';
import { getLetterAudio, getLetterImage } from '@/data/assets';

export function AlphabetSection({ onLetterLearned }: { onLetterLearned: (letter: string) => void }) {
  const [tab, setTab] = useState<'swar' | 'vyanjan'>('swar');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();

  const letters = tab === 'swar' ? swar : vyanjan;
  const selected = letters.find(l => l.gujarati === selectedLetter);

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {(['swar', 'vyanjan'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelectedLetter(null); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === t ? 'text-white' : 'text-gray-600'}`}
            style={tab === t ? { background: 'var(--rf-indigo)', border: 'var(--rf-border)', boxShadow: 'var(--rf-shadow-saffron)' } : { background: 'var(--rf-cream)', border: '2px solid transparent' }}>
            {t === 'swar' ? '🔊 Vowels (સ્વર)' : '🔤 Consonants (વ્યંજન)'}
          </button>
        ))}
      </div>

      {/* Letter grid */}
      <div className="grid grid-cols-5 gap-2 stagger-children">
        {letters.map(letter => {
          const audioPath = getLetterAudio(letter.roman);
          return (
            <button key={letter.gujarati}
              onClick={() => {
                setSelectedLetter(letter.gujarati);
                onLetterLearned(letter.gujarati);
                if (audioPath) speak(audioPath, `letter-${letter.roman}`);
              }}
              className={`letter-tile ${selectedLetter === letter.gujarati ? 'shadow-lg' : ''}`}
              style={selectedLetter === letter.gujarati ? { borderColor: 'var(--rf-saffron)', background: 'var(--rf-cream)', boxShadow: 'var(--rf-shadow-saffron)' } : {}}>
              <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{letter.gujarati}</span>
              <span className="text-[10px] text-gray-500 font-semibold">{letter.roman}</span>
            </button>
          );
        })}
      </div>

      {/* Selected letter detail */}
      {selected && (
        <div className="mt-4 rf-card p-4 animate-scale-in" style={{ boxShadow: 'var(--rf-shadow-saffron)' }}>
          <div className="flex items-start gap-4">
            {/* Pre-generated illustration */}
            {getLetterImage(selected.roman) && (
              <img
                src={getLetterImage(selected.roman)}
                alt={selected.exampleEnglish}
                className="w-24 h-24 rounded-xl object-contain flex-shrink-0 border-2 border-white shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{selected.gujarati}</span>
                <button
                  onClick={() => {
                    const audioPath = getLetterAudio(selected.roman);
                    speak(audioPath || `${selected.gujarati}, ${selected.example}`, `letter-detail-${selected.roman}`);
                  }}
                  className="speak-btn p-2 rounded-full" style={{ background: 'var(--rf-cream)' }}>
                  <SpeakIcon id={`letter-detail-${selected.roman}`} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                </button>
              </div>
              <p className="text-sm text-gray-600 font-semibold">{selected.roman}</p>
              <div className="mt-2 p-2 rounded-lg" style={{ background: 'var(--rf-cream)' }}>
                <p className="text-sm"><span className="font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{selected.example}</span> = {selected.exampleEnglish}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
