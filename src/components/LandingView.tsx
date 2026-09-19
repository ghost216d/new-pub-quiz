import React, { useState } from 'react';
import { Play, Tv, Users, Sparkles, ArrowRight, ShieldAlert, KeyRound, Dices, Flame, Target } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import {
  CartoonBeerStein,
  CartoonSwingingPubSign,
  CartoonDartboard,
  CartoonQuizMaster,
  CartoonBunting,
  CartoonPopBurst,
  CartoonTrophy,
} from './CartoonIllustrations';
import { TEAM_AVATARS, PUB_LEGEND_TEAM_NAMES } from '../data/teamPresets';

interface Props {
  onHostGame: (
    hostName: string,
    maxTeams?: number,
    prePopulateScheme?: 'none' | 'tables' | 'pub_legends'
  ) => void;
  onJoinGame: (code: string, teamName: string, avatar: string, selectedTeamId?: string) => void;
  onConnectTV: (code: string) => void;
  onStartSolo: () => void;
  initialMode?: 'join' | 'host' | 'tv';
  showSoloHero?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const LandingView: React.FC<Props> = ({
  onHostGame,
  onJoinGame,
  onConnectTV,
  onStartSolo,
  initialMode = 'join',
  showSoloHero = true,
  isLoading = false,
  error = null,
}) => {
  const [mode, setMode] = useState<'join' | 'host' | 'tv'>(initialMode);
  const [roomCode, setRoomCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🍺');
  const [hostName, setHostName] = useState('Quiz Master Dave');
  const [maxTeams, setMaxTeams] = useState(40);
  const [prePopulateScheme, setPrePopulateScheme] = useState<'none' | 'tables' | 'pub_legends'>('none');

  const handleRandomName = () => {
    const randomName = PUB_LEGEND_TEAM_NAMES[Math.floor(Math.random() * PUB_LEGEND_TEAM_NAMES.length)];
    const randomAvatar = TEAM_AVATARS[Math.floor(Math.random() * TEAM_AVATARS.length)];
    setTeamName(randomName);
    setSelectedAvatar(randomAvatar);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !teamName.trim()) return;
    onJoinGame(roomCode.trim().toUpperCase(), teamName.trim(), selectedAvatar);
  };

  const handleHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onHostGame(hostName.trim() || 'Quiz Master Dave', maxTeams, prePopulateScheme);
  };

  const handleTVSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    onConnectTV(roomCode.trim().toUpperCase());
  };

  return (
    <div className="max-w-xl mx-auto space-y-2.5 sm:space-y-3.5 select-none animate-pop-in pb-4 px-1 sm:px-0">
      {/* 1. SOLO PLAYER OPTION - PROMINENTLY AT THE VERY TOP OF THE PAGE */}
      {showSoloHero && <div className="relative overflow-hidden bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 rounded-3xl p-3 sm:p-3.5 border-4 border-amber-950 shadow-[0_6px_0_#451a03] transition hover:scale-[1.01] animate-rubberband">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-3 border-amber-950 shrink-0 animate-boing">
              🗺️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-cartoon text-amber-950 leading-tight">
                  SOLO PUB QUEST
                </h3>
                <CartoonPopBurst text="INSTANT PLAY!" color="yellow" className="text-[9px] sm:text-[10px] py-0.5 px-1.5" />
              </div>
              <p className="text-[10px] sm:text-xs text-stone-700 font-bold truncate sm:whitespace-normal">
                5 Cartoon Realms, 3 Lives ❤️, Pub Bucks 🪙 & Boss Trivia!
              </p>
            </div>
          </div>

          <button
            id="play-solo-top-btn"
            onClick={onStartSolo}
            className="shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl cartoon-btn-amber text-xs sm:text-sm font-cartoon tracking-wider flex items-center gap-1 cursor-pointer shadow-md min-h-[42px] hover:scale-105 active:scale-95 transition-transform"
          >
            <span>PLAY SOLO!</span>
            <span className="text-sm sm:text-base animate-bounce">➔</span>
          </button>
        </div>
      </div>}

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-rose-100 border-3 border-rose-600 text-rose-950 text-xs font-black shadow-[0_3px_0_#4c0519] animate-shake">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. TRADITIONAL ENGLISH PUB CARTOON HEADER (Sleek Mobile Sizing) */}
      <div className="relative text-center bg-gradient-to-b from-[#78350f] via-[#92400e] to-[#78350f] px-2.5 pt-2.5 pb-2.5 sm:px-5 sm:pt-4 sm:pb-4 rounded-3xl border-4 border-amber-950 shadow-[0_6px_0_#451a03] overflow-hidden">
        {/* Draped British Party Bunting across top */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <CartoonBunting />
        </div>

        {/* Animated English Pub Props: Foaming Ale Pint & Bullseye Dartboard */}
        <div className="absolute top-3 left-2 hidden sm:block animate-beer-slosh">
          <CartoonBeerStein size={44} />
        </div>
        <div className="absolute top-3 right-2 hidden sm:block animate-float">
          <CartoonDartboard size={44} />
        </div>

        {/* Swinging English Tavern Pub Sign */}
        <div className="pt-1.5 sm:pt-2">
          <CartoonSwingingPubSign
            pubName="THE RED LION"
            subTitle="PROPER ENGLISH PUB QUIZ"
          />
        </div>

        {/* Cheerful Landlord Dialogue */}
        <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-xl border-2 border-amber-950 shadow-[0_2px_0_#451a03] font-bold text-[10px] sm:text-xs">
          <span className="text-xs sm:text-sm animate-bounce">🍺</span>
          <span>"Right then guv'nor! Fancy testing your grey matter tonight?"</span>
          <span className="text-xs sm:text-sm animate-bounce">🎯</span>
        </div>
      </div>

      {/* 3. MULTIPLAYER LOBBY SECTION - DIVIDER & MODE TABS */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-cartoon text-amber-950 uppercase tracking-widest bg-amber-200/70 py-0.5 px-3 rounded-full border border-amber-800/40 w-fit mx-auto shadow-sm">
          <span>OR PLAY LIVE WITH MATES AT THE PUB (UP TO 40 TEAMS)</span>
        </div>

        {/* Arcade Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 sm:p-1.5 bg-amber-950/30 rounded-2xl border-3 border-amber-900/60 shadow-inner">
          <button
            id="mode-join-tab-btn"
            onClick={() => setMode('join')}
            className={`py-2 sm:py-2.5 px-1 rounded-xl text-xs sm:text-sm font-cartoon flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer min-h-[42px] ${
              mode === 'join'
                ? 'cartoon-btn-cyan'
                : 'bg-amber-50/90 text-stone-800 border-2 border-amber-800/40 hover:bg-white shadow-sm'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5]" />
            <span>JOIN LOBBY</span>
          </button>

          <button
            id="mode-host-tab-btn"
            onClick={() => setMode('host')}
            className={`py-2 sm:py-2.5 px-1 rounded-xl text-xs sm:text-sm font-cartoon flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer min-h-[42px] ${
              mode === 'host'
                ? 'cartoon-btn-amber'
                : 'bg-amber-50/90 text-stone-800 border-2 border-amber-800/40 hover:bg-white shadow-sm'
            }`}
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-current" />
            <span>HOST QUIZ</span>
          </button>

          <button
            id="mode-tv-tab-btn"
            onClick={() => setMode('tv')}
            className={`py-2 sm:py-2.5 px-1 rounded-xl text-xs sm:text-sm font-cartoon flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer min-h-[42px] ${
              mode === 'tv'
                ? 'cartoon-btn-purple'
                : 'bg-amber-50/90 text-stone-800 border-2 border-amber-800/40 hover:bg-white shadow-sm'
            }`}
          >
            <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5]" />
            <span>TV DISPLAY</span>
          </button>
        </div>
      </div>

      {/* 4. COMPACT TAB PANELS FOR MOBILE (Warm Tavern Parchment Board) */}
      <div className="bg-[#fffdf8] rounded-3xl p-3 sm:p-5 border-4 border-amber-800 shadow-[0_6px_0_#451a03] text-stone-900">
        {mode === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-cartoon text-amber-950 uppercase tracking-wider">
                  Pub Room Code
                </label>
                <span className="text-[10px] font-bold text-stone-500">Ask Quiz Master for code</span>
              </div>
              <div className="relative">
                <input
                  id="join-room-code-input"
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PINT"
                  className="w-full bg-amber-50/90 border-3 border-amber-800 focus:border-amber-600 focus:bg-white rounded-2xl p-2.5 sm:p-3 text-xl sm:text-2xl font-cartoon font-black text-center text-amber-950 tracking-widest uppercase outline-none shadow-inner"
                  required
                />
                <KeyRound className="w-4 h-4 text-amber-800/60 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-cartoon text-amber-950 uppercase tracking-wider">
                  Team Name
                </label>
                <button
                  type="button"
                  onClick={handleRandomName}
                  className="px-2 py-0.5 rounded-lg cartoon-btn-pink text-[10px] font-cartoon flex items-center gap-1 transition cursor-pointer"
                  title="Generate a classic English pub team name"
                >
                  <Dices className="w-3 h-3" />
                  <span>RANDOM NAME!</span>
                </button>
              </div>
              <input
                id="join-team-name-input"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. The Crafty Foxes, Table 7, Pint Pals"
                className="w-full bg-amber-50/90 border-3 border-amber-800/60 focus:border-cyan-600 focus:bg-white rounded-2xl p-2.5 text-xs sm:text-sm font-bold text-stone-900 outline-none shadow-inner placeholder:text-stone-400"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-cartoon text-amber-950 uppercase tracking-wider">
                  Choose Avatar Mascot
                </label>
                <span className="text-xl animate-bounce">{selectedAvatar}</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin py-0.5">
                {TEAM_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-lg sm:text-xl flex items-center justify-center border-2 transition cursor-pointer shrink-0 ${
                      selectedAvatar === av
                        ? 'bg-gradient-to-b from-amber-300 to-yellow-500 border-amber-950 scale-105 shadow-[0_2px_0_#78350f]'
                        : 'bg-amber-100/70 border-amber-800/30 hover:border-cyan-600 text-stone-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="join-room-submit-btn"
              type="submit"
              disabled={isLoading || !roomCode.trim() || !teamName.trim()}
              className="w-full py-3 sm:py-3.5 rounded-2xl cartoon-btn-cyan text-sm sm:text-base font-cartoon tracking-wider disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 mt-1"
            >
              <span>ENTER PUB LOBBY!</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </form>
        )}

        {mode === 'host' && (
          <form onSubmit={handleHostSubmit} className="space-y-3">
            <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-amber-100 to-amber-50 rounded-2xl border-2 border-amber-800/60 shadow-sm text-stone-900">
              <CartoonQuizMaster size={42} className="shrink-0 animate-wobble" />
              <div>
                <span className="text-[11px] font-cartoon text-amber-950 uppercase tracking-wide block">Be The Quiz Master</span>
                <p className="text-[11px] text-stone-700 font-bold leading-tight">
                  Control pacing, live leaderboards, and audio rounds for up to 40 pub tables!
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-cartoon text-amber-950 uppercase tracking-wider mb-1">
                Quiz Master Name
              </label>
              <input
                id="host-name-input"
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Quiz Master Dave"
                className="w-full bg-amber-50/90 border-3 border-amber-800/60 focus:border-amber-600 focus:bg-white rounded-2xl p-2.5 text-xs sm:text-sm font-bold text-stone-900 outline-none shadow-inner placeholder:text-stone-400"
              />
            </div>

            {/* UP TO 40 TEAMS CAPACITY */}
            <div className="p-3 rounded-2xl bg-amber-50/90 border-2 border-amber-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-cartoon text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-800" />
                  <span>Max Capacity: Up To 40 Teams</span>
                </label>
                <span className="text-[10px] font-cartoon px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 shadow border border-amber-800">
                  {maxTeams} TEAMS
                </span>
              </div>

              {/* Quick Capacity Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 30, 40].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxTeams(num)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-cartoon border-2 transition cursor-pointer ${
                      maxTeams === num
                        ? 'cartoon-btn-amber shadow-[0_2px_0_#78350f]'
                        : 'bg-white text-stone-800 border-amber-800/30 hover:border-amber-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Team Slots Scheme */}
              <div className="pt-1.5 border-t border-amber-800/30">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPrePopulateScheme('none')}
                    className={`p-1.5 rounded-xl text-center border-2 transition cursor-pointer ${
                      prePopulateScheme === 'none'
                        ? 'cartoon-btn-cyan shadow-[0_2px_0_#082f49]'
                        : 'bg-white border-amber-800/30 text-stone-800 hover:border-amber-700'
                    }`}
                  >
                    <span className="text-[10px] font-cartoon block leading-tight">Dynamic</span>
                    <span className="text-[9px] font-bold opacity-75 block">Self Name</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrePopulateScheme('tables')}
                    className={`p-1.5 rounded-xl text-center border-2 transition cursor-pointer ${
                      prePopulateScheme === 'tables'
                        ? 'cartoon-btn-emerald shadow-[0_2px_0_#064e3b]'
                        : 'bg-white border-amber-800/30 text-stone-800 hover:border-amber-700'
                    }`}
                  >
                    <span className="text-[10px] font-cartoon block leading-tight">Tables</span>
                    <span className="text-[9px] font-bold opacity-75 block">Table 1-{maxTeams}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrePopulateScheme('pub_legends')}
                    className={`p-1.5 rounded-xl text-center border-2 transition cursor-pointer ${
                      prePopulateScheme === 'pub_legends'
                        ? 'cartoon-btn-pink shadow-[0_2px_0_#4c0519]'
                        : 'bg-white border-amber-800/30 text-stone-800 hover:border-amber-700'
                    }`}
                  >
                    <span className="text-[10px] font-cartoon block leading-tight">Legends</span>
                    <span className="text-[9px] font-bold opacity-75 block">Fun Names</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              id="host-create-room-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 rounded-2xl cartoon-btn-amber text-sm sm:text-base font-cartoon tracking-wider disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 mt-1"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>CREATE PUB LOBBY & LAUNCH!</span>
            </button>
          </form>
        )}

        {mode === 'tv' && (
          <form onSubmit={handleTVSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-cartoon text-amber-950 uppercase tracking-wider mb-1">
                Enter Room Code for Big Screen TV
              </label>
              <input
                id="tv-room-code-input"
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. PINT"
                className="w-full bg-amber-50/90 border-3 border-fuchsia-600 focus:border-fuchsia-500 focus:bg-white rounded-2xl p-2.5 sm:p-3 text-xl sm:text-2xl font-cartoon font-black text-center text-purple-950 tracking-widest uppercase outline-none shadow-inner"
                required
              />
            </div>

            <p className="text-[11px] text-stone-700 text-center font-bold leading-tight">
              Connect to the pub TV screen or projector via HDMI or browser. Displays all 40 teams, questions & music rounds!
            </p>

            <button
              id="tv-connect-submit-btn"
              type="submit"
              disabled={!roomCode.trim()}
              className="w-full py-3 sm:py-3.5 rounded-2xl cartoon-btn-purple text-sm sm:text-base font-cartoon tracking-wider disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 mt-1"
            >
              <Tv className="w-5 h-5 stroke-[2.5]" />
              <span>LAUNCH BIG SCREEN TV MODE!</span>
            </button>
          </form>
        )}
      </div>

      <div className="flex items-center justify-center pt-1">
        <PWAInstallButton />
      </div>
    </div>
  );
};
