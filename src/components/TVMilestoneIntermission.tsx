import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Zap, Award, Wine, ArrowRight } from 'lucide-react';
import { RoomState, Team } from '../types';
import { audioSynth } from '../utils/audioSynth';

interface Props {
  roomState: RoomState;
  isHost?: boolean;
  onContinue?: () => void;
}

export const TVMilestoneIntermission: React.FC<Props> = ({ roomState, isHost, onContinue }) => {
  const teamsList: Team[] = (Object.values(roomState.teams) as Team[]).sort((a, b) => b.score - a.score);

  useEffect(() => {
    // Play celebratory cartoon fanfare
    audioSynth.playMilestoneFanfare();

    // Trigger cartoon confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: { x: 0.1, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: { x: 0.9, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const totalQuestions = roomState.lastMilestoneQuestionIndex || 10;
  const maxScore = Math.max(...teamsList.map((t) => t.score), 10);

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-between p-6 md:p-10 bg-[#fffdf8] rounded-3xl border-4 border-amber-800 shadow-[0_12px_0_#451a03] text-stone-900 overflow-hidden">
      {/* Header Banner */}
      <div className="text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500 text-slate-950 font-black text-sm md:text-base uppercase tracking-widest shadow-[0_4px_0_#92400e] border-2 border-amber-900 mb-3 animate-pulse">
          <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          <span>10-Question Milestone Checkpoint!</span>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-amber-950 drop-shadow-sm tracking-wide">
          TEAM PROGRESSION & LEADERBOARD
        </h1>
        <p className="text-stone-700 text-sm md:text-lg mt-2 font-bold">
          Milestone reached at Question {totalQuestions} • Bar tab & glory on the line! 🍻
        </p>
      </div>

      {/* Top 3 Podium or Team List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-8 relative z-10 items-end">
        {/* Podium Area (Left 7 cols) */}
        <div className="lg:col-span-7 bg-amber-50/70 rounded-2xl border-3 border-amber-800 p-5 md:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-amber-800/30 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-700" />
              <h2 className="text-lg md:text-xl font-black text-amber-950">Team Progression Bars</h2>
            </div>
            <span className="text-xs font-black text-stone-600 uppercase tracking-wider">
              Cumulative Points
            </span>
          </div>

          <div className={`${teamsList.length > 8 ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[62vh] overflow-y-auto pr-1.5 scrollbar-thin' : 'space-y-3'}`}>
            {teamsList.length === 0 ? (
              <div className="col-span-full text-center py-8 text-stone-500 font-bold">
                <Wine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No teams joined yet. Share room code <strong className="text-amber-950">{roomState.code}</strong>!</p>
              </div>
            ) : (
              teamsList.map((team, idx) => {
                const percentage = Math.round((team.score / maxScore) * 100);
                const rankMedal = idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`;

                return (
                  <div
                    key={team.id}
                    className={`relative rounded-xl p-3 border-2 transition-all ${
                      idx === 0
                        ? 'bg-amber-100 border-amber-800 shadow-[0_4px_0_#451a03]'
                        : 'bg-[#fffdf8] border-amber-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs md:text-sm font-bold mb-1.5">
                      <div className="flex items-center gap-2 truncate max-w-[75%]">
                        <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-800/40 shrink-0">
                          {rankMedal}
                        </span>
                        <span className="text-lg md:text-xl shrink-0">{team.avatar}</span>
                        <span className="text-stone-900 font-extrabold truncate" title={team.name}>
                          {team.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-base md:text-lg font-black text-amber-950">
                          {team.score}
                        </span>
                        <span className="text-[10px] text-stone-600 font-bold uppercase">pts</span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-amber-200/80 rounded-full h-3.5 overflow-hidden border border-amber-800/40 p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-1.5"
                        style={{
                          width: `${Math.max(percentage, 6)}%`,
                          backgroundColor: team.color || '#F59E0B',
                        }}
                      >
                        <span className="text-[9px] font-black text-slate-950 drop-shadow">
                          {team.score > 0 ? `${team.score}p` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fun Pub Awards (Right 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-amber-50/90 rounded-2xl border-3 border-amber-800 p-5 shadow-md">
            <h3 className="text-base font-black text-amber-950 flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-700" />
              <span>Pub Highlights of Questions 1–{totalQuestions}</span>
            </h3>

            <div className="space-y-3 text-xs md:text-sm font-semibold">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#fffdf8] border border-amber-800/30">
                <span className="flex items-center gap-2 text-stone-700 font-bold">
                  <Zap className="w-4 h-4 text-amber-600" /> Fastest Answers
                </span>
                <span className="text-amber-950 font-black">
                  {teamsList[0]?.name || 'Pub Legends'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#fffdf8] border border-amber-800/30">
                <span className="flex items-center gap-2 text-stone-700 font-bold">
                  🍺 Bar Tab Champions
                </span>
                <span className="text-emerald-700 font-black">
                  {teamsList.length > 1 ? teamsList[1].name : 'All Challengers'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-100 border border-amber-800/40 text-amber-950 text-xs leading-relaxed font-bold">
                📢 <strong>Quiz Master Note:</strong> Refresh your pints, discuss strategies, and prepare for the next round of questions!
              </div>
            </div>
          </div>

          {isHost && (
            <button
              id="host-milestone-continue-btn"
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-base md:text-lg font-black text-slate-950 shadow-[0_6px_0_#065f46] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all cursor-pointer border-3 border-emerald-900"
            >
              <span>Resume Game & Next Question</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center border-t border-amber-800/30 pt-4 text-xs md:text-sm text-stone-600 font-bold relative z-10 flex flex-col md:flex-row items-center justify-between gap-2">
        <span>Room Code: <strong className="text-amber-950 text-base">{roomState.code}</strong></span>
        <span>Every 10 questions milestone intermission keeps the entire pub locked in!</span>
        <span>The Cartoon Pub Quiz</span>
      </div>
    </div>
  );
};
