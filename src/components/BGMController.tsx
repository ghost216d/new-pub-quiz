import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, ChevronDown, Sparkles, Volume1 } from 'lucide-react';
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
      {/* One simple trigger; all music actions live inside the expanded menu. */}
      <button
        id="bgm-settings-dropdown-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Open music options"
        aria-label={isMenuOpen ? 'Close music options' : 'Open music options'}
        aria-expanded={isMenuOpen}
        className={`bgm-trigger flex items-center justify-center gap-2 rounded-2xl border-2 font-cartoon transition cursor-pointer ${
          isActuallyAudible
            ? 'bg-sky-100 text-sky-900 border-sky-500'
            : 'bg-white text-stone-700 border-sky-300'
        }`}
      >
        {isActuallyAudible ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        {!compact && <span className="hidden sm:inline">MUSIC</span>}
        <ChevronDown className={`bgm-trigger-chevron w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu for Track Selection & Volume */}
      {isMenuOpen && (
        <div
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

          {/* Quick Mute Action */}
          <button
            onClick={handleToggleMute}
            className={`w-full py-2 rounded-xl text-xs font-cartoon transition cursor-pointer flex items-center justify-center gap-2 ${
              status.isMuted
                ? 'cartoon-btn-amber text-stone-950 font-black'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-2 border-stone-400'
            }`}
          >
            {status.isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>UNMUTE PUB TUNES</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                <span>MUTE MUSIC</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
