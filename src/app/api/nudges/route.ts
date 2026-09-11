import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user_tara';
  const nudges = dbStore.getNudges(userId);
  return NextResponse.json({ nudges });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderId, receiverId, goalId, goalName, message, nudgeType } = body;

    if (!senderId || !receiverId || !message) {
      return NextResponse.json({ error: 'Missing nudge parameters' }, { status: 400 });
    }

    const result = dbStore.sendNudge({
      senderId,
      receiverId,
      goalId,
      goalName,
      message,
      nudgeType: nudgeType || 'COMPLETION_PUSH',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    return NextResponse.json({ nudge: result.nudge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send nudge' }, { status: 500 });
  }
}
