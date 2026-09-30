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
}): CartoonMap => ({
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
  mapArtwork: `map-backgrounds/${id}.webp`,
  seasonalArtwork: {
    spring: { day: `map-backgrounds/${id}.webp`, night: `map-backgrounds/${id}.webp` },
    summer: { day: `map-backgrounds/${id}.webp`, night: `map-backgrounds/${id}.webp` },
    autumn: { day: `map-backgrounds/${id}.webp`, night: `map-backgrounds/${id}.webp` },
    winter: { day: `map-backgrounds/${id}.webp`, night: `map-backgrounds/${id}.webp` },
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

// The world now progresses clockwise across London after the opening Thames map.
const LONDON_MAPS: CartoonMap[] = [
  LEGACY_CARTOON_MAPS[0],
  WEST_LONDON_STAGE,
  NORTH_LONDON_STAGE,
  EAST_LONDON_STAGE,
];

// The illustrated level covers and map backdrops use one continuous 1–20
// sequence across the four five-stop routes. Keep each pub's real name in
// `pubName`, while `name` is the player-facing level area shown on the art.
const ILLUSTRATED_LEVEL_NAMES = [
  'Waterloo', 'Brixton', 'Gipsy Hill', 'Crystal Palace', 'Westminster',
  'Covent Garden', 'Leicester Square', 'Soho', 'Mayfair', 'Hyde Park',
  'Trafalgar Square', 'The Strand', 'Camden Town', "King's Cross", 'London Bridge',
  'Tower of London', 'Shoreditch', 'Southwark', 'Battersea', 'Greenwich',
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
      mapArtwork: `level-${artworkLevelId}-map-no-route.webp`,
      coverArtwork: `level-${artworkLevelId}-cover.webp`,
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
