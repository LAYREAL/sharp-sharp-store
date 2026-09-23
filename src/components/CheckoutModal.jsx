import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateWhatsAppLink } from '../utils/whatsappFormatter';
import { X, Phone, User, MapPin, Copy, Check, MessageSquare, ShieldCheck, CreditCard, Info } from 'lucide-react';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    totalCartPrice,
    storeSettings,
    addOrder,
    clearCart
  } = useStore();

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const handleCopyMoMo = () => {
    if (storeSettings.momoNumber) {
      navigator.clipboard.writeText(storeSettings.momoNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppCheckout = (e) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setErrorMsg('Please fill in all 3 required fields (Name, Phone, and Delivery Address).');
      return;
    }

    setErrorMsg('');
    addOrder(customer);
    const waUrl = generateWhatsAppLink(storeSettings, cart, totalCartPrice, customer);
    window.open(waUrl, '_blank');
    clearCart();
    setIsCheckoutOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <CreditCard size={20} color="var(--primary)" />
            <span>SHARP SHARP - Order Checkout</span>
          </h2>
          <button className="btn-close" onClick={() => setIsCheckoutOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleWhatsAppCheckout}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                fontWeight: 600
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Form Fields */}
          <div className="form-group">
            <label className="form-label">
              <User size={14} />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Kwesi Manu"
              required
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Phone size={14} />
              <span>Phone Number *</span>
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 024 123 4567"
              required
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <MapPin size={14} />
              <span>Delivery Address *</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Plot 12, Spintex Road, Accra"
              required
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />
          </div>

          {/* MoMo Payment Details Display */}
          <div className="momo-card">
            <div className="momo-card-header">
              <span className="momo-title">
                <ShieldCheck size={16} />
                <span>Mobile Money Payment Details</span>
              </span>
              <button
                type="button"
                className="btn-copy"
                onClick={handleCopyMoMo}
                title="Copy MoMo Number"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy No.'}</span>
              </button>
            </div>

            <div className="momo-detail-row">
              <span style={{ color: 'var(--text-muted)' }}>Network / Provider:</span>
              <strong>{storeSettings.momoNetwork}</strong>
            </div>
            <div className="momo-detail-row">
              <span style={{ color: 'var(--text-muted)' }}>MoMo Number:</span>
              <strong style={{ fontSize: '1rem', color: '#fbbf24' }}>{storeSettings.momoNumber}</strong>
            </div>
            <div className="momo-detail-row">
              <span style={{ color: 'var(--text-muted)' }}>Account Name:</span>
              <strong>{storeSettings.momoName}</strong>
            </div>
            <div className="momo-detail-row" style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(245, 158, 11, 0.3)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Exact Amount to Send:</span>
              <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                {storeSettings.currency} {totalCartPrice.toLocaleString()}
              </strong>
            </div>
          </div>

          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={14} color="var(--primary)" />
            <span>Send MoMo to the number above, then tap <strong>"Send order on WhatsApp"</strong> to dispatch order details.</span>
          </p>

          <button type="submit" className="btn-whatsapp">
            <MessageSquare size={20} />
            <span>Send Order on WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}
