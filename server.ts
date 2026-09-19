import express from 'express';
import http from 'http';
import path from 'path';
import { randomUUID } from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

import {
  RoomState,
  WSMessage,
  Question,
  Round,
  HostActionPayload,
  Team,
} from './src/types';

import { DEFAULT_ROUNDS } from './src/data/defaultQuestions';

import {
  createPresetTeams,
  TEAM_AVATARS,
  TEAM_COLORS,
} from './src/data/teamPresets';

dotenv.config();

/* ============================================================
   CONFIGURATION
============================================================ */

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const MAX_TEAMS = 40;
const DEFAULT_TIMER_SECONDS = 30;
const MAX_AI_QUESTIONS = 10;
const ROOM_CODE_ATTEMPTS = 100;

app.use(express.json({ limit: '10mb' }));

/* ============================================================
   GEMINI AI
============================================================ */

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiClient;
}

/* ============================================================
   ROOM STORAGE
============================================================ */

const rooms = new Map<string, RoomState>();

const ROOM_CODES = [
  'PINT',
  'HOPS',
  'BEER',
  'BARN',
  'ALE9',
  'FOAM',
  'QUIZ',
  'KEG7',
  'TAP8',
  'PUB3',
  'WINE',
  'RUM4',
];

/* ============================================================
   ROOM CODE GENERATOR
============================================================ */

function generateRoomCode(): string {
  const available = ROOM_CODES.filter((code) => !rooms.has(code));

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  for (let attempt = 0; attempt < ROOM_CODE_ATTEMPTS; attempt++) {
    const code = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    if (!rooms.has(code)) {
      return code;
    }
  }

  throw new Error('Unable to generate a unique room code.');
}

/* ============================================================
   ROOM CREATION
============================================================ */

function createInitialRoom(
  code: string,
  hostName: string = 'Quiz Master',
  maxTeams: number = MAX_TEAMS,
  prePopulateScheme: 'none' | 'tables' | 'pub_legends' = 'none',
  knockoutMode: boolean = false,
  knockoutRule:
    | 'wrong_answer'
    | 'lowest_per_round'
    | 'sudden_death_tiebreaker' = 'wrong_answer'
): RoomState {
  const safeMaxTeams = Math.min(
    MAX_TEAMS,
    Math.max(2, Number(maxTeams) || MAX_TEAMS)
  );

  const initialRounds = JSON.parse(
    JSON.stringify(DEFAULT_ROUNDS)
  ) as Round[];

  const initialTeams: Record<string, Team> =
    prePopulateScheme !== 'none'
      ? createPresetTeams(safeMaxTeams, prePopulateScheme)
      : {};

  return {
    code,
    hostName,
    status: 'lobby',

    currentRoundIndex: 0,
    currentQuestionIndex: 0,

    rounds: initialRounds,
    teams: initialTeams,

    timerRemaining: DEFAULT_TIMER_SECONDS,
    timerTotal: DEFAULT_TIMER_SECONDS,
    isTimerRunning: false,

    submissions: {},

    settings: {
      answerMode: 'multiple_choice',
      showMilestoneEvery10: true,
      roundTimerSeconds: DEFAULT_TIMER_SECONDS,
      allowSoloAI: true,
      maxTeams: safeMaxTeams,
      prePopulateScheme,
      knockoutMode,
      knockoutRule,
    },

    musicPlaying: false,

    activeMusicTrack: {
      melodyId: 'take_on_me',
      songTitle: 'Take On Me',
      artist: 'A-ha',
    },
  };
}

/* ============================================================
   REST API
============================================================ */

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    roomsCount: rooms.size,
  });
});

/* ============================================================
   CREATE ROOM
============================================================ */

app.post('/api/rooms', (req, res) => {
  try {
    const {
      hostName,
      maxTeams = MAX_TEAMS,
      prePopulateScheme = 'none',
      knockoutMode = false,
      knockoutRule = 'wrong_answer',
    } = req.body ?? {};

    const code = generateRoomCode();

    const room = createInitialRoom(
      code,
      typeof hostName === 'string' && hostName.trim()
        ? hostName.trim()
        : 'Quiz Master',
      maxTeams,
      prePopulateScheme,
      knockoutMode,
      knockoutRule
    );

    rooms.set(code, room);

    res.json({
      roomCode: code,
      state: room,
    });
  } catch (error) {
    console.error('Room creation failed:', error);

    res.status(500).json({
      error: 'Unable to create quiz room.',
    });
  }
});

/* ============================================================
   GET ROOM
============================================================ */

app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();

  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({
      error: 'Room not found',
    });
  }

  return res.json(room);
});

/* ============================================================
   FALLBACK QUESTIONS
============================================================ */

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getFallbackQuestions(
  category: string = '',
  count: number = 5,
  difficulty: string = 'medium'
): Question[] {
  const allQuestions: Question[] = [];

  DEFAULT_ROUNDS.forEach((round) => {
    allQuestions.push(...round.questions);
  });

  const pointsMap: Record<string, number> = {
    easy: 10,
    medium: 15,
    hard: 20,
    expert: 25,
  };

  const defaultPts = pointsMap[difficulty] || 15;

  let filtered = allQuestions;

  if (category.trim()) {
    const term = category.toLowerCase().trim();

    const matched = allQuestions.filter((question) => {
      const questionCategory = question.category.toLowerCase();

      return (
        questionCategory.includes(term) ||
        term.includes(questionCategory) ||
        question.prompt.toLowerCase().includes(term)
      );
    });

    if (matched.length >= 3) {
      filtered = matched;
    }
  }

  return shuffleArray(filtered)
    .slice(0, count)
    .map((question) => ({
      ...question,

      id: `vault_${randomUUID()}`,

      points: defaultPts,

      difficulty: difficulty as Question['difficulty'],
    }));
}

/* ============================================================
   AI QUESTION GENERATOR
============================================================ */

app.post('/api/ai/generate-questions', async (req, res) => {
  const {
    category = '',
    count = 5,
    difficulty = 'medium',
    roundType = 'trivia',
  } = req.body ?? {};

  const parsedCount = Number.parseInt(String(count), 10);

  const safeCount = Math.max(
    1,
    Math.min(
      MAX_AI_QUESTIONS,
      Number.isFinite(parsedCount) ? parsedCount : 5
    )
  );

  try {
    const ai = getAI();

    if (!ai) {
      return res.json({
        success: true,
        fallback: true,
        message:
          'No Gemini API key configured. Using curated pub quiz vault.',

        questions: getFallbackQuestions(
          String(category),
          safeCount,
          String(difficulty)
        ),
      });
    }

    const difficultyGuidance: Record<string, string> = {
      easy:
        'Easy / Pub Novice: Accessible, fun everyday common knowledge with clear distractors and friendly clues.',

      medium:
        'Medium / Standard Tavern Trivia: Engaging classic pub quiz level requiring general knowledge and reasoning.',

      hard:
        'Hard / Pub Master: Challenging trivia with nuanced facts and plausible distractors.',

      expert:
        'Expert / Brain Buster: Mastermind-level obscure facts and deep-cut trivia.',
    };

    const difficultyKey = String(difficulty).toLowerCase();

    const diffDesc =
      difficultyGuidance[difficultyKey] ||
      difficultyGuidance.medium;

    const basePts =
      difficultyKey === 'expert'
        ? 25
        : difficultyKey === 'hard'
          ? 20
          : difficultyKey === 'medium'
            ? 15
            : 10;

    const prompt = `
You are an expert British and international Pub Quiz Master.

Generate ${safeCount} witty, fact-checked pub quiz questions.

Category:
"${category || 'General Pub Trivia'}"

Target Difficulty:
${difficultyKey.toUpperCase()}

${diffDesc}

Round Type:
${roundType}

Tone:
Energetic, fun and suitable for a British pub quiz.

Every question MUST contain:

- Exactly 4 distinct multiple-choice options.
- Exactly 1 correct answer.
- correctAnswer MUST exactly match one of the options.
- Acceptable short variations for typing mode.
- A witty one-sentence trivia explanation.
- Points: ${basePts}.
- A sensible answer time limit.

Do not create ambiguous questions.
Do not create multiple correct answers.
`;

    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];

    let lastError: unknown = null;
    let responseText: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,

          contents: prompt,

          config: {
            responseMimeType: 'application/json',

            responseSchema: {
              type: Type.ARRAY,

              items: {
                type: Type.OBJECT,

                properties: {
                  prompt: {
                    type: Type.STRING,
                  },

                  category: {
                    type: Type.STRING,
                  },

                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },

                  correctAnswer: {
                    type: Type.STRING,
                  },

                  acceptableAnswers: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },

                  explanation: {
                    type: Type.STRING,
                  },

                  points: {
                    type: Type.INTEGER,
                  },

                  timeLimitSec: {
                    type: Type.INTEGER,
                  },
                },

                required: [
                  'prompt',
                  'category',
                  'options',
                  'correctAnswer',
                  'explanation',
                ],
              },
            },
          },
        });

        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (error) {
        lastError = error;

        console.warn(
          `Gemini model ${modelName} failed. Trying fallback model.`,
          error
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 400)
        );
      }
    }

    if (!responseText) {
      throw (
        lastError ||
        new Error('All configured AI models unavailable.')
      );
    }

    const parsedQuestions = JSON.parse(
      responseText
    ) as Partial<Question>[];

    if (!Array.isArray(parsedQuestions)) {
      throw new Error('AI returned an invalid question format.');
    }

    const formattedQuestions: Question[] =
      parsedQuestions
        .slice(0, safeCount)
        .map((question) => {
          let options = Array.isArray(question.options)
            ? question.options
                .filter(
                  (option): option is string =>
                    typeof option === 'string' &&
                    option.trim().length > 0
                )
                .slice(0, 4)
            : [];

          while (options.length < 4) {
            options.push(`Option ${options.length + 1}`);
          }

          let correctAnswer =
            typeof question.correctAnswer === 'string'
              ? question.correctAnswer.trim()
              : '';

          if (!options.includes(correctAnswer)) {
            correctAnswer = options[0];
          }

          return {
            id: `ai_${randomUUID()}`,

            roundNumber: 1,

            category:
              question.category ||
              String(category) ||
              'Pub Trivia',

            prompt:
              question.prompt || 'Trivia Question',

            type: 'multiple_choice',

            difficulty:
              difficultyKey as Question['difficulty'],

            options,

            correctAnswer,

            acceptableAnswers:
              question.acceptableAnswers?.length
                ? question.acceptableAnswers
                : [correctAnswer],

            explanation:
              question.explanation ||
              'Cheers to pub knowledge!',

            points:
              typeof question.points === 'number'
                ? question.points
                : basePts,

            timeLimitSec:
              typeof question.timeLimitSec === 'number'
                ? Math.max(
                    5,
                    Math.min(120, question.timeLimitSec)
                  )
                : DEFAULT_TIMER_SECONDS,
          };
        });

    return res.json({
      success: true,
      fallback: false,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.warn(
      'AI unavailable. Serving curated fallback questions.',
      error
    );

    return res.json({
      success: true,

      fallback: true,

      message:
        'AI is temporarily unavailable. Questions have been loaded from the curated quiz vault.',

      questions: getFallbackQuestions(
        String(category),
        safeCount,
        String(difficulty)
      ),
    });
  }
});

/* ============================================================
   PROCEDURAL MAP THEMES
============================================================ */

const PROCEDURAL_MAP_THEMES = [
  {
    themeKey: 'dino_cantina',
    name: 'Jurassic Dino Cantina',
    subtitle:
      'Volcanic amber ales, fossil discoveries, and prehistoric pub patrons',
    icon: '🦖',
    themeColor: '#10B981',
    accentColor: '#F59E0B',
    bgGradient:
      'from-emerald-950/60 via-amber-950/40 to-slate-950',
    cardBg:
      'bg-emerald-950/40 border-emerald-500/50',
    pathColor: '#10B981',
    stoneColor: 'from-emerald-500 to-teal-400',
    description:
      'Travel 65 million years back in time to the tavern where T-Rexes clink stone steins!',
    categories: [
      'Prehistoric World',
      'Dinosaurs & Fossils',
      'Earth Sciences',
      'Ancient Wonders',
      'Cretaceous Boss Battle',
    ],
  },

  {
    themeKey: 'wild_west_saloon',
    name: 'Golden Nugget Saloon',
    subtitle:
      'Batwing swinging doors, poker tables, gold rush lore, and cowboy showdowns',
    icon: '🤠',
    themeColor: '#D97706',
    accentColor: '#EF4444',
    bgGradient:
      'from-amber-950/60 via-orange-950/40 to-slate-950',
    cardBg:
      'bg-amber-950/40 border-amber-500/50',
    pathColor: '#F59E0B',
    stoneColor: 'from-amber-500 to-orange-500',
    description:
      'Belly up to the mahogany bar in the wild frontier for high-noon trivia shootouts.',
    categories: [
      'Wild West Lore',
      'Gold Rush History',
      'Cowboy Cinema',
      'American Frontiers',
      'Sheriff Showdown Boss',
    ],
  },

  {
    themeKey: 'steampunk_station',
    name: 'Victorian Clockwork Station',
    subtitle:
      'Whistling steam pipes, polished brass dials, and mechanical bartender automatons',
    icon: '⚙️',
    themeColor: '#B45309',
    accentColor: '#06B6D4',
    bgGradient:
      'from-yellow-950/60 via-zinc-950 to-slate-950',
    cardBg:
      'bg-yellow-950/40 border-yellow-500/50',
    pathColor: '#CA8A04',
    stoneColor: 'from-yellow-600 to-amber-400',
    description:
      'An industrial marvel tavern where clockwork cogs keep the cider flowing.',
    categories: [
      'Victorian Inventions',
      'Steampunk Fiction',
      'Great Inventors',
      'World Railways',
      'Clockwork Automaton Boss',
    ],
  },

  {
    themeKey: 'haunted_manor',
    name: 'Spooky Phantom Crypt Pub',
    subtitle:
      'Glow-in-the-dark ectoplasm ciders, moving portraits, and friendly ghost regulars',
    icon: '👻',
    themeColor: '#8B5CF6',
    accentColor: '#10B981',
    bgGradient:
      'from-purple-950/60 via-emerald-950/30 to-slate-950',
    cardBg:
      'bg-purple-950/40 border-purple-500/50',
    pathColor: '#A855F7',
    stoneColor: 'from-purple-500 to-indigo-600',
    description:
      'Drink with spectres in an 18th-century haunted cellar where trivia never dies.',
    categories: [
      'Folklore & Myths',
      'Gothic Mysteries',
      'Horror Movies',
      'Supernatural Legends',
      'Phantom Poltergeist Boss',
    ],
  },

  {
    themeKey: 'deep_sea_submarine',
    name: 'Nautilus Submarine Cantina',
    subtitle:
      'Bioluminescent deep trench grog, periscope views, and giant squid encounters',
    icon: '🐙',
    themeColor: '#0284C7',
    accentColor: '#06B6D4',
    bgGradient:
      'from-cyan-950/60 via-blue-950 to-slate-950',
    cardBg:
      'bg-cyan-950/40 border-cyan-500/50',
    pathColor: '#0EA5E9',
    stoneColor: 'from-cyan-500 to-blue-600',
    description:
      'Submerged 20,000 leagues deep with glowing jellyfish drifting past your table.',
    categories: [
      'Ocean Life',
      'Deep Sea Exploration',
      'Sunken Treasures',
      'Marine Biology',
      'Kraken Deep Trench Boss',
    ],
  },

  {
    themeKey: 'viking_valhalla',
    name: 'Valhalla Mead Hall',
    subtitle:
      'Roaring timber hearths, Viking shields, horned cups, and Norse mythology',
    icon: '⚔️',
    themeColor: '#E11D48',
    accentColor: '#F59E0B',
    bgGradient:
      'from-rose-950/60 via-slate-950 to-slate-950',
    cardBg:
      'bg-rose-950/40 border-rose-500/50',
    pathColor: '#F43F5E',
    stoneColor: 'from-rose-500 to-amber-500',
    description:
      'Clash mead horns with ancient warriors under the auroras of Asgard.',
    categories: [
      'Norse Mythology',
      'Viking Explorers',
      'Medieval Lore',
      'Ancient Weapons',
      'Odin’s Ravens Boss Stage',
    ],
  },

  {
    themeKey: 'cyber_tokyo',
    name: 'Neo-Tokyo Cyber Izakaya',
    subtitle:
      'Neon holographic signs, synthwave beats, cyber ramen, and android sommeliers',
    icon: '🍜',
    themeColor: '#EC4899',
    accentColor: '#3B82F6',
    bgGradient:
      'from-pink-950/60 via-indigo-950 to-slate-950',
    cardBg:
      'bg-pink-950/40 border-pink-500/50',
    pathColor: '#F43F5E',
    stoneColor: 'from-pink-500 to-purple-600',
    description:
      'A rain-soaked futuristic alley bar glowing in brilliant pink and cyan neon.',
    categories: [
      'Futuristic Tech',
      'Cyberpunk Culture',
      'World Megacities',
      'Robotics & AI',
      'Sentient Android Boss',
    ],
  },
];

/* ============================================================
   AI MAP GENERATOR
============================================================ */

app.post('/api/ai/generate-map', async (req, res) => {
  try {
    const {
      existingThemes = [],
      totalStars = 15,
      currentMapName = '',
    } = req.body ?? {};

    const ai = getAI();

    const safeExistingThemes: string[] =
      Array.isArray(existingThemes)
        ? existingThemes.filter(
            (item): item is string =>
              typeof item === 'string'
          )
        : [];

    const safeTotalStars =
      Number.isFinite(Number(totalStars))
        ? Number(totalStars)
        : 15;

    const baseReqStars = Math.max(
      0,
      safeTotalStars + 4
    );

    const createProceduralRealm = () => {
      const unusedTheme =
        PROCEDURAL_MAP_THEMES.find(
          (theme) =>
            !safeExistingThemes.includes(
              theme.themeKey
            )
        ) ||
        PROCEDURAL_MAP_THEMES[
          Math.floor(
            Math.random() *
              PROCEDURAL_MAP_THEMES.length
          )
        ];

      const mapId = `${unusedTheme.themeKey}_${randomUUID()}`;

      return {
        id: mapId,
        name: unusedTheme.name,
        subtitle: unusedTheme.subtitle,
        icon: unusedTheme.icon,
        themeColor: unusedTheme.themeColor,
        accentColor: unusedTheme.accentColor,
        bgGradient: unusedTheme.bgGradient,
        cardBg: unusedTheme.cardBg,
        pathColor: unusedTheme.pathColor,
        stoneColor: unusedTheme.stoneColor,
        requiredStars: baseReqStars,
        description: unusedTheme.description,
        isAiGenerated: true,

        levels: unusedTheme.categories.map(
          (category, index) => ({
            id: `${mapId}_lvl_${index + 1}`,
            mapThemeId: mapId,
            levelNumber: index + 1,

            name:
              index === 4
                ? `Boss: ${category}`
                : `Stage ${index + 1}: ${category}`,

            category,

            difficulty:
              index === 0
                ? 'easy'
                : index < 3
                  ? 'medium'
                  : index === 3
                    ? 'hard'
                    : 'expert',

            questionCount: 5,

            coinReward: 160 + index * 50,

            icon:
              index === 4
                ? '👑'
                : unusedTheme.icon,

            description:
              index === 4
                ? `Defeat the ${unusedTheme.name} realm Boss to claim the Trophy!`
                : `Test your knowledge on ${category}.`,

            requiredStars:
              baseReqStars + index * 2,
          })
        ),
      };
    };

    if (!ai) {
      return res.json({
        success: true,
        map: createProceduralRealm(),
        fallback: true,
      });
    }

    const prompt = `
You are a creative cartoon game designer for an entertaining Pub Quiz adventure game.

Design ONE brand-new vibrant cartoon-themed pub quiz realm.

Current realm:
"${currentMapName}"

Existing theme IDs to avoid:
${JSON.stringify(safeExistingThemes)}

Invent an imaginative tavern world.

Examples:
Dinosaur Dino Diner
Wild West Gold Rush Saloon
Steampunk Brass Station
Haunted Phantom Pub
Deep Sea Nautilus
Cyberpunk Neon Izakaya
Viking Valhalla Hall
Alpine Ski Lodge
Carnival Circus Cantina
Mount Olympus Nectar Bar

The realm must contain:

- Catchy tavern name
- Fun subtitle
- Single emoji icon
- Vibrant themeColor
- accentColor
- pathColor
- Tailwind background gradient
- Tailwind stone gradient
- Description
- Exactly 5 sequential levels
- Diverse quiz categories
- Level 5 MUST be a thematic Boss level

Required stars:
${baseReqStars}
`;

    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];

    let responseText: string | null = null;

    for (const model of candidateModels) {
      try {
        const response =
          await ai.models.generateContent({
            model,

            contents: prompt,

            config: {
              responseMimeType:
                'application/json',

              responseSchema: {
                type: Type.OBJECT,

                properties: {
                  name: {
                    type: Type.STRING,
                  },

                  subtitle: {
                    type: Type.STRING,
                  },

                  icon: {
                    type: Type.STRING,
                  },

                  themeColor: {
                    type: Type.STRING,
                  },

                  accentColor: {
                    type: Type.STRING,
                  },

                  bgGradient: {
                    type: Type.STRING,
                  },

                  stoneColor: {
                    type: Type.STRING,
                  },

                  pathColor: {
                    type: Type.STRING,
                  },

                  description: {
                    type: Type.STRING,
                  },

                  levels: {
                    type: Type.ARRAY,

                    items: {
                      type: Type.OBJECT,

                      properties: {
                        name: {
                          type: Type.STRING,
                        },

                        category: {
                          type: Type.STRING,
                        },

                        difficulty: {
                          type: Type.STRING,
                        },

                        icon: {
                          type: Type.STRING,
                        },

                        description: {
                          type: Type.STRING,
                        },
                      },

                      required: [
                        'name',
                        'category',
                        'difficulty',
                        'icon',
                      ],
                    },
                  },
                },

                required: [
                  'name',
                  'subtitle',
                  'icon',
                  'themeColor',
                  'levels',
                ],
              },
            },
          });

        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (error) {
        console.warn(
          `AI map generation failed with ${model}.`,
          error
        );
      }
    }

    if (!responseText) {
      return res.json({
        success: true,
        map: createProceduralRealm(),
        fallback: true,
      });
    }

    const parsed = JSON.parse(responseText);

    const mapId = `ai_map_${randomUUID()}`;

    const formattedMap = {
      id: mapId,

      name:
        parsed.name ||
        'Enchanted Tavern Realm',

      subtitle:
        parsed.subtitle ||
        'A magical new pub realm generated just for you',

      icon: parsed.icon || '✨',

      themeColor:
        parsed.themeColor || '#10B981',

      accentColor:
        parsed.accentColor || '#F59E0B',

      bgGradient:
        parsed.bgGradient ||
        'from-emerald-950/60 via-slate-900 to-slate-950',

      cardBg:
        'bg-slate-900/90 border-amber-500/50',

      pathColor:
        parsed.pathColor ||
        parsed.themeColor ||
        '#10B981',

      stoneColor:
        parsed.stoneColor ||
        'from-emerald-500 to-teal-400',

      requiredStars: baseReqStars,

      description:
        parsed.description ||
        'An all-new tavern adventure created by the AI Mapmaker!',

      isAiGenerated: true,

      levels: (
        Array.isArray(parsed.levels)
          ? parsed.levels
          : []
      )
        .slice(0, 5)
        .map((level: any, index: number) => {
          const difficulty =
            String(
              level.difficulty || ''
            ).toLowerCase();

          const safeDifficulty =
            difficulty === 'easy' ||
            difficulty === 'hard' ||
            difficulty === 'expert'
              ? difficulty
              : 'medium';

          return {
            id: `${mapId}_lvl_${index + 1}`,

            mapThemeId: mapId,

            levelNumber: index + 1,

            name:
              level.name ||
              `Stage ${index + 1}`,

            category:
              level.category ||
              'General Pub Knowledge',

            difficulty: safeDifficulty,

            questionCount: 5,

            coinReward:
              180 + index * 50,

            icon:
              index === 4
                ? '👑'
                : level.icon ||
                  parsed.icon ||
                  '🍺',

            description:
              level.description ||
              `Test your trivia prowess in ${
                level.category ||
                'Pub Knowledge'
              }.`,

            requiredStars:
              baseReqStars + index * 2,
          };
        }),
    };

    while (formattedMap.levels.length < 5) {
      const index =
        formattedMap.levels.length;

      formattedMap.levels.push({
        id: `${mapId}_lvl_${index + 1}`,

        mapThemeId: mapId,

        levelNumber: index + 1,

        name:
          index === 4
            ? 'Boss Realm Gauntlet'
            : `Stage ${index + 1}`,

        category: 'Pub Knowledge',

        difficulty:
          index === 4
            ? 'hard'
            : 'medium',

        questionCount: 5,

        coinReward:
          200 + index * 40,

        icon:
          index === 4 ? '👑' : '🍺',

        description:
          'Conquer this trivia challenge to progress!',

        requiredStars:
          baseReqStars + index * 2,
      });
    }

    return res.json({
      success: true,
      map: formattedMap,
      fallback: false,
    });
  } catch (error) {
    console.error(
      'Map generation endpoint error:',
      error
    );

    return res.status(500).json({
      error: 'Failed to generate map',
    });
  }
});

/* ============================================================
   HTTP + WEBSOCKET SERVER
============================================================ */

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
  path: '/ws',
});

interface ClientMeta {
  roomCode: string;

  role:
    | 'host'
    | 'player'
    | 'tv';

  teamId?: string;
}

const clientMetadata =
  new WeakMap<WebSocket, ClientMeta>();

const roomSockets =
  new Map<string, Set<WebSocket>>();

/* ============================================================
   WEBSOCKET HELPERS
============================================================ */

function sendSocketError(
  ws: WebSocket,
  message: string
) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'error',
        message,
      })
    );
  }
}

function broadcastRoomState(
  roomCode: string
) {
  const room = rooms.get(roomCode);

  if (!room) return;

  const sockets =
    roomSockets.get(roomCode);

  if (!sockets) return;

  const payload = JSON.stringify({
    type: 'room_state',
    state: room,
  });

  for (const client of sockets) {
    if (
      client.readyState ===
      WebSocket.OPEN
    ) {
      client.send(payload);
    }
  }
}

/* ============================================================
   TIMER
============================================================ */

const timerInterval = setInterval(() => {
  for (const [code, room] of rooms.entries()) {
    if (
      room.status === 'question' &&
      room.isTimerRunning &&
      room.timerRemaining > 0
    ) {
      room.timerRemaining -= 1;

      if (room.timerRemaining <= 0) {
        room.timerRemaining = 0;
        room.isTimerRunning = false;
      }

      broadcastRoomState(code);
    }
  }
}, 1000);

/* ============================================================
   WEBSOCKET CONNECTION
============================================================ */

wss.on(
  'connection',
  (ws: WebSocket) => {
    ws.on('error', (error) => {
      console.error(
        'WebSocket client error:',
        error
      );
    });

    ws.on('message', (messageRaw) => {
      try {
        const raw =
          messageRaw.toString();

        const msg: WSMessage =
          JSON.parse(raw);

        /* ----------------------------------------------------
           JOIN ROOM
        ---------------------------------------------------- */

        if (msg.type === 'join_room') {
          const {
            roomCode,
            role,
            team,
          } = msg;

          if (
            typeof roomCode !== 'string'
          ) {
            sendSocketError(
              ws,
              'Invalid room code.'
            );
            return;
          }

          const upperCode =
            roomCode
              .trim()
              .toUpperCase();

          if (!upperCode) {
            sendSocketError(
              ws,
              'Room code is required.'
            );
            return;
          }

          let room =
            rooms.get(upperCode);

          if (!room) {
            if (role === 'host') {
              room =
                createInitialRoom(
                  upperCode
                );

              rooms.set(
                upperCode,
                room
              );
            } else {
              sendSocketError(
                ws,
                `Room "${upperCode}" does not exist. Check the code!`
              );

              return;
            }
          }

          if (
            !roomSockets.has(
              upperCode
            )
          ) {
            roomSockets.set(
              upperCode,
              new Set()
            );
          }

          roomSockets
            .get(upperCode)!
            .add(ws);

          let teamId:
            | string
            | undefined;

          if (
            role === 'player' &&
            team
          ) {
            const maxAllowed =
              room.settings.maxTeams ||
              MAX_TEAMS;

            teamId =
              team.teamId ||
              `team_${randomUUID()}`;

            if (room.teams[teamId]) {
              room.teams[
                teamId
              ].isOnline = true;

              if (team.name) {
                room.teams[
                  teamId
                ].name =
                  team.name;
              }

              if (team.avatar) {
                room.teams[
                  teamId
                ].avatar =
                  team.avatar;
              }
            } else {
              const currentCount =
                Object.keys(
                  room.teams
                ).length;

              if (
                currentCount >=
                maxAllowed
              ) {
                sendSocketError(
                  ws,
                  `This pub room has reached its maximum limit of ${maxAllowed} teams!`
                );

                roomSockets
                  .get(upperCode)
                  ?.delete(ws);

                return;
              }

              const fallbackColor =
                TEAM_COLORS[
                  currentCount %
                    TEAM_COLORS.length
                ];

              const fallbackAvatar =
                TEAM_AVATARS[
                  currentCount %
                    TEAM_AVATARS.length
                ];

              room.teams[teamId] = {
                id: teamId,

                name:
                  team.name?.trim() ||
                  `Team ${
                    currentCount + 1
                  }`,

                avatar:
                  team.avatar ||
                  fallbackAvatar,

                color:
                  team.color ||
                  fallbackColor,

                score: 0,

                isOnline: true,

                scoreHistory: [],
              };
            }
          }

          clientMetadata.set(ws, {
            roomCode: upperCode,
            role,
            teamId,
          });

          ws.send(
            JSON.stringify({
              type: 'room_state',
              state: room,
            })
          );

          broadcastRoomState(
            upperCode
          );

          return;
        }

        /* ----------------------------------------------------
           SUBMIT ANSWER
        ---------------------------------------------------- */

        if (
          msg.type ===
          'submit_answer'
        ) {
          const {
            roomCode,
            teamId,
            answer,
          } = msg;

          const upperCode =
            roomCode
              .trim()
              .toUpperCase();

          const meta =
            clientMetadata.get(ws);

          if (
            !meta ||
            meta.role !== 'player' ||
            meta.roomCode !==
              upperCode ||
            meta.teamId !== teamId
          ) {
            sendSocketError(
              ws,
              'Invalid team submission.'
            );

            return;
          }

          const room =
            rooms.get(upperCode);

          if (!room) {
            sendSocketError(
              ws,
              'Room not found.'
            );

            return;
          }

          if (
            room.status !==
            'question'
          ) {
            sendSocketError(
              ws,
              'Answers cannot be submitted right now.'
            );

            return;
          }

          if (
            !room.isTimerRunning ||
            room.timerRemaining <= 0
          ) {
            sendSocketError(
              ws,
              'Time is up!'
            );

            return;
          }

          if (
            room.submissions[
              teamId
            ]
          ) {
            sendSocketError(
              ws,
              'Your team has already submitted an answer.'
            );

            return;
          }

          const currentRound =
            room.rounds[
              room.currentRoundIndex
            ];

          const currentQuestion =
            currentRound?.questions[
              room
                .currentQuestionIndex
            ];

          if (!currentQuestion) {
            return;
          }

          const team =
            room.teams[teamId];

          if (!team) {
            return;
          }

          if (team.isEliminated) {
            sendSocketError(
              ws,
              'Your team has been eliminated from this knockout round.'
            );

            return;
          }

          const cleanGiven =
            String(answer)
              .trim()
              .toLowerCase();

          const cleanCorrect =
            currentQuestion.correctAnswer
              .trim()
              .toLowerCase();

          let isCorrect =
            cleanGiven ===
            cleanCorrect;

          if (
            !isCorrect &&
            currentQuestion.acceptableAnswers
          ) {
            isCorrect =
              currentQuestion.acceptableAnswers.some(
                (accepted) =>
                  accepted
                    .trim()
                    .toLowerCase() ===
                  cleanGiven
              );
          }

          const submission = {
            teamId,

            teamName: team.name,

            answer,

            submittedAt:
              Date.now(),

            isCorrect,

            reviewedByHost:
              false,

            pointsAwarded:
              isCorrect
                ? currentQuestion.points
                : 0,
          };

          room.submissions[
            teamId
          ] = submission;

          team.currentSubmission =
            submission;

          broadcastRoomState(
            upperCode
          );

          return;
        }

        /* ----------------------------------------------------
           HOST ACTION
        ---------------------------------------------------- */

        if (
          msg.type ===
          'host_action'
        ) {
          const meta =
            clientMetadata.get(ws);

          if (
            !meta ||
            meta.role !== 'host'
          ) {
            sendSocketError(
              ws,
              'Only the Quiz Master can perform this action.'
            );

            return;
          }

          const {
            roomCode,
            action,
          } = msg;

          const upperCode =
            roomCode
              .trim()
              .toUpperCase();

          if (
            meta.roomCode !==
            upperCode
          ) {
            sendSocketError(
              ws,
              'You are not connected to this room.'
            );

            return;
          }

          const room =
            rooms.get(upperCode);

          if (!room) {
            sendSocketError(
              ws,
              'Room not found.'
            );

            return;
          }

          handleHostAction(
            room,
            action
          );

          broadcastRoomState(
            upperCode
          );

          return;
        }

        sendSocketError(
          ws,
          'Unknown WebSocket message.'
        );
      } catch (error) {
        console.error(
          'WebSocket message error:',
          error
        );

        sendSocketError(
          ws,
          'Invalid message received.'
        );
      }
    });

    /* --------------------------------------------------------
       DISCONNECT
    -------------------------------------------------------- */

    ws.on('close', () => {
      const meta =
        clientMetadata.get(ws);

      if (!meta) return;

      const {
        roomCode,
        teamId,
      } = meta;

      const room =
        rooms.get(roomCode);

      if (
        room &&
        teamId &&
        room.teams[teamId]
      ) {
        room.teams[
          teamId
        ].isOnline = false;

        broadcastRoomState(
          roomCode
        );
      }

      const socketSet =
        roomSockets.get(roomCode);

      if (socketSet) {
        socketSet.delete(ws);

        if (
          socketSet.size === 0
        ) {
          roomSockets.delete(
            roomCode
          );
        }
      }
    });
  }
);

/* ============================================================
   HOST ACTION HANDLER
============================================================ */

function handleHostAction(
  room: RoomState,
  action: HostActionPayload
) {
  switch (action.actionType) {
    /* --------------------------------------------------------
       START GAME
    -------------------------------------------------------- */

    case 'start_game': {
      room.status =
        'round_transition';

      room.currentQuestionIndex =
        0;

      room.currentRoundIndex = 0;

      room.submissions = {};

      const firstQuestion =
        room.rounds[0]
          ?.questions[0];

      room.timerTotal =
        firstQuestion?.timeLimitSec ||
        room.settings
          .roundTimerSeconds;

      room.timerRemaining =
        room.timerTotal;

      room.isTimerRunning =
        false;

      break;
    }

    /* --------------------------------------------------------
       START ROUND
    -------------------------------------------------------- */

    case 'start_round': {
      room.currentRoundIndex =
        action.roundIndex;

      room.currentQuestionIndex =
        0;

      room.status = 'question';

      room.submissions = {};

      for (
        const team of Object.values(
          room.teams
        )
      ) {
        team.currentSubmission =
          undefined;
      }

      const firstQuestion =
        room.rounds[
          room.currentRoundIndex
        ]?.questions[0];

      room.timerTotal =
        firstQuestion?.timeLimitSec ||
        room.settings
          .roundTimerSeconds;

      room.timerRemaining =
        room.timerTotal;

      room.isTimerRunning = true;

      if (
        firstQuestion?.musicData
      ) {
        room.activeMusicTrack = {
          melodyId:
            firstQuestion.musicData
              .melodyId,

          songTitle:
            firstQuestion.musicData
              .songTitle,

          artist:
            firstQuestion.musicData
              .artist,

          audioUrl:
            firstQuestion.musicData
              .audioUrl,

          pictureClues:
            firstQuestion.musicData
              .cluePictures,
        };
      }

      break;
    }

    /* --------------------------------------------------------
       NEXT ROUND
    -------------------------------------------------------- */

    case 'next_round': {
      if (
        room.settings
          .knockoutMode &&
        room.settings
          .knockoutRule ===
          'lowest_per_round'
      ) {
        const activeTeams = (
          Object.values(
            room.teams
          ) as Team[]
        ).filter(
          (team) =>
            !team.isEliminated
        );

        if (
          activeTeams.length > 1
        ) {
          const minScore =
            Math.min(
              ...activeTeams.map(
                (team) =>
                  team.score
              )
            );

          const lowestTeams =
            activeTeams.filter(
              (team) =>
                team.score ===
                minScore
            );

          if (
            lowestTeams.length <
            activeTeams.length
          ) {
            for (
              const team of
              lowestTeams
            ) {
              team.isEliminated =
                true;

              team.eliminatedRound =
                room.rounds[
                  room
                    .currentRoundIndex
                ]?.roundNumber ||
                1;

              team.eliminatedReason =
                'Lowest score at round end';
            }

            const remaining =
              activeTeams.filter(
                (team) =>
                  team.score >
                  minScore
              );

            if (
              remaining.length ===
              1
            ) {
              room.knockoutWinnerTeamId =
                remaining[0].id;

              room.status =
                'knockout_winner';

              room.isTimerRunning =
                false;

              break;
            }
          }
        }
      }

      if (
        room.currentRoundIndex +
          1 <
        room.rounds.length
      ) {
        room.currentRoundIndex +=
          1;

        room.currentQuestionIndex =
          0;

        room.status =
          'round_transition';

        room.submissions = {};

        room.isTimerRunning =
          false;
      } else {
        const activeTeams = (
          Object.values(
            room.teams
          ) as Team[]
        ).filter(
          (team) =>
            !team.isEliminated
        );

        if (
          room.settings
            .knockoutMode &&
          activeTeams.length > 1
        ) {
          const maxScore =
            Math.max(
              ...activeTeams.map(
                (team) =>
                  team.score
              )
            );

          const topWinners =
            activeTeams.filter(
              (team) =>
                team.score ===
                maxScore
            );

          if (
            topWinners.length ===
            1
          ) {
            room.knockoutWinnerTeamId =
              topWinners[0].id;

            room.status =
              'knockout_winner';

            room.isTimerRunning =
              false;

            break;
          }

          for (
            const team of
            activeTeams
          ) {
            if (
              team.score !==
              maxScore
            ) {
              team.isEliminated =
                true;

              team.eliminatedReason =
                'Did not qualify for tiebreaker';
            }
          }

          room.isSuddenDeathTiebreaker =
            true;

          room.settings.knockoutRule =
            'wrong_answer';

          room.status =
            'question';

          room.submissions = {};

          const currentRound =
            room.rounds[
              room
                .currentRoundIndex
            ];

          const question =
            currentRound
              ?.questions[
                room
                  .currentQuestionIndex
              ];

          room.timerTotal =
            question?.timeLimitSec ||
            room.settings
              .roundTimerSeconds;

          room.timerRemaining =
            room.timerTotal;

          room.isTimerRunning =
            true;

          break;
        }

        if (
          room.settings
            .knockoutMode &&
          activeTeams.length === 1
        ) {
          room.knockoutWinnerTeamId =
            activeTeams[0].id;

          room.status =
            'knockout_winner';

          room.isTimerRunning =
            false;

          break;
        }

        room.status =
          'game_over';

        room.isTimerRunning =
          false;
      }

      break;
    }

    /* --------------------------------------------------------
       PREVIOUS ROUND
    -------------------------------------------------------- */

    case 'prev_round': {
      if (
        room.currentRoundIndex > 0
      ) {
        room.currentRoundIndex -=
          1;

        room.currentQuestionIndex =
          0;

        room.status =
          'round_transition';

        room.submissions = {};

        room.isTimerRunning =
          false;
      }

      break;
    }

    /* --------------------------------------------------------
       JUMP TO QUESTION
    -------------------------------------------------------- */

    case 'jump_to_question': {
      const {
        roundIndex,
        questionIndex,
      } = action;

      if (
        room.rounds[
          roundIndex
        ]?.questions[
          questionIndex
        ]
      ) {
        room.currentRoundIndex =
          roundIndex;

        room.currentQuestionIndex =
          questionIndex;

        room.status =
          'question';

        room.submissions = {};

        for (
          const team of
          Object.values(
            room.teams
          )
        ) {
          team.currentSubmission =
            undefined;
        }

        const targetQuestion =
          room.rounds[
            roundIndex
          ].questions[
            questionIndex
          ];

        room.timerTotal =
          targetQuestion
            .timeLimitSec ||
          room.settings
            .roundTimerSeconds;

        room.timerRemaining =
          room.timerTotal;

        room.isTimerRunning =
          true;
      }

      break;
    }

    /* --------------------------------------------------------
       ADD TIME
    -------------------------------------------------------- */

    case 'add_time': {
      const seconds =
        Number(action.seconds) ||
        0;

      room.timerRemaining =
        Math.max(
          0,
          room.timerRemaining +
            seconds
        );

      room.timerTotal =
        Math.max(
          room.timerTotal,
          room.timerRemaining
        );

      break;
    }

    /* --------------------------------------------------------
       ANSWER MODE
    -------------------------------------------------------- */

    case 'set_answer_mode': {
      room.settings.answerMode =
        action.mode;

      const currentQuestion =
        room.rounds[
          room.currentRoundIndex
        ]?.questions[
          room
            .currentQuestionIndex
        ];

      if (currentQuestion) {
        currentQuestion.type =
          action.mode;
      }

      break;
    }

    /* --------------------------------------------------------
       REVEAL ANSWER / SCORE
    -------------------------------------------------------- */

    case 'reveal_answer': {
      room.status =
        'answer_reveal';

      room.isTimerRunning =
        false;

      const round =
        room.rounds[
          room.currentRoundIndex
        ];

      const question =
        round?.questions[
          room
            .currentQuestionIndex
        ];

      if (question) {
        for (
          const [
            teamId,
            submission,
          ] of Object.entries(
            room.submissions
          )
        ) {
          const team =
            room.teams[teamId];

          if (!team) continue;

          if (
            submission.reviewedByHost
          ) {
            continue;
          }

          const awarded =
            submission.isCorrect
              ? submission.pointsAwarded ||
                question.points
              : 0;

          team.score += awarded;

          team.scoreHistory.push({
            questionIndex:
              room.currentQuestionIndex +
              1,

            roundNumber:
              round.roundNumber,

            delta: awarded,

            cumulativeScore:
              team.score,

            isCorrect:
              submission.isCorrect,
          });

          submission.pointsAwarded =
            awarded;

          submission.reviewedByHost =
            true;
        }
      }

      /* Knockout processing */

      if (
        room.settings
          .knockoutMode &&
        (room.settings
          .knockoutRule ===
          'wrong_answer' ||
          room
            .isSuddenDeathTiebreaker)
      ) {
        const activeTeams = (
          Object.values(
            room.teams
          ) as Team[]
        ).filter(
          (team) =>
            !team.isEliminated
        );

        if (
          activeTeams.length > 1
        ) {
          const passedTeams: Team[] =
            [];

          const failedTeams: Team[] =
            [];

          for (
            const team of
            activeTeams
          ) {
            const submission =
              room.submissions[
                team.id
              ];

            if (
              submission?.isCorrect
            ) {
              passedTeams.push(
                team
              );
            } else {
              failedTeams.push(
                team
              );
            }
          }

          if (
            passedTeams.length ===
            0
          ) {
            room.lastKnockoutEliminations =
              [];
          } else if (
            failedTeams.length > 0
          ) {
            room.lastKnockoutEliminations =
              failedTeams.map(
                (team) =>
                  team.id
              );

            for (
              const team of
              failedTeams
            ) {
              team.isEliminated =
                true;

              team.eliminatedAtQuestion =
                room.currentQuestionIndex +
                1;

              team.eliminatedRound =
                round?.roundNumber ||
                1;

              team.eliminatedReason =
                'Incorrect answer in knockout';
            }

            if (
              passedTeams.length ===
              1
            ) {
              room.knockoutWinnerTeamId =
                passedTeams[0].id;

              room.status =
                'knockout_winner';

              room.isTimerRunning =
                false;
            }
          }
        }
      }

      break;
    }

    /* --------------------------------------------------------
       NEXT QUESTION
    -------------------------------------------------------- */

    case 'next_question': {
      const currentRound =
        room.rounds[
          room.currentRoundIndex
        ];

      const totalInRound =
        currentRound
          ?.questions.length || 0;

      let globalQuestionNumber =
        0;

      for (
        let roundIndex = 0;
        roundIndex <
        room.currentRoundIndex;
        roundIndex++
      ) {
        globalQuestionNumber +=
          room.rounds[
            roundIndex
          ].questions.length;
      }

      globalQuestionNumber +=
        room.currentQuestionIndex +
        1;

      if (
        room.settings
          .showMilestoneEvery10 &&
        globalQuestionNumber %
          10 ===
          0 &&
        room
          .lastMilestoneQuestionIndex !==
          globalQuestionNumber &&
        room.status !==
          'milestone_intermission'
      ) {
        room.status =
          'milestone_intermission';

        room.lastMilestoneQuestionIndex =
          globalQuestionNumber;

        room.isTimerRunning =
          false;

        return;
      }

      if (
        room.currentQuestionIndex +
          1 <
        totalInRound
      ) {
        room.currentQuestionIndex +=
          1;
      } else if (
        room.currentRoundIndex +
          1 <
        room.rounds.length
      ) {
        room.currentRoundIndex +=
          1;

        room.currentQuestionIndex =
          0;
      } else {
        room.status =
          'game_over';

        room.isTimerRunning =
          false;

        return;
      }

      room.status = 'question';

      room.submissions = {};

      for (
        const team of
        Object.values(
          room.teams
        )
      ) {
        team.currentSubmission =
          undefined;
      }

      const nextQuestion =
        room.rounds[
          room.currentRoundIndex
        ]?.questions[
          room
            .currentQuestionIndex
        ];

      room.timerTotal =
        nextQuestion?.timeLimitSec ||
        room.settings
          .roundTimerSeconds;

      room.timerRemaining =
        room.timerTotal;

      room.isTimerRunning =
        true;

      if (
        nextQuestion?.musicData
      ) {
        room.activeMusicTrack = {
          melodyId:
            nextQuestion.musicData
              .melodyId,

          songTitle:
            nextQuestion.musicData
              .songTitle,

          artist:
            nextQuestion.musicData
              .artist,

          audioUrl:
            nextQuestion.musicData
              .audioUrl,

          pictureClues:
            nextQuestion.musicData
              .cluePictures,
        };
      }

      break;
    }

    /* --------------------------------------------------------
       PREVIOUS QUESTION
    -------------------------------------------------------- */

    case 'prev_question': {
      if (
        room.currentQuestionIndex >
        0
      ) {
        room.currentQuestionIndex -=
          1;

        room.status =
          'question';

        room.submissions = {};

        for (
          const team of
          Object.values(
            room.teams
          )
        ) {
          team.currentSubmission =
            undefined;
        }

        const question =
          room.rounds[
            room.currentRoundIndex
          ]?.questions[
            room
              .currentQuestionIndex
          ];

        room.timerTotal =
          question?.timeLimitSec ||
          room.settings
            .roundTimerSeconds;

        room.timerRemaining =
          room.timerTotal;

        room.isTimerRunning =
          false;
      }

      break;
    }

    /* --------------------------------------------------------
       TIMER
    -------------------------------------------------------- */

    case 'toggle_timer': {
      room.isTimerRunning =
        action.isRunning !==
        undefined
          ? action.isRunning
          : !room.isTimerRunning;

      break;
    }

    case 'reset_timer': {
      const seconds =
        Number(action.seconds);

      room.timerTotal =
        Number.isFinite(seconds) &&
        seconds > 0
          ? seconds
          : room.settings
              .roundTimerSeconds;

      room.timerRemaining =
        room.timerTotal;

      room.isTimerRunning =
        true;

      break;
    }

    /* --------------------------------------------------------
       MILESTONE
    -------------------------------------------------------- */

    case 'trigger_milestone': {
      room.status =
        'milestone_intermission';

      room.isTimerRunning =
        false;

      break;
    }

    case 'close_milestone': {
      room.status =
        'question';

      room.isTimerRunning =
        true;

      break;
    }

    /* --------------------------------------------------------
       MANUAL GRADING
    -------------------------------------------------------- */

    case 'grade_answer': {
      const {
        teamId,
        isCorrect,
        points,
      } = action;

      const team =
        room.teams[teamId];

      const submission =
        room.submissions[
          teamId
        ];

      if (
        !team ||
        !submission
      ) {
        break;
      }

      const previousPoints =
        submission.reviewedByHost
          ? submission.pointsAwarded ||
            0
          : 0;

      const requestedPoints =
        Number(points) || 0;

      const newPoints =
        isCorrect
          ? Math.max(
              0,
              requestedPoints
            )
          : 0;

      team.score =
        Math.max(
          0,
          team.score -
            previousPoints +
            newPoints
        );

      submission.isCorrect =
        isCorrect;

      submission.reviewedByHost =
        true;

      submission.pointsAwarded =
        newPoints;

      break;
    }

    /* --------------------------------------------------------
       SCORE ADJUSTMENT
    -------------------------------------------------------- */

    case 'adjust_score': {
      const {
        teamId,
        delta,
      } = action;

      const team =
        room.teams[teamId];

      if (team) {
        team.score =
          Math.max(
            0,
            team.score +
              Number(delta || 0)
          );
      }

      break;
    }

    /* --------------------------------------------------------
       MUSIC
    -------------------------------------------------------- */

    case 'toggle_music': {
      room.musicPlaying =
        action.isPlaying;

      break;
    }

    /* --------------------------------------------------------
       SETTINGS
    -------------------------------------------------------- */

    case 'update_settings': {
      room.settings = {
        ...room.settings,
        ...action.settings,

        maxTeams: Math.min(
          MAX_TEAMS,
          Math.max(
            2,
            Number(
              action.settings
                ?.maxTeams ??
                room.settings
                  .maxTeams
            )
          )
        ),
      };

      break;
    }

    /* --------------------------------------------------------
       MUSIC PICTURE
    -------------------------------------------------------- */

    case 'upload_music_picture': {
      const {
        questionId,
        pictureDataUrl,
      } = action;

      for (
        const round of
        room.rounds
      ) {
        for (
          const question of
          round.questions
        ) {
          if (
            question.id ===
            questionId
          ) {
            if (
              !question.musicData
            ) {
              question.musicData = {
                songTitle:
                  'Custom Song',

                artist:
                  'Custom Artist',

                decadeOrGenre:
                  'Music Round',

                cluePictures: [],
              };
            }

            if (
              !question.musicData
                .cluePictures
            ) {
              question.musicData.cluePictures =
                [];
            }

            question.musicData.cluePictures.push(
              pictureDataUrl
            );
          }
        }
      }

      break;
    }

    /* --------------------------------------------------------
       LOAD QUESTIONS
    -------------------------------------------------------- */

    case 'load_questions': {
      room.rounds =
        action.rounds;

      room.currentRoundIndex =
        0;

      room.currentQuestionIndex =
        0;

      room.submissions = {};

      room.isTimerRunning =
        false;

      break;
    }

    /* --------------------------------------------------------
       ADD TEAM
    -------------------------------------------------------- */

    case 'add_team': {
      const {
        name,
        avatar,
      } = action;

      const maxAllowed =
        room.settings.maxTeams ||
        MAX_TEAMS;

      const currentCount =
        Object.keys(
          room.teams
        ).length;

      if (
        currentCount >=
        maxAllowed
      ) {
        break;
      }

      const newId =
        `team_${randomUUID()}`;

      const fallbackAvatar =
        TEAM_AVATARS[
          currentCount %
            TEAM_AVATARS.length
        ];

      const fallbackColor =
        TEAM_COLORS[
          currentCount %
            TEAM_COLORS.length
        ];

      room.teams[newId] = {
        id: newId,

        name:
          name?.trim() ||
          `Team ${
            currentCount + 1
          }`,

        avatar:
          avatar ||
          fallbackAvatar,

        color:
          fallbackColor,

        score: 0,

        isOnline: true,

        scoreHistory: [],
      };

      break;
    }

    /* --------------------------------------------------------
       REMOVE TEAM
    -------------------------------------------------------- */

    case 'remove_team': {
      const {
        teamId,
      } = action;

      delete room.teams[
        teamId
      ];

      delete room.submissions[
        teamId
      ];

      break;
    }

    /* --------------------------------------------------------
       PRESET TEAMS
    -------------------------------------------------------- */

    case 'create_preset_teams': {
      const {
        count,
        scheme,
      } = action;

      const safeCount =
        Math.max(
          1,
          Math.min(
            MAX_TEAMS,
            Number(count) || 1
          )
        );

      room.settings.maxTeams =
        Math.max(
          room.settings
            .maxTeams ||
            MAX_TEAMS,

          safeCount
        );

      room.teams =
        createPresetTeams(
          safeCount,
          scheme
        );

      room.submissions = {};

      break;
    }

    /* --------------------------------------------------------
       CLEAR TEAMS
    -------------------------------------------------------- */

    case 'clear_teams': {
      room.teams = {};
      room.submissions = {};

      break;
    }

    /* --------------------------------------------------------
       KNOCKOUT MODE
    -------------------------------------------------------- */

    case 'toggle_knockout_mode': {
      room.settings.knockoutMode =
        action.enabled !==
        undefined
          ? action.enabled
          : !room.settings
              .knockoutMode;

      if (
        !room.settings
          .knockoutRule
      ) {
        room.settings.knockoutRule =
          'wrong_answer';
      }

      break;
    }

    case 'set_knockout_rule': {
      room.settings.knockoutRule =
        action.rule;

      break;
    }

    /* --------------------------------------------------------
       ELIMINATE TEAM
    -------------------------------------------------------- */

    case 'eliminate_team': {
      const {
        teamId,
        reason,
      } = action;

      const team =
        room.teams[teamId];

      if (team) {
        team.isEliminated =
          true;

        team.eliminatedAtQuestion =
          room.currentQuestionIndex +
          1;

        team.eliminatedRound =
          room.rounds[
            room
              .currentRoundIndex
          ]?.roundNumber ||
          1;

        team.eliminatedReason =
          reason ||
          'Knocked Out by Host';

        const active = (
          Object.values(
            room.teams
          ) as Team[]
        ).filter(
          (candidate) =>
            !candidate.isEliminated
        );

        if (
          active.length === 1
        ) {
          room.knockoutWinnerTeamId =
            active[0].id;

          room.status =
            'knockout_winner';

          room.isTimerRunning =
            false;
        }
      }

      break;
    }

    /* --------------------------------------------------------
       REVIVE TEAM
    -------------------------------------------------------- */

    case 'revive_team': {
      const {
        teamId,
      } = action;

      const team =
        room.teams[teamId];

      if (team) {
        team.isEliminated =
          false;

        team.eliminatedReason =
          undefined;

        team.eliminatedAtQuestion =
          undefined;

        team.eliminatedRound =
          undefined;

        if (
          room.status ===
          'knockout_winner'
        ) {
          room.status =
            'question';

          room.knockoutWinnerTeamId =
            undefined;
        }
      }

      break;
    }

    /* --------------------------------------------------------
       SUDDEN DEATH
    -------------------------------------------------------- */

    case 'trigger_sudden_death': {
      const allTeams =
        Object.values(
          room.teams
        ) as Team[];

      if (
        allTeams.length >= 2
      ) {
        const maxScore =
          Math.max(
            ...allTeams.map(
              (team) =>
                team.score
            )
          );

        const topTied =
          allTeams.filter(
            (team) =>
              team.score ===
              maxScore
          );

        const contenders =
          topTied.length > 1
            ? topTied
            : [...allTeams]
                .sort(
                  (a, b) =>
                    b.score -
                    a.score
                )
                .slice(0, 2);

        const contenderIds =
          new Set(
            contenders.map(
              (team) =>
                team.id
            )
          );

        for (
          const team of
          allTeams
        ) {
          const isContender =
            contenderIds.has(
              team.id
            );

          team.isEliminated =
            !isContender;

          team.eliminatedReason =
            isContender
              ? undefined
              : 'Did not qualify for Sudden Death';
        }

        room.settings.knockoutMode =
          true;

        room.settings.knockoutRule =
          'wrong_answer';

        room.isSuddenDeathTiebreaker =
          true;

        room.knockoutWinnerTeamId =
          undefined;

        room.status =
          'question';

        room.submissions = {};

        for (
          const team of
          allTeams
        ) {
          team.currentSubmission =
            undefined;
        }

        const currentRound =
          room.rounds[
            room.currentRoundIndex
          ];

        const question =
          currentRound
            ?.questions[
              room
                .currentQuestionIndex
            ];

        room.timerTotal =
          question?.timeLimitSec ||
          room.settings
            .roundTimerSeconds;

        room.timerRemaining =
          room.timerTotal;

        room.isTimerRunning =
          true;
      }

      break;
    }

    /* --------------------------------------------------------
       RESET KNOCKOUT
    -------------------------------------------------------- */

    case 'reset_knockout': {
      for (
        const team of
        Object.values(
          room.teams
        ) as Team[]
      ) {
        team.isEliminated =
          false;

        team.eliminatedReason =
          undefined;

        team.eliminatedAtQuestion =
          undefined;

        team.eliminatedRound =
          undefined;
      }

      room.knockoutWinnerTeamId =
        undefined;

      room.isSuddenDeathTiebreaker =
        false;

      room.lastKnockoutEliminations =
        [];

      if (
        room.status ===
        'knockout_winner'
      ) {
        room.status =
          'question';
      }

      break;
    }

    /* --------------------------------------------------------
       DECLARE WINNER
    -------------------------------------------------------- */

    case 'declare_knockout_winner': {
      const team =
        room.teams[
          action.teamId
        ];

      if (!team) {
        break;
      }

      room.knockoutWinnerTeamId =
        action.teamId;

      room.status =
        'knockout_winner';

      room.isTimerRunning =
        false;

      break;
    }
  }
}

/* ============================================================
   EXPRESS ERROR HANDLER
============================================================ */

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(
      'Express error:',
      error
    );

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      error:
        'An unexpected server error occurred.',
    });
  }
);

/* ============================================================
   START SERVER
============================================================ */

async function startServer() {
  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,

          hmr:
            process.env
              .DISABLE_HMR !==
            'true',
        },

        appType: 'spa',
      });

    app.use(vite.middlewares);
  } else {
    const distPath =
      path.join(
        process.cwd(),
        'dist'
      );

    app.use(
      express.static(distPath)
    );

    app.get('*', (_req, res) => {
      res.sendFile(
        path.join(
          distPath,
          'index.html'
        )
      );
    });
  }

  server.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `🍺 Cartoon Pub Quiz Server running on port ${PORT}`
      );

      console.log(
        `🎯 Environment: ${
          process.env.NODE_ENV ||
          'development'
        }`
      );

      console.log(
        `🤖 Gemini AI: ${
          process.env
            .GEMINI_API_KEY
            ? 'configured'
            : 'fallback mode'
        }`
      );
    }
  );
}

/* ============================================================
   GRACEFUL SHUTDOWN
============================================================ */

let shuttingDown = false;

function shutdown(
  signal: string
) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(
    `${signal} received. Shutting down Cartoon Pub Quiz server...`
  );

  clearInterval(
    timerInterval
  );

  for (
    const clients of
    roomSockets.values()
  ) {
    for (
      const ws of clients
    ) {
      if (
        ws.readyState ===
        WebSocket.OPEN
      ) {
        ws.close(
          1001,
          'Server shutting down'
        );
      }
    }
  }

  wss.close();

  server.close(() => {
    console.log(
      'Cartoon Pub Quiz server stopped.'
    );

    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      'Forced server shutdown.'
    );

    process.exit(1);
  }, 10_000).unref();
}

process.on(
  'SIGTERM',
  () => shutdown('SIGTERM')
);

process.on(
  'SIGINT',
  () => shutdown('SIGINT')
);

/* ============================================================
   BOOT
============================================================ */

startServer().catch(
  (error) => {
    console.error(
      'Failed to start Cartoon Pub Quiz server:',
      error
    );

    process.exit(1);
  }
);
