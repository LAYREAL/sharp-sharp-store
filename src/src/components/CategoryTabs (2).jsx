import React from 'react';
import { useStore } from '../context/StoreContext';

export default function CategoryTabs() {
  const { categories, activeCategory, setActiveCategory, products } = useStore();

  const getCategoryCount = (category) => {
    if (category === "All") return products.length;
    return products.filter(p => p.category === category).length;
  };

  return (
    <div className="category-tabs-container">
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            <span>{cat}</span>
            <span className="category-count">{getCategoryCount(cat)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
