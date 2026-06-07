'use client';
import { useState, useEffect, useCallback } from 'react';
import { HalftoneOverlay } from './RisoFolk';
import { useSpeak } from './useSpeak';
import { SpeakIcon } from './SpeakIcon';
import { usePronunciation } from './usePronunciation';

interface PuzzleBlock {
  text: string;
  type: string;
  roman: string;
}

interface MissionData {
  theme: string;
  scenarioEnglish: string;
  scenarioGujarati: string;
  actionPrompt: string;
  targetSentence: string;
  targetEnglish: string;
  puzzleBlocks: PuzzleBlock[];
}

const TYPE_COLORS: Record<string, string> = {
  subject: 'bg-blue-100 border-blue-400 text-blue-800',
  object: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  verb: 'bg-green-100 border-green-400 text-green-800',
  postposition: 'bg-purple-100 border-purple-400 text-purple-800',
  adjective: 'bg-pink-100 border-pink-400 text-pink-800'
};

export function MissionsSection() {
  const [mission, setMission] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Available blocks (not yet placed)
  const [availableBlocks, setAvailableBlocks] = useState<PuzzleBlock[]>([]);
  // Placed blocks in the sentence strip
  const [placedBlocks, setPlacedBlocks] = useState<PuzzleBlock[]>([]);
  
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);

  const { speak, currentlyPlaying, ttsLoading } = useSpeak();
  const { isRecording, isProcessing, score, startPronunciationCheck, stopPronunciationCheck } = usePronunciation();

  const loadMission = async (difficulty: 'easy' | 'hard' = 'easy') => {
    setLoading(true);
    setError(null);
    setMissionComplete(false);
    setIsPuzzleSolved(false);
    setPlacedBlocks([]);
    try {
      const res = await fetch('/api/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
      });
      if (!res.ok) throw new Error('Failed to load mission');
      const data: MissionData = await res.json();
      setMission(data);
      setAvailableBlocks(data.puzzleBlocks);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMission('easy');
  }, []);

  const handlePlaceBlock = (block: PuzzleBlock, index: number) => {
    setAvailableBlocks(prev => prev.filter((_, i) => i !== index));
    setPlacedBlocks(prev => [...prev, block]);
  };

  const handleRemoveBlock = (block: PuzzleBlock, index: number) => {
    setPlacedBlocks(prev => prev.filter((_, i) => i !== index));
    setAvailableBlocks(prev => [...prev, block]);
  };

  // Check if puzzle is solved whenever placedBlocks changes
  useEffect(() => {
    if (mission && placedBlocks.length === mission.puzzleBlocks.length) {
      const currentSentence = placedBlocks.map(b => b.text).join(' ').trim();
      const target = mission.targetSentence.trim();
      // Simple string match. Could be more robust to ignore extra spaces.
      if (currentSentence === target || currentSentence.replace(/\s+/g, '') === target.replace(/\s+/g, '')) {
        setIsPuzzleSolved(true);
      } else {
        setIsPuzzleSolved(false);
      }
    } else {
      setIsPuzzleSolved(false);
    }
  }, [placedBlocks, mission]);

  // Check if spoken result matches target
  useEffect(() => {
    if (score !== null && isPuzzleSolved && !missionComplete) {
      if (score >= 3) {
        setMissionComplete(true);
      }
    }
  }, [score, isPuzzleSolved, missionComplete]);

  if (loading && !mission) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-pulse">
        <span className="text-6xl mb-4">🚀</span>
        <h2 className="text-xl font-bold text-[var(--rf-indigo)]">Generating Mission...</h2>
        <p className="text-gray-500">Asking Guju AI for a new quest!</p>
      </div>
    );
  }

  if (error && !mission) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <span className="text-4xl mb-4">😢</span>
        <h2 className="text-lg font-bold text-red-600 mb-4">{error}</h2>
        <button onClick={() => loadMission('easy')} className="px-6 py-2 bg-[var(--rf-saffron)] text-white font-bold rounded-xl shadow-md">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 animate-fade-in bg-[var(--rf-cream)]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--rf-indigo)', border: 'var(--rf-border)', boxShadow: 'var(--rf-shadow-saffron)' }}>
        <HalftoneOverlay alpha={0.1} size={7} />
        <div className="relative flex items-center justify-between p-4 text-white">
          <div>
            <p className="font-black text-xl">Missions</p>
            <p className="text-white/80 text-sm font-medium">Build sentences to complete quests!</p>
          </div>
          <span className="text-4xl">🚀</span>
        </div>
      </div>

      {mission && (
        <div className="flex flex-col flex-1 space-y-6">
          
          {/* Mission Scenario */}
          <div className="rf-card p-4 text-center space-y-3" style={{ boxShadow: 'var(--rf-shadow-saffron)' }}>
            <span className="text-sm font-black text-[var(--rf-saffron)] uppercase tracking-wide">Step 1: The Scenario</span>
            <p className="text-lg font-bold text-gray-800">{mission.scenarioEnglish}</p>
            <p className="text-md text-[var(--rf-indigo)]" style={{ fontFamily: 'var(--font-gujarati)' }}>{mission.scenarioGujarati}</p>
            
            <div className="mt-4 p-3 bg-orange-50 border-2 border-orange-200 rounded-xl flex flex-col items-center gap-2">
              <span className="text-2xl animate-bounce">🎬</span>
              <p className="text-sm font-bold text-orange-800 uppercase tracking-wide">Action Station</p>
              <p className="text-sm text-orange-900">{mission.actionPrompt}</p>
            </div>
          </div>

          {/* Puzzle Area */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center">
              <span className="text-sm font-black text-[var(--rf-indigo)] uppercase tracking-wide">Step 2: Build the Sentence</span>
            </div>

            {/* Sentence Strip (Drop zone) */}
            <div className={`min-h-[80px] p-4 rounded-2xl border-4 border-dashed transition-colors flex flex-wrap gap-2 items-center justify-center ${isPuzzleSolved ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white'}`}>
              {placedBlocks.length === 0 && !isPuzzleSolved && (
                <span className="text-gray-400 font-bold">Tap words to build sentence here</span>
              )}
              {placedBlocks.map((block, idx) => (
                <button
                  key={`placed-${idx}`}
                  onClick={() => !isPuzzleSolved && handleRemoveBlock(block, idx)}
                  className={`px-4 py-3 rounded-xl border-2 font-bold shadow-sm transition-transform active:scale-95 ${TYPE_COLORS[block.type] || 'bg-gray-100 border-gray-400'} ${isPuzzleSolved ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{ fontFamily: 'var(--font-gujarati)' }}
                >
                  <div className="text-lg">{block.text}</div>
                  <div className="text-[10px] uppercase opacity-70 mt-1">{block.roman}</div>
                </button>
              ))}
              {isPuzzleSolved && (
                <span className="text-2xl ml-2 animate-bounce">✅</span>
              )}
            </div>

            {/* Available Blocks */}
            {!isPuzzleSolved && (
              <div className="flex flex-wrap gap-3 justify-center min-h-[60px]">
                {availableBlocks.map((block, idx) => (
                  <button
                    key={`avail-${idx}`}
                    onClick={() => handlePlaceBlock(block, idx)}
                    className={`px-4 py-3 rounded-xl border-2 font-bold shadow-sm transition-transform hover:-translate-y-1 active:scale-95 ${TYPE_COLORS[block.type] || 'bg-gray-100 border-gray-400'}`}
                    style={{ fontFamily: 'var(--font-gujarati)' }}
                  >
                    <div className="text-lg">{block.text}</div>
                    <div className="text-[10px] uppercase opacity-70 mt-1">{block.roman}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Speech Section */}
          {isPuzzleSolved && (
            <div className="rf-card p-6 text-center space-y-4 animate-fade-in" style={{ border: '2px solid #22c55e', boxShadow: '4px 4px 0px #22c55e' }}>
              <span className="text-sm font-black text-green-600 uppercase tracking-wide">Step 3: Say It!</span>
              <p className="text-gray-600 font-medium">Read your sentence out loud to complete the mission.</p>
              
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-gujarati)' }}>
                {mission.targetSentence}
              </div>
              <p className="text-sm text-gray-500 font-bold">{mission.targetEnglish}</p>
              
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => speak(mission.targetSentence, 'mission-say')}
                  className="w-14 h-14 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors border-2 border-gray-300"
                >
                  <SpeakIcon id="mission-say" currentlyPlaying={currentlyPlaying} ttsLoading={ttsLoading} />
                </button>

                <button
                  onClick={isRecording ? stopPronunciationCheck : () => startPronunciationCheck(mission.targetSentence, 5000)}
                  disabled={isProcessing || missionComplete}
                  className={`w-14 h-14 flex items-center justify-center rounded-full transition-all border-2 ${
                    missionComplete ? 'bg-green-500 border-green-600 text-white' :
                    isRecording ? 'bg-red-500 border-red-600 text-white animate-pulse' : 
                    'bg-[var(--rf-saffron)] border-[#d94a19] text-white hover:-translate-y-1 hover:shadow-lg'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? '...' : missionComplete ? '🌟' : '🎤'}
                </button>
              </div>

              {score !== null && (
                <div className="mt-4 animate-fade-in">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3].map(star => (
                      <span key={star} className={`text-2xl ${star <= score ? 'text-yellow-400' : 'text-gray-200'}`}>⭐</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success / Next Mission */}
          {missionComplete && (
            <div className="flex justify-center animate-fade-in py-4">
              <button 
                onClick={() => loadMission('easy')}
                className="px-8 py-4 bg-[var(--rf-indigo)] text-white font-black rounded-2xl shadow-[4px_4px_0px_#f6efdd] border-2 border-[#152c52] hover:-translate-y-1 transition-transform"
              >
                NEXT MISSION 🚀
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
