import React, { useState } from 'react';
import { Bell, BellRing, X, Smartphone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  pushSupported, notificationPermission, subscribeCustomerToOrder, isOrderSubscribed,
} from '../lib/push';
import { isIOS, isStandalone } from '../lib/install';

const isPaid = (o) => o.status === 'Paid' || o.status === 'Fulfilled';

export default function PaymentAlertBanner() {
  const { clientOrders } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [, force] = useState(0);

  if (dismissed) return null;

  const unpaid = clientOrders.filter((o) => !isPaid(o));
  if (unpaid.length === 0) return null;

  const iosNeedsInstall = isIOS() && !isStandalone() && !pushSupported();
  const waiting = unpaid.filter((o) => !isOrderSubscribed(o.id));

  const shell = {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.85rem 1rem', margin: '0 0 1rem', borderRadius: '14px',
    border: '1px solid var(--primary)', background: 'rgba(15, 52, 96, 0.14)',
  };

  if (iosNeedsInstall) {
    return (
      <div style={shell} role="status">
        <Smartphone size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.45 }}>
          <strong>Want an alert when your payment is confirmed?</strong><br />
          Tap Share, choose Add to Home Screen, then open the store from your Home Screen.
        </div>
        <button type="button" className="btn-close" onClick={() => setDismissed(true)} aria-label="Dismiss"><X size={16} /></button>
      </div>
    );
  }

  if (!pushSupported() || notificationPermission() === 'denied') return null;

  if (waiting.length === 0) {
    return (
      <div style={{ ...shell, borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.12)' }} role="status">
        <BellRing size={22} color="var(--success)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>
          Alerts are on. We will notify you as soon as your payment is confirmed.
        </div>
      </div>
    );
  }

  const enable = async () => {
    setBusy(true);
    setMessage('');
    let denied = false;
    for (const o of waiting) {
      const result = await subscribeCustomerToOrder(o.id);
      if (result === 'denied') { denied = true; break; }
    }
    setBusy(false);
    if (denied) setMessage('Notifications are blocked. Allow them for this site in your browser settings.');
    force((n) => n + 1);
  };

  return (
    <div style={shell} role="status">
      <Bell size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.45 }}>
        <strong>Get notified when your payment is confirmed</strong>
        {message && <div style={{ color: 'var(--danger)', marginTop: 4 }}>{message}</div>}
      </div>
      <button type="button" onClick={enable} disabled={busy}
        style={{
          padding: '0.6rem 1rem', whiteSpace: 'nowrap', flexShrink: 0, border: 'none',
          borderRadius: '10px', background: 'var(--primary)', color: '#fff',
          fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
        }}>
        {busy ? 'Please wait' : 'Turn on'}
      </button>
      <button type="button" className="btn-close" onClick={() => setDismissed(true)} aria-label="Dismiss"><X size={16} /></button>
    </div>
  );
}
