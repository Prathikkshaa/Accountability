// Supabase Edge Function: send a Web Push notification when a nudge is inserted.
// Triggered by a Database Webhook on public.nudges (INSERT).
//
// Secrets required (Project Settings -> Edge Functions):
//   VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT (e.g. mailto:you@example.com)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') || 'mailto:app@example.com',
  Deno.env.get('VAPID_PUBLIC')!,
  Deno.env.get('VAPID_PRIVATE')!,
);

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const nudge = body.record ?? body; // DB webhook sends { record: {...} }
    if (!nudge?.receiver_id) return new Response('no receiver', { status: 200 });

    // Sender's name for a friendlier title
    const { data: sender } = await supabase
      .from('profiles').select('name').eq('id', nudge.sender_id).maybeSingle();

    const { data: subs } = await supabase
      .from('push_subscriptions').select('*').eq('user_id', nudge.receiver_id);

    const payload = JSON.stringify({
      title: sender?.name ? `${sender.name} nudged you` : 'A nudge',
      body: nudge.message || 'Someone is cheering you on.',
      url: '/Accountability/app/',
    });

    await Promise.all((subs || []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
      } catch (err: any) {
        // 404/410 = subscription gone; clean it up
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        }
      }
    }));

    return new Response('ok', { status: 200 });
  } catch (e) {
    return new Response(`error: ${e}`, { status: 200 });
  }
});
