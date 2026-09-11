// Client-side API for the main app. Thin typed wrappers over the existing
// route handlers, all scoped to the current user by default.

import type {
  User, Goal, AccountabilityPartner, Nudge, GraceRequest, Group, MoodState,
} from './types';
import { CURRENT_USER_ID } from './session';

async function jget<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `GET ${url} failed`);
  return data as T;
}
async function jpost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `POST ${url} failed`);
  return data as T;
}

const uid = (u?: string) => u || CURRENT_USER_ID;

/* ---- reads ---- */
export const getMe = (u?: string) =>
  jget<{ currentUser: User; allUsers: User[] }>(`/api/auth/me?userId=${uid(u)}`);

export const getGoals = (u?: string) =>
  jget<{ goals: Goal[] }>(`/api/goals?userId=${uid(u)}`).then(r => r.goals);

export const getPartnerships = (u?: string) =>
  jget<{ partnerships: AccountabilityPartner[] }>(`/api/pairing?userId=${uid(u)}`).then(r => r.partnerships);

export const getNudges = (u?: string) =>
  jget<{ nudges: Nudge[] }>(`/api/nudges?userId=${uid(u)}`).then(r => r.nudges);

export const getGroups = (u?: string) =>
  jget<{ groups: Group[] }>(`/api/groups?userId=${uid(u)}`).then(r => r.groups);

export const getPendingGrace = (u?: string) =>
  jget<{ graceRequests: GraceRequest[] }>(`/api/grace?userId=${uid(u)}`).then(r => r.graceRequests);

/* ---- writes ---- */
export const checkIn = (params: {
  goalId: string; completed: boolean; date: string;
  quantityCompleted?: number; note?: string; mood?: MoodState; userId?: string;
}) => jpost<{ checkIn: any; streak: { currentStreak: number; longestStreak: number; totalCompletions: number } }>(
  '/api/check-in', { ...params, userId: uid(params.userId) });

export const sendNudge = (params: {
  receiverId: string; goalId?: string; goalName?: string; message: string;
  nudgeType?: Nudge['nudgeType']; senderId?: string;
}) => jpost<{ nudge: Nudge }>('/api/nudges', { ...params, senderId: uid(params.senderId) });

export const requestGrace = (params: {
  goalId: string; date: string; reasonNote: string; reviewerId: string; userId?: string;
}) => jpost<{ graceRequest: GraceRequest }>('/api/grace', { action: 'REQUEST', ...params, userId: uid(params.userId) });

export const reviewGrace = (graceId: string, status: 'APPROVED' | 'REJECTED', reviewerId?: string) =>
  jpost<{ success: boolean }>('/api/grace', { action: 'REVIEW', graceId, status, reviewerId: uid(reviewerId) });

export const rescueStreak = (goalId: string, date: string, rescuedByUserId?: string) =>
  jpost<{ rescue: any }>('/api/rescue', { goalId, date, rescuedByUserId: uid(rescuedByUserId) });

export const disconnectPartner = (partnerId: string, userId?: string) =>
  jpost<{ success: boolean; message?: string }>('/api/pairing', { action: 'DISCONNECT', userId: uid(userId), partnerId });

export const acceptInvite = (code: string, userId?: string) =>
  jpost<{ success: boolean; error?: string }>('/api/pairing', { action: 'ACCEPT_INVITE', code, userId: uid(userId) });

export const generateInvite = (userId?: string) =>
  jpost<{ invite: { code: string } }>('/api/pairing', { action: 'GENERATE_INVITE', userId: uid(userId) });

export const createGroup = (name: string, creatorId?: string) =>
  jpost<{ group: Group }>('/api/groups', { action: 'CREATE', name, creatorId: uid(creatorId) });

export const createGoal = (goal: Partial<Goal> & { name: string; measurementType: Goal['measurementType'] }, userId?: string) =>
  jpost<{ goal: Goal }>('/api/goals', { userId: uid(userId), ...goal });

export const patchGoal = async (goalId: string, updates: Partial<Goal>) => {
  const res = await fetch(`/api/goals/${goalId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Update failed');
  return data.goal as Goal;
};

export const archiveGoal = async (goalId: string) => {
  const res = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Archive failed');
  return data;
};

export const restartGoal = async (goalId: string) => {
  const res = await fetch(`/api/goals/${goalId}`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Restart failed');
  return data.goal as Goal;
};

export const getGoalDetail = (goalId: string) =>
  jget<{ goal: Goal; checkIns: import('./types').DailyCheckIn[] }>(`/api/goals/${goalId}`);
