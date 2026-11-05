import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle } from 'lucide-react';

export default function WhyUsDarkBanner() {
  const { getWhatsAppContactUrl } = useStore();
  const whatsappUrl = getWhatsAppContactUrl
    ? getWhatsAppContactUrl('Xin chào Thanh Phuong Luxury Watch, tôi muốn tìm hiểu các mẫu đồng hồ Super Clone 1:1')
    : 'https://wa.me/qr/3DEQ3BJ6O2P5P1';

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Figma Node 2030:2943 Container */}
        <div className="relative rounded-[28px] overflow-hidden shadow-lg border border-gray-900/10 bg-[#12202A]">
          <div className="relative w-full">
            {/* Visual from Figma with Submariner ceramic macro */}
            <img
              src="/figma-assets/why-us-dark.png"
              alt="Why Us Over Others? Premium 1:1 High-Quality Luxury Replica Watches"
              className="w-full h-auto object-cover"
            />

            {/* Clickable Overlay for the WhatsApp CTA button */}
            <div className="absolute left-[6%] md:left-[8%] bottom-[16%] md:bottom-[22%]">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#008A38] hover:bg-[#00742f] text-white px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span>Contact us via whatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
