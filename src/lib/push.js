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
