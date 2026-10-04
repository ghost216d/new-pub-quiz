import assert from 'node:assert/strict';
import { hasClaimedDailyReward, timestampForDailyReward } from '../src/utils/dailyReward.ts';

const today = new Date(2026, 9, 4, 12, 0, 0);
const yesterday = new Date(2026, 9, 3, 23, 59, 0);
assert.equal(hasClaimedDailyReward(undefined, today), false, 'unclaimed gift should be available');
assert.equal(hasClaimedDailyReward(timestampForDailyReward(today), today), true, 'gift should be claimed for the current local day');
assert.equal(hasClaimedDailyReward(timestampForDailyReward(yesterday), today), false, 'gift should become available on the next local day');
console.log('Daily reward once-per-day regression passed.');
