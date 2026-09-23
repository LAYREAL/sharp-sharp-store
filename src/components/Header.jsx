import React from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Settings, ShoppingBag, Receipt } from 'lucide-react';

export default function Header() {
  const {
    storeSettings,
    searchQuery,
    setSearchQuery,
    setIsManageOpen,
    setIsCustomerOrdersOpen,
    clientOrders
  } = useStore();

  return (
    <header className="store-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-logo">
            <ShoppingBag size={24} color="#fff" />
          </div>
          <div>
            <h1 className="brand-title">{storeSettings.storeName}</h1>
            <p className="brand-tagline">{storeSettings.tagline}</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            className="btn-icon"
            onClick={() => setIsCustomerOrdersOpen(true)}
            title="My Past Orders & Receipts"
          >
            <Receipt size={18} />
            <span className="hide-mobile">My Orders</span>
            {clientOrders.length > 0 && (
              <span
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '9999px',
                  padding: '0.1rem 0.4rem',
                  marginLeft: '0.2rem'
                }}
              >
                {clientOrders.length}
              </span>
            )}
          </button>

          <button
            className="btn-icon"
            onClick={() => setIsManageOpen(true)}
            title="Owner Store Settings"
          >
            <Settings size={18} />
            <span className="hide-mobile">Manage</span>
          </button>
        </div>
      </div>
    </header>
  );
}
