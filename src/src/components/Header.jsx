import React from 'react';
import { useStore } from '../context/StoreContext';
import { Menu, Search, ShoppingBag, Receipt, X } from 'lucide-react';

export default function Header() {
  const {
    storeSettings,
    searchQuery,
    setSearchQuery,
    setIsSidebarOpen,
    setIsCustomerOrdersOpen,
    clientOrders
  } = useStore();

  const pendingCount = clientOrders.filter(o =>
    o.status === 'Pending Payment' || o.status === 'Processing'
  ).length;

  return (
    <header className="store-header">
      <div className="header-content">
        {/* Top Bar: Hamburger on top-left, Brand in center-left, Orders shortcut on right */}
        <div className="brand-section">
          <div className="brand-left">
            {/* Top-Left Hamburger Menu Button */}
            <button
              type="button"
              className="btn-hamburger"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              title="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="brand-logo">
              <ShoppingBag size={20} color="#fff" />
            </div>

            <div>
              <h1 className="brand-title">{storeSettings.storeName}</h1>
              <p className="brand-tagline">{storeSettings.tagline}</p>
            </div>
          </div>

          {/* Top-Right Quick Orders Shortcut */}
          <div className="brand-actions-group">
            <button
              type="button"
              className="btn-icon"
              onClick={() => setIsCustomerOrdersOpen(true)}
              title="My Orders"
              style={{ position: 'relative' }}
            >
              <Receipt size={16} />
              <span className="btn-label-desktop">Orders</span>
              {pendingCount > 0 && (
                <span className="badge-counter">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Full-width, uncrowded Search Bar */}
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search size={15} />
            <input
              className="search-input"
              type="text"
              placeholder="Search products, shoes, watches..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
