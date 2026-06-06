'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { stories, type StoryItem } from '@/data/gujarati';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { PlayTriangleIcon } from './RisoFolk';
import { getStoryImage, getStoryLineAudio, getStoryLineImage, getStoryTitleAudio, getStoryVideo } from '@/data/assets';

interface Props {
  storiesRead: string[];
  onStoryRead: (storyId: string) => void;
}

interface AssetImageProps {
  src?: string;
  alt: string;
  className: string;
  fallback?: ReactNode;
}

function AssetImage({ src, alt, className, fallback }: AssetImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback ?? null}</>;
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

// Lightbox overlay for full-size story images
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// Try static video first; fall back to children (generate button) on error
function StaticVideo({ storyId, fallback }: { storyId: string; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <video
      src={getStoryVideo(storyId)}
      controls
      playsInline
      className="max-h-72 w-full rounded-xl bg-white object-contain"
      style={{ border: '2px solid var(--rf-ink)' }}
      onError={() => setFailed(true)}
    />
  );
}

type StoryVideoState = Record<string, { url: string | null; loading: boolean; error: string | null }>;

export function StoriesSection({ storiesRead, onStoryRead }: Props) {
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [storyVideos, setStoryVideos] = useState<StoryVideoState>({});
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');
  const videoUrlsRef = useRef<string[]>([]);
  const { speak, currentlyPlaying, ttsLoading } = useSpeak();

  useEffect(() => {
    return () => {
      videoUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      videoUrlsRef.current = [];
    };
  }, []);

  const patchStoryVideo = (storyId: string, patch: Partial<StoryVideoState[string]>) => {
    setStoryVideos(prev => ({
      ...prev,
      [storyId]: {
        url: prev[storyId]?.url ?? null,
        loading: prev[storyId]?.loading ?? false,
        error: prev[storyId]?.error ?? null,
        ...patch,
      },
    }));
  };

  const generateStoryVideo = async (story: StoryItem) => {
    if (storyVideos[story.id]?.loading) return;
    patchStoryVideo(story.id, { loading: true, error: null });

    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: getStoryImage(story.id),
          prompt: `A gentle Gujarati folk riso-style children's story animation for "${story.titleEnglish}". Keep the full subject visible with generous padding, subtle friendly motion, light cream or white background, no new text, no watermark.`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Video generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      videoUrlsRef.current.push(url);
      patchStoryVideo(story.id, { url, loading: false });
    } catch {
      patchStoryVideo(story.id, {
        loading: false,
        error: 'Video could not be made for this story art.',
      });
    }
  };

  if (activeStory) {
    const storyIsRead = storiesRead.includes(activeStory.id);
    const titleId = `story-${activeStory.id}-title`;
    const storyVideo = storyVideos[activeStory.id];

    return (
      <div className="px-4 pt-4 pb-6 animate-fade-in">
        <button onClick={() => setActiveStory(null)} className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          ← Back to Stories
        </button>

        <button
          type="button"
          className="w-full"
          onClick={() => {
            const s = getStoryImage(activeStory.id);
            if (s) { setLightboxSrc(s); setLightboxAlt(activeStory.titleEnglish); }
          }}
        >
          <AssetImage
            src={getStoryImage(activeStory.id)}
            alt={activeStory.titleEnglish}
            className="w-full h-40 object-contain rounded-2xl mb-4 shadow-md bg-white cursor-pointer hover:opacity-90 transition-opacity"
            fallback={
              <div className="mb-4 flex h-40 w-full items-center justify-center rounded-2xl bg-white text-5xl shadow-md">
                📖
              </div>
            }
          />
        </button>

        <div className="mb-4">
          <StaticVideo
            storyId={activeStory.id}
            fallback={
              <>
                {!storyVideo?.url && (
                  <button
                    type="button"
                    onClick={() => generateStoryVideo(activeStory)}
                    disabled={storyVideo?.loading}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{
                      background: 'var(--rf-saffron)',
                      border: '2px solid var(--rf-ink)',
                      boxShadow: '2px 2px 0 var(--rf-ink)',
                    }}
                  >
                    <PlayTriangleIcon className="h-3.5 w-3.5" />
                    {storyVideo?.loading ? 'Making theater...' : 'Story Theater'}
                  </button>
                )}
                {storyVideo?.error && (
                  <p className="mt-1 text-[11px] font-semibold" style={{ color: 'var(--rf-saffron)' }}>
                    {storyVideo.error}
                  </p>
                )}
                {storyVideo?.url && (
                  <video
                    src={storyVideo.url}
                    controls
                    playsInline
                    className="max-h-72 w-full rounded-xl bg-white object-contain"
                    style={{ border: '2px solid var(--rf-ink)' }}
                  />
                )}
              </>
            }
          />
        </div>

        <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-berry)' }}>
          <div className="flex items-center gap-3 p-4 text-white">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-gujarati)' }}>{activeStory.titleGujarati}</p>
              <p className="text-white/70 text-sm">{activeStory.titleEnglish}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20">
                  Level {activeStory.level}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20">
                  {activeStory.lines.length} lines
                </span>
                {storyIsRead && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white text-emerald-600">
                    ✓ Read
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => speak(getStoryTitleAudio(activeStory.id) || activeStory.titleGujarati, titleId, activeStory.titleGujarati)}
              className="speak-btn w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20 text-white"
            >
              <SpeakIcon id={titleId} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
            </button>
          </div>
        </div>

        {activeStory.focusWords?.length ? (
          <div className="glass-card p-3 mb-4">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.7px] text-gray-500">Focus words</p>
            <div className="grid grid-cols-2 gap-2">
              {activeStory.focusWords.map(word => (
                <div key={`${activeStory.id}-${word.roman}`} className="rounded-xl bg-white p-2 shadow-sm">
                  <p className="text-base font-black leading-none" style={{ fontFamily: 'var(--font-gujarati)' }}>{word.gujarati}</p>
                  <p className="mt-1 text-[11px] font-semibold text-gray-500">{word.roman}</p>
                  <p className="text-xs font-bold text-gray-700">{word.english}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {activeStory.lines.map((line, i) => {
            const id = `story-${activeStory.id}-line-${i}`;
            const isPlaying = currentlyPlaying === id;
            const lineImg = getStoryLineImage(activeStory.id, i);
            return (
              <div key={i} className={`glass-card p-3 flex items-start gap-3 ${isPlaying ? 'ring-2 ring-amber-300' : ''}`}>
                <AssetImage
                  src={lineImg}
                  alt={line.english}
                  className="w-20 h-20 rounded-xl object-contain flex-shrink-0 border-2 border-white shadow-sm bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                      style={{ background: 'var(--saffron-100)', color: 'var(--saffron-700)' }}>
                      {i + 1}
                    </span>
                    <p className="text-base font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{line.gujarati}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{line.roman}</p>
                  <p className="text-sm text-gray-700 font-medium mt-0.5">{line.english}</p>
                </div>
                <button
                  onClick={() => speak(getStoryLineAudio(activeStory.id, i) || line.gujarati, id, line.gujarati)}
                  className="speak-btn w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isPlaying ? 'var(--saffron-200)' : 'var(--saffron-100)', color: 'var(--saffron-700)' }}
                >
                  <SpeakIcon id={id} currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                </button>
              </div>
            );
          })}
        </div>

        {(activeStory.questionEnglish || activeStory.moralEnglish) && (
          <div className="glass-card-strong mt-4 p-4">
            {activeStory.questionEnglish && (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.7px] text-gray-500">Think & answer</p>
                <p className="mt-1 text-base font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{activeStory.questionGujarati}</p>
                <p className="text-sm font-semibold text-gray-700">{activeStory.questionEnglish}</p>
              </div>
            )}
            {activeStory.moralEnglish && (
              <div className={activeStory.questionEnglish ? 'mt-4 border-t border-gray-100 pt-3' : ''}>
                <p className="text-xs font-black uppercase tracking-[0.7px] text-gray-500">Story lesson</p>
                <p className="mt-1 text-base font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{activeStory.moralGujarati}</p>
                <p className="text-sm font-semibold text-gray-700">{activeStory.moralEnglish}</p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={storyIsRead}
          onClick={() => onStoryRead(activeStory.id)}
          className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-80"
          style={{ background: storyIsRead ? 'var(--emerald-500)' : 'var(--gradient-saffron)' }}
        >
          {storyIsRead ? '✓ Story added to progress' : 'Mark story read'}
        </button>

        {lightboxSrc && <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />}
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-6 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--gradient-berry)' }}>
        <div className="flex items-center gap-3 p-4 text-white">
          <img src="/images/story.webp" alt="" className="w-14 h-14 rounded-xl object-contain border-2 border-white/30" />
          <div>
            <p className="font-bold text-lg">Stories</p>
            <p className="text-white/70 text-xs" style={{ fontFamily: 'var(--font-gujarati)' }}>વાર્તાઓ</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {stories.map((story) => {
          const storyIsRead = storiesRead.includes(story.id);
          return (
            <button
              key={story.id}
              onClick={() => setActiveStory(story)}
              className={`glass-card w-full text-left p-3 hover:shadow-lg transition-all active:scale-[0.98] ${storyIsRead ? 'ring-2 ring-emerald-200' : ''}`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    const s = getStoryImage(story.id);
                    if (s) { setLightboxSrc(s); setLightboxAlt(story.titleEnglish); }
                  }}
                >
                  <AssetImage
                    src={getStoryImage(story.id)}
                    alt={story.titleEnglish}
                    className="w-20 h-20 rounded-xl object-contain flex-shrink-0 border-2 border-white bg-white shadow-sm cursor-pointer"
                    fallback={
                      <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-white text-3xl shadow-sm">
                        📖
                      </span>
                    }
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold" style={{ fontFamily: 'var(--font-gujarati)' }}>{story.titleGujarati}</p>
                    {storyIsRead && <span className="text-xs text-emerald-600">✓</span>}
                  </div>
                  <p className="text-sm text-gray-600">{story.titleEnglish}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--saffron-100)', color: 'var(--saffron-700)' }}>
                      Level {story.level}
                    </span>
                    <span className="text-xs text-gray-400">{story.lines.length} lines</span>
                    {story.focusWords?.slice(0, 2).map(word => (
                      <span key={`${story.id}-${word.roman}`} className="text-xs text-gray-400">
                        {word.english}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </div>
            </button>
          );
        })}
      </div>

      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
