'use client';

import { useState } from 'react';
import { phrases, stories, swar, vyanjan, words } from '@/data/gujarati';
import { days, getBeltForPercentage, updateStreak, type StreakData } from '@/lib/streaks';
import { Icon, type IconName } from './Icon';
import { Meter, SectionHeader } from './ui';
import { GujaratMap, type MapCity } from './GujaratMap';

interface ProgressState {
  lettersLearned: string[];
  wordsLearned: string[];
  phrasesLearned: string[];
  quizScore: number;
  quizTotal: number;
  storiesRead: string[];
}

/** x/y are percentages on the GujaratMap silhouette. */
const GUJARAT_MAP: MapCity[] = [
  { id: 'ahmedabad', name: 'Ahmedabad', gujarati: 'અમદાવાદ', icon: 'home', req: 0, desc: 'Where the journey starts — the Sabarmati Ashram.', x: 70, y: 17 },
  { id: 'vadodara', name: 'Vadodara', gujarati: 'વડોદરા', icon: 'music', req: 20, desc: 'The cultural capital, and the home of Garba.', x: 70, y: 38 },
  { id: 'rajkot', name: 'Rajkot', gujarati: 'રાજકોટ', icon: 'palette', req: 40, desc: 'The colours of Saurashtra.', x: 32, y: 41 },
  { id: 'kutch', name: 'Kutch', gujarati: 'કચ્છ', icon: 'sun', req: 60, desc: 'The White Desert and the Rann Utsav.', x: 26, y: 14 },
  { id: 'gir', name: 'Gir Forest', gujarati: 'ગીર જંગલ', icon: 'paw', req: 80, desc: 'Home of the Asiatic lion.', x: 34, y: 58 },
  { id: 'surat', name: 'Surat', gujarati: 'સુરત', icon: 'gem', req: 100, desc: 'The last stop — diamonds, and a plate of locho.', x: 71, y: 74 },
];

export function SettingsSection({ progress }: { progress: ProgressState }) {
  const [streak] = useState<StreakData>(() =>
    typeof window === 'undefined'
      ? { currentStreak: 0, lastLoginDate: null, bestStreak: 0 }
      : updateStreak()
  );
  const [showDetails, setShowDetails] = useState(false);

  const totals = {
    letters: swar.length + vyanjan.length,
    words: words.length,
    phrases: phrases.length,
    stories: stories.length,
  };

  const items: Array<{ label: string; icon: IconName; pct: number; count: number; total: number; ink: string }> = [
    {
      label: 'Letters',
      icon: 'letters',
      count: progress.lettersLearned.length,
      total: totals.letters,
      pct: Math.round((progress.lettersLearned.length / totals.letters) * 100),
      ink: 'var(--ink-indigo)',
    },
    {
      label: 'Words',
      icon: 'words',
      count: progress.wordsLearned.length,
      total: totals.words,
      pct: Math.round((progress.wordsLearned.length / totals.words) * 100),
      ink: 'var(--ink-saffron)',
    },
    {
      label: 'Phrases',
      icon: 'phrases',
      count: progress.phrasesLearned.length,
      total: totals.phrases,
      pct: Math.round((progress.phrasesLearned.length / totals.phrases) * 100),
      ink: 'var(--ink-leaf)',
    },
    {
      label: 'Stories',
      icon: 'stories',
      count: progress.storiesRead.length,
      total: totals.stories,
      pct: Math.round((progress.storiesRead.length / totals.stories) * 100),
      ink: 'var(--ink-pink)',
    },
    {
      label: 'Quiz',
      icon: 'quiz',
      count: progress.quizScore,
      total: progress.quizTotal,
      pct: progress.quizTotal > 0 ? Math.round((progress.quizScore / progress.quizTotal) * 100) : 0,
      ink: 'var(--ink-saffron-deep)',
    },
  ];

  const overall = items.reduce((sum, item) => sum + item.pct, 0) / items.length;
  const belt = getBeltForPercentage(overall);
  const stage: IconName = overall < 20 ? 'sprout' : overall < 50 ? 'leaf' : overall < 80 ? 'star' : 'trophy';

  return (
    <div className="rf-grid" style={{ gap: 'var(--s-4)' }}>
      <SectionHeader icon="progress" title="Your progress" gujarati="તમારી પ્રગતિ" />

      {/* Streak + belt, side by side once there is room */}
      <div className="rf-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div
          className="rf-surface rf-lift-saffron flex items-center"
          style={{ gap: 'var(--s-3)', padding: 'var(--s-4)' }}
        >
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 48,
              height: 48,
              flex: 'none',
              background: 'var(--ink-saffron)',
              color: 'var(--text-on-ink)',
              border: 'var(--key-thin)',
            }}
          >
            <Icon name="flame" size={26} />
          </span>
          <div className="min-w-0">
            <p style={{ fontSize: 'var(--t-lg)', fontWeight: 800, color: 'var(--ink-saffron-deep)' }}>
              Day {streak.currentStreak}
            </p>
            <p className="rf-label">Best run: {days(streak.bestStreak)}</p>
          </div>
        </div>

        <div
          className="rf-surface rf-lift-indigo flex items-center"
          style={{ gap: 'var(--s-3)', padding: 'var(--s-4)' }}
        >
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 48,
              height: 48,
              flex: 'none',
              background: 'var(--ink-indigo)',
              color: 'var(--text-on-ink)',
              border: 'var(--key-thin)',
            }}
          >
            <Icon name={stage} size={26} />
          </span>
          <div className="min-w-0">
            <p className="truncate" style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>
              {belt.name}
            </p>
            <p className="rf-label">{Math.round(overall)}% overall</p>
          </div>
        </div>
      </div>

      <div className="rf-surface" style={{ padding: 'var(--s-4)' }}>
        <Meter
          value={Math.round(overall)}
          max={100}
          label={`${Math.round(overall)} percent overall progress`}
        />
      </div>

      {/* Journey across Gujarat */}
      <section>
        <h2 style={{ fontSize: 'var(--t-lg)', fontWeight: 700, marginBottom: 'var(--s-3)' }}>
          Journey across Gujarat
        </h2>
        <div style={{ maxWidth: 460 }}>
          <GujaratMap cities={GUJARAT_MAP} overall={overall} />
        </div>
      </section>

      {/* Detail */}
      <section>
        <button
          type="button"
          onClick={() => setShowDetails(value => !value)}
          aria-expanded={showDetails}
          className="rf-btn rf-btn--paper rf-btn--block"
        >
          <Icon
            name="chevronDown"
            size={18}
            style={{
              transform: showDetails ? 'rotate(180deg)' : 'none',
              transition: 'transform var(--dur-2) var(--ease)',
            }}
          />
          {showDetails ? 'Hide the details' : 'See every count'}
        </button>

        {showDetails && (
          <div className="rf-grid rf-rise" style={{ marginTop: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {items.map(item => (
              <div key={item.label} className="rf-surface" style={{ padding: 'var(--s-3)' }}>
                <div
                  className="flex items-center justify-between"
                  style={{ gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}
                >
                  <span
                    className="flex items-center"
                    style={{ gap: 'var(--s-2)', fontSize: 'var(--t-sm)', fontWeight: 700 }}
                  >
                    <Icon name={item.icon} size={17} style={{ color: item.ink }} />
                    {item.label}
                  </span>
                  <span
                    className="tabular-nums"
                    style={{ fontSize: 'var(--t-xs)', fontWeight: 600, color: 'var(--text-2)' }}
                  >
                    {item.count}
                    {item.total > 0 ? ` / ${item.total}` : ''}
                  </span>
                </div>
                <Meter
                  value={item.count}
                  max={item.total || 1}
                  ink={item.ink}
                  label={`${item.label}: ${item.count} of ${item.total}`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <p
        className="rf-surface--sunk flex items-start"
        style={{ gap: 'var(--s-2)', padding: 'var(--s-3)', fontSize: 'var(--t-xs)', color: 'var(--text-2)' }}
      >
        <Icon name="pin" size={16} style={{ flex: 'none', marginTop: 1 }} />
        Progress is saved on this device only — there is no account and nothing is uploaded.
      </p>
    </div>
  );
}
