import { CartoonMap, MapLevel, Question } from '../types';
import { CARTOON_MAPS } from './cartoonMapsData';
import { SOLO_ANIMAL_QUESTIONS, SOLO_FLAG_QUESTIONS, SOLO_PHOTO_QUESTIONS, SOLO_PICTURE_QUESTIONS } from './defaultQuestions';

const levelQuestions = (
  levelId: string,
  category: string,
  entries: Array<[string, string, string[], string, string, 'easy' | 'medium' | 'hard']>,
): Question[] => entries.map(([prompt, answer, options, explanation, topic, difficulty], index) => ({
  id: `${levelId}_fixed_${index + 1}`,
  roundNumber: 1,
  category,
  prompt,
  type: 'multiple_choice',
  options,
  correctAnswer: answer,
  acceptableAnswers: [answer.toLowerCase()],
  explanation,
  difficulty,
  points: difficulty === 'hard' ? 20 : difficulty === 'medium' ? 15 : 10,
  timeLimitSec: difficulty === 'hard' ? 40 : difficulty === 'medium' ? 35 : 30,
  topic,
} as Question));

// These opening stops were previously filled with unrelated general trivia.
// Keep their ten-question sets stable, local, and tied to the places named by
// the stage. Each pack follows the campaign's easy / medium / hard ramp.
const AUTHORED_CAMPAIGN_LEVEL_QUESTIONS: Record<string, Question[]> = {
  c1_george: levelQuestions('c1_george', 'Waterloo, South Bank & London Transport', [
    ['Which river runs beside the South Bank and the London Eye?', 'The Thames', ['The Thames', 'The Severn', 'The Mersey', 'The Tyne'], 'The London Eye stands beside the River Thames.', 'waterloo river', 'easy'],
    ['In which city is Waterloo railway station?', 'London', ['London', 'Manchester', 'Bristol', 'York'], 'Waterloo station is in central London.', 'waterloo station', 'easy'],
    ['Which landmark is a giant observation wheel on the South Bank?', 'The London Eye', ['The London Eye', 'Tower Bridge', 'The Shard', 'St Paul’s Cathedral'], 'The London Eye is the observation wheel beside the Thames.', 'south bank landmark', 'easy'],
    ['What kind of venue is the Old Vic near Waterloo?', 'A theatre', ['A theatre', 'A railway museum', 'A football ground', 'A market'], 'The Old Vic is a historic London theatre.', 'old vic', 'medium'],
    ['Which bridge connects Waterloo with the north bank of the Thames?', 'Waterloo Bridge', ['Waterloo Bridge', 'London Bridge', 'Blackfriars Bridge', 'Tower Bridge'], 'Waterloo Bridge crosses the Thames between Waterloo and the north bank.', 'waterloo bridge', 'medium'],
    ['County Hall, beside the London Eye, was built to serve as what?', 'London County Council’s headquarters', ['London County Council’s headquarters', 'A royal palace', 'A railway terminal', 'A cathedral'], 'County Hall was the headquarters of the former London County Council.', 'county hall', 'medium'],
    ['The Southbank Centre is best known as a home for which kind of activity?', 'Arts and culture', ['Arts and culture', 'Horse racing', 'Shipbuilding', 'Agriculture'], 'The Southbank Centre is a major arts and culture complex.', 'southbank centre', 'medium'],
    ['Which concert hall is part of the Southbank Centre?', 'Royal Festival Hall', ['Royal Festival Hall', 'Royal Albert Hall', 'Barbican Hall', 'Wigmore Hall'], 'Royal Festival Hall is one of the Southbank Centre’s main venues.', 'royal festival hall', 'hard'],
    ['In what year did the London Eye open to the public?', '2000', ['2000', '1985', '1995', '2010'], 'The London Eye opened in 2000.', 'london eye opening', 'hard'],
    ['Waterloo station opened in which century?', 'The 19th century', ['The 19th century', 'The 17th century', 'The 18th century', 'The 21st century'], 'Waterloo station opened in 1848, during the 19th century.', 'waterloo station history', 'hard'],
  ]),
  c1_anchor: levelQuestions('c1_anchor', 'Brixton, Effra Hall & Brixton Market', [
    ['In which part of London is the Effra Hall Tavern?', 'Brixton', ['Brixton', 'Greenwich', 'Camden', 'Wimbledon'], 'The Effra Hall Tavern is in Brixton, South London.', 'effra hall tavern', 'easy'],
    ['Brixton is in which part of London?', 'South London', ['South London', 'North London', 'East London', 'West London'], 'Brixton is a district in South London.', 'brixton', 'easy'],
    ['Which London Underground line terminates at Brixton station?', 'The Victoria line', ['The Victoria line', 'The Central line', 'The Jubilee line', 'The District line'], 'Brixton is the southern terminus of the Victoria line.', 'brixton station', 'easy'],
    ['Which musician, born in Brixton, recorded “Space Oddity”?', 'David Bowie', ['David Bowie', 'Elton John', 'Freddie Mercury', 'Rod Stewart'], 'David Bowie was born in Brixton in 1947.', 'brixton music', 'medium'],
    ['What is Brixton Market especially known for?', 'Food and independent traders', ['Food and independent traders', 'Antiques only', 'Fishing boats', 'Car manufacturing'], 'Brixton Market is known for its food stalls and independent shops.', 'brixton market', 'medium'],
    ['Electric Avenue is a well-known street in which district?', 'Brixton', ['Brixton', 'Soho', 'Shoreditch', 'Chelsea'], 'Electric Avenue is a shopping street in Brixton.', 'electric avenue', 'medium'],
    ['Which music venue in Brixton was formerly known as the Astoria?', 'Brixton Academy', ['Brixton Academy', 'The Roundhouse', 'The O2 Arena', 'The Forum'], 'The Brixton Academy has also been known as the Brixton Astoria.', 'brixton academy', 'medium'],
    ['Windrush Square commemorates the contributions of which community?', 'The Windrush generation', ['The Windrush generation', 'The Huguenots', 'The Romans', 'The Vikings'], 'The square takes its name from the Windrush generation and their descendants.', 'windrush square', 'hard'],
    ['What type of historic structure is Brixton Windmill?', 'A windmill', ['A windmill', 'A lighthouse', 'A clock tower', 'A water tower'], 'Brixton Windmill is a restored 19th-century windmill.', 'brixton windmill', 'hard'],
    ['The River Effra, which gave Effra Hall its name, is now mostly what beneath London?', 'Underground', ['Underground', 'A canal', 'A railway line', 'A reservoir'], 'The Effra is a historic South London river that now runs mostly in culverts beneath the city.', 'river effra', 'hard'],
  ]),
};

const DIFFICULTY_RAMP: Array<'easy' | 'medium' | 'hard'> = [
  'easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard',
];
const ALL_CAMPAIGN_LEVELS = CARTOON_MAPS.flatMap((map) =>
  map.levels.map((level) => ({ map, level })),
);
const PUB_NAMES = ALL_CAMPAIGN_LEVELS.map(({ level }) => level.pubName || level.name);
const MAP_NAMES = CARTOON_MAPS.map((map) => map.name);
const PUB_POSTCODES = ALL_CAMPAIGN_LEVELS.map(({ level }) => level.postcode || 'London');
const PUB_CATEGORIES = ALL_CAMPAIGN_LEVELS.map(({ level }) => level.category || 'London pub history');
const SPECIAL_QUESTIONS = [...SOLO_FLAG_QUESTIONS, ...SOLO_ANIMAL_QUESTIONS];

const stableOptions = (answer: string, pool: string[], seed: number): string[] => {
  const normalizedAnswer = answer.trim().toLowerCase();
  const options = [answer];
  if (pool.length) {
    const start = Math.abs(seed * 17) % pool.length;
    for (let offset = 0; offset < pool.length && options.length < 4; offset += 1) {
      const candidate = String(pool[(start + offset) % pool.length] || '').trim();
      if (candidate && candidate.toLowerCase() !== normalizedAnswer &&
        !options.some((option) => option.toLowerCase() === candidate.toLowerCase())) {
        options.push(candidate);
      }
    }
  }
  while (options.length < 4) options.push(`London option ${options.length + 1}`);
  const correctIndex = Math.abs(seed) % 4;
  const distractors = options.slice(1);
  distractors.splice(correctIndex, 0, options[0]);
  return distractors;
};

const withFixedDifficulty = (
  question: Question,
  level: MapLevel,
  slot: number,
  seed: number,
): Question => {
  const difficulty = DIFFICULTY_RAMP[slot];
  const answer = question.correctAnswer;
  return {
    ...question,
    id: `${level.id}_fixed_${slot + 1}`,
    roundNumber: 1,
    difficulty,
    points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
    timeLimitSec: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 35 : 40,
    options: stableOptions(answer, question.options || [], seed),
  };
};

const buildLocalQuestions = (
  map: CartoonMap,
  level: MapLevel,
  levelIndex: number,
): Question[] => {
  const name = level.pubName || level.name;
  const address = level.address || level.name;
  const postcode = level.postcode || 'London';
  const routeIcons = CARTOON_MAPS.flatMap((route) => route.levels.map((stop) => stop.icon));
  const category = level.category || 'London pub history';
  const description = level.description || `${name} is one of the pubs on the ${map.name} route.`;
  const funFact = level.funFact || `${name} is a stop on the London pub trail.`;
  const postcodeArea = postcode.match(/^[A-Z]{1,2}/i)?.[0] || 'London';
  const make = (
    prompt: string,
    answer: string,
    optionPool: string[],
    slot: number,
  ): Question => {
    const difficulty = DIFFICULTY_RAMP[slot];
    return {
      id: `${level.id}_local_${slot + 1}`,
      roundNumber: 1,
      category,
      prompt,
      type: 'multiple_choice',
      options: stableOptions(answer, optionPool, levelIndex * 10 + slot),
      correctAnswer: answer,
      acceptableAnswers: [answer.toLowerCase()],
      explanation: slot === 2
        ? `The pub trail map marks ${name} with ${answer}.`
        : `The route entry for ${name} lists ${answer}.`,
      difficulty,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
      timeLimitSec: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 35 : 40,
    };
  };

  const authored = AUTHORED_CAMPAIGN_LEVEL_QUESTIONS[level.id];
  if (authored?.length >= 10) {
    return [0, 1, 3, 4, 7, 8, 9].map((sourceIndex, index) =>
      withFixedDifficulty(authored[sourceIndex], level, index, levelIndex * 10 + index),
    );
  }

  return [
    make(`Which postcode is listed for ${name} on the ${map.name} route?`, postcode, PUB_POSTCODES, 0),
    make(`The pub ${name} is part of which route?`, map.name, MAP_NAMES, 1),
    make(`What emblem marks ${name} on the pub trail map?`, level.icon, routeIcons, 2),
    make(`The address “${address}” belongs to which pub?`, name, PUB_NAMES, 3),
    make(`Which local topic is paired with ${name}?`, category, PUB_CATEGORIES, 4),
    make(`Which pub matches this local description? “${description}”`, name, PUB_NAMES, 5),
    make(`Which pub is linked to this local fact? “${funFact}”`, name, PUB_NAMES, 6),
  ];
};

const buildFixedPubPack = (
  map: CartoonMap,
  level: MapLevel,
  levelIndex: number,
): Question[] => {
  const local = buildLocalQuestions(map, level, levelIndex);
  const picture = SOLO_PICTURE_QUESTIONS[levelIndex % SOLO_PICTURE_QUESTIONS.length];
  const photo = SOLO_PHOTO_QUESTIONS[(levelIndex + 5) % SOLO_PHOTO_QUESTIONS.length];
  const special = SPECIAL_QUESTIONS[(levelIndex * 3) % SPECIAL_QUESTIONS.length];
  const visual = (question: Question, slot: number): Question => withFixedDifficulty({
    ...question,
    options: [...question.options],
  }, level, slot, levelIndex * 10 + slot);
  const localAt = (question: Question, slot: number): Question =>
    withFixedDifficulty(question, level, slot, levelIndex * 10 + slot);

  return [
    localAt(local[0], 0),
    visual(picture, 1),
    localAt(local[1], 2),
    localAt(local[2], 3),
    visual(photo, 4),
    localAt(local[3], 5),
    visual(special, 6),
    localAt(local[4], 7),
    localAt(local[5], 8),
    localAt(local[6], 9),
  ];
};

// Ship a fixed, pub-specific 10-question pack for every stop. These packs are
// available immediately on the map and don't need a network request or a
// first-play local cache.
export const CAMPAIGN_LEVEL_QUESTIONS: Record<string, Question[]> = Object.fromEntries(
  ALL_CAMPAIGN_LEVELS.map(({ map, level }, index) => [
    level.id,
    buildFixedPubPack(map, level, index),
  ]),
);
