import type { Question, Round } from '../types';
import { dedupeSimilarQuestions } from './onlineTrivia';
import { randomizeQuestionOptions } from './questionQuality';

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

/**
 * Build a live host quiz from the bundled question bank. This selection is
 * deliberately independent of Solo Quest's local seen/mastered history: a
 * player's progress must never leave the Quiz Master with an empty game.
 */
export const buildQuizMasterRounds = (templates: Round[], campaignQuestions: Question[]): Round[] => {
  const playableTemplates = templates.filter((round) => round.type !== 'music');
  const sourceQuestions = dedupeSimilarQuestions([
    ...playableTemplates.flatMap((round) => round.questions),
    ...campaignQuestions,
  ]);
  const triviaPool = sourceQuestions.filter((question) =>
    !question.musicData && !question.pictureClue && !question.imageUrl,
  );
  const visualPool = sourceQuestions.filter((question) =>
    Boolean(question.pictureClue || question.imageUrl),
  );
  const usedPrompts = new Set<string>();
  const normalize = (prompt: string) => prompt.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  return playableTemplates
    .map((round, index) => {
      const pool = round.type === 'picture' ? visualPool : triviaPool;
      const candidates = shuffled(pool.filter((question) => !usedPrompts.has(normalize(question.prompt))));
      const selected = candidates.slice(0, round.questions.length);
      selected.forEach((question) => usedPrompts.add(normalize(question.prompt)));

      return {
        ...round,
        roundNumber: index + 1,
        title: round.title.replace(/^Round\s+\d+\s*:\s*/i, `Round ${index + 1}: `),
        questions: selected.map((question) => ({
          ...randomizeQuestionOptions(question),
          roundNumber: index + 1,
          musicData: undefined,
        })),
      };
    })
    .filter((round) => round.questions.length > 0);
};
