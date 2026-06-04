'use client';
import { useState, useCallback } from 'react';
import { generateQuiz, words, phrases, swar, vyanjan } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';

interface Props {
  onQuizComplete: (score: number, total: number) => void;
}

export function QuizSection({ onQuizComplete }: Props) {
  const [quizType, setQuizType] = useState<'letter' | 'word' | 'phrase'>('word');
  const [quizLevel, setQuizLevel] = useState(1);
  const [quizQuestions, setQuizQuestions] = useState<ReturnType<typeof generateQuiz> | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();

  const startQuiz = useCallback(() => {
    const qs = generateQuiz(quizType, quizLevel, 5);
    setQuizQuestions(qs);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  }, [quizType, quizLevel]);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === quizQuestions![currentQ].answer) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (currentQ + 1 < quizQuestions!.length) {
        setCurrentQ(q => q + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        const finalScore = idx === quizQuestions![currentQ].answer ? score + 1 : score;
        onQuizComplete(finalScore, quizQuestions!.length);
      }
    }, 1200);
  };

  // Quiz in progress
  if (quizQuestions && !showResult) {
    const q = quizQuestions[currentQ];
    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-500">Question {currentQ + 1}/{quizQuestions.length}</span>
          <span className="text-sm font-bold" style={{ color: 'var(--saffron-600)' }}>Score: {score}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%`, background: 'var(--gradient-saffron)' }} />
        </div>
        <div className="glass-card-strong p-6 text-center mb-6">
          <button onClick={() => speak(q.gujarati, `quiz-q-${currentQ}`)} className="mb-3">
            <span className="text-5xl font-black" style={{ fontFamily: 'var(--font-gujarati)' }}>{q.gujarati}</span>
            <div className="mt-2">
              <SpeakIcon id={`quiz-q-${currentQ}`} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
            </div>
          </button>
          <p className="text-lg font-bold text-gray-700 mt-2">{q.question}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.answer;
            const isSelected = i === selectedAnswer;
            let bg = 'bg-white border-2 border-gray-100';
            if (selectedAnswer !== null) {
              if (isCorrect) bg = 'bg-emerald-50 border-2 border-emerald-400';
              else if (isSelected) bg = 'bg-red-50 border-2 border-red-400';
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selectedAnswer !== null}
                className={`${bg} rounded-2xl p-4 font-bold text-center transition-all active:scale-95 disabled:opacity-80`}>
                {opt}
                {selectedAnswer !== null && isCorrect && <span className="ml-1">✅</span>}
                {selectedAnswer !== null && isSelected && !isCorrect && <span className="ml-1">❌</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Show result
  if (showResult) {
    const pct = Math.round((score / quizQuestions!.length) * 100);
    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'}</div>
        <h2 className="text-2xl font-black mb-2">Quiz Complete!</h2>
        <p className="text-4xl font-black mb-1" style={{ color: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444' }}>{pct}%</p>
        <p className="text-gray-500 mb-6">{score}/{quizQuestions!.length} correct</p>
        <button onClick={startQuiz} className="w-full py-3 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all"
          style={{ background: 'var(--gradient-saffron)' }}>
          Play Again 🔄
        </button>
      </div>
    );
  }

  // Quiz setup
  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-saffron)' }}>
        <div className="flex items-center gap-3 p-4 text-white">
          <img src="/images/quiz.webp" alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
          <div>
            <p className="font-bold text-lg">Quiz Time!</p>
            <p className="text-white/70 text-xs" style={{ fontFamily: 'var(--font-gujarati)' }}>રમત-રમતમાં શીખો</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="font-bold text-sm text-gray-600 mb-2">Category</p>
          <div className="grid grid-cols-3 gap-2">
            {(['letter', 'word', 'phrase'] as const).map(t => (
              <button key={t} onClick={() => setQuizType(t)}
                className={`py-2.5 rounded-xl font-bold text-sm transition-all ${quizType === t ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}
                style={quizType === t ? { background: 'var(--saffron-500)' } : {}}>
                {t === 'letter' ? '🔤 Letters' : t === 'word' ? '📚 Words' : '💬 Phrases'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-bold text-sm text-gray-600 mb-2">Level</p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(l => (
              <button key={l} onClick={() => setQuizLevel(l)}
                className={`py-2.5 rounded-xl font-bold text-sm transition-all ${quizLevel === l ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}
                style={quizLevel === l ? { background: 'var(--saffron-500)' } : {}}>
                Level {l}
              </button>
            ))}
          </div>
        </div>
        <button onClick={startQuiz} className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg text-lg active:scale-95 transition-all"
          style={{ background: 'var(--gradient-saffron)' }}>
          Start Quiz! 🎯
        </button>
      </div>
    </div>
  );
}
