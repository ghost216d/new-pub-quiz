import assert from 'node:assert/strict';
import { chooseUnseenFallbackQuestions, dedupeSimilarQuestions, markQuestionMastered } from '../src/utils/onlineTrivia.ts';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};

const makeQuestion = (id, prompt) => ({
  id,
  roundNumber: 1,
  category: 'General Knowledge',
  prompt,
  type: 'multiple_choice',
  options: ['One', 'Two', 'Three', 'Four'],
  correctAnswer: 'One',
  points: 15,
  timeLimitSec: 30,
});

const pool = [
  makeQuestion('1', 'Who painted the Mona Lisa?'),
  makeQuestion('2', 'Which artist painted the Mona Lisa?'),
  makeQuestion('3', 'What is the capital city of Portugal?'),
  makeQuestion('4', 'Which planet is known as the Red Planet?'),
  makeQuestion('5', 'In what year did the Berlin Wall fall?'),
  makeQuestion('6', 'What is the largest ocean on Earth?'),
  makeQuestion('7', 'Who wrote the novel Frankenstein?'),
  makeQuestion('8', 'Which element has the chemical symbol gold?'),
];

assert.equal(dedupeSimilarQuestions(pool).length, 7, 'near-duplicate prompts should collapse');

const firstRound = chooseUnseenFallbackQuestions(pool, 3);
const secondRound = chooseUnseenFallbackQuestions(pool, 3);
const firstPrompts = new Set(firstRound.map((question) => question.prompt));
assert.equal(secondRound.some((question) => firstPrompts.has(question.prompt)), false,
  'a second round should not repeat questions while enough unseen prompts remain');

markQuestionMastered(firstRound[0].prompt);
const missedPrompt = firstRound[1].prompt;
const missedRound = chooseUnseenFallbackQuestions(pool, 3, [missedPrompt]);
assert.equal(missedRound.some((question) => question.prompt === missedPrompt), true,
  'a previously missed question may return');
assert.equal(missedRound.some((question) => question.prompt === firstRound[0].prompt), false,
  'a mastered question must stay retired');

pool.forEach((question) => markQuestionMastered(question.prompt));
assert.throws(() => chooseUnseenFallbackQuestions(pool, 3),
  /No unseen or previously missed questions/,
  'the fallback must not recycle old or mastered prompts');

globalThis.localStorage = {
  getItem: () => { throw new Error('Storage unavailable'); },
  setItem: () => { throw new Error('Storage unavailable'); },
};
assert.equal(chooseUnseenFallbackQuestions(pool, 3).length, 3,
  'unavailable browser storage should not prevent a pub from opening');

console.log('Question repeat regression passed.');
