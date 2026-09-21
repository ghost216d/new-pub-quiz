import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Flame,
  Star,
  Heart,
  Coins,
  ShoppingBag,
  MapPin,
  ChevronLeft,
  Info,
  Award,
} from 'lucide-react';
import { Question, QuizDifficulty, MapLevel, CartoonMap, SoloProgression } from '../types';
import { CATEGORY_VAULT, DEFAULT_ROUNDS, SOLO_PHOTO_QUESTIONS, SOLO_PICTURE_QUESTIONS } from '../data/defaultQuestions';
import {
  CARTOON_MAPS,
  getAllMaps,
  getInitialSoloProgression,
  saveSoloProgression,
} from '../data/cartoonMapsData';
import { audioSynth } from '../utils/audioSynth';
import { chooseUnseenFallbackQuestions, getOnlineTriviaQuestions, markQuestionMastered } from '../utils/onlineTrivia';
import { CartoonBeerStein, CartoonPopBurst, CartoonTrophy, CartoonBunting } from './CartoonIllustrations';
import { CartoonMapCanvas } from './CartoonMapCanvas';
import { TavernShopModal } from './TavernShopModal';
import { CorrectAnswerDrink } from './CorrectAnswerDrink';
import { RunningToPubAnimation } from './RunningToPubAnimation';
import confetti from 'canvas-confetti';

interface Props {
  onBackToHome: () => void;
  onOpenQuizMaster: () => void;
}

const DIFFICULTY_OPTIONS: {
  id: QuizDifficulty;
  label: string;
  sublabel: string;
  icon: string;
  points: number;
  bgClass: string;
  borderClass: string;
  textClass: string;
  activeClass: string;
}[] = [
  {
    id: 'easy',
    label: 'Easy',
    sublabel: 'Warm-up / Novice',
    icon: '🌱',
    points: 10,
    bgClass: 'bg-emerald-950/40',
    borderClass: 'border-emerald-600/40',
    textClass: 'text-emerald-400',
    activeClass: 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-300 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
  },
  {
    id: 'medium',
    label: 'Medium',
    sublabel: 'Tavern Standard',
    icon: '🍺',
    points: 15,
    bgClass: 'bg-amber-950/40',
    borderClass: 'border-amber-600/40',
    textClass: 'text-amber-400',
    activeClass: 'bg-gradient-to-br from-amber-600 to-yellow-600 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
  },
  {
    id: 'hard',
    label: 'Hard',
    sublabel: 'Pub Master',
    icon: '🔥',
    points: 20,
    bgClass: 'bg-rose-950/40',
    borderClass: 'border-rose-600/40',
    textClass: 'text-rose-400',
    activeClass: 'bg-gradient-to-br from-rose-600 to-red-700 border-rose-300 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]',
  },
  {
    id: 'expert',
    label: 'Expert',
    sublabel: 'Brain Buster',
    icon: '👑',
    points: 25,
    bgClass: 'bg-purple-950/40',
    borderClass: 'border-purple-600/40',
    textClass: 'text-purple-400',
    activeClass: 'bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-300 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]',
  },
];

// A level must feel responsive even when the public trivia service is slow or
// blocked by the player's network. Fall back quickly instead of leaving the
// launch animation looking like a button that did nothing.
const ONLINE_QUESTION_TIMEOUT_MS = 4500;
const SOLO_PASS_PERCENT = 60;
const MISSED_QUESTIONS_KEY = 'pubquiz_missed_questions_v1';

type MissedQuestion = {
  question: Question;
  levelId: string;
  missedAt: number;
};

const shuffleItems = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

const questionKey = (question: Question): string =>
  question.prompt.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const questionImageUrl = (imageUrl: string): string =>
  /^https?:|^data:|^\//.test(imageUrl) ? imageUrl : `${import.meta.env.BASE_URL}${imageUrl}`;

const readMissedQuestions = (): MissedQuestion[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(MISSED_QUESTIONS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveMissedQuestions = (questions: MissedQuestion[]) => {
  localStorage.setItem(MISSED_QUESTIONS_KEY, JSON.stringify(questions.slice(-100)));
};

const rememberMissedQuestion = (question: Question, levelId: string) => {
  const key = questionKey(question);
  const previous = readMissedQuestions().filter(
    (item) => questionKey(item.question) !== key,
  );
  saveMissedQuestions([...previous, { question, levelId, missedAt: Date.now() }]);
};

const forgetMasteredQuestion = (question: Question) => {
  const key = questionKey(question);
  saveMissedQuestions(
    readMissedQuestions().filter((item) => questionKey(item.question) !== key),
  );
};

const prepareAttemptQuestions = (
  freshQuestions: Question[],
  count: number,
  levelId?: string,
): Question[] => {
  const retryLimit = Math.min(2, Math.max(1, Math.floor(count / 3)));
  const retries = levelId
    ? shuffleItems(
        readMissedQuestions()
          .filter((item) => item.levelId === levelId)
          .map((item) => item.question),
      ).slice(0, retryLimit)
    : [];
  const retryKeys = new Set(retries.map(questionKey));
  const combined = [
    ...retries,
    ...freshQuestions.filter((question) => !retryKeys.has(questionKey(question))),
  ].slice(0, count);

  return shuffleItems(combined).map((question) => ({
    ...question,
    options: question.options ? shuffleItems(question.options) : question.options,
  }));
};

// Solo mode never serves audio-dependent questions. Quiz Master keeps its
// music rounds, while Solo uses standard trivia and dedicated picture puzzles.
const getProceduralBackupQuestions = (): Question[] => Array.from({ length: 400 }, (_, index) => {
  const hard = index % 2 === 1;
  const left = 12 + index;
  const right = 3 + (index % 9);
  const add = 7 + (index % 23);
  const answer = hard ? (left * right) + add : left * right;
  const prompt = hard
    ? `Mental maths: what is (${left} × ${right}) + ${add}?`
    : `Mental maths: what is ${left} × ${right}?`;
  return {
    id: `procedural_${index}`,
    roundNumber: 1,
    category: 'Knowledge Workout',
    prompt,
    type: 'multiple_choice',
    difficulty: hard ? 'hard' : 'medium',
    options: [String(answer), String(answer + right), String(answer - right), String(answer + add + right)],
    correctAnswer: String(answer),
    acceptableAnswers: [String(answer)],
    explanation: hard
      ? `${left} × ${right} = ${left * right}; adding ${add} gives ${answer}.`
      : `${left} multiplied by ${right} is ${answer}.`,
    points: hard ? 20 : 15,
    timeLimitSec: hard ? 40 : 35,
  } satisfies Question;
});

const getSoloQuestionVault = (): Question[] => [
  ...DEFAULT_ROUNDS
    .filter((round) => round.type !== 'music')
    .flatMap((round) => round.questions)
    .filter((question) => !question.musicData),
  ...SOLO_PICTURE_QUESTIONS,
  ...SOLO_PHOTO_QUESTIONS,
  ...getProceduralBackupQuestions(),
];

const loadOnlineQuestionsWithTimeout = (
  options: Parameters<typeof getOnlineTriviaQuestions>[0],
): Promise<Question[]> => new Promise((resolve, reject) => {
  const timeout = window.setTimeout(
    () => reject(new Error('Internet questions took too long to load.')),
    ONLINE_QUESTION_TIMEOUT_MS,
  );
  getOnlineTriviaQuestions(options).then(
    (questions) => {
      window.clearTimeout(timeout);
      resolve(questions);
    },
    (error) => {
      window.clearTimeout(timeout);
      reject(error);
    },
  );
});

const interleaveDifficulty = (medium: Question[], hard: Question[]): Question[] => {
  const mixed: Question[] = [];
  const total = medium.length + hard.length;
  for (let index = 0; index < total; index += 1) {
    const useHard = index % 2 === 1;
    const question = useHard ? hard.shift() : medium.shift();
    const fallback = useHard ? medium.shift() : hard.shift();
    const selected = question || fallback;
    if (selected) mixed.push(selected);
  }
  return mixed;
};

const loadMixedOnlineQuestions = async (category: string, count: number): Promise<Question[]> => {
  const mediumCount = Math.ceil(count / 2);
  const hardCount = Math.floor(count / 2);
  const [medium, hard] = await Promise.all([
    loadOnlineQuestionsWithTimeout({ category, count: mediumCount, difficulty: 'medium' }),
    loadOnlineQuestionsWithTimeout({ category, count: hardCount, difficulty: 'hard' }),
  ]);
  return interleaveDifficulty([...medium], [...hard]);
};

const buildUnseenFallbackQuestions = (
  pool: Question[],
  count: number,
): Question[] => {
  const mediumCount = Math.ceil(count / 2);
  const hardCount = Math.floor(count / 2);
  const labelledMedium = pool.filter((question) => question.difficulty !== 'hard');
  const labelledHard = pool.filter((question) => question.difficulty === 'hard');
  let selected: Question[];

  if (labelledMedium.length >= mediumCount && labelledHard.length >= hardCount) {
    const medium = chooseUnseenFallbackQuestions(labelledMedium, mediumCount);
    const hard = chooseUnseenFallbackQuestions(labelledHard, hardCount);
    selected = interleaveDifficulty([...medium], [...hard]);
  } else {
    selected = chooseUnseenFallbackQuestions(pool, count);
  }

  return selected.map((question, index) => {
    const questionDifficulty: QuizDifficulty = index % 2 === 0 ? 'medium' : 'hard';
    return {
      ...question,
      points: questionDifficulty === 'hard' ? 20 : 15,
      timeLimitSec: questionDifficulty === 'hard' ? 40 : 35,
      difficulty: questionDifficulty,
    };
  });
};

export const SoloQuizView: React.FC<Props> = ({ onBackToHome, onOpenQuizMaster }) => {
  // Navigation mode: 'map' = cartoon world map, 'quiz' = active question screen, 'custom_setup' = online custom topic
  const [viewMode, setViewMode] = useState<'map' | 'quiz' | 'custom_setup' | 'journey'>('map');

  // Progression & Economy state (saved in localStorage)
  const [progression, setProgression] = useState<SoloProgression>(getInitialSoloProgression());
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<'lives' | 'bundles' | 'free'>('bundles');

  // Active Map Level context (if playing a map level)
  const [activeLevel, setActiveLevel] = useState<MapLevel | null>(null);
  const [activeMap, setActiveMap] = useState<CartoonMap | null>(null);

  // Custom quiz setup state
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_VAULT[0].name);
  const [useAI, setUseAI] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Active Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [coinsEarnedInGame, setCoinsEarnedInGame] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timerSec, setTimerSec] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isOutOfLivesModalOpen, setIsOutOfLivesModalOpen] = useState(false);
  const [floatingCoinText, setFloatingCoinText] = useState<string | null>(null);
  const [autoAdvanceTarget, setAutoAdvanceTarget] = useState<{ mapId: string; levelId: string } | null>(null);
  const [routeJourney, setRouteJourney] = useState<{ destinationName: string } | null>(null);
  const [launchingLevel, setLaunchingLevel] = useState<MapLevel | null>(null);
  const [drinkCelebration, setDrinkCelebration] = useState<{ id: number; streak: number } | null>(null);

  // Helper to persist progression state updates
  const updateProgression = (updated: SoloProgression) => {
    setProgression(updated);
    saveSoloProgression(updated);
  };

  // Timer countdown
  useEffect(() => {
    if (viewMode !== 'quiz' || isAnswerRevealed || gameOver || isOutOfLivesModalOpen) return;

    const timer = setInterval(() => {
      setTimerSec((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewMode, isAnswerRevealed, gameOver, isOutOfLivesModalOpen, currentIdx]);

  const handleTimeout = () => {
    setIsAnswerRevealed(true);
    setStreak(0);
    audioSynth.playLifeLostFx();
    const timedOutQuestion = questions[currentIdx];
    if (activeLevel && timedOutQuestion) {
      rememberMissedQuestion(timedOutQuestion, activeLevel.id);
    }

    // Deduct 1 life
    const remainingLives = Math.max(0, progression.lives - 1);
    updateProgression({ ...progression, lives: remainingLives });

    if (remainingLives <= 0) {
      setTimeout(() => {
        setIsOutOfLivesModalOpen(true);
      }, 400);
    }
  };

  // Start Level from Cartoon Map
  const handleSelectMapLevel = (level: MapLevel, map: CartoonMap) => {
    if (progression.lives <= 0) {
      setShopTab('lives');
      setIsShopOpen(true);
      return;
    }

    setActiveLevel(level);
    setActiveMap(map);
    setSelectedCategory(level.category);
    setDifficulty('medium');
    setCustomTopic('');
    setUseAI(true); // Enable the online topic field, with an unseen offline fallback
    setLaunchingLevel(level);
    handleStartGameWithLevel(level, map);
  };

  const handleStartGameWithLevel = async (level: MapLevel, map: CartoonMap) => {
    setIsLoading(true);
    setAiNotice(null);
    const launchStartedAt = Date.now();
    const finishLaunchAnimation = async () => {
      const remaining = Math.max(0, 700 - (Date.now() - launchStartedAt));
      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }
      setLaunchingLevel(null);
    };
    const count = level.questionCount || 5;
    // 1. Fetch fresh Internet questions. The online session token and local
    // seen-question history prevent repeats across levels and later visits.
    if (navigator.onLine) {
      try {
        const onlineQuestions = await loadMixedOnlineQuestions(
          `${map.name}: ${level.category}`,
          count,
        );
        const attemptQuestions = prepareAttemptQuestions(onlineQuestions, count, level.id);
        setQuestions(attemptQuestions);
        initGame(attemptQuestions);
        setIsLoading(false);
        await finishLaunchAnimation();
        setViewMode('quiz');
        return;
      } catch (err) {
        console.warn('Online questions unavailable, falling back to the offline question vault.', err);
        setAiNotice('Online questions are temporarily unavailable. Using unseen offline questions.');
      }
    }

    // 2. Curated fallback
    const allQuestions = getSoloQuestionVault();

    let qPool = allQuestions.filter(
      (q) =>
        q.category.toLowerCase().includes(level.category.toLowerCase().slice(0, 3)) ||
        level.category.toLowerCase().includes(q.category.toLowerCase().slice(0, 3))
    );
    if (qPool.length < count) {
      qPool = allQuestions;
    }

    let shuffled: Question[];
    try {
      shuffled = buildUnseenFallbackQuestions(
        qPool,
        count,
      );
    } catch {
      // The helper normally rotates the oldest completed questions when the
      // finite offline pack has been exhausted. Keep this final guard so a
      // malformed or empty pack can never leave the launch overlay hanging.
      shuffled = buildUnseenFallbackQuestions(
        getSoloQuestionVault(),
        count,
      );
    }

    const attemptQuestions = prepareAttemptQuestions(shuffled, count, level.id);
    setQuestions(attemptQuestions);
    initGame(attemptQuestions);
    setIsLoading(false);
    await finishLaunchAnimation();
    setViewMode('quiz');
  };

  // Start Custom Quiz
  const handleStartCustomGame = async () => {
    if (progression.lives <= 0) {
      setShopTab('lives');
      setIsShopOpen(true);
      return;
    }

    setIsLoading(true);
    setAiNotice(null);
    setActiveLevel(null);
    setActiveMap(null);
    const topic = customTopic.trim() || selectedCategory;
    const isPictureRound = !customTopic.trim() && selectedCategory === 'Emoji Picture Puzzles';
    const isPhotoRound = !customTopic.trim() && selectedCategory === 'Photo Round: World Landmarks';
    setDifficulty('medium');

    if (navigator.onLine && !isPictureRound && !isPhotoRound) {
      try {
        const onlineQuestions = await loadMixedOnlineQuestions(topic, 10);
        setQuestions(onlineQuestions);
        initGame(onlineQuestions);
        setIsLoading(false);
        setViewMode('quiz');
        return;
      } catch (err) {
        console.warn('Online questions unavailable, falling back to the offline question vault.', err);
        setAiNotice('Online questions are temporarily unavailable. Using unseen offline questions.');
      }
    }

    // Curated local questions fallback
    const allQuestions = getSoloQuestionVault();

    let qPool = isPictureRound ? SOLO_PICTURE_QUESTIONS : isPhotoRound ? SOLO_PHOTO_QUESTIONS : allQuestions.filter(
      (q) =>
        q.category.toLowerCase().includes(selectedCategory.toLowerCase().slice(0, 4)) ||
        selectedCategory.toLowerCase().includes(q.category.toLowerCase().slice(0, 4))
    );
    if (qPool.length < 5) {
      qPool = allQuestions;
    }

    let shuffled: Question[];
    try {
      shuffled = buildUnseenFallbackQuestions(
        qPool,
        10,
      );
    } catch {
      shuffled = buildUnseenFallbackQuestions(
        getSoloQuestionVault(),
        10,
      );
    }

    setQuestions(shuffled);
    initGame(shuffled);
    setIsLoading(false);
    setViewMode('quiz');
  };

  const initGame = (qList: Question[]) => {
    setCurrentIdx(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setCoinsEarnedInGame(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setGameOver(false);
    setIsOutOfLivesModalOpen(false);
    setTimerSec(qList[0]?.timeLimitSec || 30);
  };

  const handleSelectAnswer = (option: string) => {
    if (isAnswerRevealed || gameOver || isOutOfLivesModalOpen) return;
    const currentQ = questions[currentIdx];
    setSelectedAnswer(option);
    setIsAnswerRevealed(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      const bonusStreak = streak * 3;
      const pts = (currentQ.points || 15) + bonusStreak;
      setScore((s) => s + pts);
      setCorrectCount((count) => count + 1);
      forgetMasteredQuestion(currentQ);
      markQuestionMastered(currentQ.prompt);
      setStreak((st) => st + 1);

      // Award coins for correct answer!
      const coinGain = 20 + streak * 5;
      setCoinsEarnedInGame((prev) => prev + coinGain);
      updateProgression({
        ...progression,
        coins: progression.coins + coinGain,
      });

      audioSynth.playCorrectFx();
      audioSynth.playCoinFx();

      setFloatingCoinText(`+${coinGain} 🪙`);
      setTimeout(() => setFloatingCoinText(null), 1200);

      // Confetti on good streaks
      if (streak >= 2) {
        confetti({ particleCount: 35, spread: 65, origin: { y: 0.8 } });
      }
    } else {
      if (activeLevel) rememberMissedQuestion(currentQ, activeLevel.id);
      setStreak(0);
      audioSynth.playWrongFx();
      audioSynth.playLifeLostFx();

      // Deduct 1 Life!
      const remainingLives = Math.max(0, progression.lives - 1);
      const nextRegen =
        remainingLives < progression.maxLives
          ? (progression.nextHeartRegenTimestamp || Date.now() + 60 * 60 * 1000)
          : undefined;

      updateProgression({
        ...progression,
        lives: remainingLives,
        nextHeartRegenTimestamp: nextRegen,
      });

      if (remainingLives <= 0) {
        setTimeout(() => {
          setIsOutOfLivesModalOpen(true);
        }, 500);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
      setTimerSec(questions[currentIdx + 1]?.timeLimitSec || 30);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameOver(true);
    const correctPercent = questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;
    const passedStage = !activeLevel || correctPercent >= SOLO_PASS_PERCENT;
    if (passedStage) {
      setDrinkCelebration({ id: Date.now(), streak: Math.max(1, streak) });
      window.setTimeout(() => setDrinkCelebration(null), 7000);
      audioSynth.playMilestoneFanfare();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } else {
      audioSynth.playWrongFx();
    }

    // If this was a Map Level, calculate stars and unlock rewards
    if (activeLevel && activeMap) {
      const accuracy = correctPercent;

      let starsAwarded = 0;
      if (accuracy >= 80) starsAwarded = 3;
      else if (accuracy >= 60) starsAwarded = 2;
      else if (accuracy >= 40) starsAwarded = 1;

      // Play star sounds sequentially
      for (let i = 0; i < starsAwarded; i++) {
        setTimeout(() => {
          audioSynth.playStarFx(i);
        }, (i + 1) * 350);
      }

      // Bonus level completion reward
      const bonusReward = passedStage ? (activeLevel.coinReward || 150) : 0;
      const prevProgress = progression.completedLevels[activeLevel.id];
      const prevStars = prevProgress?.stars || 0;
      const netStars = Math.max(0, starsAwarded - prevStars);

      const updatedCompleted = {
        ...progression.completedLevels,
        [activeLevel.id]: {
          stars: Math.max(prevStars, starsAwarded),
          highScore: Math.max(prevProgress?.highScore || 0, score),
          passed: Boolean(prevProgress?.passed || passedStage),
          completedAt: passedStage ? Date.now() : prevProgress?.completedAt,
        },
      };

      const updatedTotalStars = progression.totalStars + netStars;

      // Reveal stages sequentially. A stage remains completely hidden until
      // every level in every preceding stage has been passed.
      const allKnownMaps = getAllMaps(progression);
      const updatedUnlockedMaps = allKnownMaps
        .filter((_, mapIndex) =>
          mapIndex === 0 ||
          allKnownMaps.slice(0, mapIndex).every((previousMap) =>
            previousMap.levels.every(
              (level) => updatedCompleted[level.id]?.passed
            )
          )
        )
        .map((map) => map.id);

      updateProgression({
        ...progression,
        coins: progression.coins + bonusReward,
        totalStars: updatedTotalStars,
        completedLevels: updatedCompleted,
        unlockedMaps: updatedUnlockedMaps,
      });

      setCoinsEarnedInGame((prev) => prev + bonusReward);

      const currentMapIndex = allKnownMaps.findIndex((map) => map.id === activeMap.id);
      const nextLevel = activeMap.levels.find(
        (level) => level.levelNumber === activeLevel.levelNumber + 1
      );
      const nextMap = allKnownMaps[currentMapIndex + 1];
      const nextTarget = nextLevel
        ? { mapId: activeMap.id, levelId: nextLevel.id }
        : nextMap?.levels[0]
          ? { mapId: nextMap.id, levelId: nextMap.levels[0].id }
          : { mapId: activeMap.id, levelId: activeLevel.id };

      setAutoAdvanceTarget(passedStage ? nextTarget : null);
      const targetMap = allKnownMaps.find((map) => map.id === nextTarget.mapId);
      const targetLevel = targetMap?.levels.find((level) => level.id === nextTarget.levelId);
      const shouldShowJourney = passedStage && targetLevel?.levelNumber === 3;

      if (passedStage) {
        // Show the victory moment, then travel to the newly unlocked stage.
        window.setTimeout(() => {
          setGameOver(false);
          setSelectedAnswer(null);
          setIsAnswerRevealed(false);
          setActiveLevel(null);
          setActiveMap(null);
          if (shouldShowJourney && targetLevel) {
            setRouteJourney({ destinationName: targetLevel.pubName || targetLevel.name });
            setViewMode('journey');
          } else {
            setViewMode('map');
          }
          audioSynth.playChampionFanfare();
        }, 7000);
      }
    }
  };

  // Revive with coins
  const handleReviveWithCoins = () => {
    const cost = 60;
    if (progression.coins < cost) {
      setShopTab('bundles');
      setIsShopOpen(true);
      return;
    }

    updateProgression({
      ...progression,
      coins: progression.coins - cost,
      lives: 1,
      nextHeartRegenTimestamp:
        progression.maxLives > 1
          ? (progression.nextHeartRegenTimestamp || Date.now() + 60 * 60 * 1000)
          : undefined,
    });

    audioSynth.playPurchaseFx();
    setIsOutOfLivesModalOpen(false);
  };

  // ==========================================
  // VIEW 1: CARTOON QUEST MAP
  // ==========================================
  if (viewMode === 'journey' && routeJourney) {
    return (
      <RunningToPubAnimation
        destinationName={routeJourney.destinationName}
        onComplete={() => {
          setRouteJourney(null);
          setViewMode('map');
        }}
      />
    );
  }

  if (viewMode === 'map') {
    return (
      <>
        <CartoonMapCanvas
          progression={progression}
          onUpdateProgression={updateProgression}
          onSelectLevel={handleSelectMapLevel}
          onOpenShop={(tab) => {
            setShopTab(tab || 'bundles');
            setIsShopOpen(true);
          }}
          onCustomSoloMode={() => setViewMode('custom_setup')}
          onBackToHome={onBackToHome}
          onOpenQuizMaster={onOpenQuizMaster}
          autoAdvanceTarget={autoAdvanceTarget}
        />

        {launchingLevel && (
          <div className="solo-pub-launch" role="status" aria-live="polite">
            <div className="solo-pub-launch-card">
              <span className="solo-pub-launch-icon">{launchingLevel.icon || '🍺'}</span>
              <strong>Entering {launchingLevel.pubName || launchingLevel.name}</strong>
              <small>Brewing your questions…</small>
              <span className="solo-pub-launch-dots" aria-hidden="true"><i /><i /><i /></span>
            </div>
          </div>
        )}

        {/* Tavern Shop Modal */}
        <TavernShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          progression={progression}
          onUpdateProgression={updateProgression}
          initialTab={shopTab}
        />
      </>
    );
  }

  // ==========================================
  // VIEW 2: CUSTOM AI & SOLO SETUP SCREEN
  // ==========================================
  if (viewMode === 'custom_setup') {
    return (
      <div className="solo-screen solo-setup-screen max-w-xl mx-auto bg-[#fffdf8] rounded-3xl p-4 sm:p-7 border-4 border-amber-800 shadow-[0_8px_0_#082f49] text-stone-900 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-800/30 pb-3">
          <button
            onClick={() => setViewMode('map')}
            className="px-3 py-1.5 rounded-xl bg-amber-100/90 hover:bg-white text-stone-800 border border-amber-800/40 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Cartoon Map</span>
          </button>

          {/* Quick HUD */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-300">
              <Heart className="w-4 h-4 fill-rose-500" />
              <span>{progression.lives}/{progression.maxLives}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
              <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{progression.coins.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <div className="flex justify-center">
            <CartoonBeerStein size={54} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-wide">
            Custom Solo Quiz Mode
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 font-bold">
            Pick any category and receive fresh Internet questions without repeats.
          </p>
        </div>

        {/* Difficulty alternates automatically throughout every round. */}
        <div className="flex items-center gap-3 p-3.5 bg-amber-50/90 rounded-2xl border-2 border-amber-800/40">
          <Flame className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-950">Automatic challenge</p>
            <p className="text-[11px] font-bold text-stone-600">Questions alternate between easy and hard throughout every game.</p>
          </div>
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
              Select Curated Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORY_VAULT.map((cat) => {
                const isChosen = selectedCategory === cat.name && !customTopic;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCustomTopic('');
                    }}
                    style={
                      isChosen
                        ? { borderColor: cat.color, backgroundColor: `${cat.color}25` }
                        : {}
                    }
                    className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center gap-2.5 transition cursor-pointer text-left ${
                      isChosen
                        ? 'text-stone-900 border-amber-800 shadow-md bg-amber-100'
                        : 'bg-amber-50 text-stone-800 border-amber-800/30 hover:border-amber-700 hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-black truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-75 line-clamp-1">{cat.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ONLINE CUSTOM TOPIC */}
          <div className="p-3.5 bg-gradient-to-br from-purple-100/90 to-amber-50 rounded-2xl border-2 border-purple-400/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                <span>Custom Internet Topic</span>
              </label>
              <button
                onClick={() => setUseAI(!useAI)}
                className={`text-xs px-2.5 py-1 rounded-full font-bold border transition cursor-pointer ${
                  useAI
                    ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                    : 'bg-white text-stone-700 border-purple-300 hover:bg-purple-50'
                }`}
              >
                {useAI ? '✨ Custom On' : 'Custom Off'}
              </button>
            </div>

            {useAI && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. 90s Sitcoms, Belgian Ales, Formula 1, World Cinema..."
                  className="w-full bg-white border-2 border-purple-400 rounded-xl p-2.5 text-xs text-stone-900 font-bold focus:border-purple-600 outline-none placeholder:text-stone-400"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col min-[380px]:flex-row items-stretch gap-3 pt-1">
          <button
            onClick={() => setViewMode('map')}
            className="w-full min-[380px]:w-1/3 py-3 rounded-xl bg-amber-100 text-stone-800 font-bold text-xs hover:bg-white border border-amber-800/40 transition cursor-pointer min-h-[44px]"
          >
            ← Back to Map
          </button>
          <button
            id="solo-start-game-btn"
            disabled={isLoading}
            onClick={handleStartCustomGame}
            className="w-full min-[380px]:w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm shadow-[0_4px_0_#0369a1] hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-60 transition cursor-pointer border-2 border-amber-900 flex items-center justify-center gap-2 min-h-[44px] text-center"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-current" />
            <span>{isLoading ? 'Generating Questions...' : 'Start 10-Question Quiz'}</span>
          </button>
        </div>

        <TavernShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          progression={progression}
          onUpdateProgression={updateProgression}
          initialTab={shopTab}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 3: GAME OVER / LEVEL VICTORY SCREEN
  // ==========================================
  if (gameOver) {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const requiredCorrect = Math.ceil((questions.length * SOLO_PASS_PERCENT) / 100);
    const passedStage = !activeLevel || correctCount >= requiredCorrect;
    const diffObj = DIFFICULTY_OPTIONS.find((d) => d.id === difficulty) || DIFFICULTY_OPTIONS[1];

    let starsEarned = 0;
    if (accuracy >= 80) starsEarned = 3;
    else if (accuracy >= 60) starsEarned = 2;
    else if (accuracy >= 40) starsEarned = 1;

    return (
      <div className="solo-screen solo-result-screen max-w-md mx-auto bg-[#fffdf8] rounded-3xl p-4 sm:p-8 border-4 border-amber-800 shadow-[0_8px_0_#082f49] text-center text-stone-900 space-y-5 animate-in zoom-in-95 font-comic">
        {drinkCelebration && (
          <CorrectAnswerDrink key={drinkCelebration.id} streak={drinkCelebration.streak} />
        )}
        <CartoonBunting className="w-full h-8 -mt-2 opacity-95" />

        <div className="flex justify-center">
          {passedStage ? (
            <CartoonTrophy size={96} className="animate-boing" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-sky-700 bg-sky-100 shadow-[0_6px_0_#082f49]">
              <RotateCcw className="h-12 w-12 text-sky-800" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-center">
            <CartoonPopBurst
              text={passedStage ? (accuracy >= 80 ? '3-STAR CHAMP!' : 'STAGE CLEAR!') : 'SO CLOSE!'}
              color={passedStage ? 'yellow' : 'blue'}
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-cartoon text-amber-950 drop-shadow-sm">
            {activeLevel
              ? passedStage
                ? `${activeLevel.name} Clear!`
                : `${activeLevel.name} Needs Another Go`
              : 'Solo Quiz Complete!'}
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-700">
            <span>{activeMap ? activeMap.name : selectedCategory}</span>
            <span>•</span>
            <span className={`font-cartoon uppercase ${diffObj.textClass}`}>{difficulty} Mode</span>
          </div>
        </div>

        {/* Stars Earned */}
        {activeLevel && (
          <div className="flex justify-center items-center gap-3 p-3 bg-amber-100/80 rounded-2xl border-3 border-amber-800/40 shadow-inner">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`w-9 h-9 transition-transform ${
                  i < starsEarned
                    ? 'text-yellow-500 fill-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-bounce'
                    : 'text-stone-300 fill-stone-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Score & Coins Earned Breakdown */}
        <div className="p-4 rounded-2xl bg-amber-50/90 border-3 border-amber-800/40 space-y-3 shadow-inner">
          <div className="text-4xl sm:text-5xl font-cartoon text-amber-950 drop-shadow-sm">{score} POINTS</div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-cartoon">
            <div className="text-emerald-900 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-400 font-black">
              CORRECT: {correctCount} / {questions.length}
            </div>
            <div className="flex items-center gap-1.5 text-amber-950 bg-amber-200/90 px-3 py-1 rounded-xl border border-amber-400 font-black">
              <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>+{coinsEarnedInGame} BUCKS</span>
            </div>
          </div>

          <p className="text-xs text-stone-700 font-bold">
            {!passedStage
              ? `Get ${requiredCorrect} correct to unlock the next stage. Missed questions may return with shuffled answers.`
              : accuracy >= 80
              ? '👑 True Pub Quiz Master! Flawless performance.'
              : accuracy >= 50
              ? '🍺 Solid round! Bar tab worthy knowledge.'
              : '🦉 Good effort! Practice this realm to claim 3 stars.'}
          </p>
        </div>

        <div className="space-y-3">
          {activeLevel && (
            <button
              onClick={() => setViewMode('map')}
              className="w-full py-4 rounded-2xl cartoon-btn-amber text-sm sm:text-base font-cartoon tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5 stroke-[2.5]" />
              <span>RETURN TO CARTOON MAP</span>
            </button>
          )}

          <div className="flex flex-col min-[380px]:flex-row items-stretch gap-3">
            <button
              onClick={() => {
                if (activeLevel && activeMap) {
                  handleStartGameWithLevel(activeLevel, activeMap);
                } else {
                  handleStartCustomGame();
                }
              }}
              className="flex-1 py-3.5 rounded-2xl cartoon-btn-cyan text-xs sm:text-sm font-cartoon tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>{passedStage ? 'PLAY AGAIN' : 'RETRY STAGE'}</span>
            </button>
            <button
              onClick={onBackToHome}
              className="flex-1 py-3.5 rounded-2xl bg-amber-100 hover:bg-white text-stone-900 font-cartoon text-xs sm:text-sm tracking-wider transition cursor-pointer border-2 border-amber-800 min-h-[44px] shadow-[0_3px_0_#075985]"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: ACTIVE QUIZ QUESTIONS SCREEN
  // ==========================================
  const currentQ = questions[currentIdx];
  const diffObj = DIFFICULTY_OPTIONS.find((d) => d.id === (currentQ?.difficulty || difficulty)) || DIFFICULTY_OPTIONS[1];

  return (
    <div className="solo-screen solo-quiz-screen w-full mx-auto space-y-3 sm:space-y-4 font-comic">
      {/* Notice banner if fallback was served */}
      {aiNotice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-2xl text-amber-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="flex-1">{aiNotice}</span>
          <button onClick={() => setAiNotice(null)} className="text-amber-400 hover:text-white font-bold text-xs">✕</button>
        </div>
      )}

      {/* Top Solo Header (Vibrant Cartoon Game HUD) */}
      <div className="solo-quiz-hud bg-[#fffdf8] p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border-[3px] sm:border-4 border-amber-800 shadow-[0_5px_0_#082f49] gap-2">
        {/* Left: Level / Question index */}
        <div className="solo-quiz-progress flex min-w-0 items-center gap-2">
          <span className="shrink-0 px-2.5 sm:px-3 py-1 rounded-full cartoon-btn-amber text-[10px] sm:text-xs font-cartoon shadow-sm">
            Q {currentIdx + 1} / {questions.length}
          </span>
          {activeLevel && (
            <span className="shrink-0 rounded-full border-2 border-emerald-500 bg-emerald-100 px-2 py-1 text-[10px] font-cartoon text-emerald-900 shadow-sm">
              ✓ {correctCount}/{Math.ceil((questions.length * SOLO_PASS_PERCENT) / 100)}
            </span>
          )}
          <span className="solo-quiz-pub-name min-w-0 text-[11px] sm:text-xs text-stone-900 font-cartoon truncate">
            {activeLevel ? activeLevel.name : currentQ?.category}
          </span>
        </div>

        {/* Right: Hearts (Lives), Coins, Streak, Timer */}
        <div className="solo-quiz-stats flex min-w-0 items-center justify-end gap-1.5 sm:gap-3">
          {/* Hearts / Lives */}
          <div className="solo-quiz-hearts flex shrink-0 items-center gap-0.5 sm:gap-1 bg-rose-100 border-2 border-rose-400 px-1.5 sm:px-2.5 py-1 rounded-2xl shadow-sm">
            {Array.from({ length: progression.maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < progression.lives
                    ? 'text-rose-500 fill-rose-500 animate-pulse'
                    : 'text-stone-300 fill-stone-200 opacity-60'
                }`}
              />
            ))}
          </div>

          {/* Pub Bucks Balance */}
          <div className="relative flex min-w-0 items-center gap-1 bg-amber-100 border-2 border-amber-400 px-2 py-1 rounded-2xl text-[10px] sm:text-xs font-cartoon text-amber-950 shadow-sm">
            <Coins className="w-4 h-4 text-amber-600 fill-amber-500 animate-beer-slosh" />
            <span>{progression.coins.toLocaleString()}</span>
            {floatingCoinText && (
              <span className="absolute -top-5 right-0 text-amber-950 font-cartoon text-xs animate-bounce bg-amber-200 border border-amber-600 px-1.5 py-0.5 rounded shadow">
                {floatingCoinText}
              </span>
            )}
          </div>

          {streak > 1 && (
            <span className="text-xs font-cartoon text-amber-950 bg-amber-200 px-2.5 py-1 rounded-2xl border-2 border-amber-500 animate-hop">
              🔥 {streak}x
            </span>
          )}

          <div className={`flex shrink-0 items-center gap-1 text-[10px] sm:text-xs font-cartoon text-amber-950 bg-amber-100 px-2 sm:px-2.5 py-1 rounded-2xl border-2 border-amber-400 shadow-inner ${
            timerSec <= 5 ? 'animate-wiggle-fast text-rose-700 bg-rose-100 border-rose-400' : ''
          }`}>
            <Clock className={`w-3.5 h-3.5 ${timerSec <= 5 ? 'text-rose-600 animate-spin' : 'text-amber-700 animate-pulse'}`} />
            <span>{timerSec}s</span>
          </div>
        </div>
      </div>

      {/* Solo Question Card (Vibrant Cartoon Styling) */}
      <div className="solo-question-card bg-[#fffdf8] rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border-[3px] sm:border-4 border-amber-800 shadow-[0_6px_0_#082f49] space-y-4">
        {/* Difficulty Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`max-w-full text-[10px] sm:text-xs font-cartoon px-2.5 sm:px-3 py-1 rounded-full border-2 ${diffObj.bgClass} ${diffObj.borderClass} ${diffObj.textClass} shadow-sm whitespace-normal`}>
            {diffObj.icon} {diffObj.label.toUpperCase()} MODE • {currentQ?.points || 15} PTS
          </span>
          <button
            onClick={() => setViewMode('map')}
            className="shrink-0 text-[10px] sm:text-xs font-cartoon text-amber-800 hover:text-amber-950 transition cursor-pointer"
          >
            QUIT TO MAP ➔
          </button>
        </div>

        {currentQ?.pictureClue && (
          <div
            className="solo-picture-clue flex min-h-[130px] items-center justify-center rounded-2xl border-4 border-amber-500 bg-gradient-to-br from-sky-100 via-white to-amber-100 p-5 text-center text-6xl sm:text-7xl shadow-inner"
            aria-label={`Picture clue: ${currentQ.pictureClue}`}
          >
            {currentQ.pictureClue}
          </div>
        )}

        {currentQ?.imageUrl && !currentQ.pictureClue && (
          <img
            src={questionImageUrl(currentQ.imageUrl)}
            alt="Picture clue for this question"
            className="max-h-64 w-full rounded-2xl border-4 border-amber-500 object-cover shadow-md"
          />
        )}

        <h3 className="text-base sm:text-xl font-extrabold text-stone-900 leading-snug">
          {currentQ?.prompt}
        </h3>

        {/* Options (3D Cartoon Push Buttons with Theme Colors) */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 pt-1">
          {currentQ?.options?.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isCorrect = option === currentQ.correctAnswer;
            const isSelected = selectedAnswer === option;

            // 4 color schemes for cartoon fun
            const colorThemes = [
              {
                base: 'cartoon-btn-pink text-white',
                badge: 'bg-pink-900/70 text-pink-100',
              },
              {
                base: 'cartoon-btn-cyan text-white',
                badge: 'bg-sky-950/70 text-cyan-200',
              },
              {
                base: 'cartoon-btn-amber text-slate-950',
                badge: 'bg-amber-950/70 text-amber-200',
              },
              {
                base: 'cartoon-btn-emerald text-white',
                badge: 'bg-emerald-950/70 text-emerald-200',
              },
            ];

            const theme = colorThemes[idx % colorThemes.length];

            let cardStyle = theme.base;

            if (isAnswerRevealed) {
              if (isCorrect) {
                cardStyle = 'cartoon-btn-emerald text-white ring-4 ring-emerald-300 scale-102 animate-rubberband';
              } else if (isSelected) {
                cardStyle = 'bg-rose-950 text-rose-200 border-3 border-rose-500 shadow-[0_4px_0_#881337] animate-rubberband';
              } else {
                cardStyle = 'bg-stone-200/60 text-stone-400 border-2 border-stone-300 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswerRevealed}
                onClick={() => handleSelectAnswer(option)}
                className={`w-full min-w-0 min-h-[52px] sm:min-h-[56px] p-3 sm:p-3.5 rounded-2xl border-3 font-extrabold text-left text-sm sm:text-base flex items-center justify-between gap-2 transition cursor-pointer active:scale-98 ${cardStyle}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-cartoon text-sm sm:text-base shrink-0 border-2 border-white/30 shadow-inner ${theme.badge}`}>
                    {letter}
                  </span>
                  <span className="break-words leading-tight flex-1 drop-shadow-sm">{option}</span>
                </div>

                {isAnswerRevealed && isCorrect && <CheckCircle2 className="w-6 h-6 text-white shrink-0 stroke-[3] animate-boing" />}
                {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-400 shrink-0 stroke-[3] animate-boing" />}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation & Next Question button */}
        {isAnswerRevealed && (
          <div className="pt-2 space-y-3 animate-in fade-in duration-200">
            {currentQ?.explanation && (
              <p className="text-xs text-stone-800 bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-800/40 leading-relaxed font-medium animate-rubberband">
                💡 <strong className="text-amber-900 font-cartoon">Fact:</strong> {currentQ.explanation}
              </p>
            )}

            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 sm:py-4 rounded-2xl cartoon-btn-amber text-base sm:text-lg font-cartoon tracking-wider transition cursor-pointer flex items-center justify-center gap-2 animate-glow-pulse min-h-[48px]"
            >
              <span>{currentIdx + 1 < questions.length ? 'NEXT QUESTION ➔' : 'FINISH STAGE 🏆'}</span>
            </button>
          </div>
        )}
      </div>

      {/* OUT OF LIVES MODAL POPUP */}
      {isOutOfLivesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-sm w-full bg-[#fffdf8] rounded-3xl p-6 border-4 border-rose-600 shadow-[0_12px_0_#881337] text-center space-y-4 text-stone-900">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl border-2 border-rose-400 animate-pulse shadow-md">
              💔
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-rose-600">Out of Lives!</h3>
              <p className="text-xs text-stone-700 font-bold">
                You ran out of Hearts! Refill your vitality with Pub Bucks or visit the Tavern Store.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleReviveWithCoins}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs shadow-[0_4px_0_#881337] hover:brightness-110 active:translate-y-1 active:shadow-none transition cursor-pointer flex items-center justify-center gap-1.5 border border-rose-400"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Revive +1 Life (60 Pub Bucks 🪙)</span>
              </button>

              <button
                onClick={() => {
                  setShopTab('lives');
                  setIsShopOpen(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-[0_3px_0_#075985] hover:brightness-105 transition cursor-pointer flex items-center justify-center gap-1.5 border border-amber-900"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Open Tavern Store & Bundles</span>
              </button>

              <button
                onClick={() => {
                  setIsOutOfLivesModalOpen(false);
                  setViewMode('map');
                }}
                className="w-full py-2 rounded-xl bg-amber-100 text-stone-700 hover:text-stone-950 font-bold text-xs border border-amber-800/30 transition cursor-pointer"
              >
                Quit to Cartoon Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tavern Shop Modal */}
      <TavernShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        progression={progression}
        onUpdateProgression={updateProgression}
        initialTab={shopTab}
      />
    </div>
  );
};
