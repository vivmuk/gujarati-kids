'use client';
import { useState } from 'react';
import { stories, type StoryItem } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { getStoryLineImage, getStoryLineAudio } from '@/data/assets';

export function StoriesSection() {
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();

  if (activeStory) {
    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in">
        <button onClick={() => setActiveStory(null)} className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          ← Back to Stories
        </button>

        {/* Story hero illustration */}
        {getStoryLineImage(activeStory.id, -1) || (() => { const p = `/images/gen/story-${activeStory.id}.webp`; return p; })() ? (
          <img
            src={getStoryLineImage(activeStory.id, -1) || `/images/gen/story-${activeStory.id}.webp`}
            alt={activeStory.titleEnglish}
            className="w-full h-40 object-cover rounded-2xl mb-4 shadow-md"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : null}

        <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-berry)' }}>
          <div className="p-4 text-white">
            <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-gujarati)' }}>{activeStory.titleGujarati}</p>
            <p className="text-white/70 text-sm">{activeStory.titleEnglish}</p>
          </div>
        </div>

        <div className="space-y-3">
          {activeStory.lines.map((line, i) => {
            const id = `story-line-${i}`;
            const isPlaying = currentlyPlaying === id;
            // AI-generated illustration for this story line
            const lineImg = getStoryLineImage(activeStory.id, i);
            return (
              <div key={i} className={`glass-card p-3 flex items-start gap-3 ${isPlaying ? 'ring-2 ring-amber-300' : ''}`}>
                {/* Per-line illustration — 90s Indian textbook style */}
                {lineImg && (
                  <img
                    src={lineImg}
                    alt={line.english}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border-2 border-white shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                      style={{ background: 'var(--saffron-100)', color: 'var(--saffron-700)' }}>
                      {i + 1}
                    </span>
                    <p className="text-base font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{line.gujarati}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{line.roman}</p>
                  <p className="text-sm text-gray-700 font-medium mt-0.5">{line.english}</p>
                </div>
                <button onClick={() => {
                    // Use pre-generated audio for instant playback
                    const audioPath = getStoryLineAudio(activeStory.id, i);
                    speak(audioPath || line.gujarati, id);
                  }}
                  className="speak-btn w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isPlaying ? 'var(--saffron-200)' : 'var(--saffron-100)', color: 'var(--saffron-700)' }}>
                  <SpeakIcon id={id} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-berry)' }}>
        <div className="flex items-center gap-3 p-4 text-white">
          <img src="/images/story.webp" alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
          <div>
            <p className="font-bold text-lg">Stories</p>
            <p className="text-white/70 text-xs" style={{ fontFamily: 'var(--font-gujarati)' }}>વાર્તાઓ</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {stories.map((story) => (
          <button key={story.id} onClick={() => setActiveStory(story)}
            className="glass-card w-full text-left p-4 hover:shadow-lg transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📖</span>
              <div className="flex-1">
                <p className="font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{story.titleGujarati}</p>
                <p className="text-sm text-gray-600">{story.titleEnglish}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--saffron-100)', color: 'var(--saffron-700)' }}>
                    Level {story.level}
                  </span>
                  <span className="text-xs text-gray-400">{story.lines.length} lines</span>
                </div>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
