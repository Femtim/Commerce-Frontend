import React from 'react';
import { useShop } from '../context/ShopContext';
import HeroBanner from '../components/HeroBanner';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';

export default function MarketplacePage() {
  const { products, loading } = useShop();

  return (
    <div>
      <HeroBanner />
      <CategoryBar />

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">
          Loading marketplace...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-medium">No matching products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}