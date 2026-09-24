import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Check, Package } from 'lucide-react';

export default function ProductCard({ product }) {
  const { storeSettings, addToCart, setSelectedProductForView } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ["Standard"];
  const hasVariants = sizesList.length > 1;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (hasVariants) {
      // Multiple sizes — open the detail view so they can choose one.
      setSelectedProductForView(product);
      return;
    }
    addToCart(product, sizesList[0]);
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
        {hasVariants && (
          <div className="size-hint" onClick={(e) => { e.stopPropagation(); setSelectedProductForView(product); }}>
            {sizesList.length} sizes available — tap to choose
          </div>
        )}
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
          ) : hasVariants ? (
            <>
              <ShoppingBag size={16} />
              <span>Choose size</span>
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
