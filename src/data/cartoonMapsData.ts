import { CartoonMap, ShopBundle, SoloProgression } from '../types';

const LEGACY_CARTOON_MAPS: CartoonMap[] = [
  {
    id: 'thames_riverside_crawl',
    name: 'South London to Westminster Trail',
    crawlRouteName: 'Waterloo to Westminster via South London',
    subtitle: 'Five pub stops across Waterloo, Brixton, Gipsy Hill, Crystal Palace and Westminster',
    icon: '🍺',
    themeColor: '#D97706',
    accentColor: '#0284C7',
    bgGradient: 'from-amber-100 via-amber-50 to-stone-100',
    cardBg: 'bg-amber-100/90 border-amber-800',
    pathColor: '#B45309',
    stoneColor: 'from-amber-400 to-yellow-500',
    requiredStars: 0,
    totalDistance: '4.3 Miles (approx. 1h 25m walk)',
    boroughs: 'Waterloo ➔ Brixton ➔ Gipsy Hill ➔ Crystal Palace ➔ Westminster',
    startArea: 'Waterloo Road, SE1',
    endArea: 'Bridge Street, Westminster, SW1A',
    description: 'Visit a sequence of London pubs from Waterloo through South London to Westminster.',
    mapArtwork: 'map-backgrounds/thames_riverside_crawl.webp',
    seasonalArtwork: {
      spring: { day: 'map-backgrounds/thames_riverside_crawl.webp', night: 'map-backgrounds/thames_riverside_crawl.webp' },
      summer: { day: 'map-backgrounds/thames_riverside_crawl.webp', night: 'map-backgrounds/thames_riverside_crawl.webp' },
      autumn: { day: 'map-backgrounds/thames_riverside_crawl.webp', night: 'map-backgrounds/thames_riverside_crawl.webp' },
      winter: { day: 'map-backgrounds/thames_riverside_crawl.webp', night: 'map-backgrounds/thames_riverside_crawl.webp' },
    },
    levels: [
      {
        id: 'c1_george',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 1,
        name: 'The Wellington',
        pubName: 'The Wellington',
        address: '81-83 Waterloo Road, Waterloo',
        postcode: 'SE1 8UD',
        walkingTime: 'Start of Crawl (0.0 mi)',
        distanceMiles: 0.0,
        category: 'Waterloo, South Bank & London Transport',
        difficulty: 'easy',
        questionCount: 5,
        coinReward: 150,
        icon: '🏛️',
        description: 'A Waterloo pub opposite the station, close to the South Bank, London Eye and Old Vic.',
        funFact: 'Waterloo Station opened in 1848 and became one of London’s busiest railway termini.',
        recommendedPint: 'Harvey’s Sussex Best Cask Bitter & Scotch Egg 🍺',
        requiredStars: 0,
      },
      {
        id: 'c1_anchor',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 2,
        name: 'The Effra Hall Tavern',
        pubName: 'The Effra Hall Tavern',
        address: '38A Kellett Road, Brixton',
        postcode: 'SW2 1EB',
        walkingTime: '8 min walk via Clink St (0.4 mi)',
        distanceMiles: 0.4,
        category: 'Brixton, Effra Hall & Brixton Market',
        difficulty: 'easy',
        questionCount: 5,
        coinReward: 180,
        icon: '⚓',
        description: 'A Victorian corner pub in Brixton, a short walk from Brixton Market and Electric Avenue.',
        funFact: 'The pub takes its name from Effra Hall, a former local mansion in Brixton.',
        recommendedPint: 'Bankside River Gold & Crispy Whitebait 🐟',
        requiredStars: 1,
      },
      {
        id: 'c1_mayflower',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 3,
        name: 'The Great Southern',
        pubName: 'The Great Southern',
        address: '79 Gipsy Hill, Upper Norwood',
        postcode: 'SE19 1QH',
        walkingTime: '28 min walk via Bermondsey Wall (1.4 mi)',
        distanceMiles: 1.8,
        category: 'Gipsy Hill, Norwood & South London Railways',
        difficulty: 'medium',
        questionCount: 5,
        coinReward: 240,
        icon: '⛵',
        description: 'A neighbourhood pub on Gipsy Hill, near Gipsy Hill railway station and the Crystal Palace area.',
        funFact: 'Gipsy Hill takes its name from the hill and railway station in Upper Norwood.',
        recommendedPint: 'Mayflower Scurvy Ale & Fish and Chips 🍟',
        requiredStars: 3,
      },
      {
        id: 'c1_dog_bell',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 4,
        name: 'The Alma',
        pubName: 'The Alma',
        address: '95 Church Road, Crystal Palace',
        postcode: 'SE19 2TA',
        walkingTime: '30 min walk past Greenland Dock (1.6 mi)',
        distanceMiles: 3.4,
        category: 'Crystal Palace Park & Victorian London',
        difficulty: 'hard',
        questionCount: 5,
        coinReward: 320,
        icon: '🐕',
        description: 'An independent pub in the Crystal Palace triangle, close to Crystal Palace Park.',
        funFact: 'The Alma says it has been part of the Crystal Palace area since the 19th century.',
        recommendedPint: 'Hand-Pulled Dark Mild & Giant Pickled Onion 🥚',
        requiredStars: 6,
      },
      {
        id: 'c1_trafalgar',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 5,
        name: 'St Stephen’s Tavern',
        pubName: 'St Stephen’s Tavern',
        address: '10 Bridge Street, Westminster',
        postcode: 'SW1A 2JR',
        walkingTime: '18 min walk across Deptford Creek (0.9 mi)',
        distanceMiles: 4.3,
        category: 'Westminster, Parliament & Big Ben',
        difficulty: 'expert',
        questionCount: 5,
        coinReward: 500,
        icon: '👑',
        description: 'A historic Westminster pub opposite the Houses of Parliament and close to Big Ben.',
        funFact: 'The tavern takes its name from St Stephen’s Chapel, the former meeting place of the House of Commons.',
        recommendedPint: 'Trafalgar Victory Pale Ale & Greenwich Gin 🍸',
        requiredStars: 9,
      },
    ],
  },
  {
    id: 'bermondsey_peckham_trail',
    name: 'Bermondsey & Peckham Trail',
    crawlRouteName: 'Railway Arches to Peckham Rye',
    subtitle: '5 Iconic Craft Pubs & Arches in Real North-to-South Order (3.8 Miles)',
    icon: '🚂',
    themeColor: '#EA580C',
    accentColor: '#16A34A',
    bgGradient: 'from-amber-100 via-orange-50 to-stone-100',
    cardBg: 'bg-orange-100/90 border-amber-800',
    pathColor: '#C2410C',
    stoneColor: 'from-orange-400 to-amber-500',
    requiredStars: 8,
    totalDistance: '3.8 Miles (approx. 1h 15m walk)',
    boroughs: 'Southwark (Borough, Bermondsey, Peckham, Nunhead)',
    startArea: 'Tabard St, Borough, SE1',
    endArea: 'Nunhead Green, SE15',
    description: 'Journey from traditional Borough coaching taverns through the bustling Bermondsey Beer Mile arches down to Peckham Rye.',
    mapArtwork: 'bermondsey-summer-day.webp',
    seasonalArtwork: {
      spring: { day: 'bermondsey-spring-day.webp', night: 'bermondsey-spring-night.webp' },
      summer: { day: 'bermondsey-summer-day.webp', night: 'bermondsey-summer-night.webp' },
      autumn: { day: 'bermondsey-autumn-day.webp', night: 'bermondsey-autumn-night.webp' },
      winter: { day: 'bermondsey-winter-day.webp', night: 'bermondsey-winter-night.webp' },
    },
    levels: [
      {
        id: 'b1_royal_oak',
        mapThemeId: 'bermondsey_peckham_trail',
        levelNumber: 1,
        name: 'The Royal Oak',
        pubName: 'The Royal Oak',
        address: '44 Tabard St, Borough',
        postcode: 'SE1 4JU',
        walkingTime: 'Start of Crawl (0.0 mi)',
        distanceMiles: 0.0,
        category: 'Traditional Cask Ale & Southwark History',
        difficulty: 'easy',
        questionCount: 5,
        coinReward: 200,
        icon: '🌳',
        description: 'Unspoilt Victorian gem and Harvey’s Brewery flagship serving gravity-fed cask bitter near Chaucer’s Tabard Inn site.',
        funFact: 'Consistently named one of Britain’s best traditional pubs for real ale lovers, completely untouched by modern neon trends.',
        recommendedPint: 'Harvey’s Sussex Best on Handpump 🍺',
        requiredStars: 8,
      },
      {
        id: 'b2_woolpack',
        mapThemeId: 'bermondsey_peckham_trail',
        levelNumber: 2,
        name: 'The Woolpack',
        pubName: 'The Woolpack',
        address: '98 Bermondsey St',
        postcode: 'SE1 3UB',
        walkingTime: '14 min walk (0.7 mi)',
        distanceMiles: 0.7,
        category: 'Bermondsey Leather & Tannery Lore',
        difficulty: 'medium',
        questionCount: 5,
        coinReward: 250,
        icon: '🐑',
        description: 'Vibrant Bermondsey Street staple with 1930s tiling and a bustling beer garden in London’s historic leather district.',
        funFact: 'Bermondsey was once the world capital of leather tanning, with hundreds of tanners drinking in this very tavern.',
        recommendedPint: 'South London Craft Pale & Pork Pie 🥧',
        requiredStars: 10,
      },
      {
        id: 'b3_marquis',
        mapThemeId: 'bermondsey_peckham_trail',
        levelNumber: 3,
        name: 'The Marquis of Wellington',
        pubName: 'The Marquis of Wellington',
        address: '21 Druid St, Bermondsey',
        postcode: 'SE1 2HH',
        walkingTime: '15 min walk to Druid St (0.7 mi)',
        distanceMiles: 1.4,
        category: 'The Bermondsey Beer Mile & Arches',
        difficulty: 'medium',
        questionCount: 5,
        coinReward: 300,
        icon: '🚂',
        description: 'Pioneering pub located right on Druid Street along London’s world-famous railway arch craft brewing mile.',
        funFact: 'The Bermondsey Beer Mile spans over two miles of Victorian railway viaducts built in 1836 for the London and Greenwich Railway!',
        recommendedPint: 'Hazy Bermondsey IPA & Loaded Fries 🍟',
        requiredStars: 12,
      },
      {
        id: 'b4_montpelier',
        mapThemeId: 'bermondsey_peckham_trail',
        levelNumber: 4,
        name: 'The Montpelier',
        pubName: 'The Montpelier',
        address: '43 Choumert Rd, Peckham',
        postcode: 'SE15 4AR',
        walkingTime: '26 min walk / bus down Rye Lane (1.4 mi)',
        distanceMiles: 2.8,
        category: 'Peckham Rye Culture, Cinema & Soul',
        difficulty: 'hard',
        questionCount: 5,
        coinReward: 380,
        icon: '🎬',
        description: 'Beloved Peckham cultural hub with retro backroom cinema, local South London beers, and vibrant weekend pub atmosphere.',
        funFact: 'The pub operates its own miniature cinema in the backroom showing indie films, documentaries, and cult classics.',
        recommendedPint: 'Brick Brewery Peckham Pils & Sourdough Pizza 🍕',
        requiredStars: 14,
      },
      {
        id: 'b5_old_nuns_head',
        mapThemeId: 'bermondsey_peckham_trail',
        levelNumber: 5,
        name: 'The Old Nun’s Head',
        pubName: 'The Old Nun’s Head',
        address: 'Nunhead Green, Nunhead',
        postcode: 'SE15 3QQ',
        walkingTime: '18 min walk across Nunhead Green (1.0 mi)',
        distanceMiles: 3.8,
        category: 'South London Legends & The Green Finale',
        difficulty: 'expert',
        questionCount: 5,
        coinReward: 550,
        icon: '👑',
        description: '17th-century tavern legend on Nunhead Green famed for legendary trivia tournaments, local guest taps, and Sunday roasts.',
        funFact: 'Local folklore says Henry VIII’s court had ties to the nunnery on this green, giving the historic pub its memorable name.',
        recommendedPint: 'Nunhead Special Ale & Roast Beef Yorkshire Pudding 🥩',
        requiredStars: 16,
      },
    ],
  },
  {
    id: 'south_west_heritage_crawl',
    name: 'South West Heritage Crawl',
    crawlRouteName: 'Kennington to Dulwich Village Trail',
    subtitle: '5 Historic Village Pubs in Real Geographic Order (4.5 Miles)',
    icon: '🌳',
    themeColor: '#0D9488',
    accentColor: '#D97706',
    bgGradient: 'from-teal-100 via-amber-50 to-stone-100',
    cardBg: 'bg-teal-100/90 border-amber-800',
    pathColor: '#0F766E',
    stoneColor: 'from-teal-400 to-amber-500',
    requiredStars: 18,
    totalDistance: '4.5 Miles (approx. 1h 30m walk)',
    boroughs: 'Lambeth & Southwark (Kennington, Brixton, Herne Hill, Dulwich)',
    startArea: 'Cleaver Square, Kennington, SE11',
    endArea: 'Dulwich Village, SE21',
    description: 'Explore South London’s finest village greens and musical taverns from historic Cleaver Square to idyllic Dulwich Village.',
    mapArtwork: 'kennington-summer-day.webp',
    seasonalArtwork: {
      spring: { day: 'kennington-spring-day.webp', night: 'kennington-spring-night.webp' },
      summer: { day: 'kennington-summer-day.webp', night: 'kennington-summer-night.webp' },
      autumn: { day: 'kennington-autumn-day.webp', night: 'kennington-autumn-night.webp' },
      winter: { day: 'kennington-winter-day.webp', night: 'kennington-winter-night.webp' },
    },
    levels: [
      {
        id: 's1_prince_wales',
        mapThemeId: 'south_west_heritage_crawl',
        levelNumber: 1,
        name: 'The Prince of Wales',
        pubName: 'The Prince of Wales',
        address: 'Cleaver Square, Kennington',
        postcode: 'SE11 4EA',
        walkingTime: 'Start of Crawl (0.0 mi)',
        distanceMiles: 0.0,
        category: 'Georgian Squares, Oval Cricket & Boules',
        difficulty: 'easy',
        questionCount: 5,
        coinReward: 250,
        icon: '🏏',
        description: 'Hidden Georgian tavern opening onto tree-lined Cleaver Square where locals play French boules on summer evenings.',
        funFact: 'Cleaver Square was built in 1789 and is one of the oldest residential garden squares in South London.',
        recommendedPint: 'Kennington Gold Cask Ale & Sausage Roll 🥐',
        requiredStars: 18,
      },
      {
        id: 's2_trinity_arms',
        mapThemeId: 'south_west_heritage_crawl',
        levelNumber: 2,
        name: 'The Trinity Arms',
        pubName: 'The Trinity Arms',
        address: '45 Trinity Gardens, Brixton',
        postcode: 'SW9 8DR',
        walkingTime: '25 min stroll down Brixton Rd (1.5 mi)',
        distanceMiles: 1.5,
        category: 'Brixton History, Reggae & Markets',
        difficulty: 'medium',
        questionCount: 5,
        coinReward: 320,
        icon: '🎺',
        description: '1850s cozy cobblestone mews fireplace tavern tucked away just steps from bustling Brixton Market and Electric Avenue.',
        funFact: 'Named after Trinity Asylum founded nearby in 1824 by Thomas Bailey; features a real working coal fire in winter.',
        recommendedPint: 'Brixton Brewery Reliance Pale Ale 🍺',
        requiredStars: 20,
      },
      {
        id: 's3_half_moon',
        mapThemeId: 'south_west_heritage_crawl',
        levelNumber: 3,
        name: 'The Half Moon',
        pubName: 'The Half Moon',
        address: '10 Half Moon Ln, Herne Hill',
        postcode: 'SE24 9HU',
        walkingTime: '22 min walk via Brockwell Park (1.1 mi)',
        distanceMiles: 2.6,
        category: 'South London Music Legends & Comedy',
        difficulty: 'medium',
        questionCount: 5,
        coinReward: 400,
        icon: '🌙',
        description: 'Historic 17th-century coaching inn celebrated as a legendary live music venue where U2, The Who, and Frank Skinner performed.',
        funFact: 'The Half Moon’s workshop stage launched the early careers of major British rock bands, comedians, and poets.',
        recommendedPint: 'Brockwell Golden Bitter & Truffle Fries 🍟',
        requiredStars: 23,
      },
      {
        id: 's4_edt',
        mapThemeId: 'south_west_heritage_crawl',
        levelNumber: 4,
        name: 'The East Dulwich Tavern (EDT)',
        pubName: 'The East Dulwich Tavern',
        address: '1 Lordship Ln, East Dulwich',
        postcode: 'SE22 8EW',
        walkingTime: '20 min walk down Lordship Lane (1.0 mi)',
        distanceMiles: 3.6,
        category: 'Lordship Lane, Craft Goods & Pub Quizzes',
        difficulty: 'hard',
        questionCount: 5,
        coinReward: 480,
        icon: '🦉',
        description: 'The bustling cultural anchor of East Dulwich’s Lordship Lane, famed for community spirit and packed pub quiz nights.',
        funFact: 'Lordship Lane was once a medieval country cart track through the Great North Wood before becoming South London’s favorite food street.',
        recommendedPint: 'Southwark Brewing Stiff Lip IPA 🍺',
        requiredStars: 26,
      },
      {
        id: 's5_crown_greyhound',
        mapThemeId: 'south_west_heritage_crawl',
        levelNumber: 5,
        name: 'The Crown & Greyhound',
        pubName: 'The Crown & Greyhound',
        address: '73 Dulwich Village',
        postcode: 'SE21 7HN',
        walkingTime: '18 min walk into Dulwich Village (0.9 mi)',
        distanceMiles: 4.5,
        category: 'Dulwich College, Old Masters & The Grand Village Finale',
        difficulty: 'expert',
        questionCount: 5,
        coinReward: 700,
        icon: '👑',
        description: 'The historic "Dog" of Dulwich Village, a stately Victorian coaching inn with sprawling gardens in London’s only true village.',
        funFact: 'Formed in the 1890s by combining two ancient rival inns: The Crown (for gentry) and The Greyhound (for laborers and coachmen)!',
        recommendedPint: 'Dulwich Village Reserve Ale & Sunday Roast 🍖',
        requiredStars: 30,
      },
    ],
  },
];

type LondonStageLevel = {
  id: string;
  name: string;
  address: string;
  postcode: string;
  category: string;
  icon: string;
  description: string;
  funFact: string;
};

const makeLondonStage = ({
  id,
  name,
  route,
  subtitle,
  icon,
  requiredStars,
  distance,
  boroughs,
  startArea,
  endArea,
  description,
  artwork,
  themeColor,
  pathColor,
  levels,
}: {
  id: string;
  name: string;
  route: string;
  subtitle: string;
  icon: string;
  requiredStars: number;
  distance: string;
  boroughs: string;
  startArea: string;
  endArea: string;
  description: string;
  artwork: string;
  themeColor: string;
  pathColor: string;
  levels: LondonStageLevel[];
}): CartoonMap => {
  const artworkIsSingleImage = artwork.startsWith('map-backgrounds/');
  const mapArtwork = artworkIsSingleImage ? artwork : `${artwork}-day.webp`;
  const seasonalArtwork = (season: 'spring' | 'summer' | 'autumn' | 'winter', time: 'day' | 'night') =>
    artworkIsSingleImage ? artwork : `${artwork}-${season}-${time}.webp`;
  return ({
  id,
  name,
  crawlRouteName: route,
  subtitle,
  icon,
  themeColor,
  accentColor: '#F59E0B',
  bgGradient: 'from-amber-100 via-orange-50 to-stone-100',
  cardBg: 'bg-amber-100/90 border-amber-800',
  pathColor,
  stoneColor: 'from-orange-400 to-amber-500',
  requiredStars,
  totalDistance: distance,
  boroughs,
  startArea,
  endArea,
  description,
  mapArtwork,
  seasonalArtwork: {
    spring: { day: seasonalArtwork('spring', 'day'), night: seasonalArtwork('spring', 'night') },
    summer: { day: seasonalArtwork('summer', 'day'), night: seasonalArtwork('summer', 'night') },
    autumn: { day: seasonalArtwork('autumn', 'day'), night: seasonalArtwork('autumn', 'night') },
    winter: { day: seasonalArtwork('winter', 'day'), night: seasonalArtwork('winter', 'night') },
  },
  levels: levels.map((level, index) => ({
    ...level,
    mapThemeId: id,
    levelNumber: index + 1,
    pubName: level.name,
    walkingTime: index === 0 ? 'Start of Crawl' : `Stage ${index + 1} of 5`,
    distanceMiles: Number(((index / 4) * Number.parseFloat(distance)).toFixed(1)),
    difficulty: (['easy', 'medium', 'medium', 'hard', 'expert'] as const)[index],
    questionCount: 5,
    coinReward: [220, 280, 350, 450, 650][index],
    requiredStars: requiredStars + (index * 2),
    recommendedPint: 'Ask the bar for a favourite local cask or alcohol-free pour 🍺',
  })),
  });
};

const WEST_LONDON_STAGE = makeLondonStage({
  id: 'west_london_crawl',
  name: 'West End & Hyde Park Trail',
  route: 'Covent Garden to Hyde Park through the West End',
  subtitle: 'Five pub stops across Covent Garden, Leicester Square, Soho, Mayfair and Hyde Park',
  icon: '🌉',
  requiredStars: 8,
  distance: '4.2 Miles (approx. 1h 25m walk)',
  boroughs: 'Covent Garden ➔ Leicester Square ➔ Soho ➔ Mayfair ➔ Hyde Park',
  startArea: 'Rose Street, Covent Garden, WC2E',
  endArea: 'Bayswater Road, W2',
  description: 'Explore five pubs through London’s West End and finish beside Hyde Park.',
  artwork: 'west-london',
  themeColor: '#9A3412',
  pathColor: '#F97316',
  levels: [
    { id: 'w1_churchill_arms', name: 'The Lamb & Flag', address: '33 Rose Street, Covent Garden', postcode: 'WC2E 9EB', category: 'Covent Garden Market & Theatreland', icon: '🍺', description: 'A historic Covent Garden pub tucked just off Rose Street, close to the market and theatre district.', funFact: 'A pub has stood on this site since at least 1772; it took the name The Lamb & Flag in 1833.' },
    { id: 'w2_windsor_castle', name: 'The Salisbury', address: '90 St Martin’s Lane, Leicester Square', postcode: 'WC2N 4AP', category: 'Leicester Square & London Entertainment', icon: '🎭', description: 'A Victorian pub on St Martin’s Lane, a short walk from Leicester Square.', funFact: 'The building dates from the late Victorian era and is known for its Art Nouveau interior.' },
    { id: 'w3_dove', name: 'The French House', address: '49 Dean Street, Soho', postcode: 'W1D 5BG', category: 'Soho, Writers & London Music', icon: '🎶', description: 'A well-known Soho pub on Dean Street, in the heart of the West End.', funFact: 'Soho has long been associated with London theatres, music venues and writers.' },
    { id: 'w4_blue_anchor', name: 'The Guinea', address: '30 Bruton Place, Mayfair', postcode: 'W1J 6NL', category: 'Mayfair, Berkeley Square & London History', icon: '🪙', description: 'A traditional pub tucked into Bruton Place in the heart of Mayfair.', funFact: 'The Guinea’s official history traces a pub on this site back to 1423.' },
    { id: 'w5_old_ship', name: 'The Swan', address: '66 Bayswater Road, opposite Hyde Park', postcode: 'W2 3PH', category: 'Hyde Park, the Serpentine & London Parks', icon: '🦢', description: 'A pub opposite Hyde Park, close to Lancaster Gate and the park’s north side.', funFact: 'The Swan describes itself as a gateway to Hyde Park, one of London’s best-known green spaces.' },
  ],
});

const NORTH_LONDON_STAGE = makeLondonStage({
  id: 'north_london_crawl',
  name: 'Central London Landmarks Trail',
  route: 'Trafalgar Square to London Bridge via Camden & King’s Cross',
  subtitle: 'Five pub stops linking Trafalgar Square, the Strand, Camden, King’s Cross and London Bridge',
  icon: '🏞️',
  requiredStars: 18,
  distance: '5.8 Miles (best enjoyed in two walking sections)',
  boroughs: 'Trafalgar Square ➔ The Strand ➔ Camden Town ➔ King’s Cross ➔ London Bridge',
  startArea: 'Trafalgar Square, WC2N',
  endArea: 'Borough High Street, SE1',
  description: 'Visit central London pubs from Trafalgar Square through Camden and King’s Cross to London Bridge.',
  artwork: 'north-london',
  themeColor: '#7C2D12',
  pathColor: '#EA580C',
  levels: [
    { id: 'n1_parcel_yard', name: 'The Admiralty', address: '66 Trafalgar Square', postcode: 'WC2N 5DS', category: 'Trafalgar Square, Nelson’s Column & London History', icon: '⚓', description: 'A central London pub on Trafalgar Square, themed around HMS Victory and the Battle of Trafalgar.', funFact: 'The pub’s nautical theme references HMS Victory, Nelson’s flagship at the Battle of Trafalgar.' },
    { id: 'n2_colonel_fawcett', name: 'The George', address: '213 Strand', postcode: 'WC2R 1AP', category: 'The Strand, Aldwych & Historic Theatres', icon: '🎭', description: 'A historic pub on the Strand, close to Temple and the West End theatres.', funFact: 'The pub’s history page says there has been a George on the Strand site since 1723.' },
    { id: 'n3_southampton_arms', name: 'The Hawley Arms', address: '2 Castlehaven Road, Camden Town', postcode: 'NW1 8QU', category: 'Camden Lock, Markets & Music', icon: '🎸', description: 'A Camden Town pub near the railway bridge, Camden Market and Regent’s Canal.', funFact: 'The pub reopened after a major fire in Camden Market in 2008.' },
    { id: 'n4_flask', name: 'The Parcel Yard', address: 'King’s Cross Station', postcode: 'N1C 4AH', category: 'King’s Cross, Railways & Victorian Engineering', icon: '🚂', description: 'A pub inside King’s Cross railway station, close to the station concourse and platforms.', funFact: 'The Parcel Yard occupies historic railway buildings within King’s Cross Station.' },
    { id: 'n5_spaniards', name: 'The George Inn', address: '77 Borough High Street, Southwark', postcode: 'SE1 1NH', category: 'London Bridge, Borough Market & Coaching Inns', icon: '🏛️', description: 'The National Trust’s galleried coaching inn sits just off Borough High Street near London Bridge.', funFact: 'The George is London’s only surviving galleried coaching inn.' },
  ],
});

const EAST_LONDON_STAGE = makeLondonStage({
  id: 'east_london_crawl',
  name: 'East & South London Landmarks Trail',
  route: 'Tower Hill to Greenwich via Shoreditch & Battersea',
  subtitle: 'Five pub stops across Tower Hill, Shoreditch, Southwark, Battersea and Greenwich',
  icon: '⚓',
  requiredStars: 28,
  distance: '4.9 Miles (approx. 1h 40m walk)',
  boroughs: 'Tower Hill ➔ Shoreditch ➔ Southwark ➔ Battersea ➔ Greenwich',
  startArea: 'Great Tower Street, EC3R',
  endArea: 'Greenwich Church Street, SE10',
  description: 'Explore five London pubs near major river, historic and neighbourhood landmarks.',
  artwork: 'east-london',
  themeColor: '#9A3412',
  pathColor: '#FB923C',
  levels: [
    { id: 'e1_ten_bells', name: 'Hung, Drawn & Quartered', address: '26-27 Great Tower Street, Tower Hill', postcode: 'EC3R 5AQ', category: 'Tower of London, Tower Hill & Medieval London', icon: '🏰', description: 'A Fuller’s pub on Great Tower Street, a short walk from the Tower of London.', funFact: 'The pub is named after the historical punishment of hanging, drawing and quartering.' },
    { id: 'e2_pride_spitalfields', name: 'The Old Blue Last', address: '38 Great Eastern Street, Shoreditch', postcode: 'EC2A 3ES', category: 'Shoreditch, Markets & East London Music', icon: '🎸', description: 'A Shoreditch pub and live-music venue on Great Eastern Street.', funFact: 'The Old Blue Last describes itself as having more than 300 years of history.' },
    { id: 'e3_prospect_whitby', name: 'The Anchor Bankside', address: '34 Park Street, Bankside, Southwark', postcode: 'SE1 9EF', category: 'Southwark, Bankside & Shakespeare’s Globe', icon: '⚓', description: 'A riverside pub on Bankside, close to the Globe Theatre and Tate Modern.', funFact: 'The Anchor stands on Bankside, an area closely linked with Shakespeare’s theatres.' },
    { id: 'e4_grapes', name: 'The Prince Albert', address: '85 Albert Bridge Road, Battersea', postcode: 'SW11 4PF', category: 'Battersea Park, the Thames & Power Station', icon: '🌳', description: 'A Victorian Battersea pub opposite the Albert Gate entrance to Battersea Park.', funFact: 'The Prince Albert is a short walk from Battersea Park and the Thames.',
    },
    { id: 'e5_gun', name: 'The Gipsy Moth', address: '60 Greenwich Church Street, Greenwich', postcode: 'SE10 9BL', category: 'Greenwich, the Royal Observatory & Maritime London', icon: '⛵', description: 'A Greenwich pub with views of the Cutty Sark and a short walk from Greenwich Park.', funFact: 'The pub sits close to the Cutty Sark in the centre of the Greenwich World Heritage Site.' },
  ],
});


const CITY_CLERKENWELL_STAGE = makeLondonStage({
  id: 'city_clerkenwell_crawl', name: 'City & Clerkenwell Trail',
  route: 'Blackfriars to Clerkenwell through the old City',
  subtitle: 'Five real pub stops through the City of London and Clerkenwell',
  icon: '🏙️', requiredStars: 38, distance: '3.8 Miles (approx. 1h 15m walk)',
  boroughs: 'Blackfriars ➔ Fleet Street ➔ Holborn ➔ Farringdon',
  startArea: 'Queen Victoria Street, EC4V', endArea: 'Farringdon Street, EC4A',
  description: 'Explore classic City pubs and finish around Clerkenwell and Farringdon.',
  artwork: 'map-backgrounds/city-clerkenwell.webp', themeColor: '#1D4ED8', pathColor: '#2563EB',
  levels: [
    { id: 'cc1_blackfriar', name: 'The Blackfriar', address: '174 Queen Victoria Street', postcode: 'EC4V 4EG', category: 'Blackfriars & the City', icon: '🏛️', description: 'A pub beside Blackfriars station, on the edge of the City and the Thames.', funFact: 'The Blackfriar stands close to Blackfriars Bridge and the Thames Path.' },
    { id: 'cc2_cheshire_cheese', name: 'Ye Olde Cheshire Cheese', address: '145 Fleet Street', postcode: 'EC4A 2BU', category: 'Fleet Street & London publishing', icon: '📰', description: 'A Fleet Street pub in the historic newspaper district.', funFact: 'Fleet Street was London’s newspaper centre for generations.' },
    { id: 'cc3_old_bank', name: 'The Old Bank of England', address: '194 Fleet Street', postcode: 'EC4A 2LT', category: 'The City & the old banking quarter', icon: '💷', description: 'A pub in a former banking hall on Fleet Street.', funFact: 'The ornate building was designed as a branch of the Bank of England.' },
    { id: 'cc4_cittie_yorke', name: 'Cittie of Yorke', address: '22 High Holborn', postcode: 'WC1V 6BN', category: 'Holborn & London legal history', icon: '⚖️', description: 'A spacious traditional pub on High Holborn, near Gray’s Inn.', funFact: 'The pub is close to the historic Inns of Court.' },
    { id: 'cc5_hoop_grapes', name: 'The Hoop & Grapes', address: '80 Farringdon Street', postcode: 'EC4A 4BL', category: 'Farringdon & historic London', icon: '🍇', description: 'A small historic pub on Farringdon Street.', funFact: 'The Hoop & Grapes is among the City’s surviving timber-framed pubs.' },
  ],
});

const ISLINGTON_STAGE = makeLondonStage({
  id: 'islington_crawl', name: 'Islington & Angel Trail',
  route: 'Barnsbury to Angel across Islington',
  subtitle: 'Five neighbourhood pubs across Barnsbury, Canonbury and Angel',
  icon: '🎭', requiredStars: 48, distance: '2.9 Miles (approx. 1h walk)',
  boroughs: 'Barnsbury ➔ Canonbury ➔ Angel',
  startArea: 'Barnsbury Street, N1', endArea: 'St Peter’s Street, N1',
  description: 'Wander between independent pubs and canal-side streets around Islington.',
  artwork: 'map-backgrounds/islington.webp', themeColor: '#7C3AED', pathColor: '#9333EA',
  levels: [
    { id: 'is1_drapers_arms', name: 'The Drapers Arms', address: '44 Barnsbury Street', postcode: 'N1 1ER', category: 'Barnsbury & Islington squares', icon: '🌳', description: 'A neighbourhood pub on Barnsbury Street, north of Angel.', funFact: 'The pub sits among the Georgian streets of Barnsbury.' },
    { id: 'is2_compton_arms', name: 'The Compton Arms', address: '4 Compton Avenue', postcode: 'N1 2XD', category: 'Canonbury & literary London', icon: '📚', description: 'A traditional corner pub in Canonbury.', funFact: 'Canonbury is known for its garden squares and historic terraces.' },
    { id: 'is3_crown', name: 'The Crown', address: '116 Cloudesley Road', postcode: 'N1 0EB', category: 'Cloudesley Square & Angel', icon: '👑', description: 'A local pub a short walk from Cloudesley Square.', funFact: 'Cloudesley Square is one of Islington’s garden squares.' },
    { id: 'is4_old_queens_head', name: 'The Old Queen’s Head', address: '44 Essex Road', postcode: 'N1 8LN', category: 'Essex Road & Islington music', icon: '🎶', description: 'A pub and live music venue on Essex Road.', funFact: 'The Old Queen’s Head regularly hosts live music and club nights.' },
    { id: 'is5_narrowboat', name: 'The Narrowboat', address: '119 St Peter’s Street', postcode: 'N1 8PZ', category: 'Regent’s Canal & Angel', icon: '🛶', description: 'A canal-side pub at City Road Basin near Angel.', funFact: 'The Regent’s Canal links Angel with King’s Cross and east London.' },
  ],
});

const HAMPSTEAD_STAGE = makeLondonStage({
  id: 'hampstead_highgate_crawl', name: 'Hampstead & Highgate Trail',
  route: 'Hampstead Heath to Highgate',
  subtitle: 'Five pubs beside the Heath and the village streets of north London',
  icon: '🌲', requiredStars: 58, distance: '4.1 Miles (approx. 1h 25m walk)',
  boroughs: 'Hampstead ➔ Hampstead Heath ➔ Highgate',
  startArea: 'Hampstead Village, NW3', endArea: 'Highgate Road, NW5',
  description: 'Climb through leafy Hampstead and finish beside the Heath in Highgate.',
  artwork: 'map-backgrounds/hampstead.webp', themeColor: '#15803D', pathColor: '#16A34A',
  levels: [
    { id: 'hh1_holly_bush', name: 'The Holly Bush', address: '22 Holly Mount', postcode: 'NW3 6SG', category: 'Hampstead Village & its lanes', icon: '🍃', description: 'A cosy pub tucked into the steep lanes above Hampstead High Street.', funFact: 'Holly Mount is one of Hampstead’s winding village streets.' },
    { id: 'hh2_spaniards', name: 'The Spaniards Inn', address: 'Spaniards Road', postcode: 'NW3 7JJ', category: 'Hampstead Heath & the old road north', icon: '🐎', description: 'A country-style inn beside Hampstead Heath and Spaniards Road.', funFact: 'The pub stands beside one of the historic routes across the Heath.' },
    { id: 'hh3_old_white_bear', name: 'The Old White Bear', address: '1 Well Road', postcode: 'NW3 1LZ', category: 'Well Walk & Hampstead springs', icon: '🐻', description: 'A village pub near Well Walk and Hampstead High Street.', funFact: 'Hampstead’s historic wells once drew visitors seeking the area’s spring water.' },
    { id: 'hh4_flask', name: 'The Flask', address: '77 Highgate West Hill', postcode: 'N6 6BU', category: 'Highgate Village & north London', icon: '🍺', description: 'A traditional pub on Highgate West Hill, close to the village centre.', funFact: 'Highgate Village sits on a hill above the northern side of London.' },
    { id: 'hh5_bull_last', name: 'The Bull & Last', address: '168 Highgate Road', postcode: 'NW5 1QS', category: 'Kentish Town & Parliament Hill', icon: '🐂', description: 'A pub at the foot of Parliament Hill, near Hampstead Heath.', funFact: 'Parliament Hill offers a well-known view across the London skyline.' },
  ],
});

const RICHMOND_STAGE = makeLondonStage({
  id: 'richmond_thames_crawl', name: 'Richmond & Thames Trail',
  route: 'Richmond Green to Teddington Lock',
  subtitle: 'Five riverside pubs through Richmond, Twickenham and Teddington',
  icon: '🦌', requiredStars: 68, distance: '5.4 Miles (approx. 1h 50m walk)',
  boroughs: 'Richmond ➔ Twickenham ➔ Teddington',
  startArea: 'Richmond Green, TW9', endArea: 'Broom Road, TW11',
  description: 'Follow the Thames through Richmond and neighbouring riverside towns.',
  artwork: 'map-backgrounds/richmond.webp', themeColor: '#0891B2', pathColor: '#06B6D4',
  levels: [
    { id: 'rt1_princes_head', name: 'The Prince’s Head', address: '28 The Green', postcode: 'TW9 1LX', category: 'Richmond Green & television London', icon: '🎬', description: 'A pub facing Richmond Green, in the heart of the town.', funFact: 'Richmond Green has been a gathering place for centuries.' },
    { id: 'rt2_roebuck', name: 'The Roebuck', address: '130 Richmond Hill', postcode: 'TW10 6RN', category: 'Richmond Hill & the Thames view', icon: '🦌', description: 'A hilltop pub above the Thames in Richmond.', funFact: 'The view from Richmond Hill is protected as a famous landscape vista.' },
    { id: 'rt3_white_cross', name: 'The White Cross', address: 'Riverside, Water Lane', postcode: 'TW9 1TH', category: 'Richmond riverside & the tide', icon: '🌊', description: 'A riverside pub on Water Lane beside the Thames.', funFact: 'The pub’s riverside terrace can be affected by the Thames tide.' },
    { id: 'rt4_white_swan', name: 'The White Swan', address: 'Riverside, Twickenham', postcode: 'TW1 3DN', category: 'Twickenham & riverside sport', icon: '🦢', description: 'A riverside pub near Twickenham’s Thames paths.', funFact: 'Twickenham is closely associated with rugby and the River Thames.' },
    { id: 'rt5_anglers', name: 'The Anglers', address: '3 Broom Road', postcode: 'TW11 9NR', category: 'Teddington Lock & river life', icon: '🎣', description: 'A Thames-side pub close to Teddington Lock.', funFact: 'Teddington Lock marks the tidal limit of the Thames.' },
  ],
});

const NOTTING_HILL_STAGE = makeLondonStage({
  id: 'notting_hill_crawl', name: 'Notting Hill & Kensington Trail',
  route: 'Kensington to Ladbroke Grove',
  subtitle: 'Five colourful pubs in Kensington and Notting Hill',
  icon: '🌺', requiredStars: 78, distance: '3.2 Miles (approx. 1h 5m walk)',
  boroughs: 'Kensington ➔ Holland Park ➔ Notting Hill',
  startArea: 'Kensington Church Street, W8', endArea: 'All Saints Road, W11',
  description: 'Explore pub gardens and market streets around Kensington and Notting Hill.',
  artwork: 'map-backgrounds/notting-hill.webp', themeColor: '#DB2777', pathColor: '#EC4899',
  levels: [
    { id: 'nh1_churchill_arms', name: 'The Churchill Arms', address: '119 Kensington Church Street', postcode: 'W8 7LN', category: 'Kensington & floral facades', icon: '🌸', description: 'A colourful pub on Kensington Church Street, known for its flower-covered frontage.', funFact: 'The Churchill Arms decorates its exterior with seasonal flowers.' },
    { id: 'nh2_windsor_castle', name: 'The Windsor Castle', address: '114 Campden Hill Road', postcode: 'W8 7AR', category: 'Campden Hill & Kensington', icon: '🏰', description: 'A traditional pub tucked into the residential streets of Campden Hill.', funFact: 'Campden Hill is named for the nearby historic Campden House estate.' },
    { id: 'nh3_ladbroke_arms', name: 'The Ladbroke Arms', address: '54 Ladbroke Road', postcode: 'W11 3NW', category: 'Ladbroke Grove & Notting Hill', icon: '🌿', description: 'A neighbourhood pub near Holland Park Avenue.', funFact: 'The Ladbroke estate shaped much of the surrounding street layout.' },
    { id: 'nh4_elgin', name: 'The Elgin', address: '96 Ladbroke Grove', postcode: 'W11 1PY', category: 'Ladbroke Grove & live music', icon: '🎤', description: 'A pub and live music venue on Ladbroke Grove.', funFact: 'Ladbroke Grove is a major street linking Notting Hill and Kensal Green.' },
    { id: 'nh5_pelican', name: 'The Pelican', address: '45 All Saints Road', postcode: 'W11 1HE', category: 'Portobello Road & All Saints Road', icon: '🦜', description: 'A local pub a short walk from Portobello Road Market.', funFact: 'Portobello Road Market is one of London’s best-known street markets.' },
  ],
});

const HACKNEY_STAGE = makeLondonStage({
  id: 'hackney_crawl', name: 'Hackney & Broadway Market Trail',
  route: 'Broadway Market to Columbia Road',
  subtitle: 'Five East London pubs around the canal, markets and Hackney streets',
  icon: '🚲', requiredStars: 88, distance: '3.4 Miles (approx. 1h 10m walk)',
  boroughs: 'Broadway Market ➔ London Fields ➔ Hackney Road ➔ Columbia Road',
  startArea: 'Broadway Market, E8', endArea: 'Columbia Road, E2',
  description: 'Visit Hackney pubs near Broadway Market, London Fields and Columbia Road.',
  artwork: 'map-backgrounds/hackney.webp', themeColor: '#EA580C', pathColor: '#F97316',
  levels: [
    { id: 'ha1_cat_mutton', name: 'The Cat & Mutton', address: '76 Broadway Market', postcode: 'E8 4QJ', category: 'Broadway Market & Regent’s Canal', icon: '🐈', description: 'A pub at the north end of Broadway Market, near the canal.', funFact: 'Broadway Market runs between London Fields and Regent’s Canal.' },
    { id: 'ha2_dove', name: 'The Dove', address: '24–28 Broadway Market', postcode: 'E8 4QJ', category: 'Broadway Market & London Fields', icon: '🕊️', description: 'A neighbourhood pub on Broadway Market beside London Fields.', funFact: 'London Fields is a popular green space in the heart of Hackney.' },
    { id: 'ha3_chesham_arms', name: 'The Chesham Arms', address: '15 Mehetabel Road', postcode: 'E9 6DU', category: 'Homerton & local Hackney', icon: '🛡️', description: 'A community pub on Mehetabel Road in Homerton.', funFact: 'Mehetabel Road is part of Hackney’s residential East London street network.' },
    { id: 'ha4_marksman', name: 'The Marksman', address: '254 Hackney Road', postcode: 'E2 7SJ', category: 'Hackney Road & East London food', icon: '🎯', description: 'A pub and restaurant on Hackney Road near Hoxton.', funFact: 'Hackney Road links Shoreditch with Cambridge Heath.' },
    { id: 'ha5_royal_oak', name: 'The Royal Oak', address: '73 Columbia Road', postcode: 'E2 7RG', category: 'Columbia Road & the flower market', icon: '🌼', description: 'A pub on Columbia Road, close to the Sunday flower market.', funFact: 'Columbia Road Flower Market is held on Sundays.' },
  ],
});

const GREENWICH_DEPTFORD_STAGE = makeLondonStage({
  id: 'greenwich_deptford_crawl', name: 'Greenwich & Deptford Trail',
  route: 'Deptford to Greenwich Park via the Thames',
  subtitle: 'Five pubs in Deptford and Greenwich, ending beside Greenwich Park',
  icon: '⚓', requiredStars: 98, distance: '2.8 Miles (approx. 55m walk)',
  boroughs: 'Deptford ➔ Deptford Creek ➔ Greenwich town ➔ Greenwich Park',
  startArea: 'Prince Street, SE8', endArea: 'Park Vista, SE10',
  description: 'Explore Deptford and Greenwich with pubs clustered along the Thames and Greenwich Park.',
  artwork: 'map-backgrounds/greenwich.webp', themeColor: '#0F766E', pathColor: '#14B8A6',
  levels: [
    { id: 'gd1_dog_bell', name: 'The Dog & Bell', address: '116 Prince Street', postcode: 'SE8 3JD', category: 'Deptford & the old naval town', icon: '🐕', description: 'A traditional pub near Deptford High Street.', funFact: 'Deptford has a long connection with London’s historic dockyards.' },
    { id: 'gd2_brookmill', name: 'The Brookmill', address: '65 Cranbrook Road', postcode: 'SE8 4EJ', category: 'Deptford & Brookmill Park', icon: '🌳', description: 'A neighbourhood pub near Deptford Bridge and Brookmill Park.', funFact: 'Brookmill Park follows the route of the Ravensbourne River.' },
    { id: 'gd3_trafalgar', name: 'The Greenwich Tavern', address: '1 King William Walk', postcode: 'SE10 9JH', category: 'Greenwich town & the park', icon: '🏛️', description: 'A pub by Greenwich Park and the town centre.', funFact: 'Greenwich Park rises behind the town to the Royal Observatory.' },
    { id: 'gd4_ivy_house', name: 'The Plume of Feathers', address: '19 Park Vista', postcode: 'SE10 9LZ', category: 'Greenwich Park & the Royal Observatory', icon: '🪶', description: 'A neighbourhood pub on Park Vista, beside Greenwich Park.', funFact: 'Park Vista sits close to the Royal Observatory and the park’s south edge.' },
    { id: 'gd5_old_nuns_head', name: 'The Trafalgar Tavern', address: '27 Park Row', postcode: 'SE10 9NW', category: 'Greenwich riverside & maritime London', icon: '🚢', description: 'A Thames-side pub beside the Old Royal Naval College.', funFact: 'The pub overlooks the Thames at Greenwich.' },
  ],
});
const PUTNEY_WANDSWORTH_STAGE = makeLondonStage({
  id: 'putney_wandsworth_crawl', name: 'Putney & Wandsworth Trail',
  route: 'Putney Bridge to Wandsworth Common',
  subtitle: 'Five pubs along the Thames and through Wandsworth',
  icon: '🚣', requiredStars: 108, distance: '4.7 Miles (approx. 1h 35m walk)',
  boroughs: 'Putney ➔ Wandsworth Town ➔ Wandsworth Common',
  startArea: 'Putney High Street, SW15', endArea: 'Trinity Road, SW18',
  description: 'Follow the Thames from Putney and finish among the leafy streets of Wandsworth.',
  artwork: 'map-backgrounds/putney.webp', themeColor: '#0284C7', pathColor: '#0EA5E9',
  levels: [
    { id: 'pw1_spotted_horse', name: 'The Spotted Horse', address: '122 Putney High Street', postcode: 'SW15 1RG', category: 'Putney & the Boat Race', icon: '🐴', description: 'A pub on Putney High Street close to the river and bridge.', funFact: 'The Oxford and Cambridge Boat Race starts near Putney Bridge.' },
    { id: 'pw2_half_moon', name: 'The Half Moon', address: '93 Lower Richmond Road', postcode: 'SW15 1EU', category: 'Putney & London music venues', icon: '🌙', description: 'A historic music pub near Putney Bridge station.', funFact: 'The Half Moon is a well-known live music venue in southwest London.' },
    { id: 'pw3_ship', name: 'The Ship', address: '41 Jews Row', postcode: 'SW18 1TB', category: 'Wandsworth riverside', icon: '⛵', description: 'A riverside pub on the Thames Path in Wandsworth.', funFact: 'Jews Row runs beside the Thames near Wandsworth Park.' },
    { id: 'pw4_alma', name: 'The Alma', address: '499 Old York Road', postcode: 'SW18 1TF', category: 'Wandsworth Town & railways', icon: '🚂', description: 'A pub opposite Wandsworth Town station.', funFact: 'Old York Road is one of Wandsworth’s main historic streets.' },
    { id: 'pw5_county_arms', name: 'The County Arms', address: '345 Trinity Road', postcode: 'SW18 3SH', category: 'Wandsworth Common & green London', icon: '🌲', description: 'A pub beside Wandsworth Common on Trinity Road.', funFact: 'Wandsworth Common is one of the largest green spaces in the borough.' },
  ],
});

const CHISWICK_HAMMERSMITH_STAGE = makeLondonStage({
  id: 'chiswick_hammersmith_crawl', name: 'Chiswick & Hammersmith Trail',
  route: 'Chiswick High Road to Hammersmith riverside',
  subtitle: 'Five west London pubs from Chiswick to the Thames',
  icon: '🌉', requiredStars: 118, distance: '4.6 Miles (approx. 1h 30m walk)',
  boroughs: 'Chiswick ➔ Hammersmith',
  startArea: 'Chiswick High Road, W4', endArea: 'Upper Mall, W6',
  description: 'Cross Chiswick’s pub-lined High Road and follow the Thames into Hammersmith.',
  artwork: 'map-backgrounds/chiswick.webp', themeColor: '#4F46E5', pathColor: '#6366F1',
  levels: [
    { id: 'ch1_old_pack_horse', name: 'The Old Pack Horse', address: '434 Chiswick High Road', postcode: 'W4 5TF', category: 'Chiswick High Road & west London', icon: '🐎', description: 'A local pub on Chiswick High Road.', funFact: 'Chiswick High Road is the neighbourhood’s main shopping street.' },
    { id: 'ch2_george_iv', name: 'The George IV', address: '185 Chiswick High Road', postcode: 'W4 2DR', category: 'Chiswick & the old coaching road', icon: '👑', description: 'A pub and live music venue in the centre of Chiswick.', funFact: 'The pub hosts live music as part of its regular events.' },
    { id: 'ch3_tabard', name: 'The Tabard', address: '2 Bath Road', postcode: 'W4 1LW', category: 'Turnham Green & theatre design', icon: '🎭', description: 'A pub and arts venue close to Turnham Green station.', funFact: 'The Tabard is known for its distinctive modernist design.' },
    { id: 'ch4_black_lion', name: 'The Black Lion', address: '2 South Black Lion Lane', postcode: 'W6 9TJ', category: 'Hammersmith & riverside walks', icon: '🦁', description: 'A historic pub in the riverside streets of Hammersmith.', funFact: 'The pub is close to Hammersmith’s Thames Path.' },
    { id: 'ch5_dove', name: 'The Dove', address: '19 Upper Mall', postcode: 'W6 9TA', category: 'Hammersmith Bridge & the Thames', icon: '🕊️', description: 'A small riverside pub on Upper Mall in Hammersmith.', funFact: 'Upper Mall runs along the north bank of the Thames.' },
  ],
});

const WAPPING_ROTHERHITHE_STAGE = makeLondonStage({
  id: 'wapping_rotherhithe_crawl', name: 'Wapping & Rotherhithe Trail',
  route: 'Wapping Wall to Rotherhithe Street',
  subtitle: 'Five dockside and riverside pubs across London’s historic east end',
  icon: '⚓', requiredStars: 128, distance: '3.6 Miles (approx. 1h 15m walk)',
  boroughs: 'Wapping ➔ Limehouse ➔ Rotherhithe',
  startArea: 'Wapping Wall, E1W', endArea: 'Rotherhithe Street, SE16',
  description: 'Explore old wharves and riverside pubs from Wapping to Rotherhithe.',
  artwork: 'map-backgrounds/wapping.webp', themeColor: '#B45309', pathColor: '#D97706',
  levels: [
    { id: 'wr1_prospect_whitby', name: 'The Prospect of Whitby', address: '57 Wapping Wall', postcode: 'E1W 3SH', category: 'Wapping & London’s docks', icon: '⚓', description: 'A Thames-side pub among the old warehouses of Wapping.', funFact: 'Wapping grew around London’s historic riverside docks.' },
    { id: 'wr2_town_ramsgate', name: 'The Town of Ramsgate', address: '62 Wapping Wall', postcode: 'E1W 3SF', category: 'Wapping & the Thames tide', icon: '🌊', description: 'A pub on the riverside path beside Wapping Wall.', funFact: 'Wapping Wall follows the old embankment along the Thames.' },
    { id: 'wr3_captain_kidd', name: 'The Captain Kidd', address: '108 Wapping High Street', postcode: 'E1W 2NE', category: 'Wapping High Street & maritime London', icon: '🏴‍☠️', description: 'A pub beside the Thames in Wapping, named after the Scottish sailor William Kidd.', funFact: 'The pub takes its name from Captain William Kidd, who was tried in London.' },
    { id: 'wr4_grapes', name: 'The Grapes', address: '76 Narrow Street', postcode: 'E14 8BP', category: 'Limehouse & the Regent’s Canal Dock', icon: '🍇', description: 'A small riverside pub on Narrow Street in Limehouse.', funFact: 'Narrow Street runs beside the former Limehouse Basin.' },
    { id: 'wr5_mayflower', name: 'The Mayflower', address: '117 Rotherhithe Street', postcode: 'SE16 4NF', category: 'Rotherhithe & the Mayflower voyage', icon: '⛵', description: 'A riverside pub on Rotherhithe Street overlooking the Thames.', funFact: 'The pub takes its name from the Mayflower ship associated with the 1620 voyage.' },
  ],
});


// The world now progresses clockwise across London after the opening Thames map.
const LONDON_MAPS: CartoonMap[] = [
  LEGACY_CARTOON_MAPS[0],
  WEST_LONDON_STAGE,
  NORTH_LONDON_STAGE,
  EAST_LONDON_STAGE,
  CITY_CLERKENWELL_STAGE,
  ISLINGTON_STAGE,
  HAMPSTEAD_STAGE,
  RICHMOND_STAGE,
  NOTTING_HILL_STAGE,
  HACKNEY_STAGE,
  GREENWICH_DEPTFORD_STAGE,
  PUTNEY_WANDSWORTH_STAGE,
  CHISWICK_HAMMERSMITH_STAGE,
  WAPPING_ROTHERHITHE_STAGE,
];

// The illustrated level covers and map backdrops use one continuous 1–70
// sequence across fourteen five-stop routes. Keep each pub's real name in
// `pubName`, while `name` is the player-facing level area shown on the art.
const ILLUSTRATED_LEVEL_NAMES = [
  'Waterloo', 'Brixton', 'Gipsy Hill', 'Crystal Palace', 'Westminster',
  'Covent Garden', 'Leicester Square', 'Soho', 'Mayfair', 'Hyde Park',
  'Trafalgar Square', 'The Strand', 'Camden Town', "King's Cross", 'London Bridge',
  'Tower of London', 'Shoreditch', 'Southwark', 'Battersea', 'Greenwich',
  'Blackfriars', 'Fleet Street', 'Old Bank', 'Holborn', 'Farringdon',
  'Barnsbury', 'Canonbury', 'Cloudesley', 'Essex Road', 'Angel',
  'Hampstead', 'Spaniards Road', 'Well Walk', 'Highgate', 'Parliament Hill',
  'Richmond Green', 'Richmond Hill', 'Thames Side', 'Twickenham', 'Teddington',
  'Kensington', 'Campden Hill', 'Ladbroke Grove', 'Notting Hill', 'Portobello',
  'Broadway Market', 'London Fields', 'Homerton', 'Hackney Road', 'Columbia Road',
  'Deptford', 'Brookmill', 'Greenwich', 'King William Walk', 'Park Vista',
  'Putney', 'Putney Bridge', 'Wandsworth Riverside', 'Wandsworth Town', 'Wandsworth Common',
  'Chiswick', 'Chiswick High Road', 'Turnham Green', 'Hammersmith', 'Upper Mall',
  'Wapping', 'Wapping Wall', 'Wapping High Street', 'Limehouse', 'Rotherhithe',
];

export const CARTOON_MAPS: CartoonMap[] = LONDON_MAPS.map((map, mapIndex) => ({
  ...map,
  levels: map.levels.map((level, levelIndex) => {
    const artworkLevelNumber = (mapIndex * 5) + levelIndex + 1;
    const artworkLevelId = String(artworkLevelNumber).padStart(2, '0');

    return {
      ...level,
      name: ILLUSTRATED_LEVEL_NAMES[artworkLevelNumber - 1] || level.name,
      artworkLevelNumber,
      mapArtwork: artworkLevelNumber <= 20
        ? `level-${artworkLevelId}-map-no-route.webp`
        : map.mapArtwork,
      coverArtwork: `level-${String(artworkLevelNumber <= 20 ? artworkLevelNumber : ((artworkLevelNumber - 21) % 14) + 21).padStart(2, '0')}-cover.webp`,
    };
  }),
}));

// Default shop bundles for buying fake money and lives
export const SHOP_BUNDLES: ShopBundle[] = [
  {
    id: 'free_daily_keg',
    title: 'Daily Tavern Rations',
    subtitle: 'Free daily bonus from the Landlord!',
    icon: '🎁',
    type: 'mega_bundle',
    fakePriceLabel: 'FREE / Tap to Claim',
    rewardCoins: 250,
    rewardLives: 3,
    badge: 'DAILY GIFT',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'buy_heart_single',
    title: 'Single Pint of Life',
    subtitle: 'Restores +1 Heart instantly',
    icon: '❤️',
    type: 'lives_refill',
    coinsCost: 60,
    fakePriceLabel: '60 Pub Bucks 🪙',
    rewardCoins: 0,
    rewardLives: 1,
    color: 'from-rose-600 to-red-700',
  },
  {
    id: 'buy_heart_full',
    title: 'Full Tavern Vitality Pack',
    subtitle: 'Completely refills all 3 Hearts ❤️❤️❤️',
    icon: '💖',
    type: 'lives_refill',
    coinsCost: 140,
    fakePriceLabel: '140 Pub Bucks 🪙',
    rewardCoins: 0,
    rewardLives: 3,
    badge: 'POPULAR',
    color: 'from-pink-600 to-rose-700',
  },
  {
    id: 'coins_pouch',
    title: 'Pocket of Copper Pennies',
    subtitle: 'Get 500 fresh shiny Pub Bucks',
    icon: '🪙',
    type: 'coins_pack',
    fakePriceLabel: '$0.99 (Fake Money)',
    rewardCoins: 500,
    rewardLives: 0,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'bundle_landlord_satchel',
    title: 'The Landlord’s Special Satchel',
    subtitle: '1,500 Pub Bucks + 3 Hearts Refill',
    icon: '🎒',
    type: 'mega_bundle',
    fakePriceLabel: '$2.99 (Play Money)',
    rewardCoins: 1500,
    rewardLives: 3,
    badge: 'BEST VALUE',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'bundle_kings_vault',
    title: 'The King’s Tavern Vault',
    subtitle: '5,000 Pub Bucks + Max Heart Refill + VIP Golden Crown',
    icon: '👑',
    type: 'mega_bundle',
    fakePriceLabel: '$4.99 (Play Money)',
    rewardCoins: 5000,
    rewardLives: 3,
    badge: 'MEGA BUNDLE',
    color: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'bundle_galactic_treasury',
    title: 'Galactic Asteroid Treasury',
    subtitle: '15,000 Pub Bucks + Unlimited Play Status',
    icon: '🪐',
    type: 'mega_bundle',
    fakePriceLabel: '$9.99 (Play Money)',
    rewardCoins: 15000,
    rewardLives: 3,
    badge: 'WHALE BUNDLE',
    color: 'from-cyan-500 via-blue-600 to-purple-600',
  },
];

// Helper to load/save user progression in localStorage
const STORAGE_KEY = 'cartoon_pubquiz_solo_progression_v2';

// Cartoon pub regulars appearing on the map
export const MAP_REGULAR_PLAYERS: Record<string, { name: string; avatar: string; levelNumber: number; statusQuote: string; score: number; color: string; favoriteDrink: string }[]> = {
  thames_riverside_crawl: [
    { name: 'Borough Bob', avatar: '🍺', levelNumber: 2, statusQuote: 'Just finished a pint at The George Inn!', score: 320, color: '#F59E0B', favoriteDrink: "Harvey's Sussex Best" },
    { name: 'Bankside Barney', avatar: '⚓', levelNumber: 3, statusQuote: 'Watching the Thames tide at The Anchor!', score: 510, color: '#0284C7', favoriteDrink: 'Bankside River Gold' },
    { name: 'Rotherhithe Rita', avatar: '⛵', levelNumber: 4, statusQuote: 'Fish & chips on The Mayflower river deck!', score: 740, color: '#10B981', favoriteDrink: 'Mayflower Amber Ale' },
    { name: 'Deptford Dave', avatar: '🐕', levelNumber: 5, statusQuote: 'Waiting at The Dog & Bell with a pickled egg!', score: 980, color: '#8B5CF6', favoriteDrink: 'Hand-Pulled Dark Mild' },
  ],
  village_pub: [
    { name: 'Borough Bob', avatar: '🍺', levelNumber: 2, statusQuote: 'Just finished a pint at The George Inn!', score: 320, color: '#F59E0B', favoriteDrink: "Harvey's Sussex Best" },
    { name: 'Bankside Barney', avatar: '⚓', levelNumber: 3, statusQuote: 'Watching the Thames tide at The Anchor!', score: 510, color: '#0284C7', favoriteDrink: 'Bankside River Gold' },
    { name: 'Rotherhithe Rita', avatar: '⛵', levelNumber: 4, statusQuote: 'Fish & chips on The Mayflower river deck!', score: 740, color: '#10B981', favoriteDrink: 'Mayflower Amber Ale' },
    { name: 'Deptford Dave', avatar: '🐕', levelNumber: 5, statusQuote: 'Waiting at The Dog & Bell with a pickled egg!', score: 980, color: '#8B5CF6', favoriteDrink: 'Hand-Pulled Dark Mild' },
  ],
  bermondsey_peckham_trail: [
    { name: 'Tabard Tom', avatar: '🌳', levelNumber: 2, statusQuote: 'Starting with a proper pint at The Royal Oak!', score: 290, color: '#EA580C', favoriteDrink: "Harvey's Sussex Best" },
    { name: 'Archie the Brewer', avatar: '🚂', levelNumber: 3, statusQuote: 'Walking the Bermondsey Beer Mile arches!', score: 480, color: '#16A34A', favoriteDrink: 'Druid St Hazy IPA' },
    { name: 'Peckham Pip', avatar: '🎬', levelNumber: 4, statusQuote: 'Catching an indie film at The Montpelier!', score: 710, color: '#D97706', favoriteDrink: 'Brick Brewery Pils' },
    { name: 'Nunhead Ned', avatar: '👑', levelNumber: 5, statusQuote: 'Defending the quiz crown at The Old Nun’s Head!', score: 1040, color: '#8B5CF6', favoriteDrink: 'Nunhead Special Ale' },
  ],
  south_west_heritage_crawl: [
    { name: 'Kennington Keith', avatar: '🏏', levelNumber: 2, statusQuote: 'Boules and bitter in Cleaver Square!', score: 340, color: '#0D9488', favoriteDrink: 'Kennington Gold' },
    { name: 'Brixton Belle', avatar: '🎺', levelNumber: 3, statusQuote: 'Cosy by the fire at The Trinity Arms!', score: 580, color: '#D97706', favoriteDrink: 'Reliance Pale Ale' },
    { name: 'Herne Hill Harry', avatar: '🌙', levelNumber: 4, statusQuote: 'Live acoustic sets at The Half Moon!', score: 820, color: '#0284C7', favoriteDrink: 'Brockwell Bitter' },
    { name: 'Dulwich Dame', avatar: '👑', levelNumber: 5, statusQuote: 'Sunday roast champion at The Crown & Greyhound!', score: 1150, color: '#F59E0B', favoriteDrink: 'Dulwich Reserve Ale' },
  ],
};

// Merges default CARTOON_MAPS with AI dynamic maps
export function getAllMaps(prog: SoloProgression): CartoonMap[] {
  const dynamic = prog.dynamicMaps || [];
  const mapIds = new Set(CARTOON_MAPS.map((m) => m.id));
  const uniqueDynamic = dynamic.filter((m) => !mapIds.has(m.id));
  return [...CARTOON_MAPS, ...uniqueDynamic];
}

// Check & replenish life every 1 hour (3600s) if lives < maxLives
export function checkAndReplenishLives(prog: SoloProgression): { progression: SoloProgression; regenerated: boolean } {
  if (prog.lives >= prog.maxLives) {
    if (prog.nextHeartRegenTimestamp) {
      return {
        progression: { ...prog, nextHeartRegenTimestamp: undefined },
        regenerated: false,
      };
    }
    return { progression: prog, regenerated: false };
  }

  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000;

  // If no regen timer set yet, start 1-hour countdown
  if (!prog.nextHeartRegenTimestamp) {
    return {
      progression: {
        ...prog,
        nextHeartRegenTimestamp: now + ONE_HOUR_MS,
      },
      regenerated: false,
    };
  }

  // If time has passed
  if (now >= prog.nextHeartRegenTimestamp) {
    const elapsedSinceDue = now - prog.nextHeartRegenTimestamp;
    const hoursEarned = 1 + Math.floor(elapsedSinceDue / ONE_HOUR_MS);
    const newLives = Math.min(prog.maxLives, prog.lives + hoursEarned);

    let nextTimestamp: number | undefined;
    if (newLives < prog.maxLives) {
      // Calculate remaining time for the subsequent heart
      const remainder = elapsedSinceDue % ONE_HOUR_MS;
      nextTimestamp = now + (ONE_HOUR_MS - remainder);
    } else {
      nextTimestamp = undefined;
    }

    return {
      progression: {
        ...prog,
        lives: newLives,
        nextHeartRegenTimestamp: nextTimestamp,
      },
      regenerated: true,
    };
  }

  return { progression: prog, regenerated: false };
}

export function getInitialSoloProgression(): SoloProgression {
  if (typeof window === 'undefined') {
    return createDefaultProgression();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('cartoon_pubquiz_solo_progression_v1');
    if (raw) {
      const parsed = JSON.parse(raw) as SoloProgression;
      const initialMap = parsed.currentMapId === 'village_pub' || !parsed.currentMapId
        ? 'thames_riverside_crawl'
        : parsed.currentMapId;

      const unlocked = parsed.unlockedMaps && parsed.unlockedMaps.length > 0 
        ? parsed.unlockedMaps.map(m => m === 'village_pub' ? 'thames_riverside_crawl' : m)
        : ['thames_riverside_crawl'];
      
      if (!unlocked.includes('thames_riverside_crawl')) {
        unlocked.unshift('thames_riverside_crawl');
      }

      const initial = {
        coins: typeof parsed.coins === 'number' ? parsed.coins : 350,
        lives: typeof parsed.lives === 'number' ? Math.max(0, parsed.lives) : 3,
        maxLives: parsed.maxLives || 3,
        nextHeartRegenTimestamp: parsed.nextHeartRegenTimestamp,
        unlockedMaps: unlocked,
        currentMapId: initialMap,
        completedLevels: parsed.completedLevels || {},
        totalStars: typeof parsed.totalStars === 'number' ? parsed.totalStars : 0,
        purchasedBundles: parsed.purchasedBundles || [],
        lastDailyBonus: parsed.lastDailyBonus,
        dynamicMaps: parsed.dynamicMaps || [],
        userProfile: parsed.userProfile,
      };

      const { progression: checked } = checkAndReplenishLives(initial);
      return checked;
    }
  } catch (e) {
    console.warn('Error reading solo progression, resetting to default', e);
  }

  return createDefaultProgression();
}

export function saveSoloProgression(prog: SoloProgression) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
  } catch (e) {
    console.warn('Error saving solo progression to localStorage', e);
  }
}

function createDefaultProgression(): SoloProgression {
  return {
    coins: 350, // Starting bonus bankroll so player can explore shop!
    lives: 3,
    maxLives: 3,
    unlockedMaps: ['thames_riverside_crawl'],
    currentMapId: 'thames_riverside_crawl',
    completedLevels: {},
    totalStars: 0,
    purchasedBundles: [],
    dynamicMaps: [],
  };
}
