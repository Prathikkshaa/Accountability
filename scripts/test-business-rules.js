const path = require('path');
const fs = require('fs');

// Simple assertion runner
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// Clear DB for test run
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
if (fs.existsSync(DB_FILE)) {
  fs.unlinkSync(DB_FILE);
}

// Require store
const { dbStore, getTodayDateString, getYesterdayDateString } = require('../src/lib/store');

console.log('\n🧪 --- RUNNING CORE BUSINESS LOGIC TESTS ---\n');

// 1. Test Today Only Check-in Rule
const todayStr = getTodayDateString();
const yesterdayStr = getYesterdayDateString();
const tomorrowStr = '2099-01-01';

const goal = dbStore.getGoals('user_tara')[0];

const todayResult = dbStore.performCheckIn({
  goalId: goal.id,
  userId: 'user_tara',
  date: todayStr,
  completed: true,
  note: 'Test check in today',
});
assert(todayResult.success === true, 'Check-in for TODAY succeeds');

const yesterdayResult = dbStore.performCheckIn({
  goalId: goal.id,
  userId: 'user_tara',
  date: yesterdayStr,
  completed: true,
});
assert(yesterdayResult.success === false, 'Check-in for YESTERDAY is rejected server-side');

const tomorrowResult = dbStore.performCheckIn({
  goalId: goal.id,
  userId: 'user_tara',
  date: tomorrowStr,
  completed: true,
});
assert(tomorrowResult.success === false, 'Check-in for TOMORROW is rejected server-side');

// 2. Test Privacy Rules
const partnerGoals = dbStore.getPartnerVisibleGoals('user_tara');
const privateGoal = partnerGoals.find(g => g.visibility === 'PRIVATE');
assert(!privateGoal, 'Private goals are excluded from partner visible goal list');

// 3. Test Self Pairing Prevention
const invite = dbStore.generateInviteCode('user_tara');
const selfPairResult = dbStore.validateAndAcceptInvite(invite.code, 'user_tara');
assert(selfPairResult.success === false, 'Self-pairing is strictly prevented server-side');

// 4. Test 4-Hour Reconnect Cooldown
const disconnectSuccess = dbStore.disconnectPartner('user_tara', 'user_alex');
assert(disconnectSuccess === true, 'Partner disconnect succeeds');

const newInvite = dbStore.generateInviteCode('user_tara');
const reconnectResult = dbStore.validateAndAcceptInvite(newInvite.code, 'user_alex');
assert(reconnectResult.success === false && reconnectResult.error.includes('cooldown'), '4-hour reconnect cooldown enforced on server');

// 5. Test Group 15 Member Capacity Limit
const group = dbStore.createGroup('Max Test Circle', 'user_tara');
for (let i = 1; i <= 14; i++) {
  const dummyUser = dbStore.createUser({
    name: `User ${i}`,
    email: `user${i}@example.com`,
    avatarUrl: '',
    timezone: 'UTC',
  });
  dbStore.addGroupMember(group.id, dummyUser.id);
}

const overflowUser = dbStore.createUser({
  name: 'Overflow User',
  email: 'overflow@example.com',
  avatarUrl: '',
  timezone: 'UTC',
});
const overflowResult = dbStore.addGroupMember(group.id, overflowUser.id);
assert(overflowResult.success === false && overflowResult.error.includes('15 members'), 'Group 15-member capacity strictly enforced');

console.log('\n🎉 ALL CORE BUSINESS LOGIC TESTS PASSED CLEANLY!\n');
