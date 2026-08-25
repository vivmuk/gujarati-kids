'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { balgeet, stories, type Balgeet, type StoryItem } from '@/data/gujarati';
import {
  getBalgeetImage,
  getBalgeetTitleAudio,
  getStoryImage,
  getStoryLineAudio,
  getStoryLineImage,
  getStoryTitleAudio,
  getStoryVideo,
  hasStoryVideo,
} from '@/data/assets';
import { useSpeak } from './useSpeak';
import { Icon } from './Icon';
import { Art, Chip, Deck, EmptyState, LearnedStamp, Meter, PlayButton, SectionHeader, SegTabs } from './ui';
import { StoryQuiz } from './StoryQuiz';
import { SingAlong } from './SingAlong';

interface Props {
  storiesRead: string[];
  onStoryRead: (storyId: string) => void;
  onQuizComplete: (score: number, total: number) => void;
}

type SpeakFn = (text: string, id: string, fallbackText?: string) => void;

const LEVEL_LABEL: Record<number, string> = { 1: 'Starter', 2: 'Next step', 3: 'Stretch' };

/* ------------------------------------------------------------- Lightbox */

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="rf-rise fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(28, 20, 10, 0.88)', zIndex: 200, padding: 'var(--s-4)' }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close picture"
        className="rf-icon-btn absolute"
        style={{ top: 'var(--s-4)', right: 'var(--s-4)' }}
      >
        <Icon name="close" size={20} strokeWidth={2.4} />
      </button>
      <img
        src={src}
        alt={alt}
        className="rf-art"
        style={{
          maxHeight: '86vh',
          maxWidth: '92vw',
          borderRadius: 'var(--r-lg)',
          border: 'var(--key)',
        }}
        onClick={event => event.stopPropagation()}
      />
    </div>
  );
}

/* ---------------------------------------------------------- Story video */

/** Pre-generated video first; only offer to make one if there is no file. */
function StoryFilm({ story }: { story: StoryItem }) {
  const [staticFailed, setStaticFailed] = useState(!hasStoryVideo(story.id));
  const [state, setState] = useState<{ url: string | null; loading: boolean; error: string | null }>({
    url: null,
    loading: false,
    error: null,
  });
  const madeUrls = useRef<string[]>([]);

  useEffect(
    () => () => {
      madeUrls.current.forEach(url => URL.revokeObjectURL(url));
      madeUrls.current = [];
    },
    []
  );

  const generate = async () => {
    if (state.loading) return;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: getStoryImage(story.id),
          prompt: `A gentle Gujarati folk riso-style children's story animation for "${story.titleEnglish}". Keep the full subject visible with generous padding, subtle friendly motion, light cream or white background, no new text, no watermark.`,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      madeUrls.current.push(url);
      setState({ url, loading: false, error: null });
    } catch {
      setState({
        url: null,
        loading: false,
        error: 'That film could not be made right now. The story still reads fine without it.',
      });
    }
  };

  if (!staticFailed) {
    return (
      <video
        src={getStoryVideo(story.id)}
        controls
        playsInline
        preload="metadata"
        className="rf-art-frame w-full"
        style={{ maxHeight: 320, borderWidth: 'var(--key-w)' }}
        onError={() => setStaticFailed(true)}
      />
    );
  }

  if (state.url) {
    return (
      <video
        src={state.url}
        controls
        autoPlay
        playsInline
        className="rf-art-frame w-full"
        style={{ maxHeight: 320, borderWidth: 'var(--key-w)' }}
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={generate}
        disabled={state.loading}
        data-busy={state.loading ? 'true' : undefined}
        className="rf-btn rf-btn--secondary"
      >
        <Icon name="video" size={17} />
        {state.loading ? 'Making the film…' : 'Make a story film'}
      </button>
      {state.error && (
        <p role="status" style={{ marginTop: 'var(--s-2)', fontSize: 'var(--t-xs)', color: 'var(--ink-pink)' }}>
          {state.error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------ Story line card */

function StoryLineCard({
  story,
  index,
  speak,
  currentlyPlaying,
  ttsLoading,
  ttsProgress,
  failedId,
}: {
  story: StoryItem;
  index: number;
  speak: SpeakFn;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  ttsProgress: number;
  failedId: string | null;
}) {
  const line = story.lines[index];
  const id = `story-${story.id}-line-${index}`;

  useEffect(() => {
    speak(getStoryLineAudio(story.id, index) || line.gujarati, id, line.gujarati);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id, index]);

  return (
    <div
      className="rf-surface flex flex-col items-center"
      style={{
        gap: 'var(--s-3)',
        padding: 'var(--s-5)',
        boxShadow: 'var(--lift-3) var(--ink-indigo), var(--shadow-float)',
      }}
    >
      <span className="rf-label">
        Part {index + 1} of {story.lines.length}
      </span>

      <Art
        src={getStoryLineImage(story.id, index)}
        alt={line.english}
        icon="stories"
        className="rf-art-frame w-full"
        style={{ height: 190 }}
      />

      <p
        className="rf-gujarati text-center"
        style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, lineHeight: 1.35, color: 'var(--ink-indigo)' }}
      >
        {line.gujarati}
      </p>
      <p style={{ fontSize: 'var(--t-md)', color: 'var(--text-2)', fontWeight: 600, marginTop: 'calc(var(--s-2) * -1)' }}>
        {line.roman}
      </p>
      <p className="text-center" style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>
        {line.english}
      </p>

      <PlayButton
        id={id}
        label={`Hear part ${index + 1}`}
        onClick={() => speak(getStoryLineAudio(story.id, index) || line.gujarati, id, line.gujarati)}
        currentlyPlaying={currentlyPlaying}
        ttsLoading={ttsLoading}
        ttsProgress={ttsProgress}
        failedId={failedId}
        size={58}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- Reader */

function StoryReader({
  story,
  isRead,
  onBack,
  onStoryRead,
  onQuizComplete,
  speak,
  currentlyPlaying,
  ttsLoading,
  ttsProgress,
  failedId,
}: {
  story: StoryItem;
  isRead: boolean;
  onBack: () => void;
  onStoryRead: (id: string) => void;
  onQuizComplete: (score: number, total: number) => void;
  speak: SpeakFn;
  currentlyPlaying: string | null;
  ttsLoading: boolean;
  ttsProgress: number;
  failedId: string | null;
}) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [partIndex, setPartIndex] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const titleId = `story-${story.id}-title`;
  const heroSrc = getStoryImage(story.id);

  return (
    <div className="rf-grid" style={{ gap: 'var(--s-4)' }}>
      <button type="button" onClick={onBack} className="rf-btn rf-btn--quiet" style={{ alignSelf: 'flex-start' }}>
        <Icon name="arrowLeft" size={18} />
        All stories
      </button>

      <div
        className="rf-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'start' }}
      >
        <button
          type="button"
          onClick={() => heroSrc && setLightbox({ src: heroSrc, alt: story.titleEnglish })}
          aria-label={`See the picture for ${story.titleEnglish} full size`}
          className="rf-press rf-art-frame w-full"
          style={{ padding: 0, borderWidth: 'var(--key-w)', cursor: heroSrc ? 'zoom-in' : 'default' }}
        >
          <Art src={heroSrc} alt={story.titleEnglish} icon="stories" className="w-full" style={{ height: 220 }} />
        </button>

        <div className="rf-grid" style={{ gap: 'var(--s-3)' }}>
          <div
            className="relative overflow-hidden"
            style={{
              background: 'var(--ink-indigo)',
              color: 'var(--text-on-ink)',
              border: 'var(--key)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--lift-saffron)',
              padding: 'var(--s-4)',
            }}
          >
            <span className="rf-halftone" aria-hidden="true" />
            <div className="relative flex items-start" style={{ gap: 'var(--s-3)' }}>
              <div className="min-w-0 flex-1">
                <h1 className="rf-gujarati" style={{ fontSize: 'var(--t-xl)', fontWeight: 700, lineHeight: 1.3 }}>
                  {story.titleGujarati}
                </h1>
                <p style={{ fontSize: 'var(--t-sm)', color: 'var(--text-on-ink-2)' }}>{story.titleEnglish}</p>
                <div className="flex flex-wrap" style={{ gap: 'var(--s-2)', marginTop: 'var(--s-2)' }}>
                  <span
                    className="rf-label"
                    style={{
                      color: 'var(--text-on-ink)',
                      background: 'rgba(255,253,247,0.2)',
                      padding: '3px 8px',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
                    {LEVEL_LABEL[story.level] ?? `Level ${story.level}`}
                  </span>
                  <span
                    className="rf-label"
                    style={{
                      color: 'var(--text-on-ink)',
                      background: 'rgba(255,253,247,0.2)',
                      padding: '3px 8px',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
                    {story.lines.length} parts
                  </span>
                </div>
              </div>
              <PlayButton
                id={titleId}
                label={`Hear the title, ${story.titleGujarati}`}
                onClick={() => speak(getStoryTitleAudio(story.id) || story.titleGujarati, titleId, story.titleGujarati)}
                currentlyPlaying={currentlyPlaying}
                ttsLoading={ttsLoading}
                ttsProgress={ttsProgress}
                failedId={failedId}
                size={46}
                tone="paper"
              />
            </div>
          </div>

          {/* Keyed so a different story starts from a clean video state. */}
          <StoryFilm key={story.id} story={story} />

          {story.focusWords?.length ? (
            <section className="rf-surface" style={{ padding: 'var(--s-3)' }}>
              <h2 className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
                Words to listen for
              </h2>
              <div className="rf-grid rf-grid--tiles" style={{ gap: 'var(--s-2)' }}>
                {story.focusWords.map(word => (
                  <div
                    key={word.roman}
                    className="rf-surface--sunk"
                    style={{ padding: 'var(--s-2) var(--s-3)' }}
                  >
                    <p className="rf-gujarati" style={{ fontSize: 'var(--t-md)', fontWeight: 800, lineHeight: 1.3 }}>
                      {word.gujarati}
                    </p>
                    <p style={{ fontSize: 'var(--t-2xs)', fontWeight: 600, color: 'var(--text-2)' }}>{word.roman}</p>
                    <p style={{ fontSize: 'var(--t-xs)', fontWeight: 700 }}>{word.english}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {/* The story itself */}
      <section>
        <h2 className="rf-label" style={{ marginBottom: 'var(--s-2)' }}>
          The story · tap a part to open it
        </h2>
        <div
          className="rf-scroll-x"
          style={{ gap: 'var(--s-3)', margin: '0 calc(var(--s-4) * -1)', padding: '0 var(--s-4) var(--s-2)' }}
        >
          {story.lines.map((line, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPartIndex(index)}
              className="rf-press rf-surface rf-lift-key text-left"
              style={{ width: 178, flex: 'none', padding: 'var(--s-2)' }}
            >
              <Art
                src={getStoryLineImage(story.id, index)}
                alt=""
                icon="stories"
                className="rf-art-frame w-full"
                style={{ height: 104, marginBottom: 'var(--s-2)' }}
              />
              <div className="flex items-center" style={{ gap: 'var(--s-2)', marginBottom: 2 }}>
                <span
                  className="inline-flex items-center justify-center tabular-nums"
                  style={{
                    width: 22,
                    height: 22,
                    flex: 'none',
                    borderRadius: '50%',
                    background: 'var(--ink-saffron-deep)',
                    color: 'var(--text-on-ink)',
                    fontSize: 'var(--t-2xs)',
                    fontWeight: 800,
                  }}
                >
                  {index + 1}
                </span>
                <p className="rf-gujarati truncate" style={{ fontSize: 'var(--t-sm)', fontWeight: 700 }}>
                  {line.gujarati}
                </p>
              </div>
              <p className="truncate" style={{ fontSize: 'var(--t-xs)', color: 'var(--text-2)' }}>
                {line.english}
              </p>
            </button>
          ))}
        </div>
      </section>

      {(story.questionEnglish || story.moralEnglish) && (
        <section
          className="rf-surface rf-lift-saffron rf-prose"
          style={{ padding: 'var(--s-4)', display: 'grid', gap: 'var(--s-4)' }}
        >
          {story.questionEnglish && (
            <div>
              <h2 className="rf-label">Think about it</h2>
              <p className="rf-gujarati" style={{ marginTop: 4, fontSize: 'var(--t-lg)', fontWeight: 700 }}>
                {story.questionGujarati}
              </p>
              <p style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--text-2)' }}>
                {story.questionEnglish}
              </p>
            </div>
          )}
          {story.moralEnglish && (
            <div style={story.questionEnglish ? { borderTop: '2px dashed var(--paper-edge)', paddingTop: 'var(--s-3)' } : undefined}>
              <h2 className="rf-label">What the story teaches</h2>
              <p className="rf-gujarati" style={{ marginTop: 4, fontSize: 'var(--t-lg)', fontWeight: 700 }}>
                {story.moralGujarati}
              </p>
              <p style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--text-2)' }}>{story.moralEnglish}</p>
            </div>
          )}
        </section>
      )}

      <div className="flex flex-wrap" style={{ gap: 'var(--s-2)' }}>
        {isRead ? (
          /* A finished state, not a disabled button — a confirmation at 45%
             opacity was the least readable text on the screen. */
          <p
            className="rf-btn rf-btn--paper rf-btn--lg"
            style={{
              flex: '1 1 200px',
              cursor: 'default',
              color: 'var(--state-learned)',
              borderColor: 'var(--state-learned)',
              boxShadow: 'var(--lift-1) var(--state-learned)',
            }}
          >
            <Icon name="check" size={18} strokeWidth={2.6} />
            Added to your progress
          </p>
        ) : (
          <button
            type="button"
            onClick={() => onStoryRead(story.id)}
            className="rf-btn rf-btn--primary rf-btn--lg"
            style={{ flex: '1 1 200px' }}
          >
            <Icon name="check" size={18} strokeWidth={2.6} />
            I finished this story
          </button>
        )}
        {(story.focusWords?.length ?? 0) >= 2 && (
          <button
            type="button"
            onClick={() => setShowQuiz(true)}
            className="rf-btn rf-btn--secondary rf-btn--lg"
            style={{ flex: '1 1 200px' }}
          >
            <Icon name="quiz" size={18} />
            Quiz me on it
          </button>
        )}
      </div>

      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}

      {partIndex !== null && (
        <Deck
          count={story.lines.length}
          index={partIndex}
          onIndex={setPartIndex}
          onClose={() => setPartIndex(null)}
          title={story.titleEnglish}
        >
          <StoryLineCard
            key={partIndex}
            story={story}
            index={partIndex}
            speak={speak}
            currentlyPlaying={currentlyPlaying}
            ttsLoading={ttsLoading}
            ttsProgress={ttsProgress}
            failedId={failedId}
          />
        </Deck>
      )}

      {showQuiz && (
        <StoryQuiz story={story} onClose={() => setShowQuiz(false)} onComplete={onQuizComplete} />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Section */

export function StoriesSection({ storiesRead, onStoryRead, onQuizComplete }: Props) {
  const [tab, setTab] = useState<'stories' | 'balgeet'>('stories');
  const [level, setLevel] = useState<number | 'all'>('all');
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [song, setSong] = useState<Balgeet | null>(null);
  const { speak, currentlyPlaying, ttsLoading, ttsProgress, failedId } = useSpeak();

  const back = useCallback(() => setActiveStory(null), []);

  if (activeStory) {
    return (
      <StoryReader
        story={activeStory}
        isRead={storiesRead.includes(activeStory.id)}
        onBack={back}
        onStoryRead={onStoryRead}
        onQuizComplete={onQuizComplete}
        speak={speak}
        currentlyPlaying={currentlyPlaying}
        ttsLoading={ttsLoading}
        ttsProgress={ttsProgress}
        failedId={failedId}
      />
    );
  }

  const visible = level === 'all' ? stories : stories.filter(story => story.level === level);
  const readCount = stories.filter(story => storiesRead.includes(story.id)).length;

  return (
    <div className="rf-grid" style={{ gap: 'var(--s-4)' }}>
      <SectionHeader
        icon="stories"
        title="Stories and songs"
        gujarati="વાર્તાઓ અને બાલગીત"
        action={
          <span className="text-right" style={{ color: 'var(--text-on-ink)' }}>
            <span className="block tabular-nums" style={{ fontSize: 'var(--t-xl)', fontWeight: 700, lineHeight: 1 }}>
              {readCount}
              <span style={{ fontSize: 'var(--t-sm)', color: 'var(--text-on-ink-2)' }}>/{stories.length}</span>
            </span>
            <span className="rf-label" style={{ color: 'var(--text-on-ink-2)' }}>
              read
            </span>
          </span>
        }
      />

      <SegTabs
        label="Stories or songs"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'stories', label: `Stories · ${stories.length}`, icon: 'stories' },
          { value: 'balgeet', label: `Songs · ${balgeet.length}`, icon: 'music' },
        ]}
      />

      {tab === 'stories' ? (
        <>
          <Meter value={readCount} max={stories.length} label={`${readCount} of ${stories.length} stories read`} />

          <div
            className="rf-scroll-x"
            style={{ gap: 'var(--s-2)', margin: '0 calc(var(--s-4) * -1)', padding: '0 var(--s-4) var(--s-1)' }}
            role="group"
            aria-label="Story difficulty"
          >
            <Chip active={level === 'all'} onClick={() => setLevel('all')} icon="stories">
              All levels
            </Chip>
            {[1, 2, 3].map(value => (
              <Chip key={value} active={level === value} onClick={() => setLevel(value)}>
                {LEVEL_LABEL[value]}
              </Chip>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="stories"
              title="No stories at this level"
              body="Try another level, or tap All levels to see every story."
              action={
                <button type="button" className="rf-btn rf-btn--primary" onClick={() => setLevel('all')}>
                  Show all stories
                </button>
              }
            />
          ) : (
            <div className="rf-grid rf-grid--list">
              {visible.map(story => {
                const isRead = storiesRead.includes(story.id);
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => setActiveStory(story)}
                    className={`rf-press rf-surface relative flex w-full items-center text-left ${
                      isRead ? 'rf-lift-leaf' : 'rf-lift-indigo'
                    }`}
                    style={{ gap: 'var(--s-3)', padding: 'var(--s-3)' }}
                  >
                    <Art
                      src={getStoryImage(story.id)}
                      alt=""
                      icon="stories"
                      className="rf-art-frame"
                      style={{ width: 78, height: 78, flex: 'none' }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center" style={{ gap: 'var(--s-2)' }}>
                        <span className="rf-label" style={{ color: 'var(--ink-saffron-deep)' }}>
                          {LEVEL_LABEL[story.level] ?? `Level ${story.level}`} · {story.lines.length} parts
                        </span>
                        {isRead && <LearnedStamp />}
                      </span>
                      <span
                        className="rf-gujarati block truncate"
                        style={{ fontSize: 'var(--t-lg)', fontWeight: 700, lineHeight: 1.35 }}
                      >
                        {story.titleGujarati}
                      </span>
                      <span
                        className="block truncate"
                        style={{ fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}
                      >
                        {story.titleEnglish}
                      </span>
                    </span>
                    <Icon
                      name="chevronRight"
                      size={20}
                      style={{ flex: 'none', color: 'var(--text-3)' }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="rf-grid rf-grid--list">
          {balgeet.map(item => {
            const titleId = `balgeet-${item.id}-title`;
            return (
              <article key={item.id} className="rf-surface rf-lift-saffron" style={{ padding: 'var(--s-4)' }}>
                <div className="flex items-start" style={{ gap: 'var(--s-3)' }}>
                  <Art
                    src={getBalgeetImage(item.id)}
                    alt=""
                    icon="music"
                    className="rf-art-frame"
                    style={{ width: 72, height: 72, flex: 'none' }}
                  />
                  <div className="min-w-0 flex-1">
                    <h2
                      className="rf-gujarati"
                      style={{ fontSize: 'var(--t-lg)', fontWeight: 700, lineHeight: 1.3 }}
                    >
                      {item.titleGujarati}
                    </h2>
                    <p style={{ fontSize: 'var(--t-sm)', color: 'var(--text-2)' }}>{item.titleEnglish}</p>
                    <p className="rf-label" style={{ marginTop: 2 }}>
                      {item.lines.length} lines
                    </p>
                  </div>
                  <PlayButton
                    id={titleId}
                    label={`Hear the title, ${item.titleGujarati}`}
                    onClick={() =>
                      speak(getBalgeetTitleAudio(item.id) || item.titleGujarati, titleId, item.titleGujarati)
                    }
                    currentlyPlaying={currentlyPlaying}
                    ttsLoading={ttsLoading}
                    ttsProgress={ttsProgress}
                failedId={failedId}
                    size={44}
                    tone="paper"
                  />
                </div>

                <ol
                  className="rf-stack"
                  style={{
                    margin: 'var(--s-3) 0 0',
                    padding: '0 0 0 var(--s-3)',
                    listStyle: 'none',
                    borderLeft: '2px solid var(--paper-sunk)',
                  }}
                >
                  {item.lines.map((line, lineIndex) => (
                    <li key={lineIndex}>
                      <p className="rf-gujarati" style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>
                        {line.gujarati}
                      </p>
                      <p style={{ fontSize: 'var(--t-xs)', color: 'var(--text-2)' }}>{line.roman}</p>
                      <p style={{ fontSize: 'var(--t-xs)', fontWeight: 600 }}>{line.english}</p>
                    </li>
                  ))}
                </ol>

                <button
                  type="button"
                  onClick={() => setSong(item)}
                  className="rf-btn rf-btn--primary rf-btn--block"
                  style={{ marginTop: 'var(--s-4)' }}
                >
                  <Icon name="music" size={17} />
                  Sing it line by line
                </button>
              </article>
            );
          })}
        </div>
      )}

      {song && <SingAlong song={song} onClose={() => setSong(null)} />}
    </div>
  );
}
