import { Question, QuizDifficulty } from '../types';

const TOKEN_KEY = 'pubquiz_opentdb_token_v1';
const SEEN_KEY = 'pubquiz_seen_questions_v1';
const MASTERED_KEY = 'pubquiz_mastered_questions_v1';
const MAX_SEEN = 10000;

const readStoredValue = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStoredValue = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Questions should remain playable when browser storage is unavailable.
  }
};

const CATEGORY_IDS: Array<[RegExp, number]> = [
  [/general knowledge|^trivia$/i, 9],
  [/film|movie|cinema/i, 11],
  [/music|song|band/i, 12],
  [/television|tv/i, 14],
  [/science|nature/i, 17],
  [/math|maths|mathematics|arithmetic|number/i, 19],
  [/computer|technology|tech/i, 18],
  [/history|historic/i, 23],
  [/politic|government/i, 24],
  [/art/i, 25],
  [/celebrity/i, 26],
  [/animal/i, 27],
  [/vehicle|car|transport/i, 28],
  [/sport|football/i, 21],
  [/geography|world|travel|landmark/i, 22],
  [/book|literature/i, 10],
];

interface OpenTriviaQuestion {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OpenTriviaResponse {
  response_code: number;
  token?: string;
  results?: OpenTriviaQuestion[];
}

const decodeHtml = (value: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
};

const normalizePrompt = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Exact matching alone lets lightly reworded questions through. Compare the
// meaningful words too, so "Who painted the Mona Lisa?" and "Which artist
// painted the Mona Lisa?" are treated as the same question.
const SIMILARITY_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'did', 'do', 'does', 'for',
  'from', 'has', 'have', 'how', 'in', 'is', 'it', 'its', 'of', 'on', 'or',
  'that', 'the', 'this', 'to', 'was', 'were', 'what', 'when', 'where', 'which',
  'who', 'whose', 'with',
]);

const meaningfulWords = (value: string): Set<string> => new Set(
  normalizePrompt(value)
    .split(' ')
    .filter((word) => (/^\d+$/.test(word) || word.length > 2) && !SIMILARITY_STOP_WORDS.has(word)),
);

const isTooSimilar = (candidate: string, previous: string): boolean => {
  const normalizedCandidate = normalizePrompt(candidate);
  const normalizedPrevious = normalizePrompt(previous);
  if (!normalizedCandidate || !normalizedPrevious) return false;
  if (normalizedCandidate === normalizedPrevious) return true;

  const candidateWords = meaningfulWords(normalizedCandidate);
  const previousWords = meaningfulWords(normalizedPrevious);
  if (candidateWords.size < 2 || previousWords.size < 2) return false;

  const shared = [...candidateWords].filter((word) => previousWords.has(word)).length;
  const smaller = Math.min(candidateWords.size, previousWords.size);
  const union = new Set([...candidateWords, ...previousWords]).size;
  return shared / smaller >= 0.8 || shared / union >= 0.68;
};

const hasBeenUsed = (prompt: string, history: string[]): boolean =>
  history.some((previous) => isTooSimilar(prompt, previous));

export const dedupeSimilarQuestions = <T extends Question>(questions: T[]): T[] => {
  const unique: T[] = [];
  const prompts: string[] = [];

  questions.forEach((question) => {
    const prompt = typeof question.prompt === 'string' ? question.prompt : '';
    if (!prompt || hasBeenUsed(prompt, prompts)) return;
    unique.push(question);
    prompts.push(prompt);
  });

  return unique;
};

const readSeen = (): string[] => {
  try {
    const parsed = JSON.parse(readStoredValue(SEEN_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const readMastered = (): string[] => {
  try {
    const parsed = JSON.parse(readStoredValue(MASTERED_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

export const markQuestionMastered = (prompt: string): void => {
  const normalized = normalizePrompt(prompt);
  if (!normalized) return;
  const mastered = readMastered();
  if (hasBeenUsed(normalized, mastered)) return;
  writeStoredValue(MASTERED_KEY, JSON.stringify([...mastered, normalized].slice(-MAX_SEEN)));
};

export const getQuestionHistory = (): string[] => [...readSeen(), ...readMastered()];

export const recordQuestionsAsSeen = (prompts: string[]): void => saveSeen(prompts);

const saveSeen = (prompts: string[]) => {
  const normalizedPrompts = prompts.map(normalizePrompt).filter(Boolean);
  const selected = new Set(normalizedPrompts);
  // Remove previously stored copies before appending. This makes the end of
  // the list a true recency record, so recycled questions move to the back.
  const merged = [
    ...readSeen().filter((prompt) => !selected.has(normalizePrompt(prompt))),
    ...normalizedPrompts,
  ];
  writeStoredValue(SEEN_KEY, JSON.stringify(merged.slice(-MAX_SEEN)));
};

const getSecureQuestionEndpoint = (): string | null => {
  const configured = String(import.meta.env?.VITE_QUESTION_API_URL || '').trim();
  return configured ? configured.replace(/\/$/, '') : null;
};

const getSecureAiQuestions = async ({
  category,
  count,
  difficulty,
}: {
  category: string;
  count: number;
  difficulty: QuizDifficulty;
}): Promise<Question[]> => {
  const endpoint = getSecureQuestionEndpoint();
  if (!endpoint) throw new Error('Secure question service is not configured.');

  const seen = [...readSeen(), ...readMastered()];
  const response = await fetch(`${endpoint}/questions`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, count, difficulty, seen: seen.slice(-3000) }),
  });
  if (!response.ok) throw new Error('Secure question service is unavailable.');

  const payload = await response.json() as { questions?: Question[] };
  const questions = Array.isArray(payload.questions) ? payload.questions : [];
  const comparisonHistory = [...seen];
  const unique = questions.filter((question) => {
    const normalized = normalizePrompt(question.prompt || '');
    if (!normalized || hasBeenUsed(normalized, comparisonHistory)) return false;
    comparisonHistory.push(normalized);
    return true;
  }).slice(0, count);

  if (unique.length < count) throw new Error('The secure service did not return enough unseen questions.');
  saveSeen(unique.map((question) => question.prompt));
  return unique;
};

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

const requestSessionToken = async (): Promise<string> => {
  const response = await fetch('https://opentdb.com/api_token.php?command=request');
  if (!response.ok) throw new Error('Unable to start online trivia session.');
  const data = (await response.json()) as OpenTriviaResponse;
  if (!data.token) throw new Error('Online trivia session did not return a token.');
  writeStoredValue(TOKEN_KEY, data.token);
  return data.token;
};

const getSessionToken = async (): Promise<string> => {
  const stored = readStoredValue(TOKEN_KEY);
  return stored || requestSessionToken();
};

const resetSessionToken = async (token: string): Promise<void> => {
  await fetch(`https://opentdb.com/api_token.php?command=reset&token=${encodeURIComponent(token)}`);
};

export const getOnlineTriviaQuestions = async ({
  category,
  count,
  difficulty,
  mixed = false,
  broadPool = false,
  candidateMultiplier = 3,
}: {
  category: string;
  count: number;
  difficulty: QuizDifficulty;
  mixed?: boolean;
  broadPool?: boolean;
  candidateMultiplier?: number;
}): Promise<Question[]> => {
  // Prefer the protected Gemini proxy. The browser receives questions only;
  // the Gemini key remains an encrypted server-side secret.
  if (!mixed && getSecureQuestionEndpoint()) {
    try {
      return await getSecureAiQuestions({ category, count, difficulty });
    } catch (error) {
      console.warn('Secure AI questions unavailable; trying Open Trivia DB.', error);
    }
  }

  let token = await getSessionToken();
  const categoryId = broadPool ? undefined : CATEGORY_IDS.find(([pattern]) => pattern.test(category))?.[1];
  const mathsTopic = /\b(math|maths|mathematics|arithmetic|numbers?)\b/i.test(category);
  const onlineDifficulty = mixed
    ? undefined
    : mathsTopic
      ? (difficulty === 'easy' ? 'easy' : 'medium')
      : (difficulty === 'expert' ? 'hard' : difficulty);
  const amount = Math.min(50, Math.max(count * (mixed ? 2 : candidateMultiplier), 12));

  const buildUrl = () => {
    const params = new URLSearchParams({
      amount: String(amount),
      type: 'multiple',
      token,
    });
    if (onlineDifficulty) params.set('difficulty', onlineDifficulty);
    if (categoryId) params.set('category', String(categoryId));
    return `https://opentdb.com/api.php?${params.toString()}`;
  };

  const seen = [...readSeen(), ...readMastered()];
  let response = await fetch(buildUrl(), { cache: 'no-store' });
  if (!response.ok) throw new Error('Online trivia service is unavailable.');
  let data = (await response.json()) as OpenTriviaResponse;
  if (data.response_code === 3) {
    // Open Trivia DB deletes tokens after six hours of inactivity. Replace a
    // stale browser-stored token once so returning players can keep loading.
    token = await requestSessionToken();
    response = await fetch(buildUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Online trivia service is unavailable.');
    data = (await response.json()) as OpenTriviaResponse;
  } else if (data.response_code === 4) {
    await resetSessionToken(token);
    await new Promise((resolve) => window.setTimeout(resolve, 5100));
    response = await fetch(buildUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Online trivia service is unavailable.');
    data = (await response.json()) as OpenTriviaResponse;
  } else if (data.response_code === 5) {
    // Open Trivia DB allows one question request per IP every five seconds.
    // A shared Wi-Fi connection may briefly hit that limit, so retry once.
    await new Promise((resolve) => window.setTimeout(resolve, 5100));
    response = await fetch(buildUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Online trivia service is unavailable.');
    data = (await response.json()) as OpenTriviaResponse;
  }
  if (data.response_code !== 0 || !Array.isArray(data.results)) {
    throw new Error(data.response_code === 5
      ? 'The online question service is rate limited.'
      : 'The online question service has no fresh questions for this request.');
  }

  const unique: Question[] = [];
  for (const item of data.results) {
    const decodedPrompt = decodeHtml(item.question);
    if (hasBeenUsed(decodedPrompt, seen)) continue;
    seen.push(decodedPrompt);
    const correctAnswer = decodeHtml(item.correct_answer);
    const sourceDifficulty = item.difficulty;
    unique.push({
      id: `online_${Date.now()}_${unique.length}`,
      roundNumber: 1,
      category: decodeHtml(item.category),
      prompt: decodedPrompt,
      type: 'multiple_choice',
      difficulty: sourceDifficulty,
      options: shuffled([correctAnswer, ...item.incorrect_answers.map(decodeHtml)]),
      correctAnswer,
      acceptableAnswers: [correctAnswer.toLowerCase()],
      explanation: `The correct answer is ${correctAnswer}.`,
      points: sourceDifficulty === 'hard' ? 20 : 15,
      timeLimitSec: sourceDifficulty === 'hard' ? 35 : 30,
    });
    if (unique.length >= count) break;
  }

  if (unique.length < count) {
    throw new Error('Not enough unseen online questions were returned.');
  }

  if (!mixed) saveSeen(unique.map((question) => question.prompt));
  return unique;
};

export const chooseUnseenFallbackQuestions = (
  pool: Question[],
  count: number,
  repeatablePrompts: string[] = [],
  allowSeenFallback = false,
): Question[] => {
  const mastered = readMastered();
  const seen = readSeen();
  const uniquePool = dedupeSimilarQuestions(pool);
  const allowedPool = uniquePool.filter((question) => !hasBeenUsed(question.prompt, mastered));
  const unseen = allowedPool.filter((question) => !hasBeenUsed(question.prompt, seen));

  // A question can reappear only when the player previously missed it. Do not
  // silently recycle other old questions when the offline pack is exhausted.
  const missed = repeatablePrompts.length
    ? allowedPool.filter((question) =>
        hasBeenUsed(question.prompt, repeatablePrompts) &&
        hasBeenUsed(question.prompt, seen)
      )
    : [];
  const playable = [...unseen, ...shuffled(missed)];
  if (allowSeenFallback && playable.length < count) {
    const alreadySelected = new Set(playable.map((question) => normalizePrompt(question.prompt)));
    const seenAgain = shuffled(allowedPool.filter((question) =>
      hasBeenUsed(question.prompt, seen) &&
      !alreadySelected.has(normalizePrompt(question.prompt))
    ));
    playable.push(...seenAgain);
  }
  if (playable.length === 0) {
    throw new Error('No unseen or previously missed questions are available.');
  }

  const selected = shuffled(playable).slice(0, Math.min(count, playable.length));
  saveSeen(selected.map((question) => question.prompt));
  return selected;
};
