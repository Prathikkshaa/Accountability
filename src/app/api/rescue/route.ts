import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goalId, rescuedByUserId, date } = body;

    const result = dbStore.rescueStreak({ goalId, rescuedByUserId, date });
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to rescue streak' }, { status: 400 });
    }

    return NextResponse.json({ rescue: result.rescue });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Streak rescue failed' }, { status: 500 });
  }
}
