import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { PackagePlus, Truck, BarChart3 } from 'lucide-react';

export default function SellerLayout() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Seller Portal</h1>
          <p className="text-xs text-slate-500">
            Manage marketplace inventory, track live revenue analytics, and fulfill customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          <NavLink
            to="/seller/analytics"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" /> Analytics
          </NavLink>

          <NavLink
            to="/seller/studio"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <PackagePlus className="w-4 h-4" /> Seller Studio
          </NavLink>

          <NavLink
            to="/seller/fulfillment"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <Truck className="w-4 h-4" /> Order Fulfillment
          </NavLink>
        </div>
      </div>

      <Outlet />
    </div>
  );
}