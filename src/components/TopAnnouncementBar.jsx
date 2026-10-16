import React from 'react';
import { useStore } from '../context/StoreContext';
import { CURRENCY_RATES } from '../data/watches';
import { ShieldAlert, Globe, ChevronDown, CheckCircle2, Lock } from 'lucide-react';

export default function TopAnnouncementBar() {
  const { currency, setCurrency, setIsAntiScamOpen, setIsTrackingOpen, setIsAdminOpen } = useStore();

  return (
    <div className="bg-obsidian-950 text-white text-xs border-b border-white/10 px-4 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: Anti-Scam Alert & Business Status */}
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
          <button 
            onClick={() => setIsAntiScamOpen(true)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-crimson-600 hover:bg-crimson-700 font-semibold text-[11px] uppercase tracking-wider text-white transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Anti-Scam Notice
          </button>
          <span className="text-white/80 font-medium">
            <span className="text-gold-400 font-semibold">Priority Shipping Active:</span> Free Worldwide Delivery on Orders Over $500 &middot; 4K QC Video Before Dispatch
          </span>
        </div>

        {/* Right: Currency switcher & Quick Links */}
        <div className="flex items-center gap-4 text-white/70">
          {import.meta.env.VITE_PROTOTYPE_MODE !== 'true' && (
            <>
              <button 
                onClick={() => setIsAdminOpen(true)} 
                className="hover:text-gold-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
                title="Open Admin CMS Dashboard & Google Sheets Manager"
              >
                <Lock className="w-3.5 h-3.5 text-gold-400" />
                <span>Admin CMS</span>
              </button>
              <div className="h-3 w-[1px] bg-white/20" />
            </>
          )}

          <button 
            onClick={() => setIsTrackingOpen(true)} 
            className="hover:text-gold-400 transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Track Order
          </button>
          
          <div className="h-3 w-[1px] bg-white/20" />

          {/* Currency Switcher */}
          <div className="relative group flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-gold-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-white font-medium cursor-pointer focus:outline-none appearance-none pr-4 text-xs"
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
