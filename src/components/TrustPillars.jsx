import React from 'react';
import { Eye, Cpu, Film, Gift } from 'lucide-react';

export default function TrustPillars() {
  const pillars = [
    {
      icon: Eye,
      title: "1. 1:1 Visually Indistinguishable",
      subtitle: "Microscope & Weight Match",
      desc: "Every curve, bevel, and laser-engraved rehaut serial matches genuine specifications. Crafted from real 904L aerospace steel or heavy tungsten alloy for authentic 180g-190g wrist presence."
    },
    {
      icon: Cpu,
      title: "2. Swiss Clone Movements",
      subtitle: "Calibres 3235 &bull; 4131 &bull; 3285",
      desc: "True standalone mechanical movements featuring 28,800 vibrations/hour, parachute shock absorbers, column wheel chronographs, and smooth sweeping second hands with 70-hour power reserves."
    },
    {
      icon: Film,
      title: "3. Pre-Shipment 4K QC Verification",
      subtitle: "Timegrapher & Water Pressure Test",
      desc: "We believe trust is built on transparency. You receive a personalized high-definition 4K video showing timing machine amplitude, accuracy (within ±2s/day), and waterproof sealing before dispatch."
    },
    {
      icon: Gift,
      title: "4. Complimentary Full Set Experience",
      subtitle: "Included Free (Save $150–$200)",
      desc: "While competitors charge $150+ extra for packaging, CloneWatches provides the complete presentation: genuine-spec luxury display box, serialized guarantee card, booklet, and leather carry pouch."
    }
  ];

  return (
    <section className="bg-obsidian-900 text-white py-14 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs uppercase font-bold text-gold-400 tracking-widest mb-2">
            The CloneWatches Benchmark
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
            Why Discerning Collectors Choose Us
          </h2>
          <p className="text-white/60 text-xs sm:text-sm mt-2">
            What you see in your personal Quality Control video is exactly what you will receive. Guaranteed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-obsidian-950/60 border border-white/10 p-6 flex flex-col justify-between hover:border-gold-500/50 transition-all duration-300 group"
              >
                <div>
                  <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center mb-4 group-hover:bg-gold-500 group-hover:text-obsidian-950 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1 group-hover:text-gold-400 transition-colors">
                    {p.title}
                  </h3>
                  <div className="text-[11px] font-mono text-emerald-400 mb-3" dangerouslySetInnerHTML={{ __html: p.subtitle }} />
                  <p className="text-white/70 text-xs leading-relaxed font-light">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
