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
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Main Trigger Button */}
      <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-amber-950/60 border-2 border-amber-600/70 hover:border-amber-400 rounded-2xl shadow-md transition">
        <button
          id="bgm-mute-toggle-btn"
          onClick={handleToggleMute}
          title={status.isMuted ? 'Unmute feel-good tavern music' : 'Mute background music'}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer min-h-[36px] ${
            isActuallyAudible
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black shadow-[0_2px_0_#78350f]'
              : 'bg-stone-800 text-amber-100/80 hover:text-white border border-stone-700'
          }`}
        >
          {isActuallyAudible ? (
            <>
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce shrink-0 text-amber-950" />
              {/* Animated Equalizer waves */}
              <span className="flex items-end gap-0.5 h-3.5 px-0.5">
                <span className="w-1 bg-stone-950 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2.5" />
                <span className="w-1 bg-stone-950 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3.5" />
                <span className="w-1 bg-stone-950 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
              </span>
              {!compact && <span className="hidden sm:inline font-cartoon text-amber-950">MUSIC ON</span>}
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
              {!compact && <span className="text-amber-200/80 hidden sm:inline font-bold">MUTED</span>}
            </>
          )}
        </button>

        {/* Quick Dropdown Toggle for Tracks & Volume */}
        <button
          id="bgm-settings-dropdown-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Tavern Music Tracks & Volume"
          className="p-1.5 rounded-xl hover:bg-amber-900/60 text-amber-200 hover:text-white transition cursor-pointer flex items-center gap-0.5 sm:gap-1 min-h-[36px]"
        >
          <span className="text-xs">{status.currentTrack.emoji}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu for Track Selection & Volume */}
      {isMenuOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 p-3.5 bg-[#fffdf8] border-3 border-amber-800 text-stone-900 rounded-3xl shadow-[0_8px_0_#451a03] z-50 space-y-3 animate-pop-in"
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
