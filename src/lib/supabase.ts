import { createClient } from '@supabase/supabase-js';

// These are the PUBLIC client keys — safe to ship in the browser. All real
// security is enforced by Row-Level Security in the database. The secret key
// is never used here.
const SUPABASE_URL = 'https://qrpglzdxjuegnekqgwfs.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycGdsemR4anVlZ25la3Fnd2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTU2MDUsImV4cCI6MjEwNDc3MTYwNX0.Rvc4EvSjfWasOrp8VqEHa6Tgz1Tbxv22-EcR1giR7RM';

// Push (web-push) public VAPID key — also safe to embed.
export const VAPID_PUBLIC_KEY =
  'BCdYigeJCsVDO93qDWwFJPJK0bEmC8ZvqNcQFLYFFX2cCHlicMnSgrlKpD3usjuIy7x0XNGReKwWRNHCHdEMRp0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
});

export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
