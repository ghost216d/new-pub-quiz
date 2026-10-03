import type { Question, QuizDifficulty, RoundType } from '../types';
import { hasFourValidOptions, questionHasBeenUsed } from './questionQuality';

const MODEL_ID = 'SmolLM2-360M-Instruct-q4f16_1-MLC';
const SEEN_KEY = 'pubquiz_device_ai_seen_v1';

type ProgressCallback = (progress: number, message: string) => void;

let enginePromise: Promise<import('@mlc-ai/web-llm').MLCEngine> | null = null;

export const supportsOnDeviceQuizAI = (): boolean =>
  typeof navigator !== 'undefined' && 'gpu' in navigator;

const getEngine = async (onProgress: ProgressCallback) => {
  if (!supportsOnDeviceQuizAI()) {
    throw new Error('This browser does not provide WebGPU for on-device AI.');
  }
  if (!enginePromise) {
    enginePromise = import('@mlc-ai/web-llm').then(({ CreateMLCEngine }) =>
      CreateMLCEngine(MODEL_ID, {
        initProgressCallback: ({ progress, text }) =>
          onProgress(Math.round(Math.max(0, Math.min(1, progress)) * 100), text),
      }),
    ).catch((error) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
};

const extractJson = (value: string): unknown => {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const source = fenced || value.slice(value.indexOf('['), value.lastIndexOf(']') + 1);
  return JSON.parse(source);
};

const seenPrompts = (): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

type GenerateQuestionOptions = {
  category: string;
  count: number;
  difficulty: QuizDifficulty;
  roundType: RoundType;
  roundNumber: number;
  excludedPrompts?: string[];
  onProgress: ProgressCallback;
};

type QuizGenerationEngine = Pick<import('@mlc-ai/web-llm').MLCEngine, 'chat'>;

// Keep response validation separate from WebGPU setup so the full question
// generation path can be regression-tested with controlled model responses.
export const generateQuestionsWithEngine = async (
  {
    category,
    count,
    difficulty,
    roundType,
    roundNumber,
    excludedPrompts = [],
    onProgress,
  }: GenerateQuestionOptions,
  engine: QuizGenerationEngine,
): Promise<Question[]> => {
  const previous = [...seenPrompts(), ...excludedPrompts];
  const used = [...previous];
  const questions: Question[] = [];

  // Retry once when a model response repeats history or contains invalid
  // options. The retry prompt includes all prior output to request fresh items.
  for (let attempt = 0; attempt < 2 && questions.length < count; attempt += 1) {
    const remaining = count - questions.length;
    const requestedCount = remaining + 2;
    onProgress(100, attempt === 0
      ? 'Device AI is creating questions…'
      : 'AI is finding a few more new questions…');

    let parsed: unknown;
    try {
      const response = await engine.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You create concise British pub quiz questions. Return JSON only. Never add markdown.',
          },
          {
            role: 'user',
            content: `Create ${requestedCount} ${difficulty} ${roundType} questions about ${category}.
Return one JSON array. Each item must have exactly: prompt, options (exactly 4 short unique strings), correctAnswer, explanation.
correctAnswer must exactly equal one option. Avoid ambiguous, trick, time-sensitive, political, medical, or unsafe questions.
Do not repeat these recent questions: ${used.slice(-40).join(' | ') || 'none'}.`,
          },
        ],
        temperature: 0.65,
        max_tokens: Math.min(1800, 260 * requestedCount),
      });
      parsed = extractJson(response.choices[0]?.message?.content || '');
    } catch (error) {
      if (attempt === 1) throw error;
      continue;
    }

    if (!Array.isArray(parsed)) {
      if (attempt === 1) throw new Error('Device AI did not return a question list.');
      continue;
    }

    for (const candidate of parsed) {
      if (!candidate || typeof candidate !== 'object') continue;
      const item = candidate as Record<string, unknown>;
      const prompt = String(item.prompt || '').trim();
      const options = Array.isArray(item.options)
        ? [...new Set(item.options.map((option) => String(option).trim()).filter(Boolean))]
        : [];
      const correctAnswer = String(item.correctAnswer || '').trim();
      const draft: Partial<Question> = { prompt, options, correctAnswer };
      if (!prompt || questionHasBeenUsed(prompt, used)) continue;
      used.push(prompt);
      if (!hasFourValidOptions(draft)) continue;

      questions.push({
        id: `device_ai_${Date.now()}_${questions.length}`,
        roundNumber,
        category,
        prompt,
        type: 'multiple_choice',
        difficulty,
        options,
        correctAnswer,
        acceptableAnswers: [correctAnswer.toLowerCase()],
        explanation: String(item.explanation || `The correct answer is ${correctAnswer}.`).trim(),
        points: difficulty === 'hard' || difficulty === 'expert' ? 20 : 10,
        timeLimitSec: difficulty === 'hard' || difficulty === 'expert' ? 40 : 30,
      });
      if (questions.length === count) break;
    }
  }

  if (questions.length < count) {
    throw new Error('Device AI could not create enough new, valid questions.');
  }
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seenPrompts(), ...questions.map((q) => q.prompt)].slice(-1000)));
  } catch {
    // Generated questions are still playable if this browser blocks storage.
  }
  return questions;
};

export const generateOnDeviceQuizQuestions = async (
  options: GenerateQuestionOptions,
): Promise<Question[]> => {
  const engine = await getEngine(options.onProgress);
  return generateQuestionsWithEngine(options, engine);
};
