import React from 'react';
import { useStore } from '../context/StoreContext';

export default function TopBrandsSection() {
  const { setSelectedBrand, navigateToBrands } = useStore();

  const brands = [
    { name: "Rolex" },
    { name: "Patek Philippe" },
    { name: "Omega" },
    { name: "Audemars Piguet" },
    { name: "Breitling" },
    { name: "Chanel" },
    { name: "Hublot" },
    { name: "Tissot" },
    { name: "Casio" },
    { name: "Cartier" },
    { name: "Tudor" },
    { name: "IWC" },
    { name: "TAG Heuer" },
    { name: "Jacob & Co" },
    { name: "Rado" },
  ];

  const handleBrandClick = (brandName) => {
    if (navigateToBrands) {
      navigateToBrands(brandName);
    } else {
      setSelectedBrand(brandName);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Single Heading: Centered "Top Brands" (Figma Node 2024:773) */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-black tracking-tight">
            Top Brands
          </h2>
        </div>

        {/* 15 Brand Logos Grid from Figma Node 2046:326 (No duplicate heading) */}
        <div className="relative w-full max-w-[1140px] mx-auto">
          <img
            src="/figma-assets/brand-grid-logos.png"
            alt="Rolex, Patek Philippe, Omega, Audemars Piguet, Cartier, Hublot, Breitling, Tudor and luxury watchmakers"
            className="w-full h-auto object-contain mx-auto"
          />
        </div>

        {/* Interactive Brand Selector Buttons Below Grid */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {brands.map((brand) => (
            <button
              key={brand.name}
              onClick={() => handleBrandClick(brand.name)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 bg-gray-50 hover:bg-black hover:text-white rounded-full border border-gray-200 hover:border-black transition-all duration-200"
            >
              {brand.name}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
