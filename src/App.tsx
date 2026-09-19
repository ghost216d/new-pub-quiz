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
import { getInitialSoloProgression, saveSoloProgression } from './data/cartoonMapsData';
import { SoloProgression } from './types';

type AppRole = 'landing' | 'host' | 'player' | 'tv' | 'solo';

export default function App() {
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

  const wsRef = useRef<WebSocket | null>(null);

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
    } else if (roomState) {
      // Direct local state modification for offline host testing
      const updated = { ...roomState };
      if (action.actionType === 'start_game') {
        updated.status = 'question';
        updated.currentQuestionIndex = 0;
        updated.isTimerRunning = true;
      } else if (action.actionType === 'reveal_answer') {
        updated.status = 'answer_reveal';
      } else if (action.actionType === 'next_question') {
        const total = updated.rounds[updated.currentRoundIndex].questions.length;
        if (updated.currentQuestionIndex + 1 < total) {
          updated.currentQuestionIndex += 1;
        }
        updated.status = 'question';
        updated.submissions = {};
      } else if (action.actionType === 'trigger_milestone') {
        updated.status = 'milestone_intermission';
      } else if (action.actionType === 'close_milestone') {
        updated.status = 'question';
      } else if (action.actionType === 'add_team') {
        const currentCount = Object.keys(updated.teams).length;
        const maxAllowed = updated.settings.maxTeams || 40;
        if (currentCount < maxAllowed) {
          const newId = `team_${Date.now()}`;
          updated.teams = {
            ...updated.teams,
            [newId]: {
              id: newId,
              name: action.name.trim() || `Team ${currentCount + 1}`,
              avatar: action.avatar || TEAM_AVATARS[currentCount % TEAM_AVATARS.length],
              color: TEAM_COLORS[currentCount % TEAM_COLORS.length],
              score: 0,
              isOnline: true,
              scoreHistory: [],
            },
          };
        }
      } else if (action.actionType === 'remove_team') {
        const copy = { ...updated.teams };
        delete copy[action.teamId];
        updated.teams = copy;
      } else if (action.actionType === 'create_preset_teams') {
        updated.teams = createPresetTeams(action.count, action.scheme);
        updated.settings.maxTeams = Math.max(updated.settings.maxTeams || 40, action.count);
      } else if (action.actionType === 'clear_teams') {
        updated.teams = {};
      } else if (action.actionType === 'update_settings') {
        updated.settings = { ...updated.settings, ...action.settings };
      }
      setRoomState(updated);
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

  return (
    <div className="min-h-screen min-h-[100dvh] bg-pub-wood text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 pb-safe">
      {/* Top App Header (hidden on full TV mode for cinema display) */}
      {role !== 'tv' && (
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
      <main className="flex-1 w-full px-2.5 py-3 sm:px-4 md:px-6 md:py-6 flex flex-col justify-start">
        {role === 'landing' && (
          <LandingView
            onHostGame={handleHostGame}
            onJoinGame={handleJoinGame}
            onConnectTV={handleConnectTV}
            onStartSolo={() => setRole('solo')}
            initialMode="host"
            showSoloHero={false}
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
            onBackToHome={handleHomeClick}
            onOpenQuizMaster={() => setRole('landing')}
          />
        )}
      </main>

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* First-Time Sign In Prompt (Google vs Guest + Facebook Linking) */}
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
