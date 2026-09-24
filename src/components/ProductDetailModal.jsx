import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ArrowLeft, ShoppingBag, Check, ShieldCheck, Truck, Play, Maximize2, Package } from 'lucide-react';

export default function ProductDetailModal() {
  const {
    selectedProductForView,
    setSelectedProductForView,
    storeSettings,
    addToCart,
    setActiveLightboxMedia
  } = useStore();

  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const product = selectedProductForView;

  const mediaList = React.useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.image) {
      list.push({ type: 'image', url: product.image });
    }
    if (product.media && Array.isArray(product.media)) {
      product.media.forEach(m => {
        if (m.url && !list.some(existing => existing.url === m.url)) {
          list.push(m);
        }
      });
    }
    return list;
  }, [product]);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    if (product) {
      const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ["Standard"];
      setSelectedSize(sizesList[0]);
      setActiveMediaIndex(0);
    }
  }, [product]);

  if (!product) return null;

  const activeMedia = mediaList[activeMediaIndex] || (product.image ? { type: 'image', url: product.image } : null);
  const isVideo = activeMedia && (activeMedia.type === 'video' || activeMedia.url.startsWith('data:video') || activeMedia.url.match(/\.(mp4|webm|ogg)$/i));

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const isOutOfStock = product.isStockTracked && product.stock <= 0;
  const isLowStock = product.isStockTracked && product.stock > 0 && product.stock <= 3;
  const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ["Standard"];

  return (
    <div className="modal-overlay" onClick={() => setSelectedProductForView(null)}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', padding: '0', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Product Media Display */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '320px',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: activeMedia ? 'pointer' : 'default'
          }}
          onClick={() => {
            if (activeMedia) {
              setActiveLightboxMedia({ ...activeMedia, title: product.name });
            }
          }}
        >
          {activeMedia ? (
            isVideo ? (
              <video
                src={activeMedia.url}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <img
                src={activeMedia.url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )
          ) : (
            <Package size={64} color="var(--primary)" />
          )}

          <button
            type="button"
            className="btn-icon"
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 10,
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.4rem 0.75rem',
              gap: '0.35rem'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProductForView(null);
            }}
          >
            <ArrowLeft size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Back</span>
          </button>

          <button
            className="btn-close"
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 10 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProductForView(null);
            }}
          >
            <X size={18} />
          </button>

          {activeMedia && (
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Maximize2 size={12} />
              <span>Click for Full View</span>
            </div>
          )}

          {product.isStockTracked && (
            <span
              className={`stock-badge ${
                isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'
              }`}
              style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}
            >
              {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} Left` : 'In Stock'}
            </span>
          )}
        </div>

        {/* Thumbnail Carousel Row */}
        {mediaList.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem 0', overflowX: 'auto', background: 'rgba(255,255,255,0.02)' }}>
            {mediaList.map((m, idx) => {
              const mIsVid = m.type === 'video' || m.url.startsWith('data:video') || m.url.match(/\.(mp4|webm|ogg)$/i);
              return (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: activeMediaIndex === idx ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: '#000',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: 0,
                    flexShrink: 0
                  }}
                >
                  {mIsVid ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1b4b', color: '#fff' }}>
                      <Play size={18} />
                    </div>
                  ) : (
                    <img src={m.url} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.category}
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
            {product.name}
          </h2>

          <div className="product-detail-price" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            {storeSettings.currency} {product.price.toLocaleString()}
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            {product.description || 'No detailed description provided for this item.'}
          </p>

          {/* Available Sizes */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Select Size / Variant:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sizesList.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    background: selectedSize === sz ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedSize === sz ? '#fff' : 'var(--text-muted)',
                    border: selectedSize === sz ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Truck size={14} color="var(--primary)" /> Fast MoMo Dispatch
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} color="#22c55e" /> Direct WhatsApp Order
            </span>
          </div>

          <button
            className="btn-add-cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
          >
            {isAdded ? (
              <>
                <Check size={18} />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span>Add {selectedSize ? `[${selectedSize}]` : ''} to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
