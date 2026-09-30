// Supabase Edge Function: sends Web Push for order events.
//   • orders INSERT                     -> notify every admin device
//   • orders UPDATE (status -> Paid/Fulfilled) -> notify that order's customer device(s)
// Triggered by two Database Webhooks (see supabase/README-push.md).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const PAID = new Set(['Paid', 'Fulfilled']);

async function sendTo(rows: any[], payload: Record<string, unknown>) {
  await Promise.all(rows.map(async (row) => {
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify(payload));
    } catch (e: any) {
      // 404/410 = device unsubscribed or expired -> clean it up
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await db.from('push_subscriptions').delete().eq('id', row.id);
      } else {
        console.error('push failed', e?.statusCode, e?.body);
      }
    }
  }));
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('forbidden', { status: 403 });
  }

  const { type, record, old_record } = await req.json();
  if (!record) return new Response('ignored');

  const { data: settings } = await db.from('store_settings').select('currency').eq('id', 1).single();
  const currency = settings?.currency ?? '';

  if (type === 'INSERT') {
    const { data: admins } = await db.from('push_subscriptions').select('*').eq('role', 'admin');
    await sendTo(admins ?? [], {
      title: 'New order',
      body: `${record.customer_name ?? 'A customer'} placed order ${record.id} — ${currency} ${Number(record.total_amount ?? 0).toLocaleString()}`,
      tag: `order-${record.id}`,
      url: '/',
    });
  }

  if (type === 'UPDATE' && PAID.has(record.status) && !PAID.has(old_record?.status)) {
    const { data: customers } = await db
      .from('push_subscriptions').select('*')
      .eq('role', 'customer').eq('order_id', String(record.id));
    await sendTo(customers ?? [], {
      title: 'Payment confirmed',
      body: `Thanks! We've confirmed your payment for order ${record.id}.`,
      tag: `paid-${record.id}`,
      url: '/',
    });
  }

  return new Response('ok');
});
