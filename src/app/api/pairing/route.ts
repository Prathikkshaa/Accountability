import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user_tara';
  const partnerships = dbStore.getPartnerships(userId);
  return NextResponse.json({ partnerships });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, code, partnerId } = body;

    if (action === 'GENERATE_INVITE') {
      const invite = dbStore.generateInviteCode(userId);
      return NextResponse.json({ invite });
    }

    if (action === 'ACCEPT_INVITE') {
      const result = dbStore.validateAndAcceptInvite(code, userId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, invite: result.invite });
    }

    if (action === 'DISCONNECT') {
      const success = dbStore.disconnectPartner(userId, partnerId);
      if (!success) {
        return NextResponse.json({ error: 'Partnership not found or already disconnected' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Disconnected. Reconnect cooldown of 4 hours has been initiated.' });
    }

    return NextResponse.json({ error: 'Invalid pairing action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Pairing request failed' }, { status: 500 });
  }
}
