import React from 'react';
import { Cpu, ShieldCheck, Check, X, Award, Zap, Compass } from 'lucide-react';

export default function SwissEngineeringSection() {
  const comparison = [
    {
      feature: "Movement Architecture",
      superClone: "Dandong 1:1 Clone (Exact Part For Part)",
      budgetRep: "Cheap Asian 2813 / Mingzhu (Ticking Stutter)",
      genuine: "In-House Swiss Calibre"
    },
    {
      feature: "Chronograph Function",
      superClone: "Fully Working Column Wheel (4131)",
      budgetRep: "Frozen Sub-Dials or Fake Quartz",
      genuine: "Integrated Column Wheel"
    },
    {
      feature: "Case Steel Grade",
      superClone: "Certified 904L Oystersteel (Acid Tested)",
      budgetRep: "Cheap 304 or 316 Nickel Plating",
      genuine: "Proprietary 904L Steel"
    },
    {
      feature: "Bezel Ceramic Quality",
      superClone: "Platinum PVD Coated Real Ceramic",
      budgetRep: "Painted Aluminum or Cheap Glaze",
      genuine: "Cerachrom Platinum Infill"
    },
    {
      feature: "Crystal & Cyclops",
      superClone: "Sapphire with 2.5x Magnifier & Blue AR",
      budgetRep: "Mineral Glass with Distorted 1.5x",
      genuine: "Sapphire with Double AR Cyclops"
    },
    {
      feature: "Laser Crown at 6 O'clock",
      superClone: "Micro-Dotted into Crystal (Invisible to Naked Eye)",
      budgetRep: "Heavy White Stamp Visible Everywhere",
      genuine: "Sub-Surface Laser Etched Crown"
    }
  ];

  return (
    <section id="swiss-engineering" className="py-16 lg:py-24 bg-obsidian-950 text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-widest mb-2">
            <Cpu className="w-4 h-4 text-gold-400" />
            Calibre Clone Engineering
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            The Pinnacle of 1:1 Super Clones: <span className="gold-gradient-text">Swiss-Grade Precision</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mt-3">
            In the past, replica watches used generic decorative plates glued over low-grade movements. Our 2026 generation utilizes custom manufactured Dandong 3235, 4131, and 3285 movements where every gear, bridge, and balance wheel functions in mechanical harmony.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-obsidian-900 border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold font-mono mb-4 text-sm">
                3235
              </div>
              <h3 className="text-base font-bold uppercase text-white mb-2">
                Dandong 3235 Clone
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                70-hour genuine power reserve with free-sprung balance wheel and instantaneous date click at exactly 00:00 midnight. Operates at a smooth 28,800 beats per hour.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-gold-400">
              Fitted in: Submariner Date &middot; Datejust 41
            </div>
          </div>

          <div className="bg-obsidian-900 border border-gold-500/30 p-6 flex flex-col justify-between relative shadow-lg shadow-gold-500/5">
            <div className="absolute top-0 right-0 bg-gold-500 text-obsidian-950 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
              Flagship
            </div>
            <div>
              <div className="w-10 h-10 bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold font-mono mb-4 text-sm">
                4131
              </div>
              <h3 className="text-base font-bold uppercase text-white mb-2">
                Super Clone 4131 Chrono
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                The world's thinnest fully integrated replica chronograph movement (12.1mm case thickness). No decorative dummy plates; all sub-dials drive stop-seconds and minutes authentically.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-gold-400">
              Fitted in: Panda Daytona 126500LN
            </div>
          </div>

          <div className="bg-obsidian-900 border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold font-mono mb-4 text-sm">
                3285
              </div>
              <h3 className="text-base font-bold uppercase text-white mb-2">
                True Jumping GMT 3285
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Features genuine independent jumping hour hand allowing you to adjust local time forward or backward across timezones without stopping the sweeping second hand.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-gold-400">
              Fitted in: Pepsi &middot; Bruce Wayne GMT
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-obsidian-900 border border-white/10 overflow-hidden">
          <div className="p-6 bg-obsidian-850 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                Engineering Comparison Matrix
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Understand the stark difference between market tiers before you buy
              </p>
            </div>
            <span className="hidden sm:inline bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 font-mono">
              100% Quality Guaranteed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-obsidian-950/80 text-white/70 uppercase font-mono tracking-wider text-[11px] border-b border-white/10">
                <tr>
                  <th className="py-4 px-6 font-semibold">Component</th>
                  <th className="py-4 px-6 font-bold text-gold-400 bg-gold-500/10">CloneWatches (1:1 VSF / Clean)</th>
                  <th className="py-4 px-6 text-white/50">Budget Market Replicas ($100–$250)</th>
                  <th className="py-4 px-6 text-white/90">Genuine Watch ($15,000+)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparison.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white/90 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 font-medium text-emerald-300 bg-gold-500/5">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {row.superClone}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/50">
                      <span className="inline-flex items-center gap-1.5 text-crimson-400">
                        <X className="w-4 h-4 flex-shrink-0" />
                        {row.budgetRep}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/80 font-mono">
                      {row.genuine}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
