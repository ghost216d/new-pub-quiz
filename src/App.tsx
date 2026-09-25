import React, { useState, useEffect, useRef } from 'react';
import { RoomState, WSMessage, HostActionPayload, Team } from './types';
import { DEFAULT_ROUNDS } from './data/defaultQuestions';
import { randomizeQuestionOptions } from './utils/questionQuality';
import { createPresetTeams, TEAM_AVATARS, TEAM_COLORS } from './data/teamPresets';
import { Header } from './components/Header';
import { LandingView, RoomLobbyPreview } from './components/LandingView';
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
import {
  clearFirebaseRoomActivity,
  createFirebaseRoom,
  findFirebaseHostRoom,
  findFirebaseRoom,
  isFirebaseMultiplayerConfigured,
  joinFirebaseTeam,
  leaveFirebaseTeam,
  publishFirebaseRoom,
  submitFirebaseAnswer,
  subscribeFirebaseHostActivity,
  subscribeFirebaseRoom,
} from './utils/firebaseMultiplayer';

type AppRole = 'landing' | 'host' | 'player' | 'tv' | 'solo';
const HOST_SESSION_KEY = 'pubquiz_active_host_room_v1';

const quizMasterRounds = () => DEFAULT_ROUNDS
  .filter((round) => round.type !== 'music')
  .map((round, index) => ({
    ...round,
    roundNumber: index + 1,
    questions: round.questions.map((question) => ({
      ...randomizeQuestionOptions(question),
      roundNumber: index + 1,
      musicData: undefined,
    })),
  }));

const removeMusicFromRoom = (source: RoomState): RoomState => {
  const room = structuredClone(source);
  room.rounds = room.rounds
    .filter((round) => round.type !== 'music')
    .map((round, index) => ({
      ...round,
      roundNumber: index + 1,
      questions: round.questions.map((question) => ({ ...question, roundNumber: index + 1, musicData: undefined })),
    }));
  room.currentRoundIndex = Math.min(room.currentRoundIndex, Math.max(0, room.rounds.length - 1));
  room.musicPlaying = false;
  room.activeMusicTrack = undefined;
  return room;
};

const multiplayerHttpBase = (): string | null => {
  const configured = String(import.meta.env.VITE_MULTIPLAYER_API_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  if (window.location.hostname.endsWith('github.io')) return null;
  return '';
};

const multiplayerWsUrl = (): string | null => {
  const configured = String(import.meta.env.VITE_MULTIPLAYER_WS_URL || '').trim();
  if (configured) return configured;
  const httpBase = multiplayerHttpBase();
  if (httpBase === null) return null;
  if (httpBase) return `${httpBase.replace(/^http/, 'ws')}/ws`;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

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
        room.teams[id] = { id, name: action.name.trim() || `Team ${count + 1}`, avatar: action.avatar || TEAM_AVATARS[count % TEAM_AVATARS.length], color: TEAM_COLORS[count % TEAM_COLORS.length], score: 0, isOnline: false, connectedPlayers: 0, scoreHistory: [] };
      }
      break;
    }
    case 'rename_team': {
      const team = room.teams[action.teamId];
      const name = action.name.trim().slice(0, 40);
      if (team && name) team.name = name;
      break;
    }
    case 'set_team_join_locked':
      if (room.teams[action.teamId]) room.teams[action.teamId].isJoinLocked = action.locked;
      break;
    case 'merge_teams': {
      const source = room.teams[action.sourceTeamId];
      const target = room.teams[action.targetTeamId];
      if (source && target && source.id !== target.id) {
        target.score += source.score;
        target.scoreHistory.push(...source.scoreHistory);
        delete room.teams[source.id];
        delete room.submissions[source.id];
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
  const [activeHostCode, setActiveHostCode] = useState<string>(() => {
    try { return localStorage.getItem(HOST_SESSION_KEY)?.trim().toUpperCase() || ''; } catch { return ''; }
  });
  const [myTeamId, setMyTeamId] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [teamAvatar, setTeamAvatar] = useState<string>('🍺');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'reconnecting' | 'standalone' | 'disconnected'>('disconnected');
  const [initialRoomCode, setInitialRoomCode] = useState('');
  const [showCover, setShowCover] = useState(true);
  const [coverProgress, setCoverProgress] = useState(6);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(false);
  const firebaseRoomUnsubscribeRef = useRef<null | (() => void)>(null);
  const firebaseHostUnsubscribeRef = useRef<null | (() => void)>(null);
  const usingFirebaseRef = useRef(false);

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

  useEffect(() => {
    if (role !== 'host' || !usingFirebaseRef.current || !roomState) return;
    const publishTimer = window.setTimeout(() => {
      publishFirebaseRoom(roomState).catch((error) => {
        console.error('Unable to publish Firebase room state:', error);
        setConnectionStatus('reconnecting');
      });
    }, 120);
    return () => window.clearTimeout(publishTimer);
  }, [role, roomState]);

  // Check URL parameters for direct room joining or TV mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    const roleParam = params.get('role');

    if (codeParam) {
      const cleanCode = codeParam.toUpperCase();
      setRoomCode(cleanCode);
      setInitialRoomCode(cleanCode);
      if (roleParam === 'tv') {
        handleConnectTV(cleanCode);
      } else {
        setRole('landing');
      }
    }
  }, []);

  // Connect to WebSocket Server
  const connectWebSocket = (
    targetCode: string,
    targetRole: 'host' | 'player' | 'tv',
    teamData?: { teamId: string; name: string; avatar: string },
    retryCount = 0,
  ) => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const wsUrl = multiplayerWsUrl();
    if (!wsUrl) {
      setConnectionStatus('disconnected');
      setIsLoading(false);
      setErrorMessage('Live multiplayer is not connected yet. The Quiz Master must use the hosted multiplayer service.');
      return;
    }

    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      shouldReconnectRef.current = true;

      ws.onopen = () => {
        setConnectionStatus('connected');
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
        setConnectionStatus('reconnecting');
      };

      ws.onclose = () => {
        if (shouldReconnectRef.current && retryCount < 5) {
          setConnectionStatus('reconnecting');
          reconnectTimerRef.current = window.setTimeout(
            () => connectWebSocket(targetCode, targetRole, teamData, retryCount + 1),
            Math.min(6000, 1000 * (retryCount + 1)),
          );
          return;
        }
        setConnectionStatus('disconnected');
        setIsLoading(false);
        setErrorMessage('Connection lost. Your team is remembered—find the room again to reconnect.');
      };
    } catch {
      setConnectionStatus('disconnected');
      setIsLoading(false);
      setErrorMessage('Unable to connect to the live quiz room.');
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
        rounds: quizMasterRounds(),
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

  const connectFirebaseRoom = async (
    targetCode: string,
    targetRole: 'host' | 'player' | 'tv',
    teamData?: { teamId: string; name: string; avatar: string },
  ) => {
    firebaseRoomUnsubscribeRef.current?.();
    firebaseHostUnsubscribeRef.current?.();
    usingFirebaseRef.current = true;
    setConnectionStatus('connecting');
    try {
      if (targetRole === 'host') {
        firebaseHostUnsubscribeRef.current = await subscribeFirebaseHostActivity(
          targetCode,
          (joinedTeams) => setRoomState((current) => {
            if (!current) return current;
            const next = structuredClone(current);
            Object.entries(joinedTeams).forEach(([teamId, joined]) => {
              const existing = next.teams[teamId];
              if (existing?.isJoinLocked && !existing.isOnline) return;
              next.teams[teamId] = existing
                ? { ...existing, name: joined.name || existing.name, avatar: joined.avatar || existing.avatar, isOnline: true, connectedPlayers: joined.connectedPlayers }
                : joined;
            });
            (Object.values(next.teams) as Team[]).forEach((team) => {
              if (!joinedTeams[team.id] && team.connectedPlayers) {
                team.connectedPlayers = 0;
                team.isOnline = false;
              }
            });
            return next;
          }),
          (incoming) => setRoomState((current) => {
            if (!current) return current;
            const next = structuredClone(current);
            const question = next.rounds[next.currentRoundIndex]?.questions[next.currentQuestionIndex];
            const questionKey = `${next.currentRoundIndex}:${next.currentQuestionIndex}:${question?.id || ''}`;
            incoming.filter((submission) => submission.questionKey === questionKey).forEach((submission) => {
              const isCorrect = !!question && submission.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
              next.submissions[submission.teamId] = {
                teamId: submission.teamId,
                teamName: submission.teamName,
                answer: submission.answer,
                submittedAt: submission.submittedAt,
                isCorrect,
                reviewedByHost: false,
                pointsAwarded: isCorrect ? question?.points || 10 : 0,
              };
            });
            return next;
          }),
          (error) => setErrorMessage(error.message),
        );
      } else {
        if (teamData) await joinFirebaseTeam(targetCode, teamData);
        firebaseRoomUnsubscribeRef.current = await subscribeFirebaseRoom(
          targetCode,
          (state) => {
            setRoomState(state);
            setConnectionStatus('connected');
            setErrorMessage(null);
            setIsLoading(false);
          },
          (error) => {
            setErrorMessage(error.message);
            setConnectionStatus('disconnected');
            setIsLoading(false);
          },
        );
      }
      setConnectionStatus('connected');
      setErrorMessage(null);
      setIsLoading(false);
    } catch (error) {
      setConnectionStatus('disconnected');
      setIsLoading(false);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to connect to the Firebase lobby.');
    }
  };

  const handleResumeHostGame = async (savedCode = activeHostCode) => {
    const cleanCode = savedCode.trim().toUpperCase();
    if (!cleanCode || !isFirebaseMultiplayerConfigured) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const savedRoom = await findFirebaseHostRoom(cleanCode);
      const restoredRoom = removeMusicFromRoom(savedRoom);
      setRoomCode(cleanCode);
      setRoomState(restoredRoom);
      setRole('host');
      setActiveHostCode(cleanCode);
      await connectFirebaseRoom(cleanCode, 'host');
    } catch (error) {
      localStorage.removeItem(HOST_SESSION_KEY);
      setActiveHostCode('');
      setIsLoading(false);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to restore the previous Quiz Master lobby.');
      setRole('landing');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('room') || !activeHostCode) return;
    void handleResumeHostGame(activeHostCode);
  }, []);

  // Host a new game (supports choosing up to 40 teams)
  const handleHostGame = async (
    hostName: string,
    maxTeams: number = 40,
    prePopulateScheme: 'none' | 'tables' | 'pub_legends' = 'none'
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    if (isFirebaseMultiplayerConfigured) {
      const seedCode = 'TEMP';
      handleOfflineFallback(seedCode, 'host', undefined, maxTeams, prePopulateScheme);
      const initialTeams = prePopulateScheme === 'none' ? {} : createPresetTeams(Math.min(40, maxTeams), prePopulateScheme);
      const initial: RoomState = {
        code: seedCode, hostName, status: 'lobby', currentRoundIndex: 0, currentQuestionIndex: 0,
        rounds: quizMasterRounds(), teams: initialTeams,
        timerRemaining: 30, timerTotal: 30, isTimerRunning: false, submissions: {},
        settings: { answerMode: 'multiple_choice', showMilestoneEvery10: true, roundTimerSeconds: 30, allowSoloAI: true, maxTeams: Math.min(40, Math.max(2, maxTeams)), prePopulateScheme },
        musicPlaying: false,
      };
      try {
        const created = await createFirebaseRoom(initial);
        setRoomCode(created.code);
        setRoomState(created);
        setRole('host');
        localStorage.setItem(HOST_SESSION_KEY, created.code);
        setActiveHostCode(created.code);
        await connectFirebaseRoom(created.code, 'host');
      } catch (error) {
        setIsLoading(false);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to create the Firebase lobby.');
      }
      return;
    }

    const apiBase = multiplayerHttpBase();
    if (apiBase === null) {
      const randomCode = 'PUB1';
      setRoomCode(randomCode);
      setRole('host');
      localStorage.setItem(HOST_SESSION_KEY, randomCode);
      setActiveHostCode(randomCode);
      setConnectionStatus('standalone');
      setErrorMessage('Standalone Quiz Master mode: other phones and the TV cannot join until the multiplayer service is connected.');
      handleOfflineFallback(randomCode, 'host', undefined, maxTeams, prePopulateScheme);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName, maxTeams, prePopulateScheme }),
      });
      const data = await res.json();
      const code = data.roomCode;
      setRoomCode(code);
      setRole('host');
      localStorage.setItem(HOST_SESSION_KEY, code);
      setActiveHostCode(code);
      connectWebSocket(code, 'host');
    } catch {
      // Local fallback
      const randomCode = 'PUB1';
      setRoomCode(randomCode);
      setRole('host');
      localStorage.setItem(HOST_SESSION_KEY, randomCode);
      setActiveHostCode(randomCode);
      handleOfflineFallback(randomCode, 'host', undefined, maxTeams, prePopulateScheme);
    }
  };

  const handleFindRoom = async (code: string): Promise<RoomLobbyPreview> => {
    if (isFirebaseMultiplayerConfigured) {
      const state = await findFirebaseRoom(code);
      return { teams: Object.values(state.teams).sort((a, b) => a.name.localeCompare(b.name)), maxTeams: state.settings.maxTeams || 40 };
    }
    const apiBase = multiplayerHttpBase();
    if (apiBase === null) throw new Error('Live multiplayer is not connected on this published version yet.');
    const response = await fetch(`${apiBase}/api/rooms/${encodeURIComponent(code)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(response.status === 404 ? 'Room not found. Check the code with the Quiz Master.' : 'Unable to load this room.');
    const state = await response.json() as RoomState;
    return {
      teams: Object.values(state.teams).sort((a, b) => a.name.localeCompare(b.name)),
      maxTeams: state.settings.maxTeams || 40,
    };
  };

  // Join existing game as player (can choose from pre-set teams or create new up to 40)
  const handleJoinGame = (code: string, name: string, avatar: string, selectedTeamId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const newTeamId = selectedTeamId || `team_${Date.now()}`;
    try {
      localStorage.setItem(`pubquiz_team_${code}`, newTeamId);
    } catch {}

    setRoomCode(code);
    setTeamName(name);
    setTeamAvatar(avatar);
    setMyTeamId(newTeamId);
    setRole('player');

    if (isFirebaseMultiplayerConfigured) {
      void connectFirebaseRoom(code, 'player', { teamId: newTeamId, name, avatar });
      return;
    }
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
    if (isFirebaseMultiplayerConfigured) void connectFirebaseRoom(code, 'tv');
    else connectWebSocket(code, 'tv');
  };

  // Player submits answer
  const handleSubmitAnswer = (answer: string) => {
    if (!roomCode || !myTeamId) return;

    if (usingFirebaseRef.current && roomState) {
      const currentQuestion = roomState.rounds[roomState.currentRoundIndex]?.questions[roomState.currentQuestionIndex];
      const questionKey = `${roomState.currentRoundIndex}:${roomState.currentQuestionIndex}:${currentQuestion?.id || ''}`;
      void submitFirebaseAnswer(roomCode, myTeamId, teamName || 'My Team', answer, questionKey).catch((error) => setErrorMessage(error.message));
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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

    if (usingFirebaseRef.current) {
      if (['next_question', 'prev_question', 'jump_to_question', 'next_round', 'prev_round', 'start_round'].includes(action.actionType)) {
        void clearFirebaseRoomActivity(roomCode).catch(() => undefined);
      }
      setRoomState((current) => {
        if (!current) return current;
        const next = applyLocalHostAction(current, action);
        if (['reveal_answer', 'grade_answer', 'adjust_score'].includes(action.actionType)) {
          void publishFirebaseRoom(next).catch((error) => {
            console.error('Unable to save the updated scores:', error);
            setConnectionStatus('reconnecting');
          });
        }
        return next;
      });
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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
    shouldReconnectRef.current = false;
    if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }
    firebaseRoomUnsubscribeRef.current?.();
    firebaseHostUnsubscribeRef.current?.();
    if (role === 'player' && usingFirebaseRef.current) void leaveFirebaseTeam(roomCode);
    usingFirebaseRef.current = false;
    setRole('solo');
    setRoomState(null);
    setErrorMessage(null);
    setConnectionStatus('disconnected');
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
        {(role === 'solo' || role === 'landing') && activeHostCode && (
          <button
            id="resume-live-quiz-btn"
            onClick={() => void handleResumeHostGame()}
            disabled={isLoading}
            className="fixed z-50 top-safe left-3 mt-3 flex items-center gap-2 rounded-2xl border-2 border-emerald-800 bg-emerald-500 px-4 py-3 text-sm font-cartoon text-emerald-950 shadow-[0_4px_0_#065f46] transition hover:bg-emerald-400 active:translate-y-0.5 disabled:opacity-60"
          >
            <span aria-hidden="true">↩️</span>
            <span>{isLoading ? 'RESTORING QUIZ…' : `RESUME LIVE QUIZ · ${activeHostCode}`}</span>
          </button>
        )}
        {role === 'landing' && (
          <LandingView
            onHostGame={handleHostGame}
            onJoinGame={handleJoinGame}
            onFindRoom={handleFindRoom}
            onConnectTV={handleConnectTV}
            onStartSolo={() => setRole('solo')}
            initialMode={initialRoomCode ? 'join' : 'host'}
            showSoloHero={true}
            isLoading={isLoading}
            error={errorMessage}
            initialRoomCode={initialRoomCode}
          />
        )}

        {role !== 'solo' && role !== 'landing' && (
          <div className={`mx-auto mb-3 w-fit rounded-full border px-3 py-1 text-[11px] font-black ${connectionStatus === 'connected' ? 'border-emerald-500 bg-emerald-100 text-emerald-900' : connectionStatus === 'standalone' ? 'border-amber-500 bg-amber-100 text-amber-950' : 'border-rose-500 bg-rose-100 text-rose-900'}`}>
            {connectionStatus === 'connected' ? '● LIVE ROOM CONNECTED' : connectionStatus === 'standalone' ? '● STANDALONE MODE' : connectionStatus === 'reconnecting' ? '● RECONNECTING…' : '● NOT CONNECTED'}
          </div>
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
