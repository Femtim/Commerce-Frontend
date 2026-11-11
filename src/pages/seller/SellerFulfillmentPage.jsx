import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { socket } from '../../api/socketClient';
import { useShop } from '../../context/ShopContext';

const STAGES = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function SellerFulfillmentPage() {
  const { formatPrice } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/orders/manage')
      .then(({ data }) => setOrders(data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleOrderCreated = (newOrder) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    };

    const handleOrderStatusUpdated = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:statusUpdated', handleOrderStatusUpdated);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:statusUpdated', handleOrderStatusUpdated);
    };
  }, []);

  const handleStatusChange = async (orderId, deliveryStatus) => {
    try {
      const { data } = await axiosClient.patch(`/orders/${orderId}/status`, {
        deliveryStatus
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.data : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
      <h2 className="text-lg font-extrabold">Customer Order Fulfillment Queue</h2>

      {loading ? (
        <p className="text-center py-16 text-slate-400 text-sm">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center py-16 text-slate-400 text-sm">No customer orders found.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">
                    {order.orderReference}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    • {formatPrice(order.totalAmount)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Buyer: {order.customer.fullName} ({order.customer.email})
                </p>
                <p className="text-xs text-slate-500">
                  Delivery Address: {order.customer.address}, {order.customer.city}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500">Delivery Stage:</label>
                <select
                  value={order.deliveryStatus || 'Processing'}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                >
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}