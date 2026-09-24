import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ArrowLeft,
  Receipt,
  Sun,
  Moon,
  HelpCircle,
  Settings,
  MessageSquare,
  ShoppingBag,
  CreditCard,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    storeSettings,
    clientOrders,
    theme,
    toggleTheme,
    setIsTutorialOpen,
    setIsManageOpen,
    setIsCustomerOrdersOpen
  } = useStore();

  const [copiedMomo, setCopiedMomo] = React.useState(false);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="brand-logo" style={{ width: 38, height: 38 }}>
              <ShoppingBag size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {storeSettings.storeName}
              </h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {storeSettings.tagline}
              </p>
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
              setIsCustomerOrdersOpen(true);
            }}
          >
            <div className="sidebar-item-left">
              <div className="sidebar-item-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
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
              setIsTutorialOpen(true);
            }}
          >
            <div className="sidebar-item-left">
              <div className="sidebar-item-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                <HelpCircle size={18} />
              </div>
              <div>
                <div className="sidebar-item-label">How It Works</div>
                <div className="sidebar-item-desc">Shopping & MoMo guide tutorial</div>
              </div>
            </div>

            <ChevronRight size={16} color="var(--text-dim)" />
          </button>

          {/* Admin Control Panel */}
          <button
            type="button"
            className="sidebar-item"
            style={{ background: 'rgba(99, 102, 241, 0.06)', borderColor: 'var(--border-active)' }}
            onClick={() => {
              setIsSidebarOpen(false);
              setIsManageOpen(true);
            }}
          >
            <div className="sidebar-item-left">
              <div className="sidebar-item-icon" style={{ background: 'var(--primary-gradient)', color: '#fff' }}>
                <Settings size={18} />
              </div>
              <div>
                <div className="sidebar-item-label" style={{ color: '#fff' }}>Store Management</div>
                <div className="sidebar-item-desc">Admin panel, catalog & stock</div>
              </div>
            </div>

            <ChevronRight size={16} color="var(--primary)" />
          </button>

          {/* Direct Support Section */}
          <div className="sidebar-section-title" style={{ marginTop: '1.25rem' }}>Store Support & Payment</div>

          {/* WhatsApp Support */}
          <button
            type="button"
            className="sidebar-item"
            onClick={openWhatsAppSupport}
          >
            <div className="sidebar-item-left">
              <div className="sidebar-item-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <div className="sidebar-item-label">WhatsApp Customer Service</div>
                <div className="sidebar-item-desc">Instant customer support chat</div>
              </div>
            </div>

            <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700 }}>Online</span>
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

            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
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
