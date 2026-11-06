import React from 'react';
import { ShieldAlert, Globe, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CURRENCY_RATES } from '../data/watches';

export default function TopAnnouncementBar() {
  const { currency, setCurrency, setIsAntiScamOpen, setIsTrackingOpen, setIsAdminOpen } = useStore();

  return (
    <div className="bg-obsidian-950 text-white text-xs border-b border-white/10 px-3 sm:px-4 py-2 transition-all overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-2">
        {/* Left: Anti-Scam Alert & Business Status */}
        <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center justify-center md:justify-start gap-1.5 sm:gap-3 text-center md:text-left">
          <button
            type="button"
            onClick={() => setIsAntiScamOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-crimson-600 hover:bg-crimson-700 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider text-white transition-colors flex-shrink-0 whitespace-nowrap"
          >
            <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span>Anti-Scam Notice</span>
          </button>
          <span className="text-white/85 font-medium text-[11px] sm:text-xs leading-snug">
            <span className="text-gold-400 font-semibold">Priority Shipping:</span>{' '}
            <span>Free Worldwide Delivery Over $500</span>
            <span className="hidden sm:inline"> &middot; 4K QC Video Before Dispatch</span>
          </span>
        </div>

        {/* Right: Currency switcher & Quick Links */}
        <div className="w-full md:w-auto flex items-center justify-center md:justify-end gap-2.5 sm:gap-4 text-white/75 text-[11px] sm:text-xs flex-nowrap">
          {import.meta.env.VITE_PROTOTYPE_MODE !== 'true' && (
            <>
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="hover:text-gold-400 transition-colors inline-flex items-center gap-1 font-mono text-[11px] whitespace-nowrap flex-shrink-0"
                title="Open Admin CMS Dashboard & Google Sheets Manager"
              >
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-400 flex-shrink-0" />
                <span>Admin CMS</span>
              </button>
              <div className="h-3 w-[1px] bg-white/20 flex-shrink-0" />
            </>
          )}

          <button
            type="button"
            onClick={() => setIsTrackingOpen(true)}
            className="hover:text-gold-400 transition-colors inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          >
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Track Order</span>
          </button>

          <div className="h-3 w-[1px] bg-white/20 flex-shrink-0" />

          {/* Currency Switcher */}
          <div className="relative group inline-flex items-center gap-1 flex-shrink-0">
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-400 flex-shrink-0" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select currency"
              className="bg-transparent text-white font-medium cursor-pointer focus:outline-none appearance-none pr-3.5 text-[11px] sm:text-xs max-w-[115px] sm:max-w-none truncate"
            >
              {Object.entries(CURRENCY_RATES).map(([code, data]) => (
                <option key={code} value={code} className="bg-obsidian-900 text-white">
                  {code} ({data.symbol}) — {data.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-white/50 pointer-events-none absolute right-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
