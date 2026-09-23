import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Eye,
  Trophy,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Sparkles,
  Upload,
  Radio,
  Tv,
  Users,
  CheckCircle,
  XCircle,
  Settings,
  Layers,
  Clock,
  Music,
  HelpCircle,
  Edit3,
  CheckSquare,
  ListOrdered,
  Maximize2,
  Trash2,
  Search,
  UserPlus,
  Sliders,
  Dices,
  Flame,
  Skull,
  Crown,
  Zap,
  ShieldCheck,
  AlertTriangle,
  LockKeyhole,
  Unlock,
  Pencil,
  Combine,
} from 'lucide-react';
import { RoomState, HostActionPayload, Team, Round } from '../types';
import { audioSynth, PRESET_MELODIES } from '../utils/audioSynth';
import { CATEGORY_VAULT } from '../data/defaultQuestions';
import { CartoonQuizMaster, CartoonBeerStein, CartoonRecordPlayer } from './CartoonIllustrations';
import { RoundTransitionScreen } from './RoundTransitionScreen';
import { KnockoutWinnerScreen } from './KnockoutWinnerScreen';
import { TEAM_AVATARS, PUB_LEGEND_TEAM_NAMES } from '../data/teamPresets';
import { RoomJoinQR } from './RoomJoinQR';

interface Props {
  roomState: RoomState;
  onHostAction: (action: HostActionPayload) => void;
  onOpenTVView: () => void;
}

export const HostControls: React.FC<Props> = ({ roomState, onHostAction, onOpenTVView }) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedAICategory, setSelectedAICategory] = useState('Pub Classics & Beer Lore');
  const [customAICategory, setCustomAICategory] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showAISettings, setShowAISettings] = useState(false);
  const [showScoreboardModal, setShowScoreboardModal] = useState(false);
  const [showTeamManagerModal, setShowTeamManagerModal] = useState(false);
  const [showKnockoutModal, setShowKnockoutModal] = useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = useState('');
  const [selectedMelody, setSelectedMelody] = useState('take_on_me');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [teamStatusFilter, setTeamStatusFilter] = useState<'all' | 'answered' | 'pending'>('all');
  const [newCustomTeamName, setNewCustomTeamName] = useState('');
  const [newCustomTeamAvatar, setNewCustomTeamAvatar] = useState('🍺');
  const [customMaxTeams, setCustomMaxTeams] = useState<number>(roomState.settings.maxTeams || 40);
  const [mergeTargets, setMergeTargets] = useState<Record<string, string>>({});

  const currentRound = roomState.rounds[roomState.currentRoundIndex];
  const currentQ = currentRound?.questions[roomState.currentQuestionIndex];
  const teamsList: Team[] = (Object.values(roomState.teams) as Team[]).sort((a, b) => b.score - a.score);
  const aliveTeams = teamsList.filter((t) => !t.isEliminated);
  const knockedOutTeams = teamsList.filter((t) => t.isEliminated);
  const submittedCount = Object.keys(roomState.submissions).length;
  const connectedTeamCount = teamsList.filter((team) => team.isOnline).length;
  const connectedPlayerCount = teamsList.reduce((total, team) => total + (team.connectedPlayers || 0), 0);
  const totalQuestions = currentRound?.questions.length || 0;
  const questionProgress = totalQuestions
    ? Math.round(((roomState.currentQuestionIndex + 1) / totalQuestions) * 100)
    : 0;

  const maxTeamsAllowed = roomState.settings.maxTeams || 40;

  const handleRandomCustomTeam = () => {
    const randomName = PUB_LEGEND_TEAM_NAMES[Math.floor(Math.random() * PUB_LEGEND_TEAM_NAMES.length)];
    const randomAvatar = TEAM_AVATARS[Math.floor(Math.random() * TEAM_AVATARS.length)];
    setNewCustomTeamName(randomName);
    setNewCustomTeamAvatar(randomAvatar);
  };

  const handleAddCustomTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTeamName.trim()) return;
    if (teamsList.length >= maxTeamsAllowed) return;
    onHostAction({
      actionType: 'add_team',
      name: newCustomTeamName.trim(),
      avatar: newCustomTeamAvatar,
    });
    setNewCustomTeamName('');
  };

  const handleUpdateMaxCapacity = (newCap: number) => {
    const capped = Math.min(40, Math.max(2, newCap));
    setCustomMaxTeams(capped);
    onHostAction({
      actionType: 'update_settings',
      settings: { maxTeams: capped },
    });
  };

  // Filtered teams list for live scoreboard & management
  const filteredTeams = teamsList.filter((team) => {
    const matchesQuery = team.name.toLowerCase().includes(teamSearchQuery.toLowerCase());
    const hasSubmitted = !!roomState.submissions[team.id];
    if (!matchesQuery) return false;
    if (teamStatusFilter === 'answered') return hasSubmitted;
    if (teamStatusFilter === 'pending') return !hasSubmitted;
    return true;
  });

  // Toggle synthesized music melody
  const handleToggleMusic = (melodyId?: string) => {
    const trackId = melodyId || selectedMelody || currentQ?.musicData?.melodyId || 'take_on_me';
    if (roomState.musicPlaying) {
      audioSynth.stopMelody();
      onHostAction({ actionType: 'toggle_music', isPlaying: false });
    } else {
      audioSynth.playMelody(trackId, () => {
        onHostAction({ actionType: 'toggle_music', isPlaying: false });
      });
      onHostAction({ actionType: 'toggle_music', isPlaying: true });
    }
  };

  // Upload picture clue for music or picture round
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onHostAction({
          actionType: 'upload_music_picture',
          questionId,
          pictureDataUrl: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Call Gemini AI questions generator
  const handleGenerateAIQuestions = async () => {
    setIsGeneratingAI(true);
    const categoryToUse = customAICategory.trim() || selectedAICategory;

    try {
      const apiBase = String(import.meta.env.VITE_MULTIPLAYER_API_URL || '').trim().replace(/\/$/, '');
      const res = await fetch(`${apiBase}/api/ai/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categoryToUse,
          count: aiCount,
          difficulty: aiDifficulty,
          roundType: currentRound?.type || 'trivia',
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        const newRounds = [...roomState.rounds];
        // Append generated questions to current round
        newRounds[roomState.currentRoundIndex].questions.push(...data.questions);
        onHostAction({ actionType: 'load_questions', rounds: newRounds });
        setShowAISettings(false);
      }
    } catch (err) {
      console.error('Failed to generate AI questions:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const isAnswerRevealed = roomState.status === 'answer_reveal';
  const isMusic = currentRound?.type === 'music' || !!currentQ?.musicData;
  const isRoundTransition = roomState.status === 'round_transition';

  return (
    <div className="space-y-6 text-stone-900 font-comic">
      {/* Top Banner with Quiz Master Avatar, Room Code and TV Launcher */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 md:p-6 border-4 border-amber-800 shadow-[0_6px_0_#451a03] flex flex-wrap items-center justify-between gap-4 text-stone-900">
        <div className="flex items-center gap-3">
          <CartoonQuizMaster size={56} className="shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider border border-amber-900">
                Quiz Master Console
              </span>
              <span className="text-xs text-stone-600 font-bold">
                Lobby Code: <strong className="text-amber-950 font-mono text-base tracking-wider bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-800/40">{roomState.code}</strong>
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {connectedTeamCount} {connectedTeamCount === 1 ? 'Team' : 'Teams'} • {connectedPlayerCount} Players Connected
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-amber-950 mt-0.5">
              The Pub Quiz Master HQ
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="hidden sm:flex items-center gap-2 rounded-2xl border-2 border-amber-800/40 bg-white p-1.5">
            <RoomJoinQR roomCode={roomState.code} size={70} />
            <span className="max-w-20 text-[10px] font-black leading-tight text-amber-950">SCAN TO JOIN ROOM {roomState.code}</span>
          </div>
          <button
            id="host-knockout-modal-btn"
            onClick={() => setShowKnockoutModal(true)}
            className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs md:text-sm font-black border-2 transition-all cursor-pointer shadow-sm ${
              roomState.settings.knockoutMode
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-800 shadow-[0_4px_0_#7f1d1d]'
                : 'bg-amber-100 text-stone-800 border-amber-800/40 hover:border-red-500 hover:text-red-700'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>
              Knockout {roomState.settings.knockoutMode ? `(${aliveTeams.length} Alive)` : 'Mode'}
            </span>
          </button>

          <button
            id="host-manage-teams-btn"
            onClick={() => setShowTeamManagerModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-amber-200/90 text-amber-950 hover:bg-amber-300 px-3.5 py-2.5 text-xs md:text-sm font-black border-2 border-amber-800/60 active:translate-y-1 transition-all cursor-pointer shadow-sm"
          >
            <Users className="w-4 h-4 text-amber-800" />
            <span>Manage Teams ({teamsList.length}/{maxTeamsAllowed})</span>
          </button>

          <button
            id="host-open-tv-btn"
            onClick={onOpenTVView}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs md:text-sm font-black text-white shadow-[0_4px_0_#3730a3] hover:bg-indigo-500 active:translate-y-1 active:shadow-none transition-all cursor-pointer border-2 border-indigo-900"
          >
            <Tv className="w-4 h-4" />
            <span>Connect TV Display</span>
          </button>

          <button
            id="host-scoreboard-modal-btn"
            onClick={() => setShowScoreboardModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-amber-500 px-3.5 py-2.5 text-xs md:text-sm font-black text-slate-950 shadow-[0_4px_0_#92400e] hover:bg-amber-400 active:translate-y-1 active:shadow-none transition-all cursor-pointer border-2 border-amber-900"
          >
            <Trophy className="w-4 h-4" />
            <span>Full Scoreboard</span>
          </button>

          <button
            id="host-ai-generator-toggle-btn"
            onClick={() => setShowAISettings(!showAISettings)}
            className="flex items-center gap-2 rounded-2xl bg-purple-600 px-3.5 py-2.5 text-xs md:text-sm font-black text-white shadow-[0_4px_0_#581c87] hover:bg-purple-500 active:translate-y-1 active:shadow-none transition-all cursor-pointer border-2 border-purple-900"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>AI Questions</span>
          </button>
        </div>
      </div>

      {/* At-a-glance Quiz Master dashboard */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3" aria-label="Quiz status overview">
        <div className="rounded-2xl border-3 border-emerald-700 bg-emerald-50 p-3.5 shadow-[0_4px_0_#065f46]">
          <div className="flex items-center gap-2 text-emerald-800">
            <Radio className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Game status</span>
          </div>
          <strong className="mt-1 block text-lg text-emerald-950 capitalize">{roomState.status.replace('_', ' ')}</strong>
        </div>

        <div className="rounded-2xl border-3 border-amber-700 bg-amber-50 p-3.5 shadow-[0_4px_0_#92400e]">
          <div className="flex items-center gap-2 text-amber-800">
            <Layers className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Current round</span>
          </div>
          <strong className="mt-1 block truncate text-lg text-amber-950">{currentRound?.title || 'Ready to begin'}</strong>
        </div>

        <div className="rounded-2xl border-3 border-sky-700 bg-sky-50 p-3.5 shadow-[0_4px_0_#075985]">
          <div className="flex items-center justify-between gap-2 text-sky-800">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
              <ListOrdered className="w-4 h-4" /> Question
            </span>
            <span className="text-[10px] font-black">{questionProgress}%</span>
          </div>
          <strong className="mt-1 block text-lg text-sky-950">{Math.min(roomState.currentQuestionIndex + 1, totalQuestions)} / {totalQuestions}</strong>
        </div>

        <div className="rounded-2xl border-3 border-purple-700 bg-purple-50 p-3.5 shadow-[0_4px_0_#581c87]">
          <div className="flex items-center gap-2 text-purple-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Answers received</span>
          </div>
          <strong className="mt-1 block text-lg text-purple-950">{submittedCount} / {teamsList.length}</strong>
        </div>
      </section>

      {/* KNOCKOUT WINNER CELEBRATION BANNER ON HOST SCREEN */}
      {roomState.status === 'knockout_winner' && (
        <KnockoutWinnerScreen
          roomState={roomState}
          isHost={true}
          onResetKnockout={() => onHostAction({ actionType: 'reset_knockout' })}
          onPlayAgain={() => onHostAction({ actionType: 'next_round' })}
        />
      )}

      {/* KNOCKOUT STATUS BAR */}
      {roomState.settings.knockoutMode && roomState.status !== 'knockout_winner' && (
        <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-400 shadow-md flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center border border-red-300">
              <Flame className="w-6 h-6 animate-pulse text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-red-800 tracking-wider">
                  Knockout Arena Active
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                  {roomState.settings.knockoutRule === 'wrong_answer'
                    ? 'Sudden Death (Wrong Answer)'
                    : roomState.settings.knockoutRule === 'lowest_per_round'
                    ? 'Lowest Score Per Round'
                    : 'Sudden Death Tiebreaker'}
                </span>
              </div>
              <p className="text-xs text-stone-700 font-bold">
                Rule: <strong>Must Have 1 Winner</strong>. {aliveTeams.length} teams still alive • {knockedOutTeams.length} eliminated.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onHostAction({ actionType: 'trigger_sudden_death' })}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-800/40 text-xs font-black cursor-pointer flex items-center gap-1.5"
              title="Force Sudden Death tiebreaker for top tied contenders"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Force Sudden Death</span>
            </button>

            <button
              onClick={() => setShowKnockoutModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black border border-red-800 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Knockout Controls</span>
            </button>
          </div>
        </div>
      )}

      {/* SEAMLESS ROUND TRANSITIONS BAR */}
      <div className="bg-[#fffdf8] rounded-2xl p-4 border-2 border-amber-800/40 shadow-md space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Game Rounds & Transitions</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="host-prev-round-btn"
              onClick={() => onHostAction({ actionType: 'prev_round' })}
              disabled={roomState.currentRoundIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-stone-900 text-xs font-bold disabled:opacity-40 cursor-pointer border border-amber-800/30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev Round</span>
            </button>

            <button
              id="host-toggle-round-transition-btn"
              onClick={() => {
                if (isRoundTransition) {
                  onHostAction({ actionType: 'start_round', roundIndex: roomState.currentRoundIndex });
                } else {
                  onHostAction({ actionType: 'update_settings', settings: {} });
                  // Trigger transition card
                  onHostAction({ actionType: 'next_round' });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 cursor-pointer border border-amber-900 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRoundTransition ? 'Play Questions Now' : 'Show Round Intro Splash'}</span>
            </button>

            <button
              id="host-next-round-btn"
              onClick={() => onHostAction({ actionType: 'next_round' })}
              disabled={roomState.currentRoundIndex >= roomState.rounds.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-stone-900 text-xs font-bold disabled:opacity-40 cursor-pointer border border-amber-800/30"
            >
              <span>Next Round</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Round Tabs with Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {roomState.rounds.map((rnd, idx) => {
            const isActive = roomState.currentRoundIndex === idx;
            return (
              <button
                key={rnd.roundNumber}
                onClick={() => onHostAction({ actionType: 'start_round', roundIndex: idx })}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-900 shadow-[0_3px_0_#78350f] font-black'
                    : 'bg-amber-50 border-amber-800/30 text-stone-700 hover:border-amber-800 hover:text-stone-950'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider mb-1">
                  <span>Round {rnd.roundNumber}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900 border border-amber-800/20'}`}>
                    {rnd.type}
                  </span>
                </div>
                <div className="text-xs md:text-sm truncate font-extrabold">{rnd.title}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{rnd.questions.length} questions</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ROUND TRANSITION PREVIEW IF ACTIVE */}
      {isRoundTransition && currentRound && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <RoundTransitionScreen
            round={currentRound}
            roundIndex={roomState.currentRoundIndex}
            totalRounds={roomState.rounds.length}
            isHost={true}
            onStartRound={() => onHostAction({ actionType: 'start_round', roundIndex: roomState.currentRoundIndex })}
          />
        </div>
      )}

      {/* AI Question Generator Drawer */}
      {showAISettings && (
        <div className="bg-[#fffdf8] rounded-3xl p-5 border-3 border-purple-600 shadow-xl space-y-4 text-stone-900 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-amber-800/20 pb-3">
            <div className="flex items-center gap-2 text-purple-900 font-black text-sm md:text-base">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <span>Generate Fresh Pub Questions with Gemini A.I.</span>
            </div>
            <button
              onClick={() => setShowAISettings(false)}
              className="text-xs text-stone-500 hover:text-stone-900 font-bold cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Pick Curated Category</label>
              <select
                value={selectedAICategory}
                onChange={(e) => setSelectedAICategory(e.target.value)}
                className="w-full bg-amber-50 border-2 border-amber-800/30 rounded-xl p-2.5 text-xs text-stone-900 font-bold focus:border-purple-600 outline-none"
              >
                {CATEGORY_VAULT.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Or Custom Topic</label>
              <input
                type="text"
                value={customAICategory}
                onChange={(e) => setCustomAICategory(e.target.value)}
                placeholder="e.g. 90s British Sitcoms, Belgian Ales..."
                className="w-full bg-amber-50 border-2 border-amber-800/30 rounded-xl p-2.5 text-xs text-stone-900 font-bold focus:border-purple-600 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-stone-700 mb-1">Difficulty</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full bg-amber-50 border-2 border-amber-800/30 rounded-xl p-2.5 text-xs text-stone-900 font-bold focus:border-purple-600 outline-none"
                >
                  <option value="easy">Easy (Warm-up)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="hard">Hard (Pub Master)</option>
                </select>
              </div>

              <div className="w-20">
                <label className="block text-xs font-bold text-stone-700 mb-1">Count</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={aiCount}
                  onChange={(e) => setAiCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 5)))}
                  className="w-full bg-amber-50 border-2 border-amber-800/30 rounded-xl p-2.5 text-xs text-stone-900 font-bold text-center focus:border-purple-600 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            id="host-run-ai-generate-btn"
            disabled={isGeneratingAI}
            onClick={handleGenerateAIQuestions}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-[0_4px_0_#3b0764] hover:brightness-110 active:translate-y-0.5 active:shadow-none disabled:opacity-60 transition cursor-pointer"
          >
            {isGeneratingAI ? 'Brewing Fresh Questions with A.I...' : '✨ Generate & Add Questions to Current Round'}
          </button>
        </div>
      )}

      {/* Main Stage Grid: Question Controls + Live Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stage & Question Navigator (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#fffdf8] rounded-3xl p-5 md:p-6 border-3 border-amber-800/40 shadow-md">
            {/* Question Quick Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-amber-800/20 scrollbar-thin">
              <span className="text-[11px] font-black text-stone-600 uppercase tracking-wider shrink-0 mr-1">
                Jump To Q:
              </span>
              {currentRound?.questions.map((q, idx) => {
                const isCurrent = roomState.currentQuestionIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => onHostAction({ actionType: 'jump_to_question', roundIndex: roomState.currentRoundIndex, questionIndex: idx })}
                    className={`w-7 h-7 rounded-lg text-xs font-black shrink-0 transition cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 border-2 border-amber-900 shadow-sm'
                        : 'bg-amber-50 text-stone-700 hover:text-stone-950 border border-amber-800/30'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/20 pb-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950">
                  Question {roomState.currentQuestionIndex + 1} of {currentRound?.questions.length || 0}
                </span>
                <span className="text-xs font-bold text-stone-600">
                  {currentQ?.category}
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  +{currentQ?.points || 10} pts
                </span>
              </div>

              {/* ANSWER FORMAT SELECTOR: Multiple Choice vs Text Input */}
              <div className="flex items-center p-1 bg-amber-100 rounded-xl border border-amber-800/30">
                <button
                  id="host-select-multiple-choice-btn"
                  onClick={() => onHostAction({ actionType: 'set_answer_mode', mode: 'multiple_choice' })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    roomState.settings.answerMode === 'multiple_choice'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Player keypads show 4 multiple-choice buttons"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Multiple Choice</span>
                </button>
                <button
                  id="host-select-free-text-btn"
                  onClick={() => onHostAction({ actionType: 'set_answer_mode', mode: 'free_text' })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    roomState.settings.answerMode === 'free_text'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Players type their answer in an input field"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Text Input</span>
                </button>
              </div>
            </div>

            {/* Current Question Text */}
            <div className="bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-800/30 mb-4">
              <h3 className="text-lg md:text-xl font-black text-stone-900 leading-snug">
                {currentQ?.prompt || 'No active question selected.'}
              </h3>
            </div>

            {/* Music Round Riff / Synthesizer / Picture Controls */}
            {isMusic && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 mb-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs md:text-sm">
                    <CartoonRecordPlayer isPlaying={roomState.musicPlaying} size={36} />
                    <span>
                      Track: <strong>{currentQ?.musicData?.songTitle || 'Selected Melodies'}</strong> ({currentQ?.musicData?.artist})
                    </span>
                  </div>

                  {/* Play synthesized audio riff button */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMelody}
                      onChange={(e) => setSelectedMelody(e.target.value)}
                      className="bg-[#fffdf8] border border-rose-400 rounded-xl px-2 py-1 text-xs text-rose-900 font-bold"
                    >
                      {Object.entries(PRESET_MELODIES).map(([id, m]) => (
                        <option key={id} value={id}>
                          {m.title} - {m.artist}
                        </option>
                      ))}
                    </select>

                    <button
                      id="host-play-music-riff-btn"
                      onClick={() => handleToggleMusic(selectedMelody)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black border cursor-pointer transition ${
                        roomState.musicPlaying
                          ? 'bg-rose-600 text-white border-rose-800 shadow-[0_3px_0_#831843]'
                          : 'bg-rose-100 text-rose-900 border-rose-400 hover:bg-rose-200'
                      }`}
                    >
                      {roomState.musicPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{roomState.musicPlaying ? 'Stop Tune' : 'Play Synth Riff'}</span>
                    </button>
                  </div>
                </div>

                {/* Picture Upload Clues for Music Round */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-200">
                  <span className="text-xs text-stone-600 font-bold">Picture Clues:</span>
                  {currentQ?.musicData?.cluePictures?.map((pic, i) => (
                    <img key={i} src={pic} alt="clue" className="w-10 h-10 object-cover rounded-xl border-2 border-rose-400 shadow" />
                  ))}

                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-800/40 text-xs font-bold text-stone-800 hover:text-stone-950 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-rose-600" />
                    <span>Upload Picture Clue</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => currentQ && handleFileUpload(e, currentQ.id)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Answer Options & Reveal State */}
            <div className="space-y-2 mb-5">
              {currentQ?.options?.map((opt, i) => {
                const isCorrect = opt === currentQ.correctAnswer;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border-2 text-xs md:text-sm font-bold flex items-center justify-between ${
                      isAnswerRevealed && isCorrect
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-sm'
                        : 'bg-[#fffdf8] border-amber-800/30 text-stone-800'
                    }`}
                  >
                    <span>{String.fromCharCode(65 + i)}. {opt}</span>
                    {isCorrect && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                        Official Answer
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* QUESTION PACING & TIMER CONTROLS */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-800/30 mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Question Pacing & Timer</span>
                </span>
                <span className="font-mono font-black text-amber-950 text-sm">
                  {roomState.timerRemaining}s remaining
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="host-toggle-timer-btn"
                  onClick={() => onHostAction({ actionType: 'toggle_timer' })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer ${
                    roomState.isTimerRunning
                      ? 'bg-amber-500 text-slate-950 border-amber-900 shadow-sm'
                      : 'bg-amber-100 text-stone-800 border-amber-800/40 hover:bg-amber-200'
                  }`}
                >
                  {roomState.isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{roomState.isTimerRunning ? 'Pause Timer' : 'Resume Timer'}</span>
                </button>

                <button
                  id="host-add-10s-btn"
                  onClick={() => onHostAction({ actionType: 'add_time', seconds: 10 })}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-xs font-bold text-stone-800 border border-amber-800/30 cursor-pointer"
                  title="Add 10 seconds to clock"
                >
                  +10s
                </button>

                <button
                  id="host-add-30s-btn"
                  onClick={() => onHostAction({ actionType: 'add_time', seconds: 30 })}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-xs font-bold text-stone-800 border border-amber-800/30 cursor-pointer"
                  title="Add 30 seconds to clock"
                >
                  +30s
                </button>

                <div className="h-4 w-px bg-amber-800/30 mx-1" />

                <span className="text-[10px] text-stone-600 font-bold">Reset To:</span>
                {[15, 30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onHostAction({ actionType: 'reset_timer', seconds: sec })}
                    className="px-2 py-1 rounded-lg bg-amber-100/70 hover:bg-amber-200 text-[11px] font-bold text-stone-800 border border-amber-800/30 cursor-pointer"
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Prev Question Button */}
              <button
                id="host-prev-question-btn"
                onClick={() => onHostAction({ actionType: 'prev_question' })}
                disabled={roomState.currentQuestionIndex === 0}
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-stone-900 font-bold text-xs border border-amber-800/30 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Q</span>
              </button>

              {/* Reveal Answer Button */}
              <button
                id="host-reveal-answer-btn"
                onClick={() => onHostAction({ actionType: 'reveal_answer' })}
                disabled={isAnswerRevealed}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs md:text-sm shadow-[0_4px_0_#92400e] hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition cursor-pointer border-2 border-amber-900"
              >
                <Eye className="w-4 h-4" />
                <span>{isAnswerRevealed ? 'Answer Revealed' : 'Reveal Answer'}</span>
              </button>

              {/* Next Question Button */}
              <button
                id="host-next-question-btn"
                onClick={() => {
                  const unanswered = Math.max(0, teamsList.filter((team) => !team.isEliminated).length - submittedCount);
                  const warning = unanswered > 0
                    ? `${unanswered} active team${unanswered === 1 ? ' has' : 's have'} not answered. Continue?`
                    : !isAnswerRevealed
                      ? 'The answer has not been revealed. Continue?'
                      : '';
                  if (!warning || window.confirm(warning)) onHostAction({ actionType: 'next_question' });
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs md:text-sm shadow-[0_4px_0_#065f46] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition cursor-pointer border-2 border-emerald-900"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* 10-Question Milestone Intermission Trigger */}
              <button
                id="host-trigger-milestone-btn"
                onClick={() => onHostAction({ actionType: 'trigger_milestone' })}
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-amber-100 text-amber-950 font-black text-xs border-2 border-amber-800/50 hover:bg-amber-200 transition cursor-pointer shadow-sm"
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Trigger TV Podium</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Submissions & Real-Time Scoreboard (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#fffdf8] rounded-3xl p-5 border-3 border-amber-800/40 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-amber-800/20 pb-3">
              <div className="flex items-center gap-2 text-sm font-black text-amber-950">
                <Users className="w-4 h-4 text-amber-700" />
                <span>Scoreboard ({teamsList.length}/{maxTeamsAllowed})</span>
              </div>
              <button
                onClick={() => setShowTeamManagerModal(true)}
                className="text-[11px] font-black text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg border border-amber-800/30 cursor-pointer flex items-center gap-1"
                title="Manage up to 40 teams"
              >
                <Sliders className="w-3 h-3" />
                <span>Manage</span>
              </button>
            </div>

            {/* Quick Search & Filter for up to 40 teams */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  placeholder={`Search ${teamsList.length} teams...`}
                  className="w-full bg-amber-50 border border-amber-800/30 focus:border-amber-700 rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-stone-900 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                {teamSearchQuery && (
                  <button
                    onClick={() => setTeamSearchQuery('')}
                    className="text-[10px] text-stone-500 hover:text-stone-900 absolute right-2.5 top-2 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <button
                  onClick={() => setTeamStatusFilter('all')}
                  className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    teamStatusFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 border-amber-900 font-black'
                      : 'bg-amber-50 text-stone-700 border-amber-800/30 hover:text-stone-950'
                  }`}
                >
                  All ({teamsList.length})
                </button>
                <button
                  onClick={() => setTeamStatusFilter('answered')}
                  className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    teamStatusFilter === 'answered'
                      ? 'bg-emerald-600 text-white border-emerald-800 font-black'
                      : 'bg-amber-50 text-stone-700 border-amber-800/30 hover:text-stone-950'
                  }`}
                >
                  Answered ({Object.keys(roomState.submissions).length})
                </button>
                <button
                  onClick={() => setTeamStatusFilter('pending')}
                  className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    teamStatusFilter === 'pending'
                      ? 'bg-amber-200 text-amber-950 border-amber-800 font-black'
                      : 'bg-amber-50 text-stone-700 border-amber-800/30 hover:text-stone-950'
                  }`}
                >
                  Pending ({Math.max(0, teamsList.length - Object.keys(roomState.submissions).length)})
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {teamsList.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500 space-y-3">
                  <CartoonBeerStein size={44} className="mx-auto opacity-40" />
                  <p>No teams yet! Players join with code <strong className="text-amber-900">{roomState.code}</strong></p>
                  <button
                    onClick={() => setShowTeamManagerModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-800/30 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Pre-populate Up to 40 Teams</span>
                  </button>
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-500">
                  No teams matching "{teamSearchQuery}"
                </div>
              ) : (
                filteredTeams.map((team) => {
                  const rankIdx = teamsList.findIndex((t) => t.id === team.id);
                  const sub = roomState.submissions[team.id];
                  const rankIcon = rankIdx === 0 ? '🥇' : rankIdx === 1 ? '🥈' : rankIdx === 2 ? '🥉' : `#${rankIdx + 1}`;

                  return (
                    <div
                      key={team.id}
                      className="p-3 rounded-2xl bg-amber-50/70 border border-amber-800/20 text-xs space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-black text-xs text-amber-900">{rankIcon}</span>
                          <span className="text-lg">{team.avatar}</span>
                          <span className="font-black text-stone-900 truncate max-w-[110px]" title={team.name}>
                            {team.name}
                          </span>
                        </div>

                        {/* Quick Score Tweaks */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onHostAction({ actionType: 'adjust_score', teamId: team.id, delta: -5 })}
                            className="p-1 rounded bg-amber-200/70 hover:bg-amber-200 text-stone-800 cursor-pointer font-bold"
                            title="-5 pts"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-xs min-w-[32px] text-center">
                            {team.score}
                          </span>
                          <button
                            onClick={() => onHostAction({ actionType: 'adjust_score', teamId: team.id, delta: 5 })}
                            className="p-1 rounded bg-amber-200/70 hover:bg-amber-200 text-stone-800 cursor-pointer font-bold"
                            title="+5 pts"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Submitted Answer Display & Manual Approval */}
                      {sub ? (
                        <div className="p-2 rounded-xl bg-[#fffdf8] border border-amber-800/30 flex items-center justify-between gap-2">
                          <div className="truncate flex-1">
                            <span className="text-[10px] text-stone-600 block font-bold">Submitted Answer:</span>
                            <span className="font-black text-amber-950 truncate block">{sub.answer}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() =>
                                onHostAction({
                                  actionType: 'grade_answer',
                                  teamId: team.id,
                                  isCorrect: true,
                                  points: currentQ?.points || 10,
                                })
                              }
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm"
                              title="Award Full Points"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                onHostAction({
                                  actionType: 'grade_answer',
                                  teamId: team.id,
                                  isCorrect: false,
                                  points: 0,
                                })
                              }
                              className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-sm"
                              title="Reject Answer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-500 italic block pl-1">
                          Thinking / answering...
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCOREBOARD MODAL (Optimized for up to 40 teams) */}
      {showScoreboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-[#fffdf8] border-3 sm:border-4 border-amber-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4 max-h-[92vh] max-h-[92dvh] flex flex-col text-stone-900 font-comic">
            <div className="flex items-center justify-between border-b border-amber-800/20 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" />
                <div>
                  <h3 className="text-base sm:text-xl font-black text-amber-950">Full Team Standings</h3>
                  <p className="text-[10px] sm:text-xs text-stone-600">
                    Showing all {teamsList.length} competing teams (Capacity: {maxTeamsAllowed})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => {
                    setShowScoreboardModal(false);
                    setShowTeamManagerModal(true);
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-800/30 cursor-pointer"
                >
                  Manage
                </button>
                <button
                  onClick={() => setShowScoreboardModal(false)}
                  className="text-stone-600 hover:text-stone-950 text-xs sm:text-sm font-bold p-1.5 sm:px-2 rounded-lg bg-amber-100 border border-amber-800/30 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick search inside scoreboard modal */}
            <div className="relative">
              <input
                type="text"
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                placeholder="Filter standings by team or table name..."
                className="w-full bg-amber-50 border border-amber-800/30 focus:border-amber-700 rounded-xl px-3 py-2 pl-8 text-xs font-bold text-stone-900 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1">
              {filteredTeams.map((t) => {
                const rankIdx = teamsList.findIndex((team) => team.id === t.id);
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-800/20"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-6 text-center font-black text-xs text-amber-900 shrink-0">
                        {rankIdx === 0 ? '🥇' : rankIdx === 1 ? '🥈' : rankIdx === 2 ? '🥉' : `#${rankIdx + 1}`}
                      </span>
                      <span className="text-xl shrink-0">{t.avatar}</span>
                      <div className="truncate">
                        <span className="font-black text-stone-900 text-xs block truncate">{t.name}</span>
                        <span className="text-[10px] text-stone-600 block">
                          {t.scoreHistory.filter((s) => s.isCorrect).length} Correct
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onHostAction({ actionType: 'adjust_score', teamId: t.id, delta: -5 })}
                        className="px-2 py-1 rounded bg-amber-200 text-[11px] font-bold text-stone-800 hover:bg-amber-300 cursor-pointer"
                        title="-5 pts"
                      >
                        -5
                      </button>
                      <span className="font-black text-sm text-amber-950 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-800/30 min-w-[44px] text-center">
                        {t.score}
                      </span>
                      <button
                        onClick={() => onHostAction({ actionType: 'adjust_score', teamId: t.id, delta: 5 })}
                        className="px-2 py-1 rounded bg-amber-200 text-[11px] font-bold text-stone-800 hover:bg-amber-300 cursor-pointer"
                        title="+5 pts"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowScoreboardModal(false)}
              className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 border-2 border-amber-900 shadow-[0_3px_0_#78350f] cursor-pointer"
            >
              Back to Game Console
            </button>
          </div>
        </div>
      )}

      {/* TEAM MANAGER MODAL (CHOOSE & MANAGE UP TO 40 TEAMS) */}
      {showTeamManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-[#fffdf8] border-3 sm:border-4 border-amber-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] max-h-[92dvh] flex flex-col text-stone-900 font-comic">
            <div className="flex items-center justify-between border-b border-amber-800/20 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 shrink-0" />
                <div>
                  <h3 className="text-base sm:text-xl font-black text-amber-950">Team Manager Suite</h3>
                  <p className="text-[10px] sm:text-xs text-stone-600">
                    Configure room capacity and manage up to 40 competing pub teams
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTeamManagerModal(false)}
                className="text-stone-600 hover:text-stone-950 text-xs sm:text-sm font-bold p-1.5 sm:px-2 rounded-lg bg-amber-100 border border-amber-800/30 cursor-pointer shrink-0"
              >
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 pr-1 flex-1 scrollbar-thin">
              {/* CAPACITY CONTROL */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-800/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    <span>Choose Maximum Teams (Up to 40)</span>
                  </span>
                  <span className="text-sm font-black px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950">
                    Max: {customMaxTeams} Teams
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 40].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleUpdateMaxCapacity(num)}
                      className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                        customMaxTeams === num
                          ? 'bg-amber-500 text-slate-950 border-amber-900 shadow-sm'
                          : 'bg-amber-100 text-stone-800 border-amber-800/30 hover:border-amber-800'
                      }`}
                    >
                      {num} Teams
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-1">
                  <input
                    type="range"
                    min={2}
                    max={40}
                    value={customMaxTeams}
                    onChange={(e) => handleUpdateMaxCapacity(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-600 font-bold px-0.5">
                    <span>Min: 2 Teams</span>
                    <span>Max: 40 Teams</span>
                  </div>
                </div>
              </div>

              {/* QUICK PRESET BATCH GENERATION */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-800/20 space-y-3">
                <span className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                  Quick Batch Presets (Instant Populate)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => onHostAction({ actionType: 'create_preset_teams', count: 10, scheme: 'tables' })}
                    className="py-2.5 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-800/30 text-xs font-black text-amber-950 transition cursor-pointer text-center"
                  >
                    10 Tables
                  </button>
                  <button
                    type="button"
                    onClick={() => onHostAction({ actionType: 'create_preset_teams', count: 20, scheme: 'tables' })}
                    className="py-2.5 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-800/30 text-xs font-black text-amber-950 transition cursor-pointer text-center"
                  >
                    20 Tables
                  </button>
                  <button
                    type="button"
                    onClick={() => onHostAction({ actionType: 'create_preset_teams', count: 40, scheme: 'tables' })}
                    className="py-2.5 px-2 rounded-xl bg-amber-200 hover:bg-amber-300 border-2 border-amber-800/60 text-xs font-black text-amber-950 transition cursor-pointer text-center"
                  >
                    40 Tables
                  </button>
                  <button
                    type="button"
                    onClick={() => onHostAction({ actionType: 'create_preset_teams', count: 40, scheme: 'pub_legends' })}
                    className="py-2.5 px-2 rounded-xl bg-purple-100 hover:bg-purple-200 border-2 border-purple-400 text-xs font-black text-purple-950 transition cursor-pointer text-center"
                  >
                    40 Pub Legends
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all teams from this room?')) {
                        onHostAction({ actionType: 'clear_teams' });
                      }
                    }}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All Teams</span>
                  </button>
                </div>
              </div>

              {/* ADD SINGLE CUSTOM TEAM */}
              <form onSubmit={handleAddCustomTeam} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-800/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>Add Individual Team</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRandomCustomTeam}
                    className="text-[11px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Random Name</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newCustomTeamName}
                    onChange={(e) => setNewCustomTeamName(e.target.value)}
                    placeholder="Enter team name..."
                    className="sm:col-span-2 bg-[#fffdf8] border border-amber-800/30 focus:border-amber-700 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newCustomTeamName.trim() || teamsList.length >= customMaxTeams}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs border border-emerald-900 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    + Add Team
                  </button>
                </div>

                {/* Avatar Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin max-h-16">
                  {TEAM_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewCustomTeamAvatar(av)}
                      className={`w-8 h-8 rounded-xl text-base flex items-center justify-center shrink-0 border cursor-pointer ${
                        newCustomTeamAvatar === av
                          ? 'bg-amber-500 border-amber-900'
                          : 'bg-[#fffdf8] border-amber-800/30 hover:border-amber-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </form>

              {/* ROSTER LIST (UP TO 40 TEAMS) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Current Roster ({teamsList.length} of {customMaxTeams} Teams)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {teamsList.map((team, idx) => (
                    <div
                      key={team.id}
                      className="p-2.5 rounded-xl bg-[#fffdf8] border border-amber-800/20 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[11px] font-mono text-stone-500 w-5">#{idx + 1}</span>
                        <span className="text-lg">{team.avatar}</span>
                        <span className="min-w-0">
                          <span className="text-xs font-black text-stone-900 truncate max-w-[140px] block">{team.name}</span>
                          <span className={`text-[10px] font-bold ${team.isOnline ? 'text-emerald-700' : 'text-stone-500'}`}>
                            {team.connectedPlayers || 0} connected {team.isJoinLocked ? '• 🔒 locked' : ''}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                        <span className="text-xs font-bold text-amber-950 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-800/30">
                          {team.score}p
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextName = window.prompt('Rename this team:', team.name)?.trim();
                            if (nextName) onHostAction({ actionType: 'rename_team', teamId: team.id, name: nextName });
                          }}
                          className="p-1 rounded text-sky-700 hover:bg-sky-50 cursor-pointer"
                          title="Rename team"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onHostAction({ actionType: 'set_team_join_locked', teamId: team.id, locked: !team.isJoinLocked })}
                          className="p-1 rounded text-amber-700 hover:bg-amber-50 cursor-pointer"
                          title={team.isJoinLocked ? 'Unlock team joining' : 'Lock team joining'}
                        >
                          {team.isJoinLocked ? <Unlock className="w-3.5 h-3.5" /> : <LockKeyhole className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onHostAction({ actionType: 'remove_team', teamId: team.id })}
                          className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          title="Remove team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {teamsList.length > 1 && (
                  <div className="rounded-xl border border-purple-300 bg-purple-50 p-3 space-y-2">
                    <span className="text-[10px] font-black uppercase text-purple-950 flex items-center gap-1"><Combine className="w-3.5 h-3.5" /> Merge duplicate teams</span>
                    {teamsList.map((team) => (
                      <div key={`merge-${team.id}`} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 text-xs">
                        <span className="truncate font-bold">{team.avatar} {team.name}</span>
                        <select
                          value={mergeTargets[team.id] || ''}
                          onChange={(event) => setMergeTargets((current) => ({ ...current, [team.id]: event.target.value }))}
                          className="min-w-0 rounded-lg border border-purple-300 bg-white p-1.5"
                        >
                          <option value="">Merge into…</option>
                          {teamsList.filter((candidate) => candidate.id !== team.id).map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!mergeTargets[team.id]}
                          onClick={() => {
                            const targetTeamId = mergeTargets[team.id];
                            if (targetTeamId && window.confirm(`Merge ${team.name} into ${roomState.teams[targetTeamId]?.name}?`)) {
                              onHostAction({ actionType: 'merge_teams', sourceTeamId: team.id, targetTeamId });
                            }
                          }}
                          className="rounded-lg bg-purple-700 px-2 py-1.5 font-black text-white disabled:opacity-40"
                        >Merge</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTeamManagerModal(false)}
              className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 border-2 border-amber-900 shadow-[0_3px_0_#78350f] cursor-pointer"
            >
              Done Managing Teams
            </button>
          </div>
        </div>
      )}

      {/* KNOCKOUT ARENA MASTER MODAL */}
      {showKnockoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-[#fffdf8] border-3 sm:border-4 border-amber-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] max-h-[92dvh] flex flex-col text-stone-900 font-comic">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-800/20 pb-3 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-slate-950 border-2 border-amber-900 shadow-md shrink-0">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-amber-950 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span>Knockout Arena</span>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-mono">
                      1 Winner Rule
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-600">
                    Eliminate teams until one undisputed champion remains.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowKnockoutModal(false)}
                className="text-stone-600 hover:text-stone-950 text-xs sm:text-sm font-bold p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-100 border border-amber-800/30 cursor-pointer shrink-0"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1 scrollbar-thin">
              {/* Mode Toggle & Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-800/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-stone-600 block">
                      Knockout Mode State
                    </span>
                    <strong className="text-base font-black text-amber-950">
                      {roomState.settings.knockoutMode ? '🔥 ACTIVATED (Eliminations Live)' : '💤 DEACTIVATED (Standard Quiz)'}
                    </strong>
                  </div>

                  <button
                    onClick={() =>
                      onHostAction({
                        actionType: 'toggle_knockout_mode',
                        enabled: !roomState.settings.knockoutMode,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition cursor-pointer ${
                      roomState.settings.knockoutMode
                        ? 'bg-red-600 text-white border-red-800 shadow-[0_3px_0_#7f1d1d]'
                        : 'bg-emerald-600 text-white border-emerald-800 shadow-[0_3px_0_#065f46]'
                    }`}
                  >
                    {roomState.settings.knockoutMode ? 'Disable Knockout' : 'Enable Knockout'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-800/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-stone-600 block">
                      Alive vs Knocked Out
                    </span>
                    <strong className="text-base font-black text-amber-950">
                      {aliveTeams.length} Alive • {knockedOutTeams.length} Eliminated
                    </strong>
                  </div>

                  <button
                    onClick={() => onHostAction({ actionType: 'reset_knockout' })}
                    className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black border border-amber-800/30 cursor-pointer flex items-center gap-1.5"
                    title="Revive all eliminated teams back into competition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revive All</span>
                  </button>
                </div>
              </div>

              {/* Elimination Rule Options */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-800/20 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-950 block">
                  Knockout Elimination Rule:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <button
                    onClick={() =>
                      onHostAction({ actionType: 'set_knockout_rule', rule: 'wrong_answer' })
                    }
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                      roomState.settings.knockoutRule === 'wrong_answer'
                        ? 'bg-red-100 border-red-500 text-stone-900 shadow-sm'
                        : 'bg-[#fffdf8] border-amber-800/20 text-stone-700 hover:border-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-red-700">
                      <Skull className="w-3.5 h-3.5" />
                      <span>Wrong Answer Elimination</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1">
                      Teams are knocked out instantly when they miss an answer. Stalemate protection keeps contenders alive if all miss.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      onHostAction({ actionType: 'set_knockout_rule', rule: 'lowest_per_round' })
                    }
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                      roomState.settings.knockoutRule === 'lowest_per_round'
                        ? 'bg-amber-200 border-amber-600 text-stone-900 shadow-sm'
                        : 'bg-[#fffdf8] border-amber-800/20 text-stone-700 hover:border-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-amber-900">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Lowest Score Per Round</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1">
                      Bottom scoring team(s) are eliminated at the conclusion of each quiz round.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      onHostAction({ actionType: 'set_knockout_rule', rule: 'sudden_death_tiebreaker' })
                    }
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                      roomState.settings.knockoutRule === 'sudden_death_tiebreaker'
                        ? 'bg-purple-100 border-purple-500 text-stone-900 shadow-sm'
                        : 'bg-[#fffdf8] border-amber-800/20 text-stone-700 hover:border-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-purple-800">
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                      <span>Sudden Death Tiebreaker</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1">
                      Must have 1 winner: only top tied contenders battle in sudden death until one emerges victorious.
                    </p>
                  </button>
                </div>
              </div>

              {/* Master Actions: Force Sudden Death & Direct Winner Declaration */}
              <div className="p-4 rounded-2xl bg-amber-100 border-2 border-amber-800/40 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-950 block">
                  Decisive 1-Winner Actions:
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      onHostAction({ actionType: 'trigger_sudden_death' });
                      setShowKnockoutModal(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black border-2 border-amber-900 shadow-[0_3px_0_#78350f] hover:brightness-105 active:translate-y-1 active:shadow-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>⚡ Force Sudden Death for Top Contenders</span>
                  </button>

                  {/* Declare Winner Direct Select */}
                  <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                    <select
                      value={selectedWinnerId}
                      onChange={(e) => setSelectedWinnerId(e.target.value)}
                      className="bg-[#fffdf8] border border-amber-800/30 text-stone-900 rounded-xl px-3 py-2 text-xs font-bold flex-1 outline-none"
                    >
                      <option value="">Select team to crown as 1 Winner...</option>
                      {teamsList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.avatar} {t.name} ({t.score} pts {t.isEliminated ? '- Knocked Out' : '- Alive'})
                        </option>
                      ))}
                    </select>

                    <button
                      disabled={!selectedWinnerId}
                      onClick={() => {
                        if (selectedWinnerId) {
                          onHostAction({ actionType: 'declare_knockout_winner', teamId: selectedWinnerId });
                          setShowKnockoutModal(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-black border border-purple-800 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-sm"
                    >
                      <Crown className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Declare Winner</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenders Roster (Up to 40 Teams) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Contenders List ({teamsList.length} Teams)
                  </span>
                  <span className="text-xs text-stone-600">
                    Click "Knock Out" or "Revive" to manually adjust any team's status
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {teamsList.map((team, idx) => (
                    <div
                      key={team.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        team.isEliminated
                          ? 'bg-red-50 border-red-300 text-stone-500'
                          : 'bg-[#fffdf8] border-amber-800/20 text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[11px] font-mono text-stone-500 w-5">#{idx + 1}</span>
                        <span className="text-lg">{team.avatar}</span>
                        <span
                          className={`text-xs font-black truncate max-w-[120px] ${
                            team.isEliminated ? 'line-through text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {team.name}
                        </span>
                        <span className="text-xs font-bold text-amber-800">
                          {team.score}p
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {team.isEliminated ? (
                          <button
                            onClick={() =>
                              onHostAction({ actionType: 'revive_team', teamId: team.id })
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-[10px] font-black cursor-pointer flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Revive</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onHostAction({
                                actionType: 'eliminate_team',
                                teamId: team.id,
                                reason: 'Eliminated by Host',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 text-[10px] font-black cursor-pointer flex items-center gap-1"
                          >
                            <Skull className="w-3 h-3" />
                            <span>Knock Out</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onHostAction({ actionType: 'declare_knockout_winner', teamId: team.id });
                            setShowKnockoutModal(false);
                          }}
                          className="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-800/30 text-[10px] font-black cursor-pointer"
                          title="Crown as Sole Champion"
                        >
                          <Crown className="w-3 h-3 text-amber-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowKnockoutModal(false)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm border-2 border-amber-900 shadow-[0_3px_0_#78350f] cursor-pointer"
            >
              Done with Knockout Controls
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
