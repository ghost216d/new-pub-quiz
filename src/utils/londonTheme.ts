export type LondonSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type LondonTimeTheme = 'day' | 'night';

const londonParts = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    month: 'numeric',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  return {
    month: Number(parts.find((part) => part.type === 'month')?.value || 1),
    hour: Number(parts.find((part) => part.type === 'hour')?.value || 12),
  };
};

export const getLondonTheme = (): { season: LondonSeason; time: LondonTimeTheme } => {
  const { month, hour } = londonParts();
  const season: LondonSeason = month >= 3 && month <= 5
    ? 'spring'
    : month >= 6 && month <= 8
      ? 'summer'
      : month >= 9 && month <= 11
        ? 'autumn'
        : 'winter';

  return { season, time: hour >= 7 && hour < 19 ? 'day' : 'night' };
};
