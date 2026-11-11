import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist, formatPrice } = useShop();
  const isWishlisted = wishlist.includes(product._id);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col">
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <button
          type="button"
          onClick={() => toggleWishlist(product._id)}
          aria-label="Toggle Wishlist"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>
        <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white text-xs px-2.5 py-1 rounded-lg font-medium">
          {product.category}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {product.rating || 4.8}
              <span className="text-slate-400 font-normal">
                ({product.numReviews || 0})
              </span>
            </span>
            <span
              className={
                product.stock > 0 ? 'text-emerald-600 font-medium' : 'text-rose-500 font-bold'
              }
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <Link
            to={`/product/${product._id}`}
            className="font-bold text-slate-900 hover:text-indigo-600 text-base mb-1 line-clamp-1 transition"
          >
            {product.name}
          </Link>
          <p className="text-slate-500 text-xs line-clamp-2 mb-4">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span className="text-[11px] text-slate-400 block">Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              {formatPrice(product.price)}
            </span>
          </div>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-indigo-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}