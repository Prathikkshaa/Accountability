export interface PersonState {
  name: string;
  avatarId: string;
  goal: string;
  reason: string;
  customReason: string;
  commitmentAmount: string;
  commitmentFrequency: string;
  commitmentTiming: string;
  supportPreference: string;
}

export interface RelationshipState {
  personA: PersonState;
  personB: PersonState;
  partnerChoice: 'partner' | 'solo';
  inviteCode: string;
  partnerJoined: boolean;
}

export const PRESET_AVATARS = [
  { id: 'av_1', bg: '#e5e5e0', skin: '#f8d5c2', label: 'Clean' },
  { id: 'av_2', bg: '#f3e8df', skin: '#e8b589', label: 'Warm' },
  { id: 'av_3', bg: '#dfebd9', skin: '#c68a5c', label: 'Sage' },
  { id: 'av_4', bg: '#e2e5f0', skin: '#704214', label: 'Dusk' },
  { id: 'av_5', bg: '#fbe7e8', skin: '#f8d5c2', label: 'Blush' },
  { id: 'av_6', bg: '#eef2f5', skin: '#e8b589', label: 'Slate' },
];

export const INITIAL_ONBOARDING_STATE: RelationshipState = {
  personA: {
    name: 'Zara',
    avatarId: 'av_1',
    goal: 'Get stronger',
    reason: "I'll feel better about myself if I do.",
    customReason: '',
    commitmentAmount: '30 minutes',
    commitmentFrequency: '3x a week',
    commitmentTiming: 'Evening',
    supportPreference: 'Direct',
  },
  personB: {
    name: 'Alex',
    avatarId: 'av_3',
    goal: 'Read',
    reason: 'I want to be more consistent.',
    customReason: '',
    commitmentAmount: '20 pages',
    commitmentFrequency: '4x a week',
    commitmentTiming: 'Evening',
    supportPreference: 'Keep me honest',
  },
  partnerChoice: 'partner',
  inviteCode: '2CGG7X',
  partnerJoined: false,
};
