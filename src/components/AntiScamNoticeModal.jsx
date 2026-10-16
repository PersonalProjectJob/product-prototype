import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Lock, Mail, MessageSquare } from 'lucide-react';

export default function AntiScamNoticeModal() {
  const { isAntiScamOpen, setIsAntiScamOpen } = useStore();

  if (!isAntiScamOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-xl shadow-2xl border border-obsidian-800/20 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-crimson-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Official Anti-Scam Security Notice
            </h2>
          </div>
          <button
            onClick={() => setIsAntiScamOpen(false)}
            className="p-1 hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5 text-xs text-obsidian-800/80">
          <div className="p-4 bg-crimson-50 border border-crimson-200 flex gap-3 text-crimson-900">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-crimson-600" />
            <div>
              <p className="font-bold uppercase text-[11px]">Warning Against Impersonators</p>
              <p className="mt-0.5 leading-relaxed">
                CloneWatches / VSF Watch will <strong>NEVER</strong> contact you first on Telegram, Instagram, or Discord demanding funds. Only trust communications verified through this platform.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-obsidian-950 uppercase tracking-wider text-xs">
              4 Golden Rules to Safeguard Your Purchase:
            </h4>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Handwritten Order Slip in 4K QC:</strong> Every quality control video sent to you features your unique Order ID handwritten on paper alongside the watch on the Timegrapher.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Official Concierge Email:</strong> Our verified support desk communicates strictly from <strong className="font-mono text-obsidian-950">daydateconcierge@gmail.com</strong> or our encrypted web checkout.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Customs Seizure Protection:</strong> If a package is ever intercepted or seized by customs, we reship a brand-new factory-sealed timepiece immediately at zero cost to you.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Cryptocurrency Security:</strong> Official USDT TRC20 and BTC receiving addresses are generated securely upon checkout with order references.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-obsidian-800/10">
            <button
              onClick={() => setIsAntiScamOpen(false)}
              className="w-full py-3 bg-obsidian-950 hover:bg-obsidian-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              I Understand &bull; Proceed Safely
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
