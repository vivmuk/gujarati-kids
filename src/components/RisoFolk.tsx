import type { CSSProperties, ReactNode } from 'react';

const RF_INDIGO = '#1d3c6e';
const RF_SAFFRON = '#ef5a23';
const RF_INK = '#241c12';

type GujuSkin = {
  body: string;
  belly: string;
  wing: string;
  beak: string;
  crest: string;
  cheek: string;
  eye: string;
  outline: string;
};

const DEFAULT_GUJU_SKIN: GujuSkin = {
  body: RF_SAFFRON,
  belly: '#f6d9a8',
  wing: '#c8390f',
  beak: RF_INDIGO,
  crest: RF_INDIGO,
  cheek: '#f7b27e',
  eye: RF_INK,
  outline: RF_INK,
};

export function Guju({
  size = 96,
  skin = {},
  ink = false,
  sw = 2.4,
  className,
  style,
}: {
  size?: number;
  skin?: Partial<GujuSkin>;
  ink?: boolean;
  sw?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const c = { ...DEFAULT_GUJU_SKIN, ...skin };
  const fillFor = (color: string) => (ink ? 'none' : color);

  return (
    <svg
      viewBox="0 0 100 116"
      width={size}
      height={size * 1.16}
      className={className}
      style={style}
      fill="none"
      stroke={c.outline}
      strokeWidth={sw}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="36,86 22,112 44,96" fill={fillFor(c.wing)} />
      <polygon points="46,90 40,114 58,98" fill={fillFor(c.body)} />
      <ellipse cx="52" cy="70" rx="29" ry="33" fill={fillFor(c.body)} />
      <ellipse cx="50" cy="78" rx="18" ry="22" fill={fillFor(c.belly)} />
      <ellipse cx="74" cy="68" rx="11" ry="20" fill={fillFor(c.wing)} transform="rotate(14 74 68)" />
      <circle cx="48" cy="36" r="26" fill={fillFor(c.body)} />
      <polygon points="40,11 46,2 50,13" fill={fillFor(c.crest)} />
      <polygon points="50,12 56,3 60,14" fill={fillFor(c.crest)} />
      <circle cx="40" cy="34" r="7.5" fill={ink ? 'none' : '#fff'} />
      <circle cx="58" cy="34" r="7.5" fill={ink ? 'none' : '#fff'} />
      <circle cx="41" cy="35" r="3.2" fill={c.eye} stroke="none" />
      <circle cx="57" cy="35" r="3.2" fill={c.eye} stroke="none" />
      <path d="M43 42 Q49 41 55 42 Q52 53 49 53 Q45 51 43 42 Z" fill={fillFor(c.beak)} />
      {!ink && <circle cx="31" cy="44" r="4" fill={c.cheek} stroke="none" />}
      {!ink && <circle cx="66" cy="44" r="4" fill={c.cheek} stroke="none" />}
      <path d="M44 101 l0 8 M40 110 l8 0" stroke={c.beak} strokeLinecap="round" />
      <path d="M58 101 l0 8 M54 110 l8 0" stroke={c.beak} strokeLinecap="round" />
    </svg>
  );
}

export function BlockPrintBand({
  color = RF_INDIGO,
  height = 14,
  opacity = 0.5,
  className = '',
}: {
  color?: string;
  height?: number;
  opacity?: number;
  className?: string;
}) {
  const tile = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
    <g fill='none' stroke='${color}' stroke-width='1.6' opacity='${opacity}'>
      <rect x='6' y='6' width='24' height='24' transform='rotate(45 18 18)'/>
      <circle cx='18' cy='18' r='3.2' fill='${color}' stroke='none'/>
      <circle cx='0' cy='18' r='2' fill='${color}' stroke='none'/>
      <circle cx='36' cy='18' r='2' fill='${color}' stroke='none'/>
      <circle cx='18' cy='0' r='2' fill='${color}' stroke='none'/>
      <circle cx='18' cy='36' r='2' fill='${color}' stroke='none'/>
    </g>
  </svg>`;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        height,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(tile)}")`,
        backgroundSize: `${height * 2}px ${height * 2}px`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center',
      }}
    />
  );
}

export function HalftoneOverlay({
  alpha = 0.14,
  size = 6,
  className = '',
}: {
  alpha?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(rgba(255,255,255,${alpha}) 22%, transparent 23%)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

export function ProgressRing({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label?: string;
}) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;
  const offset = circumference * (1 - ratio);

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-label={label}>
      <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4.5" />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke="var(--rf-saffron)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 20 20)"
      />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, fill: RF_INK }}
      >
        {value}
      </text>
    </svg>
  );
}

export function Starburst({ children }: { children: ReactNode }) {
  return (
    <span
      className="relative inline-flex h-11 w-11 shrink-0 rotate-[8deg] items-center justify-center text-[10px] font-black text-white"
      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.3px' }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <polygon
          fill="var(--rf-saffron)"
          points="50,4 59,21 78,13 74,33 94,38 80,52 94,66 74,71 78,90 59,84 50,98 41,84 22,90 26,71 6,66 20,52 6,38 26,33 22,13 41,21"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

export function PlayTriangleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

