import { Question, QuizDifficulty } from '../types';

const TOKEN_KEY = 'pubquiz_opentdb_token_v1';
const SEEN_KEY = 'pubquiz_seen_questions_v1';
const MAX_SEEN = 1200;

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

const readSeen = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const saveSeen = (prompts: string[]) => {
  const merged = [...readSeen(), ...prompts.map(normalizePrompt)];
  localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set(merged)].slice(-MAX_SEEN)));
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

  let response = await fetch(buildUrl(), { cache: 'no-store' });
  if (!response.ok) throw new Error('Online trivia service is unavailable.');
  let data = (await response.json()) as OpenTriviaResponse;

  if (data.response_code === 4) {
    await resetSessionToken(token);
    response = await fetch(buildUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Online trivia service is unavailable.');
    data = (await response.json()) as OpenTriviaResponse;
  }

  if (data.response_code !== 0 || !Array.isArray(data.results)) {
    throw new Error(`Online trivia returned response code ${data.response_code}.`);
  }

  const seen = new Set(readSeen());
  const unique = data.results
    .map((item) => ({ ...item, decodedPrompt: decodeHtml(item.question) }))
    .filter((item) => !seen.has(normalizePrompt(item.decodedPrompt)))
    .slice(0, count);

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
  const seen = new Set(readSeen());
  let candidates = pool.filter((question) => !seen.has(normalizePrompt(question.prompt)));

  // Only recycle the oldest local questions after the entire offline vault is exhausted.
  if (candidates.length < count) {
    const localPrompts = new Set(pool.map((question) => normalizePrompt(question.prompt)));
    const retained = readSeen().filter((prompt) => !localPrompts.has(prompt));
    localStorage.setItem(SEEN_KEY, JSON.stringify(retained));
    candidates = pool;
  }

  const selected = shuffled(candidates).slice(0, count);
  saveSeen(selected.map((question) => question.prompt));
  return selected;
};
