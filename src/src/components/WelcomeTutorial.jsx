import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronRight, X, ShoppingBag, Smartphone, CreditCard, Package } from 'lucide-react';

const SLIDES = [
  {
    icon: ShoppingBag,
    title: 'Welcome to SHARP SHARP',
    text: 'Watches, shoes and more — browse the catalog and find what you need in seconds.'
  },
  {
    icon: Smartphone,
    title: 'Tap an item to choose',
    text: 'Open any product to pick a size or variant, check photos, then add it to your cart.'
  },
  {
    icon: CreditCard,
    title: 'Pay with MoMo',
    text: 'Checkout shows our Mobile Money number. Send payment, then confirm on WhatsApp with one tap.'
  },
  {
    icon: Package,
    title: 'Track your orders',
    text: 'Open "My Orders" any time to see order status and reorder past purchases instantly.'
  }
];

export default function WelcomeTutorial() {
  const { isTutorialOpen, setIsTutorialOpen } = useStore();
  const [index, setIndex] = useState(0);

  if (!isTutorialOpen) return null;

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  const finish = () => setIsTutorialOpen(false);
  const next = () => {
    if (isLast) finish();
    else setIndex(i => i + 1);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }} onClick={finish}>
      <div
        className="modal-content"
        style={{ maxWidth: 380, textAlign: 'center', padding: '2rem 1.5rem' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="btn-close"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
          onClick={finish}
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--primary-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Icon size={32} color="#fff" />
        </div>

        {/* Text */}
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.75rem' }}>
          {slide.text}
        </p>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? 20 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === index ? 'var(--primary)' : 'var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={next}
          style={{
            background: 'var(--primary-gradient)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            margin: '0 auto',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          {isLast ? 'Start Shopping' : 'Next'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
