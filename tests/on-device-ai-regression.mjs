import assert from 'node:assert/strict';
import { generateQuestionsWithEngine } from '../src/utils/onDeviceQuizAI.ts';
import { questionHasBeenUsed } from '../src/utils/questionQuality.ts';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};

const pastQuestion = 'Who painted the Mona Lisa?';
storage.set('pubquiz_device_ai_seen_v1', JSON.stringify([pastQuestion]));

const makeCandidate = (prompt, answer = 'Correct') => ({
  prompt,
  options: [answer, 'Wrong one', 'Wrong two', 'Wrong three'],
  correctAnswer: answer,
  explanation: `The answer is ${answer}.`,
});

const responses = [
  [
    makeCandidate('Which artist painted the Mona Lisa?'),
    makeCandidate('What is the capital of Portugal?', 'Lisbon'),
  ],
  [
    makeCandidate('What is the capital city of Portugal?', 'Lisbon'),
    makeCandidate('Which river flows through London?', 'The Thames'),
    makeCandidate('What is the highest mountain in Wales?', 'Snowdon'),
  ],
];
const requests = [];
const engine = {
  chat: {
    completions: {
      create: async (request) => {
        requests.push(request);
        return {
          choices: [{ message: { content: JSON.stringify(responses.shift()) } }],
        };
      },
    },
  },
};

const generated = await generateQuestionsWithEngine({
  category: 'General Knowledge',
  count: 3,
  difficulty: 'medium',
  roundType: 'trivia',
  roundNumber: 1,
  excludedPrompts: [pastQuestion],
  onProgress: () => {},
}, engine);

assert.equal(requests.length, 2, 'AI should retry when its first response has too few fresh questions');
assert.equal(generated.length, 3, 'AI should return the requested number of questions');
assert.equal(generated.some((question) => questionHasBeenUsed(question.prompt, [pastQuestion])), false,
  'AI results must not repeat recent question history');
assert.equal(generated.slice(1).some((question) => questionHasBeenUsed(question.prompt, [generated[0].prompt])), false,
  'AI results must not contain near-duplicate prompts');
assert.match(requests[1].messages[1].content, /capital of Portugal/i,
  'the retry prompt should include questions already returned so the model can avoid them');
assert.deepEqual(generated.map((question) => question.prompt), [
  'What is the capital of Portugal?',
  'Which river flows through London?',
  'What is the highest mountain in Wales?',
]);

console.log('On-device AI question novelty and retry regression passed.');
