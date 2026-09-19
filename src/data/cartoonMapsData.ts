import { CartoonMap, ShopBundle, SoloProgression } from '../types';

export const CARTOON_MAPS: CartoonMap[] = [
  {
    id: 'thames_riverside_crawl',
    name: 'The Thames Riverside Crawl',
    crawlRouteName: 'Borough to Greenwich Historic River Trail',
    subtitle: '5 Historic Thames Taverns in Real Geographic Order (4.3 Miles)',
    icon: '🍺',
    themeColor: '#D97706',
    accentColor: '#0284C7',
    bgGradient: 'from-amber-100 via-amber-50 to-stone-100',
    cardBg: 'bg-amber-100/90 border-amber-800',
    pathColor: '#B45309',
    stoneColor: 'from-amber-400 to-yellow-500',
    requiredStars: 0,
    totalDistance: '4.3 Miles (approx. 1h 25m walk)',
    boroughs: 'Southwark ➔ Lewisham ➔ Royal Greenwich',
    startArea: 'Borough High St, SE1',
    endArea: 'Royal Greenwich, SE10',
    description: 'Walk the historic South London river path from London Bridge coaching inns past Samuel Pepys’s tavern to Greenwich Meridian.',
    levels: [
      {
        id: 'c1_george',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 1,
        name: 'The George Inn',
        pubName: 'The George Inn',
        address: '77 Borough High St, Southwark',
        postcode: 'SE1 1NH',
        walkingTime: 'Start of Crawl (0.0 mi)',
        distanceMiles: 0.0,
        category: 'Borough Lore & Charles Dickens',
        difficulty: 'easy',
        questionCount: 5,
        coinReward: 150,
        icon: '🏛️',
        description: 'London’s only surviving galleried coaching inn (1676). Dickens drank here and Shakespeare played in the cobbled yard.',
        funFact: 'Charles Dickens frequented the coffee room and mentioned The George in Little Dorrit. The coaching yard once handled stagecoaches to Kent!',
        recommendedPint: 'Harvey’s Sussex Best Cask Bitter & Scotch Egg 🍺',
        requiredStars: 0,
      },
      {
        id: 'c1_anchor',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 2,
        name: 'The Anchor Bankside',
        pubName: 'The Anchor Bankside',
        address: '34 Park St, Bankside',
        postcode: 'SE1 9EF',
        walkingTime: '8 min walk via Clink St (0.4 mi)',
        distanceMiles: 0.4,
        category: 'The Great Fire & Bankside Theatres',
        difficulty: 'easy',
        questionCount: 5,
        coinReward: 180,
        icon: '⚓',
        description: 'Historic riverside tavern where Samuel Pepys watched the 1666 Great Fire of London across the river.',
        funFact: 'Samuel Pepys took refuge here in 1666 and wrote about watching a "most horrid malicious bloody flame" consume London.',
        recommendedPint: 'Bankside River Gold & Crispy Whitebait 🐟',
        requiredStars: 1,
      },
      {
        id: 'c1_mayflower',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 3,
        name: 'The Mayflower',
        pubName: 'The Mayflower',
        address: '117 Rotherhithe St, Rotherhithe',
        postcode: 'SE16 4NF',
        walkingTime: '28 min walk via Bermondsey Wall (1.4 mi)',
        distanceMiles: 1.8,
        category: 'Pilgrims, Maritime Lore & Thames Secrets',
        difficulty: 'medium',
        questionCount: 5,
        coinReward: 240,
        icon: '⛵',
        description: 'Oldest pub on the Thames (1620). Captain Christopher Jones moored the Mayflower ship right outside the tavern jetty.',
        funFact: 'The Mayflower captain is buried right across the lane at St. Mary’s Church. The pub is licensed to sell UK and US postage stamps!',
        recommendedPint: 'Mayflower Scurvy Ale & Fish and Chips 🍟',
        requiredStars: 3,
      },
      {
        id: 'c1_dog_bell',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 4,
        name: 'The Dog & Bell',
        pubName: 'The Dog & Bell',
        address: '116 Prince St, Deptford',
        postcode: 'SE8 3JD',
        walkingTime: '30 min walk past Greenland Dock (1.6 mi)',
        distanceMiles: 3.4,
        category: 'South London Craft Brewing & Docklands',
        difficulty: 'hard',
        questionCount: 5,
        coinReward: 320,
        icon: '🐕',
        description: 'Legendary hidden South London boozer tucked in Deptford cobblestones, celebrated for pristine real ales and bar games.',
        funFact: 'Multiple-time South London Pub of the Year; renowned for its real pub pickle jar selection and authentic bar billiards.',
        recommendedPint: 'Hand-Pulled Dark Mild & Giant Pickled Onion 🥚',
        requiredStars: 6,
      },
      {
        id: 'c1_trafalgar',
        mapThemeId: 'thames_riverside_crawl',
        levelNumber: 5,
        name: 'The Trafalgar Tavern',
        pubName: 'The Trafalgar Tavern',
        address: 'Park Row, Royal Greenwich',
        postcode: 'SE10 9NW',
        walkingTime: '18 min walk across Deptford Creek (0.9 mi)',
        distanceMiles: 4.3,
        category: 'Greenwich Meridian, Navies & Grand Pub Finale',
        difficulty: 'expert',
        questionCount: 5,
        coinReward: 500,
        icon: '👑',
        description: 'Grand 1837 Victorian river king on the Greenwich Meridian. Host to Prime Ministers’ historic Whitebait Feasts.',
        funFact: 'William Gladstone, Charles Dickens, and Victorian cabinet ministers held the annual Parliamentary Whitebait Dinners here overlooking the Thames!',
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
