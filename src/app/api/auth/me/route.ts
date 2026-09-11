import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get('userId') || 'user_tara'; // Default to Tara Sharma

  let user = dbStore.getUser(requestedUserId);
  if (!user) {
    user = dbStore.getUser('user_tara');
  }

  const allUsers = dbStore.getAllUsers();
  return NextResponse.json({ currentUser: user, allUsers });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone } = body;

  const newUser = dbStore.createUser({
    name: name || 'New Member',
    email: email || 'user@example.com',
    phone: phone || '',
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  });

  return NextResponse.json({ currentUser: newUser });
}
