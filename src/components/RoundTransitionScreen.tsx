import React, { useEffect } from 'react';
import { Play, Sparkles, Music, Image as ImageIcon, HelpCircle, ArrowRight } from 'lucide-react';
import { Round } from '../types';
import { audioSynth } from '../utils/audioSynth';
import { CartoonBeerStein, CartoonRecordPlayer } from './CartoonIllustrations';

interface Props {
  round: Round;
  roundIndex: number;
  totalRounds: number;
  isHost?: boolean;
  onStartRound?: () => void;
}

export const RoundTransitionScreen: React.FC<Props> = ({
  round,
  roundIndex,
  totalRounds,
  isHost,
  onStartRound,
}) => {
  useEffect(() => {
    audioSynth.playCorrectFx();
  }, [roundIndex]);

  const isMusic = round.type === 'music';
  const isPicture = round.type === 'picture';

  return (
    <div className="relative min-h-[70vh] flex flex-col justify-between p-6 md:p-10 bg-[#fffdf8] rounded-3xl border-4 border-amber-800 shadow-[0_12px_0_#451a03] text-stone-900 overflow-hidden text-center">
      {/* Top Banner */}
      <div className="relative z-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs md:text-sm uppercase tracking-widest border-2 border-amber-900 shadow-md animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Round {roundIndex + 1} of {totalRounds}</span>
        </div>

        <h1 className="text-3xl md:text-6xl font-black text-amber-950 tracking-tight drop-shadow-sm">
          {round.title}
        </h1>

        <p className="text-sm md:text-xl text-stone-700 max-w-xl mx-auto font-bold">
          {round.description}
        </p>
      </div>

      {/* Center Cartoon Art & Feature Callout */}
      <div className="relative z-10 my-6 flex flex-col items-center justify-center">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-amber-100 border-4 border-amber-800 flex items-center justify-center shadow-lg relative mb-4">
          {isMusic ? (
            <CartoonRecordPlayer isPlaying={true} size={84} />
          ) : isPicture ? (
            <div className="text-6xl animate-bounce">🖼️</div>
          ) : (
            <CartoonBeerStein size={84} />
          )}

          <div className="absolute -bottom-3 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider border-2 border-amber-950 shadow">
            {round.type === 'music' ? 'Audio Riff Round' : round.type === 'picture' ? 'Picture Round' : 'Trivia Round'}
          </div>
        </div>

        {/* Round Stat Highlights */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-md w-full">
          <div className="p-3 rounded-2xl bg-amber-100/70 border-2 border-amber-800/30 text-center">
            <span className="block text-[10px] md:text-xs font-black text-stone-600 uppercase">Questions</span>
            <span className="text-lg md:text-2xl font-black text-amber-950">{round.questions.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-100/70 border-2 border-amber-800/30 text-center">
            <span className="block text-[10px] md:text-xs font-black text-stone-600 uppercase">Per Question</span>
            <span className="text-lg md:text-2xl font-black text-emerald-700">10–15 pts</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-100/70 border-2 border-amber-800/30 text-center">
            <span className="block text-[10px] md:text-xs font-black text-stone-600 uppercase">Format</span>
            <span className="text-xs md:text-sm font-black text-purple-900 mt-1 block truncate">
              {isMusic ? 'Song ID' : 'Multi / Type'}
            </span>
          </div>
        </div>
      </div>

      {/* Host or Waiting Action Footer */}
      <div className="relative z-10 max-w-md mx-auto w-full">
        {isHost ? (
          <button
            id="start-round-now-btn"
            onClick={onStartRound}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-base md:text-lg font-black text-slate-950 shadow-[0_6px_0_#065f46] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all cursor-pointer border-3 border-emerald-900"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Round {roundIndex + 1} Now</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-100/90 border border-amber-800/30 text-xs md:text-sm text-stone-800 font-bold flex items-center justify-center gap-2 animate-pulse">
            <span>🍺 Quiz Master is preparing the questions... Get ready to buzz in!</span>
          </div>
        )}
      </div>
    </div>
  );
};
