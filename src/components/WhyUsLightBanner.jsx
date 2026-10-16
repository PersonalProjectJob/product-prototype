import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle } from 'lucide-react';

export default function WhyUsLightBanner() {
  const { whatsappNumber } = useStore();
  const phone = whatsappNumber || '84900000000';

  return (
    <section id="why-us-light" className="py-12 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Figma Node 2044:36 Container */}
        <div className="relative rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-[#EAEAE8]">
          <div className="relative w-full">
            {/* Visual from Figma with gold Rolex Day-Date */}
            <img
              src="/figma-assets/why-us-light.png"
              alt="Why Us Over Others? Premium 1:1 High-Quality Luxury Replica Watches"
              className="w-full h-auto object-cover"
            />

            {/* Clickable Overlay for the WhatsApp CTA button in Figma */}
            <div className="absolute right-[6%] md:right-[10%] bottom-[16%] md:bottom-[22%]">
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent('Hi, I want to know more about your 1:1 luxury replica watches')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-white hover:bg-neutral-50 text-[#008A38] px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-[#008A38] text-[#008A38]" />
                <span>Contact us via whatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
