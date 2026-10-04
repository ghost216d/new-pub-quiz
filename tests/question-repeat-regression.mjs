import assert from 'node:assert/strict';
import { chooseUnseenFallbackQuestions, dedupeSimilarQuestions, getOnlineTriviaQuestions, markQuestionMastered } from '../src/utils/onlineTrivia.ts';

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

const originalFetch = globalThis.fetch;
const originalDocument = globalThis.document;
storage.set('pubquiz_opentdb_token_v1', 'expired-token');
const apiRequests = [];
globalThis.document = {
  createElement: () => {
    let html = '';
    return {
      set innerHTML(value) { html = value; },
      get value() { return html; },
    };
  },
};
globalThis.fetch = async (input) => {
  const url = String(input);
  apiRequests.push(url);
  if (url.includes('api.php') && url.includes('token=expired-token')) {
    return { ok: true, json: async () => ({ response_code: 3 }) };
  }
  if (url.includes('api_token.php?command=request')) {
    return { ok: true, json: async () => ({ token: 'fresh-token' }) };
  }
  if (url.includes('api.php') && url.includes('token=fresh-token')) {
    return {
      ok: true,
      json: async () => ({
        response_code: 0,
        results: [{
          category: 'General Knowledge',
          difficulty: 'easy',
          question: 'What is the capital of Portugal?',
          correct_answer: 'Lisbon',
          incorrect_answers: ['Paris', 'Rome', 'Madrid'],
        }],
      }),
    };
  }
  throw new Error(`Unexpected question request: ${url}`);
};

const recoveredQuestions = await getOnlineTriviaQuestions({
  category: 'General Knowledge',
  count: 1,
  difficulty: 'medium',
});
assert.equal(recoveredQuestions.length, 1, 'questions should load after replacing an expired token');
assert.equal(apiRequests.length, 3, 'expired token should trigger one new token request and one retry');
assert.match(apiRequests[2], /token=fresh-token/, 'retry should use the new token');
globalThis.fetch = originalFetch;
if (originalDocument === undefined) delete globalThis.document;
else globalThis.document = originalDocument;
storage.delete('pubquiz_opentdb_token_v1');

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
const seenUnmasteredQuestion = chooseUnseenFallbackQuestions([firstRound[1]], 1, [], true);
assert.equal(seenUnmasteredQuestion.length, 1,
  'an unmastered auxiliary question may be reused after its small pack is exhausted');
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
