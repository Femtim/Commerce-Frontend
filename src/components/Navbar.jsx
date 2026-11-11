import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, Store, ClipboardList } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function Navbar() {
  const {
    searchQuery,
    setSearchQuery,
    user,
    handleLogout,
    cart,
    setActiveModal
  } = useShop();
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const onSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
            V
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Vortex<span className="text-indigo-600">Mart</span>
          </span>
        </Link>

        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keyboards, headphones, gear..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-sm outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          {user?.role === 'seller' && (
            <NavLink
              to="/seller/analytics"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`
              }
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Seller Portal</span>
            </NavLink>
          )}

          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`
              }
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">My Orders</span>
            </NavLink>
          )}

          {user ? (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{user.fullName}</p>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600">
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  navigate('/');
                }}
                title="Logout"
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveModal('auth')}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveModal('cart')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}