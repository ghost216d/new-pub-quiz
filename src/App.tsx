import React, { useState, useEffect, useRef } from 'react';
import { RoomState, WSMessage, HostActionPayload, Team } from './types';
import { DEFAULT_ROUNDS } from './data/defaultQuestions';
import { createPresetTeams, TEAM_AVATARS, TEAM_COLORS } from './data/teamPresets';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { HostControls } from './components/HostControls';
import { TVDisplay } from './components/TVDisplay';
import { PlayerMobileView } from './components/PlayerMobileView';
import { SoloQuizView } from './components/SoloQuizView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthModal } from './components/AuthModal';
import { BGMController } from './components/BGMController';
import { getInitialSoloProgression, saveSoloProgression } from './data/cartoonMapsData';
import { SoloProgression } from './types';
import { getLondonTheme } from './utils/londonTheme';

type AppRole = 'landing' | 'host' | 'player' | 'tv' | 'solo';

const resetQuestionState = (room: RoomState, startTimer = true) => {
  const question = room.rounds[room.currentRoundIndex]?.questions[room.currentQuestionIndex];
  room.status = 'question';
  room.submissions = {};
  Object.values(room.teams).forEach((team) => { team.currentSubmission = undefined; });
  room.timerTotal = question?.timeLimitSec || room.settings.roundTimerSeconds;
  room.timerRemaining = room.timerTotal;
  room.isTimerRunning = startTimer;
  room.activeMusicTrack = question?.musicData
    ? {
        melodyId: question.musicData.melodyId,
        songTitle: question.musicData.songTitle,
        artist: question.musicData.artist,
        audioUrl: question.musicData.audioUrl,
        pictureClues: question.musicData.cluePictures,
      }
    : undefined;
};

const applyLocalHostAction = (current: RoomState, action: HostActionPayload): RoomState => {
  const room = structuredClone(current);
  const activeTeams = () => Object.values(room.teams).filter((team) => !team.isEliminated);

  switch (action.actionType) {
    case 'start_game':
      room.currentRoundIndex = 0;
      room.currentQuestionIndex = 0;
      room.status = 'round_transition';
      room.submissions = {};
      room.isTimerRunning = false;
      break;
    case 'start_round':
      if (room.rounds[action.roundIndex]) {
        room.currentRoundIndex = action.roundIndex;
        room.currentQuestionIndex = 0;
        resetQuestionState(room);
      }
      break;
    case 'next_round':
      if (room.currentRoundIndex + 1 < room.rounds.length) {
        room.currentRoundIndex += 1;
        room.currentQuestionIndex = 0;
        room.status = 'round_transition';
        room.submissions = {};
        room.isTimerRunning = false;
      } else {
        room.status = 'game_over';
        room.isTimerRunning = false;
      }
      break;
    case 'prev_round':
      if (room.currentRoundIndex > 0) {
        room.currentRoundIndex -= 1;
        room.currentQuestionIndex = 0;
        room.status = 'round_transition';
        room.submissions = {};
        room.isTimerRunning = false;
      }
      break;
    case 'next_question': {
      const round = room.rounds[room.currentRoundIndex];
      if (room.currentQuestionIndex + 1 < (round?.questions.length || 0)) {
        room.currentQuestionIndex += 1;
        resetQuestionState(room);
      } else if (room.currentRoundIndex + 1 < room.rounds.length) {
        room.currentRoundIndex += 1;
        room.currentQuestionIndex = 0;
        room.status = 'round_transition';
        room.submissions = {};
        room.isTimerRunning = false;
      } else {
        room.status = 'game_over';
        room.isTimerRunning = false;
      }
      break;
    }
    case 'prev_question':
      if (room.currentQuestionIndex > 0) {
        room.currentQuestionIndex -= 1;
        resetQuestionState(room, false);
      }
      break;
    case 'jump_to_question':
      if (room.rounds[action.roundIndex]?.questions[action.questionIndex]) {
        room.currentRoundIndex = action.roundIndex;
        room.currentQuestionIndex = action.questionIndex;
        resetQuestionState(room);
      }
      break;
    case 'reveal_answer': {
      room.status = 'answer_reveal';
      room.isTimerRunning = false;
      const round = room.rounds[room.currentRoundIndex];
      const question = round?.questions[room.currentQuestionIndex];
      Object.entries(room.submissions).forEach(([teamId, submission]) => {
        const team = room.teams[teamId];
        if (!team || submission.reviewedByHost) return;
        const awarded = submission.isCorrect ? (submission.pointsAwarded || question?.points || 0) : 0;
        team.score += awarded;
        team.scoreHistory.push({
          questionIndex: room.currentQuestionIndex + 1,
          roundNumber: round?.roundNumber || 1,
          delta: awarded,
          cumulativeScore: team.score,
          isCorrect: !!submission.isCorrect,
        });
        submission.pointsAwarded = awarded;
        submission.reviewedByHost = true;
      });
      break;
    }
    case 'toggle_timer':
      room.isTimerRunning = action.isRunning ?? !room.isTimerRunning;
      break;
    case 'reset_timer':
      room.timerTotal = action.seconds && action.seconds > 0 ? action.seconds : room.settings.roundTimerSeconds;
      room.timerRemaining = room.timerTotal;
      room.isTimerRunning = true;
      break;
    case 'add_time':
      room.timerRemaining = Math.max(0, room.timerRemaining + action.seconds);
      room.timerTotal = Math.max(room.timerTotal, room.timerRemaining);
      break;
    case 'set_answer_mode': {
      room.settings.answerMode = action.mode;
      const question = room.rounds[room.currentRoundIndex]?.questions[room.currentQuestionIndex];
      if (question) question.type = action.mode;
      break;
    }
    case 'trigger_milestone':
      room.status = 'milestone_intermission';
      room.isTimerRunning = false;
      break;
    case 'close_milestone':
      room.status = 'question';
      room.isTimerRunning = true;
      break;
    case 'grade_answer': {
      const team = room.teams[action.teamId];
      const submission = room.submissions[action.teamId];
      if (team && submission) {
        const previous = submission.reviewedByHost ? submission.pointsAwarded || 0 : 0;
        const points = action.isCorrect ? Math.max(0, action.points) : 0;
        team.score = Math.max(0, team.score - previous + points);
        submission.isCorrect = action.isCorrect;
        submission.reviewedByHost = true;
        submission.pointsAwarded = points;
      }
      break;
    }
    case 'adjust_score':
      if (room.teams[action.teamId]) {
        room.teams[action.teamId].score = Math.max(0, room.teams[action.teamId].score + action.delta);
      }
      break;
    case 'toggle_music':
      room.musicPlaying = action.isPlaying;
      break;
    case 'update_settings':
      room.settings = {
        ...room.settings,
        ...action.settings,
        maxTeams: Math.min(40, Math.max(2, action.settings.maxTeams ?? room.settings.maxTeams)),
      };
      break;
    case 'upload_music_picture':
      room.rounds.forEach((round) => round.questions.forEach((question) => {
        if (question.id !== action.questionId) return;
        question.musicData ||= { songTitle: 'Custom Song', artist: 'Custom Artist', decadeOrGenre: 'Music Round', cluePictures: [] };
        question.musicData.cluePictures ||= [];
        question.musicData.cluePictures.push(action.pictureDataUrl);
      }));
      break;
    case 'load_questions':
      room.rounds = action.rounds;
      room.currentRoundIndex = 0;
      room.currentQuestionIndex = 0;
      room.submissions = {};
      room.isTimerRunning = false;
      break;
    case 'add_team': {
      const count = Object.keys(room.teams).length;
      if (count < (room.settings.maxTeams || 40)) {
        const id = `team_${Date.now()}`;
        room.teams[id] = { id, name: action.name.trim() || `Team ${count + 1}`, avatar: action.avatar || TEAM_AVATARS[count % TEAM_AVATARS.length], color: TEAM_COLORS[count % TEAM_COLORS.length], score: 0, isOnline: true, scoreHistory: [] };
      }
      break;
    }
    case 'remove_team':
      delete room.teams[action.teamId];
      delete room.submissions[action.teamId];
      break;
    case 'create_preset_teams': {
      const count = Math.min(40, Math.max(1, action.count));
      room.teams = createPresetTeams(count, action.scheme);
      room.settings.maxTeams = Math.max(room.settings.maxTeams, count);
      room.submissions = {};
      break;
    }
    case 'clear_teams':
      room.teams = {};
      room.submissions = {};
      break;
    case 'toggle_knockout_mode':
      room.settings.knockoutMode = action.enabled ?? !room.settings.knockoutMode;
      room.settings.knockoutRule ||= 'wrong_answer';
      break;
    case 'set_knockout_rule':
      room.settings.knockoutRule = action.rule;
      break;
    case 'eliminate_team': {
      const team = room.teams[action.teamId];
      if (team) {
        team.isEliminated = true;
        team.eliminatedAtQuestion = room.currentQuestionIndex + 1;
        team.eliminatedRound = room.rounds[room.currentRoundIndex]?.roundNumber || 1;
        team.eliminatedReason = action.reason || 'Knocked Out by Host';
        const remaining = activeTeams();
        if (remaining.length === 1) {
          room.knockoutWinnerTeamId = remaining[0].id;
          room.status = 'knockout_winner';
          room.isTimerRunning = false;
        }
      }
      break;
    }
    case 'revive_team': {
      const team = room.teams[action.teamId];
      if (team) {
        team.isEliminated = false;
        team.eliminatedReason = undefined;
        team.eliminatedAtQuestion = undefined;
        team.eliminatedRound = undefined;
        if (room.status === 'knockout_winner') room.status = 'question';
        room.knockoutWinnerTeamId = undefined;
      }
      break;
    }
    case 'trigger_sudden_death': {
      const teams = Object.values(room.teams).sort((a, b) => b.score - a.score);
      if (teams.length >= 2) {
        const topScore = teams[0].score;
        const tied = teams.filter((team) => team.score === topScore);
        const contenders = tied.length > 1 ? tied : teams.slice(0, 2);
        const ids = new Set(contenders.map((team) => team.id));
        teams.forEach((team) => {
          team.isEliminated = !ids.has(team.id);
          team.eliminatedReason = ids.has(team.id) ? undefined : 'Did not qualify for Sudden Death';
        });
        room.settings.knockoutMode = true;
        room.settings.knockoutRule = 'wrong_answer';
        room.isSuddenDeathTiebreaker = true;
        room.knockoutWinnerTeamId = undefined;
        resetQuestionState(room);
      }
      break;
    }
    case 'reset_knockout':
      Object.values(room.teams).forEach((team) => {
        team.isEliminated = false;
        team.eliminatedReason = undefined;
        team.eliminatedAtQuestion = undefined;
        team.eliminatedRound = undefined;
      });
      room.knockoutWinnerTeamId = undefined;
      room.isSuddenDeathTiebreaker = false;
      room.lastKnockoutEliminations = [];
      if (room.status === 'knockout_winner') room.status = 'question';
      break;
    case 'declare_knockout_winner':
      if (room.teams[action.teamId]) {
        room.knockoutWinnerTeamId = action.teamId;
        room.status = 'knockout_winner';
        room.isTimerRunning = false;
      }
      break;
  }

  return room;
};

export default function App() {
  const [londonTheme, setLondonTheme] = useState(getLondonTheme);
  const [role, setRole] = useState<AppRole>('solo');
  const [progression, setProgression] = useState<SoloProgression>(getInitialSoloProgression());
  const [showFirstTimeAuth, setShowFirstTimeAuth] = useState<boolean>(() => {
    try {
      const prog = getInitialSoloProgression();
      const hasChosen = localStorage.getItem('cartoon_pubquiz_auth_prompted_v2');
      return !hasChosen && !prog.userProfile;
    } catch {
      return false;
    }
  });
  const [roomCode, setRoomCode] = useState<string>('');
  const [myTeamId, setMyTeamId] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [teamAvatar, setTeamAvatar] = useState<string>('🍺');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCover, setShowCover] = useState(true);
  const [coverProgress, setCoverProgress] = useState(6);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setCoverProgress(Math.min(100, 6 + Math.round((elapsed / 3000) * 94)));
    }, 80);
    const coverTimer = window.setTimeout(() => setShowCover(false), 3200);
    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(coverTimer);
    };
  }, []);

  useEffect(() => {
    const refreshTheme = () => setLondonTheme(getLondonTheme());
    document.documentElement.dataset.timeTheme = londonTheme.time;
    document.documentElement.dataset.season = londonTheme.season;
    const themeTimer = window.setInterval(refreshTheme, 60_000);
    return () => window.clearInterval(themeTimer);
  }, [londonTheme.time, londonTheme.season]);

  // GitHub Pages uses the local fallback, so keep its Quiz Master timer live too.
  useEffect(() => {
    if (!roomState?.isTimerRunning || wsRef.current?.readyState === WebSocket.OPEN) return;

    const timerId = window.setInterval(() => {
      setRoomState((current) => {
        if (!current?.isTimerRunning) return current;
        const remaining = Math.max(0, current.timerRemaining - 1);
        return {
          ...current,
          timerRemaining: remaining,
          isTimerRunning: remaining > 0,
        };
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [roomState?.isTimerRunning, roomState?.code]);

  // Check URL parameters for direct room joining or TV mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    const roleParam = params.get('role');

    if (codeParam) {
      const cleanCode = codeParam.toUpperCase();
      setRoomCode(cleanCode);
      if (roleParam === 'tv') {
        handleConnectTV(cleanCode);
      }
    }
  }, []);

  // Connect to WebSocket Server
  const connectWebSocket = (
    targetCode: string,
    targetRole: 'host' | 'player' | 'tv',
    teamData?: { teamId: string; name: string; avatar: string }
  ) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        const joinMsg: WSMessage = {
          type: 'join_room',
          roomCode: targetCode,
          role: targetRole,
          team: teamData,
        };
        ws.send(JSON.stringify(joinMsg));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'room_state') {
            setRoomState(data.state);
            setErrorMessage(null);
            setIsLoading(false);
          } else if (data.type === 'error') {
            setErrorMessage(data.message);
            setIsLoading(false);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        // Fallback to local room state if network or WebSocket is offline
        handleOfflineFallback(targetCode, targetRole, teamData);
      };

      ws.onclose = () => {
        // Closed
      };
    } catch {
      handleOfflineFallback(targetCode, targetRole, teamData);
    }
  };

  // Offline fallback to run seamlessly without an active internet or server connection
  const handleOfflineFallback = (
    targetCode: string,
    targetRole: 'host' | 'player' | 'tv',
    teamData?: { teamId: string; name: string; avatar: string },
    maxTeams: number = 40,
    prePopulateScheme: 'none' | 'tables' | 'pub_legends' = 'none'
  ) => {
    if (!roomState) {
      let initialTeams: Record<string, Team> = {};
      if (prePopulateScheme !== 'none') {
        initialTeams = createPresetTeams(Math.min(40, maxTeams), prePopulateScheme);
      }
      if (teamData) {
        initialTeams[teamData.teamId] = {
          id: teamData.teamId,
          name: teamData.name,
          avatar: teamData.avatar,
          color: '#F59E0B',
          score: 0,
          isOnline: true,
          scoreHistory: [],
        };
      }

      const fallbackRoom: RoomState = {
        code: targetCode,
        hostName: 'Local Quiz Master',
        status: 'lobby',
        currentRoundIndex: 0,
        currentQuestionIndex: 0,
        rounds: JSON.parse(JSON.stringify(DEFAULT_ROUNDS)),
        teams: initialTeams,
        timerRemaining: 30,
        timerTotal: 30,
        isTimerRunning: false,
        submissions: {},
        settings: {
          answerMode: 'multiple_choice',
          showMilestoneEvery10: true,
          roundTimerSeconds: 30,
          allowSoloAI: true,
          maxTeams: Math.min(40, Math.max(2, maxTeams)),
          prePopulateScheme,
        },
        musicPlaying: false,
      };
      setRoomState(fallbackRoom);
    }
    setIsLoading(false);
  };

  // Host a new game (supports choosing up to 40 teams)
  const handleHostGame = async (
    hostName: string,
    maxTeams: number = 40,
    prePopulateScheme: 'none' | 'tables' | 'pub_legends' = 'none'
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName, maxTeams, prePopulateScheme }),
      });
      const data = await res.json();
      const code = data.roomCode;
      setRoomCode(code);
      setRole('host');
      connectWebSocket(code, 'host');
    } catch {
      // Local fallback
      const randomCode = 'PUB1';
      setRoomCode(randomCode);
      setRole('host');
      handleOfflineFallback(randomCode, 'host', undefined, maxTeams, prePopulateScheme);
    }
  };

  // Join existing game as player (can choose from pre-set teams or create new up to 40)
  const handleJoinGame = (code: string, name: string, avatar: string, selectedTeamId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const newTeamId = selectedTeamId || `team_${Date.now()}`;

    setRoomCode(code);
    setTeamName(name);
    setTeamAvatar(avatar);
    setMyTeamId(newTeamId);
    setRole('player');

    connectWebSocket(code, 'player', {
      teamId: newTeamId,
      name,
      avatar,
    });
  };

  // Connect as TV screen
  const handleConnectTV = (code: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setRoomCode(code);
    setRole('tv');
    connectWebSocket(code, 'tv');
  };

  // Player submits answer
  const handleSubmitAnswer = (answer: string) => {
    if (!roomCode || !myTeamId) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const msg: WSMessage = {
        type: 'submit_answer',
        roomCode,
        teamId: myTeamId,
        answer,
      };
      wsRef.current.send(JSON.stringify(msg));
    } else {
      // Local fallback simulation
      if (roomState) {
        const currentRound = roomState.rounds[roomState.currentRoundIndex];
        const currentQ = currentRound?.questions[roomState.currentQuestionIndex];
        const isCorrect = currentQ ? answer === currentQ.correctAnswer : false;

        const sub = {
          teamId: myTeamId,
          teamName: teamName || 'My Team',
          answer,
          submittedAt: Date.now(),
          isCorrect,
          reviewedByHost: false,
          pointsAwarded: isCorrect ? currentQ?.points || 10 : 0,
        };

        setRoomState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            submissions: { ...prev.submissions, [myTeamId]: sub },
          };
        });
      }
    }
  };

  // Quiz Master Host action
  const handleHostAction = (action: HostActionPayload) => {
    if (!roomCode) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const msg: WSMessage = {
        type: 'host_action',
        roomCode,
        action,
      };
      wsRef.current.send(JSON.stringify(msg));
    } else {
      setRoomState((current) => current ? applyLocalHostAction(current, action) : current);
    }
  };

  const handleHomeClick = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setRole('solo');
    setRoomState(null);
    setErrorMessage(null);
  };

  if (showCover) {
    return (
      <section className="pub-quiz-cover" aria-label="The Pub Quiz is loading">
        <img
          className="pub-quiz-cover-art"
          src={`${import.meta.env.BASE_URL}pub-quiz-cover-host.webp`}
          alt="Cartoon portrait of the pub quiz host welcoming players"
        />
        <div className="pub-quiz-cover-shade" aria-hidden="true" />
        <div className="pub-quiz-cover-brand">
          <span className="pub-quiz-cover-kicker">🍺 TAVERN TRIVIA ADVENTURE 🍺</span>
          <h1>THE PUB QUIZ</h1>
          <p>Test your knowledge across London</p>
        </div>
        <div className="pub-quiz-cover-loading" role="status" aria-live="polite">
          <div className="pub-quiz-cover-loading-label">
            <span>Preparing tonight’s questions</span>
            <span>{coverProgress}%</span>
          </div>
          <div
            className="pub-quiz-cover-track"
            role="progressbar"
            aria-label="Loading The Pub Quiz"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={coverProgress}
          >
            <span style={{ width: `${coverProgress}%` }} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={`app-shell role-${role} theme-${londonTheme.time} season-${londonTheme.season} min-h-screen min-h-[100dvh] w-full max-w-full min-w-0 overflow-x-hidden text-stone-900 flex flex-col justify-between selection:bg-sky-300 selection:text-slate-950 pb-safe ${role === 'solo' ? 'bg-sky-100' : 'bg-pub-wood'}`}>
      {/* Top App Header (hidden on full TV mode for cinema display) */}
      {role !== 'tv' && role !== 'solo' && (
        <Header
          role={role}
          roomCode={roomCode}
          teamName={teamName}
          teamAvatar={teamAvatar}
          onHomeClick={handleHomeClick}
          onOpenTV={() => handleConnectTV(roomCode)}
        />
      )}

      {/* Main App Content Router */}
      <main className={role === 'solo' ? 'app-content flex-1 w-full max-w-full min-w-0 min-h-[100dvh] overflow-x-hidden' : 'app-content flex-1 w-full max-w-full min-w-0 overflow-x-hidden px-2.5 py-3 sm:px-4 md:px-6 md:py-6 flex flex-col justify-start'}>
        {role === 'landing' && (
          <LandingView
            onHostGame={handleHostGame}
            onJoinGame={handleJoinGame}
            onConnectTV={handleConnectTV}
            onStartSolo={() => setRole('solo')}
            initialMode="host"
            showSoloHero={true}
            isLoading={isLoading}
            error={errorMessage}
          />
        )}

        {role === 'tv' && roomState && (
          <TVDisplay roomState={roomState} onExitTV={handleHomeClick} />
        )}

        {role === 'host' && roomState && (
          <div className="max-w-6xl mx-auto w-full">
            <HostControls
              roomState={roomState}
              onHostAction={handleHostAction}
              onOpenTVView={() => handleConnectTV(roomCode)}
            />
          </div>
        )}

        {role === 'player' && roomState && (
          <PlayerMobileView
            roomState={roomState}
            myTeamId={myTeamId}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}

        {role === 'solo' && (
          <SoloQuizView
            onBackToHome={() => setRole('landing')}
            onOpenQuizMaster={() => setRole('landing')}
          />
        )}
      </main>

      {/* Music stays available on every screen, including Solo and quiz rounds. */}
      <BGMController compact className="global-music-control" />

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* First-Time Sign In Prompt (Google, email or guest) */}
      <AuthModal
        isOpen={showFirstTimeAuth}
        onClose={() => {
          localStorage.setItem('cartoon_pubquiz_auth_prompted_v2', 'true');
          setShowFirstTimeAuth(false);
        }}
        progression={progression}
        onUpdateProgression={(newProg) => {
          setProgression(newProg);
          saveSoloProgression(newProg);
          localStorage.setItem('cartoon_pubquiz_auth_prompted_v2', 'true');
          setShowFirstTimeAuth(false);
        }}
        isFirstTime={true}
      />
    </div>
  );
}
