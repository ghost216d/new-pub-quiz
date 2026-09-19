import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { RoomState, WSMessage, Question, Round, HostActionPayload, Team } from './src/types';
import { DEFAULT_ROUNDS } from './src/data/defaultQuestions';
import { createPresetTeams, TEAM_AVATARS, TEAM_COLORS } from './src/data/teamPresets';

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json({ limit: '10mb' }));

// Lazy Gemini API initialization
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

// In-memory Room State Store
const rooms = new Map<string, RoomState>();

// Helper to generate fun 4-letter Pub Codes
function generateRoomCode(): string {
  const words = ['PINT', 'HOPS', 'BEER', 'BARN', 'ALE9', 'FOAM', 'QUIZ', 'KEG7', 'TAP8', 'PUB3', 'WINE', 'RUM4'];
  let code = words[Math.floor(Math.random() * words.length)];
  let counter = 1;
  while (rooms.has(code)) {
    code = `${words[Math.floor(Math.random() * words.length)]}${counter++}`;
  }
  return code;
}

// Helper to create a fresh room state with up to 40 teams capacity
function createInitialRoom(
  code: string,
  hostName: string = 'Quiz Master',
  maxTeams: number = 40,
  prePopulateScheme: 'none' | 'tables' | 'pub_legends' = 'none',
  knockoutMode: boolean = false,
  knockoutRule: 'wrong_answer' | 'lowest_per_round' | 'sudden_death_tiebreaker' = 'wrong_answer'
): RoomState {
  const initialRounds = JSON.parse(JSON.stringify(DEFAULT_ROUNDS)) as Round[];
  const initialTeams: Record<string, Team> =
    prePopulateScheme !== 'none'
      ? createPresetTeams(Math.min(40, maxTeams), prePopulateScheme)
      : {};

  return {
    code,
    hostName,
    status: 'lobby',
    currentRoundIndex: 0,
    currentQuestionIndex: 0,
    rounds: initialRounds,
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

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), roomsCount: rooms.size });
});

// Create Room
app.post('/api/rooms', (req, res) => {
  const { hostName, maxTeams = 40, prePopulateScheme = 'none', knockoutMode = false, knockoutRule = 'wrong_answer' } = req.body;
  const code = generateRoomCode();
  const room = createInitialRoom(
    code,
    hostName || 'Quiz Master',
    maxTeams,
    prePopulateScheme,
    knockoutMode,
    knockoutRule
  );
  rooms.set(code, room);
  res.json({ roomCode: code, state: room });
});

// Get Room State
app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

// Helper to get curated fallback questions matching category and difficulty
function getFallbackQuestions(category: string = '', count: number = 5, difficulty: string = 'medium'): Question[] {
  const allQuestions: Question[] = [];
  DEFAULT_ROUNDS.forEach((r) => allQuestions.push(...r.questions));

  // Determine points based on difficulty
  const pointsMap: Record<string, number> = {
    easy: 10,
    medium: 15,
    hard: 20,
    expert: 25,
  };
  const defaultPts = pointsMap[difficulty] || 15;

  let filtered = allQuestions;
  if (category && category.trim().length > 0) {
    const term = category.toLowerCase().trim();
    const matched = allQuestions.filter(
      (q) =>
        q.category.toLowerCase().includes(term) ||
        term.includes(q.category.toLowerCase()) ||
        q.prompt.toLowerCase().includes(term)
    );
    if (matched.length >= 3) {
      filtered = matched;
    }
  }

  // Shuffle and assign chosen difficulty
  const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, count);
  return shuffled.map((q, idx) => ({
    ...q,
    id: `vault_${Date.now()}_${idx}`,
    points: defaultPts,
    difficulty: difficulty as any,
  }));
}

// AI Question Generator Endpoint with Multi-Model Retry & Graceful Resilience
app.post('/api/ai/generate-questions', async (req, res) => {
  const { category, count = 5, difficulty = 'medium', roundType = 'trivia' } = req.body;
  const safeCount = Math.max(1, Math.min(10, parseInt(count) || 5));

  try {
    const ai = getAI();
    if (!ai) {
      // Graceful offline/fallback if no key
      return res.json({
        success: true,
        fallback: true,
        message: 'No Gemini API key configured. Using curated pub quiz vault.',
        questions: getFallbackQuestions(category, safeCount, difficulty),
      });
    }

    const difficultyGuidance: Record<string, string> = {
      easy: 'Easy / Pub Novice: Accessible, fun everyday common knowledge with clear distractors and friendly clues. Questions everyone at the table has a shot at answering.',
      medium: 'Medium / Standard Tavern Trivia: Engaging, classic pub quiz level, requires some general knowledge and clever reasoning.',
      hard: 'Hard / Pub Master: Challenging pub trivia with nuanced facts, tricky details, and plausible distractors that test seasoned trivia buffs.',
      expert: 'Expert / Brain Buster: Mastermind level, obscure facts, deep cuts, and cleverly deceptive distractors for trivia champions.',
    };

    const diffDesc = difficultyGuidance[difficulty] || difficultyGuidance.medium;
    const basePts = difficulty === 'expert' ? 25 : difficulty === 'hard' ? 20 : difficulty === 'medium' ? 15 : 10;

    const prompt = `You are an expert British and international Pub Quiz Master.
Generate ${safeCount} witty, fact-checked pub quiz questions for category: "${category || 'General Pub Trivia'}".
Target Difficulty: ${difficulty.toUpperCase()} (${diffDesc}).
Round Type: ${roundType}.
Tone: Energetic, fun, tavern-ready cartoon pub atmosphere with verified real-world facts.
Each question MUST have:
- Exactly 4 distinct multiple-choice options
- Exactly 1 correct answer (must match one of the 4 options verbatim)
- A list of acceptable short variations for typing mode (lowercase, acronyms, common nicknames)
- A witty 1-sentence trivia explanation of the answer
- Points: ${basePts}`;

    // Primary model gemini-3.8-flash for high quality and speed, with fallback to gemini-3.1-flash-lite
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
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
                  prompt: { type: Type.STRING, description: 'The question text' },
                  category: { type: Type.STRING, description: 'Sub-category or topic' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Four multiple-choice options',
                  },
                  correctAnswer: { type: Type.STRING, description: 'The exact correct answer matching one option' },
                  acceptableAnswers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Alternative acceptable answers for typing mode',
                  },
                  explanation: { type: Type.STRING, description: 'Fun 1-sentence trivia fact explanation' },
                  points: { type: Type.INTEGER, description: 'Points awarded' },
                  timeLimitSec: { type: Type.INTEGER, description: 'Recommended seconds to answer' },
                },
                required: ['prompt', 'category', 'options', 'correctAnswer', 'explanation'],
              },
            },
          },
        });

        if (response && response.text) {
          responseText = response.text;
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with ${modelName} encountered: ${err?.message || err}. Trying next fallback...`);
        // Brief delay before trying next model
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!responseText) {
      throw lastError || new Error('All AI models unavailable');
    }

    const parsedQuestions = JSON.parse(responseText) as Partial<Question>[];
    const formattedQuestions: Question[] = parsedQuestions.map((q, idx) => ({
      id: `ai_${Date.now()}_${idx}`,
      roundNumber: 1,
      category: q.category || category || 'Pub Trivia',
      prompt: q.prompt || 'Trivia Question',
      type: 'multiple_choice',
      difficulty: difficulty as any,
      options: q.options && q.options.length >= 4 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'Option A'),
      acceptableAnswers: q.acceptableAnswers || [q.correctAnswer || ''],
      explanation: q.explanation || 'Cheers to pub knowledge!',
      points: q.points || basePts,
      timeLimitSec: q.timeLimitSec || 30,
    }));

    return res.json({ success: true, questions: formattedQuestions });
  } catch (error) {
    console.warn('AI service temporary spike or unavailable. Seamlessly serving tailored vault questions:', error);
    // Return 200 with fallback questions so the user experience NEVER halts on 503!
    const fallbackQuestions = getFallbackQuestions(category, safeCount, difficulty);
    return res.json({
      success: true,
      fallback: true,
      message: 'AI model is currently experiencing high demand. Loaded questions tailored to your chosen topic and difficulty from the curated vault!',
      questions: fallbackQuestions,
    });
  }
});

// Procedural fallback themes for instant map generation
const PROCEDURAL_MAP_THEMES = [
  {
    themeKey: 'dino_cantina',
    name: 'Jurassic Dino Cantina',
    subtitle: 'Volcanic amber ales, fossil discoveries, and prehistoric pub patrons',
    icon: '🦖',
    themeColor: '#10B981',
    accentColor: '#F59E0B',
    bgGradient: 'from-emerald-950/60 via-amber-950/40 to-slate-950',
    cardBg: 'bg-emerald-950/40 border-emerald-500/50',
    pathColor: '#10B981',
    stoneColor: 'from-emerald-500 to-teal-400',
    description: 'Travel 65 million years back in time to the tavern where T-Rexes clink stone steins!',
    categories: ['Prehistoric World', 'Dinosaurs & Fossils', 'Earth Sciences', 'Ancient Wonders', 'Cretaceous Boss Battle'],
  },
  {
    themeKey: 'wild_west_saloon',
    name: 'Golden Nugget Saloon',
    subtitle: 'Batwing swinging doors, poker tables, gold rush lore, and cowboy showdowns',
    icon: '🤠',
    themeColor: '#D97706',
    accentColor: '#EF4444',
    bgGradient: 'from-amber-950/60 via-orange-950/40 to-slate-950',
    cardBg: 'bg-amber-950/40 border-amber-500/50',
    pathColor: '#F59E0B',
    stoneColor: 'from-amber-500 to-orange-500',
    description: 'Belly up to the mahogany bar in the wild frontier for high-noon trivia shootouts.',
    categories: ['Wild West Lore', 'Gold Rush History', 'Cowboy Cinema', 'American Frontiers', 'Sheriff Showdown Boss'],
  },
  {
    themeKey: 'steampunk_station',
    name: 'Victorian Clockwork Station',
    subtitle: 'Whistling steam pipes, polished brass dials, and mechanical bartender automatons',
    icon: '⚙️',
    themeColor: '#B45309',
    accentColor: '#06B6D4',
    bgGradient: 'from-yellow-950/60 via-zinc-950 to-slate-950',
    cardBg: 'bg-yellow-950/40 border-yellow-500/50',
    pathColor: '#CA8A04',
    stoneColor: 'from-yellow-600 to-amber-400',
    description: 'An industrial marvel tavern where clockwork cogs keep the cider flowing and the gears spinning.',
    categories: ['Victorian Inventions', 'Steampunk Fiction', 'Great Inventors', 'World Railways', 'Clockwork Automaton Boss'],
  },
  {
    themeKey: 'haunted_manor',
    name: 'Spooky Phantom Crypt Pub',
    subtitle: 'Glow-in-the-dark ectoplasm ciders, moving portraits, and friendly ghost regulars',
    icon: '👻',
    themeColor: '#8B5CF6',
    accentColor: '#10B981',
    bgGradient: 'from-purple-950/60 via-emerald-950/30 to-slate-950',
    cardBg: 'bg-purple-950/40 border-purple-500/50',
    pathColor: '#A855F7',
    stoneColor: 'from-purple-500 to-indigo-600',
    description: 'Drink with spectres in an 18th-century haunted cellar where trivia never dies.',
    categories: ['Folklore & Myths', 'Gothic Mysteries', 'Horror Movies', 'Supernatural Legends', 'Phantom Poltergeist Boss'],
  },
  {
    themeKey: 'deep_sea_submarine',
    name: 'Nautilus Submarine Cantina',
    subtitle: 'Bioluminescent deep trench grog, periscope views, and giant squid encounters',
    icon: '🐙',
    themeColor: '#0284C7',
    accentColor: '#06B6D4',
    bgGradient: 'from-cyan-950/60 via-blue-950 to-slate-950',
    cardBg: 'bg-cyan-950/40 border-cyan-500/50',
    pathColor: '#0EA5E9',
    stoneColor: 'from-cyan-500 to-blue-600',
    description: 'Submerged 20,000 leagues deep! Watch glowing jellyfish float past your porthole table.',
    categories: ['Ocean Life', 'Deep Sea Exploration', 'Sunken Treasures', 'Marine Biology', 'Kraken Deep Trench Boss'],
  },
  {
    themeKey: 'viking_valhalla',
    name: 'Valhalla Mead Hall',
    subtitle: 'Roaring timber hearths, Viking shields, horned cups, and Norse mythology',
    icon: '⚔️',
    themeColor: '#E11D48',
    accentColor: '#F59E0B',
    bgGradient: 'from-rose-950/60 via-slate-950 to-slate-950',
    cardBg: 'bg-rose-950/40 border-rose-500/50',
    pathColor: '#F43F5E',
    stoneColor: 'from-rose-500 to-amber-500',
    description: 'Clash mead horns with ancient warriors under the auroras of Asgard.',
    categories: ['Norse Mythology', 'Viking Explorers', 'Medieval Lore', 'Ancient Weapons', 'Odin’s Ravens Boss Stage'],
  },
  {
    themeKey: 'cyber_tokyo',
    name: 'Neo-Tokyo Cyber Izakaya',
    subtitle: 'Neon holographic signs, synthwave beats, cyber ramen, and android sommeliers',
    icon: '🍜',
    themeColor: '#EC4899',
    accentColor: '#3B82F6',
    bgGradient: 'from-pink-950/60 via-indigo-950 to-slate-950',
    cardBg: 'bg-pink-950/40 border-pink-500/50',
    pathColor: '#F43F5E',
    stoneColor: 'from-pink-500 to-purple-600',
    description: 'A 2088 rain-soaked alleyway bar glowing in brilliant pink and cyan neon circuitry.',
    categories: ['Futuristic Tech', 'Cyberpunk Culture', 'World Megacities', 'Robotics & AI', 'Sentient Android Boss'],
  },
];

// Endpoint: AI-Powered Auto Map Generator (Creates fresh cartoon realms)
app.post('/api/ai/generate-map', async (req, res) => {
  try {
    const { existingThemes = [], totalStars = 15, currentMapName = '' } = req.body;
    const ai = getAI();

    // Fallback helper to create procedural realm
    const createProceduralRealm = () => {
      // Find a theme not yet in existingThemes
      const unusedTheme =
        PROCEDURAL_MAP_THEMES.find((t) => !existingThemes.includes(t.themeKey)) ||
        PROCEDURAL_MAP_THEMES[Math.floor(Math.random() * PROCEDURAL_MAP_THEMES.length)];

      const mapId = `${unusedTheme.themeKey}_${Date.now()}`;
      const baseReqStars = Math.max(0, Number(totalStars) + 4);

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
        levels: unusedTheme.categories.map((cat, idx) => ({
          id: `${mapId}_lvl_${idx + 1}`,
          mapThemeId: mapId,
          levelNumber: idx + 1,
          name: idx === 4 ? `Boss: ${cat}` : `Stage ${idx + 1}: ${cat}`,
          category: cat,
          difficulty: idx === 0 ? 'easy' : idx < 3 ? 'medium' : idx === 3 ? 'hard' : 'expert',
          questionCount: 5,
          coinReward: 160 + idx * 50,
          icon: idx === 4 ? '👑' : unusedTheme.icon,
          description: idx === 4 ? `Defeat the ${unusedTheme.name} realm Boss to claim the Trophy!` : `Test your knowledge on ${cat}.`,
          requiredStars: baseReqStars + idx * 2,
        })),
      };
    };

    if (!ai) {
      const generated = createProceduralRealm();
      return res.json({ success: true, map: generated, fallback: true });
    }

    const prompt = `You are a creative cartoon game designer for an entertaining Pub Quiz adventure game.
Design 1 brand new, vibrant, cartoon-themed pub quiz realm.
The current realm is: "${currentMapName}".
Existing theme IDs to avoid repeating: ${JSON.stringify(existingThemes)}.
Invent an imaginative new theme! (e.g., Dinosaur Dino Diner, Wild West Gold Rush Saloon, Steampunk Brass Station, Haunted Phantom Pub, Deep Sea Nautilus, Cyberpunk Neon Izakaya, Viking Valhalla Hall, Cozy Alpine Ski Lodge, Carnival Circus Cantina, Mount Olympus Nectar Bar).
The realm must have:
- A catchy tavern name (e.g., "The Jurassic Amber Cantina")
- A fun subtitle describing the vibes & patrons
- A single emoji icon (e.g. "🦖")
- Vibrant hex colors (themeColor, accentColor, pathColor)
- Tailwind gradient string for background (e.g., "from-emerald-950/60 via-teal-950 to-slate-950")
- Tailwind stone gradient (e.g., "from-emerald-500 to-teal-400")
- 5 sequential levels with catchy names, diverse fun categories, and Level 5 MUST be a thematic Boss level!
- Required stars to unlock: ${Math.max(0, Number(totalStars) + 4)}`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let responseText: string | null = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                icon: { type: Type.STRING },
                themeColor: { type: Type.STRING },
                accentColor: { type: Type.STRING },
                bgGradient: { type: Type.STRING },
                stoneColor: { type: Type.STRING },
                pathColor: { type: Type.STRING },
                description: { type: Type.STRING },
                levels: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      icon: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['name', 'category', 'difficulty', 'icon'],
                  },
                },
              },
              required: ['name', 'subtitle', 'icon', 'themeColor', 'levels'],
            },
          },
        });

        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        console.warn(`AI map gen attempt with ${model} failed, retrying...`, err);
      }
    }

    if (!responseText) {
      const generated = createProceduralRealm();
      return res.json({ success: true, map: generated, fallback: true });
    }

    const parsed = JSON.parse(responseText);
    const mapId = `ai_map_${Date.now()}`;
    const baseReqStars = Math.max(0, Number(totalStars) + 4);

    const formattedMap = {
      id: mapId,
      name: parsed.name || 'Enchanted Tavern Realm',
      subtitle: parsed.subtitle || 'A magical new pub realm generated just for you',
      icon: parsed.icon || '✨',
      themeColor: parsed.themeColor || '#10B981',
      accentColor: parsed.accentColor || '#F59E0B',
      bgGradient: parsed.bgGradient || 'from-emerald-950/60 via-slate-900 to-slate-950',
      cardBg: 'bg-slate-900/90 border-amber-500/50',
      pathColor: parsed.pathColor || parsed.themeColor || '#10B981',
      stoneColor: parsed.stoneColor || 'from-emerald-500 to-teal-400',
      requiredStars: baseReqStars,
      description: parsed.description || 'An all-new tavern adventure created by the AI Mapmaker!',
      isAiGenerated: true,
      levels: (parsed.levels || []).slice(0, 5).map((lvl: any, idx: number) => ({
        id: `${mapId}_lvl_${idx + 1}`,
        mapThemeId: mapId,
        levelNumber: idx + 1,
        name: lvl.name || `Stage ${idx + 1}`,
        category: lvl.category || 'General Pub Knowledge',
        difficulty: (lvl.difficulty?.toLowerCase() === 'easy' || lvl.difficulty?.toLowerCase() === 'hard' || lvl.difficulty?.toLowerCase() === 'expert') ? lvl.difficulty.toLowerCase() : 'medium',
        questionCount: 5,
        coinReward: 180 + idx * 50,
        icon: idx === 4 ? '👑' : (lvl.icon || parsed.icon || '🍺'),
        description: lvl.description || `Test your trivia prowess in ${lvl.category}`,
        requiredStars: baseReqStars + idx * 2,
      })),
    };

    // Ensure 5 levels
    while (formattedMap.levels.length < 5) {
      const idx = formattedMap.levels.length;
      formattedMap.levels.push({
        id: `${mapId}_lvl_${idx + 1}`,
        mapThemeId: mapId,
        levelNumber: idx + 1,
        name: idx === 4 ? 'Boss Realm Gauntlet' : `Stage ${idx + 1}`,
        category: 'Pub Knowledge',
        difficulty: idx === 4 ? 'hard' : 'medium',
        questionCount: 5,
        coinReward: 200 + idx * 40,
        icon: idx === 4 ? '👑' : '🍺',
        description: 'Conquer this trivia challenge to progress!',
        requiredStars: baseReqStars + idx * 2,
      });
    }

    return res.json({ success: true, map: formattedMap, fallback: false });
  } catch (err) {
    console.error('Map generation endpoint error:', err);
    return res.status(500).json({ error: 'Failed to generate map' });
  }
});

// Setup HTTP server
const server = http.createServer(app);

// Setup WebSocket Server for real-time synchronization
const wss = new WebSocketServer({ server, path: '/ws' });

interface ClientMeta {
  roomCode: string;
  role: 'host' | 'player' | 'tv';
  teamId?: string;
}
const clientMetadata = new WeakMap<WebSocket, ClientMeta>();
const roomSockets = new Map<string, Set<WebSocket>>();

function broadcastRoomState(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const sockets = roomSockets.get(roomCode);
  if (!sockets) return;

  const payload = JSON.stringify({
    type: 'room_state',
    state: room,
  });

  for (const client of sockets) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Timer tick loop every 1 second
setInterval(() => {
  for (const [code, room] of rooms.entries()) {
    if (room.status === 'question' && room.isTimerRunning && room.timerRemaining > 0) {
      room.timerRemaining -= 1;
      if (room.timerRemaining <= 0) {
        room.isTimerRunning = false;
        // Broadcast time expired
      }
      broadcastRoomState(code);
    }
  }
}, 1000);

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (messageRaw: string) => {
    try {
      const msg: WSMessage = JSON.parse(messageRaw.toString());

      if (msg.type === 'join_room') {
        const { roomCode, role, team } = msg;
        const upperCode = roomCode.toUpperCase();

        let room = rooms.get(upperCode);
        if (!room) {
          if (role === 'host') {
            room = createInitialRoom(upperCode);
            rooms.set(upperCode, room);
          } else {
            ws.send(JSON.stringify({ type: 'error', message: `Room "${upperCode}" does not exist. Check code!` }));
            return;
          }
        }

        // Add socket to room map
        if (!roomSockets.has(upperCode)) {
          roomSockets.set(upperCode, new Set());
        }
        roomSockets.get(upperCode)!.add(ws);

        let teamId: string | undefined = undefined;

        if (role === 'player' && team) {
          const maxAllowed = room.settings.maxTeams || 40;
          teamId = team.teamId || `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

          if (room.teams[teamId]) {
            // Claiming or rejoining existing team slot (e.g. Table 1..40 or preset pub team)
            room.teams[teamId].isOnline = true;
            if (team.name) room.teams[teamId].name = team.name;
            if (team.avatar) room.teams[teamId].avatar = team.avatar;
          } else {
            const currentCount = Object.keys(room.teams).length;
            if (currentCount >= maxAllowed) {
              ws.send(JSON.stringify({
                type: 'error',
                message: `This pub room has reached its maximum limit of ${maxAllowed} teams!`,
              }));
              return;
            }
            const fallbackColor = TEAM_COLORS[currentCount % TEAM_COLORS.length];
            room.teams[teamId] = {
              id: teamId,
              name: team.name || `Team ${currentCount + 1}`,
              avatar: team.avatar || TEAM_AVATARS[currentCount % TEAM_AVATARS.length],
              color: team.color || fallbackColor,
              score: 0,
              isOnline: true,
              scoreHistory: [],
            };
          }
        }

        clientMetadata.set(ws, { roomCode: upperCode, role, teamId });
        // Send immediate state to joining client
        ws.send(JSON.stringify({ type: 'room_state', state: room }));
        // Broadcast updated team list to everyone in room
        broadcastRoomState(upperCode);
      }

      if (msg.type === 'submit_answer') {
        const { roomCode, teamId, answer } = msg;
        const upperCode = roomCode.toUpperCase();
        const room = rooms.get(upperCode);
        if (!room) return;

        const currentRound = room.rounds[room.currentRoundIndex];
        const currentQ = currentRound?.questions[room.currentQuestionIndex];
        if (!currentQ) return;

        const team = room.teams[teamId];
        if (!team) return;

        // Compare answer
        const cleanGiven = answer.trim().toLowerCase();
        const cleanCorrect = currentQ.correctAnswer.trim().toLowerCase();
        let isCorrect = cleanGiven === cleanCorrect;
        if (!isCorrect && currentQ.acceptableAnswers) {
          isCorrect = currentQ.acceptableAnswers.some((a) => a.trim().toLowerCase() === cleanGiven);
        }

        const submission = {
          teamId,
          teamName: team.name,
          answer,
          submittedAt: Date.now(),
          isCorrect,
          reviewedByHost: false,
          pointsAwarded: isCorrect ? currentQ.points : 0,
        };

        room.submissions[teamId] = submission;
        team.currentSubmission = submission;

        broadcastRoomState(upperCode);
      }

      if (msg.type === 'host_action') {
        const { roomCode, action } = msg;
        const upperCode = roomCode.toUpperCase();
        const room = rooms.get(upperCode);
        if (!room) return;

        handleHostAction(room, action);
        broadcastRoomState(upperCode);
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    const meta = clientMetadata.get(ws);
    if (meta) {
      const { roomCode, teamId } = meta;
      const room = rooms.get(roomCode);
      if (room && teamId && room.teams[teamId]) {
        room.teams[teamId].isOnline = false;
        broadcastRoomState(roomCode);
      }
      const set = roomSockets.get(roomCode);
      if (set) {
        set.delete(ws);
        if (set.size === 0) {
          // Keep room state alive in memory for reconnects
        }
      }
    }
  });
});

function handleHostAction(room: RoomState, action: HostActionPayload) {
  switch (action.actionType) {
    case 'start_game': {
      room.status = 'round_transition'; // Seamless round transition card first!
      room.currentQuestionIndex = 0;
      room.currentRoundIndex = 0;
      room.submissions = {};
      const firstQ = room.rounds[0]?.questions[0];
      room.timerTotal = firstQ?.timeLimitSec || room.settings.roundTimerSeconds;
      room.timerRemaining = room.timerTotal;
      room.isTimerRunning = false;
      break;
    }

    case 'start_round': {
      room.currentRoundIndex = action.roundIndex;
      room.currentQuestionIndex = 0;
      room.status = 'question';
      room.submissions = {};
      for (const t of Object.values(room.teams)) {
        t.currentSubmission = undefined;
      }
      const firstQ = room.rounds[room.currentRoundIndex]?.questions[0];
      room.timerTotal = firstQ?.timeLimitSec || room.settings.roundTimerSeconds;
      room.timerRemaining = room.timerTotal;
      room.isTimerRunning = true;
      if (firstQ?.musicData) {
        room.activeMusicTrack = {
          melodyId: firstQ.musicData.melodyId,
          songTitle: firstQ.musicData.songTitle,
          artist: firstQ.musicData.artist,
          audioUrl: firstQ.musicData.audioUrl,
          pictureClues: firstQ.musicData.cluePictures,
        };
      }
      break;
    }

    case 'next_round': {
      // If Knockout mode with lowest_per_round rule: eliminate bottom teams
      if (room.settings.knockoutMode && room.settings.knockoutRule === 'lowest_per_round') {
        const activeTeams = (Object.values(room.teams) as Team[]).filter((t) => !t.isEliminated);
        if (activeTeams.length > 1) {
          const minScore = Math.min(...activeTeams.map((t) => t.score));
          const lowestTeams = activeTeams.filter((t) => t.score === minScore);
          // If not everyone is tied for the bottom score, eliminate the bottom team(s)
          if (lowestTeams.length < activeTeams.length) {
            for (const t of lowestTeams) {
              t.isEliminated = true;
              t.eliminatedRound = room.rounds[room.currentRoundIndex]?.roundNumber || 1;
              t.eliminatedReason = 'Lowest score at round end';
            }
            const remaining = activeTeams.filter((t) => t.score > minScore);
            if (remaining.length === 1) {
              room.knockoutWinnerTeamId = remaining[0].id;
              room.status = 'knockout_winner';
              room.isTimerRunning = false;
              break;
            }
          }
        }
      }

      if (room.currentRoundIndex + 1 < room.rounds.length) {
        room.currentRoundIndex += 1;
        room.currentQuestionIndex = 0;
        room.status = 'round_transition';
        room.submissions = {};
        room.isTimerRunning = false;
      } else {
        // Game Over: In knockout mode, we MUST have ONE winner!
        const activeTeams = (Object.values(room.teams) as Team[]).filter((t) => !t.isEliminated);
        if (room.settings.knockoutMode && activeTeams.length > 1) {
          const maxScore = Math.max(...activeTeams.map((t) => t.score));
          const topWinners = activeTeams.filter((t) => t.score === maxScore);
          if (topWinners.length === 1) {
            room.knockoutWinnerTeamId = topWinners[0].id;
            room.status = 'knockout_winner';
            room.isTimerRunning = false;
            break;
          } else {
            // Tie for 1st place! Must have ONE winner: Auto-trigger Sudden Death Tiebreaker!
            for (const t of activeTeams) {
              if (t.score !== maxScore) {
                t.isEliminated = true;
                t.eliminatedReason = 'Did not qualify for tiebreaker';
              }
            }
            room.isSuddenDeathTiebreaker = true;
            room.settings.knockoutRule = 'wrong_answer';
            room.status = 'question';
            room.submissions = {};
            const curRound = room.rounds[room.currentRoundIndex];
            const q = curRound?.questions[room.currentQuestionIndex];
            room.timerTotal = q?.timeLimitSec || room.settings.roundTimerSeconds;
            room.timerRemaining = room.timerTotal;
            room.isTimerRunning = true;
            break;
          }
        } else if (room.settings.knockoutMode && activeTeams.length === 1) {
          room.knockoutWinnerTeamId = activeTeams[0].id;
          room.status = 'knockout_winner';
          room.isTimerRunning = false;
          break;
        }

        room.status = 'game_over';
        room.isTimerRunning = false;
      }
      break;
    }

    case 'prev_round': {
      if (room.currentRoundIndex > 0) {
        room.currentRoundIndex -= 1;
        room.currentQuestionIndex = 0;
        room.status = 'round_transition';
        room.submissions = {};
        room.isTimerRunning = false;
      }
      break;
    }

    case 'jump_to_question': {
      const { roundIndex, questionIndex } = action;
      if (room.rounds[roundIndex]?.questions[questionIndex]) {
        room.currentRoundIndex = roundIndex;
        room.currentQuestionIndex = questionIndex;
        room.status = 'question';
        room.submissions = {};
        for (const t of Object.values(room.teams)) {
          t.currentSubmission = undefined;
        }
        const targetQ = room.rounds[roundIndex].questions[questionIndex];
        room.timerTotal = targetQ.timeLimitSec || room.settings.roundTimerSeconds;
        room.timerRemaining = room.timerTotal;
        room.isTimerRunning = true;
      }
      break;
    }

    case 'add_time': {
      room.timerRemaining = Math.max(0, room.timerRemaining + action.seconds);
      room.timerTotal = Math.max(room.timerTotal, room.timerRemaining);
      break;
    }

    case 'set_answer_mode': {
      room.settings.answerMode = action.mode;
      // Also adapt current question type for immediate responsive gameplay
      const currentQ = room.rounds[room.currentRoundIndex]?.questions[room.currentQuestionIndex];
      if (currentQ) {
        currentQ.type = action.mode;
      }
      break;
    }

    case 'reveal_answer': {
      room.status = 'answer_reveal';
      room.isTimerRunning = false;
      // Auto score remaining multiple-choice submissions
      const round = room.rounds[room.currentRoundIndex];
      const q = round?.questions[room.currentQuestionIndex];
      if (q) {
        for (const [tId, sub] of Object.entries(room.submissions)) {
          const team = room.teams[tId];
          if (!team) continue;
          if (sub.isCorrect && !sub.reviewedByHost) {
            team.score += sub.pointsAwarded || q.points;
            team.scoreHistory.push({
              questionIndex: room.currentQuestionIndex + 1,
              roundNumber: round.roundNumber,
              delta: sub.pointsAwarded || q.points,
              cumulativeScore: team.score,
              isCorrect: true,
            });
            sub.reviewedByHost = true;
          } else if (!sub.isCorrect && !sub.reviewedByHost) {
            team.scoreHistory.push({
              questionIndex: room.currentQuestionIndex + 1,
              roundNumber: round.roundNumber,
              delta: 0,
              cumulativeScore: team.score,
              isCorrect: false,
            });
            sub.reviewedByHost = true;
          }
        }
      }

      // Knockout Mode: Sudden Death / Wrong Answer Elimination (MUST have one winner!)
      if (
        room.settings.knockoutMode &&
        (room.settings.knockoutRule === 'wrong_answer' || room.isSuddenDeathTiebreaker)
      ) {
        const activeTeams = (Object.values(room.teams) as Team[]).filter((t) => !t.isEliminated);
        if (activeTeams.length > 1) {
          const passedTeams: Team[] = [];
          const failedTeams: Team[] = [];

          for (const t of activeTeams) {
            const sub = room.submissions[t.id];
            if (sub && sub.isCorrect) {
              passedTeams.push(t);
            } else {
              failedTeams.push(t);
            }
          }

          // Crucial: "where you must have one winner"
          // If EVERY active contender failed this question, do not eliminate all of them at once (which would leave 0 winners)!
          // Instead, trigger a sudden death stalemate reprieve: all remain alive for the next tie-breaker question!
          if (passedTeams.length === 0) {
            room.lastKnockoutEliminations = [];
          } else if (failedTeams.length > 0) {
            room.lastKnockoutEliminations = failedTeams.map((t) => t.id);
            for (const t of failedTeams) {
              t.isEliminated = true;
              t.eliminatedAtQuestion = room.currentQuestionIndex + 1;
              t.eliminatedRound = round?.roundNumber || 1;
              t.eliminatedReason = 'Incorrect answer in knockout';
            }

            // Exactly ONE team survived!
            if (passedTeams.length === 1) {
              room.knockoutWinnerTeamId = passedTeams[0].id;
              room.status = 'knockout_winner';
            }
          }
        }
      }
      break;
    }

    case 'next_question': {
      const currentRound = room.rounds[room.currentRoundIndex];
      const totalInRound = currentRound?.questions.length || 0;

      // Calculate total question number across rounds (1-indexed)
      let globalQuestionNumber = 0;
      for (let r = 0; r < room.currentRoundIndex; r++) {
        globalQuestionNumber += room.rounds[r].questions.length;
      }
      globalQuestionNumber += room.currentQuestionIndex + 1;

      // Every 10 questions, trigger the TV milestone celebration if not triggered yet!
      if (
        room.settings.showMilestoneEvery10 &&
        globalQuestionNumber % 10 === 0 &&
        room.lastMilestoneQuestionIndex !== globalQuestionNumber &&
        room.status !== 'milestone_intermission'
      ) {
        room.status = 'milestone_intermission';
        room.lastMilestoneQuestionIndex = globalQuestionNumber;
        room.isTimerRunning = false;
        return;
      }

      if (room.currentQuestionIndex + 1 < totalInRound) {
        room.currentQuestionIndex += 1;
      } else if (room.currentRoundIndex + 1 < room.rounds.length) {
        room.currentRoundIndex += 1;
        room.currentQuestionIndex = 0;
      } else {
        room.status = 'game_over';
        room.isTimerRunning = false;
        return;
      }

      room.status = 'question';
      room.submissions = {};
      // Reset current submissions on teams
      for (const t of Object.values(room.teams)) {
        t.currentSubmission = undefined;
      }

      const nextQ = room.rounds[room.currentRoundIndex]?.questions[room.currentQuestionIndex];
      room.timerTotal = nextQ?.timeLimitSec || room.settings.roundTimerSeconds;
      room.timerRemaining = room.timerTotal;
      room.isTimerRunning = true;

      // Update active music track if question has music data
      if (nextQ?.musicData) {
        room.activeMusicTrack = {
          melodyId: nextQ.musicData.melodyId,
          songTitle: nextQ.musicData.songTitle,
          artist: nextQ.musicData.artist,
          audioUrl: nextQ.musicData.audioUrl,
          pictureClues: nextQ.musicData.cluePictures,
        };
      }
      break;
    }

    case 'prev_question': {
      if (room.currentQuestionIndex > 0) {
        room.currentQuestionIndex -= 1;
        room.status = 'question';
        room.submissions = {};
      }
      break;
    }

    case 'toggle_timer': {
      room.isTimerRunning = action.isRunning !== undefined ? action.isRunning : !room.isTimerRunning;
      break;
    }

    case 'reset_timer': {
      room.timerTotal = action.seconds || room.settings.roundTimerSeconds;
      room.timerRemaining = room.timerTotal;
      room.isTimerRunning = true;
      break;
    }

    case 'trigger_milestone': {
      room.status = 'milestone_intermission';
      room.isTimerRunning = false;
      break;
    }

    case 'close_milestone': {
      room.status = 'question';
      room.isTimerRunning = true;
      break;
    }

    case 'grade_answer': {
      const { teamId, isCorrect, points } = action;
      const team = room.teams[teamId];
      if (!team) return;

      const delta = isCorrect ? points : 0;
      team.score += delta;
      team.scoreHistory.push({
        questionIndex: room.currentQuestionIndex + 1,
        roundNumber: room.rounds[room.currentRoundIndex]?.roundNumber || 1,
        delta,
        cumulativeScore: team.score,
        isCorrect,
      });

      if (room.submissions[teamId]) {
        room.submissions[teamId].isCorrect = isCorrect;
        room.submissions[teamId].reviewedByHost = true;
        room.submissions[teamId].pointsAwarded = delta;
      }
      break;
    }

    case 'adjust_score': {
      const { teamId, delta } = action;
      const team = room.teams[teamId];
      if (team) {
        team.score = Math.max(0, team.score + delta);
      }
      break;
    }

    case 'toggle_music': {
      room.musicPlaying = action.isPlaying;
      break;
    }

    case 'update_settings': {
      room.settings = { ...room.settings, ...action.settings };
      break;
    }

    case 'upload_music_picture': {
      const { questionId, pictureDataUrl } = action;
      for (const round of room.rounds) {
        for (const q of round.questions) {
          if (q.id === questionId) {
            if (!q.musicData) {
              q.musicData = {
                songTitle: 'Custom Song',
                artist: 'Custom Artist',
                decadeOrGenre: 'Music Round',
                cluePictures: [],
              };
            }
            if (!q.musicData.cluePictures) {
              q.musicData.cluePictures = [];
            }
            q.musicData.cluePictures.push(pictureDataUrl);
          }
        }
      }
      break;
    }

    case 'load_questions': {
      room.rounds = action.rounds;
      room.currentRoundIndex = 0;
      room.currentQuestionIndex = 0;
      break;
    }

    case 'add_team': {
      const { name, avatar } = action;
      const maxAllowed = room.settings.maxTeams || 40;
      const currentCount = Object.keys(room.teams).length;
      if (currentCount >= maxAllowed) {
        break;
      }
      const newId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const fallbackAvatar = TEAM_AVATARS[currentCount % TEAM_AVATARS.length];
      const fallbackColor = TEAM_COLORS[currentCount % TEAM_COLORS.length];
      room.teams[newId] = {
        id: newId,
        name: name?.trim() || `Team ${currentCount + 1}`,
        avatar: avatar || fallbackAvatar,
        color: fallbackColor,
        score: 0,
        isOnline: true,
        scoreHistory: [],
      };
      break;
    }

    case 'remove_team': {
      const { teamId } = action;
      delete room.teams[teamId];
      delete room.submissions[teamId];
      break;
    }

    case 'create_preset_teams': {
      const { count, scheme } = action;
      const safeCount = Math.max(1, Math.min(40, count));
      room.settings.maxTeams = Math.max(room.settings.maxTeams || 40, safeCount);
      room.teams = createPresetTeams(safeCount, scheme);
      room.submissions = {};
      break;
    }

    case 'clear_teams': {
      room.teams = {};
      room.submissions = {};
      break;
    }

    case 'toggle_knockout_mode': {
      room.settings.knockoutMode = action.enabled !== undefined ? action.enabled : !room.settings.knockoutMode;
      if (!room.settings.knockoutRule) {
        room.settings.knockoutRule = 'wrong_answer';
      }
      break;
    }

    case 'set_knockout_rule': {
      room.settings.knockoutRule = action.rule;
      break;
    }

    case 'eliminate_team': {
      const { teamId, reason } = action;
      const team = room.teams[teamId];
      if (team) {
        team.isEliminated = true;
        team.eliminatedAtQuestion = room.currentQuestionIndex + 1;
        team.eliminatedRound = room.rounds[room.currentRoundIndex]?.roundNumber || 1;
        team.eliminatedReason = reason || 'Knocked Out by Host';

        // Check if only 1 active team remains
        const active = (Object.values(room.teams) as Team[]).filter((t) => !t.isEliminated);
        if (active.length === 1) {
          room.knockoutWinnerTeamId = active[0].id;
          room.status = 'knockout_winner';
        }
      }
      break;
    }

    case 'revive_team': {
      const { teamId } = action;
      const team = room.teams[teamId];
      if (team) {
        team.isEliminated = false;
        team.eliminatedReason = undefined;
        team.eliminatedAtQuestion = undefined;
        if (room.status === 'knockout_winner') {
          room.status = 'question';
          room.knockoutWinnerTeamId = undefined;
        }
      }
      break;
    }

    case 'trigger_sudden_death': {
      const allTeams = Object.values(room.teams) as Team[];
      if (allTeams.length >= 2) {
        const maxScore = Math.max(...allTeams.map((t) => t.score));
        const topTied = allTeams.filter((t) => t.score === maxScore);
        const contenders =
          topTied.length > 1
            ? topTied
            : allTeams.sort((a, b) => b.score - a.score).slice(0, 2);

        for (const t of allTeams) {
          const isContender = contenders.some((c) => c.id === t.id);
          t.isEliminated = !isContender;
          if (!isContender) {
            t.eliminatedReason = 'Did not qualify for Sudden Death';
          } else {
            t.eliminatedReason = undefined;
          }
        }

        room.settings.knockoutMode = true;
        room.settings.knockoutRule = 'wrong_answer';
        room.isSuddenDeathTiebreaker = true;
        room.knockoutWinnerTeamId = undefined;
        room.status = 'question';
        room.submissions = {};
        for (const t of allTeams) {
          t.currentSubmission = undefined;
        }

        const currentRound = room.rounds[room.currentRoundIndex];
        const q = currentRound?.questions[room.currentQuestionIndex];
        room.timerTotal = q?.timeLimitSec || room.settings.roundTimerSeconds;
        room.timerRemaining = room.timerTotal;
        room.isTimerRunning = true;
      }
      break;
    }

    case 'reset_knockout': {
      for (const t of Object.values(room.teams) as Team[]) {
        t.isEliminated = false;
        t.eliminatedReason = undefined;
        t.eliminatedAtQuestion = undefined;
      }
      room.knockoutWinnerTeamId = undefined;
      room.isSuddenDeathTiebreaker = false;
      if (room.status === 'knockout_winner') {
        room.status = 'question';
      }
      break;
    }

    case 'declare_knockout_winner': {
      room.knockoutWinnerTeamId = action.teamId;
      room.status = 'knockout_winner';
      room.isTimerRunning = false;
      break;
    }
  }
}

// Start Server & Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Cartoon Pub Quiz Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
