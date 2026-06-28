'use client';
import { useMemo, useState } from 'react';
import { HalftoneOverlay } from './RisoFolk';

export interface MapCity {
  id: string;
  name: string;
  gujarati: string;
  icon: string;
  req: number;
  desc: string;
  x: number; // 0-100, position on the map silhouette
  y: number; // 0-100, position on the map silhouette
}

// Smooth quadratic curve through two points with a perpendicular bow,
// alternating direction per segment so the road snakes across the map
// instead of cutting straight lines between cities.
function curveBetween(a: MapCity, b: MapCity, bow: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cx = mx - dy * bow;
  const cy = my + dx * bow;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

export function GujaratMap({ cities, overall }: { cities: MapCity[]; overall: number }) {
  const states = useMemo(
    () =>
      cities.map((city, idx) => ({
        city,
        unlocked: overall >= city.req,
        next: overall < city.req && (idx === 0 || overall >= cities[idx - 1].req),
      })),
    [cities, overall]
  );

  const defaultSelected = states.find(s => s.next)?.city.id ?? states[states.length - 1].city.id;
  const [selectedId, setSelectedId] = useState(defaultSelected);
  const selected = states.find(s => s.city.id === selectedId) ?? states[0];

  return (
    <div>
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ border: 'var(--rf-border)', boxShadow: 'var(--rf-shadow-indigo)', background: '#cfe8f0', aspectRatio: '4 / 5' }}
      >
        <HalftoneOverlay alpha={0.08} size={8} />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* Stylized Gujarat silhouette: Kutch (top-left), Saurashtra peninsula (mid-left), mainland strip (right) */}
          <g fill="#f3e6c5" stroke="var(--rf-ink)" strokeWidth="1.2" opacity="0.9">
            <ellipse cx="27" cy="13" rx="19" ry="11" transform="rotate(-8 27 13)" />
            <ellipse cx="33" cy="44" rx="22" ry="24" transform="rotate(6 33 44)" />
            <path d="M64 4 Q84 2 88 18 Q90 44 80 60 Q84 70 76 88 Q68 94 66 82 Q70 60 62 50 Q56 36 58 22 Q58 10 64 4 Z" />
          </g>

          {/* Path between cities */}
          {states.slice(1).map((s, i) => {
            const a = states[i].city;
            const bow = i % 2 === 0 ? 0.18 : -0.18;
            return (
              <path
                key={s.city.id}
                d={curveBetween(a, s.city, bow)}
                fill="none"
                stroke={s.unlocked ? 'var(--rf-saffron)' : '#9aa5b1'}
                strokeWidth={s.unlocked ? 1.8 : 1.3}
                strokeDasharray={s.unlocked ? undefined : '3 2.5'}
                strokeLinecap="round"
              />
            );
          })}

          {/* City markers */}
          {states.map(({ city, unlocked, next }) => (
            <g
              key={city.id}
              transform={`translate(${city.x} ${city.y})`}
              onClick={() => setSelectedId(city.id)}
              style={{ cursor: 'pointer' }}
            >
              {next && <circle r="6.5" fill="none" stroke="var(--rf-saffron)" strokeWidth="1" opacity="0.6">
                <animate attributeName="r" values="5;7.5;5" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.6s" repeatCount="indefinite" />
              </circle>}
              <circle
                r="5"
                fill={unlocked ? '#fff' : next ? '#fef3c7' : '#e5e7eb'}
                stroke={unlocked ? '#22c55e' : next ? '#f59e0b' : '#9ca3af'}
                strokeWidth={selectedId === city.id ? 1.6 : 1}
              />
              <text textAnchor="middle" dominantBaseline="central" fontSize="5.2">
                {unlocked ? city.icon : next ? '📍' : '🔒'}
              </text>
              <text y="9" textAnchor="middle" fontSize="3.2" fontWeight="700" fill="var(--rf-ink)">
                {city.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Selected city details */}
      <div
        className="rf-card mt-3 p-3"
        style={{ boxShadow: 'var(--rf-shadow-saffron)', border: 'var(--rf-border)' }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gray-900">{selected.city.name}</h4>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-gujarati)' }}>{selected.city.gujarati}</p>
          </div>
          {!selected.unlocked && (
            <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-lg text-gray-500">
              {selected.city.req}% req
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-2 font-medium">
          {selected.unlocked ? selected.city.desc : `Reach ${selected.city.req}% overall progress to unlock ${selected.city.name}.`}
        </p>
      </div>
    </div>
  );
}
