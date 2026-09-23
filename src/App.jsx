import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import ProductCard from './components/ProductCard';
import StickyCartBar from './components/StickyCartBar';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import ManageModal from './components/ManageModal';
import ProductDetailModal from './components/ProductDetailModal';
import MediaLightboxModal from './components/MediaLightboxModal';
import CustomerOrdersModal from './components/CustomerOrdersModal';
import { Radio } from 'lucide-react';

function StoreMain() {
  const { products, activeCategory, searchQuery, publishNotification } = useStore();

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Live Toast Broadcast Notification */}
      {publishNotification && (
        <div className="toast-banner">
          <Radio size={18} />
          <span>{publishNotification}</span>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="app-container">
        {/* Category Tabs */}
        <CategoryTabs />

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔎</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No products found
            </h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Try searching for a different keyword or select another category tab.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Bar */}
      <StickyCartBar />

      {/* Slide-over & Dialog Modals */}
      <CartModal />
      <CheckoutModal />
      <ManageModal />
      <ProductDetailModal />
      <MediaLightboxModal />
      <CustomerOrdersModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreMain />
    </StoreProvider>
  );
}
