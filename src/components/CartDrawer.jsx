import React from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function CartDrawer({ isOpen, onClose, onProceedToCheckout }) {
  const {
    cart,
    updateQuantity,
    subtotal,
    shippingFee,
    totalAmount,
    formatPrice,
    user
  } = useShop();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Shopping Cart</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium text-sm">
                Your cart is currently empty.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-white"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-indigo-600 font-bold mt-0.5">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, -1)}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, 1)}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, -item.quantity)}
                      title="Remove item"
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Flat Rate Delivery</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition"
            >
              {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}{' '}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}