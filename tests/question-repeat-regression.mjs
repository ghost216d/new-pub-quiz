import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { CARTOON_MAPS } from '../src/data/cartoonMapsData.ts';
import { chooseUnseenFallbackQuestions, dedupeSimilarQuestions, getOnlineTriviaQuestions, markQuestionMastered } from '../src/utils/onlineTrivia.ts';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};

const campaignLevels = CARTOON_MAPS.flatMap((map) => map.levels.map((level) => ({ map, level })));
assert.equal(campaignLevels.length, 70, 'all 70 campaign levels should have transition artwork');
campaignLevels.forEach(({ map, level }, index) => {
  const artworkId = String(index + 1).padStart(2, '0');
  assert.equal(level.artworkLevelNumber, index + 1, 'artwork numbering should follow campaign order');
  assert.ok(level.name && level.pubName, `level ${index + 1} should have both area and pub names`);
  assert.ok(level.mapArtwork, `level ${index + 1} should have matching destination artwork`);
  assert.ok(level.coverArtwork, `level ${index + 1} should have a transition artwork source`);
  assert.ok(existsSync(new URL(`../public/${level.mapArtwork}`, import.meta.url)),
    `level ${index + 1} map artwork should exist: ${level.mapArtwork}`);
  assert.ok(existsSync(new URL(`../public/${level.coverArtwork}`, import.meta.url)),
    `level ${index + 1} cover artwork should exist: ${level.coverArtwork}`);
  if (index < 20) {
    assert.equal(level.coverArtwork, `level-${artworkId}-cover.webp`,
      `level ${index + 1} should use its matching designed cover`);
    assert.equal(level.mapArtwork, `level-${artworkId}-map-no-route.webp`,
      `level ${index + 1} should use its matching map artwork`);
  } else {
    const coverId = String(((index - 20) % 14) + 21).padStart(2, '0');
    assert.equal(level.coverArtwork, `level-${coverId}-cover.webp`,
      `level ${index + 1} should use a cover in the designed illustration style`);
    assert.equal(level.mapArtwork, map.mapArtwork,
      `level ${index + 1} map artwork should match its own route`);
  }
});

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
