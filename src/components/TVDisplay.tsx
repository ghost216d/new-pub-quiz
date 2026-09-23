import React, { useEffect, useState } from 'react';
import { Tv, Music, Clock, Users, CheckCircle2, Sparkles, Volume2, Disc3, Flame, Skull, Trophy } from 'lucide-react';
import { RoomState, Team } from '../types';
import { TVMilestoneIntermission } from './TVMilestoneIntermission';
import { RoundTransitionScreen } from './RoundTransitionScreen';
import { KnockoutWinnerScreen } from './KnockoutWinnerScreen';
import { audioSynth } from '../utils/audioSynth';
import { BGMController } from './BGMController';
import { RoomJoinQR } from './RoomJoinQR';

interface Props {
  roomState: RoomState;
  onExitTV?: () => void;
}

export const TVDisplay: React.FC<Props> = ({ roomState, onExitTV }) => {
  const currentRound = roomState.rounds[roomState.currentRoundIndex];
  const currentQ = currentRound?.questions[roomState.currentQuestionIndex];
  const [activeClueIndex, setActiveClueIndex] = useState(0);

  // Play audio synth if question has melody and music is active
  useEffect(() => {
    if (roomState.status === 'question' && currentQ?.musicData?.melodyId && roomState.musicPlaying) {
      audioSynth.playMelody(currentQ.musicData.melodyId);
    } else {
      audioSynth.stopMelody();
    }
    return () => {
      audioSynth.stopMelody();
    };
  }, [roomState.status, currentQ?.id, roomState.musicPlaying]);

  // If Knockout Winner is crowned, show the Grand Sole Champion TV Stage!
  if (roomState.status === 'knockout_winner') {
    return (
      <div className="min-h-screen bg-pub-wood p-4 md:p-8 flex flex-col justify-center max-w-6xl mx-auto">
        <KnockoutWinnerScreen roomState={roomState} />
      </div>
    );
  }

  // If Round Transition is active, show the TV Round Splash Screen!
  if (roomState.status === 'round_transition' && currentRound) {
    return (
      <div className="min-h-screen bg-pub-wood p-6 flex flex-col justify-center max-w-6xl mx-auto">
        <RoundTransitionScreen
          round={currentRound}
          roundIndex={roomState.currentRoundIndex}
          totalRounds={roomState.rounds.length}
        />
      </div>
    );
  }

  // If Milestone Intermission is active, show the 10-Question TV Podium!
  if (roomState.status === 'milestone_intermission') {
    return <TVMilestoneIntermission roomState={roomState} />;
  }

  // Calculate global question count
  let globalQNum = 0;
  for (let i = 0; i < roomState.currentRoundIndex; i++) {
    globalQNum += roomState.rounds[i].questions.length;
  }
  globalQNum += roomState.currentQuestionIndex + 1;

  let totalQuestionsAcrossRounds = 0;
  roomState.rounds.forEach((r) => {
    totalQuestionsAcrossRounds += r.questions.length;
  });

  const teamsList: Team[] = Object.values(roomState.teams) as Team[];
  const submittedCount = Object.keys(roomState.submissions).length;
  const isMusic = currentRound?.type === 'music' || !!currentQ?.musicData;

  const timerRatio = roomState.timerTotal > 0 ? (roomState.timerRemaining / roomState.timerTotal) * 100 : 0;
  const timerColor =
    roomState.timerRemaining <= 5
      ? 'bg-red-500'
      : roomState.timerRemaining <= 10
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="min-h-screen bg-pub-wood text-stone-900 flex flex-col justify-between p-4 md:p-8 select-none font-sans">
      {/* Top TV Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-[#fffdf8] rounded-2xl p-4 md:p-6 border-4 border-amber-800 shadow-[0_8px_0_#451a03]">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl md:text-3xl border-2 border-amber-900 shadow-md">
            🍻
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider border border-amber-800/40">
                {currentRound?.title || 'Pub Quiz Round'}
              </span>
              <span className="text-xs font-bold text-stone-600">
                Question {globalQNum} of {totalQuestionsAcrossRounds}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-amber-950 tracking-wide mt-0.5">
              THE CARTOON PUB QUIZ
            </h1>
            {roomState.settings?.knockoutMode && (
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-100 text-red-950 text-xs font-black uppercase tracking-wider border border-red-400 animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    {roomState.isSuddenDeathTiebreaker ? '⚡ Sudden Death Tiebreaker' : '🔥 Knockout Mode'}: {teamsList.filter((t) => !t.isEliminated).length} / {teamsList.length} Alive • Must Have 1 Winner!
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Room Code Callout for TV Screen */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-amber-100/90 px-4 md:px-6 py-2.5 rounded-xl border-2 border-amber-800 shadow-sm">
            <div className="text-right">
              <span className="block text-[10px] md:text-xs font-black text-stone-600 uppercase tracking-widest">
                Join with Code
              </span>
              <span className="text-xl md:text-3xl font-black text-amber-950 tracking-widest font-mono">
                {roomState.code}
              </span>
            </div>
            <div className="h-8 w-px bg-amber-800/30" />
            <div className="text-left">
              <span className="block text-[10px] md:text-xs font-black text-stone-600 uppercase">
                Mobile Lobby
              </span>
              <span className="text-xs md:text-sm font-bold text-stone-800">
                Enter Code on Phone
              </span>
            </div>
          </div>

          <BGMController />

          {onExitTV && (
            <button
              onClick={onExitTV}
              className="px-3 py-2 rounded-xl bg-amber-100 border border-amber-800 text-xs font-bold text-stone-800 hover:bg-white cursor-pointer shadow-sm"
            >
              Exit TV View
            </button>
          )}
        </div>
      </header>

      {/* Main TV Stage Area */}
      <main className="my-6 flex-1 flex flex-col justify-center">
        {roomState.status === 'lobby' ? (
          <div className="text-center max-w-3xl mx-auto bg-[#fffdf8] rounded-3xl p-8 md:p-14 border-4 border-amber-800 shadow-[0_10px_0_#451a03]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-amber-100 border-3 border-amber-800 flex items-center justify-center text-5xl animate-bounce">
              🍺
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-amber-950 mb-4">
              Welcome to the Pub!
            </h2>
            <p className="text-base md:text-xl text-stone-700 font-bold mb-6">
              Grab your drinks! Join on your mobile phone by entering lobby code{' '}
              <strong className="text-amber-950 px-3 py-1 rounded-lg bg-amber-200 border-2 border-amber-800 font-mono text-2xl">
                {roomState.code}
              </strong>
            </p>
            <div className="flex justify-center mb-6">
              <RoomJoinQR roomCode={roomState.code} size={180} />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-stone-800 text-sm font-bold border border-amber-800/40 mb-6">
              <Users className="w-4 h-4 text-amber-700" />
              <span>{teamsList.length} of {roomState.settings?.maxTeams || 40} Teams Connected • Waiting for Quiz Master to start</span>
            </div>

            {/* Teams Roster on TV Lobby */}
            {teamsList.length > 0 && (
              <div className="text-left border-t border-amber-800/30 pt-6">
                <div className="flex items-center justify-between mb-3 text-xs font-black uppercase tracking-wider text-stone-600">
                  <span>Registered Teams</span>
                  <span className="text-amber-900 font-black">{teamsList.length} Active</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {teamsList.map((team, idx) => (
                    <div
                      key={team.id}
                      className="p-2.5 rounded-xl bg-amber-50 border border-amber-800/30 flex items-center gap-2"
                    >
                      <span className="text-lg shrink-0">{team.avatar}</span>
                      <div className="truncate">
                        <span className="font-extrabold text-stone-900 text-xs block truncate">{team.name}</span>
                        <span className="text-[10px] text-stone-500 font-mono">Team #{idx + 1}</span>
                        <span className="text-[10px] text-emerald-700 font-bold block">{team.connectedPlayers || 0} player{team.connectedPlayers === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full space-y-6">
            {/* Question Card */}
            <div className="bg-[#fffdf8] rounded-3xl p-6 md:p-10 border-4 border-amber-800 shadow-[0_10px_0_#451a03] relative overflow-hidden">
              {/* Category Pill & Points */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs md:text-sm font-black uppercase tracking-wider border-2 border-amber-900">
                    {currentQ?.category || 'General Knowledge'}
                  </span>
                  {isMusic && (
                    <span className="px-3.5 py-1 rounded-full bg-pink-500 text-white text-xs md:text-sm font-black uppercase tracking-wider border-2 border-pink-900 flex items-center gap-1.5 animate-pulse">
                      <Music className="w-4 h-4" />
                      Music & Audio Round
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm font-black text-amber-950 px-3 py-1 rounded-lg bg-amber-100 border border-amber-800/50">
                    ★ {currentQ?.points || 10} Points
                  </span>
                  <div className="flex items-center gap-1.5 text-xs md:text-sm font-black text-stone-800 px-3 py-1 rounded-lg bg-amber-100 border border-amber-800/50">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>{roomState.timerRemaining}s</span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-stone-900 leading-snug tracking-tight text-center md:text-left py-2">
                {currentQ?.prompt}
              </h2>

              {/* Music or Picture Round Clues Showcase */}
              {(currentQ?.imageUrl || (currentQ?.musicData?.cluePictures && currentQ.musicData.cluePictures.length > 0)) && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-800/30 flex flex-col md:flex-row items-center gap-6">
                  <div className="relative rounded-2xl overflow-hidden border-3 border-amber-800 max-h-64 shadow-xl">
                    <img
                      src={
                        currentQ.imageUrl ||
                        currentQ.musicData?.cluePictures?.[activeClueIndex] ||
                        ''
                      }
                      alt="Round Clue"
                      className="object-cover max-h-60 rounded-xl"
                    />
                    {currentQ.musicData?.cluePictures && currentQ.musicData.cluePictures.length > 1 && (
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                        {currentQ.musicData.cluePictures.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveClueIndex(i)}
                            className={`w-3 h-3 rounded-full border border-black cursor-pointer ${
                              i === activeClueIndex ? 'bg-amber-400 scale-125' : 'bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-left space-y-2">
                    <span className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Visual Clue
                    </span>
                    <p className="text-sm md:text-base text-stone-700 font-bold">
                      Examine the visual clues carefully to identify the artist, song, or pub trivia answer!
                    </p>
                    {isMusic && (
                      <div className="flex items-center gap-2 text-xs font-bold text-pink-900 bg-pink-100 p-2.5 rounded-xl border border-pink-400">
                        <Disc3 className="w-4 h-4 text-pink-600 animate-spin" />
                        <span>Song audio is playing live! Identify song title & artist.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Animated Live Audio Soundwave for Music Round */}
              {isMusic && (
                <div className="mt-4 p-4 rounded-2xl bg-pink-50 border-2 border-pink-400 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center font-black">
                      <Volume2 className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-pink-900 uppercase tracking-wider block">
                        Live Song Riff Playing
                      </span>
                      <span className="text-xs text-stone-700 font-bold">
                        Listen to the intro melody & buzz in with your team!
                      </span>
                    </div>
                  </div>

                  {/* Equalizer bars animation */}
                  <div className="flex items-end gap-1.5 h-8">
                    {[12, 24, 16, 32, 20, 28, 14, 30, 22, 18].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full bg-pink-500 animate-pulse"
                        style={{
                          height: `${roomState.musicPlaying ? h : 6}px`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Options Grid (4 Multiple Choice Options) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {currentQ?.options?.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isCorrect = option === currentQ.correctAnswer;
                  const isAnswerRevealed = roomState.status === 'answer_reveal';

                  let cardStyle = 'bg-amber-50/90 border-amber-800/40 text-stone-900';
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      cardStyle =
                        'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-[0_6px_0_#065f46] scale-[1.02]';
                    } else {
                      cardStyle = 'bg-stone-100 border-stone-300 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl border-3 font-bold transition-all text-base md:text-xl ${cardStyle}`}
                    >
                      <div
                        className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-base md:text-lg font-black border-2 shrink-0 ${
                          isAnswerRevealed && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-800'
                            : 'bg-amber-200 text-amber-950 border-amber-800/40'
                        }`}
                      >
                        {isAnswerRevealed && isCorrect ? '✓' : letter}
                      </div>
                      <span className="truncate">{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Reveal Explanation Banner */}
              {roomState.status === 'answer_reveal' && currentQ?.explanation && (
                <div className="mt-6 p-4 md:p-5 rounded-2xl bg-amber-100 border-2 border-amber-800 text-amber-950 text-sm md:text-base font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-6 h-6 text-amber-700 shrink-0" />
                  <div>
                    <strong className="text-stone-900">Correct Answer: {currentQ.correctAnswer}</strong>
                    <p className="text-xs md:text-sm text-stone-700 mt-0.5">{currentQ.explanation}</p>
                  </div>
                </div>
              )}

              {/* Knockout Round Elimination Summary Banner */}
              {roomState.status === 'answer_reveal' && roomState.settings?.knockoutMode && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-100 border-2 border-amber-800 flex items-center justify-between text-xs md:text-sm animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2.5">
                    <Skull className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <span className="font-black text-red-900 uppercase tracking-wider block">
                        Knockout Elimination Status
                      </span>
                      <span className="text-stone-700 font-bold">
                        {roomState.lastKnockoutEliminations && roomState.lastKnockoutEliminations.length > 0
                          ? `${roomState.lastKnockoutEliminations.length} team(s) knocked out on this question!`
                          : 'No teams eliminated on this question (Stalemate or all correct) — Battle continues!'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-stone-600 block font-bold">Survivors Alive</span>
                    <span className="text-base md:text-lg font-black text-amber-950">
                      {teamsList.filter((t) => !t.isEliminated).length} / {teamsList.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Timer Progress Bar */}
              <div className="mt-6 w-full bg-amber-100 rounded-full h-3.5 overflow-hidden border border-amber-800/50 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-linear ${timerColor}`}
                  style={{ width: `${timerRatio}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Live Bottom Team Ticker */}
      <footer className="bg-[#fffdf8] rounded-2xl p-4 border-4 border-amber-800 shadow-[0_6px_0_#451a03] text-stone-900">
        <div className="flex items-center justify-between gap-4 mb-2 border-b border-amber-800/30 pb-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-950 tracking-wider">
            <Users className="w-4 h-4 text-amber-700" />
            <span>Live Pub Teams ({teamsList.length})</span>
            {roomState.settings?.knockoutMode && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-950 text-[10px] font-black border border-red-400">
                {teamsList.filter((t) => !t.isEliminated).length} Alive • Must Have 1 Winner
              </span>
            )}
          </div>

          <div className="text-xs font-bold text-stone-600">
            Submissions: <strong className="text-emerald-700 font-black">{submittedCount}</strong> / {teamsList.length}
          </div>
        </div>

        {/* Horizontal Team Pill List */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {teamsList.length === 0 ? (
            <span className="text-xs text-stone-500 italic">No teams have joined yet...</span>
          ) : (
            teamsList.map((team) => {
              const hasSubmitted = !!roomState.submissions[team.id];

              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-2 shrink-0 transition-all ${
                    team.isEliminated
                      ? 'bg-red-50 border-red-300 text-stone-400 opacity-60'
                      : hasSubmitted
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                      : 'bg-amber-50 border-amber-800/40 text-stone-800'
                  }`}
                >
                  <span className="text-lg">{team.avatar}</span>
                  <span
                    className={`text-xs md:text-sm font-bold truncate max-w-[120px] ${
                      team.isEliminated ? 'line-through text-stone-400' : ''
                    }`}
                  >
                    {team.name}
                  </span>
                  <span className="text-xs font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                    {team.score}
                  </span>
                  {team.isEliminated ? (
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-red-600 text-white flex items-center gap-0.5">
                      <Skull className="w-2.5 h-2.5" />
                      <span>Out</span>
                    </span>
                  ) : hasSubmitted ? (
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                      Locked In
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </footer>
    </div>
  );
};
