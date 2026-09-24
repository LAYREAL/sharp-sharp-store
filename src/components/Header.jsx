import React from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Settings, ShoppingBag, Receipt, Sun, Moon, HelpCircle } from 'lucide-react';

export default function Header() {
  const {
    storeSettings,
    searchQuery,
    setSearchQuery,
    setIsManageOpen,
    setIsCustomerOrdersOpen,
    clientOrders,
    theme,
    toggleTheme,
    setIsTutorialOpen
  } = useStore();

  const pendingCount = clientOrders.filter(o =>
    o.status === 'Pending Payment' || o.status === 'Processing'
  ).length;

  return (
    <header className="store-header">
      <div className="header-content">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-left">
            <div className="brand-logo">
              <ShoppingBag size={22} color="#fff" />
            </div>
            <div>
              <h1 className="brand-title">{storeSettings.storeName}</h1>
              <p className="brand-tagline">{storeSettings.tagline}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="header-actions">
          {/* Search */}
          <div className="search-input-wrapper">
            <Search size={15} />
            <input
              className="search-input"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* My Orders */}
          <button
            className="btn-icon"
            onClick={() => setIsCustomerOrdersOpen(true)}
            title="My Orders"
            style={{ position: 'relative' }}
          >
            <Receipt size={16} />
            <span style={{ display: 'none' }} className="btn-label-desktop">My Orders</span>
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -6, right: -6,
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: 18, height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Tutorial */}
          <button className="btn-icon" onClick={() => setIsTutorialOpen(true)} title="How it works">
            <HelpCircle size={16} />
          </button>

          {/* Admin */}
          <button
            className="btn-icon"
            onClick={() => setIsManageOpen(true)}
            title="Manage Store"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
