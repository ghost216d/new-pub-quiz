import { Round, CategoryVaultItem, Question } from '../types';

export const CATEGORY_VAULT: CategoryVaultItem[] = [
  { id: 'pub_classics', name: 'Pub Classics & Beer Lore', icon: '🍺', description: 'Traditional pub trivia, brews, and bar games', color: '#F59E0B' },
  { id: 'picture_rebus', name: 'Emoji Picture Puzzles', icon: '🧩', description: 'Colourful rebuses, visual clues, and picture puzzles', color: '#EC4899' },
  { id: 'photo_round', name: 'Photo Round: World Landmarks', icon: '📸', description: 'Identify famous places from full-colour photographs', color: '#8B5CF6' },
  { id: 'world_flags', name: 'World Flags', icon: '🏳️', description: 'Identify countries from their national flags', color: '#0EA5E9' },
  { id: 'animals_nature', name: 'Animals & Nature', icon: '🦊', description: 'Wildlife facts and animal adaptations', color: '#22C55E' },
  { id: 'movies_tv', name: 'Binge-Worthy TV & Movies', icon: '🍿', description: 'Blockbusters, iconic quotes, and sitcom legends', color: '#3B82F6' },
  { id: 'science_nature', name: 'Wacky Science & Nature', icon: '🧪', description: 'Bizarre animal facts, outer space, and elements', color: '#10B981' },
  { id: 'history_geography', name: 'World Atlas & Odd History', icon: '🌍', description: 'Strange historical quirks and world geography', color: '#EF4444' },
];

export const SOLO_PICTURE_QUESTIONS: Question[] = [
  {
    "id": "pic_1",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐘 + 🛋️ + 🤐",
    "prompt": "Which idiom is suggested by these three clues?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "The elephant in the room",
      "A storm in a teacup",
      "Let sleeping dogs lie",
      "A bull in a china shop"
    ],
    "correctAnswer": "The elephant in the room",
    "acceptableAnswers": [
      "the elephant in the room"
    ],
    "explanation": "The elephant is in the room, while the zipped mouth suggests everyone is avoiding the obvious subject.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "pic_2",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🌧️ + 🐱 + 🐶",
    "prompt": "Which phrase describes this unusual weather?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Raining cats and dogs",
      "Every cloud has a silver lining",
      "A drop in the ocean",
      "Come rain or shine"
    ],
    "correctAnswer": "Raining cats and dogs",
    "acceptableAnswers": [
      "raining cats and dogs"
    ],
    "explanation": "The two animals falling with the rain form the idiom “raining cats and dogs”.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_3",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐦 + ✋ + 2️⃣ + 🌳",
    "prompt": "Which proverb is pictured?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "A bird in the hand is worth two in the bush",
      "Two birds with one stone",
      "The early bird catches the worm",
      "Birds of a feather flock together"
    ],
    "correctAnswer": "A bird in the hand is worth two in the bush",
    "acceptableAnswers": [
      "a bird in the hand is worth two in the bush"
    ],
    "explanation": "One bird is already in a hand; two more are waiting in the bush.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_4",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐺 + 🐑 + 🧥",
    "prompt": "Which expression is this rebus showing?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "A wolf in sheep’s clothing",
      "A wolf at the door",
      "Separate the sheep from the goats",
      "Count your chickens before they hatch"
    ],
    "correctAnswer": "A wolf in sheep’s clothing",
    "acceptableAnswers": [
      "a wolf in sheep’s clothing"
    ],
    "explanation": "The wolf is disguised by wearing a sheep’s coat.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_5",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🍎 + 👁️ + ❤️",
    "prompt": "Which affectionate expression is represented?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "The apple of someone’s eye",
      "As easy as pie",
      "A taste of your own medicine",
      "The icing on the cake"
    ],
    "correctAnswer": "The apple of someone’s eye",
    "acceptableAnswers": [
      "the apple of someone’s eye"
    ],
    "explanation": "The apple is placed with an eye and a heart: the apple of someone’s eye.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "pic_6",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐟 + 🚶 + 🏜️",
    "prompt": "Which saying best matches these clues?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "A fish out of water",
      "There are plenty more fish in the sea",
      "Like a duck to water",
      "A watched pot never boils"
    ],
    "correctAnswer": "A fish out of water",
    "acceptableAnswers": [
      "a fish out of water"
    ],
    "explanation": "The fish is walking through a dry desert, far from its natural element.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_7",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "👂 + 🍇 + 🗣️",
    "prompt": "Which phrase is hinted at?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Heard it through the grapevine",
      "Turn over a new leaf",
      "Sour grapes",
      "The apple doesn’t fall far from the tree"
    ],
    "correctAnswer": "Heard it through the grapevine",
    "acceptableAnswers": [
      "heard it through the grapevine"
    ],
    "explanation": "An ear listens to news travelling through a grapevine.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_8",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🪨 + 🧱 + 😓",
    "prompt": "Which difficult situation does this clue describe?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Between a rock and a hard place",
      "Rock the boat",
      "Hit rock bottom",
      "A hard nut to crack"
    ],
    "correctAnswer": "Between a rock and a hard place",
    "acceptableAnswers": [
      "between a rock and a hard place"
    ],
    "explanation": "The person is squeezed between a rock and a hard place.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_9",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐈 + 🎒 + 🛍️",
    "prompt": "Which idiom is pictured?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Let the cat out of the bag",
      "Curiosity killed the cat",
      "A bag of tricks",
      "Put the cart before the horse"
    ],
    "correctAnswer": "Let the cat out of the bag",
    "acceptableAnswers": [
      "let the cat out of the bag"
    ],
    "explanation": "A cat escaping from a bag reveals a hidden secret.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "pic_10",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐴 + ⚰️ + 🔨",
    "prompt": "Which expression is this rebus illustrating?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Flogging a dead horse",
      "Hold your horses",
      "Straight from the horse’s mouth",
      "Back the wrong horse"
    ],
    "correctAnswer": "Flogging a dead horse",
    "acceptableAnswers": [
      "flogging a dead horse"
    ],
    "explanation": "The horse is dead, so continuing to beat it is pointless.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_11",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🥚 + 🐚 + 🚶",
    "prompt": "Which phrase is represented by the careful footsteps?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Walking on eggshells",
      "A nest egg",
      "Don’t put all your eggs in one basket",
      "Egg on your face"
    ],
    "correctAnswer": "Walking on eggshells",
    "acceptableAnswers": [
      "walking on eggshells"
    ],
    "explanation": "The person has to tread carefully over fragile eggshells.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_12",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "💰 + 🌳 + 🚫",
    "prompt": "Which reminder is pictured?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Money doesn’t grow on trees",
      "Money talks",
      "A cash cow",
      "The grass is always greener"
    ],
    "correctAnswer": "Money doesn’t grow on trees",
    "acceptableAnswers": [
      "money doesn’t grow on trees"
    ],
    "explanation": "The no symbol shows that money is not something you can pick from a tree.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_13",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🧊 + 🪓 + 🤝",
    "prompt": "Which social phrase is suggested?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Break the ice",
      "Cold shoulder",
      "Thin ice",
      "Water under the bridge"
    ],
    "correctAnswer": "Break the ice",
    "acceptableAnswers": [
      "break the ice"
    ],
    "explanation": "The axe breaks the ice before the two people shake hands.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "pic_14",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐦 + 🪨 + 2️⃣ 🎯",
    "prompt": "Which idiom means achieving two things with one action?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Kill two birds with one stone",
      "A bird in the hand is worth two in the bush",
      "The early bird catches the worm",
      "Stone-cold sober"
    ],
    "correctAnswer": "Kill two birds with one stone",
    "acceptableAnswers": [
      "kill two birds with one stone"
    ],
    "explanation": "One stone is aimed at two birds.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_15",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐍 + 🌱 + 👀",
    "prompt": "Which warning does this clue represent?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "A snake in the grass",
      "A green thumb",
      "The grass is always greener",
      "A slippery slope"
    ],
    "correctAnswer": "A snake in the grass",
    "acceptableAnswers": [
      "a snake in the grass"
    ],
    "explanation": "The snake is hidden among the grass, suggesting a concealed threat.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_16",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🧅 + 😭 + 🔪",
    "prompt": "Which everyday phrase is pictured?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Cutting onions makes you cry",
      "Crying over spilt milk",
      "Peeling away the layers",
      "A tough nut to crack"
    ],
    "correctAnswer": "Cutting onions makes you cry",
    "acceptableAnswers": [
      "cutting onions makes you cry"
    ],
    "explanation": "The knife is cutting an onion and the person is crying.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_17",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🪞 + 🐒 + 🎭",
    "prompt": "Which phrase best matches the clue?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Monkey see, monkey do",
      "The elephant never forgets",
      "A leopard can’t change its spots",
      "When pigs fly"
    ],
    "correctAnswer": "Monkey see, monkey do",
    "acceptableAnswers": [
      "monkey see, monkey do"
    ],
    "explanation": "The monkey copies what it sees in the mirror.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "pic_18",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐝 + 🦵 + 👑",
    "prompt": "Which old-fashioned compliment is represented?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "The bee’s knees",
      "Busy as a bee",
      "A social butterfly",
      "As strong as an ox"
    ],
    "correctAnswer": "The bee’s knees",
    "acceptableAnswers": [
      "the bee’s knees"
    ],
    "explanation": "A bee is pointing to its knees, the phrase for something excellent.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_19",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🐕 + 🦴 + 🛏️",
    "prompt": "Which saying is pictured?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Let sleeping dogs lie",
      "Barking up the wrong tree",
      "Every dog has its day",
      "A dog’s life"
    ],
    "correctAnswer": "Let sleeping dogs lie",
    "acceptableAnswers": [
      "let sleeping dogs lie"
    ],
    "explanation": "The dog is asleep beside a bone, and the phrase advises leaving it alone.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "pic_20",
    "roundNumber": 1,
    "category": "Emoji Picture Puzzles",
    "pictureClue": "🕰️ + 🪰 + 🎉",
    "prompt": "Which saying about time and enjoyment is suggested?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Time flies when you’re having fun",
      "A stitch in time saves nine",
      "Better late than never",
      "Around the clock"
    ],
    "correctAnswer": "Time flies when you’re having fun",
    "acceptableAnswers": [
      "time flies when you’re having fun"
    ],
    "explanation": "The clock has wings and the party represents having fun.",
    "points": 20,
    "timeLimitSec": 40
  }
];

export const SOLO_PHOTO_QUESTIONS: Question[] = [
  {
    "id": "photo_tower_bridge_identity",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/tower-bridge.webp",
    "prompt": "Which London bridge in this photograph has two high towers linked by walkways?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Tower Bridge",
      "Westminster Bridge",
      "Millennium Bridge",
      "Albert Bridge"
    ],
    "correctAnswer": "Tower Bridge",
    "acceptableAnswers": [
      "tower bridge"
    ],
    "explanation": "Tower Bridge is recognisable by its two towers and upper walkways.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "photo_tower_bridge_river",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/tower-bridge.webp",
    "prompt": "Which river runs beneath the bridge shown here?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "River Thames",
      "River Seine",
      "River Clyde",
      "River Mersey"
    ],
    "correctAnswer": "River Thames",
    "acceptableAnswers": [
      "river thames"
    ],
    "explanation": "Tower Bridge crosses the River Thames in central London.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "photo_tower_bridge_mechanism",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/tower-bridge.webp",
    "prompt": "What is the name for the type of bridge whose central roadway lifts for ships?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Bascule bridge",
      "Suspension bridge",
      "Aqueduct",
      "Cantilever bridge"
    ],
    "correctAnswer": "Bascule bridge",
    "acceptableAnswers": [
      "bascule bridge"
    ],
    "explanation": "Tower Bridge is a bascule bridge: its road bascules lift to let ships pass.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "photo_edinburgh_castle_city",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/edinburgh-castle.webp",
    "prompt": "Which Scottish capital is home to the fortress in this photograph?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Edinburgh",
      "Glasgow",
      "Aberdeen",
      "Inverness"
    ],
    "correctAnswer": "Edinburgh",
    "acceptableAnswers": [
      "edinburgh"
    ],
    "explanation": "Edinburgh Castle stands above Scotland’s capital city.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "photo_edinburgh_castle_rock",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/edinburgh-castle.webp",
    "prompt": "The fortress shown here stands on which famous volcanic outcrop?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Castle Rock",
      "Arthur’s Seat",
      "Calton Hill",
      "Salisbury Crags"
    ],
    "correctAnswer": "Castle Rock",
    "acceptableAnswers": [
      "castle rock"
    ],
    "explanation": "Edinburgh Castle sits on Castle Rock, an extinct volcanic plug.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "photo_edinburgh_castle_festival",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/edinburgh-castle.webp",
    "prompt": "Which annual arts festival shares its name with the city of this castle?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Edinburgh Festival Fringe",
      "Highland Games",
      "Royal Welsh Show",
      "Celtic Connections"
    ],
    "correctAnswer": "Edinburgh Festival Fringe",
    "acceptableAnswers": [
      "edinburgh festival fringe"
    ],
    "explanation": "The Edinburgh Festival Fringe takes place in the city each summer.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "photo_eiffel_tower_city",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/eiffel-tower.webp",
    "prompt": "Which city skyline is dominated by the iron tower shown here?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Paris",
      "Lyon",
      "Brussels",
      "Vienna"
    ],
    "correctAnswer": "Paris",
    "acceptableAnswers": [
      "paris"
    ],
    "explanation": "The Eiffel Tower is one of the best-known landmarks of Paris.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "photo_eiffel_tower_river",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/eiffel-tower.webp",
    "prompt": "Which river flows through the city pictured with this landmark?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "River Seine",
      "River Loire",
      "River Rhône",
      "River Danube"
    ],
    "correctAnswer": "River Seine",
    "acceptableAnswers": [
      "river seine"
    ],
    "explanation": "The River Seine passes through Paris near the Eiffel Tower.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "photo_eiffel_tower_exhibition",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/eiffel-tower.webp",
    "prompt": "For which 19th-century event was the Eiffel Tower originally built?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "1889 Exposition Universelle",
      "1900 Olympic Games",
      "1867 World’s Fair",
      "1910 Paris Air Show"
    ],
    "correctAnswer": "1889 Exposition Universelle",
    "acceptableAnswers": [
      "1889 exposition universelle"
    ],
    "explanation": "It was built for the 1889 Exposition Universelle marking 100 years since the French Revolution.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "photo_colosseum_city",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/colosseum.webp",
    "prompt": "Which Italian city is home to the oval amphitheatre pictured here?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Rome",
      "Naples",
      "Florence",
      "Athens"
    ],
    "correctAnswer": "Rome",
    "acceptableAnswers": [
      "rome"
    ],
    "explanation": "The Colosseum is in Rome, Italy.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "photo_colosseum_name",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/colosseum.webp",
    "prompt": "What is the usual English name of the ancient amphitheatre shown here?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "The Colosseum",
      "The Pantheon",
      "Circus Maximus",
      "Theatre of Marcellus"
    ],
    "correctAnswer": "The Colosseum",
    "acceptableAnswers": [
      "the colosseum"
    ],
    "explanation": "The Colosseum is the large oval amphitheatre in Rome.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "photo_colosseum_emperor",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/colosseum.webp",
    "prompt": "Which Flavian emperor began construction of the amphitheatre shown here?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Vespasian",
      "Nero",
      "Hadrian",
      "Augustus"
    ],
    "correctAnswer": "Vespasian",
    "acceptableAnswers": [
      "vespasian"
    ],
    "explanation": "Emperor Vespasian began construction around AD 70–72; Titus opened it.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "photo_taj_mahal_city",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/taj-mahal.webp",
    "prompt": "In which Indian city is the white marble mausoleum shown here?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Agra",
      "Delhi",
      "Jaipur",
      "Lucknow"
    ],
    "correctAnswer": "Agra",
    "acceptableAnswers": [
      "agra"
    ],
    "explanation": "The Taj Mahal stands in Agra, in northern India.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "photo_taj_mahal_emperor",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/taj-mahal.webp",
    "prompt": "Which Mughal emperor commissioned the building pictured here?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Shah Jahan",
      "Akbar",
      "Aurangzeb",
      "Babur"
    ],
    "correctAnswer": "Shah Jahan",
    "acceptableAnswers": [
      "shah jahan"
    ],
    "explanation": "Shah Jahan commissioned the Taj Mahal in memory of Mumtaz Mahal.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "photo_taj_mahal_river",
    "roundNumber": 1,
    "category": "Photo Round: World Landmarks",
    "imageUrl": "photo-round/taj-mahal.webp",
    "prompt": "Which river flows beside the gardens of this monument?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Yamuna",
      "Ganges",
      "Indus",
      "Brahmaputra"
    ],
    "correctAnswer": "Yamuna",
    "acceptableAnswers": [
      "yamuna"
    ],
    "explanation": "The Taj Mahal is built beside the Yamuna River.",
    "points": 20,
    "timeLimitSec": 40
  }
];

export const SOLO_FLAG_QUESTIONS: Question[] = [
  {
    "id": "flag_1",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇯🇵",
    "prompt": "Which country uses the red sun disc on a plain white flag?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Japan",
      "Bangladesh",
      "Palau",
      "South Korea"
    ],
    "correctAnswer": "Japan",
    "acceptableAnswers": [
      "japan"
    ],
    "explanation": "Japan’s flag has one red disc on a white field.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_2",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇵🇹",
    "prompt": "A green and red flag with a coat of arms belongs to which country?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Portugal",
      "Spain",
      "Italy",
      "Mexico"
    ],
    "correctAnswer": "Portugal",
    "acceptableAnswers": [
      "portugal"
    ],
    "explanation": "Portugal’s flag is green and red with its coat of arms on the dividing line.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_3",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇰🇷",
    "prompt": "Which country’s white flag shows a red-and-blue taegeuk and four black trigrams?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "South Korea",
      "Japan",
      "North Korea",
      "Taiwan"
    ],
    "correctAnswer": "South Korea",
    "acceptableAnswers": [
      "south korea"
    ],
    "explanation": "South Korea’s white flag has a red-and-blue taegeuk with four black trigrams.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_4",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇯🇲",
    "prompt": "Which Caribbean country has a gold diagonal cross between green and black triangles?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Jamaica",
      "South Africa",
      "Kenya",
      "Tanzania"
    ],
    "correctAnswer": "Jamaica",
    "acceptableAnswers": [
      "jamaica"
    ],
    "explanation": "Jamaica’s flag has a gold diagonal cross with green and black triangles.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_5",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇬🇷",
    "prompt": "Which country’s flag combines a white cross with nine blue-and-white stripes?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Greece",
      "Finland",
      "Uruguay",
      "Argentina"
    ],
    "correctAnswer": "Greece",
    "acceptableAnswers": [
      "greece"
    ],
    "explanation": "Greece uses blue and white stripes and a white cross in the canton.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_6",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇨🇭",
    "prompt": "Which country has a square red flag with a white equal-armed cross?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Switzerland",
      "Denmark",
      "Georgia",
      "Tonga"
    ],
    "correctAnswer": "Switzerland",
    "acceptableAnswers": [
      "switzerland"
    ],
    "explanation": "Switzerland’s flag is a white equal-armed cross on a red square.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_7",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇧🇷",
    "prompt": "Which South American country has a yellow diamond and blue globe on green?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Brazil",
      "Argentina",
      "Uruguay",
      "Venezuela"
    ],
    "correctAnswer": "Brazil",
    "acceptableAnswers": [
      "brazil"
    ],
    "explanation": "Brazil’s green flag carries a yellow diamond and blue globe.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_8",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇳🇿",
    "prompt": "The Union Jack and four red stars appear on which country’s flag?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "New Zealand",
      "Australia",
      "Fiji",
      "Tuvalu"
    ],
    "correctAnswer": "New Zealand",
    "acceptableAnswers": [
      "new zealand"
    ],
    "explanation": "New Zealand’s flag has the Union Jack and four red stars with white borders.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_9",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇸🇳",
    "prompt": "Which West African country has green, yellow and red vertical bands with a green star?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Senegal",
      "Mali",
      "Guinea",
      "Cameroon"
    ],
    "correctAnswer": "Senegal",
    "acceptableAnswers": [
      "senegal"
    ],
    "explanation": "Senegal has vertical green, yellow and red bands with a green star in the centre.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_10",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇱🇻",
    "prompt": "Which Baltic country’s flag has a narrow white stripe between two dark red bands?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Latvia",
      "Austria",
      "Lebanon",
      "Bahrain"
    ],
    "correctAnswer": "Latvia",
    "acceptableAnswers": [
      "latvia"
    ],
    "explanation": "Latvia’s flag has a narrow white stripe between two dark red bands.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_11",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇪🇪",
    "prompt": "Which Baltic country uses blue, black and white horizontal bands?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Estonia",
      "Lithuania",
      "Bulgaria",
      "Hungary"
    ],
    "correctAnswer": "Estonia",
    "acceptableAnswers": [
      "estonia"
    ],
    "explanation": "Estonia’s horizontal bands are blue, black and white.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "flag_12",
    "roundNumber": 1,
    "category": "World Flags",
    "pictureClue": "🇭🇷",
    "prompt": "Which country has a red-white-blue flag with a red-and-white checkerboard shield?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Croatia",
      "Slovenia",
      "Slovakia",
      "Serbia"
    ],
    "correctAnswer": "Croatia",
    "acceptableAnswers": [
      "croatia"
    ],
    "explanation": "Croatia’s red-white-blue flag has a red-and-white checkerboard shield.",
    "points": 15,
    "timeLimitSec": 35
  }
];

export const SOLO_ANIMAL_QUESTIONS: Question[] = [
  {
    "id": "animal_1",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which mammal is the only one capable of sustained, powered flight?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Bats",
      "Flying squirrels",
      "Sugar gliders",
      "Colugos"
    ],
    "correctAnswer": "Bats",
    "acceptableAnswers": [
      "bats"
    ],
    "explanation": "Bats generate lift with powered wing strokes; the other animals glide.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_2",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which animal is the largest living rodent?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Capybara",
      "Beaver",
      "Porcupine",
      "Nutria"
    ],
    "correctAnswer": "Capybara",
    "acceptableAnswers": [
      "capybara"
    ],
    "explanation": "The capybara is the world’s largest rodent.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_3",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "What colour is a polar bear’s skin beneath its fur?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Black",
      "Pink",
      "White",
      "Grey"
    ],
    "correctAnswer": "Black",
    "acceptableAnswers": [
      "black"
    ],
    "explanation": "Polar bear skin is black, even though the fur appears white.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_4",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which bird is known for having a tongue that wraps around the inside of its skull?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Woodpecker",
      "Kingfisher",
      "Toucan",
      "Heron"
    ],
    "correctAnswer": "Woodpecker",
    "acceptableAnswers": [
      "woodpecker"
    ],
    "explanation": "A woodpecker’s long tongue is anchored around the skull to help it reach insects.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_5",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which animal has three hearts?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Octopus",
      "Shark",
      "Dolphin",
      "Crocodile"
    ],
    "correctAnswer": "Octopus",
    "acceptableAnswers": [
      "octopus"
    ],
    "explanation": "An octopus has two hearts that pump to the gills and one for the body.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "animal_6",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "What gives flamingos their pink colour?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Pigments in their food",
      "Sunlight on their feathers",
      "Salt in the water",
      "A pink undercoat"
    ],
    "correctAnswer": "Pigments in their food",
    "acceptableAnswers": [
      "pigments in their food"
    ],
    "explanation": "Carotenoid pigments from algae and small crustaceans colour flamingo feathers.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_7",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which reptile is the largest living lizard?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Komodo dragon",
      "Green anaconda",
      "Saltwater crocodile",
      "Leatherback turtle"
    ],
    "correctAnswer": "Komodo dragon",
    "acceptableAnswers": [
      "komodo dragon"
    ],
    "explanation": "The Komodo dragon is the largest living lizard species.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_8",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which group of mammals includes echidnas and the platypus?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Monotremes",
      "Marsupials",
      "Primates",
      "Pangolins"
    ],
    "correctAnswer": "Monotremes",
    "acceptableAnswers": [
      "monotremes"
    ],
    "explanation": "Monotremes are mammals that lay eggs.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_9",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which animal is famous for being able to regenerate lost limbs and parts of its heart?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Axolotl",
      "Clownfish",
      "Iguana",
      "Sea otter"
    ],
    "correctAnswer": "Axolotl",
    "acceptableAnswers": [
      "axolotl"
    ],
    "explanation": "Axolotls can regenerate limbs and several other tissues.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_10",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which animal has the longest known gestation period, at about 22 months?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "African elephant",
      "Blue whale",
      "Giraffe",
      "Rhinoceros"
    ],
    "correctAnswer": "African elephant",
    "acceptableAnswers": [
      "african elephant"
    ],
    "explanation": "An elephant’s pregnancy lasts close to 22 months.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "animal_11",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which living land animal is most closely related to whales and dolphins?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Hippopotamus",
      "Elephant",
      "Rhinoceros",
      "Camel"
    ],
    "correctAnswer": "Hippopotamus",
    "acceptableAnswers": [
      "hippopotamus"
    ],
    "explanation": "Hippos are the closest living land relatives of cetaceans.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_12",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "What is the main food of a giant panda?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Bamboo",
      "Eucalyptus leaves",
      "Bamboo shoots only",
      "Small rodents"
    ],
    "correctAnswer": "Bamboo",
    "acceptableAnswers": [
      "bamboo"
    ],
    "explanation": "Giant pandas eat mostly bamboo, though they can digest other foods.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_13",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which sea creature has blue blood because it uses copper-based haemocyanin to carry oxygen?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Horseshoe crab",
      "Blue whale",
      "Sea turtle",
      "Manta ray"
    ],
    "correctAnswer": "Horseshoe crab",
    "acceptableAnswers": [
      "horseshoe crab"
    ],
    "explanation": "Horseshoe crab blood uses copper-rich haemocyanin and looks blue.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_14",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which mammal uses echolocation to find insects in the dark?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Bat",
      "Red fox",
      "Hedgehog",
      "Squirrel"
    ],
    "correctAnswer": "Bat",
    "acceptableAnswers": [
      "bat"
    ],
    "explanation": "Many bats use echolocation to locate prey and navigate.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_15",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which animal’s fingerprints are so similar to humans’ that they can be difficult to tell apart?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Koala",
      "Chimpanzee",
      "Raccoon",
      "Gorilla"
    ],
    "correctAnswer": "Koala",
    "acceptableAnswers": [
      "koala"
    ],
    "explanation": "Koala fingerprints closely resemble human fingerprints.",
    "points": 20,
    "timeLimitSec": 40
  },
  {
    "id": "animal_16",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "What is a group of flamingos commonly called?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "A flamboyance",
      "A parliament",
      "A murder",
      "A crash"
    ],
    "correctAnswer": "A flamboyance",
    "acceptableAnswers": [
      "a flamboyance"
    ],
    "explanation": "A flamboyance is a collective noun for a group of flamingos.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_17",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which bird can fly backwards for sustained periods?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Hummingbird",
      "Swift",
      "Albatross",
      "Kingfisher"
    ],
    "correctAnswer": "Hummingbird",
    "acceptableAnswers": [
      "hummingbird"
    ],
    "explanation": "Hummingbirds can hover and fly backwards.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_18",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which mammal has the thickest fur of any animal?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Sea otter",
      "Polar bear",
      "Arctic fox",
      "Chinchilla"
    ],
    "correctAnswer": "Sea otter",
    "acceptableAnswers": [
      "sea otter"
    ],
    "explanation": "Sea otters have extremely dense fur that traps insulating air.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_19",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "What is the name of the hard, keratin-covered plates on a pangolin?",
    "type": "multiple_choice",
    "difficulty": "medium",
    "options": [
      "Scales",
      "Osteoderms",
      "Scutes",
      "Quills"
    ],
    "correctAnswer": "Scales",
    "acceptableAnswers": [
      "scales"
    ],
    "explanation": "Pangolin scales are made of keratin, the same material as human hair and nails.",
    "points": 15,
    "timeLimitSec": 35
  },
  {
    "id": "animal_20",
    "roundNumber": 1,
    "category": "Animals & Nature",
    "prompt": "Which animal is a marsupial native to North America?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "options": [
      "Virginia opossum",
      "Wombat",
      "Wallaby",
      "Bandicoot"
    ],
    "correctAnswer": "Virginia opossum",
    "acceptableAnswers": [
      "virginia opossum"
    ],
    "explanation": "The Virginia opossum is the only marsupial native to North America.",
    "points": 20,
    "timeLimitSec": 40
  }
];

export const DEFAULT_ROUNDS: Round[] = [
  {
    roundNumber: 1,
    title: 'Round 1: Classic Tavern Trivia',
    type: 'trivia',
    description: '10 quick-fire questions to warm up your beer-soaked brains!',
    questions: [
      {
        id: 'q1_1',
        roundNumber: 1,
        category: 'Pub Lore',
        prompt: 'In traditional British pub terminology, what does the abbreviation "IPA" stand for?',
        type: 'multiple_choice',
        options: ['India Pale Ale', 'Imperial Pint Association', 'Irish Porter Ale', 'Island Premium Alcohol'],
        correctAnswer: 'India Pale Ale',
        acceptableAnswers: ['india pale ale', 'ipa'],
        explanation: 'IPA was originally brewed in Britain with extra hops to survive the long sea voyage to India.',
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_2',
        roundNumber: 1,
        category: 'Geography',
        prompt: 'Which country is home to the famous Oktoberfest celebration originally held in Munich?',
        type: 'multiple_choice',
        options: ['Germany', 'Austria', 'Belgium', 'Switzerland'],
        correctAnswer: 'Germany',
        acceptableAnswers: ['germany'],
        explanation: 'Oktoberfest began in Munich, Bavaria in 1810 to celebrate a royal wedding.',
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_3',
        roundNumber: 1,
        category: 'Pop Culture',
        prompt: 'What was the fictional name of the neighborhood pub where Homer Simpson hangs out?',
        type: 'multiple_choice',
        options: ["Moe's Tavern", "The Drunken Clam", "MacLaren's Pub", "Paddy's Pub"],
        correctAnswer: "Moe's Tavern",
        acceptableAnswers: ["moe's tavern", "moes tavern", "moe's", "moes"],
        explanation: "Moe Szyslak is the gruff proprietor of Moe's Tavern in Springfield.",
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_4',
        roundNumber: 1,
        category: 'Food & Drink',
        prompt: 'What ingredient gives beer its distinct bitter flavor and aromatic crispness?',
        type: 'multiple_choice',
        options: ['Hops', 'Barley', 'Yeast', 'Coriander'],
        correctAnswer: 'Hops',
        acceptableAnswers: ['hops', 'hop'],
        explanation: 'Hops are the flowers of the Humulus lupulus plant used primarily as a bittering and stability agent in beer.',
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_5',
        roundNumber: 1,
        category: 'General Knowledge',
        prompt: 'How many red and white stripes are on the official flag of the United States?',
        type: 'multiple_choice',
        options: ['13', '12', '15', '11'],
        correctAnswer: '13',
        acceptableAnswers: ['13', 'thirteen'],
        explanation: 'The 13 stripes represent the original thirteen colonies that declared independence from Britain.',
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_6',
        roundNumber: 1,
        category: 'Science',
        prompt: 'What is the chemical formula for water?',
        type: 'multiple_choice',
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctAnswer: 'H2O',
        acceptableAnswers: ['h2o', 'h 2 o'],
        explanation: 'Two hydrogen atoms bonded covalently to one oxygen atom.',
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_7',
        roundNumber: 1,
        category: 'Sports & Games',
        prompt: 'In a standard game of English pub darts, what is the highest possible single-throw score on the board?',
        type: 'multiple_choice',
        options: ['Triple 20 (60 points)', 'Bullseye (50 points)', 'Double 20 (40 points)', 'Triple 19 (57 points)'],
        correctAnswer: 'Triple 20 (60 points)',
        acceptableAnswers: ['60', 'triple 20', 'treble 20', '60 points'],
        explanation: 'The treble (triple) 20 yields 60 points, which is higher than the central 50-point bullseye.',
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_8',
        roundNumber: 1,
        category: 'Cinema',
        prompt: 'Which 1994 movie features the famous quote: "Life was like a box of chocolates. You never know what you\'re gonna get"?',
        type: 'multiple_choice',
        options: ['Forrest Gump', 'The Shawshank Redemption', 'Pulp Fiction', 'The Lion King'],
        correctAnswer: 'Forrest Gump',
        acceptableAnswers: ['forrest gump', 'forest gump'],
        explanation: 'Tom Hanks delivered this iconic line as Forrest Gump waiting at the savannah bus stop.',
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_9',
        roundNumber: 1,
        category: 'History',
        prompt: 'Who was the legendary British pirate known as "Blackbeard"?',
        type: 'multiple_choice',
        options: ['Edward Teach', 'Henry Morgan', 'William Kidd', 'Bartholomew Roberts'],
        correctAnswer: 'Edward Teach',
        acceptableAnswers: ['edward teach', 'teach'],
        explanation: 'Edward Teach terrorized the Caribbean and American eastern seaboard in the early 18th century.',
        points: 10,
        timeLimitSec: 30,
      },
      {
        id: 'q1_10',
        roundNumber: 1,
        category: 'Animal Kingdom',
        prompt: 'What is a group of flamingos formally called?',
        type: 'multiple_choice',
        options: ['A Flamboyance', 'A Gaggle', 'A Parliament', 'A Squadron'],
        correctAnswer: 'A Flamboyance',
        acceptableAnswers: ['flamboyance', 'a flamboyance'],
        explanation: 'A flock of flamingos is famously dubbed a "flamboyance" due to their dazzling plumage!',
        points: 10,
        timeLimitSec: 30,
      },
    ],
  },
  {
    roundNumber: 2,
    title: 'Round 2: The Music & Picture Box',
    type: 'music',
    description: 'Identify the iconic songs, listen to live audio riffs, and match picture clues!',
    questions: [
      {
        id: 'q2_1',
        roundNumber: 2,
        category: '80s Rock & Synth',
        prompt: 'Listen to the live synth intro / look at the picture clue: What is the title and artist of this 80s dance anthem?',
        type: 'multiple_choice',
        options: [
          'Take On Me - A-ha',
          'Sweet Dreams - Eurythmics',
          'Blue Monday - New Order',
          'Girls Just Want to Have Fun - Cyndi Lauper'
        ],
        correctAnswer: 'Take On Me - A-ha',
        acceptableAnswers: ['take on me', 'a-ha', 'aha', 'take on me a-ha'],
        explanation: 'A-ha released "Take On Me" with its revolutionary rotoscoped comic-book music video in 1985.',
        points: 15,
        timeLimitSec: 40,
        musicData: {
          songTitle: 'Take On Me',
          artist: 'A-ha',
          decadeOrGenre: '1985 Synthpop',
          melodyId: 'take_on_me',
          cluePictures: [
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
          ],
        },
      },
      {
        id: 'q2_2',
        roundNumber: 2,
        category: 'Classic Rock',
        prompt: 'Which legendary band recorded "Bohemian Rhapsody" featuring the operatic section "Scaramouche, Scaramouche, will you do the Fandango"?',
        type: 'multiple_choice',
        options: ['Queen', 'The Beatles', 'Led Zeppelin', 'Pink Floyd'],
        correctAnswer: 'Queen',
        acceptableAnswers: ['queen', 'freddie mercury'],
        explanation: 'Freddie Mercury and Queen released the epic rock opera in 1975 on the album "A Night at the Opera".',
        points: 15,
        timeLimitSec: 35,
        musicData: {
          songTitle: 'Bohemian Rhapsody',
          artist: 'Queen',
          decadeOrGenre: '1975 Rock Opera',
          melodyId: 'bohemian_rhapsody',
          cluePictures: [
            'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
          ],
        },
      },
      {
        id: 'q2_3',
        roundNumber: 2,
        category: '80s Pop Icons',
        prompt: 'Identify the song: The lyrics begin: "We\'re no strangers to love... You know the rules and so do I..."',
        type: 'multiple_choice',
        options: [
          'Never Gonna Give You Up - Rick Astley',
          'Careless Whisper - George Michael',
          'Wake Me Up Before You Go-Go - Wham!',
          'Together Forever - Rick Astley'
        ],
        correctAnswer: 'Never Gonna Give You Up - Rick Astley',
        acceptableAnswers: ['never gonna give you up', 'rick astley', 'rickroll'],
        explanation: 'Rick Astley\'s 1987 smash hit became the ultimate internet meme "Rickrolling"!',
        points: 15,
        timeLimitSec: 35,
        musicData: {
          songTitle: 'Never Gonna Give You Up',
          artist: 'Rick Astley',
          decadeOrGenre: '1987 Pop / Rickroll',
          melodyId: 'never_gonna_give_you_up',
          cluePictures: [
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
          ],
        },
      },
      {
        id: 'q2_4',
        roundNumber: 2,
        category: 'Disco Fever',
        prompt: 'Which Bee Gees track from the movie "Saturday Night Fever" matches the rhythmic tempo of 103 BPM, often recommended for CPR chest compressions?',
        type: 'multiple_choice',
        options: ["Stayin' Alive", "Night Fever", "How Deep Is Your Love", "More Than a Woman"],
        correctAnswer: "Stayin' Alive",
        acceptableAnswers: ["stayin alive", "staying alive", "stayin' alive"],
        explanation: "Stayin' Alive has nearly the exact 100-120 beats per minute rhythm recommended for hands-only CPR!",
        points: 15,
        timeLimitSec: 35,
        musicData: {
          songTitle: "Stayin' Alive",
          artist: "Bee Gees",
          decadeOrGenre: '1977 Disco',
          melodyId: 'stayin_alive',
          cluePictures: [
            'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=600&q=80',
          ],
        },
      },
      {
        id: 'q2_5',
        roundNumber: 2,
        category: 'Hard Rock Riffs',
        prompt: 'Which song features one of the most famous guitar riffs in history, based on the real Montreux Casino fire in 1971?',
        type: 'multiple_choice',
        options: ['Smoke on the Water - Deep Purple', 'Paranoid - Black Sabbath', 'Back in Black - AC/DC', 'Whole Lotta Love - Led Zeppelin'],
        correctAnswer: 'Smoke on the Water - Deep Purple',
        acceptableAnswers: ['smoke on the water', 'deep purple'],
        explanation: 'Deep Purple wrote "Smoke on the Water" after watching the casino burn down during a Frank Zappa concert across Lake Geneva.',
        points: 15,
        timeLimitSec: 35,
        musicData: {
          songTitle: 'Smoke on the Water',
          artist: 'Deep Purple',
          decadeOrGenre: '1972 Hard Rock',
          melodyId: 'smoke_on_the_water',
          cluePictures: [
            'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80',
          ],
        },
      },
      {
        id: 'q2_6',
        roundNumber: 2,
        category: 'Pop Anthems',
        prompt: 'Which Michael Jackson track features the lyrics "She told me her name was Billie Jean, as she caused a scene"?',
        type: 'multiple_choice',
        options: ['Billie Jean', 'Beat It', 'Smooth Criminal', 'Bad'],
        correctAnswer: 'Billie Jean',
        acceptableAnswers: ['billie jean', 'michael jackson'],
        explanation: 'Released on the Thriller album in 1982, Billie Jean showcased the first televised moonwalk in 1983.',
        points: 15,
        timeLimitSec: 35,
        musicData: {
          songTitle: 'Billie Jean',
          artist: 'Michael Jackson',
          decadeOrGenre: '1982 Pop Funk',
          melodyId: 'billie_jean',
          cluePictures: [
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
          ],
        },
      },
      {
        id: 'q2_7',
        roundNumber: 2,
        category: 'Arena Rock',
        prompt: 'Which Journey anthem tells the story of "a small-town girl living in a lonely world" who took the midnight train going anywhere?',
        type: 'multiple_choice',
        options: ["Don't Stop Believin'", 'Any Way You Want It', 'Open Arms', 'Faithfully'],
        correctAnswer: "Don't Stop Believin'",
        acceptableAnswers: ["don't stop believin'", "dont stop believin", "dont stop believing"],
        explanation: 'Released in 1981, it is famously one of the most downloaded 20th-century digital tracks.',
        points: 15,
        timeLimitSec: 35,
        musicData: {
          songTitle: "Don't Stop Believin'",
          artist: 'Journey',
          decadeOrGenre: '1981 Rock Anthem',
          melodyId: 'dont_stop_believin',
          cluePictures: [
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
          ],
        },
      },
      {
        id: 'q2_8',
        roundNumber: 2,
        category: 'Album Covers',
        prompt: 'Which famous London pedestrian crossing appeared on the 1969 Beatles album cover?',
        type: 'multiple_choice',
        options: ['Abbey Road', 'Penny Lane', 'Carnaby Street', 'Baker Street'],
        correctAnswer: 'Abbey Road',
        acceptableAnswers: ['abbey road'],
        explanation: 'The famous zebra crossing outside EMI Studios on Abbey Road became a global tourist destination.',
        points: 15,
        timeLimitSec: 35,
        imageUrl: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'q2_9',
        roundNumber: 2,
        category: 'Guns N Roses',
        prompt: 'Whose childhood love inspired Slash\'s famous guitar intro to "Sweet Child O\' Mine"?',
        type: 'multiple_choice',
        options: ['Erin Everly (Axl Rose\'s partner)', 'Slash\'s mother', 'Stephanie Seymour', 'Michelle Young'],
        correctAnswer: 'Erin Everly (Axl Rose\'s partner)',
        acceptableAnswers: ['erin everly', 'erin', 'axl rose'],
        explanation: 'Axl Rose wrote the poem for his then-girlfriend Erin Everly while Slash warmed up with a circus exercise.',
        points: 15,
        timeLimitSec: 35,
        musicData: {
          songTitle: "Sweet Child O' Mine",
          artist: "Guns N' Roses",
          decadeOrGenre: '1987 Hard Rock',
          melodyId: 'sweet_child_o_mine',
        },
      },
      {
        id: 'q2_10',
        roundNumber: 2,
        category: 'Picture & Song Finale',
        prompt: 'What is the name of the British group that had everyone doing the "Wannabe" dance in 1996 with "zigazig-ah"?',
        type: 'multiple_choice',
        options: ['Spice Girls', 'All Saints', 'Atomic Kitten', 'Destiny\'s Child'],
        correctAnswer: 'Spice Girls',
        acceptableAnswers: ['spice girls', 'the spice girls'],
        explanation: 'The Spice Girls conquered world charts with Wannabe in July 1996 promoting Girl Power.',
        points: 15,
        timeLimitSec: 35,
        musicData: {
          songTitle: 'Wannabe',
          artist: 'Spice Girls',
          decadeOrGenre: '1996 Pop',
          melodyId: 'wannabe',
        },
      },
    ],
  },
  {
    roundNumber: 3,
    title: 'Round 3: The Pub Genius Showdown',
    type: 'picture',
    description: 'A visual round: identify three traditional pub signs from picture clues.',
    questions: [
      {
        id: 'q3_1',
        roundNumber: 3,
        category: 'Pub Sign Picture Puzzles',
        prompt: 'A red square and a lion form this rebus. Which pub sign does it name?',
        pictureClue: '🟥 + 🦁',
        type: 'multiple_choice',
        options: ['The Red Lion', 'The Crown', 'The Royal Oak', 'The White Hart'],
        correctAnswer: 'The Red Lion',
        acceptableAnswers: ['the red lion', 'red lion'],
        explanation: 'There are over 500 pubs named "The Red Lion" in the UK, stemming from King James I\'s red lion of Scotland.',
        points: 20,
        timeLimitSec: 30,
      },
      {
        id: 'q3_2',
        roundNumber: 3,
        category: 'Pub Sign Picture Puzzles',
        prompt: 'A single crown is the clue. Which familiar pub sign does it represent?',
        pictureClue: '👑',
        type: 'multiple_choice',
        options: ['The Crown', 'The Red Lion', 'The Royal Oak', 'The White Hart'],
        correctAnswer: 'The Crown',
        acceptableAnswers: ['the crown', 'crown'],
        explanation: 'The crown is one of the most familiar traditional signs used by British pubs.',
        points: 20,
        timeLimitSec: 30,
      },
      {
        id: 'q3_3',
        roundNumber: 3,
        category: 'Pub Sign Picture Puzzles',
        prompt: 'An oak tree paired with a crown points to which traditional pub name?',
        pictureClue: '🌳 + 👑',
        type: 'multiple_choice',
        options: ['The Royal Oak', 'The Crown', 'The Green Man', 'The King’s Arms'],
        correctAnswer: 'The Royal Oak',
        acceptableAnswers: ['the royal oak', 'royal oak'],
        explanation: 'A royal crown paired with an oak tree forms the traditional pub name The Royal Oak.',
        points: 20,
        timeLimitSec: 30,
      },
    ],
  },
  {
    roundNumber: 4,
    title: 'Round 4: South London Pub Crawl Lore',
    type: 'trivia',
    description: 'Authentic trivia from Borough, Bankside, Rotherhithe, Deptford, and Greenwich!',
    questions: [
      {
        id: 'q4_1',
        roundNumber: 4,
        category: 'Borough Lore & Charles Dickens',
        prompt: 'The George Inn on Borough High Street is famous for being London’s only surviving example of what type of historic tavern?',
        type: 'multiple_choice',
        options: ['Galleried Coaching Inn', 'Thatch-roofed Cider House', 'Underground Vault Pub', 'Tudor Brew-Tower'],
        correctAnswer: 'Galleried Coaching Inn',
        acceptableAnswers: ['galleried coaching inn', 'coaching inn', 'galleried inn'],
        explanation: 'Rebuilt in 1676 after the Great Fire of Southwark, The George is the National Trust’s only preserved galleried coaching inn.',
        points: 15,
        timeLimitSec: 30,
      },
      {
        id: 'q4_2',
        roundNumber: 4,
        category: 'The Great Fire & Bankside Theatres',
        prompt: 'Which famous English diarist watched the Great Fire of London in 1666 from The Anchor pub on Bankside?',
        type: 'multiple_choice',
        options: ['Samuel Pepys', 'John Evelyn', 'Daniel Defoe', 'William Shakespeare'],
        correctAnswer: 'Samuel Pepys',
        acceptableAnswers: ['samuel pepys', 'pepys'],
        explanation: 'Samuel Pepys retreated across the river to The Anchor on Bankside, writing of watching "an entire arch of fire above a mile long".',
        points: 15,
        timeLimitSec: 30,
      },
      {
        id: 'q4_3',
        roundNumber: 4,
        category: 'Pilgrims, Maritime Lore & Thames Secrets',
        prompt: 'The Mayflower pub in Rotherhithe sits directly opposite the church where which historic ship captain is buried?',
        type: 'multiple_choice',
        options: ['Captain Christopher Jones', 'Captain James Cook', 'Captain William Bligh', 'Sir Francis Drake'],
        correctAnswer: 'Captain Christopher Jones',
        acceptableAnswers: ['captain christopher jones', 'christopher jones'],
        explanation: 'Captain Christopher Jones moored the Mayflower right outside the tavern jetty in 1620 and is buried at St. Mary’s Rotherhithe.',
        points: 15,
        timeLimitSec: 30,
      },
      {
        id: 'q4_4',
        roundNumber: 4,
        category: 'South London Craft Brewing & Docklands',
        prompt: 'Tucked away in the cobblestones of Deptford, what legendary boozer is celebrated for hand-pulled cask mild and pickled eggs?',
        type: 'multiple_choice',
        options: ['The Dog & Bell', 'The Cutty Sark', 'The Prince of Greenwich', 'The Pelton Arms'],
        correctAnswer: 'The Dog & Bell',
        acceptableAnswers: ['the dog and bell', 'the dog & bell', 'dog and bell', 'dog & bell'],
        explanation: 'The Dog & Bell on Prince Street in Deptford is renowned as one of South London’s finest CAMRA real ale and cider institutions.',
        points: 20,
        timeLimitSec: 30,
      },
      {
        id: 'q4_5',
        roundNumber: 4,
        category: 'Greenwich Meridian, Navies & Grand Pub Finale',
        prompt: 'The Trafalgar Tavern in Greenwich was world-famous in the Victorian era for hosting Cabinet Ministers’ feasts of which delicacy?',
        type: 'multiple_choice',
        options: ['Whitebait Dinners', 'Jellied Eels', 'Venison Pasties', 'Oyster Stew'],
        correctAnswer: 'Whitebait Dinners',
        acceptableAnswers: ['whitebait dinners', 'whitebait', 'whitebait dinner'],
        explanation: 'Victorian Prime Ministers like William Gladstone and novelists like Charles Dickens gathered at The Trafalgar for the annual Ministerial Whitebait Dinner.',
        points: 25,
        timeLimitSec: 30,
      },
    ],
  },
];
