'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Icon, type IconName } from './Icon';
import { usePronunciation } from './usePronunciation';

/* ============================================================================
   Shared Riso-Folk primitives.

   Every screen composes from these. A control that exists here must not be
   re-implemented inline anywhere else — that is how the app ended up with
   three different card decks and three copies of the pronunciation panel.
   ========================================================================= */

/* ---------------------------------------------------------------- Speaker */

/** The audio affordance. Shows load progress instead of a spinner because
 *  Venice TTS returns one blob and a spinner would just sit there. */
export function SpeakGlyph({
  id,
  currentlyPlaying,
  ttsLoading,
  ttsProgress,
  failedId,
  size = 20,
}: {
  id: string;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  ttsProgress?: number;
  /** Id of the last clip that would not play, from useSpeak. */
  failedId?: string | null;
  size?: number;
}) {
  const isThis = currentlyPlaying === id;
  // Audio is the product: a clip that will not play has to say so, or the
  // child cannot tell "broken" from "I tapped the wrong thing".
  if (failedId === id && !isThis) return <Icon name="refresh" size={size} />;
  if (ttsLoading && isThis) {
    if (typeof ttsProgress === 'number') {
      return (
        <span className="tabular-nums font-extrabold" style={{ fontSize: 'var(--t-xs)' }}>
          {ttsProgress}%
        </span>
      );
    }
    return <Icon name="clock" size={size} className="rf-blink" />;
  }
  return <Icon name={isThis ? 'speakerLoud' : 'speaker'} size={size} />;
}

/** The compact speak affordance used on list and grid cards. One spec, one
 *  size floor — this control used to have seven different inline versions and
 *  the smallest was 34px, under the 44px floor PRODUCT.md makes binding. */
export function SpeakButton({
  id,
  label,
  onClick,
  currentlyPlaying,
  ttsLoading,
  ttsProgress,
  failedId,
}: {
  id: string;
  label: string;
  onClick: (event: React.MouseEvent) => void;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  ttsProgress?: number;
  failedId?: string | null;
}) {
  const isThis = currentlyPlaying === id;
  const failed = failedId === id && !isThis;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={failed ? `${label} — that did not play, tap to try again` : label}
      className="rf-icon-btn"
      style={{
        background: isThis ? 'var(--ink-saffron-deep)' : 'var(--paper)',
        color: failed ? 'var(--ink-pink)' : isThis ? 'var(--text-on-ink)' : 'var(--ink-indigo)',
      }}
    >
      <SpeakGlyph
        id={id}
        currentlyPlaying={currentlyPlaying}
        ttsLoading={ttsLoading}
        ttsProgress={ttsProgress}
        failedId={failedId}
        size={19}
      />
    </button>
  );
}

/** Round primary "hear it" button. The single most-tapped control in the app. */
export function PlayButton({
  id,
  label,
  onClick,
  currentlyPlaying,
  ttsLoading,
  ttsProgress,
  failedId,
  size = 56,
  tone = 'saffron',
}: {
  id: string;
  label: string;
  onClick: () => void;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  ttsProgress?: number;
  failedId?: string | null;
  size?: number;
  tone?: 'saffron' | 'indigo' | 'paper';
}) {
  const isThis = currentlyPlaying === id;
  const failed = failedId === id && !isThis;
  const bg =
    tone === 'paper' ? 'var(--paper)' : tone === 'indigo' ? 'var(--ink-indigo)' : 'var(--ink-saffron)';
  const fg = tone === 'paper' ? 'var(--ink-indigo)' : 'var(--text-on-ink)';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={failed ? `${label} — that did not play, tap to try again` : label}
      className="rf-press rf-lift-key inline-flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        flex: 'none',
        background: isThis ? 'var(--ink-saffron-deep)' : failed ? 'var(--paper-sunk)' : bg,
        color: failed ? 'var(--ink-pink)' : fg,
        border: 'var(--key)',
      }}
    >
      <SpeakGlyph
        id={id}
        currentlyPlaying={currentlyPlaying}
        ttsLoading={ttsLoading}
        ttsProgress={ttsProgress}
        failedId={failedId}
        size={Math.round(size * 0.42)}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ Header */

/** The flooded-ink banner that opens every section. */
export function SectionHeader({
  icon,
  title,
  gujarati,
  art,
  action,
  tone = 'indigo',
}: {
  icon?: IconName;
  title: string;
  gujarati?: string;
  art?: string;
  action?: ReactNode;
  tone?: 'indigo' | 'saffron';
}) {
  const onSaffron = tone === 'saffron';
  const bg = onSaffron ? 'var(--ink-saffron)' : 'var(--ink-indigo)';
  const lift = onSaffron ? 'var(--lift-indigo)' : 'var(--lift-saffron)';
  // White is only 3.35:1 on saffron, so small text there goes dark instead.
  const fg = onSaffron ? 'var(--text-on-saffron)' : 'var(--text-on-ink)';
  const fg2 = onSaffron ? 'var(--text-on-saffron-2)' : 'var(--text-on-ink-2)';

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: bg,
        border: 'var(--key)',
        borderRadius: 'var(--r-lg)',
        boxShadow: lift,
      }}
    >
      <span className="rf-halftone" aria-hidden="true" />
      <div
        className="relative flex items-center"
        style={{ gap: 'var(--s-3)', padding: 'var(--s-4)', color: fg }}
      >
        {art ? (
          <img
            src={art}
            alt=""
            className="rf-art"
            style={{
              width: 56,
              height: 56,
              flex: 'none',
              borderRadius: 'var(--r-md)',
              border: '2px solid rgba(255,253,247,0.55)',
            }}
          />
        ) : icon ? (
          <span
            className="inline-flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              flex: 'none',
              borderRadius: 'var(--r-md)',
              background: onSaffron ? 'var(--paper)' : 'rgba(255,253,247,0.16)',
              border: `2px solid ${onSaffron ? 'var(--ink-key)' : 'rgba(255,253,247,0.5)'}`,
              color: onSaffron ? 'var(--ink-saffron-deep)' : 'inherit',
            }}
          >
            <Icon name={icon} size={26} strokeWidth={2.1} />
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="font-bold" style={{ fontSize: 'var(--t-lg)', lineHeight: 1.2 }}>
            {title}
          </p>
          {gujarati && (
            <p
              className="rf-gujarati truncate"
              style={{ fontSize: 'var(--t-sm)', color: fg2 }}
            >
              {gujarati}
            </p>
          )}
        </div>

        {action}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Chips */

export function Chip({
  active,
  onClick,
  icon,
  children,
  ink,
}: {
  active: boolean;
  onClick: () => void;
  icon?: IconName;
  children: ReactNode;
  ink?: string;
}) {
  return (
    <button
      type="button"
      className="rf-chip"
      aria-pressed={active}
      onClick={onClick}
      style={ink ? ({ '--chip-ink': ink } as CSSProperties) : undefined}
    >
      {icon && <Icon name={icon} size={17} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

/* -------------------------------------------------------- Segmented tabs */

export function SegTabs<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (next: T) => void;
  options: Array<{ value: T; label: string; icon?: IconName }>;
  label: string;
}) {
  return (
    <div className="rf-seg" role="tablist" aria-label={label}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.icon && <Icon name={option.icon} size={17} strokeWidth={2.2} />}
          <span className="truncate">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Meter */

export function Meter({
  value,
  max,
  ink = 'var(--ink-saffron)',
  label,
}: {
  value: number;
  max: number;
  ink?: string;
  label: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className="rf-meter"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ '--meter-ink': ink } as CSSProperties}
    >
      <span style={{ transform: `scaleX(${pct / 100})` }} />
    </div>
  );
}

/* -------------------------------------------------------------- Ring gauge */

export function ProgressRing({
  value,
  total,
  label,
  size = 46,
}: {
  value: number;
  total: number;
  label: string;
  size?: number;
}) {
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;
  const ratio = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-sunk)" strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--ink-saffron)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - ratio)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset var(--dur-3) var(--ease-out)' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: 'var(--font-ui)', fontSize: size * 0.3, fontWeight: 800, fill: 'var(--text-1)' }}
      >
        {value}
      </text>
    </svg>
  );
}

/* --------------------------------------------------------- Learned stamp */

/** Marks an item already learned. Reads as a stamp on paper, not a checkbox. */
export function LearnedStamp({ label }: { label?: string }) {
  return (
    <span
      className="rf-stamp inline-flex items-center justify-center rounded-full"
      aria-hidden={label ? undefined : true}
      style={{
        width: 26,
        height: 26,
        background: 'var(--state-learned)',
        color: 'var(--text-on-ink)',
        border: '2px solid var(--ink-key)',
      }}
    >
      <Icon name="check" size={14} strokeWidth={3} title={label} />
    </span>
  );
}

/* ------------------------------------------------------------ Empty state */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="rf-surface--sunk flex flex-col items-center text-center"
      style={{ padding: 'var(--s-8) var(--s-5)', gap: 'var(--s-3)' }}
    >
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--r-md)',
          background: 'var(--paper)',
          border: 'var(--key-thin)',
          color: 'var(--ink-indigo)',
        }}
      >
        <Icon name={icon} size={28} />
      </span>
      <p className="font-bold" style={{ fontSize: 'var(--t-lg)' }}>
        {title}
      </p>
      <p className="rf-prose" style={{ fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}>
        {body}
      </p>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------------- Overlay */

/** Modal surface: escape closes, focus is trapped and restored, background
 *  scroll is locked. Used for the card decks and quizzes. */
export function Overlay({
  onClose,
  labelledBy,
  children,
  onSwipeLeft,
  onSwipeRight,
}: {
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [onClose]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };
  const handleTouchEnd = (event: React.TouchEvent) => {
    const dx = event.changedTouches[0].clientX - touchStart.current.x;
    const dy = Math.abs(event.changedTouches[0].clientY - touchStart.current.y);
    if (Math.abs(dx) < 50 || dy > Math.abs(dx) * 0.8) return;
    if (dx < 0) onSwipeLeft?.();
    else onSwipeRight?.();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(28, 20, 10, 0.62)', zIndex: 120, padding: 'var(--s-4)' }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="rf-rise w-full outline-none"
        style={{ maxWidth: 420 }}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Deck shell */

/** One swipeable, keyboard-navigable card deck. Words, phrases, and story
 *  sections all run through this — they used to be three separate copies. */
export function Deck({
  count,
  index,
  onIndex,
  onClose,
  title,
  children,
}: {
  count: number;
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const headingId = useId();
  const goNext = useCallback(() => onIndex(Math.min(index + 1, count - 1)), [index, count, onIndex]);
  const goPrev = useCallback(() => onIndex(Math.max(index - 1, 0)), [index, onIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  return (
    <Overlay onClose={onClose} labelledBy={headingId} onSwipeLeft={goNext} onSwipeRight={goPrev}>
      <p id={headingId} className="rf-sr">
        {title}
      </p>

      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rf-icon-btn absolute"
          style={{ top: -14, right: -8, zIndex: 2, width: 40, height: 40 }}
        >
          <Icon name="close" size={20} strokeWidth={2.4} />
        </button>

        {index > 0 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className="rf-icon-btn absolute"
            style={{ left: -14, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
          >
            <Icon name="chevronLeft" size={20} strokeWidth={2.4} />
          </button>
        )}
        {index < count - 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="rf-icon-btn absolute"
            style={{ right: -14, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
          >
            <Icon name="chevronRight" size={20} strokeWidth={2.4} />
          </button>
        )}

        {children}
      </div>

      <div
        className="flex items-center justify-center"
        style={{ gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}
      >
        <span
          className="font-bold tabular-nums"
          style={{ color: 'var(--text-on-ink)', fontSize: 'var(--t-xs)' }}
        >
          {index + 1} / {count}
        </span>
        <span style={{ color: 'var(--text-on-ink-2)', fontSize: 'var(--t-xs)' }}>
          · swipe for the next one
        </span>
      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------- Say-it-back panel */

/** The one pronunciation practice implementation. Never punishes: the lowest
 *  outcome is "have another go", never a wrong-answer mark. */
export function SayItBack({ target, hint }: { target: string; hint: string }) {
  const { isRecording, isProcessing, score, startPronunciationCheck, stopPronunciationCheck, setScore } =
    usePronunciation();

  useEffect(() => {
    setScore(null);
  }, [target, setScore]);

  const status = isRecording
    ? 'Listening — let go when you finish'
    : isProcessing
      ? 'Checking your voice…'
      : score === null
        ? hint
        : score >= 3
          ? 'Spot on!'
          : score > 0
            ? 'Close — try once more'
            : 'Did not catch that — have another go';

  return (
    <div
      style={{
        width: '100%',
        borderTop: '2px dashed var(--paper-edge)',
        paddingTop: 'var(--s-4)',
        marginTop: 'var(--s-2)',
      }}
    >
      <p className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
        Say it back
      </p>
      <div className="flex items-center" style={{ gap: 'var(--s-3)' }}>
        <button
          type="button"
          onPointerDown={() => startPronunciationCheck(target)}
          onPointerUp={stopPronunciationCheck}
          onPointerLeave={stopPronunciationCheck}
          onPointerCancel={stopPronunciationCheck}
          disabled={isProcessing}
          aria-label={`Hold to say ${target}`}
          className={`rf-icon-btn ${isRecording ? 'rf-listening' : ''}`}
          style={{
            background: isRecording ? 'var(--ink-pink)' : 'var(--paper)',
            color: isRecording ? 'var(--text-on-ink)' : 'var(--ink-indigo)',
            touchAction: 'none',
          }}
        >
          <Icon name="mic" size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p
            aria-live="polite"
            style={{
              fontSize: 'var(--t-sm)',
              fontWeight: 600,
              color: isRecording ? 'var(--ink-pink)' : 'var(--text-2)',
            }}
          >
            {status}
          </p>
          {score !== null && !isRecording && !isProcessing && (
            <div className="flex items-center rf-pop" style={{ gap: 2, marginTop: 2 }}>
              {[1, 2, 3].map(step => (
                <Icon
                  key={step}
                  name={score >= step ? 'star' : 'starOutline'}
                  size={18}
                  style={{ color: score >= step ? 'var(--ink-saffron)' : 'var(--text-3)' }}
                />
              ))}
              <span className="rf-sr">{score} of 3 stars</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Confetti */

const CONFETTI_INKS = ['var(--ink-saffron)', 'var(--ink-indigo)', 'var(--ink-pink)', 'var(--ink-leaf)'];

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** The media query is an external store, so read it as one — an effect that
 *  writes state here would cascade a render on every mount. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    onChange => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

export function Confetti({ pieces = 40 }: { pieces?: number }) {
  if (usePrefersReducedMotion()) return null;

  return (
    <div className="rf-confetti" aria-hidden="true">
      {Array.from({ length: pieces }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 97) % 100}%`,
            background: CONFETTI_INKS[i % CONFETTI_INKS.length],
            animationDelay: `${(i % 10) * 90}ms`,
            transform: `rotate(${(i * 37) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- Art frame */

/** Illustration that degrades to a drawn mark rather than a broken image. */
export function Art({
  src,
  alt,
  icon = 'image',
  className,
  style,
  onClick,
}: {
  src?: string;
  alt: string;
  icon?: IconName;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  // Remember which src failed rather than clearing a flag from an effect;
  // a new src is then trusted again with no extra render.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src) && failedSrc === src;

  if (!src || failed) {
    return (
      <span
        className={`rf-art-frame inline-flex items-center justify-center ${className ?? ''}`}
        style={{ color: 'var(--text-3)', ...style }}
        aria-hidden="true"
      >
        <Icon name={icon} size={28} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailedSrc(src)}
      onClick={onClick}
      className={`rf-art ${className ?? ''}`}
      style={style}
      draggable={false}
      loading="lazy"
    />
  );
}
