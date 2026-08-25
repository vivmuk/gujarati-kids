'use client';

import { useMemo, useState } from 'react';
import { Icon, type IconName } from './Icon';
import { usePrefersReducedMotion } from './ui';

export interface MapCity {
  id: string;
  name: string;
  gujarati: string;
  icon: IconName;
  req: number;
  desc: string;
  /** 0–100 position on the map silhouette. */
  x: number;
  y: number;
}

/** Quadratic curve with a perpendicular bow, alternating per segment, so the
 *  road snakes across Gujarat instead of cutting straight lines. */
function curveBetween(a: MapCity, b: MapCity, bow: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return `M ${a.x} ${a.y} Q ${mx - dy * bow} ${my + dx * bow} ${b.x} ${b.y}`;
}

export function GujaratMap({ cities, overall }: { cities: MapCity[]; overall: number }) {
  // SMIL <animate> is invisible to the CSS reduced-motion block, so it is
  // gated here instead.
  const stillness = usePrefersReducedMotion();
  const states = useMemo(
    () =>
      cities.map((city, index) => ({
        city,
        unlocked: overall >= city.req,
        next: overall < city.req && (index === 0 || overall >= cities[index - 1].req),
      })),
    [cities, overall]
  );

  const fallbackId = states.find(state => state.next)?.city.id ?? states[states.length - 1].city.id;
  const [selectedId, setSelectedId] = useState(fallbackId);
  const selected = states.find(state => state.city.id === selectedId) ?? states[0];

  return (
    <div>
      <div
        className="rf-surface rf-lift-indigo relative overflow-hidden"
        style={{ background: 'var(--ink-indigo-pale)', aspectRatio: '4 / 5' }}
      >
        <span className="rf-halftone" aria-hidden="true" style={{ backgroundSize: '8px 8px' }} />

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* Kutch in the north-west, the Saurashtra peninsula below it, and
              the mainland running down the east — the three masses a child
              would recognise on a map of Gujarat. */}
          <g fill="var(--paper-cream)" stroke="var(--ink-key)" strokeWidth="1">
            <path d="M8 16 Q14 7 27 6 Q41 5 47 11 Q50 15 46 19 Q38 24 26 24 Q13 24 8 16 Z" />
            <path d="M14 40 Q18 31 31 29 Q46 28 52 37 Q56 45 52 55 Q46 66 33 68 Q20 68 15 58 Q11 49 14 40 Z" />
            <path d="M60 6 Q74 2 83 9 Q90 16 87 28 Q84 40 78 50 Q83 62 76 78 Q72 90 66 87 Q62 82 65 70 Q68 58 63 49 Q57 38 58 24 Q58 12 60 6 Z" />
          </g>

          {states.slice(1).map((state, index) => (
            <path
              key={state.city.id}
              d={curveBetween(states[index].city, state.city, index % 2 === 0 ? 0.18 : -0.18)}
              fill="none"
              stroke={state.unlocked ? 'var(--ink-saffron)' : 'var(--text-3)'}
              strokeWidth={state.unlocked ? 1.9 : 1.3}
              strokeDasharray={state.unlocked ? undefined : '3 2.5'}
              strokeLinecap="round"
            />
          ))}

          {states.map(({ city, unlocked, next }) => (
            <g key={city.id} transform={`translate(${city.x} ${city.y})`}>
              {next && (
                <circle r="6.5" fill="none" stroke="var(--ink-saffron)" strokeWidth="1" opacity="0.7">
                  {!stillness && (
                    <>
                      <animate attributeName="r" values="5;8;5" dur="1.8s" repeatCount="indefinite" />
                      <animate
                        attributeName="opacity"
                        values="0.7;0.05;0.7"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </>
                  )}
                </circle>
              )}
              <circle
                r="5"
                fill={unlocked ? 'var(--paper)' : next ? 'var(--ink-saffron-pale)' : 'var(--paper-sunk)'}
                stroke={unlocked ? 'var(--ink-leaf)' : next ? 'var(--ink-saffron)' : 'var(--text-3)'}
                strokeWidth={selectedId === city.id ? 1.8 : 1}
              />
              {/* Icon draws with currentColor, so the tint rides on `color`. */}
              <g
                transform="translate(-3.2 -3.2) scale(0.267)"
                style={{
                  color: unlocked
                    ? 'var(--ink-indigo)'
                    : next
                      ? 'var(--ink-saffron-deep)'
                      : 'var(--text-3)',
                }}
              >
                <Icon name={unlocked ? city.icon : next ? 'pin' : 'lock'} size={24} strokeWidth={2.4} />
              </g>
              {/* Painted stroke-first so the name survives crossing a coastline. */}
              <text
                y="9.8"
                textAnchor="middle"
                fontSize="3.4"
                fontWeight="700"
                fill="var(--ink-key)"
                stroke="var(--paper)"
                strokeWidth="1.4"
                paintOrder="stroke"
                strokeLinejoin="round"
                fontFamily="var(--font-ui)"
              >
                {city.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Real buttons over the drawing, so the map is keyboard reachable. */}
        {states.map(({ city, unlocked }) => (
          <button
            key={city.id}
            type="button"
            onClick={() => setSelectedId(city.id)}
            aria-pressed={selectedId === city.id}
            aria-label={`${city.name}${unlocked ? '' : `, locked until ${city.req}% progress`}`}
            style={{
              position: 'absolute',
              left: `${city.x}%`,
              top: `${city.y}%`,
              width: 44,
              height: 44,
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              border: 0,
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <div className="rf-surface rf-lift-saffron" style={{ marginTop: 'var(--s-3)', padding: 'var(--s-3)' }}>
        <div className="flex items-start justify-between" style={{ gap: 'var(--s-3)' }}>
          <div className="min-w-0">
            <h3 style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>{selected.city.name}</h3>
            <p className="rf-gujarati" style={{ fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}>
              {selected.city.gujarati}
            </p>
          </div>
          <span
            className="rf-chip"
            style={{
              minHeight: 30,
              flex: 'none',
              pointerEvents: 'none',
              background: selected.unlocked ? 'var(--state-learned-bg)' : 'var(--paper-sunk)',
              color: selected.unlocked ? 'var(--state-learned)' : 'var(--text-2)',
              fontSize: 'var(--t-xs)',
            }}
          >
            <Icon name={selected.unlocked ? 'check' : 'lock'} size={14} strokeWidth={2.6} />
            {selected.unlocked ? 'Unlocked' : `${selected.city.req}%`}
          </span>
        </div>
        <p style={{ marginTop: 'var(--s-2)', fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}>
          {selected.unlocked
            ? selected.city.desc
            : `Reach ${selected.city.req}% overall to unlock ${selected.city.name}.`}
        </p>
      </div>
    </div>
  );
}
