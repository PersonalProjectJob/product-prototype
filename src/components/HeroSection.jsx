import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  const { setSelectedBrand } = useStore();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const scrollToCatalog = () => {
    setSelectedBrand('All');
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full overflow-hidden bg-obsidian-950 text-white select-none">
      {/* Video Container - Big Large Product Showcase */}
      <div 
        className="relative w-full overflow-hidden flex items-center justify-center bg-obsidian-950"
        style={{ minHeight: 'clamp(420px, 56vw, 760px)' }}
      >
        <video
          ref={videoRef}
          src="https://cdn.moncontentcache.com/uploader/3672a88bb9317e951a2e21c14b61408bf35051c5fdc8c06c72ee4b7a60846161.mp4"
          poster="/hero-banner-1.png"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700"
        />

        {/* Gentle Ambient Vignette Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-black/20 to-obsidian-950/40 pointer-events-none" />

        {/* Top Floating Badge */}
        <div className="absolute top-6 left-6 z-20 hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 text-gold-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VSF &middot; Clean Factory 1:1 Masterwork</span>
        </div>

        {/* Sound Toggle Control in top right */}
        <button
          onClick={toggleSound}
          className="absolute top-6 right-6 z-20 p-2.5 bg-black/60 hover:bg-gold-500 hover:text-obsidian-950 text-white/80 backdrop-blur-md border border-white/20 transition-all text-xs flex items-center gap-1.5"
          title={isMuted ? "Unmute Video" : "Mute Video"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-gold-400" />}
          <span className="hidden sm:inline font-mono text-[10px] uppercase">{isMuted ? "Audio Off" : "Audio On"}</span>
        </button>

        {/* Bottom Hero Typography & Fast CTA */}
        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 z-20 px-4 sm:px-8 text-center max-w-4xl mx-auto space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-sans">
              The Pinnacle of 1:1 Super Clone Watches
            </h1>
            <p className="text-xs sm:text-base font-medium text-gold-300 font-sans tracking-wide drop-shadow-md">
              Swiss Dandong Movements &bull; Solid 904L Steel &bull; Complimentary Luxury Presentation Set
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={scrollToCatalog}
              className="px-6 sm:px-8 py-3 bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-2xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('swiss-engineering');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 sm:px-6 py-3 bg-black/40 hover:bg-white hover:text-obsidian-950 text-white font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md border border-white/30 transition-all duration-300"
            >
              Swiss Movement Specs
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="hidden sm:flex items-center justify-center gap-6 pt-2 text-[11px] text-white/80 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 4K QC Video Before Dispatch
            </span>
            <span>&bull;</span>
            <span>100% Customs Delivery Guarantee</span>
            <span>&bull;</span>
            <span>2-Year Movement Warranty</span>
          </div>
        </div>

      </div>
    </section>
  );
}
