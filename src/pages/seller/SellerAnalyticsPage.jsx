import React, { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  Radio
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { socket } from '../../api/socketClient';
import { CATEGORIES, useShop } from '../../context/ShopContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DELIVERY_STAGES = [
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

export default function SellerAnalyticsPage() {
  const { products, formatPrice, socketConnected } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/orders/manage')
      .then(({ data }) => setOrders(data.data || []))
      .catch((err) => console.error('Failed to load analytics:', err.message))
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

  const kpis = useMemo(() => {
    const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.deliveryStatus === 'Delivered').length;
    const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockProducts = products.filter((p) => p.stock <= 5);

    return {
      totalRevenue,
      totalOrders,
      deliveredOrders,
      totalStockUnits,
      lowStockProducts
    };
  }, [orders, products]);

  const revenueByCategoryChart = useMemo(() => {
    const validCategories = CATEGORIES.filter((c) => c !== 'All');
    const categoryTotals = validCategories.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const matchedProduct = products.find(
          (p) => p._id === item.product || p.name === item.name
        );
        const category = matchedProduct?.category || 'Electronics';
        if (categoryTotals[category] !== undefined) {
          categoryTotals[category] += item.price * item.quantity;
        }
      });
    });

    return {
      labels: validCategories,
      datasets: [
        {
          label: 'Revenue (₦)',
          data: validCategories.map((cat) => categoryTotals[cat]),
          backgroundColor: [
            'rgba(79, 70, 229, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(236, 72, 153, 0.85)'
          ],
          borderRadius: 10,
          barThickness: 36
        }
      ]
    };
  }, [orders, products]);

  const orderStatusDoughnut = useMemo(() => {
    const counts = DELIVERY_STAGES.map(
      (stage) => orders.filter((o) => (o.deliveryStatus || 'Processing') === stage).length
    );

    return {
      labels: DELIVERY_STAGES,
      datasets: [
        {
          label: 'Orders',
          data: counts,
          backgroundColor: [
            '#6366f1',
            '#3b82f6',
            '#f59e0b',
            '#8b5cf6',
            '#10b981'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  }, [orders]);

  const stockLevelChart = useMemo(() => {
    const sortedProducts = [...products].sort((a, b) => a.stock - b.stock).slice(0, 8);

    return {
      labels: sortedProducts.map((p) =>
        p.name.length > 22 ? `${p.name.slice(0, 22)}...` : p.name
      ),
      datasets: [
        {
          label: 'Available Units in Stock',
          data: sortedProducts.map((p) => p.stock),
          backgroundColor: sortedProducts.map((p) =>
            p.stock <= 5 ? 'rgba(244, 63, 94, 0.85)' : 'rgba(15, 23, 42, 0.85)'
          ),
          borderRadius: 8
        }
      ]
    };
  }, [products]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400 font-medium">
        Calculating live revenue and inventory metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Real-Time Storefront Performance
          </h2>
          <p className="text-xs text-slate-500">
            Charts and KPIs stream automatically via Socket.io as orders and stock change.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            socketConnected
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          {socketConnected ? 'Real-Time Stream Connected' : 'Reconnecting...'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Total Revenue</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatPrice(kpis.totalRevenue)}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold">
              Verified Paid Orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Total Orders</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {kpis.totalOrders}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">
              {kpis.deliveredOrders} Delivered
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Inventory Units</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {kpis.totalStockUnits}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">
              Across {products.length} Products
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Low Stock Alerts</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              {kpis.lowStockProducts.length}
            </p>
            <span className="text-[11px] text-rose-500 font-semibold">
              ≤ 5 units remaining
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">
            Revenue Breakdown by Category (₦)
          </h3>
          <div className="h-72">
            <Bar
              data={revenueByCategoryChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (val) => `₦${Number(val).toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Order Fulfillment Pipeline
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Live distribution by delivery stage
            </p>
          </div>
          <div className="h-60 flex items-center justify-center">
            {orders.length === 0 ? (
              <p className="text-xs text-slate-400">No orders recorded yet</p>
            ) : (
              <Doughnut
                data={orderStatusDoughnut}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: 10, font: { size: 11 } }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">
            Product Stock Levels (Red Indicates Low Stock ≤ 5)
          </h3>
          <div className="h-72">
            <Bar
              data={stockLevelChart}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true } }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Restock Priority List
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {kpis.lowStockProducts.length === 0 ? (
              <div className="text-center py-12 text-xs text-emerald-600 font-semibold bg-emerald-50 rounded-2xl p-4">
                All products are well-stocked (greater than 5 units).
              </div>
            ) : (
              kpis.lowStockProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/60 border border-rose-200/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-xl object-cover bg-white shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {prod.name}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {prod.category}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold shrink-0">
                    {prod.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}