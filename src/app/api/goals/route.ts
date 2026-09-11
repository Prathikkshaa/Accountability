import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user_tara';
  const goals = dbStore.getGoals(userId);
  return NextResponse.json({ goals });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, category, description, measurementType, targetValue, targetUnit, frequencyPerWeek, selectedDays, visibility, reminderTime } = body;

    if (!userId || !name || !measurementType) {
      return NextResponse.json({ error: 'Missing required goal fields' }, { status: 400 });
    }

    const goal = dbStore.createGoal({
      userId,
      name,
      category: category || 'General',
      description: description || '',
      measurementType,
      targetValue: Number(targetValue) || 1,
      targetUnit: targetUnit || '',
      frequencyPerWeek: frequencyPerWeek ? Number(frequencyPerWeek) : undefined,
      selectedDays: selectedDays || [0, 1, 2, 3, 4, 5, 6],
      visibility: visibility || 'PARTNER_VISIBLE',
      startDate: new Date().toISOString().split('T')[0],
      reminderTime: reminderTime || undefined,
    });

    return NextResponse.json({ goal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create goal' }, { status: 500 });
  }
}
