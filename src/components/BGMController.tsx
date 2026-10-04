import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, ChevronDown } from 'lucide-react';
import { bgmEngine } from '../utils/bgmSynth';
import { audioSynth } from '../utils/audioSynth';

interface BGMControllerProps {
  compact?: boolean;
  className?: string;
}

export const BGMController: React.FC<BGMControllerProps> = ({ compact = false, className = '' }) => {
  const [status, setStatus] = useState(bgmEngine.getStatus());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe(() => {
      setStatus(bgmEngine.getStatus());
    });
    return unsubscribe;
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    bgmEngine.toggleMute();
  };


  return (
    <div className={`bgm-control relative inline-flex items-center ${isMenuOpen ? 'is-open' : ''} ${compact ? 'is-compact' : ''} ${className}`}>
      {/* One-tap sound control; music settings stay separate. */}
      <button
        id="bgm-mute-toggle"
        type="button"
        onClick={handleToggleMute}
        title={status.isMuted ? 'Turn pub music on' : 'Mute pub music'}
        aria-label={status.isMuted ? 'Turn pub music on' : 'Mute pub music'}
        aria-pressed={status.isMuted}
        className={`bgm-mute-trigger rounded-2xl border-2 font-cartoon transition cursor-pointer ${
          status.isMuted
            ? 'is-muted bg-white text-stone-700 border-rose-400'
            : 'is-unmuted bg-emerald-50 text-emerald-950 border-emerald-500'
        }`}
      >
        {status.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        <span className="bgm-mute-label">{status.isMuted ? 'OFF' : 'ON'}</span>
      </button>

      <button
        id="bgm-settings-dropdown-btn"
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Open music settings"
        aria-label={isMenuOpen ? 'Close music settings' : 'Open music settings'}
        aria-expanded={isMenuOpen}
        aria-controls="bgm-settings-menu"
        className={`bgm-settings-trigger rounded-2xl border-2 transition cursor-pointer ${
          isMenuOpen ? 'is-open' : ''
        }`}
      >
        <Music className="w-5 h-5" aria-hidden="true" />
        <ChevronDown className={`bgm-trigger-chevron w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu for Track Selection & Volume */}
      {isMenuOpen && (
        <div
          id="bgm-settings-menu"
          role="region"
          aria-label="Pub music settings"
          className="bgm-menu absolute right-0 top-full mt-2 w-72 p-3.5 bg-white border-3 border-sky-500 text-stone-900 rounded-3xl shadow-[0_8px_0_#0369a1] z-50 space-y-3 animate-pop-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-cartoon text-amber-950">
              <Music className="w-4 h-4 text-amber-700" />
              <span>PUB MUSIC</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-stone-500 hover:text-stone-900 text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-amber-100"
            >
              ✕
            </button>
          </div>

          <div className="rounded-xl border-2 border-amber-800/30 bg-amber-50/70 p-3 text-center">
            <div className="text-xs font-cartoon text-amber-950">One gentle soundtrack</div>
            <div className="mt-1 text-[10px] text-stone-600 font-medium">Plays softly through all 3 levels</div>
          </div>

          {/* Quiet background music volume */}
          <div className="space-y-2 pt-1 border-t-2 border-amber-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
              <span>Music volume</span>
              <span className="font-mono text-amber-950 font-black">{Math.round(status.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.25}
              step={0.05}
              value={status.volume}
              onChange={(e) => bgmEngine.setVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
            />

          </div>

        </div>
      )}
    </div>
  );
};
