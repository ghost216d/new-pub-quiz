import React from 'react';
import { Home, Trophy } from 'lucide-react';
import { RoomState, Team } from '../types';

interface Props {
  roomState: RoomState;
  audience: 'host' | 'tv' | 'player';
  myTeamId?: string;
  onExit?: () => void;
}

export const QuizCompleteScreen: React.FC<Props> = ({ roomState, audience, myTeamId, onExit }) => {
  const standings = (Object.values(roomState.teams) as Team[])
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const winner = standings[0];
  const myRank = standings.findIndex((team) => team.id === myTeamId) + 1;

  return (
    <main className="min-h-screen bg-pub-wood text-stone-900 flex items-center justify-center p-4 md:p-8">
      <section className="w-full max-w-4xl rounded-3xl border-4 border-amber-800 bg-[#fffdf8] p-6 md:p-10 text-center shadow-[0_8px_0_#451a03]">
        <Trophy className="mx-auto h-14 w-14 text-amber-600" />
        <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-amber-800">Quiz complete</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-black text-amber-950">Thanks for playing!</h1>
        {winner ? (
          <p className="mt-3 text-lg md:text-2xl font-bold text-stone-700">
            🏆 {winner.name} wins with {winner.score} points!
          </p>
        ) : (
          <p className="mt-3 text-lg font-bold text-stone-700">The quiz has ended.</p>
        )}

        {audience === 'player' && myTeamId && (
          <p className="mt-2 font-bold text-stone-600">
            Your team finished {myRank ? `#${myRank}` : 'without a rank'} with {roomState.teams[myTeamId]?.score || 0} points.
          </p>
        )}

        {audience !== 'player' && standings.length > 0 && (
          <ol className="mx-auto mt-7 max-w-2xl space-y-2 text-left">
            {standings.map((team, index) => (
              <li key={team.id} className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${index === 0 ? 'border-amber-500 bg-amber-100' : 'border-amber-800/20 bg-amber-50'}`}>
                <span className="font-black text-amber-950">{index + 1}. {team.avatar} {team.name}</span>
                <span className="font-black text-stone-800">{team.score} pts</span>
              </li>
            ))}
          </ol>
        )}

        {audience === 'player' && standings.length > 0 && (
          <p className="mt-4 text-sm font-bold text-stone-600">Winning team: {winner?.name}</p>
        )}

        {onExit && (
          <button onClick={onExit} className="mt-8 inline-flex items-center gap-2 rounded-xl border-2 border-amber-950 bg-amber-500 px-5 py-3 font-black text-amber-950 shadow-[0_4px_0_#451a03]">
            <Home className="h-5 w-5" /> Back to home
          </button>
        )}
      </section>
    </main>
  );
};
