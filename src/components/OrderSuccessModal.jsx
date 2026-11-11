import React from 'react';
import { CheckCircle2, MailCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function OrderSuccessModal({ order, onClose }) {
  const { formatPrice } = useShop();
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-xl font-extrabold mb-1">Order Confirmed!</h3>
        <p className="text-xs text-slate-500 mb-4">
          Reference: <span className="font-mono font-bold text-slate-800">{order.orderReference}</span>
        </p>
        <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 mb-4 border border-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-500">Buyer:</span>
            <span className="font-bold text-slate-900">{order.customer.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Paid:</span>
            <span className="font-bold text-emerald-600">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 py-2 px-3 rounded-xl mb-6 font-medium">
          <MailCheck className="w-4 h-4" /> HTML receipt dispatched to {order.customer.email}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}