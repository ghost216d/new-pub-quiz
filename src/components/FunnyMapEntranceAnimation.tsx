import React, { useEffect, useState } from 'react';
import { audioSynth } from '../utils/audioSynth';
import { Sparkles, Zap, Flame, ShieldAlert, ArrowRight } from 'lucide-react';

interface Props {
  mapName: string;
  mapIcon: string;
  onComplete: () => void;
}

const FUNNY_QUOTES = [
  "Hold onto your pints! Teleporting to the tavern realm!",
  "Duck! Low wooden tavern beam ahead!",
  "Wiping down the sticky bar counter... Welcome in!",
  "Watch out for flying beer mugs & rogue peanuts!",
  "Who ordered the extra-large trivia brain booster?",
  "Bartender just tapped a fresh keg of trivia knowledge!",
  "Warning: High concentration of tavern dad jokes ahead!",
];

export const FunnyMapEntranceAnimation: React.FC<Props> = ({
  mapName,
  mapIcon,
  onComplete,
}) => {
  const [quote] = useState(
    () => FUNNY_QUOTES[Math.floor(Math.random() * FUNNY_QUOTES.length)]
  );
  const [phase, setPhase] = useState<'swing' | 'pop' | 'exit'>('swing');

  useEffect(() => {
    // Play funny entrance boing + whoosh sound
    audioSynth.playFunnyEntranceSfx();

    const t1 = setTimeout(() => {
      setPhase('pop');
    }, 450);

    const t2 = setTimeout(() => {
      setPhase('exit');
    }, 1800);

    const t3 = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      id="funny-map-entrance-overlay"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-opacity duration-300 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Cartoon Flying Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 text-4xl animate-bounce duration-700">🍺</div>
        <div className="absolute top-1/3 right-12 text-3xl animate-spin duration-1000">🥨</div>
        <div className="absolute bottom-1/4 left-1/4 text-4xl animate-pulse">✨</div>
        <div className="absolute bottom-1/3 right-1/4 text-3xl animate-bounce">🥜</div>
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-5xl opacity-40 animate-ping">🫧</div>
      </div>

      {/* Main Cartoon Entrance Card */}
      <div
        className={`relative max-w-sm w-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-6 sm:p-7 border-4 border-amber-900 shadow-[0_16px_0_#451a03] text-center text-slate-950 space-y-4 transition-all duration-300 transform ${
          phase === 'swing'
            ? 'scale-75 rotate-[-8deg] translate-y-8 opacity-0'
            : phase === 'pop'
            ? 'scale-105 rotate-[2deg] translate-y-0 opacity-100'
            : 'scale-100 rotate-0 opacity-100'
        }`}
      >
        {/* Cartoon Wooden Tavern Sign Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900 text-amber-200 text-xs font-black tracking-wider uppercase shadow-inner border border-amber-700">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Entering Realm</span>
        </div>

        {/* Bouncing Animated Mascot / Realm Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          {/* Animated Foam Cloud Ring */}
          <div className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-50" />
          <div className="relative w-20 h-20 rounded-2xl bg-amber-100 border-4 border-amber-900 shadow-[0_6px_0_#451a03] flex items-center justify-center text-5xl transform hover:rotate-12 transition-transform select-none">
            {mapIcon}
          </div>
          {/* Spilling Beer Foam Droplets SVG */}
          <div className="absolute -top-1 -right-1 text-2xl animate-bounce">🫧</div>
          <div className="absolute -bottom-2 -left-2 text-xl animate-bounce delay-150">🍻</div>
        </div>

        {/* Realm Name & Funny Landlord Speech Bubble */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-950 tracking-tight drop-shadow-sm">
            {mapName}
          </h2>

          {/* Funny Speech Bubble */}
          <div className="relative bg-white rounded-2xl p-3 border-3 border-amber-950 shadow-md text-xs font-black text-amber-950">
            <span className="italic">"{quote}"</span>
            {/* Speech bubble pointer notch */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t-3 border-l-3 border-amber-950 transform rotate-45" />
          </div>
        </div>

        {/* Fast Action / Skip Button */}
        <div className="pt-1">
          <button
            onClick={onComplete}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-yellow-400 font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 border border-slate-800"
          >
            <span>Belly Up to the Bar!</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
