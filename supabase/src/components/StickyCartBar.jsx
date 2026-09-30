import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export default function StickyCartBar() {
  const { cart, totalCartItems, totalCartPrice, storeSettings, setIsCartOpen } = useStore();

  if (cart.length === 0) return null;

  return (
    <div className="sticky-cart-bar">
      <div className="cart-bar-info">
        <div className="cart-bar-badge">{totalCartItems}</div>
        <div className="cart-bar-details">
          <span className="cart-bar-count">{totalCartItems} {totalCartItems === 1 ? 'Item' : 'Items'} selected</span>
          <span className="cart-bar-total">{storeSettings.currency} {totalCartPrice.toLocaleString()}</span>
        </div>
      </div>

      <button className="btn-view-cart" onClick={() => setIsCartOpen(true)}>
        <span>View Cart</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
