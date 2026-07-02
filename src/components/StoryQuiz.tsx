'use client';
import { useMemo, useState } from 'react';
import { generateStoryQuiz, type StoryItem } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';

interface Props {
  story: StoryItem;
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}

export function StoryQuiz({ story, onClose, onComplete }: Props) {
  const questions = useMemo(() => generateStoryQuiz(story, 3), [story]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const isCorrect = idx === questions[currentQ].answer;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        onComplete(newScore, questions.length);
      }
    }, 1200);
  };

  if (questions.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 bg-white shadow-md hover:bg-gray-100 transition-colors text-lg font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <div
          className="relative bg-white rounded-3xl shadow-2xl w-full p-5"
          style={{ border: '2.5px solid var(--rf-indigo, #3B3596)', boxShadow: '6px 6px 0 var(--rf-indigo, #3B3596)' }}
        >
          {showResult ? (
            (() => {
              const pct = Math.round((score / questions.length) * 100);
              return (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'}</div>
                  <h2 className="text-2xl font-black mb-2">Quiz Complete!</h2>
                  <p className="text-4xl font-black mb-1" style={{ color: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444' }}>{pct}%</p>
                  <p className="text-gray-500 mb-6">{score}/{questions.length} correct</p>
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg text-lg active:scale-95 transition-all"
                    style={{ background: 'var(--gradient-saffron)' }}
                  >
                    Done ✓
                  </button>
                </div>
              );
            })()
          ) : (
            (() => {
              const q = questions[currentQ];
              return (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.7px] text-gray-500 text-center mb-3">
                    Question {currentQ + 1} of {questions.length}
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'var(--rf-saffron)' }} />
                  </div>

                  <div className="rf-card p-5 text-center mb-4" style={{ boxShadow: 'var(--rf-shadow-indigo)' }}>
                    <button onClick={() => speak(q.gujarati, `story-quiz-q-${currentQ}`)} className="mb-2">
                      <span className="text-4xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{q.gujarati}</span>
                      <div className="mt-2">
                        <SpeakIcon id={`story-quiz-q-${currentQ}`} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                      </div>
                    </button>
                    <p className="text-base font-bold text-gray-700 mt-1">{q.question}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {q.options.map((opt, i) => {
                      const isCorrect = i === q.answer;
                      const isSelected = i === selectedAnswer;
                      let bg = 'bg-white border-2 border-gray-100';
                      if (selectedAnswer !== null) {
                        if (isCorrect) bg = 'bg-emerald-50 border-2 border-emerald-400';
                        else if (isSelected) bg = 'bg-red-50 border-2 border-red-400';
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={selectedAnswer !== null}
                          className={`${bg} rounded-2xl p-3 font-bold text-center text-sm transition-all active:scale-95 disabled:opacity-80`}
                        >
                          {opt}
                          {selectedAnswer !== null && isCorrect && <span className="ml-1">✅</span>}
                          {selectedAnswer !== null && isSelected && !isCorrect && <span className="ml-1">❌</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
