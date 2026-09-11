// Client API — now backed directly by the in-browser store (localStorage),
// so the app runs fully offline with no server. Functions stay async so the
// pages that await them don't change.

import type { User, Goal, AccountabilityPartner, Nudge, GraceRequest, Group, MoodState, DailyCheckIn } from './types';
import { CURRENT_USER_ID } from './session';
import { dbStore } from './store';
import { getTodayDateString } from './utils';

const uid = (u?: string) => u || CURRENT_USER_ID;

/* ---- reads ---- */
export async function getMe(u?: string): Promise<{ currentUser: User; allUsers: User[] }> {
  const currentUser = dbStore.getUser(uid(u)) || dbStore.getUser('user_tara')!;
  return { currentUser, allUsers: dbStore.getAllUsers() };
}
export async function getGoals(u?: string): Promise<Goal[]> { return dbStore.getGoals(uid(u)); }
export async function getPartnerships(u?: string): Promise<AccountabilityPartner[]> { return dbStore.getPartnerships(uid(u)); }
export async function getNudges(u?: string): Promise<Nudge[]> { return dbStore.getNudges(uid(u)); }
export async function getGroups(u?: string): Promise<Group[]> { return dbStore.getGroups(uid(u)); }
export async function getPendingGrace(u?: string): Promise<GraceRequest[]> { return dbStore.getPendingGraceRequests(uid(u)); }

export async function getGoalDetail(goalId: string): Promise<{ goal: Goal; checkIns: DailyCheckIn[] }> {
  const goal = dbStore.getGoalById(goalId);
  if (!goal) throw new Error('Goal not found');
  return { goal, checkIns: dbStore.getGoalCheckIns(goalId) };
}

/* ---- writes ---- */
export async function checkIn(params: {
  goalId: string; completed: boolean; date: string;
  quantityCompleted?: number; note?: string; mood?: MoodState; proofPhotoUrl?: string; userId?: string;
}) {
  const res = dbStore.performCheckIn({ ...params, userId: uid(params.userId) });
  if (!res.success) throw new Error(res.error || 'Check-in failed');
  return { checkIn: res.checkIn, streak: dbStore.calculateStreak(params.goalId) };
}

export async function sendNudge(params: {
  receiverId: string; goalId?: string; goalName?: string; message: string; nudgeType?: Nudge['nudgeType']; senderId?: string;
}) {
  const res = dbStore.sendNudge({ ...params, senderId: uid(params.senderId), nudgeType: params.nudgeType || 'CUSTOM' });
  if (!res.success) throw new Error(res.error || 'Could not send nudge');
  return { nudge: res.nudge };
}

export async function requestGrace(params: { goalId: string; date: string; reasonNote: string; reviewerId: string; userId?: string }) {
  const res = dbStore.requestGrace({ ...params, userId: uid(params.userId) });
  if (!res.success) throw new Error(res.error || 'Could not request grace');
  return { graceRequest: res.graceRequest };
}
export async function reviewGrace(graceId: string, status: 'APPROVED' | 'REJECTED', reviewerId?: string) {
  const ok = dbStore.reviewGraceRequest(graceId, uid(reviewerId), status);
  return { success: ok };
}
export async function rescueStreak(goalId: string, date: string, rescuedByUserId?: string) {
  return dbStore.rescueStreak({ goalId, date, rescuedByUserId: uid(rescuedByUserId) });
}
export async function disconnectPartner(partnerId: string, userId?: string) {
  const ok = dbStore.disconnectPartner(uid(userId), partnerId);
  if (!ok) throw new Error('Partnership not found');
  return { success: true };
}
export async function acceptInvite(code: string, userId?: string) {
  return dbStore.validateAndAcceptInvite(code, uid(userId));
}
export async function generateInvite(userId?: string) {
  return { invite: dbStore.generateInviteCode(uid(userId)) };
}
export async function createGroup(name: string, creatorId?: string) {
  return { group: dbStore.createGroup(name, uid(creatorId)) };
}

export async function createGoal(goal: Partial<Goal> & { name: string; measurementType: Goal['measurementType'] }, userId?: string) {
  const created = dbStore.createGoal({
    userId: uid(userId),
    name: goal.name,
    category: goal.category || 'General',
    description: goal.description,
    measurementType: goal.measurementType,
    targetValue: goal.targetValue ?? 1,
    targetUnit: goal.targetUnit,
    frequencyPerWeek: goal.frequencyPerWeek,
    selectedDays: goal.selectedDays,
    visibility: goal.visibility || 'PARTNER_VISIBLE',
    startDate: getTodayDateString(),
    reminderTime: goal.reminderTime,
    stake: goal.stake,
  });
  return { goal: created };
}

export async function patchGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
  const g = dbStore.updateGoal(goalId, updates);
  if (!g) throw new Error('Update failed');
  return g;
}
export async function archiveGoal(goalId: string) {
  const ok = dbStore.archiveGoal(goalId);
  if (!ok) throw new Error('Archive failed');
  return { success: true };
}
export async function restartGoal(goalId: string): Promise<Goal> {
  const g = dbStore.restartGoal(goalId);
  if (!g) throw new Error('Restart failed');
  return g;
}
