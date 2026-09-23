import React, { useEffect, useState } from 'react';
import { Check, Send, Music, Clock, Sparkles, Trophy, Disc3, Radio, Skull, Flame, Crown } from 'lucide-react';
import { RoomState, Team } from '../types';
import { RoundTransitionScreen } from './RoundTransitionScreen';
import { audioSynth } from '../utils/audioSynth';
import { CartoonBeerStein, CartoonPopBurst, CartoonTrophy } from './CartoonIllustrations';

interface Props {
  roomState: RoomState;
  myTeamId: string;
  onSubmitAnswer: (answer: string) => void;
}

export const PlayerMobileView: React.FC<Props> = ({ roomState, myTeamId, onSubmitAnswer }) => {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const team = roomState.teams[myTeamId];
  const currentRound = roomState.rounds[roomState.currentRoundIndex];
  const currentQ = currentRound?.questions[roomState.currentQuestionIndex];
  const submission = roomState.submissions[myTeamId];

  // Calculate team rank
  const allTeams = (Object.values(roomState.teams) as Team[]).sort((a, b) => b.score - a.score);
  const myRank = allTeams.findIndex((t) => t.id === myTeamId) + 1;

  const handleSelectOption = (option: string) => {
    if (submission || roomState.status === 'answer_reveal' || roomState.timerRemaining <= 0) return;
    setSelectedOption(option);
    audioSynth.playCorrectFx();
    onSubmitAnswer(option);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim() || submission || roomState.status === 'answer_reveal') return;
    audioSynth.playCorrectFx();
    onSubmitAnswer(typedAnswer.trim());
    setTypedAnswer('');
  };

  const isMusic = currentRound?.type === 'music' || !!currentQ?.musicData;
  const isAnswerRevealed = roomState.status === 'answer_reveal';
  const isCorrect = submission?.isCorrect;
  const isKnockout = !!roomState.settings.knockoutMode;
  const isEliminated = !!team?.isEliminated;

  useEffect(() => {
    setSelectedOption(null);
    setTypedAnswer('');
  }, [currentQ?.id]);

  // Pre-game Lobby Waiting Screen for Players on Mobile
  if (roomState.status === 'lobby') {
    return (
      <div className="max-w-md mx-auto p-5 sm:p-6 bg-[#fffdf8] rounded-3xl border-4 border-amber-800 shadow-[0_8px_0_#451a03] text-center text-stone-900 space-y-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl sm:text-4xl font-black border-3 border-amber-900 shadow-md">
          {team?.avatar || '🍺'}
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider border border-amber-800/40">
            Pub Quiz Room: {roomState.code}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-amber-950 mt-2">
            Welcome, {team?.name || 'Player'}!
          </h2>
          <p className="text-xs text-stone-700 font-bold mt-1">
            You are checked in and ready to play at the tavern. {team?.connectedPlayers || 1} player{team?.connectedPlayers === 1 ? '' : 's'} joined this team.
          </p>
        </div>

        {isKnockout && (
          <div className="p-3 rounded-2xl bg-amber-100 border border-amber-400 flex items-center justify-center gap-2 text-amber-950 text-xs font-bold">
            <Flame className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Knockout Mode Enabled • Must Have 1 Winner!</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-800/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-bold">Total Teams Checked In:</span>
            <span className="font-black text-amber-900">{allTeams.length} / {roomState.settings.maxTeams || 40}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-bold">Quiz Rounds:</span>
            <span className="font-black text-stone-900">{roomState.rounds.length} Rounds</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-100/90 border border-amber-800/30 text-xs text-amber-950 font-bold flex items-center justify-center gap-2 animate-pulse">
          <Clock className="w-4 h-4 text-amber-800 shrink-0" />
          <span>Waiting for the Quiz Master to start Round 1...</span>
        </div>
      </div>
    );
  }

  // Knockout Sole Winner Screen on Mobile Phone
  if (roomState.status === 'knockout_winner') {
    const isWinner = roomState.knockoutWinnerTeamId === myTeamId;
    const winnerTeam = roomState.knockoutWinnerTeamId ? roomState.teams[roomState.knockoutWinnerTeamId] : null;

    return (
      <div className="max-w-md mx-auto p-6 bg-[#fffdf8] rounded-3xl border-4 border-amber-800 text-center text-stone-900 space-y-6 shadow-[0_8px_0_#451a03] animate-in zoom-in-95 duration-300">
        <div className="relative inline-block">
          <Crown className="w-12 h-12 text-amber-600 mx-auto animate-pulse" />
          <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center text-5xl font-black border-3 border-amber-900 shadow-lg mt-2">
            {isWinner ? team?.avatar || '🏆' : winnerTeam?.avatar || '🏆'}
          </div>
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider border border-amber-800/40">
            Knockout Finale • 1 Sole Winner
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-amber-950">
            {isWinner ? '👑 YOU WON THE PUB KNOCKOUT!' : `${winnerTeam?.name || 'Sole Survivor'} Won!`}
          </h2>
          <p className="text-xs md:text-sm text-stone-700 font-bold">
            {isWinner
              ? 'Congratulations! You outlasted every opponent in the pub to take home the crown!'
              : `Great game! Your team finished Rank #${myRank} with ${team?.score || 0} pts.`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-800/30 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600 font-bold">
            <span>Your Team:</span>
            <strong className="text-stone-900">{team?.name}</strong>
          </div>
          <div className="flex justify-between text-stone-600 font-bold">
            <span>Your Score:</span>
            <strong className="text-amber-900">{team?.score || 0} pts</strong>
          </div>
          <div className="flex justify-between text-stone-600 font-bold">
            <span>Knockout Status:</span>
            <strong className={isWinner ? 'text-emerald-700' : 'text-red-700'}>
              {isWinner ? 'Sole Undefeated Champion' : 'Knocked Out'}
            </strong>
          </div>
        </div>

        <p className="text-xs text-stone-600 italic font-medium">
          Look at the big TV screen for the full awards ceremony! 🍻
        </p>
      </div>
    );
  }

  // Round Transition Screen on Mobile
  if (roomState.status === 'round_transition' && currentRound) {
    return (
      <div className="max-w-md mx-auto">
        <RoundTransitionScreen
          round={currentRound}
          roundIndex={roomState.currentRoundIndex}
          totalRounds={roomState.rounds.length}
        />
      </div>
    );
  }

  // Milestone Screen on Mobile Phone
  if (roomState.status === 'milestone_intermission') {
    return (
      <div className="max-w-md mx-auto p-5 bg-[#fffdf8] rounded-3xl border-4 border-amber-800 text-center text-stone-900 space-y-5 shadow-[0_8px_0_#451a03]">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black border-2 border-amber-900 animate-bounce">
          🏆
        </div>
        <h2 className="text-2xl font-black text-amber-950">10-Question Milestone!</h2>
        <p className="text-sm text-stone-700 font-bold">
          Look up at the TV screen for the full team progression & podium!
        </p>

        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-800/40 space-y-2">
          <div className="text-xs font-bold text-stone-600">Your Team Standing</div>
          <div className="text-2xl font-black text-amber-950 flex items-center justify-center gap-2">
            <span>{team?.avatar || '🍺'}</span>
            <span>{team?.name || 'Your Team'}</span>
          </div>
          <div className="text-base font-black text-stone-900">
            Score: <span className="text-amber-900">{team?.score || 0} pts</span> • Rank: #{myRank || 1}
          </div>
        </div>

        <div className="text-xs text-stone-600 italic font-medium">
          Quiz Master will resume in a moment. Grab another round at the bar! 🍻
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 pb-6 font-comic">
      {/* Mobile Top Status Card - Cartoon Arcade Style */}
      <div className="bg-[#fffdf8] rounded-3xl p-3.5 sm:p-4 border-4 border-amber-800 shadow-[0_6px_0_#451a03] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl border-3 border-amber-950 shadow-[0_3px_0_#78350f] animate-beer-slosh shrink-0">
            {team?.avatar || '🍺'}
          </div>
          <div>
            <span className="text-sm font-cartoon text-stone-900 block truncate max-w-[140px] tracking-wide">
              {team?.name || 'My Team'}
            </span>
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              🏆 Rank #{myRank || 1} of {allTeams.length}
            </span>
            {isKnockout && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-cartoon uppercase px-2 py-0.5 rounded-full mt-1 ${
                  isEliminated
                    ? 'bg-rose-500 text-white border border-rose-950 shadow-sm'
                    : 'bg-amber-400 text-slate-950 border border-amber-950 shadow-sm animate-pulse'
                }`}
              >
                {isEliminated ? (
                  <>
                    <Skull className="w-3 h-3" />
                    <span>Knocked Out</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3 h-3 fill-current" />
                    <span>Alive in Knockout</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="text-right">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Score</span>
            <span className="text-base sm:text-lg font-cartoon text-amber-950 drop-shadow-sm">{team?.score || 0} PTS</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-2xl border-2 border-amber-800 text-sm font-cartoon text-stone-900 shadow-inner">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>{roomState.timerRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Main Question Card on Mobile */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-5 border-4 border-amber-800 shadow-[0_8px_0_#451a03] space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full cartoon-btn-amber text-[11px] font-cartoon uppercase tracking-wider shadow-sm">
            {currentQ?.category || 'Trivia'}
          </span>
          <span className="text-xs font-cartoon text-amber-950 bg-amber-100 px-2.5 py-1 rounded-xl border-2 border-amber-800/40">
            QUESTION {roomState.currentQuestionIndex + 1}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug">
          {currentQ?.prompt}
        </h3>

        {/* Spectator callout if knocked out */}
        {isKnockout && isEliminated && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-3 border-rose-500 text-rose-950 text-xs flex items-center gap-3 animate-hop">
            <Skull className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-cartoon text-rose-700 uppercase tracking-wider text-xs">
                Spectator Mode (Knocked Out)
              </strong>
              <span className="text-[11px] text-rose-900 font-medium">
                You were knocked out ({team?.eliminatedReason || 'Incorrect Answer'}). You can still guess along for fun!
              </span>
            </div>
          </div>
        )}

        {/* Music Clue or Picture round display on phone */}
        {(currentQ?.imageUrl || currentQ?.musicData?.cluePictures?.[0]) && (
          <div className="rounded-2xl overflow-hidden border-3 border-amber-800/40 max-h-44 shadow-md">
            <img
              src={currentQ.imageUrl || currentQ.musicData?.cluePictures?.[0]}
              alt="Clue"
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        {isMusic && (
          <div className="p-3.5 rounded-2xl cartoon-btn-pink flex items-center justify-between text-xs font-cartoon animate-rubberband">
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 animate-spin" />
              <span>Music Round Live on TV!</span>
            </div>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded-xl bg-white/20">
              Listen & Guess
            </span>
          </div>
        )}

        {/* Result banner after host reveals answer */}
        {isAnswerRevealed && (
          <div
            className={`p-4 rounded-2xl border-4 text-center space-y-1.5 animate-rubberband duration-200 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-[0_5px_0_#064e3b]'
                : 'bg-rose-50 border-rose-500 text-rose-950 shadow-[0_5px_0_#4c0519]'
            }`}
          >
            <div className="text-3xl animate-boing">{isCorrect ? '🎉 🍻 🌟' : '🦉 💫'}</div>
            <div className="font-cartoon text-lg sm:text-xl">
              {isCorrect ? 'CORRECT! FULL POINTS!' : 'NICE TRY, TEAM!'}
            </div>
            <div className="text-xs font-bold text-stone-700">
              Answer: <strong className="text-amber-950 text-sm font-cartoon">{currentQ?.correctAnswer}</strong>
            </div>
          </div>
        )}

        {/* Lock-in confirmation if answer already submitted and waiting */}
        {submission && !isAnswerRevealed && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-3 border-emerald-500 text-center space-y-1.5 shadow-[0_4px_0_#064e3b] animate-rubberband">
            <div className="text-emerald-900 font-cartoon text-base flex items-center justify-center gap-2">
              <Check className="w-5 h-5 stroke-[3] animate-bounce" />
              <span>ANSWER LOCKED IN!</span>
            </div>
            <div className="text-xs text-stone-800">
              Your guess: <strong className="text-amber-900 font-bold">{submission.answer}</strong>
            </div>
            <p className="text-[11px] text-stone-600 font-medium">
              Look up at the TV screen for real-time pub scoreboard updates! 📺
            </p>
          </div>
        )}

        {/* Answering Controls: Multiple Choice vs Free-text Typing */}
        {!submission && !isAnswerRevealed && (
          <div>
            {roomState.settings.answerMode === 'free_text' ? (
              /* Free-text Typing Mode */
              <form onSubmit={handleTypeSubmit} className="space-y-3 pt-2">
                <input
                  type="text"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type your team's answer here..."
                  className="w-full bg-white border-3 border-amber-800 focus:border-amber-900 rounded-2xl p-3.5 text-base font-bold text-stone-900 placeholder:text-stone-400 outline-none shadow-inner"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!typedAnswer.trim()}
                  className="w-full py-4 rounded-2xl cartoon-btn-amber text-base font-cartoon tracking-wider disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5 stroke-[2.5]" />
                  <span>LOCK IN TEAM ANSWER!</span>
                </button>
              </form>
            ) : (
              /* Multiple Choice 4 Cartoon Buttons with Colorful Palette */
              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentQ?.options?.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOption === option;

                  // 4 distinct cartoon theme buttons
                  const colorThemes = [
                    {
                      btn: 'cartoon-btn-pink',
                      badge: 'bg-pink-900/60 text-white',
                    },
                    {
                      btn: 'cartoon-btn-cyan',
                      badge: 'bg-sky-950/60 text-cyan-200',
                    },
                    {
                      btn: 'cartoon-btn-amber',
                      badge: 'bg-amber-950/60 text-amber-200',
                    },
                    {
                      btn: 'cartoon-btn-emerald',
                      badge: 'bg-emerald-950/60 text-emerald-200',
                    },
                  ];

                  const theme = colorThemes[idx % colorThemes.length];

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className={`min-h-[56px] w-full p-3.5 rounded-2xl border-3 font-bold text-left text-sm flex items-center gap-3 transition cursor-pointer active:scale-98 ${
                        isSelected
                          ? 'cartoon-btn-amber scale-102 ring-4 ring-yellow-400/50'
                          : `${theme.btn} text-white`
                      }`}
                    >
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-cartoon text-base shrink-0 border-2 border-white/30 shadow-inner ${theme.badge}`}
                      >
                        {letter}
                      </span>
                      <span className="break-words font-extrabold leading-snug flex-1 drop-shadow-sm text-sm sm:text-base">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
