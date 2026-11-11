import React from 'react';
import { ShieldCheck, Truck, MailCheck } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 mb-10 shadow-xl">
      <div className="max-w-xl">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
          Full-Stack MVCR Marketplace
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
          Upgrade Your Daily Setup.
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mb-6">
          Curated workspace essentials, audiophile electronics, and minimalist accessories with real-time order tracking.
        </p>
        <div className="flex flex-wrap gap-6 text-xs text-slate-300 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1-Year Warranty
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-400" /> Live Delivery Tracking
          </div>
          <div className="flex items-center gap-2">
            <MailCheck className="w-4 h-4 text-amber-400" /> Instant Email Receipts
          </div>
        </div>
      </div>
    </div>
  );
}