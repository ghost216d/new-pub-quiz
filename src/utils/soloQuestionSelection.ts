import { Question } from '../types';
import { dedupeSimilarQuestions, excludeSimilarQuestionHistory } from './onlineTrivia';

/** Count the regular questions needed after any still-unseen optional packs. */
export const getRequiredFreshTriviaQuestionCount = (
  count: number,
  history: string[],
  visualQuestions: Question[],
  specialKnowledgeQuestions: Question[],
): number => {
  const pictureCount = Math.min(count, Math.max(1, Math.floor(count / 5)));
  const triviaCount = Math.max(0, count - pictureCount);
  const availablePictures = excludeSimilarQuestionHistory(
    dedupeSimilarQuestions(visualQuestions),
    history,
  ).length;
  const availableSpecialKnowledge = excludeSimilarQuestionHistory(
    dedupeSimilarQuestions(specialKnowledgeQuestions),
    history,
  ).length;
  const pictureSlots = Math.min(pictureCount, availablePictures);
  const specialSlots = Math.min(1, triviaCount, availableSpecialKnowledge);

  return Math.max(0, count - pictureSlots - specialSlots);
};


/** Normalize a full Solo General Knowledge round to the Medium contract. */
export const prepareMediumGeneralKnowledgeQuestions = (
  questions: Question[],
  count: number,
): Question[] => {
  const unique = dedupeSimilarQuestions(questions);
  if (unique.length < count) {
    throw new Error(`Expected ${count} distinct General Knowledge questions, received ${unique.length}.`);
  }

  return unique.slice(0, count).map((question) => ({
    ...question,
    category: 'General Knowledge',
    difficulty: 'medium',
    points: 15,
    timeLimitSec: 35,
  }));
};
