'use client';

import { useMemo, useState } from 'react';
import { generateStoryQuiz, type StoryItem } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { Icon, type IconName } from './Icon';
import { Confetti, Meter, Overlay, PlayButton } from './ui';

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
  const { speak, currentlyPlaying, ttsLoading, ttsProgress, failedId } = useSpeak();

  if (questions.length === 0) return null;

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const correct = index === questions[currentQ].answer;
    const nextScore = correct ? score + 1 : score;
    if (correct) setScore(nextScore);

    window.setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        onComplete(nextScore, questions.length);
      }
    }, 1100);
  };

  const pct = Math.round((score / questions.length) * 100);
  const mark: IconName = pct >= 80 ? 'trophy' : pct >= 50 ? 'star' : 'sprout';
  const ink =
    pct >= 80 ? 'var(--state-learned)' : pct >= 50 ? 'var(--ink-saffron)' : 'var(--ink-indigo)';

  const question = questions[currentQ];

  return (
    <Overlay onClose={onClose}>
      {showResult && pct >= 80 && <Confetti />}

      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quiz"
          className="rf-icon-btn absolute"
          style={{ top: -14, right: -8, zIndex: 2, width: 40, height: 40 }}
        >
          <Icon name="close" size={20} strokeWidth={2.4} />
        </button>

        <div
          className="rf-surface"
          style={{ padding: 'var(--s-5)', boxShadow: 'var(--lift-3) var(--ink-indigo), var(--shadow-float)' }}
        >
          {showResult ? (
            <div className="flex flex-col items-center text-center" style={{ gap: 'var(--s-3)' }}>
              <span
                className="rf-pop inline-flex items-center justify-center rounded-full"
                style={{ width: 76, height: 76, background: ink, color: 'var(--text-on-ink)', border: 'var(--key)' }}
              >
                <Icon name={mark} size={38} />
              </span>
              <h2 style={{ fontSize: 'var(--t-xl)', fontWeight: 800 }}>
                {pct >= 80 ? 'You really listened!' : pct >= 50 ? 'Good going!' : 'Nice try!'}
              </h2>
              {/* Stars a child can count, matching the main quiz. */}
              <p
                className="flex items-center justify-center"
                style={{ gap: 2 }}
                aria-label={`${score} right out of ${questions.length}`}
              >
                {Array.from({ length: questions.length }, (_, i) => (
                  <Icon
                    key={i}
                    name={i < score ? 'star' : 'starOutline'}
                    size={28}
                    style={{ color: i < score ? 'var(--ink-saffron)' : 'var(--text-3)' }}
                  />
                ))}
              </p>
              <p className="tabular-nums" style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, color: ink, lineHeight: 1 }}>
                {score} of {questions.length}
              </p>
              <p style={{ fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}>
                Read the story again any time to hear the words once more.
              </p>
              <button type="button" onClick={onClose} className="rf-btn rf-btn--primary rf-btn--lg rf-btn--block">
                <Icon name="check" size={18} strokeWidth={2.6} />
                Back to the story
              </button>
            </div>
          ) : (
            <div>
              <p className="rf-label text-center" style={{ marginBottom: 'var(--s-2)' }}>
                Question {currentQ + 1} of {questions.length}
              </p>
              <Meter
                value={currentQ + 1}
                max={questions.length}
                label={`Question ${currentQ + 1} of ${questions.length}`}
              />

              <div
                className="rf-surface--sunk flex flex-col items-center text-center"
                style={{ gap: 'var(--s-2)', padding: 'var(--s-4)', margin: 'var(--s-4) 0' }}
              >
                <p className="rf-gujarati" style={{ fontSize: 'var(--t-3xl)', fontWeight: 800, lineHeight: 1.2 }}>
                  {question.gujarati}
                </p>
                <PlayButton
                  id={`story-quiz-q-${currentQ}`}
                  label={`Hear ${question.gujarati}`}
                  onClick={() => speak(question.gujarati, `story-quiz-q-${currentQ}`)}
                  currentlyPlaying={currentlyPlaying}
                  ttsLoading={ttsLoading}
                  ttsProgress={ttsProgress}
                failedId={failedId}
                  size={44}
                  tone="paper"
                />
                <p style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>{question.question}</p>
              </div>

              <div className="rf-grid rf-grid--tiles" role="group" aria-label="Answers">
                {question.options.map((option, index) => {
                  const isCorrect = index === question.answer;
                  const isPicked = index === selectedAnswer;
                  const revealed = selectedAnswer !== null;

                  let background = 'var(--paper)';
                  let borderColor = 'var(--ink-key)';
                  let lift = 'var(--lift-1) var(--ink-key)';
                  let animation = '';

                  if (revealed && isCorrect) {
                    background = 'var(--state-learned-bg)';
                    borderColor = 'var(--state-learned)';
                    lift = 'var(--lift-1) var(--state-learned)';
                    animation = 'rf-pop';
                  } else if (revealed && isPicked) {
                    // Not-it, not wrong — the right answer is lit beside it.
                    background = 'var(--paper-sunk)';
                    borderColor = 'var(--text-3)';
                    lift = 'none';
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAnswer(index)}
                      disabled={revealed}
                      className={`rf-press flex items-center justify-center text-center ${animation}`}
                      style={{
                        gap: 'var(--s-1)',
                        minHeight: 58,
                        padding: 'var(--s-2)',
                        background,
                        border: `2px solid ${borderColor}`,
                        borderRadius: 'var(--r-md)',
                        boxShadow: lift,
                        fontSize: 'var(--t-sm)',
                        fontWeight: 700,
                        opacity: revealed && !isCorrect && !isPicked ? 0.75 : 1,
                      }}
                    >
                      {revealed && isCorrect && (
                        <Icon name="check" size={16} strokeWidth={2.6} style={{ color: 'var(--state-learned)', flex: 'none' }} />
                      )}

                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
