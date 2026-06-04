'use client';
import { useState } from 'react';
import { swar, vyanjan, categoryMeta } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';

export function AlphabetSection() {
  const [subTab, setSubTab] = useState<'swar' | 'vyanjan'>('swar');
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const data = subTab === 'swar' ? swar : vyanjan;

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4">
        {(['swar', 'vyanjan'] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${subTab === t ? 'text-white shadow-lg' : 'glass-card text-gray-600'}`}
            style={subTab === t ? { background: t === 'swar' ? 'var(--gradient-ocean)' : 'var(--gradient-berry)' } : {}}>
            <span style={{ fontFamily: 'var(--font-gujarati)' }}>{t === 'swar' ? 'સ્વર' : 'વ્યંજન'}</span>
            <span className="block text-xs opacity-70">{t === 'swar' ? 'Vowels' : 'Consonants'}</span>
          </button>
        ))}
      </div>

      {/* Header card */}
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: subTab === 'swar' ? 'var(--gradient-ocean)' : 'var(--gradient-berry)' }}>
        <div className="flex items-center gap-3 p-4 text-white">
          <span className="text-4xl">{categoryMeta[subTab]?.emoji || '🔤'}</span>
          <div>
            <p className="font-bold text-lg">{subTab === 'swar' ? 'Swar (Vowels)' : 'Vyanjan (Consonants)'}</p>
            <p className="text-white/70 text-xs" style={{ fontFamily: 'var(--font-gujarati)' }}>{subTab === 'swar' ? 'બાર સ્વર' : 'પાંત્રીસ વ્યંજન'}</p>
          </div>
        </div>
      </div>

      {/* Letter grid */}
      <div className="grid grid-cols-4 gap-2.5 stagger-children">
        {data.map((letter, i) => {
          const id = `letter-${letter.gujarati}`;
          const isPlaying = currentlyPlaying === id;
          return (
            <button key={i} onClick={() => speak(letter.gujarati, id)}
              className={`letter-card p-2.5 text-center transition-all active:scale-95 ${isPlaying ? 'ring-2 ring-amber-400' : ''}`}>
              <p className="text-2xl font-black leading-none mb-1" style={{ fontFamily: 'var(--font-gujarati)' }}>{letter.gujarati}</p>
              <p className="text-[10px] font-bold text-gray-500">{letter.roman}</p>
              <p className="text-[9px] text-gray-400 mt-0.5 truncate">{letter.exampleEnglish}</p>
              <div className="mt-1">
                <SpeakIcon id={id} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
