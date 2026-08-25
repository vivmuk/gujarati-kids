import type { CSSProperties } from 'react';

/* ============================================================================
   The two authored marks of this world that are not icons:
   Guju (the mascot) and the Ajrakh block-print band.

   Everything else — halftone, offset lift, press — lives in globals.css;
   every glyph lives in Icon.tsx.
   ========================================================================= */

const INK_INDIGO = '#1d3c6e';
const INK_SAFFRON = '#ef5a23';
const INK_KEY = '#241c12';

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
  body: INK_SAFFRON,
  belly: '#f6d9a8',
  wing: '#c8390f',
  beak: INK_INDIGO,
  crest: INK_INDIGO,
  cheek: '#f7b27e',
  eye: INK_KEY,
  outline: INK_KEY,
};

export function Guju({
  size = 96,
  skin = {},
  ink = false,
  sw = 2.4,
  className,
  style,
  title,
}: {
  size?: number;
  skin?: Partial<GujuSkin>;
  ink?: boolean;
  sw?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
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
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
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

/** Ajrakh border: the repeating block-print rule that separates zones. */
export function BlockPrintBand({
  color = INK_INDIGO,
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

/** Print-shop burst, for the one thing on a screen that is genuinely new. */
export function Starburst({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="relative inline-flex shrink-0 rotate-[8deg] items-center justify-center font-black"
      style={{
        width: 46,
        height: 46,
        fontFamily: 'var(--font-ui)',
        fontSize: 'var(--t-2xs)',
        letterSpacing: '0.04em',
        color: 'var(--text-on-ink)',
      }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <polygon
          fill="var(--ink-saffron)"
          stroke={INK_KEY}
          strokeWidth="3"
          strokeLinejoin="round"
          points="50,4 59,21 78,13 74,33 94,38 80,52 94,66 74,71 78,90 59,84 50,98 41,84 22,90 26,71 6,66 20,52 6,38 26,33 22,13 41,21"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}
