import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle2, Clock, ArrowLeft, Radio } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { socket } from '../api/socketClient';
import { useShop } from '../context/ShopContext';

const STAGES = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function BuyerOrdersPage() {
  const { formatPrice, socketConnected } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState(null);

  useEffect(() => {
    axiosClient
      .get('/orders/my-orders')
      .then(({ data }) => setOrders(data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleNewOrder = (newOrder) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    };

    const handleStatusUpdate = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
      setRecentlyUpdatedId(updatedOrder._id);
      setTimeout(() => setRecentlyUpdatedId(null), 3500);
    };

    socket.on('order:created', handleNewOrder);
    socket.on('order:statusUpdated', handleStatusUpdate);

    return () => {
      socket.off('order:created', handleNewOrder);
      socket.off('order:statusUpdated', handleStatusUpdate);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900">
            My Orders & Live Delivery Tracking
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              socketConnected
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            {socketConnected ? 'Live Updates Active' : 'Connecting...'}
          </span>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm mb-4">
            You have not placed any orders yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentIdx = STAGES.indexOf(order.deliveryStatus || 'Processing');
            const isHighlighted = recentlyUpdatedId === order._id;

            return (
              <div
                key={order._id}
                className={`p-6 rounded-3xl border bg-white space-y-5 transition-all duration-500 ${
                  isHighlighted
                    ? 'border-indigo-500 ring-4 ring-indigo-100 shadow-lg'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600">
                        {order.orderReference}
                      </span>
                      {isHighlighted && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase">
                          Updated Just Now
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ordered on {new Date(order.createdAt).toLocaleDateString()} •{' '}
                      {order.customer.address}, {order.customer.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <span className="block text-[11px] font-bold text-emerald-600">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {STAGES.map((stage, idx) => {
                    const active = idx <= currentIdx;
                    return (
                      <div key={stage} className="text-center">
                        <div
                          className={`h-2 rounded-full mb-2 transition-all duration-500 ${
                            active ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[11px] font-bold flex items-center justify-center gap-1 ${
                            active ? 'text-indigo-700' : 'text-slate-400'
                          }`}
                        >
                          {active ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">{stage}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="font-medium">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}