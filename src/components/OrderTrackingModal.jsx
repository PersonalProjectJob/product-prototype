import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Search, CheckCircle2, Clock, PackageCheck, Plane, ShieldCheck, MapPin } from 'lucide-react';

export default function OrderTrackingModal() {
  const { isTrackingOpen, setIsTrackingOpen, lastOrder, formatPrice } = useStore();
  const [orderQuery, setOrderQuery] = useState(lastOrder ? lastOrder.orderId : 'CW-892415');
  const [searchedOrder, setSearchedOrder] = useState(lastOrder);
  const [notFound, setNotFound] = useState(false);

  if (!isTrackingOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderQuery.trim().toUpperCase() === 'CW-892415' || (lastOrder && orderQuery.trim().toUpperCase() === lastOrder.orderId)) {
      setSearchedOrder(lastOrder);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  };

  const steps = [
    { title: "Order Accepted", desc: "Payment secured & transferred to master factory atelier", icon: Clock, done: true },
    { title: "Timegrapher QC Testing", desc: "Precision timing calibration (±2s/day target) & 5 ATM waterproof test", icon: CheckCircle2, done: true, current: true },
    { title: "4K QC Video Approval", desc: "High-definition video & macro photos dispatched to your WhatsApp/Email", icon: PackageCheck, done: false },
    { title: "DHL Express Dispatched", desc: "Discreet customs clearance routing with insurance tracking", icon: Plane, done: false },
    { title: "Delivered To Client", desc: "Signed luxury presentation package arrival", icon: MapPin, done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-2xl shadow-2xl border border-obsidian-800/20 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-obsidian-950 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-gold-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              Live Order &amp; 4K QC Status Tracker
            </h2>
          </div>
          <button
            onClick={() => setIsTrackingOpen(false)}
            className="p-1 hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. CW-892415)"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-obsidian-800/20 font-mono uppercase focus:border-gold-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-obsidian-800/30 absolute right-3 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-obsidian-950 hover:bg-gold-500 hover:text-obsidian-950 text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Lookup
            </button>
          </form>

          {notFound && (
            <div className="p-4 bg-crimson-50 border border-crimson-200 text-xs text-crimson-800">
              No matching order record found for this ID. Try default demonstration ID <strong className="font-mono">CW-892415</strong>.
            </div>
          )}

          {searchedOrder && !notFound && (
            <div className="space-y-6">
              
              {/* Top Order Metadata Banner */}
              <div className="bg-obsidian-800/5 p-4 border border-obsidian-800/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-obsidian-800/60 block text-[10px] uppercase font-mono">Order Number</span>
                  <span className="font-mono font-bold text-obsidian-950 text-sm">{searchedOrder.orderId}</span>
                </div>
                <div>
                  <span className="text-obsidian-800/60 block text-[10px] uppercase font-mono">Courier Carrier</span>
                  <span className="font-semibold text-obsidian-950">DHL Express Air Priority</span>
                </div>
                <div>
                  <span className="text-obsidian-800/60 block text-[10px] uppercase font-mono">Tracking Waybill</span>
                  <span className="font-mono font-semibold text-emerald-700">{searchedOrder.trackingNumber || 'DHL-EXP-998234190'}</span>
                </div>
              </div>

              {/* 5-Step Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-obsidian-950">
                  Fulfillment &amp; QC Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-obsidian-800/10">
                  {steps.map((st, i) => {
                    const Icon = st.icon;
                    return (
                      <div key={i} className="relative flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center -ml-6 border transition-all ${
                            st.done
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : st.current
                              ? 'bg-gold-500 border-gold-500 text-obsidian-950 ring-4 ring-gold-500/20'
                              : 'bg-white border-obsidian-800/20 text-obsidian-800/30'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase ${st.done || st.current ? 'text-obsidian-950' : 'text-obsidian-800/40'}`}>
                            {st.title} {st.current && <span className="ml-2 text-[10px] bg-gold-500/20 text-gold-700 px-1.5 py-0.2 font-mono uppercase">In Progress</span>}
                          </p>
                          <p className="text-[11px] text-obsidian-800/60 mt-0.5">
                            {st.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this order */}
              {searchedOrder.items && searchedOrder.items.length > 0 && (
                <div className="pt-4 border-t border-obsidian-800/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-2">
                    Package Items
                  </h4>
                  <div className="space-y-2">
                    {searchedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-obsidian-800/5">
                        <div className="flex items-center gap-2">
                          <img src={it.product.images[0]} alt="" className="w-8 h-8 object-cover border" />
                          <span className="font-medium text-obsidian-950">{it.product.name}</span>
                        </div>
                        <span className="font-mono text-obsidian-800/70">Qty: {it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
