'use client';

import { useCallback, useEffect, useState } from 'react';
import { generateQuiz } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { Icon, type IconName } from './Icon';
import { Confetti, Meter, PlayButton, SectionHeader, SegTabs } from './ui';

interface Props {
  onQuizComplete: (score: number, total: number) => void;
}

type QuizType = 'letter' | 'word' | 'phrase';

const TYPE_OPTIONS: Array<{ value: QuizType; label: string; icon: IconName }> = [
  { value: 'letter', label: 'Letters', icon: 'letters' },
  { value: 'word', label: 'Words', icon: 'words' },
  { value: 'phrase', label: 'Phrases', icon: 'phrases' },
];

const LEVELS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Tricky' },
];

const TIME_ATTACK_SECONDS = 60;
const STANDARD_QUESTIONS = 5;

export function QuizSection({ onQuizComplete }: Props) {
  const [quizType, setQuizType] = useState<QuizType>('word');
  const [quizLevel, setQuizLevel] = useState(1);
  const [isTimeAttack, setIsTimeAttack] = useState(false);
  const [questions, setQuestions] = useState<ReturnType<typeof generateQuiz>>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { speak, currentlyPlaying, ttsLoading, ttsProgress, failedId } = useSpeak();

  const startQuiz = useCallback(() => {
    setQuestions(generateQuiz(quizType, quizLevel, isTimeAttack ? 50 : STANDARD_QUESTIONS));
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswered(0);
    setShowResult(false);
    setTimeRemaining(isTimeAttack ? TIME_ATTACK_SECONDS : null);
  }, [quizType, quizLevel, isTimeAttack]);

  const finish = useCallback(
    (finalScore: number, total: number) => {
      setShowResult(true);
      onQuizComplete(finalScore, total);
    },
    [onQuizComplete]
  );

  useEffect(() => {
    if (timeRemaining === null || showResult || questions.length === 0) return;
    const timer = window.setTimeout(
      () =>
        timeRemaining <= 0
          ? finish(score, Math.max(1, answered))
          : setTimeRemaining(t => (t === null ? null : t - 1)),
      timeRemaining <= 0 ? 0 : 1000
    );
    return () => window.clearTimeout(timer);
  }, [timeRemaining, showResult, questions.length, score, answered, finish]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const correct = index === questions[currentQ].answer;
    const nextScore = correct ? score + 1 : score;
    const nextAnswered = answered + 1;
    if (correct) setScore(nextScore);
    setAnswered(nextAnswered);

    window.setTimeout(() => {
      if (currentQ < questions.length - 1 && (!isTimeAttack || (timeRemaining ?? 0) > 0)) {
        setCurrentQ(q => q + 1);
        setSelectedAnswer(null);
      } else {
        finish(nextScore, nextAnswered);
      }
    }, 1100);
  };

  /* -------------------------------------------------------- In progress */

  if (questions.length > 0 && !showResult) {
    const question = questions[currentQ];
    const questionId = `quiz-q-${currentQ}`;
    const lowTime = isTimeAttack && (timeRemaining ?? 0) <= 10;

    return (
      <div className="rf-grid" style={{ gap: 'var(--s-4)', maxWidth: 620, margin: '0 auto' }}>
        <div className="flex items-center justify-between" style={{ gap: 'var(--s-3)' }}>
          <span className="rf-label">
            {isTimeAttack ? `Question ${answered + 1}` : `Question ${currentQ + 1} of ${questions.length}`}
          </span>
          <span
            className="flex items-center tabular-nums"
            style={{ gap: 'var(--s-1)', fontSize: 'var(--t-sm)', fontWeight: 700, color: 'var(--ink-saffron-deep)' }}
          >
            <Icon name="star" size={16} />
            {score}
          </span>
        </div>

        {isTimeAttack ? (
          <div className="flex items-center" style={{ gap: 'var(--s-3)' }}>
            <div className="flex-1">
              <Meter
                value={timeRemaining ?? 0}
                max={TIME_ATTACK_SECONDS}
                ink={lowTime ? 'var(--ink-pink)' : 'var(--ink-saffron)'}
                label={`${timeRemaining} seconds left`}
              />
            </div>
            <span
              className={`flex items-center tabular-nums ${lowTime ? 'rf-blink' : ''}`}
              style={{
                gap: 'var(--s-1)',
                fontSize: 'var(--t-sm)',
                fontWeight: 800,
                color: lowTime ? 'var(--ink-pink)' : 'var(--text-2)',
              }}
            >
              <Icon name="clock" size={16} />
              {timeRemaining}s
            </span>
          </div>
        ) : (
          <Meter
            value={currentQ + 1}
            max={questions.length}
            label={`Question ${currentQ + 1} of ${questions.length}`}
          />
        )}

        <div
          className="rf-surface rf-lift-indigo flex flex-col items-center text-center"
          style={{ gap: 'var(--s-3)', padding: 'var(--s-6) var(--s-4)' }}
        >
          <p
            className="rf-gujarati"
            style={{ fontSize: 'var(--t-4xl)', fontWeight: 800, lineHeight: 1.2 }}
          >
            {question.gujarati}
          </p>
          <PlayButton
            id={questionId}
            label={`Hear ${question.gujarati}`}
            onClick={() => speak(question.gujarati, questionId)}
            currentlyPlaying={currentlyPlaying}
            ttsLoading={ttsLoading}
            ttsProgress={ttsProgress}
            failedId={failedId}
            size={48}
            tone="paper"
          />
          <p style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>{question.question}</p>
        </div>

        <div className="rf-grid rf-grid--tiles" role="group" aria-label="Answers">
          {question.options.map((option, index) => {
            const isCorrect = index === question.answer;
            const isPicked = index === selectedAnswer;
            const revealed = selectedAnswer !== null;

            let background = 'var(--paper)';
            let borderColor = 'var(--ink-key)';
            let lift = 'var(--lift-2) var(--ink-key)';
            let animation = '';

            if (revealed && isCorrect) {
              background = 'var(--state-learned-bg)';
              borderColor = 'var(--state-learned)';
              lift = 'var(--lift-2) var(--state-learned)';
              animation = 'rf-pop';
            } else if (revealed && isPicked) {
              // Not-it, not wrong: the right answer is already lit next to it.
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
                  gap: 'var(--s-2)',
                  minHeight: 68,
                  padding: 'var(--s-3)',
                  background,
                  border: `var(--key-w) solid ${borderColor}`,
                  borderRadius: 'var(--r-lg)',
                  boxShadow: lift,
                  fontSize: 'var(--t-md)',
                  fontWeight: 700,
                  opacity: revealed && !isCorrect && !isPicked ? 0.75 : 1,
                }}
              >
                {revealed && isCorrect && (
                  <Icon name="check" size={19} strokeWidth={2.6} style={{ color: 'var(--state-learned)', flex: 'none' }} />
                )}

                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {selectedAnswer !== null && (
          <p
            aria-live="polite"
            className="text-center"
            style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--text-2)' }}
          >
            {selectedAnswer === question.answer
              ? 'Yes! That is the one.'
              : `This one is ${question.options[question.answer]}. Now you know it.`}
          </p>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------- Result */

  if (showResult) {
    const total = Math.max(1, isTimeAttack ? answered : questions.length);
    const pct = Math.round((score / total) * 100);
    const tier = pct >= 80 ? 'great' : pct >= 50 ? 'good' : 'keep';
    const mark: IconName = tier === 'great' ? 'trophy' : tier === 'good' ? 'star' : 'sprout';
    const ink =
      tier === 'great' ? 'var(--state-learned)' : tier === 'good' ? 'var(--ink-saffron)' : 'var(--ink-indigo)';

    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {pct >= 80 && <Confetti />}
        <div
          className="rf-surface rf-lift-saffron flex flex-col items-center text-center"
          style={{ gap: 'var(--s-3)', padding: 'var(--s-8) var(--s-5)' }}
        >
          <span
            className="rf-pop inline-flex items-center justify-center rounded-full"
            style={{ width: 84, height: 84, background: ink, color: 'var(--text-on-ink)', border: 'var(--key)' }}
          >
            <Icon name={mark} size={42} />
          </span>

          <h2 style={{ fontSize: 'var(--t-2xl)', fontWeight: 800 }}>
            {tier === 'great' ? 'Brilliant!' : tier === 'good' ? 'Nicely done!' : 'Good effort!'}
          </h2>
          {/* Stars a child can count, not a percentage they cannot read. */}
          <p
            className="flex items-center justify-center"
            style={{ gap: 2 }}
            aria-label={`${score} right out of ${total}`}
          >
            {Array.from({ length: total }, (_, i) => (
              <Icon
                key={i}
                name={i < score ? 'star' : 'starOutline'}
                size={total > 8 ? 18 : 28}
                style={{ color: i < score ? 'var(--ink-saffron)' : 'var(--text-3)' }}
              />
            ))}
          </p>
          <p className="tabular-nums" style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, color: ink, lineHeight: 1 }}>
            {score} of {total}
          </p>

          <div className="w-full" style={{ marginTop: 'var(--s-2)' }}>
            <Meter value={score} max={total} ink={ink} label={`${score} of ${total} correct`} />
          </div>

          <div className="flex w-full" style={{ gap: 'var(--s-2)', marginTop: 'var(--s-4)' }}>
            <button type="button" onClick={startQuiz} className="rf-btn rf-btn--primary rf-btn--lg flex-1">
              <Icon name="refresh" size={18} />
              Play again
            </button>
            <button
              type="button"
              onClick={() => setQuestions([])}
              className="rf-btn rf-btn--paper rf-btn--lg flex-1"
            >
              Change quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- Setup */

  return (
    <div className="rf-grid" style={{ gap: 'var(--s-5)', maxWidth: 620, margin: '0 auto' }}>
      <SectionHeader icon="quiz" title="Quiz time" gujarati="રમત-રમતમાં શીખો" />

      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
          What shall we practise?
        </legend>
        <SegTabs label="Quiz subject" value={quizType} onChange={setQuizType} options={TYPE_OPTIONS} />
      </fieldset>

      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
          How hard?
        </legend>
        <SegTabs
          label="Difficulty"
          value={String(quizLevel)}
          onChange={value => setQuizLevel(Number(value))}
          options={LEVELS.map(level => ({ value: String(level.value), label: level.label }))}
        />
      </fieldset>

      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
          Mode
        </legend>
        <SegTabs
          label="Quiz mode"
          value={isTimeAttack ? 'timed' : 'standard'}
          onChange={value => setIsTimeAttack(value === 'timed')}
          options={[
            { value: 'standard', label: `${STANDARD_QUESTIONS} questions`, icon: 'quiz' },
            { value: 'timed', label: `${TIME_ATTACK_SECONDS}s dash`, icon: 'clock' },
          ]}
        />
        <p style={{ marginTop: 'var(--s-2)', fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}>
          {isTimeAttack
            ? 'Answer as many as you can before the time runs out.'
            : `Five questions, no clock. Wrong answers just show you the right one.`}
        </p>
      </fieldset>

      <button type="button" onClick={startQuiz} className="rf-btn rf-btn--primary rf-btn--lg rf-btn--block">
        <Icon name="play" size={18} />
        Start the quiz
      </button>
    </div>
  );
}
