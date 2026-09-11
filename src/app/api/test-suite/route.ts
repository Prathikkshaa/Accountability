import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getTodayDateString, getYesterdayDateString } from '@/lib/utils';

export async function GET() {
  const results: { test: string; status: 'PASSED' | 'FAILED'; details?: string }[] = [];

  try {
    // 1. TODAY-ONLY Check-in Rule
    const todayStr = getTodayDateString();
    const yesterdayStr = getYesterdayDateString();
    const tomorrowStr = '2099-01-01';

    const goals = dbStore.getGoals('user_tara');
    if (goals.length > 0) {
      const gId = goals[0].id;

      const todayRes = dbStore.performCheckIn({
        goalId: gId,
        userId: 'user_tara',
        date: todayStr,
        completed: true,
      });
      if (todayRes.success) {
        results.push({ test: 'Server accepts check-in for TODAY', status: 'PASSED' });
      } else {
        results.push({ test: 'Server accepts check-in for TODAY', status: 'FAILED', details: todayRes.error });
      }

      const yestRes = dbStore.performCheckIn({
        goalId: gId,
        userId: 'user_tara',
        date: yesterdayStr,
        completed: true,
      });
      if (!yestRes.success) {
        results.push({ test: 'Server strictly rejects check-in for YESTERDAY', status: 'PASSED' });
      } else {
        results.push({ test: 'Server strictly rejects check-in for YESTERDAY', status: 'FAILED' });
      }

      const tomRes = dbStore.performCheckIn({
        goalId: gId,
        userId: 'user_tara',
        date: tomorrowStr,
        completed: true,
      });
      if (!tomRes.success) {
        results.push({ test: 'Server strictly rejects check-in for TOMORROW', status: 'PASSED' });
      } else {
        results.push({ test: 'Server strictly rejects check-in for TOMORROW', status: 'FAILED' });
      }
    }

    // 2. Privacy Rule
    const partnerGoals = dbStore.getPartnerVisibleGoals('user_tara');
    const hasPrivateGoal = partnerGoals.some(g => g.visibility === 'PRIVATE');
    if (!hasPrivateGoal) {
      results.push({ test: 'Private goals excluded from partner view', status: 'PASSED' });
    } else {
      results.push({ test: 'Private goals excluded from partner view', status: 'FAILED' });
    }

    // 3. Self-Pairing Prevention
    const invite = dbStore.generateInviteCode('user_tara');
    const selfRes = dbStore.validateAndAcceptInvite(invite.code, 'user_tara');
    if (!selfRes.success) {
      results.push({ test: 'Self-pairing prevented server-side', status: 'PASSED' });
    } else {
      results.push({ test: 'Self-pairing prevented server-side', status: 'FAILED' });
    }

    // 4. 4-Hour Reconnect Cooldown
    dbStore.disconnectPartner('user_tara', 'user_alex');
    const newInvite = dbStore.generateInviteCode('user_tara');
    const reconnectRes = dbStore.validateAndAcceptInvite(newInvite.code, 'user_alex');
    if (!reconnectRes.success && reconnectRes.error?.includes('cooldown')) {
      results.push({ test: '4-Hour reconnect cooldown enforced server-side', status: 'PASSED' });
    } else {
      results.push({ test: '4-Hour reconnect cooldown enforced server-side', status: 'FAILED', details: reconnectRes.error });
    }

    // 5. Group 15-Member Capacity Limit
    const group = dbStore.createGroup('Capacity Test Circle', 'user_tara');
    for (let i = 1; i <= 14; i++) {
      const u = dbStore.createUser({
        name: `Member ${i}`,
        email: `m${i}@example.com`,
        avatarUrl: '',
        timezone: 'America/New_York',
      });
      dbStore.addGroupMember(group.id, u.id);
    }
    const overflowUser = dbStore.createUser({
      name: 'Overflow Member',
      email: 'overflow@example.com',
      avatarUrl: '',
      timezone: 'America/New_York',
    });
    const overflowRes = dbStore.addGroupMember(group.id, overflowUser.id);
    if (!overflowRes.success && overflowRes.error?.includes('15 members')) {
      results.push({ test: 'Group 15-member max capacity strictly enforced', status: 'PASSED' });
    } else {
      results.push({ test: 'Group 15-member max capacity strictly enforced', status: 'FAILED', details: overflowRes.error });
    }

    const allPassed = results.every(r => r.status === 'PASSED');
    return NextResponse.json({ allPassed, results });
  } catch (error: any) {
    return NextResponse.json({ allPassed: false, error: error.message, results }, { status: 500 });
  }
}
