import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingCart, Package, ShoppingBag } from 'lucide-react';

export default function CartModal() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    totalCartPrice,
    storeSettings,
    setIsCheckoutOpen
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <ShoppingCart size={20} color="var(--primary)" />
            <span>Your Shopping Cart</span>
          </h2>
          <button className="btn-close" onClick={() => setIsCartOpen(false)}>
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
                      <div>
                        <div className="cart-item-title">{item.name}</div>
                        {item.selectedSize && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                            Size: {item.selectedSize}
                          </div>
                        )}
                        <div className="cart-item-price">
                          {storeSettings.currency} {item.price.toLocaleString()} x {item.quantity} = {' '}
                          <strong style={{ color: '#fff' }}>
                            {storeSettings.currency} {(item.price * item.quantity).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateCartQuantity(keyId, -1)}>
                          <Minus size={14} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateCartQuantity(keyId, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        className="btn-close"
                        style={{ width: '28px', height: '28px' }}
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

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Amount:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  {storeSettings.currency} {totalCartPrice.toLocaleString()}
                </span>
              </div>

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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
