import React from 'react';
import { Watch, ArrowRight } from 'lucide-react';

export default function UnmatchedExperienceSection() {
  const benefits = [
    {
      title: "Product Quality",
      desc: "We design our 1:1 timepiece clones to replicate the look, feel, and performance of their predecessors."
    },
    {
      title: "Competitive Pricing",
      desc: "Premium, high-quality replicas are available at a fraction of the cost of the originals and (in turn) much more wallet-friendly."
    },
    {
      title: "Quick Shipping",
      desc: "We know you're excited to receive your watch and ship most orders within 1-3 days."
    },
    {
      title: "Great Client Service",
      desc: "Whether we're tending to pre-purchase questions or at the ready with ongoing post-sale support, we want to help and put no limits on doing so."
    }
  ];

  const handleExploreClick = () => {
    const el = document.getElementById('collection-by-brands') || document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Figma Heading & Description */}
        <div className="max-w-3xl mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-black tracking-tight mb-4">
            An Unmatched Experience
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-light">
            Shopping with ReplicaFactory means not just buying a watch but bringing luxury and precision to your wrist at a price you'll feel comfortable with. Enjoy the following when you work with us...
          </p>
        </div>

        {/* 4 Benefit Cards (Figma node 2049:370) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-[#0F3E2E]/40 hover:border-[#0F3E2E] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Watch Icon Box */}
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-6 text-neutral-800">
                <Watch className="w-5 h-5" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-black mb-3">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Green CTA Box (Figma node 2049:381) */}
        <div className="rounded-3xl bg-gradient-to-r from-[#095228] to-[#05371b] text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-white mb-3">
              Ready to get nice and cozy with premium watch replicas?
            </h3>
            <p className="text-sm text-neutral-200/90 font-light leading-relaxed">
              Of course you are! Check out our collection and experience all of the benefits just mentioned for yourself.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleExploreClick}
              className="bg-[#D4A843] hover:bg-[#c29633] text-black font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              EXPLORE COLLECTION
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
