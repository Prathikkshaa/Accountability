export type MeasurementType = 'BINARY' | 'DURATION' | 'QUANTITY' | 'FREQUENCY';

export type GoalVisibility = 'PARTNER_VISIBLE' | 'PRIVATE';

export type GoalStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type MoodState = 'BAD' | 'MEH' | 'GOOD' | 'GREAT' | 'AMAZING';

export type InviteStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';

export type GraceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SharedGoalMode = 'INDIVIDUAL_CHALLENGE' | 'COLLECTIVE_TARGET';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone?: string;
  timezone: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  measurementType: MeasurementType;
  targetValue: number;
  targetUnit?: string; // e.g. 'min', 'pages', 'km', 'times'
  frequencyPerWeek?: number; // e.g. 3 for 3x/week
  selectedDays?: number[]; // [0, 1, 2, 3, 4, 5, 6] 0 = Sun
  visibility: GoalVisibility;
  startDate: string;
  endDate?: string;
  reminderTime?: string; // e.g. "20:00"
  status: GoalStatus;
  stake?: string; // optional self-imposed consequence for missing, e.g. "$5 to charity"
  createdAt: string;
  // Computed fields
  currentStreak?: number;
  longestStreak?: number;
  totalCompletions?: number;
  completedToday?: boolean;
  todayCheckIn?: DailyCheckIn;
}

export interface DailyCheckIn {
  id: string;
  goalId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  quantityCompleted?: number;
  proofPhotoUrl?: string;
  note?: string;
  mood?: MoodState;
  checkedInAt: string;
}

export interface AccountabilityPartner {
  id: string;
  userId: string;
  partnerId: string;
  partnerUser: User;
  status: 'ACTIVE' | 'PENDING' | 'DISCONNECTED';
  connectedAt: string;
  disconnectedAt?: string;
  goals: Goal[];
  sharedStreak?: number; // consecutive days both partners showed up
  daysSincePaired?: number;
}

export interface InviteCode {
  code: string;
  inviterId: string;
  inviterName: string;
  inviterAvatar: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}

export interface Nudge {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  goalId?: string;
  goalName?: string;
  message: string;
  nudgeType: 'COMPLETION_PUSH' | 'STREAK_WARNING' | 'MISSED_DAY_SUPPORT' | 'CELEBRATION' | 'CUSTOM';
  status: 'DELIVERED' | 'READ';
  createdAt: string;
}

export interface GraceRequest {
  id: string;
  checkInId?: string;
  goalId: string;
  goalName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  date: string;
  reasonNote: string;
  status: GraceStatus;
  reviewerId: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface StreakRescue {
  id: string;
  goalId: string;
  goalName: string;
  userId: string;
  rescuedByUserId: string;
  rescuedByName: string;
  date: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  creatorId: string;
  members: GroupMember[];
  sharedGoals: SharedGoal[];
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  avatarUrl: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  completedTodayCount?: number;
  totalGoalsCount?: number;
}

export interface SharedGoal {
  id: string;
  groupId: string;
  name: string;
  measurementType: MeasurementType;
  targetValue: number;
  targetUnit?: string;
  mode: SharedGoalMode;
  startDate: string;
  endDate?: string;
  contributions: {
    userId: string;
    userName: string;
    userAvatar: string;
    completed: boolean;
    quantity: number;
  }[];
  totalProgress?: number;
}

export interface NotificationPref {
  userId: string;
  partnerNudges: boolean;
  goalReminders: boolean;
  streakAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
}
