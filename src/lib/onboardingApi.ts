// Client-side helpers that turn the warm onboarding flow into real backend
// records: a user, their first goal, and an invite code to pair a partner.

import type { MeasurementType, GoalVisibility } from './types';

export interface CommitmentInput {
  goal: string;
  amount: string; // free text, e.g. "30 minutes", "20 pages", "By 11pm"
  frequency: string; // e.g. "3x a week", "Every day", "Weekdays"
  timing: string; // e.g. "Morning" | "Evening"
  category?: string;
}

export interface MappedGoal {
  name: string;
  category: string;
  measurementType: MeasurementType;
  targetValue: number;
  targetUnit?: string;
  frequencyPerWeek?: number;
  visibility: GoalVisibility;
}

const firstNumber = (s: string): number => {
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : 1;
};

export function mapFrequencyToPerWeek(freq: string): number | undefined {
  const f = freq.toLowerCase();
  if (f.includes('every day') || f.includes('daily')) return 7;
  if (f.includes('weekday')) return 5;
  const n = f.match(/(\d+)\s*x/);
  if (n) return parseInt(n[1], 10);
  return undefined;
}

// Infer a measurement type + target from the free-text commitment amount.
export function mapCommitmentToGoal(input: CommitmentInput): MappedGoal {
  const a = input.amount.toLowerCase();
  let measurementType: MeasurementType = 'BINARY';
  let targetValue = 1;
  let targetUnit: string | undefined;

  if (a.includes('page')) {
    measurementType = 'QUANTITY';
    targetValue = firstNumber(a);
    targetUnit = 'pages';
  } else if (a.includes('word')) {
    measurementType = 'QUANTITY';
    targetValue = firstNumber(a);
    targetUnit = 'words';
  } else if (a.includes('hour')) {
    measurementType = 'DURATION';
    targetValue = firstNumber(a) * 60;
    targetUnit = 'min';
  } else if (a.includes('min')) {
    measurementType = 'DURATION';
    targetValue = firstNumber(a);
    targetUnit = 'min';
  } else if (/^\s*\d+/.test(a)) {
    // bare number, e.g. "3" reps/sessions
    measurementType = 'QUANTITY';
    targetValue = firstNumber(a);
  }
  // "By 11pm", "1 entry", "Be present" etc. stay BINARY = show up once.

  const frequencyPerWeek = mapFrequencyToPerWeek(input.frequency);
  if (measurementType === 'BINARY' && frequencyPerWeek && frequencyPerWeek < 7) {
    measurementType = 'FREQUENCY';
    targetValue = frequencyPerWeek;
    targetUnit = 'times/wk';
  }

  return {
    name: input.goal,
    category: input.category || 'General',
    measurementType,
    targetValue,
    targetUnit,
    frequencyPerWeek,
    visibility: 'PARTNER_VISIBLE',
  };
}

export interface CommitResult {
  goalIds: string[];
  inviteCode: string;
}

// The signed-in user is already created (via email OTP). This saves their
// profile name, creates one goal per promise, and generates an invite code.
export async function commitOnboarding(params: {
  name: string;
  email: string;
  commitments: CommitmentInput[];
  reminderTime?: string;
}): Promise<CommitResult> {
  const { upsertProfile, createGoal, generateInvite } = await import('./appApi');

  await upsertProfile({ name: params.name, email: params.email });

  const goalIds: string[] = [];
  for (const commitment of params.commitments) {
    const mapped = mapCommitmentToGoal(commitment);
    const { goal } = await createGoal({ ...mapped, reminderTime: params.reminderTime });
    goalIds.push(goal.id);
  }

  const { invite } = await generateInvite();
  return { goalIds, inviteCode: invite.code };
}
