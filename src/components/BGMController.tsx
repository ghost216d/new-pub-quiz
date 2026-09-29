import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, ChevronDown, Sparkles } from 'lucide-react';
import { bgmEngine, BGM_TRACKS, BGMTrackId } from '../utils/bgmSynth';
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

  const handleTrackSelect = (id: BGMTrackId) => {
    bgmEngine.setTrack(id);
    if (status.isMuted) {
      bgmEngine.toggleMute();
    }
  };

  const handleMaxVolume = () => {
    bgmEngine.setVolume(1.0);
    if (status.isMuted) {
      bgmEngine.toggleMute();
    }
    audioSynth.playCoinFx();
  };

  const isActuallyAudible = status.isPlaying && !status.isMuted && status.volume > 0;

  return (
    <div className={`bgm-control relative inline-flex items-center ${isMenuOpen ? 'is-open' : ''} ${className}`}>
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
        {!compact && <span className="bgm-mute-label">{status.isMuted ? 'MUTED' : 'SOUND'}</span>}
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
              <span>FEEL-GOOD PUB TUNES</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-stone-500 hover:text-stone-900 text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-amber-100"
            >
              ✕
            </button>
          </div>

          {/* Track options */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600">
              Select Tavern Soundtrack
            </label>
            {BGM_TRACKS.map((t) => {
              const isSelected = t.id === status.currentTrackId;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTrackSelect(t.id)}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-amber-100 border-amber-800 text-amber-950 shadow-sm font-bold'
                      : 'bg-amber-50/70 border-amber-800/30 hover:bg-amber-100 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{t.emoji}</span>
                    <div>
                      <div className="text-xs font-cartoon text-amber-950">{t.name}</div>
                      <div className="text-[10px] text-stone-600 font-medium">{t.genre}</div>
                    </div>
                  </div>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Volume Slider & Boost Button */}
          <div className="space-y-2 pt-1 border-t-2 border-amber-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
              <span>Volume Level</span>
              <span className="font-mono text-amber-950 font-black">{Math.round(status.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={status.volume}
              onChange={(e) => bgmEngine.setVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleMaxVolume}
                className="flex-1 py-1 px-2 rounded-xl cartoon-btn-amber text-[10px] font-cartoon flex items-center justify-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>MAX VOLUME (100%)</span>
              </button>
              <button
                type="button"
                onClick={() => audioSynth.playCoinFx()}
                className="py-1 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-800/50 text-[10px] font-bold text-stone-800 cursor-pointer"
                title="Test SFX"
              >
                🔔 Test SFX
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
