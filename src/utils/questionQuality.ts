import type { Question } from '../types';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'did', 'do', 'does', 'for',
  'from', 'has', 'have', 'how', 'in', 'is', 'it', 'its', 'of', 'on', 'or',
  'that', 'the', 'this', 'to', 'was', 'were', 'what', 'when', 'where', 'which',
  'who', 'whose', 'with',
]);

export const normalizeQuestionText = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const meaningfulWords = (value: string): Set<string> => new Set(
  normalizeQuestionText(value)
    .split(' ')
    .filter((word) => (/^\d+$/.test(word) || word.length > 2) && !STOP_WORDS.has(word)),
);

export const questionsAreTooSimilar = (candidate: string, previous: string): boolean => {
  const normalizedCandidate = normalizeQuestionText(candidate);
  const normalizedPrevious = normalizeQuestionText(previous);
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

export const questionHasBeenUsed = (prompt: string, history: string[]): boolean =>
  history.some((previous) => questionsAreTooSimilar(prompt, previous));

export const hasFourValidOptions = (question: Partial<Question>): boolean => {
  const options = Array.isArray(question.options)
    ? question.options.map((option) => String(option).trim()).filter(Boolean)
    : [];
  const uniqueOptions = new Set(options.map(normalizeQuestionText));
  const correctAnswer = String(question.correctAnswer || '').trim();
  return Boolean(
    String(question.prompt || '').trim()
    && options.length === 4
    && uniqueOptions.size === 4
    && options.includes(correctAnswer),
  );
};

export const randomizeQuestionOptions = (question: Question): Question => {
  const options = [...question.options];
  for (let index = options.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[randomIndex]] = [options[randomIndex], options[index]];
  }
  return { ...question, options };
};
