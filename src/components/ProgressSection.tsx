'use client';
import { swar, vyanjan, words, phrases, stories } from '@/data/gujarati';

interface ProgressState {
  lettersLearned: string[];
  wordsLearned: string[];
  phrasesLearned: string[];
  quizScore: number;
  quizTotal: number;
  storiesRead: string[];
}

export function ProgressSection({ progress }: { progress: ProgressState }) {
  const totalLetters = swar.length + vyanjan.length;
  const totalWords = words.length;
  const totalPhrases = phrases.length;
  const totalStories = stories.length;

  const letterPct = Math.round((progress.lettersLearned.length / totalLetters) * 100);
  const wordPct = Math.round((progress.wordsLearned.length / totalWords) * 100);
  const phrasePct = Math.round((progress.phrasesLearned.length / totalPhrases) * 100);
  const storyPct = Math.round((progress.storiesRead.length / totalStories) * 100);
  const quizPct = progress.quizTotal > 0 ? Math.round((progress.quizScore / progress.quizTotal) * 100) : 0;

  const items = [
    { label: 'Letters', emoji: '🔤', pct: letterPct, count: progress.lettersLearned.length, total: totalLetters, color: '#3B82F6' },
    { label: 'Words', emoji: '📚', pct: wordPct, count: progress.wordsLearned.length, total: totalWords, color: '#F59E0B' },
    { label: 'Phrases', emoji: '💬', pct: phrasePct, count: progress.phrasesLearned.length, total: totalPhrases, color: '#10B981' },
    { label: 'Stories', emoji: '📖', pct: storyPct, count: progress.storiesRead.length, total: totalStories, color: '#8B5CF6' },
    { label: 'Quiz', emoji: '🎯', pct: quizPct, count: progress.quizScore, total: progress.quizTotal, color: '#EF4444' },
  ];

  const overall = items.reduce((s, i) => s + i.pct, 0) / items.length;
  const level = overall < 20 ? 'Beginner 🌱' : overall < 50 ? 'Learner 🌿' : overall < 80 ? 'Speaker 🌳' : 'Master 🏆';

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-forest)' }}>
        <div className="flex items-center gap-3 p-4 text-white">
          <img src="/images/progress.webp" alt="" className="w-14 h-14 rounded-xl object-contain border-2 border-white/30" />
          <div>
            <p className="font-bold text-lg">Your Progress</p>
            <p className="text-white/70 text-xs" style={{ fontFamily: 'var(--font-gujarati)' }}>તમારી પ્રગતિ</p>
          </div>
        </div>
      </div>

      {/* Level badge */}
      <div className="glass-card p-4 text-center mb-4">
        <p className="text-3xl mb-1">{overall < 20 ? '🌱' : overall < 50 ? '🌿' : overall < 80 ? '🌳' : '🏆'}</p>
        <p className="font-black text-xl">{level}</p>
        <p className="text-sm text-gray-500">{Math.round(overall)}% complete</p>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.label} className="glass-card p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm">{item.emoji} {item.label}</span>
              <span className="text-xs text-gray-500">{item.count}/{item.total}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
