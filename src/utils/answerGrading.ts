import { Question, RoomState } from '../types';

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

export const awardCurrentAnswers = (room: RoomState): void => {
  const round = room.rounds[room.currentRoundIndex];
  const question = round?.questions[room.currentQuestionIndex];
  if (!round || !question) return;

  Object.entries(room.submissions).forEach(([teamId, submission]) => {
    const team = room.teams[teamId];
    if (!team || submission.reviewedByHost) return;

    // Recheck the submitted answer against the revealed question before
    // publishing the result. This prevents stale or inconsistent client-side
    // grading from showing a correct answer as incorrect.
    submission.isCorrect = answerMatchesQuestion(submission.answer, question);
    const awarded = submission.isCorrect
      ? submission.pointsAwarded || question.points || 0
      : 0;
    team.score += awarded;
    team.scoreHistory.push({
      questionIndex: room.currentQuestionIndex + 1,
      roundNumber: round.roundNumber || 1,
      delta: awarded,
      cumulativeScore: team.score,
      isCorrect: !!submission.isCorrect,
    });
    submission.pointsAwarded = awarded;
    submission.reviewedByHost = true;
  });
};
