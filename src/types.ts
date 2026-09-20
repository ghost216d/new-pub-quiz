export type QuestionAnswerMode = 'multiple_choice' | 'free_text';
export type RoundType = 'trivia' | 'music' | 'picture';
export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Question {
  id: string;
  roundNumber: number;
  category: string;
  prompt: string;
  type: QuestionAnswerMode;
  difficulty?: QuizDifficulty;
  options: string[]; // 4 options for multiple choice
  correctAnswer: string;
  acceptableAnswers?: string[]; // Alternative acceptable spellings for free-text
  explanation?: string;
  points: number;
  timeLimitSec: number;
  imageUrl?: string; // Optional picture round image or music clue
  musicData?: {
    songTitle: string;
    artist: string;
    decadeOrGenre: string;
    cluePictures?: string[]; // Multiple pictures uploaded/associated
    melodyId?: string; // Built-in synthesizer tune key
    audioUrl?: string; // Custom audio upload or data url
  };
}

export interface TeamAnswerSubmission {
  teamId: string;
  teamName: string;
  answer: string;
  submittedAt: number;
  isCorrect?: boolean;
  reviewedByHost?: boolean;
  pointsAwarded?: number;
}

export interface TeamScoreHistoryEntry {
  questionIndex: number;
  roundNumber: number;
  delta: number;
  cumulativeScore: number;
  isCorrect: boolean;
}

export interface Team {
  id: string;
  name: string;
  avatar: string; // Emoji or cartoon icon token
  color: string;
  score: number;
  isOnline: boolean;
  scoreHistory: TeamScoreHistoryEntry[];
  currentSubmission?: TeamAnswerSubmission;
  isEliminated?: boolean;
  eliminatedAtQuestion?: number;
  eliminatedRound?: number;
  eliminatedReason?: string;
}

export interface Round {
  roundNumber: number;
  title: string;
  type: RoundType;
  description: string;
  questions: Question[];
}

export interface QuizSettings {
  answerMode: 'multiple_choice' | 'free_text' | 'mixed';
  showMilestoneEvery10: boolean;
  roundTimerSeconds: number;
  allowSoloAI: boolean;
  maxTeams: number; // Configurable up to 40 teams
  prePopulateScheme?: 'none' | 'tables' | 'pub_legends';
  knockoutMode?: boolean;
  knockoutRule?: 'wrong_answer' | 'lowest_per_round' | 'sudden_death_tiebreaker';
}

export interface RoomState {
  code: string;
  hostName: string;
  status: 'lobby' | 'round_transition' | 'question' | 'answer_reveal' | 'milestone_intermission' | 'game_over' | 'knockout_winner';
  currentRoundIndex: number;
  currentQuestionIndex: number; // 0 to totalQuestions - 1
  rounds: Round[];
  teams: Record<string, Team>;
  timerRemaining: number;
  timerTotal: number;
  isTimerRunning: boolean;
  submissions: Record<string, TeamAnswerSubmission>; // teamId -> submission
  settings: QuizSettings;
  musicPlaying: boolean;
  activeMusicTrack?: {
    melodyId?: string;
    songTitle?: string;
    artist?: string;
    audioUrl?: string;
    pictureClues?: string[];
  };
  lastMilestoneQuestionIndex?: number;
  knockoutWinnerTeamId?: string;
  isSuddenDeathTiebreaker?: boolean;
  lastKnockoutEliminations?: string[];
}

export type WSMessage =
  | { type: 'join_room'; role: 'host' | 'player' | 'tv'; roomCode: string; team?: { name: string; avatar: string; color?: string; teamId?: string } }
  | { type: 'room_state'; state: RoomState }
  | { type: 'submit_answer'; roomCode: string; teamId: string; answer: string }
  | { type: 'host_action'; roomCode: string; action: HostActionPayload }
  | { type: 'error'; message: string };

export type HostActionPayload =
  | { actionType: 'start_game' }
  | { actionType: 'start_round'; roundIndex: number }
  | { actionType: 'next_round' }
  | { actionType: 'prev_round' }
  | { actionType: 'next_question' }
  | { actionType: 'prev_question' }
  | { actionType: 'jump_to_question'; roundIndex: number; questionIndex: number }
  | { actionType: 'reveal_answer' }
  | { actionType: 'toggle_timer'; isRunning?: boolean }
  | { actionType: 'reset_timer'; seconds?: number }
  | { actionType: 'add_time'; seconds: number }
  | { actionType: 'set_answer_mode'; mode: 'multiple_choice' | 'free_text' }
  | { actionType: 'trigger_milestone' }
  | { actionType: 'close_milestone' }
  | { actionType: 'grade_answer'; teamId: string; isCorrect: boolean; points: number }
  | { actionType: 'adjust_score'; teamId: string; delta: number }
  | { actionType: 'toggle_music'; isPlaying: boolean }
  | { actionType: 'update_settings'; settings: Partial<QuizSettings> }
  | { actionType: 'upload_music_picture'; questionId: string; pictureDataUrl: string }
  | { actionType: 'load_questions'; rounds: Round[] }
  | { actionType: 'add_team'; name: string; avatar?: string }
  | { actionType: 'remove_team'; teamId: string }
  | { actionType: 'create_preset_teams'; count: number; scheme: 'tables' | 'pub_legends' }
  | { actionType: 'clear_teams' }
  | { actionType: 'toggle_knockout_mode'; enabled?: boolean }
  | { actionType: 'set_knockout_rule'; rule: 'wrong_answer' | 'lowest_per_round' | 'sudden_death_tiebreaker' }
  | { actionType: 'eliminate_team'; teamId: string; reason?: string }
  | { actionType: 'revive_team'; teamId: string }
  | { actionType: 'trigger_sudden_death' }
  | { actionType: 'reset_knockout' }
  | { actionType: 'declare_knockout_winner'; teamId: string };

export interface CategoryVaultItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export type CartoonMapThemeId = string;

export interface MapLevel {
  id: string;
  mapThemeId: string;
  levelNumber: number;
  name: string;
  category: string;
  difficulty: QuizDifficulty;
  questionCount: number;
  coinReward: number;
  icon: string;
  description: string;
  requiredStars: number;
  // Real Pub Crawl metadata
  pubName?: string;
  address?: string;
  postcode?: string;
  walkingTime?: string;
  distanceMiles?: number;
  funFact?: string;
  recommendedPint?: string;
}

export interface CartoonMap {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  themeColor: string;
  accentColor: string;
  bgGradient: string;
  cardBg: string;
  pathColor: string;
  stoneColor: string;
  requiredStars: number;
  levels: MapLevel[];
  description: string;
  isAiGenerated?: boolean;
  // Pub Crawl metadata
  crawlRouteName?: string;
  totalDistance?: string;
  boroughs?: string;
  startArea?: string;
  endArea?: string;
  /** Illustrated background used for this particular London route. */
  mapArtwork?: string;
  /** Route artwork that follows London's current season and time of day. */
  seasonalArtwork?: Partial<Record<'spring' | 'summer' | 'autumn' | 'winter', {
    day: string;
    night: string;
  }>>;
}

export interface LevelProgress {
  stars: number; // 0 to 3
  highScore: number;
  passed: boolean;
  completedAt?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  provider: 'guest' | 'google';
  facebookLinked?: boolean;
  facebookName?: string;
  createdAt: number;
}

export interface MapPlayerMarker {
  id: string;
  name: string;
  avatar: string;
  levelNumber: number; // 1 to 5
  statusQuote: string;
  score: number;
  color: string;
  favoriteDrink: string;
  isCurrentUser?: boolean;
}

export interface SoloProgression {
  coins: number; // Fake money currency (Pub Bucks)
  lives: number; // 0 to maxLives (default 3)
  maxLives: number; // Default 3
  nextHeartRegenTimestamp?: number; // Milliseconds timestamp for next heart
  unlockedMaps: string[];
  currentMapId: string;
  completedLevels: Record<string, LevelProgress>; // levelId -> progress
  totalStars: number;
  lastDailyBonus?: number;
  purchasedBundles: string[];
  dynamicMaps?: CartoonMap[]; // AI generated maps appended dynamically
  userProfile?: UserProfile;
}

export interface ShopBundle {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: 'coins_pack' | 'lives_refill' | 'mega_bundle';
  coinsCost?: number; // Cost in coins (e.g. for buying lives)
  fakePriceLabel: string; // e.g. "$1.99 (Play Money)", "FREE Bonus", "120 🪙"
  rewardCoins: number;
  rewardLives: number;
  badge?: string;
  color: string;
}
