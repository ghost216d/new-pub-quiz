export const HINT_COST_BUCKS = 50;

export const selectHintDistractors = (
  options: string[],
  correctAnswer: string,
  removeCount = 2,
): string[] => {
  const distractors = [...new Set(options.filter((option) => option !== correctAnswer))];
  const count = Math.max(0, Math.min(distractors.length, Math.floor(removeCount)));

  for (let index = distractors.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [distractors[index], distractors[randomIndex]] = [distractors[randomIndex], distractors[index]];
  }

  return distractors.slice(0, count);
};

export interface QuestionHintPurchase {
  remainingBucks: number;
  eliminatedAnswers: string[];
}

export const purchaseQuestionHint = (
  availableBucks: number,
  options: string[],
  correctAnswer: string,
): QuestionHintPurchase | null => {
  if (!Number.isFinite(availableBucks) || availableBucks < HINT_COST_BUCKS) return null;
  const eliminatedAnswers = selectHintDistractors(options, correctAnswer);
  if (eliminatedAnswers.length === 0) return null;

  return {
    remainingBucks: availableBucks - HINT_COST_BUCKS,
    eliminatedAnswers,
  };
};
