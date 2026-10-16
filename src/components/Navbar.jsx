import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ShoppingBag, Menu, X, ChevronDown, MessageCircle, Phone, Lock } from 'lucide-react';

export default function Navbar() {
  const {
    cartCount,
    cartSubtotalUSD,
    formatPrice,
    setIsCartOpen,
    selectedBrand,
    setSelectedBrand,
    searchQuery,
    setSearchQuery,
    setIsTrackingOpen,
    setIsAntiScamOpen,
    setIsAdminOpen,
    whatsappNumber,
    navigateToHome,
    navigateToBrands
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandsDropdownOpen, setBrandsDropdownOpen] = useState(false);

  const brandOptions = [
    'All',
    'Rolex',
    'Omega',
    'Patek Philippe',
    'Audemars Piguet',
    'Cartier',
    'Breitling',
    'Hublot',
    'Tudor',
    'IWC'
  ];

  const handleBrandSelect = (brand) => {
    setBrandsDropdownOpen(false);
    setMobileMenuOpen(false);
    if (navigateToBrands) {
      navigateToBrands(brand);
    } else {
      setSelectedBrand(brand);
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (navigateToHome) navigateToHome();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-800 hover:text-black focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo - Ben Thanh Luxury */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => {
                if (navigateToHome) navigateToHome();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <img
                src="/figma-assets/benthanh-logo.png"
                alt="BEN THANH Luxury"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-heading tracking-widest text-lg sm:text-xl font-bold text-[#A88236] uppercase leading-tight">
                  BEN THANH
                </span>
                <span className="text-[9px] tracking-[0.3em] text-[#C4A052] uppercase font-light -mt-0.5">
                  LUXURY WATCHES
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 text-sm font-medium text-gray-900">
            <button
              onClick={() => {
                if (navigateToHome) navigateToHome();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#008A38] transition-colors"
            >
              Home
            </button>

            {/* Brands Dropdown */}
            <div
              className="relative group py-2"
              onMouseEnter={() => setBrandsDropdownOpen(true)}
              onMouseLeave={() => setBrandsDropdownOpen(false)}
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (navigateToBrands) navigateToBrands('All');
                    setBrandsDropdownOpen(false);
                  }}
                  className="hover:text-[#008A38] transition-colors font-medium text-sm"
                >
                  Brands
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBrandsDropdownOpen(!brandsDropdownOpen);
                  }}
                  className="p-1 text-gray-500 hover:text-[#008A38] transition-colors"
                  aria-label="Toggle Brands menu"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {brandsDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-56 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 animate-fadeIn"
                >
                  {brandOptions.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        selectedBrand === brand
                          ? 'bg-[#008A38]/10 text-[#008A38]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => scrollToSection('why-us-light')}
              className="hover:text-[#008A38] transition-colors"
            >
              Why Us
            </button>

            <button
              onClick={() => scrollToSection('customer-reviews')}
              className="hover:text-[#008A38] transition-colors"
            >
              Testimonials
            </button>

            <button
              onClick={() => scrollToSection('footer')}
              className="hover:text-[#008A38] transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Stack: Search, Message Store CTA, Cart */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative hidden xl:block w-48">
              <input
                type="text"
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 hover:bg-gray-100/80 text-xs px-3 py-2 pl-8 rounded-full border border-gray-200 focus:border-[#008A38] focus:bg-white focus:outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Message Store CTA Button (Figma Button/Main) */}
            <a
              href={`https://wa.me/${whatsappNumber || '84900000000'}?text=${encodeURIComponent('Hi, I am interested in Ben Thanh Luxury Watches')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#008A38] hover:bg-[#00742f] text-white px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Message Store</span>
            </a>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-gray-800 hover:text-black hover:bg-gray-100 rounded-full transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#008A38] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 px-2 space-y-3 bg-white animate-fadeIn">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-sm px-4 py-2.5 pl-9 rounded-lg border border-gray-200 focus:outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (navigateToHome) navigateToHome();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded"
            >
              Home
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (navigateToBrands) navigateToBrands('All');
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-[#008A38] hover:bg-emerald-50 rounded"
            >
              All Brands Catalog (991 Models)
            </button>

            <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-400">
              Browse Brands
            </div>
            <div className="grid grid-cols-2 gap-1 px-3">
              {brandOptions.map((b) => (
                <button
                  key={b}
                  onClick={() => handleBrandSelect(b)}
                  className={`text-left text-xs py-1.5 px-2 rounded font-medium ${
                    selectedBrand === b ? 'bg-[#008A38]/10 text-[#008A38] font-bold' : 'text-gray-700'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollToSection('why-us-light')}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded"
            >
              Why Us
            </button>

            <button
              onClick={() => scrollToSection('customer-reviews')}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded"
            >
              Customer Reviews
            </button>

            <button
              onClick={() => scrollToSection('footer')}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded"
            >
              Contact
            </button>

            {import.meta.env.VITE_PROTOTYPE_MODE !== 'true' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAdminOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-gold-700 hover:bg-gold-50 rounded flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-gold-600" />
                <span>Admin CMS Dashboard</span>
              </button>
            )}

            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappNumber || '84900000000'}?text=${encodeURIComponent('Hi, I am interested in Ben Thanh Luxury Watches')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#008A38] text-white py-3 rounded-xl font-semibold text-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Message Store on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
