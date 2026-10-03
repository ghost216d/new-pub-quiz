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
    if (!team || submission.manuallyGraded) return;

    // Recheck every auto-graded answer against the revealed question. This
    // also repairs a result already reviewed by an older app version.
    const wasReviewed = !!submission.reviewedByHost;
    const previousAward = wasReviewed ? submission.pointsAwarded || 0 : 0;
    const isCorrect = answerMatchesQuestion(submission.answer, question);
    const awarded = isCorrect ? question.points || 0 : 0;
    submission.isCorrect = isCorrect;

    if (wasReviewed) {
      const oldScore = team.score;
      team.score = Math.max(0, team.score + awarded - previousAward);
      const appliedDelta = team.score - oldScore;
      let historyIndex = -1;
      for (let index = team.scoreHistory.length - 1; index >= 0; index--) {
        const entry = team.scoreHistory[index];
        if (entry.questionIndex === room.currentQuestionIndex + 1 && entry.roundNumber === (round.roundNumber || 1)) {
          historyIndex = index;
          break;
        }
      }
      if (historyIndex >= 0) {
        team.scoreHistory[historyIndex].delta = awarded;
        team.scoreHistory[historyIndex].isCorrect = isCorrect;
        for (let index = historyIndex; index < team.scoreHistory.length; index++) {
          team.scoreHistory[index].cumulativeScore += appliedDelta;
        }
      }
    } else {
      team.score += awarded;
      team.scoreHistory.push({
        questionIndex: room.currentQuestionIndex + 1,
        roundNumber: round.roundNumber || 1,
        delta: awarded,
        cumulativeScore: team.score,
        isCorrect,
      });
    }

    submission.pointsAwarded = awarded;
    submission.reviewedByHost = true;
  });
};
