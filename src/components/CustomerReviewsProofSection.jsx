import React from 'react';
import { useStore } from '../context/StoreContext';
import { Star, ShieldCheck, MessageCircle } from 'lucide-react';

export default function CustomerReviewsProofSection() {
  const { whatsappNumber } = useStore();
  const phone = whatsappNumber || '84900000000';
  return (
    <section id="customer-reviews" className="py-20 sm:py-24 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Figma Heading: "What our customers say about us" */}
        <div className="text-center mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-black tracking-tight mb-4">
            What our customers say about us
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-black">4.9 / 5.0</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified WhatsApp Client Unboxings
            </span>
          </div>
        </div>

        {/* Real Customer WhatsApp Screenshots from Figma node 2027:2458 */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white p-4 sm:p-8">
          <img
            src="/figma-assets/customer-whatsapp-reviews.png"
            alt="Customer WhatsApp chat proof and verified unboxing reviews"
            className="w-full h-auto object-contain mx-auto rounded-xl"
          />
        </div>

        {/* Bottom Reassurance Bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-black">
              Want to see more live wrist rolls &amp; 4K timegrapher QC videos?
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Chat directly with our horological concierges on WhatsApp before placing your order.
            </p>
          </div>

          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('Hi, can I see live QC videos for available watches?')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#008A38] hover:bg-[#00742f] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full shadow-sm transition-all duration-200 hover:shadow-md flex-shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
