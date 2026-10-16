import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldAlert, Compass, MessageCircle } from 'lucide-react';

export default function Footer() {
  const { setIsAntiScamOpen, setIsTrackingOpen, setSelectedBrand, whatsappNumber } = useStore();
  const phone = whatsappNumber || '84900000000';

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    const el = document.getElementById('collection-by-brands') || document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="bg-white text-black pt-20 pb-12 border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 3 Columns from Figma Node 2021:628 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 pb-16 border-b border-gray-100">
          
          {/* Column 1: Helpful Links */}
          <div>
            <h4 className="text-base font-bold text-black mb-6">
              Helpful Links
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <li>
                <a href="#why-us-light" className="hover:text-[#008A38] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Service Updates
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  FAQ's
                </span>
              </li>
              <li>
                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="hover:text-[#008A38] transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-[#008A38]" />
                  <span>Order Tracking</span>
                </button>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  How to pay for orders using cryptocurrency / Wire transfers
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  How to Order | Available Payment Methods
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Shipping Process, Customs Clearance and Delivery Time
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Returns, Refunds &amp; Replacement, Exchange
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Warranty Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Terms &amp; Conditions
                </span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#008A38] transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#008A38]" />
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Brand */}
          <div>
            <h4 className="text-base font-bold text-black mb-6">
              Brand
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <li>
                <button onClick={() => handleBrandClick('Rolex')} className="hover:text-[#008A38] transition-colors text-left">
                  Rolex super clone watches
                </button>
              </li>
              <li>
                <button onClick={() => handleBrandClick('Patek Philippe')} className="hover:text-[#008A38] transition-colors text-left">
                  Patek Philippe super clone watches
                </button>
              </li>
              <li>
                <button onClick={() => handleBrandClick('Audemars Piguet')} className="hover:text-[#008A38] transition-colors text-left">
                  Audemars Piguet super clone watches
                </button>
              </li>
              <li>
                <button onClick={() => handleBrandClick('Omega')} className="hover:text-[#008A38] transition-colors text-left">
                  Omega super clone watches
                </button>
              </li>
              <li>
                <button onClick={() => handleBrandClick('Cartier')} className="hover:text-[#008A38] transition-colors text-left">
                  Cartier super clone watches
                </button>
              </li>
              <li>
                <button onClick={() => handleBrandClick('Richard Mille')} className="hover:text-[#008A38] transition-colors text-left">
                  Richard Mille super clone watches
                </button>
              </li>
              <li>
                <button onClick={() => handleBrandClick('Hublot')} className="hover:text-[#008A38] transition-colors text-left">
                  Hublot super clone watches
                </button>
              </li>
              <li>
                <button onClick={() => handleBrandClick('Breitling')} className="hover:text-[#008A38] transition-colors text-left">
                  Breitling super clone watches
                </button>
              </li>
              <li>
                <button onClick={() => handleBrandClick('Tudor')} className="hover:text-[#008A38] transition-colors text-left">
                  Tudor super clone watches
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Technical Details */}
          <div>
            <h4 className="text-base font-bold text-black mb-6">
              Technical Details
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  QC Process
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  1:1 Rolex Super Clone Watch – Watch our detailed real life video
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Super Clone Watches – Full Gift Box Packaging
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Customer Unboxing Videos
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Our Rolex Superclone Movements
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Why Buy Super Clone Watches
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  5 Layer Real 18K Gold Plating
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Moissanite Diamonds
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Waterproof Rolex Super Clones
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Superluminova Lume
                </span>
              </li>
              <li>
                <span className="hover:text-[#008A38] transition-colors cursor-pointer">
                  Perfect Wrist
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Figma Anti-Scam Notice & Copyright */}
        <div className="pt-10 flex flex-col items-center justify-center text-center space-y-4">
          <div
            onClick={() => setIsAntiScamOpen(true)}
            className="cursor-pointer inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-800 hover:text-black font-normal"
          >
            <span className="text-amber-500">⚠️</span>
            <span className="bg-[#6B1414] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded">
              Anti-Scam Notice
            </span>
            <span className="text-gray-800">
              CloneWatches will never contact you first. Only trust official contact details listed on this website.
            </span>
          </div>

          <div className="text-xs text-gray-500 font-light">
            &copy; 2026 Ben Thanh Luxury / www.vsfwatch.cc. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
