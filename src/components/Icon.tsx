import type { CSSProperties, ReactNode } from 'react';

/* ============================================================================
   Riso-Folk icon set

   One grammar, no exceptions: 24×24 board, 2px stroke, round caps and joins,
   currentColor only. Block-print geometry — straight cuts, circles, lozenges —
   the same shapes the Ajrakh borders and the generated illustrations use.

   Nothing in this app is allowed to use an emoji as an icon. If a concept
   needs a mark, it gets drawn here.
   ========================================================================= */

const P: Record<string, ReactNode> = {
  /* ---- Navigation ---------------------------------------------------- */
  home: (
    <>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M5.5 10v9h13v-9" />
      <path d="M9.8 19v-5.2h4.4V19" />
    </>
  ),
  letters: (
    <>
      <path d="M4 19V7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5V19" />
      <path d="M4 19h16" />
      <path d="M8.5 15.5 12 8l3.5 7.5" />
      <path d="M9.9 12.8h4.2" />
    </>
  ),
  words: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="M18 8.5h1.5A1.5 1.5 0 0 1 21 10v7.5a1.5 1.5 0 0 1-1.5 1.5H9" />
      <path d="M6.5 10.5h6M6.5 13.5h4" />
    </>
  ),
  phrases: (
    <>
      <path d="M4 5.5h16v10H9.5L5 19.5V15.5H4z" />
      <circle cx="9" cy="10.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="10.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10.5" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  stories: (
    <>
      <path d="M12 6.6C10.4 5.2 8.4 4.6 5 4.8v13c3.4-.2 5.4.4 7 1.8 1.6-1.4 3.6-2 7-1.8v-13c-3.4-.2-5.4.4-7 1.8z" />
      <path d="M12 6.6v13.2" />
    </>
  ),
  quiz: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  numbers: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M3.5 14.5h17M9.2 4.5v15M14.8 4.5v15" />
    </>
  ),
  progress: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 20v-5M12.7 20v-9M17.4 20v-13" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.2v2.4M12 18.4v2.4M20.8 12h-2.4M5.6 12H3.2M18.2 5.8l-1.7 1.7M7.5 16.5l-1.7 1.7M18.2 18.2l-1.7-1.7M7.5 7.5 5.8 5.8" />
    </>
  ),

  /* ---- Playback + audio ---------------------------------------------- */
  play: <path d="M8 5.2 19 12 8 18.8z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="7" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.4" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  speaker: (
    <>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8" />
    </>
  ),
  speakerLoud: (
    <>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8" />
      <path d="M18 7.2a6.8 6.8 0 0 1 0 9.6" />
    </>
  ),
  speakerOff: (
    <>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      <path d="m16 10 4 4M20 10l-4 4" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3.2" width="6" height="10.4" rx="3" />
      <path d="M5.8 11.6a6.2 6.2 0 0 0 12.4 0" />
      <path d="M12 17.8v3M9 20.8h6" />
    </>
  ),
  ear: (
    <>
      <path d="M7.6 9.4a4.4 4.4 0 1 1 8.8 0c0 2.6-2.4 3.2-3.3 4.7-.6 1-.2 2.3-1.1 3.2a2.5 2.5 0 0 1-4.2-1.8" />
      <path d="M10.6 9.6a1.6 1.6 0 0 1 3.1.4" />
    </>
  ),

  /* ---- Feedback + status ---------------------------------------------- */
  check: <path d="m5 12.6 4.6 4.4L19 6.8" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  star: (
    <path
      d="M12 3.6 14.5 9l5.9.7-4.4 4 1.2 5.8L12 16.6l-5.2 2.9L8 13.7l-4.4-4L9.5 9z"
      fill="currentColor"
      stroke="none"
    />
  ),
  starOutline: <path d="M12 3.6 14.5 9l5.9.7-4.4 4 1.2 5.8L12 16.6l-5.2 2.9L8 13.7l-4.4-4L9.5 9z" />,
  flame: (
    <>
      <path d="M13 3.2c.6 3-1.2 4.2-2.7 5.7C8.4 10.7 7 12.2 7 14.6a5 5 0 0 0 10 0c0-2.2-1-3.6-2.2-5" />
      <path d="M12 19.4a2.5 2.5 0 0 1-1.4-4.5c.9-.6 1.3-1.3 1.2-2.4 1.3.9 2.6 2.2 2.6 4a2.5 2.5 0 0 1-2.4 2.9z" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.4 13.6 9 19 10.6 13.6 12.2 12 17.8 10.4 12.2 5 10.6 10.4 9z" />
      <path d="M18.2 15.6 19 18l2.4.8-2.4.8L18.2 22l-.8-2.4L15 18.8l2.4-.8z" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.5 4.5h9v4.8a4.5 4.5 0 0 1-9 0z" />
      <path d="M7.5 6H5a2.5 2.5 0 0 0 2.5 2.5M16.5 6H19a2.5 2.5 0 0 1-2.5 2.5" />
      <path d="M12 13.8v3.4M8.6 20h6.8l-.7-2.8H9.3z" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 20v-7.4" />
      <path d="M12 13.6C10.4 13.6 7 12.8 7 9.4c3.4 0 5 1.5 5 4.2z" />
      <path d="M12 12.4c1.4 0 4.4-.8 4.4-3.9-3 0-4.4 1.4-4.4 3.9z" />
      <path d="M8.4 20h7.2" />
    </>
  ),

  /* ---- Direction ------------------------------------------------------ */
  arrowLeft: (
    <>
      <path d="M19 12H5.6" />
      <path d="m11 5.8-5.4 6.2 5.4 6.2" />
    </>
  ),
  chevronLeft: <path d="m14.6 5.8-6.2 6.2 6.2 6.2" />,
  chevronRight: <path d="m9.4 5.8 6.2 6.2-6.2 6.2" />,
  chevronDown: <path d="m5.8 9.4 6.2 6.2 6.2-6.2" />,

  /* ---- Tools ---------------------------------------------------------- */
  pencil: (
    <>
      <path d="M4 20.2 4.9 16 16.4 4.5a2.2 2.2 0 0 1 3.1 3.1L8 19.1z" />
      <path d="m14.6 6.4 3.1 3.1" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11.4A8 8 0 0 0 6.1 6.7L4 8.9" />
      <path d="M4 4.4v4.5h4.5" />
      <path d="M4 12.6a8 8 0 0 0 13.9 4.7L20 15.1" />
      <path d="M20 19.6v-4.5h-4.5" />
    </>
  ),
  send: (
    <>
      <path d="M20.4 3.6 3.8 10.4l6.6 2.9 2.9 6.6z" />
      <path d="m10.4 13.3 4.6-4.6" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <circle cx="9" cy="10.2" r="1.6" />
      <path d="m4.6 17.4 4.5-4.3 3.3 3.1 3-2.8 4 3.8" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="12.5" height="12" rx="2.5" />
      <path d="m15.5 11 5.5-3.2v8.4L15.5 13z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  lock: (
    <>
      <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="2.2" />
      <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c3.6-4.4 5.4-7.5 5.4-9.6a5.4 5.4 0 1 0-10.8 0C6.6 13.5 8.4 16.6 12 21z" />
      <circle cx="12" cy="11.2" r="2.1" />
    </>
  ),

  /* ---- Word / phrase categories --------------------------------------- */
  paw: (
    <>
      <ellipse cx="12" cy="15.6" rx="4.3" ry="3.6" />
      <ellipse cx="6.6" cy="10.6" rx="2.1" ry="2.5" />
      <ellipse cx="17.4" cy="10.6" rx="2.1" ry="2.5" />
      <ellipse cx="10" cy="6.6" rx="1.9" ry="2.3" />
      <ellipse cx="15.4" cy="6.9" rx="1.8" ry="2.2" />
    </>
  ),
  apple: (
    <>
      <path d="M12 7.4c-1-.9-2.2-1.3-3.4-1C6.8 6.8 5.6 8.6 5.6 11c0 3.6 2.6 8 4.6 8 .8 0 1.2-.5 1.8-.5s1 .5 1.8.5c2 0 4.6-4.4 4.6-8 0-2.4-1.2-4.2-3-4.6-1.2-.3-2.4.1-3.4 1z" />
      <path d="M12 7.4V5.2M12 5.2c0-1.2 1-2.2 2.4-2.2" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.6a8.4 8.4 0 0 0 0 16.8c1.3 0 1.9-.9 1.9-1.8 0-1.4-1-1.8-1-2.8 0-.8.7-1.4 1.6-1.4h1.6a4.3 4.3 0 0 0 4.3-4.3c0-3.6-3.5-6.5-8.4-6.5z" />
      <circle cx="8" cy="9.4" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.4" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="16" cy="9.2" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="7.4" cy="14" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  hand: (
    <>
      <path d="M9.4 11.4V5.6a1.6 1.6 0 0 1 3.2 0v5.2" />
      <path d="M12.6 10.8V6.8a1.6 1.6 0 0 1 3.2 0v5.4" />
      <path d="M15.8 11.6V9.2a1.5 1.5 0 0 1 3 0v5.6a6 6 0 0 1-6 6h-1.4a5 5 0 0 1-4-2l-2.5-3.4a1.7 1.7 0 0 1 2.6-2.1l1.9 1.9V8.4a1.6 1.6 0 0 1 3.2 0" />
    </>
  ),
  family: (
    <>
      <circle cx="8" cy="7.4" r="2.6" />
      <circle cx="16.6" cy="8.4" r="2.1" />
      <path d="M3.4 19.4v-1.6A4.6 4.6 0 0 1 8 13.2a4.6 4.6 0 0 1 4.6 4.6v1.6" />
      <path d="M14.8 19.4v-1.4a3.9 3.9 0 0 1 3.8-3.9 3.9 3.9 0 0 1 2 .6" />
    </>
  ),
  bowl: (
    <>
      <path d="M3.6 11.2h16.8a8.4 8.4 0 0 1-8.4 8.2 8.4 8.4 0 0 1-8.4-8.2z" />
      <path d="M9 8.4c0-1.3 1.4-1.6 1.4-2.9M13 8.4c0-1.6 1.6-1.9 1.6-3.4" />
    </>
  ),
  leaf: (
    <>
      <path d="M5.2 18.8C3.6 13 7 5.8 19.4 5.2c.6 8.8-4.6 13.6-11.4 12.8" />
      <path d="M8 20c1-4.4 3.8-8.2 8.2-10.6" />
    </>
  ),
  gem: (
    <>
      <path d="M7.4 4.4h9.2L21 10l-9 9.8L3 10z" />
      <path d="M3 10h18M7.4 4.4 12 19.8 16.6 4.4M9.6 10 12 4.4 14.4 10" />
    </>
  ),
  diya: (
    <>
      <path d="M12 4.6c1.6 1.6 2.4 2.9 2.4 4.1a2.4 2.4 0 0 1-4.8 0c0-1.2.8-2.5 2.4-4.1z" />
      <path d="M4.4 13.6h15.2a5.4 5.4 0 0 1-5.4 4.4h-4.4a5.4 5.4 0 0 1-5.4-4.4z" />
      <path d="M3.2 20.2h17.6" />
    </>
  ),
  namaste: (
    <>
      <path d="M12 20.4 6.6 14a3.4 3.4 0 0 1-.9-2.3V5.4a1.4 1.4 0 0 1 2.8 0v4.2" />
      <path d="m12 20.4 5.4-6.4a3.4 3.4 0 0 0 .9-2.3V5.4a1.4 1.4 0 0 0-2.8 0v4.2" />
      <path d="M12 3.4v8.2" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M9.6 9.6a2.5 2.5 0 0 1 4.9.6c0 1.7-2.5 2-2.5 3.6" />
      <circle cx="12" cy="16.8" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.9" />
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4 5.5 5.5" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.6 13.8a4.2 4.2 0 0 0 6.8 0" />
      <circle cx="9.3" cy="9.8" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="9.8" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  wave: (
    <>
      <path d="M3 12c1.5-3.4 3-3.4 4.5 0s3 3.4 4.5 0 3-3.4 4.5 0 3 3.4 4.5 0" />
      <path d="M3 17c1.5-2.4 3-2.4 4.5 0s3 2.4 4.5 0 3-2.4 4.5 0 3 2.4 4.5 0" opacity="0.5" />
    </>
  ),
  glyph: (
    <>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="3" />
      <path d="M7.6 7.4h8.8" />
      <path d="M12 7.4v9.2" />
      <path d="M9 16.6a3 3 0 0 0 3-3" />
    </>
  ),
  music: (
    <>
      <path d="M9.4 17.6V5.8l9.2-2v11.4" />
      <circle cx="6.6" cy="17.8" r="2.8" />
      <circle cx="15.8" cy="15.4" r="2.8" />
    </>
  ),
};

export type IconName = keyof typeof P;

export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className,
  style,
  title,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  /** Supply only when the icon is the sole carrier of meaning. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {P[name]}
    </svg>
  );
}

/* ---- Category → icon map ----------------------------------------------
   Every word and phrase category resolves to a drawn mark. `festival` and
   `number` are included here because both exist in the data. */
export const CATEGORY_ICON: Record<string, IconName> = {
  animal: 'paw',
  fruit: 'apple',
  color: 'palette',
  body: 'hand',
  family: 'family',
  food: 'bowl',
  nature: 'leaf',
  number: 'numbers',
  surat: 'gem',
  festival: 'diya',
  greeting: 'namaste',
  question: 'question',
  daily: 'sun',
  polite: 'namaste',
  emotion: 'smile',
  swar: 'wave',
  vyanjan: 'glyph',
};

export function categoryIcon(category: string): IconName {
  return CATEGORY_ICON[category] ?? 'words';
}
