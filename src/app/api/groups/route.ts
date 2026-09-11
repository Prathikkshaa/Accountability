import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user_tara';
  const groups = dbStore.getGroups(userId);
  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, creatorId, groupId, newUserId } = body;

    if (action === 'CREATE') {
      const group = dbStore.createGroup(name, creatorId);
      return NextResponse.json({ group });
    }

    if (action === 'ADD_MEMBER') {
      const result = dbStore.addGroupMember(groupId, newUserId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid group action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Group operation failed' }, { status: 500 });
  }
}
