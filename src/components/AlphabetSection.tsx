'use client';
import { useState } from 'react';
import { swar, vyanjan } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { HalftoneOverlay } from './RisoFolk';
import { getLetterAudio, getLetterImage } from '@/data/assets';
import { TracingCanvas } from './TracingCanvas';
import { usePronunciation } from './usePronunciation';

export function AlphabetSection({ onLetterLearned }: { onLetterLearned: (letter: string) => void }) {
  const [tab, setTab] = useState<'swar' | 'vyanjan'>('swar');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [mode, setMode] = useState<'listen' | 'trace'>('listen');
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const { isRecording, isProcessing, score, startPronunciationCheck, stopPronunciationCheck, setScore } = usePronunciation();

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
                setMode('listen');
                setScore(null);
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
        <div className="mt-4 rf-card p-4 animate-scale-in flex flex-col gap-3" style={{ boxShadow: 'var(--rf-shadow-saffron)' }}>
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full max-w-[200px] mx-auto">
            <button
              onClick={() => setMode('listen')}
              className={`flex-1 py-1 text-sm font-bold rounded-md transition-all ${mode === 'listen' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
            >
              🔊 Listen
            </button>
            <button
              onClick={() => setMode('trace')}
              className={`flex-1 py-1 text-sm font-bold rounded-md transition-all ${mode === 'trace' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
            >
              ✍️ Trace
            </button>
          </div>

          {mode === 'trace' ? (
            <TracingCanvas letter={selected.gujarati} onTraceComplete={() => onLetterLearned(selected.gujarati)} />
          ) : (
            <div className="flex items-start gap-4">
              {/* Pre-generated illustration */}
              {getLetterImage(selected.roman) && (
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 bg-white" style={{ borderColor: 'var(--rf-ink)' }}>
                  <img src={getLetterImage(selected.roman)} alt={selected.exampleEnglish} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-black text-gray-800" style={{ fontFamily: 'var(--font-gujarati)' }}>
                      {selected.gujarati} <span className="text-xl text-gray-500">&quot;{selected.roman}&quot;</span>
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      const audioPath = getLetterAudio(selected.roman);
                      speak(audioPath || `${selected.gujarati}, ${selected.example}`, `letter-detail-${selected.roman}`);
                    }}
                    className="speak-btn p-2 rounded-full" style={{ background: 'var(--rf-cream)' }}>
                    <SpeakIcon id={`letter-detail-${selected.roman}`} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                  </button>
                </div>
                
                <div className="mt-2 p-2 rounded-lg" style={{ background: 'var(--rf-cream)' }}>
                  <p className="text-sm"><span className="font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{selected.example}</span> = {selected.exampleEnglish}</p>
                </div>

                {/* Pronunciation Practice */}
                <div className="w-full mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Practice Pronunciation</p>
                  <div className="flex items-center gap-3">
                    <button
                      onMouseDown={() => startPronunciationCheck(selected.example)}
                      onMouseUp={stopPronunciationCheck}
                      onTouchStart={() => startPronunciationCheck(selected.example)}
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
                        <p className="text-sm text-gray-500">Hold mic and say {selected.example}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
