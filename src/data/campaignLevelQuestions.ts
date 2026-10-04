import type { Question } from '../types';
import packs from './campaignGeneralKnowledge.json';

// Refreshed 5 October 2026. Every pub has a distinct bundled ten-question
// general-knowledge pack, so starting a pub never waits for a trivia service.
// Source attribution and licence: public/trivia-sources.txt.
export const CAMPAIGN_LEVEL_QUESTIONS = packs as Record<string, Question[]>;
