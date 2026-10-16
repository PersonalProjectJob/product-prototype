import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function KeepBrowsingSection() {
  const handleClick = () => {
    const el = document.getElementById('collection-by-brands') || document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Figma Node 2057:1719 Container */}
        <div
          onClick={handleClick}
          className="cursor-pointer group relative rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-[#EAEAE8] p-6 sm:p-10 transition-all duration-300 hover:shadow-md"
        >
          <div className="mb-6 sm:mb-8">
            <span className="text-xs font-bold tracking-widest text-neutral-600 uppercase block mb-2">
              KEEP BROWSING
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-normal text-black tracking-tight">
                Shop thousands more watches on Ben Thanh Watch
              </h3>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-black group-hover:translate-x-1 transition-transform">
                <span>View Full Inventory</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 9 Omega Watches Showcase from Figma */}
          <div className="relative w-full overflow-x-auto pb-2">
            <img
              src="/figma-assets/keep-browsing.png"
              alt="Shop thousands more watches on Ben Thanh Watch - Omega collections"
              className="w-full h-auto min-w-[700px] object-contain group-hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
