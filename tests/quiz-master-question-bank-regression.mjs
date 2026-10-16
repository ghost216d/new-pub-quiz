import assert from 'node:assert/strict';
import { DEFAULT_ROUNDS } from '../src/data/defaultQuestions.ts';
import { CAMPAIGN_LEVEL_QUESTIONS } from '../src/data/campaignLevelQuestions.ts';
import { buildQuizMasterRounds } from '../src/utils/quizMasterRounds.ts';

const bank = [
  ...DEFAULT_ROUNDS.flatMap((round) => round.questions),
  ...Object.values(CAMPAIGN_LEVEL_QUESTIONS).flat(),
];
const prompts = bank.map((question) => question.prompt);
const storage = new Map([
  ['pubquiz_seen_questions_v1', JSON.stringify(prompts)],
  ['pubquiz_mastered_questions_v1', JSON.stringify(prompts)],
]);
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};

const rounds = buildQuizMasterRounds(DEFAULT_ROUNDS, Object.values(CAMPAIGN_LEVEL_QUESTIONS).flat());
assert.ok(rounds.length > 0, 'Quiz Master should still have playable rounds after Solo Quest has seen and mastered the bundled bank');
assert.ok(rounds.every((round) => round.questions.length > 0), 'every included round should contain questions');

const chosenPrompts = rounds.flatMap((round) => round.questions.map((question) => question.prompt));
assert.equal(new Set(chosenPrompts.map((prompt) => prompt.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim())).size, chosenPrompts.length,
  'Quiz Master should not repeat prompts between rounds');
assert.ok(rounds.some((round) => round.type === 'picture'), 'Quiz Master should retain its picture round');
assert.equal(rounds.reduce((count, round) => count + round.questions.length, 0),
  DEFAULT_ROUNDS.filter((round) => round.type !== 'music').reduce((count, round) => count + round.questions.length, 0),
  'Quiz Master should fill its normal question count from the bundled reserve');

console.log(`Quiz Master question-bank regression passed (${rounds.length} rounds, ${chosenPrompts.length} questions).`);
