import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goal = dbStore.getGoalById(id);
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }
  const checkIns = dbStore.getGoalCheckIns(id);
  return NextResponse.json({ goal, checkIns });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updated = dbStore.updateGoal(id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }

  return NextResponse.json({ goal: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = dbStore.archiveGoal(id);
  if (!success) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restarted = dbStore.restartGoal(id);
  if (!restarted) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }

  return NextResponse.json({ goal: restarted });
}
