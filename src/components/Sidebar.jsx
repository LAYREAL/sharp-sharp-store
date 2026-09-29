import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ArrowLeft,
  Receipt,
  Sun,
  Moon,
  HelpCircle,
  MessageSquare,
  CreditCard,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useInstall } from '../lib/useInstall';

export default function Sidebar() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    storeSettings,
    clientOrders,
    theme,
    toggleTheme,
    setIsTutorialOpen,
    setIsCustomerOrdersOpen
  } = useStore();

  const [copiedMomo, setCopiedMomo] = React.useState(false);
  const [showIosTip, setShowIosTip] = React.useState(false);
  const { state: installState, install } = useInstall();

  if (!isSidebarOpen) return null;

  const pendingCount = clientOrders.filter(o =>
    o.status === 'Pending Payment' || o.status === 'Processing'
  ).length;

  const handleCopyMoMo = (e) => {
    e.stopPropagation();
    if (storeSettings.momoNumber) {
      navigator.clipboard.writeText(storeSettings.momoNumber);
      setCopiedMomo(true);
      setTimeout(() => setCopiedMomo(false), 2000);
    }
  };

  const openWhatsAppSupport = () => {
    const phone = (storeSettings.whatsappNumber || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent('Hello SHARP SHARP, I would like some assistance.')}`;
    window.open(url, '_blank');
    setIsSidebarOpen(false);
  };

  return (
    <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}>
      <aside className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/logo-mark.png" alt="" aria-hidden="true" className="sidebar-mark" />
            <div className="brand-wordmark brand-wordmark-sm" aria-label={storeSettings.storeName}>
              <img src="/wordmark-short-300.png" alt={storeSettings.storeName} className="wm-navy" />
              <img src="/wordmark-short-light-300.png" alt="" aria-hidden="true" className="wm-white" />
            </div>
          </div>

          <button
            type="button"
            className="btn-close"
            onClick={() => setIsSidebarOpen(false)}
            title="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="sidebar-content">
          <div className="sidebar-section-title">Navigation</div>

          {/* My Orders */}
          <button
            type="button"
            className="sidebar-item"
            onClick={() => {
              setIsSidebarOpen(false);
              setTimeout(() => setIsCustomerOrdersOpen(true), 60);
            }}
          >
            <div className="sidebar-item-left">
              <div className="sidebar-item-icon" style={{ background: 'rgba(15, 52, 96, 0.15)', color: 'var(--primary)' }}>
                <Receipt size={18} />
              </div>
              <div>
                <div className="sidebar-item-label">My Orders & Receipts</div>
                <div className="sidebar-item-desc">Track status and download invoices</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {pendingCount > 0 && (
                <span className="badge-counter" style={{ position: 'static' }}>
                  {pendingCount}
                </span>
              )}
              <ChevronRight size={16} color="var(--text-dim)" />
            </div>
          </button>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            className="sidebar-item"
            onClick={toggleTheme}
          >
            <div className="sidebar-item-left">
              <div className="sidebar-item-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-momo)' }}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <div>
                <div className="sidebar-item-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</div>
                <div className="sidebar-item-desc">Switch display color appearance</div>
              </div>
            </div>

            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text-muted)'
            }}>
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* How It Works Tutorial */}
          <button
            type="button"
            className="sidebar-item"
            onClick={() => {
              setIsSidebarOpen(false);
              setTimeout(() => setIsTutorialOpen(true), 60);
            }}
          >
            <div className="sidebar-item-left">
              <div className="sidebar-item-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' }}>
                <HelpCircle size={18} />
              </div>
              <div>
                <div className="sidebar-item-label">How It Works</div>
                <div className="sidebar-item-desc">Shopping & MoMo guide tutorial</div>
              </div>
            </div>

            <ChevronRight size={16} color="var(--text-dim)" />
          </button>

          {/* Add to Home Screen (hidden when already installed or not installable) */}
          {(installState === 'prompt' || installState === 'ios') && (
            <>
              <button
                type="button"
                className="sidebar-item"
                onClick={() => {
                  if (installState === 'prompt') install();
                  else setShowIosTip(v => !v);
                }}
              >
                <div className="sidebar-item-left">
                  <div className="sidebar-item-icon" style={{ background: 'rgba(15, 52, 96, 0.15)', color: 'var(--primary)' }}>
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <div className="sidebar-item-label">Add to Home Screen</div>
                    <div className="sidebar-item-desc">Install SHARP SHARP like an app</div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-dim)" />
              </button>
              {installState === 'ios' && showIosTip && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0.9rem 0.75rem', lineHeight: 1.5 }}>
                  In Safari, tap the <strong>Share</strong> button, then choose <strong>Add to Home Screen</strong>.
                </div>
              )}
            </>
          )}

          {/* Direct Support Section */}
          <div className="sidebar-section-title" style={{ marginTop: '1.25rem' }}>Store Support & Payment</div>

          {/* WhatsApp Support */}
          <button
            type="button"
            className="sidebar-item"
            onClick={openWhatsAppSupport}
          >
            <div className="sidebar-item-left">
              <div className="sidebar-item-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <div className="sidebar-item-label">WhatsApp Customer Service</div>
                <div className="sidebar-item-desc">Instant customer support chat</div>
              </div>
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>Online</span>
          </button>

          {/* MoMo Account Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '0.85rem',
            marginTop: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-momo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official MoMo Details
              </span>
              <button
                type="button"
                className="btn-copy"
                onClick={handleCopyMoMo}
                title="Copy number"
              >
                {copiedMomo ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedMomo ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {storeSettings.momoNumber}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {storeSettings.momoName} • {storeSettings.momoNetwork}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>Verified MoMo Shopping • SHARP SHARP</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
