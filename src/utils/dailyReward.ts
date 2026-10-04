const localDayStamp = (date: Date): string => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export const hasClaimedDailyReward = (lastClaimedAt?: number, now = new Date()): boolean => {
  if (typeof lastClaimedAt !== 'number' || !Number.isFinite(lastClaimedAt)) return false;
  return localDayStamp(new Date(lastClaimedAt)) === localDayStamp(now);
};

export const timestampForDailyReward = (now = new Date()): number => now.getTime();
