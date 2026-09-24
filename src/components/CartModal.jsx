import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, ArrowLeft, Plus, Minus, Trash2, ArrowRight, ShoppingCart, Package, ShoppingBag } from 'lucide-react';

export default function CartModal() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    totalCartPrice,
    storeSettings,
    setIsCheckoutOpen
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setIsCartOpen(false)}
            style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <h2 className="modal-title" style={{ fontSize: '1.05rem', margin: '0 0.5rem', flex: 1, textAlign: 'center' }}>
            <ShoppingCart size={18} color="var(--primary)" />
            <span>Shopping Cart</span>
          </h2>
          <button className="btn-close" onClick={() => setIsCartOpen(false)} title="Close cart">
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
              <ShoppingBag size={48} color="var(--text-dim)" />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>Your cart is empty</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Browse SHARP SHARP store and add items!</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="cart-list">
              {cart.map((item) => {
                const keyId = item.cartItemId || item.id;
                return (
                  <div key={keyId} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-emoji">
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <Package size={20} color="var(--primary)" />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="cart-item-title">{item.name}</div>
                        {item.selectedSize && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
                            Size: {item.selectedSize}
                          </div>
                        )}
                        <div className="cart-item-price">
                          {storeSettings.currency} {item.price.toLocaleString()} x {item.quantity}
                          {' = '}
                          <strong>
                            {storeSettings.currency} {(item.price * item.quantity).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Controls: qty stepper + delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateCartQuantity(keyId, -1)} title="Decrease">
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateCartQuantity(keyId, 1)} title="Increase">
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-close"
                        style={{ width: '30px', height: '30px', flexShrink: 0 }}
                        onClick={() => removeFromCart(keyId)}
                        title="Remove item"
                      >
                        <Trash2 size={14} color="#f87171" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: 'auto' }}>
              {/* Total row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Amount:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {storeSettings.currency} {totalCartPrice.toLocaleString()}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  className="btn-publish"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>

                {/* Clear Cart */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remove all items from cart?')) clearCart();
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    color: '#f87171',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.55rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Trash2 size={15} />
                  <span>Clear Cart</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
