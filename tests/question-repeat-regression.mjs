import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { CARTOON_MAPS } from '../src/data/cartoonMapsData.ts';
import { DEFAULT_ROUNDS } from '../src/data/defaultQuestions.ts';
import { CATEGORY_VAULT } from '../src/data/defaultQuestions.ts';
import { normalizeSoloCategory } from '../src/utils/soloCategories.ts';
import { SOLO_PUB_CLASSICS_QUESTIONS } from '../src/data/pubClassicsQuestions.ts';
import { CAMPAIGN_LEVEL_QUESTIONS } from '../src/data/campaignLevelQuestions.ts';
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

assert.equal(normalizeSoloCategory('Brixton, Effra Hall & Brixton Market', CATEGORY_VAULT), CATEGORY_VAULT[0].name,
  'a campaign location must not persist as an invalid Solo category');

assert.equal(Object.keys(CAMPAIGN_LEVEL_QUESTIONS).length, campaignLevels.length,
  'every pub should ship its own saved question pack');
campaignLevels.forEach(({ level }) => {
  const questions = CAMPAIGN_LEVEL_QUESTIONS[level.id];
  assert.equal(questions?.length, 10, `${level.name} should have ten questions ready before the pub is opened`);
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 10,
    `${level.name} should not repeat a prompt inside its pack`);
  assert.deepEqual(questions.map((question) => question.difficulty), [
    'easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard',
  ], `${level.name} should increase difficulty through the ten questions`);
  assert.ok(questions.some((question) => question.category === 'Photo Round: World Landmarks'),
    `${level.name} should have a built-in photo question`);
  assert.ok(questions.some((question) => question.category === 'Emoji Picture Puzzles'),
    `${level.name} should have a built-in picture question`);
  assert.ok(questions.some((question) => /Animals & Nature|World Flags/.test(question.category)),
    `${level.name} should have a built-in animals or flags question`);
});
assert.equal(new Set(campaignLevels.map(({ level }) => CAMPAIGN_LEVEL_QUESTIONS[level.id][0].prompt)).size, campaignLevels.length,
  'each pub should start with a different pub-specific question');
const pictureRound = DEFAULT_ROUNDS.find((round) => round.type === 'picture');
assert.ok(pictureRound, 'Quiz Master should include a picture round');
assert.equal(pictureRound.questions.length, 3, 'picture round should contain three picture questions');
assert.equal(pictureRound.questions.every((question) => !!question.pictureClue || !!question.imageUrl), true,
  'every question in the picture round should show a picture clue');
for (const [levelId, category] of [
  ['c1_george', 'Waterloo, South Bank & London Transport'],
  ['c1_anchor', 'Brixton, Effra Hall & Brixton Market'],
]) {
  const questions = CAMPAIGN_LEVEL_QUESTIONS[levelId];
  assert.equal(questions.length, 10, `${levelId} should have ten fixed campaign questions`);
  assert.equal(questions.filter((question) => question.category === category).length >= 7, true,
    `${levelId} should keep its pub questions alongside the visual round mix`);
  assert.deepEqual(questions.map((question) => question.difficulty), [
    'easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard',
  ], `${levelId} questions should progress from easy to hard`);
}

assert.equal(SOLO_PUB_CLASSICS_QUESTIONS.length >= 10, true,
  'Pub Classics should have enough dedicated questions to make a full quiz');
assert.equal(SOLO_PUB_CLASSICS_QUESTIONS.every((question) => /pub|beer|ale|dart|billiards|pub sign/i.test(`${question.category} ${question.prompt}`)), true,
  'Pub Classics question bank must stay on theme');

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
    const requestUrl = new URL(url);
    const isBroadPool = !requestUrl.searchParams.has('category');
    return {
      ok: true,
      json: async () => ({
        response_code: 0,
        results: [{
          category: isBroadPool ? 'Science & Nature' : 'General Knowledge',
          difficulty: 'easy',
          question: isBroadPool ? 'Which planet is known as the Red Planet?' : 'What is the capital of Portugal?',
          correct_answer: isBroadPool ? 'Mars' : 'Lisbon',
          incorrect_answers: isBroadPool ? ['Venus', 'Jupiter', 'Mercury'] : ['Paris', 'Rome', 'Madrid'],
        }],
      }),
    };
  }
  throw new Error(`Unexpected question request: ${url}`);
};

const recoveredQuestions = await getOnlineTriviaQuestions({
  category: 'Brixton, Effra Hall & Brixton Market',
  count: 1,
  difficulty: 'medium',
});
assert.equal(recoveredQuestions.length, 1, 'questions should load after replacing an expired token');
assert.equal(apiRequests.length, 3, 'expired token should trigger one new token request and one retry');
assert.match(apiRequests[2], /token=fresh-token/, 'retry should use the new token');
assert.match(apiRequests[0], /category=9/, 'unknown categories should be constrained to General Knowledge rather than every trivia category');

const recoveredFromExhaustedPool = await getOnlineTriviaQuestions({
  category: 'General Knowledge',
  count: 1,
  difficulty: 'easy',
  candidateMultiplier: 12,
});
assert.equal(recoveredFromExhaustedPool[0].prompt, 'Which planet is known as the Red Planet?',
  'an exhausted General Knowledge pool should fall back to fresh mixed trivia');
assert.match(apiRequests[3], /category=9/, 'the first request should still prefer General Knowledge');
assert.equal(new URL(apiRequests[4]).searchParams.has('category'), false,
  'the fallback request should expand to the full mixed trivia pool');
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
