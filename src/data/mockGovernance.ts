import type { MeetingMinute, CouncilRuleChapter } from '../lib/types';
import { officialCouncilRules } from './officialConstitution';

// Strict No-Mock Policy: D1 is the Single Source of Truth (SSOT).
export const initialMeetingMinutes: MeetingMinute[] = [];
export const councilRules: CouncilRuleChapter[] = officialCouncilRules;
