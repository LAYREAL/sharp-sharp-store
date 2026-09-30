import { supabase, isSupabaseConfigured } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlB64ToUint8Array = (b64) => {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const pushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window &&
  Boolean(VAPID_PUBLIC_KEY) &&
  isSupabaseConfigured;

export const notificationPermission = () =>
  typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('SW registration failed:', e));
  });
}

async function getOrCreateSubscription() {
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
  });
}

/**
 * Ask permission (if needed) and register this device to be told when `orderId` is paid.
 * Returns 'ok' | 'denied' | 'unsupported' | 'error'. Never throws.
 */
export async function subscribeCustomerToOrder(orderId) {
  try {
    if (!pushSupported()) return 'unsupported';
    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';

    const sub = await getOrCreateSubscription();
    const { error } = await supabase.rpc('register_push', {
      p_role: 'customer',
      p_order_id: String(orderId),
      p_endpoint: sub.endpoint,
      p_subscription: sub.toJSON(),
    });
    return error ? 'error' : 'ok';
  } catch (e) {
    console.warn('subscribeCustomerToOrder failed:', e);
    return 'error';
  }
}

// ---------------------------------------------------------------------------
// Pending queue: on phones, opening WhatsApp right after checkout can pause this page
// before the subscription is saved. We remember the order id and finish registering
// the next time the store is in front of the customer.
// ---------------------------------------------------------------------------
const PENDING_KEY = 'sharp_push_pending';

const readPending = () => {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; }
};
const writePending = (list) => {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); } catch { /* ignore */ }
};

export function queuePushForOrder(orderId) {
  const list = readPending();
  if (!list.includes(String(orderId))) writePending([...list, String(orderId)]);
}

export async function registerPendingPush() {
  try {
    if (!pushSupported() || Notification.permission !== 'granted') return;
    for (const id of readPending()) {
      const result = await subscribeCustomerToOrder(id);
      if (result === 'ok') writePending(readPending().filter((x) => x !== id));
    }
  } catch (e) {
    console.warn('registerPendingPush failed:', e);
  }
}

// Must be called straight from a tap so the browser will show its permission prompt.
export async function askPushPermission() {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try { return await Notification.requestPermission(); } catch { return 'default'; }
}
