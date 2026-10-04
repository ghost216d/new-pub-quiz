import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { bgmEngine } from '../utils/bgmSynth';

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
      <button
        id="bgm-settings-dropdown-btn"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsMenuOpen((open) => !open);
        }}
        title="Open music controls"
        aria-label={`Open music controls. Music is ${status.isMuted ? 'off' : 'on'}`}
        aria-expanded={isMenuOpen}
        aria-controls="bgm-settings-menu"
        className={`bgm-settings-trigger rounded-2xl border-2 transition cursor-pointer ${status.isMuted ? 'is-muted' : 'is-unmuted'} ${isMenuOpen ? 'is-open' : ''}`}
      >
        <Music className="w-5 h-5" aria-hidden="true" />
      </button>

      {isMenuOpen && (
        <div
          id="bgm-settings-menu"
          role="region"
          aria-label="Pub music controls"
          className="bgm-menu absolute right-0 top-full mt-2 w-72 p-3.5 bg-white border-3 border-sky-500 text-stone-900 rounded-3xl shadow-[0_8px_0_#0369a1] z-50 space-y-3 animate-pop-in"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-cartoon text-amber-950">
              <Music className="w-4 h-4 text-amber-700" />
              <span>PUB MUSIC</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close music controls"
              className="text-stone-500 hover:text-stone-900 text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-amber-100"
            >
              ✕
            </button>
          </div>

          <button
            id="bgm-mute-toggle"
            type="button"
            onClick={handleToggleMute}
            aria-pressed={status.isMuted}
            className={`bgm-mute-trigger flex w-full items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 font-bold transition cursor-pointer ${status.isMuted ? 'is-muted' : 'is-unmuted'}`}
          >
            {status.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{status.isMuted ? 'Turn music on' : 'Turn music off'}</span>
          </button>

          <div className="space-y-2 border-t-2 border-amber-200 pt-3">
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
              aria-label="Music volume"
              onChange={(event) => bgmEngine.setVolume(parseFloat(event.target.value))}
              className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

