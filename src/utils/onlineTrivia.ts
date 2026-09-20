import { Question, QuizDifficulty } from '../types';

const TOKEN_KEY = 'pubquiz_opentdb_token_v1';
const SEEN_KEY = 'pubquiz_seen_questions_v1';
const MAX_SEEN = 10000;

const CATEGORY_IDS: Array<[RegExp, number]> = [
  [/film|movie|cinema/i, 11],
  [/music|song|band/i, 12],
  [/television|tv/i, 14],
  [/science|nature/i, 17],
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
    .filter((word) => word.length > 2 && !SIMILARITY_STOP_WORDS.has(word)),
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

const readSeen = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const saveSeen = (prompts: string[]) => {
  const normalizedPrompts = prompts.map(normalizePrompt).filter(Boolean);
  const selected = new Set(normalizedPrompts);
  // Remove previously stored copies before appending. This makes the end of
  // the list a true recency record, so recycled questions move to the back.
  const merged = [
    ...readSeen().filter((prompt) => !selected.has(normalizePrompt(prompt))),
    ...normalizedPrompts,
  ];
  localStorage.setItem(SEEN_KEY, JSON.stringify(merged.slice(-MAX_SEEN)));
};

const getSecureQuestionEndpoint = (): string | null => {
  const configured = String(import.meta.env.VITE_QUESTION_API_URL || '').trim();
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

  const seen = readSeen();
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

const getSessionToken = async (): Promise<string> => {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) return stored;

  const response = await fetch('https://opentdb.com/api_token.php?command=request');
  if (!response.ok) throw new Error('Unable to start online trivia session.');
  const data = (await response.json()) as OpenTriviaResponse;
  if (!data.token) throw new Error('Online trivia session did not return a token.');
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
};

const resetSessionToken = async (token: string): Promise<void> => {
  await fetch(`https://opentdb.com/api_token.php?command=reset&token=${encodeURIComponent(token)}`);
};

export const getOnlineTriviaQuestions = async ({
  category,
  count,
  difficulty,
}: {
  category: string;
  count: number;
  difficulty: QuizDifficulty;
}): Promise<Question[]> => {
  // Prefer the protected Gemini proxy. The browser receives questions only;
  // the Gemini key remains an encrypted server-side secret.
  if (getSecureQuestionEndpoint()) {
    try {
      return await getSecureAiQuestions({ category, count, difficulty });
    } catch (error) {
      console.warn('Secure AI questions unavailable; trying Open Trivia DB.', error);
    }
  }

  const token = await getSessionToken();
  const categoryId = CATEGORY_IDS.find(([pattern]) => pattern.test(category))?.[1];
  const onlineDifficulty = difficulty === 'expert' ? 'hard' : difficulty;
  const amount = Math.min(50, Math.max(count * 3, 12));

  const buildUrl = () => {
    const params = new URLSearchParams({
      amount: String(amount),
      type: 'multiple',
      difficulty: onlineDifficulty,
      token,
    });
    if (categoryId) params.set('category', String(categoryId));
    return `https://opentdb.com/api.php?${params.toString()}`;
  };

  const seen = readSeen();
  const collected: Array<OpenTriviaQuestion & { decodedPrompt: string }> = [];

  // Fetch more than one batch when necessary. We never recycle an already-seen
  // question merely to fill a level.
  for (let attempt = 0; attempt < 5 && collected.length < count; attempt += 1) {
    let response = await fetch(buildUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Online trivia service is unavailable.');
    let data = (await response.json()) as OpenTriviaResponse;

    if (data.response_code === 4) {
      await resetSessionToken(token);
      response = await fetch(buildUrl(), { cache: 'no-store' });
      if (!response.ok) throw new Error('Online trivia service is unavailable.');
      data = (await response.json()) as OpenTriviaResponse;
    }
    if (data.response_code !== 0 || !Array.isArray(data.results)) break;

    for (const item of data.results) {
      const decodedPrompt = decodeHtml(item.question);
      const normalized = normalizePrompt(decodedPrompt);
      if (!hasBeenUsed(normalized, seen)) {
        seen.push(normalized);
        collected.push({ ...item, decodedPrompt });
      }
    }
  }

  const unique = collected.slice(0, count);

  if (unique.length < count) {
    throw new Error('Not enough unseen online questions were returned.');
  }

  const points = difficulty === 'hard' || difficulty === 'expert' ? 20 : 15;
  const questions: Question[] = unique.map((item, index) => {
    const correctAnswer = decodeHtml(item.correct_answer);
    return {
      id: `online_${Date.now()}_${index}`,
      roundNumber: 1,
      category: decodeHtml(item.category),
      prompt: item.decodedPrompt,
      type: 'multiple_choice',
      difficulty,
      options: shuffled([
        correctAnswer,
        ...item.incorrect_answers.map(decodeHtml),
      ]),
      correctAnswer,
      acceptableAnswers: [correctAnswer.toLowerCase()],
      explanation: `The correct answer is ${correctAnswer}.`,
      points,
      timeLimitSec: difficulty === 'hard' || difficulty === 'expert' ? 35 : 30,
    };
  });

  saveSeen(questions.map((question) => question.prompt));
  return questions;
};

export const chooseUnseenFallbackQuestions = (
  pool: Question[],
  count: number,
): Question[] => {
  const seen = readSeen();
  const candidates = pool.filter((question) => !hasBeenUsed(question.prompt, seen));

  let playable = candidates;
  if (playable.length < count) {
    // The offline pack is finite. Once it has all been completed, exclude the
    // most recently played prompts and rotate the oldest material back in.
    // This prevents back-to-back repetition without ever blocking a level.
    const recentWindowSize = Math.min(
      Math.max(count * 4, 30),
      Math.max(0, pool.length - count),
    );
    const recent = seen.slice(-recentWindowSize);
    playable = pool.filter((question) => !hasBeenUsed(question.prompt, recent));
  }

  if (playable.length < count) {
    playable = pool;
  }

  if (playable.length === 0) {
    throw new Error('The offline question pack is empty.');
  }

  const selected = shuffled(playable).slice(0, Math.min(count, playable.length));
  saveSeen(selected.map((question) => question.prompt));
  return selected;
};
