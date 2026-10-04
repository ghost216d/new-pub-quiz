import { Question } from '../types';

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
export const CAMPAIGN_LEVEL_QUESTIONS: Record<string, Question[]> = {
  c1_george: levelQuestions('c1_george', 'Waterloo, South Bank & London Transport', [
    ['Which river runs beside the South Bank and the London Eye?', 'The Thames', ['The Thames', 'The Severn', 'The Mersey', 'The Tyne'], 'The London Eye stands beside the River Thames.', 'waterloo river', 'easy'],
    ['In which city is Waterloo railway station?', 'London', ['London', 'Manchester', 'Bristol', 'York'], 'Waterloo station is in central London.', 'waterloo station', 'easy'],
    ['Which landmark is a giant observation wheel on the South Bank?', 'The London Eye', ['The London Eye', 'Tower Bridge', 'The Shard', 'St Paul’s Cathedral'], 'The London Eye is the observation wheel beside the Thames.', 'south bank landmark', 'easy'],
    ['What kind of venue is the Old Vic near Waterloo?', 'A theatre', ['A theatre', 'A railway museum', 'A football ground', 'A market'], 'The Old Vic is a historic London theatre.', 'old vic', 'medium'],
    ['Which bridge connects Waterloo with the north bank of the Thames?', 'Waterloo Bridge', ['Waterloo Bridge', 'London Bridge', 'Blackfriars Bridge', 'Tower Bridge'], 'Waterloo Bridge crosses the Thames between Waterloo and the north bank.', 'waterloo bridge', 'medium'],
    ['County Hall, beside the London Eye, was built to serve as what?', 'London County Council’s headquarters', ['London County Council’s headquarters', 'A royal palace', 'A railway terminal', 'A cathedral'], 'County Hall was the headquarters of the former London County Council.', 'county hall', 'medium'],
    ['The Southbank Centre is best known as a home for which kind of activity?', 'Arts and culture', ['Arts and culture', 'Horse racing', 'Shipbuilding', 'Agriculture'], 'The Southbank Centre is a major arts and culture complex.', 'southbank centre', 'medium'],
    ['Which concert hall is part of the Southbank Centre?', 'Royal Festival Hall', ['Royal Festival Hall', 'Royal Albert Hall', 'Barbican Hall', 'Wigmore Hall'], 'Royal Festival Hall is one of the Southbank Centre’s main venues.', 'royal festival hall', 'medium'],
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
    ['Windrush Square commemorates the contributions of which community?', 'The Windrush generation', ['The Windrush generation', 'The Huguenots', 'The Romans', 'The Vikings'], 'The square takes its name from the Windrush generation and their descendants.', 'windrush square', 'medium'],
    ['What type of historic structure is Brixton Windmill?', 'A windmill', ['A windmill', 'A lighthouse', 'A clock tower', 'A water tower'], 'Brixton Windmill is a restored 19th-century windmill.', 'brixton windmill', 'hard'],
    ['The River Effra, which gave Effra Hall its name, is now mostly what beneath London?', 'Underground', ['Underground', 'A canal', 'A railway line', 'A reservoir'], 'The Effra is a historic South London river that now runs mostly in culverts beneath the city.', 'river effra', 'hard'],
  ]),
};
