// Data layer, backed by Supabase (Postgres + RLS). All functions keep their
// original signatures so the pages don't change. Rows are snake_case in the
// DB and mapped to the app's camelCase types here.

import type { User, Goal, DailyCheckIn, AccountabilityPartner, Nudge, GraceRequest, MoodState } from './types';
import { supabase, currentUserId } from './supabase';
import { getTodayDateString, getYesterdayDateString } from './utils';

/* ---------------- mappers ---------------- */
const rowToUser = (r: any): User => ({
  id: r.id, name: r.name, avatarUrl: r.avatar_url || '', email: r.email || '',
  timezone: r.timezone || 'UTC', createdAt: r.created_at,
});
const rowToGoal = (r: any): Goal => ({
  id: r.id, userId: r.user_id, name: r.name, category: r.category, description: r.description || undefined,
  measurementType: r.measurement_type, targetValue: Number(r.target_value), targetUnit: r.target_unit || undefined,
  frequencyPerWeek: r.frequency_per_week ?? undefined, selectedDays: r.selected_days ?? undefined,
  visibility: r.visibility, startDate: r.start_date, endDate: r.end_date || undefined,
  reminderTime: r.reminder_time || undefined, status: r.status, stake: r.stake || undefined, createdAt: r.created_at,
});
const rowToCheckIn = (r: any): DailyCheckIn => ({
  id: r.id, goalId: r.goal_id, userId: r.user_id, date: r.date, completed: r.completed,
  quantityCompleted: r.quantity_completed ?? undefined, proofPhotoUrl: r.proof_photo_url || undefined,
  note: r.note || undefined, mood: (r.mood as MoodState) || undefined, checkedInAt: r.checked_in_at,
});

/* ---------------- streak math ---------------- */
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function computeStreak(completed: string[], grace: string[]) {
  const totalCompletions = completed.length;
  const valid = new Set<string>([...completed, ...grace]);
  const today = getTodayDateString(), yesterday = getYesterdayDateString();
  let currentStreak = 0;
  if (valid.has(today) || valid.has(yesterday)) {
    const cur = new Date();
    if (!valid.has(today)) cur.setDate(cur.getDate() - 1);
    while (valid.has(fmt(cur))) { currentStreak++; cur.setDate(cur.getDate() - 1); }
  }
  let longest = 0, temp = 0;
  const sorted = Array.from(valid).sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const diff = Math.round((new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000);
      temp = diff === 1 ? temp + 1 : 1;
    } else temp = 1;
    if (temp > longest) longest = temp;
  }
  if (currentStreak > longest) longest = currentStreak;
  return { currentStreak, longestStreak: longest, totalCompletions };
}
function computeShared(aDates: string[], bDates: string[]) {
  const A = new Set(aDates), B = new Set(bDates);
  const both = (d: string) => A.has(d) && B.has(d);
  const today = getTodayDateString(), yest = getYesterdayDateString();
  let s = 0; const cur = new Date();
  if (both(today) || both(yest)) { if (!both(today)) cur.setDate(cur.getDate() - 1); while (both(fmt(cur))) { s++; cur.setDate(cur.getDate() - 1); } }
  return s;
}

/* ---------------- auth / profile ---------------- */
// Google OAuth — one tap, no emails. Redirects to Google and back; the
// session is picked up on return.
export async function signInWithGoogle(redirectTo: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, queryParams: { prompt: 'select_account' } },
  });
  if (error) throw new Error(error.message);
}
export async function upsertProfile(p: { name?: string; avatarUrl?: string; email?: string }) {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const patch: any = { id: uid };
  if (p.name !== undefined) patch.name = p.name;
  if (p.avatarUrl !== undefined) patch.avatar_url = p.avatarUrl;
  if (p.email !== undefined) patch.email = p.email;
  patch.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const { error } = await supabase.from('profiles').upsert(patch);
  if (error) throw new Error(error.message);
}
export async function signOut() { await supabase.auth.signOut(); }

// Guarantees a profile row exists (e.g. if a magic link opened in a browser
// without the onboarding draft), so a partner always sees a name.
export async function ensureProfile() {
  const uid = await currentUserId();
  if (!uid) return;
  const { data } = await supabase.from('profiles').select('id').eq('id', uid).maybeSingle();
  if (!data) {
    const { data: sess } = await supabase.auth.getSession();
    const email = sess.session?.user.email || '';
    await supabase.from('profiles').upsert({ id: uid, name: email.split('@')[0] || 'Friend', email });
  }
}

export async function getMe(): Promise<{ currentUser: User; allUsers: User[] }> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
  const { data: sess } = await supabase.auth.getSession();
  const email = sess.session?.user.email || '';
  const currentUser = data ? rowToUser(data) : { id: uid, name: 'Friend', avatarUrl: '', email, timezone: 'UTC', createdAt: '' };
  return { currentUser, allUsers: [] };
}

/* ---------------- goals (with computed streaks) ---------------- */
async function goalsWithStreaks(userId: string): Promise<Goal[]> {
  const { data: goals } = await supabase.from('goals').select('*').eq('user_id', userId).neq('status', 'ARCHIVED').order('created_at');
  const list = goals || [];
  if (!list.length) return [];
  const ids = list.map(g => g.id);
  const [{ data: cis }, { data: gr }] = await Promise.all([
    supabase.from('check_ins').select('*').in('goal_id', ids),
    supabase.from('grace_requests').select('goal_id,date,status').in('goal_id', ids).eq('status', 'APPROVED'),
  ]);
  const today = getTodayDateString();
  return list.map(g => {
    const goalCis = (cis || []).filter(c => c.goal_id === g.id);
    const completed = goalCis.filter(c => c.completed).map(c => c.date);
    const grace = (gr || []).filter(x => x.goal_id === g.id).map(x => x.date);
    const s = computeStreak(completed, grace);
    const todayChk = goalCis.find(c => c.date === today);
    return {
      ...rowToGoal(g),
      completedToday: !!(todayChk && todayChk.completed),
      todayCheckIn: todayChk ? rowToCheckIn(todayChk) : undefined,
      currentStreak: s.currentStreak, longestStreak: s.longestStreak, totalCompletions: s.totalCompletions,
    };
  });
}
async function showUpDates(userId: string): Promise<string[]> {
  const { data: goals } = await supabase.from('goals').select('id').eq('user_id', userId);
  const ids = (goals || []).map(g => g.id);
  if (!ids.length) return [];
  const { data: cis } = await supabase.from('check_ins').select('date,completed').in('goal_id', ids);
  return (cis || []).filter(c => c.completed).map(c => c.date);
}

export async function getGoals(userId?: string): Promise<Goal[]> {
  const uid = userId || (await currentUserId());
  if (!uid) return [];
  return goalsWithStreaks(uid);
}

export async function getGoalDetail(goalId: string): Promise<{ goal: Goal; checkIns: DailyCheckIn[] }> {
  const { data: g } = await supabase.from('goals').select('*').eq('id', goalId).maybeSingle();
  if (!g) throw new Error('Goal not found');
  const { data: cis } = await supabase.from('check_ins').select('*').eq('goal_id', goalId).order('date');
  const { data: gr } = await supabase.from('grace_requests').select('date,status').eq('goal_id', goalId).eq('status', 'APPROVED');
  const completed = (cis || []).filter(c => c.completed).map(c => c.date);
  const s = computeStreak(completed, (gr || []).map(x => x.date));
  const today = getTodayDateString();
  const todayChk = (cis || []).find(c => c.date === today);
  const goal: Goal = {
    ...rowToGoal(g), completedToday: !!(todayChk && todayChk.completed),
    todayCheckIn: todayChk ? rowToCheckIn(todayChk) : undefined,
    currentStreak: s.currentStreak, longestStreak: s.longestStreak, totalCompletions: s.totalCompletions,
  };
  return { goal, checkIns: (cis || []).map(rowToCheckIn) };
}

/* ---------------- partners ---------------- */
export async function getPartnerships(): Promise<AccountabilityPartner[]> {
  const me = await currentUserId();
  if (!me) return [];
  const { data: parts } = await supabase.from('partnerships').select('*')
    .eq('status', 'ACTIVE').or(`user_a.eq.${me},user_b.eq.${me}`);
  if (!parts?.length) return [];
  const myDates = await showUpDates(me);
  const result: AccountabilityPartner[] = [];
  for (const p of parts) {
    const partnerId = p.user_a === me ? p.user_b : p.user_a;
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', partnerId).maybeSingle();
    if (!prof) continue;
    const partnerGoals = (await goalsWithStreaks(partnerId)).filter(g => g.visibility === 'PARTNER_VISIBLE');
    const partnerDates = await showUpDates(partnerId);
    result.push({
      id: p.id, userId: me, partnerId, partnerUser: rowToUser(prof), status: 'ACTIVE',
      connectedAt: p.created_at, goals: partnerGoals,
      sharedStreak: computeShared(myDates, partnerDates),
      daysSincePaired: Math.max(0, Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000)),
    });
  }
  return result;
}

/* ---------------- check-ins ---------------- */
// Returns a hosted URL, or null if storage isn't set up (so we never store
// a giant base64 string in the database).
async function uploadProof(dataUrl: string): Promise<string | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${uid}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('proofs').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) return null;
    return supabase.storage.from('proofs').getPublicUrl(path).data.publicUrl;
  } catch { return null; }
}

export async function checkIn(params: {
  goalId: string; completed: boolean; date: string;
  quantityCompleted?: number; note?: string; mood?: MoodState; proofPhotoUrl?: string; userId?: string;
}) {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  if (params.date !== getTodayDateString()) throw new Error('You can only check in for today.');
  let proof: string | null | undefined = params.proofPhotoUrl;
  if (proof && proof.startsWith('data:')) proof = await uploadProof(proof);
  const row: any = {
    goal_id: params.goalId, user_id: uid, date: params.date, completed: params.completed,
    quantity_completed: params.quantityCompleted ?? null, note: params.note ?? null,
    mood: params.mood ?? null, proof_photo_url: proof ?? null, checked_in_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('check_ins').upsert(row, { onConflict: 'goal_id,date' });
  if (error) throw new Error(error.message);
  const { data: cis } = await supabase.from('check_ins').select('date,completed').eq('goal_id', params.goalId);
  const s = computeStreak((cis || []).filter(c => c.completed).map(c => c.date), []);
  return { checkIn: rowToCheckIn(row), streak: s };
}

/* ---------------- nudges ---------------- */
export async function getNudges(): Promise<Nudge[]> {
  const me = await currentUserId();
  if (!me) return [];
  const { data } = await supabase.from('nudges')
    .select('*, sender:sender_id(name, avatar_url)').eq('receiver_id', me).order('created_at', { ascending: false }).limit(50);
  return (data || []).map((n: any): Nudge => ({
    id: n.id, senderId: n.sender_id, senderName: n.sender?.name || 'Someone', senderAvatar: n.sender?.avatar_url || '',
    receiverId: n.receiver_id, goalId: n.goal_id || undefined, goalName: n.goal_name || undefined,
    message: n.message, nudgeType: n.nudge_type, status: n.status, createdAt: n.created_at,
  }));
}
export async function sendNudge(params: { receiverId: string; goalId?: string; goalName?: string; message: string; nudgeType?: Nudge['nudgeType'] }) {
  const { error } = await supabase.rpc('send_nudge', {
    p_receiver: params.receiverId, p_goal_id: params.goalId ?? null,
    p_goal_name: params.goalName ?? null, p_message: params.message, p_type: params.nudgeType ?? 'CUSTOM',
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* ---------------- grace ---------------- */
export async function getPendingGrace(): Promise<GraceRequest[]> {
  const me = await currentUserId();
  if (!me) return [];
  const { data } = await supabase.from('grace_requests')
    .select('*, requester:user_id(name, avatar_url)').eq('reviewer_id', me).eq('status', 'PENDING').order('created_at', { ascending: false });
  return (data || []).map((g: any): GraceRequest => ({
    id: g.id, goalId: g.goal_id, goalName: g.goal_name, userId: g.user_id,
    userName: g.requester?.name || 'Your partner', userAvatar: g.requester?.avatar_url || '',
    date: g.date, reasonNote: g.reason_note, status: g.status, reviewerId: g.reviewer_id,
    reviewedAt: g.reviewed_at || undefined, createdAt: g.created_at,
  }));
}
export async function requestGrace(params: { goalId: string; date: string; reasonNote: string; reviewerId: string }) {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const { data: g } = await supabase.from('goals').select('name').eq('id', params.goalId).maybeSingle();
  const { error } = await supabase.from('grace_requests').insert({
    goal_id: params.goalId, goal_name: g?.name || 'a goal', user_id: uid,
    reviewer_id: params.reviewerId, date: params.date, reason_note: params.reasonNote, status: 'PENDING',
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}
export async function reviewGrace(graceId: string, status: 'APPROVED' | 'REJECTED') {
  const { error } = await supabase.from('grace_requests').update({ status, reviewed_at: new Date().toISOString() }).eq('id', graceId);
  if (error) throw new Error(error.message);
  return { success: true };
}

/* ---------------- pairing ---------------- */
export async function disconnectPartner(partnerId: string) {
  const { error } = await supabase.rpc('disconnect_partner', { p_partner: partnerId });
  if (error) throw new Error(error.message);
  return { success: true };
}
export async function acceptInvite(code: string) {
  const { error } = await supabase.rpc('accept_invite', { p_code: code });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
export async function generateInvite() {
  const { data, error } = await supabase.rpc('generate_invite');
  if (error) throw new Error(error.message);
  return { invite: { code: data as string } };
}

/* ---------------- goal CRUD ---------------- */
export async function createGoal(goal: Partial<Goal> & { name: string; measurementType: Goal['measurementType'] }) {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const row = {
    user_id: uid, name: goal.name, category: goal.category || 'General', description: goal.description ?? null,
    measurement_type: goal.measurementType, target_value: goal.targetValue ?? 1, target_unit: goal.targetUnit ?? null,
    frequency_per_week: goal.frequencyPerWeek ?? null, selected_days: goal.selectedDays ?? null,
    visibility: goal.visibility || 'PARTNER_VISIBLE', start_date: getTodayDateString(),
    reminder_time: goal.reminderTime ?? null, status: 'ACTIVE', stake: goal.stake ?? null,
  };
  const { data, error } = await supabase.from('goals').insert(row).select().maybeSingle();
  if (error) throw new Error(error.message);
  return { goal: rowToGoal(data) };
}
export async function patchGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
  const patch: any = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.targetValue !== undefined) patch.target_value = updates.targetValue;
  if (updates.targetUnit !== undefined) patch.target_unit = updates.targetUnit ?? null;
  if (updates.frequencyPerWeek !== undefined) patch.frequency_per_week = updates.frequencyPerWeek ?? null;
  if (updates.visibility !== undefined) patch.visibility = updates.visibility;
  if (updates.stake !== undefined) patch.stake = updates.stake ?? null;
  if (updates.status !== undefined) patch.status = updates.status;
  const { data, error } = await supabase.from('goals').update(patch).eq('id', goalId).select().maybeSingle();
  if (error) throw new Error(error.message);
  return rowToGoal(data);
}
export async function archiveGoal(goalId: string) {
  const { error } = await supabase.from('goals').update({ status: 'ARCHIVED' }).eq('id', goalId);
  if (error) throw new Error(error.message);
  return { success: true };
}
export async function restartGoal(goalId: string): Promise<Goal> {
  const { data, error } = await supabase.from('goals').update({ start_date: getTodayDateString() }).eq('id', goalId).select().maybeSingle();
  if (error) throw new Error(error.message);
  return rowToGoal(data);
}

/* ---------------- profile photo ---------------- */
export async function uploadAvatar(dataUrl: string): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${uid}/avatar.jpg`;
  const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new Error(error.message);
  const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl + `?v=${Date.now()}`;
  await upsertProfile({ avatarUrl: url });
  return url;
}
