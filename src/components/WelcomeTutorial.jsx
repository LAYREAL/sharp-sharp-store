import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronRight, X } from 'lucide-react';

const SLIDES = [
  {
    emoji: '👋',
    title: 'Welcome to SHARP SHARP',
    text: 'Watches, shoes and more — browse the catalog and find what you need in seconds.'
  },
  {
    emoji: '🛍️',
    title: 'Tap an item to choose',
    text: 'Open any product to pick a size or variant, check photos, then add it to your cart.'
  },
  {
    emoji: '💳',
    title: 'Pay with MoMo',
    text: 'Checkout shows our Mobile Money number. Send payment, then confirm on WhatsApp with one tap.'
  },
  {
    emoji: '📦',
    title: 'Track your orders',
    text: 'Open "My Orders" any time to see order status and reorder past purchases instantly.'
  }
];

export default function WelcomeTutorial() {
  const { isTutorialOpen, setIsTutorialOpen } = useStore();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  if (!isTutorialOpen) return null;

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const finish = () => {
    try { localStorage.setItem('sharp_sharp_seen_tutorial', 'true'); } catch (e) {}
    setIsTutorialOpen(false);
    setIndex(0);
  };

  const next = () => {
    if (isLast) finish();
    else setIndex(i => i + 1);
  };

  const prev = () => setIndex(i => Math.max(0, i - 1));

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -50) next();
    else if (delta > 50) prev();
    touchStartX.current = null;
  };

  return (
    <div className="tutorial-overlay" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button className="tutorial-skip" onClick={finish}>
        <X size={16} />
        <span>Skip</span>
      </button>

      <div className="tutorial-slide" key={index}>
        <div className="tutorial-emoji">{slide.emoji}</div>
        <h2 className="tutorial-title">{slide.title}</h2>
        <p className="tutorial-text">{slide.text}</p>
      </div>

      <div className="tutorial-dots">
        {SLIDES.map((_, i) => (
          <span key={i} className={`tutorial-dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} />
        ))}
      </div>

      <button className="tutorial-next" onClick={next}>
        <span>{isLast ? 'Start shopping' : 'Next'}</span>
        {!isLast && <ChevronRight size={18} />}
      </button>
    </div>
  );
}
