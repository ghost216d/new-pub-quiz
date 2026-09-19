import React, { useEffect } from 'react';
import { Trophy, Crown, Flame, Sparkles, RotateCcw, Award, Users, ShieldAlert } from 'lucide-react';
import { RoomState, Team } from '../types';
import { audioSynth } from '../utils/audioSynth';

interface Props {
  roomState: RoomState;
  onResetKnockout?: () => void;
  onPlayAgain?: () => void;
  isHost?: boolean;
}

export const KnockoutWinnerScreen: React.FC<Props> = ({
  roomState,
  onResetKnockout,
  onPlayAgain,
  isHost = false,
}) => {
  const winnerTeam: Team | undefined = roomState.knockoutWinnerTeamId
    ? roomState.teams[roomState.knockoutWinnerTeamId]
    : undefined;

  const allTeams = (Object.values(roomState.teams) as Team[]).sort((a, b) => b.score - a.score);
  const runnersUp = allTeams.filter((t) => t.id !== winnerTeam?.id).slice(0, 3);

  // Play fanfare when winner screen mounts
  useEffect(() => {
    audioSynth.playChampionFanfare();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#fffdf8] border-4 border-amber-800 p-6 md:p-12 text-center text-stone-900 shadow-[0_12px_0_#451a03] select-none animate-in fade-in zoom-in-95 duration-500">
      {/* Floating Confetti / Sparkle Decor */}
      <div className="flex justify-center items-center gap-2 mb-3">
        <span className="text-3xl animate-bounce">✨</span>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-800/40 text-xs md:text-sm font-black uppercase tracking-widest">
          <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Knockout Mode • Must Have 1 Winner</span>
        </div>
        <span className="text-3xl animate-bounce" style={{ animationDelay: '150ms' }}>
          🎉
        </span>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        {/* Crown & Giant Avatar */}
        <div className="relative inline-block mx-auto my-2">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-amber-600 drop-shadow-[0_4px_12px_rgba(217,119,6,0.5)] animate-pulse">
            <Crown className="w-14 h-14 md:w-16 md:h-16 stroke-[2.5]" />
          </div>
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1.5 shadow-[0_8px_0_#451a03] mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-amber-100 rounded-[22px] flex items-center justify-center text-6xl md:text-8xl border-2 border-amber-800/40">
              {winnerTeam?.avatar || '🏆'}
            </div>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-1 rounded-full text-xs md:text-sm font-black uppercase tracking-wider border-2 border-amber-900 shadow-md whitespace-nowrap">
            Sole Champion
          </div>
        </div>

        {/* Winner Name & Title */}
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-6xl font-black text-amber-950 tracking-tight uppercase drop-shadow-sm">
            {winnerTeam?.name || 'Sole Survivor'}
          </h1>
          <p className="text-amber-900 font-extrabold text-sm md:text-xl">
            Outlasted every other team in the pub to become the Undisputed Legend! 🍻
          </p>
        </div>

        {/* Stats Pod */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-amber-100/70 border-2 border-amber-800/40 shadow-sm">
          <div className="text-center">
            <span className="block text-[10px] md:text-xs uppercase font-black text-stone-600">
              Final Score
            </span>
            <span className="text-xl md:text-3xl font-black text-amber-950">
              {winnerTeam?.score || 0} pts
            </span>
          </div>

          <div className="text-center border-x border-amber-800/30">
            <span className="block text-[10px] md:text-xs uppercase font-black text-stone-600">
              Opponents Knocked Out
            </span>
            <span className="text-xl md:text-3xl font-black text-emerald-700">
              {Math.max(0, allTeams.length - 1)} Teams
            </span>
          </div>

          <div className="text-center">
            <span className="block text-[10px] md:text-xs uppercase font-black text-stone-600">
              Knockout Status
            </span>
            <span className="text-xl md:text-3xl font-black text-amber-950">
              100% Alive
            </span>
          </div>
        </div>

        {/* Runners Up Podium */}
        {runnersUp.length > 0 && (
          <div className="text-left bg-amber-50/80 p-4 rounded-2xl border border-amber-800/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-stone-600">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>Honorable Survivors (Knocked Out in Finals)</span>
              </span>
              <span>Score</span>
            </div>
            <div className="space-y-1.5">
              {runnersUp.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#fffdf8] border border-amber-800/30 text-xs md:text-sm text-stone-900"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-500 font-mono">#{idx + 2}</span>
                    <span className="text-lg">{team.avatar}</span>
                    <span className="font-extrabold text-stone-900">{team.name}</span>
                    {team.eliminatedReason && (
                      <span className="text-[10px] text-red-900 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                        {team.eliminatedReason}
                      </span>
                    )}
                  </div>
                  <span className="font-black text-amber-950">{team.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Host Control Actions */}
        {isHost && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-amber-800/30">
            {onResetKnockout && (
              <button
                onClick={onResetKnockout}
                className="px-5 py-3 rounded-xl bg-amber-100 hover:bg-white text-stone-800 text-xs md:text-sm font-black border-2 border-amber-800 transition cursor-pointer flex items-center gap-2 shadow-[0_4px_0_#451a03]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revive All Teams / Rematch</span>
              </button>
            )}

            {onPlayAgain && (
              <button
                onClick={onPlayAgain}
                className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs md:text-sm font-black border-2 border-amber-900 shadow-[0_4px_0_#78350f] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Start New Round</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
