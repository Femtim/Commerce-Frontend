import React from 'react';
import { CATEGORIES, useShop } from '../context/ShopContext';

export default function CategoryBar() {
  const { selectedCategory, setSelectedCategory, products } = useShop();

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 font-semibold">
        Showing {products.length} products
      </p>
    </div>
  );
}