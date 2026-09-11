import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goalId, userId, date, completed, quantityCompleted, proofPhotoUrl, note, mood } = body;

    if (!goalId || !userId || !date) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = dbStore.performCheckIn({
      goalId,
      userId,
      date,
      completed: !!completed,
      quantityCompleted: quantityCompleted ? Number(quantityCompleted) : undefined,
      proofPhotoUrl,
      note,
      mood,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Also return updated streak
    const streakInfo = dbStore.calculateStreak(goalId);

    return NextResponse.json({
      checkIn: result.checkIn,
      streak: streakInfo,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Check-in failed' }, { status: 500 });
  }
}
