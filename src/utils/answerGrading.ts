import { Question } from '../types';

const normalizeAnswer = (answer: string): string =>
  String(answer ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en-GB');

export const answerMatchesQuestion = (
  answer: string,
  question?: Pick<Question, 'correctAnswer' | 'acceptableAnswers'> | null,
): boolean => {
  if (!question) return false;
  const normalizedAnswer = normalizeAnswer(answer);
  if (!normalizedAnswer) return false;
  return [question.correctAnswer, ...(question.acceptableAnswers || [])]
    .some((accepted) => normalizeAnswer(accepted) === normalizedAnswer);
};
