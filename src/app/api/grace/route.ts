import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user_tara';
  const requests = dbStore.getPendingGraceRequests(userId);
  return NextResponse.json({ graceRequests: requests });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, goalId, date, reasonNote, reviewerId, graceId, status } = body;

    if (action === 'REQUEST') {
      const result = dbStore.requestGrace({
        userId,
        goalId,
        date,
        reasonNote,
        reviewerId,
      });
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ graceRequest: result.graceRequest });
    }

    if (action === 'REVIEW') {
      const success = dbStore.reviewGraceRequest(graceId, reviewerId, status);
      if (!success) {
        return NextResponse.json({ error: 'Failed to review grace request' }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Grace request operation failed' }, { status: 500 });
  }
}
