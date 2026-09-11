import fs from 'fs';
import path from 'path';
import {
  User, Goal, DailyCheckIn, InviteCode, Nudge, GraceRequest, StreakRescue, Group, SharedGoal, NotificationPref,
  MeasurementType, GoalVisibility, MoodState, InviteStatus, SharedGoalMode, AccountabilityPartner
} from './types';
import { getTodayDateString, getYesterdayDateString } from './utils';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DBData {
  users: User[];
  goals: Goal[];
  checkIns: DailyCheckIn[];
  invites: InviteCode[];
  partnerships: {
    id: string;
    userId1: string;
    userId2: string;
    status: 'PENDING' | 'ACTIVE' | 'DISCONNECTED';
    createdAt: string;
    disconnectedAt?: string;
  }[];
  cooldowns: {
    userId1: string;
    userId2: string;
    disconnectedAt: string;
    cooldownExpiresAt: string;
  }[];
  nudges: Nudge[];
  graceRequests: GraceRequest[];
  streakRescues: StreakRescue[];
  groups: Group[];
  sharedGoals: SharedGoal[];
  sharedGoalContributions: {
    id: string;
    sharedGoalId: string;
    userId: string;
    quantity: number;
    completed: boolean;
    date: string;
  }[];
  notificationPrefs: NotificationPref[];
}

function getDefaultData(): DBData {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  return {
    users: [
      {
        id: 'user_tara',
        name: 'Tara Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        email: 'tara@example.com',
        phone: '+15550192',
        timezone: 'America/New_York',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'user_alex',
        name: 'Alex Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
        email: 'alex@example.com',
        phone: '+15550193',
        timezone: 'America/New_York',
        createdAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'user_priya',
        name: 'Priya Patel',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
        email: 'priya@example.com',
        phone: '+15550194',
        timezone: 'America/New_York',
        createdAt: '2026-01-03T00:00:00Z',
      },
    ],
    goals: [
      {
        id: 'goal_tara_1',
        userId: 'user_tara',
        name: 'Morning Run',
        category: 'Fitness',
        description: '30 minute light run outdoors',
        measurementType: 'FREQUENCY',
        targetValue: 3,
        targetUnit: 'times/wk',
        frequencyPerWeek: 3,
        visibility: 'PARTNER_VISIBLE',
        startDate: '2026-02-01',
        reminderTime: '07:00',
        status: 'ACTIVE',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'goal_tara_2',
        userId: 'user_tara',
        name: 'Personal Project',
        category: 'Productivity',
        description: 'Focus work on indie SaaS app',
        measurementType: 'DURATION',
        targetValue: 45,
        targetUnit: 'min',
        visibility: 'PARTNER_VISIBLE',
        startDate: '2026-02-01',
        reminderTime: '19:00',
        status: 'ACTIVE',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'goal_tara_3',
        userId: 'user_tara',
        name: 'Journaling',
        category: 'Mindfulness',
        description: 'Private reflection thoughts',
        measurementType: 'BINARY',
        targetValue: 1,
        visibility: 'PRIVATE',
        startDate: '2026-02-01',
        status: 'ACTIVE',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'goal_alex_1',
        userId: 'user_alex',
        name: 'Evening Gym',
        category: 'Fitness',
        description: 'Strength training workout session',
        measurementType: 'BINARY',
        targetValue: 1,
        visibility: 'PARTNER_VISIBLE',
        startDate: '2026-02-01',
        reminderTime: '18:30',
        status: 'ACTIVE',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'goal_alex_2',
        userId: 'user_alex',
        name: 'Read Books',
        category: 'Learning',
        description: 'Non-fiction books daily',
        measurementType: 'QUANTITY',
        targetValue: 20,
        targetUnit: 'pages',
        visibility: 'PARTNER_VISIBLE',
        startDate: '2026-02-01',
        reminderTime: '21:00',
        status: 'ACTIVE',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'goal_priya_1',
        userId: 'user_priya',
        name: 'Deep Study',
        category: 'Learning',
        description: 'Algorithms and systems design',
        measurementType: 'DURATION',
        targetValue: 60,
        targetUnit: 'min',
        visibility: 'PARTNER_VISIBLE',
        startDate: '2026-02-01',
        reminderTime: '15:00',
        status: 'ACTIVE',
        createdAt: '2026-02-01T00:00:00Z',
      },
    ],
    checkIns: [
      {
        id: 'chk_alex_1',
        goalId: 'goal_alex_1',
        userId: 'user_alex',
        date: todayStr,
        completed: true,
        mood: 'GREAT',
        note: 'Pushed heavy weights today! Felt awesome.',
        checkedInAt: `${todayStr}T08:30:00Z`,
      },
      {
        id: 'chk_tara_prev',
        goalId: 'goal_tara_1',
        userId: 'user_tara',
        date: yesterdayStr,
        completed: true,
        mood: 'GOOD',
        note: 'Completed 5km around the park.',
        checkedInAt: `${yesterdayStr}T07:15:00Z`,
      },
      {
        id: 'chk_priya_prev',
        goalId: 'goal_priya_1',
        userId: 'user_priya',
        date: yesterdayStr,
        completed: true,
        quantityCompleted: 60,
        mood: 'AMAZING',
        note: 'Finished 2 chapters of Designing Data-Intensive Applications.',
        checkedInAt: `${yesterdayStr}T16:00:00Z`,
      }
    ],
    invites: [
      {
        code: 'K7P4QX',
        inviterId: 'user_tara',
        inviterName: 'Tara Sharma',
        inviterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        createdAt: new Date().toISOString(),
      }
    ],
    partnerships: [
      {
        id: 'part_tara_alex',
        userId1: 'user_tara',
        userId2: 'user_alex',
        status: 'ACTIVE',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'part_tara_priya',
        userId1: 'user_tara',
        userId2: 'user_priya',
        status: 'ACTIVE',
        createdAt: '2026-02-05T00:00:00Z',
      }
    ],
    cooldowns: [],
    nudges: [
      {
        id: 'nudge_1',
        senderId: 'user_alex',
        senderName: 'Alex Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
        receiverId: 'user_tara',
        goalId: 'goal_tara_1',
        goalName: 'Morning Run',
        message: 'Your move! The morning air is calling.',
        nudgeType: 'COMPLETION_PUSH',
        status: 'DELIVERED',
        createdAt: `${todayStr}T09:00:00Z`,
      }
    ],
    graceRequests: [
      {
        id: 'grace_1',
        goalId: 'goal_priya_1',
        goalName: 'Deep Study',
        userId: 'user_priya',
        userName: 'Priya Patel',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
        date: yesterdayStr,
        reasonNote: 'Had an unexpected family emergency yesterday evening.',
        status: 'PENDING',
        reviewerId: 'user_tara',
        createdAt: `${yesterdayStr}T22:00:00Z`,
      }
    ],
    streakRescues: [],
    groups: [
      {
        id: 'group_squad',
        name: 'Build & Move Squad',
        creatorId: 'user_tara',
        createdAt: '2026-02-01T00:00:00Z',
        members: [
          {
            userId: 'user_tara',
            name: 'Tara Sharma',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            role: 'ADMIN',
            joinedAt: '2026-02-01T00:00:00Z',
          },
          {
            userId: 'user_alex',
            name: 'Alex Chen',
            avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
            role: 'MEMBER',
            joinedAt: '2026-02-01T00:00:00Z',
          },
          {
            userId: 'user_priya',
            name: 'Priya Patel',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
            role: 'MEMBER',
            joinedAt: '2026-02-05T00:00:00Z',
          }
        ],
        sharedGoals: []
      }
    ],
    sharedGoals: [
      {
        id: 'sg_100_workouts',
        groupId: 'group_squad',
        name: '100 Workouts Challenge',
        measurementType: 'QUANTITY',
        targetValue: 100,
        targetUnit: 'workouts',
        mode: 'COLLECTIVE_TARGET',
        startDate: '2026-02-01',
        contributions: [
          {
            userId: 'user_tara',
            userName: 'Tara Sharma',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            completed: true,
            quantity: 18,
          },
          {
            userId: 'user_alex',
            userName: 'Alex Chen',
            userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
            completed: true,
            quantity: 24,
          },
          {
            userId: 'user_priya',
            userName: 'Priya Patel',
            userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
            completed: true,
            quantity: 12,
          }
        ]
      }
    ],
    sharedGoalContributions: [],
    notificationPrefs: [
      {
        userId: 'user_tara',
        partnerNudges: true,
        goalReminders: true,
        streakAlerts: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      }
    ]
  };
}

class StorageEngine {
  private memoryData: DBData | null = null;

  private loadData(): DBData {
    if (this.memoryData) return this.memoryData;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryData = JSON.parse(raw);
        return this.memoryData!;
      }
    } catch (e) {
      console.error('Failed reading DB file, using default seed:', e);
    }

    const defaultData = getDefaultData();
    this.saveData(defaultData);
    this.memoryData = defaultData;
    return defaultData;
  }

  public saveData(data: DBData): void {
    this.memoryData = data;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save DB file:', e);
    }
  }

  // User Operations
  public getUser(userId: string): User | null {
    const data = this.loadData();
    return data.users.find(u => u.id === userId) || null;
  }

  public getAllUsers(): User[] {
    return this.loadData().users;
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const data = this.loadData();
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    this.saveData(data);
    return newUser;
  }

  public updateUser(userId: string, updates: Partial<User>): User | null {
    const data = this.loadData();
    const index = data.users.findIndex(u => u.id === userId);
    if (index === -1) return null;
    data.users[index] = { ...data.users[index], ...updates };
    this.saveData(data);
    return data.users[index];
  }

  // Goal Operations
  public getGoals(userId: string): Goal[] {
    const data = this.loadData();
    const userGoals = data.goals.filter(g => g.userId === userId && g.status !== 'ARCHIVED');
    const todayStr = getTodayDateString();

    return userGoals.map(goal => {
      const todayChk = data.checkIns.find(c => c.goalId === goal.id && c.date === todayStr);
      const streakInfo = this.calculateStreak(goal.id);
      return {
        ...goal,
        completedToday: !!(todayChk && todayChk.completed),
        todayCheckIn: todayChk,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        totalCompletions: streakInfo.totalCompletions,
      };
    });
  }

  public getPartnerVisibleGoals(userId: string): Goal[] {
    const goals = this.getGoals(userId);
    return goals.filter(g => g.visibility === 'PARTNER_VISIBLE');
  }

  public createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'status'>): Goal {
    const data = this.loadData();
    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...goalData,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    data.goals.push(newGoal);
    this.saveData(data);
    return newGoal;
  }

  public updateGoal(goalId: string, updates: Partial<Goal>): Goal | null {
    const data = this.loadData();
    const index = data.goals.findIndex(g => g.id === goalId);
    if (index === -1) return null;
    data.goals[index] = { ...data.goals[index], ...updates };
    this.saveData(data);
    return data.goals[index];
  }

  public archiveGoal(goalId: string): boolean {
    const data = this.loadData();
    const index = data.goals.findIndex(g => g.id === goalId);
    if (index === -1) return false;
    data.goals[index].status = 'ARCHIVED';
    this.saveData(data);
    return true;
  }

  public restartGoal(goalId: string): Goal | null {
    const data = this.loadData();
    const goal = data.goals.find(g => g.id === goalId);
    if (!goal) return null;
    // Preservation rule: restarting resets current streak active baseline date to today, but keeps historical completions intact!
    goal.startDate = getTodayDateString();
    this.saveData(data);
    return goal;
  }

  // Check-In Operations (SERVER-ENFORCED TODAY ONLY RULE)
  public performCheckIn(params: {
    goalId: string;
    userId: string;
    date: string;
    completed: boolean;
    quantityCompleted?: number;
    proofPhotoUrl?: string;
    note?: string;
    mood?: MoodState;
  }): { success: boolean; error?: string; checkIn?: DailyCheckIn } {
    const todayStr = getTodayDateString();

    // STRICT CHECK-IN RULE: TODAY ONLY
    if (params.date !== todayStr) {
      return {
        success: false,
        error: `Check-in rejected: You can only check in for TODAY (${todayStr}). Retroactive or future check-ins are not permitted.`
      };
    }

    const data = this.loadData();
    const goal = data.goals.find(g => g.id === params.goalId);
    if (!goal) {
      return { success: false, error: 'Goal not found' };
    }
    if (goal.userId !== params.userId) {
      return { success: false, error: 'Unauthorized goal check-in' };
    }

    let existingIdx = data.checkIns.findIndex(c => c.goalId === params.goalId && c.date === todayStr);
    let checkIn: DailyCheckIn;

    if (existingIdx !== -1) {
      checkIn = {
        ...data.checkIns[existingIdx],
        completed: params.completed,
        quantityCompleted: params.quantityCompleted ?? data.checkIns[existingIdx].quantityCompleted,
        proofPhotoUrl: params.proofPhotoUrl ?? data.checkIns[existingIdx].proofPhotoUrl,
        note: params.note ?? data.checkIns[existingIdx].note,
        mood: params.mood ?? data.checkIns[existingIdx].mood,
        checkedInAt: new Date().toISOString(),
      };
      data.checkIns[existingIdx] = checkIn;
    } else {
      checkIn = {
        id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        goalId: params.goalId,
        userId: params.userId,
        date: todayStr,
        completed: params.completed,
        quantityCompleted: params.quantityCompleted,
        proofPhotoUrl: params.proofPhotoUrl,
        note: params.note,
        mood: params.mood,
        checkedInAt: new Date().toISOString(),
      };
      data.checkIns.push(checkIn);
    }

    this.saveData(data);
    return { success: true, checkIn };
  }

  // Streak Calculation Engine
  public calculateStreak(goalId: string): { currentStreak: number; longestStreak: number; totalCompletions: number } {
    const data = this.loadData();
    const checkIns = data.checkIns
      .filter(c => c.goalId === goalId && c.completed)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (checkIns.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
    }

    const totalCompletions = checkIns.length;
    const todayStr = getTodayDateString();
    const yesterdayStr = getYesterdayDateString();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check if streak is active (completed today or completed yesterday)
    const completedToday = checkIns.some(c => c.date === todayStr);
    const completedYesterday = checkIns.some(c => c.date === yesterdayStr);

    // Also include approved Grace Requests or Streak Rescues
    const approvedGraces = data.graceRequests.filter(g => g.goalId === goalId && g.status === 'APPROVED').map(g => g.date);
    const rescuedDates = data.streakRescues.filter(r => r.goalId === goalId).map(r => r.date);

    const validDates = new Set([
      ...checkIns.map(c => c.date),
      ...approvedGraces,
      ...rescuedDates
    ]);

    // Build contiguous streak backward from today/yesterday
    let checkDate = new Date();
    if (!completedToday && !completedYesterday && !validDates.has(yesterdayStr) && !validDates.has(todayStr)) {
      currentStreak = 0;
    } else {
      if (!completedToday && (completedYesterday || validDates.has(yesterdayStr))) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dStr = `${year}-${month}-${day}`;

        if (validDates.has(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak calculation across all historical dates
    const sortedAllDates = Array.from(validDates).sort();
    if (sortedAllDates.length > 0) {
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedAllDates.length; i++) {
        const prev = new Date(sortedAllDates[i - 1]);
        const curr = new Date(sortedAllDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;

    return { currentStreak, longestStreak, totalCompletions };
  }

  // Partnership & Invite Operations
  public generateInviteCode(inviterId: string): InviteCode {
    const data = this.loadData();
    const inviter = this.getUser(inviterId);
    if (!inviter) throw new Error('User not found');

    // Generate 6-char human readable alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const invite: InviteCode = {
      code,
      inviterId,
      inviterName: inviter.name,
      inviterAvatar: inviter.avatarUrl,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      createdAt: new Date().toISOString(),
    };

    data.invites.push(invite);
    this.saveData(data);
    return invite;
  }

  public validateAndAcceptInvite(code: string, joinerUserId: string): {
    success: boolean;
    error?: string;
    invite?: InviteCode;
  } {
    const data = this.loadData();
    const cleanCode = code.trim().toUpperCase();
    const invite = data.invites.find(i => i.code === cleanCode);

    if (!invite) {
      return { success: false, error: 'Invalid invite code. Please check and try again.' };
    }

    if (invite.status !== 'PENDING') {
      return { success: false, error: 'This invite code has already been used or revoked.' };
    }

    if (new Date(invite.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'This invite code has expired.' };
    }

    // SERVER RULE: NO SELF-PAIRING
    if (invite.inviterId === joinerUserId) {
      return { success: false, error: 'You cannot pair with yourself! Invite a friend or partner.' };
    }

    // SERVER RULE: Check 4-hour reconnect cooldown
    const cooldown = data.cooldowns.find(c =>
      (c.userId1 === invite.inviterId && c.userId2 === joinerUserId) ||
      (c.userId1 === joinerUserId && c.userId2 === invite.inviterId)
    );

    if (cooldown && new Date(cooldown.cooldownExpiresAt).getTime() > Date.now()) {
      const remainingMinutes = Math.ceil((new Date(cooldown.cooldownExpiresAt).getTime() - Date.now()) / (1000 * 60));
      return {
        success: false,
        error: `Reconnect cooldown active. Please wait ${remainingMinutes} minutes before reconnecting with this user.`
      };
    }

    // Check if already active partners
    const existing = data.partnerships.find(p =>
      p.status === 'ACTIVE' &&
      ((p.userId1 === invite.inviterId && p.userId2 === joinerUserId) ||
       (p.userId1 === joinerUserId && p.userId2 === invite.inviterId))
    );

    if (existing) {
      return { success: false, error: 'You are already accountability partners with this user!' };
    }

    // Create partnership (initially ACTIVE or pending approval flow)
    const newPartnership = {
      id: `part_${Date.now()}`,
      userId1: invite.inviterId,
      userId2: joinerUserId,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    };

    invite.status = 'APPROVED';
    data.partnerships.push(newPartnership);
    this.saveData(data);

    return { success: true, invite };
  }

  public getPartnerships(userId: string): AccountabilityPartner[] {
    const data = this.loadData();
    const active = data.partnerships.filter(
      p => p.status === 'ACTIVE' && (p.userId1 === userId || p.userId2 === userId)
    );

    return active.map(p => {
      const partnerId = p.userId1 === userId ? p.userId2 : p.userId1;
      const partnerUser = this.getUser(partnerId)!;
      const partnerGoals = this.getPartnerVisibleGoals(partnerId);

      const daysSincePaired = Math.max(0, Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000));

      return {
        id: p.id,
        userId,
        partnerId,
        partnerUser,
        status: 'ACTIVE' as const,
        connectedAt: p.createdAt,
        goals: partnerGoals,
        sharedStreak: this.getSharedStreak(userId, partnerId),
        daysSincePaired,
      };
    });
  }

  // Dates on which a user showed up for at least one goal (completions,
  // approved grace, or a partner's rescue all count).
  public getUserShowUpDates(userId: string): Set<string> {
    const data = this.loadData();
    const goalIds = new Set(data.goals.filter(g => g.userId === userId).map(g => g.id));
    const dates = new Set<string>();
    data.checkIns.filter(c => c.completed && goalIds.has(c.goalId)).forEach(c => dates.add(c.date));
    data.graceRequests.filter(g => g.status === 'APPROVED' && goalIds.has(g.goalId)).forEach(g => dates.add(g.date));
    data.streakRescues.filter(r => goalIds.has(r.goalId)).forEach(r => dates.add(r.date));
    return dates;
  }

  // Consecutive days (up to today/yesterday) where BOTH partners showed up.
  public getSharedStreak(a: string, b: string): number {
    const da = this.getUserShowUpDates(a);
    const db = this.getUserShowUpDates(b);
    const both = (d: string) => da.has(d) && db.has(d);
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    let streak = 0;
    const cur = new Date();
    if (!both(today)) {
      if (both(yesterday)) cur.setDate(cur.getDate() - 1);
      else return 0;
    }
    while (true) {
      const s = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      if (both(s)) { streak++; cur.setDate(cur.getDate() - 1); } else break;
    }
    return streak;
  }

  public getGoalCheckIns(goalId: string): DailyCheckIn[] {
    return this.loadData().checkIns
      .filter(c => c.goalId === goalId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  public getGoalById(goalId: string): Goal | null {
    const data = this.loadData();
    const g = data.goals.find(x => x.id === goalId);
    if (!g) return null;
    const s = this.calculateStreak(goalId);
    const todayChk = data.checkIns.find(c => c.goalId === goalId && c.date === getTodayDateString());
    return {
      ...g,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      totalCompletions: s.totalCompletions,
      completedToday: !!(todayChk && todayChk.completed),
      todayCheckIn: todayChk,
    };
  }

  // DISCONNECT & 4-HOUR RECONNECT COOLDOWN (SERVER-ENFORCED)
  public disconnectPartner(userId: string, partnerId: string): boolean {
    const data = this.loadData();
    const idx = data.partnerships.findIndex(
      p => p.status === 'ACTIVE' &&
      ((p.userId1 === userId && p.userId2 === partnerId) || (p.userId1 === partnerId && p.userId2 === userId))
    );

    if (idx === -1) return false;

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 4 * 3600 * 1000).toISOString(); // 4 Hours

    data.partnerships[idx].status = 'DISCONNECTED';
    data.partnerships[idx].disconnectedAt = now;

    // Enforce 4-hour cooldown server-side
    data.cooldowns.push({
      userId1: userId,
      userId2: partnerId,
      disconnectedAt: now,
      cooldownExpiresAt: expiresAt,
    });

    this.saveData(data);
    return true;
  }

  // Nudges & Rate Limits
  public sendNudge(params: {
    senderId: string;
    receiverId: string;
    goalId?: string;
    goalName?: string;
    message: string;
    nudgeType: Nudge['nudgeType'];
  }): { success: boolean; error?: string; nudge?: Nudge } {
    const data = this.loadData();
    const sender = this.getUser(params.senderId);
    if (!sender) return { success: false, error: 'Sender not found' };

    // Rate Limit: Max 5 nudges per partner per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const recentCount = data.nudges.filter(
      n => n.senderId === params.senderId && n.receiverId === params.receiverId && n.createdAt > oneHourAgo
    ).length;

    if (recentCount >= 5) {
      return { success: false, error: 'Nudge rate limit reached. Please wait before sending another nudge to this partner.' };
    }

    const nudge: Nudge = {
      id: `nudge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: params.senderId,
      senderName: sender.name,
      senderAvatar: sender.avatarUrl,
      receiverId: params.receiverId,
      goalId: params.goalId,
      goalName: params.goalName,
      message: params.message,
      nudgeType: params.nudgeType,
      status: 'DELIVERED',
      createdAt: new Date().toISOString(),
    };

    data.nudges.unshift(nudge);
    this.saveData(data);
    return { success: true, nudge };
  }

  public getNudges(userId: string): Nudge[] {
    const data = this.loadData();
    return data.nudges.filter(n => n.receiverId === userId);
  }

  // Grace Request & Streak Rescue
  public requestGrace(params: {
    userId: string;
    goalId: string;
    date: string;
    reasonNote: string;
    reviewerId: string;
  }): { success: boolean; error?: string; graceRequest?: GraceRequest } {
    const data = this.loadData();
    const user = this.getUser(params.userId);
    const goal = data.goals.find(g => g.id === params.goalId);
    if (!user || !goal) return { success: false, error: 'User or Goal not found' };

    const grace: GraceRequest = {
      id: `grace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      goalId: params.goalId,
      goalName: goal.name,
      userId: params.userId,
      userName: user.name,
      userAvatar: user.avatarUrl,
      date: params.date,
      reasonNote: params.reasonNote,
      status: 'PENDING',
      reviewerId: params.reviewerId,
      createdAt: new Date().toISOString(),
    };

    data.graceRequests.unshift(grace);
    this.saveData(data);
    return { success: true, graceRequest: grace };
  }

  public reviewGraceRequest(graceId: string, reviewerId: string, status: 'APPROVED' | 'REJECTED'): boolean {
    const data = this.loadData();
    const grace = data.graceRequests.find(g => g.id === graceId);
    if (!grace || grace.reviewerId !== reviewerId) return false;

    grace.status = status;
    grace.reviewedAt = new Date().toISOString();
    this.saveData(data);
    return true;
  }

  public rescueStreak(params: {
    goalId: string;
    rescuedByUserId: string;
    date: string;
  }): { success: boolean; rescue?: StreakRescue } {
    const data = this.loadData();
    const goal = data.goals.find(g => g.id === params.goalId);
    const rescuer = this.getUser(params.rescuedByUserId);
    if (!goal || !rescuer) return { success: false };

    const rescue: StreakRescue = {
      id: `rescue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      goalId: params.goalId,
      goalName: goal.name,
      userId: goal.userId,
      rescuedByUserId: params.rescuedByUserId,
      rescuedByName: rescuer.name,
      date: params.date,
      createdAt: new Date().toISOString(),
    };

    data.streakRescues.push(rescue);
    this.saveData(data);
    return { success: true, rescue };
  }

  public getPendingGraceRequests(userId: string): GraceRequest[] {
    const data = this.loadData();
    return data.graceRequests.filter(g => g.reviewerId === userId && g.status === 'PENDING');
  }

  // Group Operations (MAX 15 MEMBERS RULE)
  public getGroups(userId: string): Group[] {
    const data = this.loadData();
    return data.groups
      .filter(g => g.members.some(m => m.userId === userId))
      .map(g => {
        // Shared goals may live in the group or in the top-level collection;
        // merge them and compute collective progress for display.
        const nested = g.sharedGoals || [];
        const top = data.sharedGoals.filter(sg => sg.groupId === g.id && !nested.some(n => n.id === sg.id));
        const sharedGoals = [...nested, ...top].map(sg => ({
          ...sg,
          totalProgress: sg.contributions.reduce((s, c) => s + (c.quantity || 0), 0),
        }));
        return { ...g, sharedGoals };
      });
  }

  public createGroup(name: string, creatorId: string): Group {
    const data = this.loadData();
    const creator = this.getUser(creatorId);
    if (!creator) throw new Error('Creator not found');

    const newGroup: Group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      creatorId,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: creatorId,
          name: creator.name,
          avatarUrl: creator.avatarUrl,
          role: 'ADMIN',
          joinedAt: new Date().toISOString(),
        }
      ],
      sharedGoals: []
    };

    data.groups.push(newGroup);
    this.saveData(data);
    return newGroup;
  }

  public addGroupMember(groupId: string, newUserId: string): { success: boolean; error?: string } {
    const data = this.loadData();
    const group = data.groups.find(g => g.id === groupId);
    const user = this.getUser(newUserId);

    if (!group || !user) return { success: false, error: 'Group or User not found' };

    // SERVER RULE: MAXIMUM 15 MEMBERS
    if (group.members.length >= 15) {
      return { success: false, error: 'Accountability groups have a strict maximum capacity of 15 members.' };
    }

    if (group.members.some(m => m.userId === newUserId)) {
      return { success: false, error: 'User is already a member of this group.' };
    }

    group.members.push({
      userId: newUserId,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: 'MEMBER',
      joinedAt: new Date().toISOString(),
    });

    this.saveData(data);
    return { success: true };
  }
}

export const dbStore = new StorageEngine();
