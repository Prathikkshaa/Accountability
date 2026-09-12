import { supabase, currentUserId, VAPID_PUBLIC_KEY } from './supabase';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Ask permission, subscribe this device to web push, and save the
// subscription so the server can push nudges to it.
export async function subscribeToPush(): Promise<{ ok: boolean; reason?: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'Push not supported on this device/browser.' };
  }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return { ok: false, reason: 'Notifications not allowed.' };

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
  });
  const uid = await currentUserId();
  if (!uid) return { ok: false, reason: 'Not signed in.' };
  const json: any = sub.toJSON();
  const { error } = await supabase.from('push_subscriptions').upsert(
    { user_id: uid, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
    { onConflict: 'endpoint' },
  );
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
