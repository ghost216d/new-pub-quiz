import assert from 'node:assert/strict';
import { revealedAnswerIsCorrect } from '../src/utils/answerGrading.ts';
import { resolveQuizAssetUrl } from '../src/utils/quizAssetUrl.ts';

const question = { correctAnswer: 'Edinburgh', acceptableAnswers: ['Edinboro'] };
assert.equal(
  revealedAnswerIsCorrect({ answer: 'Edinburgh', isCorrect: false }, question),
  false,
  'the player feedback should honor released host grading',
);
assert.equal(
  revealedAnswerIsCorrect({ answer: 'Edinboro' }, question),
  true,
  'older submissions without released grading should use accepted answers',
);
assert.equal(
  resolveQuizAssetUrl('photo-round/tower-bridge.webp', '/new-pub-quiz/'),
  '/new-pub-quiz/photo-round/tower-bridge.webp',
  'relative public assets should include the GitHub Pages deployment base',
);
assert.equal(
  resolveQuizAssetUrl('https://example.com/clue.webp', '/new-pub-quiz/'),
  'https://example.com/clue.webp',
  'absolute image URLs should remain unchanged',
);

console.log('Answer feedback and quiz asset regression tests passed.');
