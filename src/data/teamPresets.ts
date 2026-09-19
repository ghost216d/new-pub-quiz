import { Team } from '../types';

export const TEAM_AVATARS: string[] = [
  '🍺', '🍻', '🍷', '🍸', '🍹', '🍾', '🥨', '🍕',
  '🍔', '🍟', '🧀', '🍗', '🦊', '🦉', '🦁', '🐻',
  '🐺', '🐼', '🐵', '🐸', '🐙', '🦈', '🦅', '🦄',
  '🎸', '🥁', '🎷', '🎺', '🎹', '⚡', '🎩', '🏴‍☠️',
  '🎯', '🚀', '👑', '🔥', '🎲', '🧩', '🏆', '💎',
  '⚓', '🔔', '🎪', '🍀', '💣', '🛡️', '🛸', '👻',
];

export const TEAM_COLORS: string[] = [
  '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6',
  '#EF4444', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#E11D48', '#D97706', '#059669', '#2563EB',
  '#DB2777', '#7C3AED', '#DC2626', '#0D9488', '#EA580C',
];

export const PUB_LEGEND_TEAM_NAMES: string[] = [
  'The Crafty Foxes',
  'Quizzy Rascals',
  'Pint Pals',
  'Ale & Hearty',
  'The Brew Crew',
  'Hop Heads',
  'Tipsy Thinkers',
  'The Brainy Pints',
  'Cask Masters',
  'Stout Scholars',
  'Tavern Titans',
  'Draft Dodgers',
  'Malt Mavens',
  'Bar Trivia Bosses',
  'Golden Goblets',
  'The Hoptimists',
  'Smart Ales',
  'Barrel Rollers',
  'Whiskey Whizzes',
  'Lager Lovers',
  'Frothy Einsteins',
  'The Corkers',
  'Stein Strikers',
  'Cellar Dwellers',
  'Pub Crawlers',
  'Buzzed Brains',
  'The Beermongers',
  'Bitter Ends',
  'Porter Prodigies',
  'Taproom Tacticians',
  'Sip & Solvers',
  'Trivia Taps',
  'Fermentation Station',
  'Last Call Legends',
  'Happy Hour Heroes',
  'The Snifters',
  'Grog Geniuses',
  'Mug Shots',
  'Saloon Savants',
  'The Draught Detectives',
];

export function createPresetTeams(
  count: number,
  scheme: 'tables' | 'pub_legends' = 'pub_legends'
): Record<string, Team> {
  const safeCount = Math.max(1, Math.min(40, count));
  const teams: Record<string, Team> = {};

  for (let i = 0; i < safeCount; i++) {
    const id = `team_${i + 1}`;
    const name =
      scheme === 'tables'
        ? `Table ${i + 1}`
        : PUB_LEGEND_TEAM_NAMES[i] || `Team ${i + 1}`;
    const avatar = TEAM_AVATARS[i % TEAM_AVATARS.length];
    const color = TEAM_COLORS[i % TEAM_COLORS.length];

    teams[id] = {
      id,
      name,
      avatar,
      color,
      score: 0,
      isOnline: true,
      scoreHistory: [],
    };
  }

  return teams;
}
