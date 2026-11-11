import React from 'react';
import { Outlet } from 'react-router-dom';
import { BellRing, CheckCircle2, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';
import CheckoutModal from './CheckoutModal';
import OrderSuccessModal from './OrderSuccessModal';

export default function MainLayout() {
  const {
    user,
    activeModal,
    setActiveModal,
    completedOrder,
    setCompletedOrder,
    toasts,
    dismissToast
  } = useShop();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Live WebSocket Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <BellRing className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold">{toast.title}</p>
              <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <CartDrawer
        isOpen={activeModal === 'cart'}
        onClose={() => setActiveModal(null)}
        onProceedToCheckout={() => setActiveModal(user ? 'checkout' : 'auth')}
      />

      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => setActiveModal(null)}
      />

      <CheckoutModal
        isOpen={activeModal === 'checkout'}
        onClose={() => setActiveModal(null)}
        onOrderSuccess={(orderData) => setCompletedOrder(orderData)}
      />

      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
}