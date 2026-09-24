import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Check, Package } from 'lucide-react';

export default function ProductCard({ product }) {
  const { storeSettings, addToCart, setSelectedProductForView } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ["Standard"];
  const [selectedSize, setSelectedSize] = useState(sizesList[0]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  const isOutOfStock = product.isStockTracked && product.stock <= 0;
  const isLowStock = product.isStockTracked && product.stock > 0 && product.stock <= 3;

  return (
    <div className="product-card" onClick={() => setSelectedProductForView(product)} style={{ cursor: 'pointer' }}>
      <div>
        <div className="product-emoji-container" style={{ overflow: 'hidden' }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          ) : (
            <Package size={36} color="var(--primary)" />
          )}

          {product.isStockTracked && (
            <span
              className={`stock-badge ${
                isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} Left` : 'In Stock'}
            </span>
          )}
        </div>

        <div className="product-category-tag">{product.category}</div>
        <h3 className="product-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{product.name}</span>
        </h3>
        {product.description && <p className="product-desc">{product.description}</p>}

        {/* Size / Variant Pills */}
        <div style={{ margin: '0.75rem 0' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Size / Variant:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {sizesList.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(sz);
                }}
                style={{
                  background: selectedSize === sz ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedSize === sz ? '#fff' : 'var(--text-muted)',
                  border: selectedSize === sz ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="product-footer" style={{ marginTop: '0.5rem' }}>
        <div className="product-price">
          {storeSettings.currency} {product.price.toLocaleString()}
        </div>

        <button
          className="btn-add-cart"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isAdded ? (
            <>
              <Check size={16} />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              <span>Add to cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
