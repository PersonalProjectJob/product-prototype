import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../ProductCard';
import UnmatchedExperienceSection from '../UnmatchedExperienceSection';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Loader2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';

const CURATED_BRAND_CARDS = [
  { slug: 'rolex', name: 'Rolex', logo: '/figma-assets/brands/rolex.png' },
  { slug: 'patek-philippe', name: 'Patek Philippe', logo: '/figma-assets/brands/patek-philippe.png' },
  { slug: 'omega', name: 'Omega', logo: '/figma-assets/brands/omega.png' },
  { slug: 'cartier', name: 'Cartier', logo: '/figma-assets/brands/cartier.png' },
  { slug: 'breitling', name: 'Breitling', logo: '/figma-assets/brands/breitling.png' },
  { slug: 'casio', name: 'Casio', logo: '/figma-assets/brands/casio.png' },
  { slug: 'hublot', name: 'Hublot', logo: '/figma-assets/brands/hublot.png' },
  { slug: 'tissot', name: 'Tissot', logo: '/figma-assets/brands/tissot.png' },
  { slug: 'iwc', name: 'IWC', logo: '/figma-assets/brands/iwc.png' },
  { slug: 'chanel', name: 'Chanel', logo: '/figma-assets/brands/chanel.png' },
  { slug: 'tag-heuer', name: 'TAG Heuer', logo: '/figma-assets/brands/tag-heuer.png' },
  { slug: 'audemars-piguet', name: 'Audemars Piguet', logo: '/figma-assets/brands/audemars-piguet.png' }
];

const resolveAsset = (src) => {
  if (typeof window !== 'undefined' && window.__FIGMA_ASSETS__ && window.__FIGMA_ASSETS__[src]) {
    return window.__FIGMA_ASSETS__[src];
  }
  return src;
};

export default function BrandCatalogPage({ onBackToHome }) {
  const {
    products,
    selectedBrand,
    setSelectedBrand,
    searchQuery,
    setSearchQuery,
    navigateToHome
  } = useStore();

  const PAGE_SIZE = 50;
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sentinelRef = useRef(null);

  // Brand product counts
  const brandCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      const b = p.brand || 'Other';
      counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Derived available collections based on selected brand
  const collections = useMemo(() => {
    const brandProducts = selectedBrand === 'All'
      ? products
      : products.filter((p) => (p.brand || '').toLowerCase() === selectedBrand.toLowerCase());

    const collMap = {};
    brandProducts.forEach((p) => {
      if (p.collection && p.collection !== 'Signature Collection') {
        collMap[p.collection] = (collMap[p.collection] || 0) + 1;
      }
    });

    const sortedCols = Object.keys(collMap).sort((a, b) => collMap[b] - collMap[a]);
    return ['All', ...sortedCols.slice(0, 8)];
  }, [products, selectedBrand]);

  // Filter products
  const filteredWatches = useMemo(() => {
    return products.filter((w) => {
      // Brand filter
      if (selectedBrand !== 'All') {
        const matchBrand = (w.brand || '').toLowerCase() === selectedBrand.toLowerCase() ||
          (selectedBrand.toLowerCase() === 'audemars piguet' && (w.brand || '').toLowerCase().includes('audemars')) ||
          (selectedBrand.toLowerCase() === 'patek philippe' && (w.brand || '').toLowerCase().includes('patek')) ||
          (selectedBrand.toLowerCase() === 'tag heuer' && (w.brand || '').toLowerCase().includes('tag'));
        if (!matchBrand) return false;
      }

      // Collection filter
      if (selectedCollection !== 'All' && w.collection !== selectedCollection) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (w.name || '').toLowerCase().includes(q);
        const matchBrand = (w.brand || '').toLowerCase().includes(q);
        const matchMovement = (w.movement || '').toLowerCase().includes(q);
        const matchFactory = (w.factory || '').toLowerCase().includes(q);
        const matchModel = (w.modelCode || w.spu || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchMovement && !matchFactory && !matchModel) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedBrand, selectedCollection, searchQuery]);

  // Sort products
  const sortedWatches = useMemo(() => {
    const list = [...filteredWatches];
    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.variant1Price || a.priceUSD || 0) - (b.variant1Price || b.priceUSD || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.variant1Price || b.priceUSD || 0) - (a.variant1Price || a.priceUSD || 0));
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [filteredWatches, sortBy]);

  // Reset pageNumber = 1 whenever brand, collection, sort, or search changes
  useEffect(() => {
    setPageNumber(1);
  }, [selectedBrand, selectedCollection, sortBy, searchQuery]);

  // Lazy loading: slice by pageNumber * PAGE_SIZE
  const displayedWatches = useMemo(() => {
    return sortedWatches.slice(0, pageNumber * PAGE_SIZE);
  }, [sortedWatches, pageNumber, PAGE_SIZE]);

  const hasMore = displayedWatches.length < sortedWatches.length;

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPageNumber((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 250);
  };

  // Intersection Observer for smooth progressive lazy loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          handleLoadMore();
        }
      },
      {
        rootMargin: '300px',
        threshold: 0.1
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, pageNumber]);

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    setSelectedCollection('All');
    setPageNumber(1);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    if (onBackToHome) onBackToHome();
    else if (navigateToHome) navigateToHome();
  };

  // Dynamic FAQs based on current brand
  const brandFaqs = useMemo(() => {
    const brandTitle = selectedBrand === 'All' ? 'Super Clone' : selectedBrand;
    return [
      {
        q: `Are these ${brandTitle} replicas waterproof?`,
        a: `Yes, all our ${brandTitle} 1:1 super clones are waterproof pressure-tested up to 50 meters (5 ATM) with dual rubber O-ring screw-down crown gaskets. They are fully safe for daily hand washing, rain, and swimming.`
      },
      {
        q: 'Can I get a discount on my purchase?',
        a: 'Yes! We provide an automatic 10% welcome discount with coupon code SUPERCLONE10 at checkout, plus special pricing and complimentary priority DHL/FedEx shipping on orders of 2 or more timepieces.'
      },
      {
        q: 'How long does delivery take, and do you provide QC inspection?',
        a: 'Every timepiece undergoes a rigorous 48-hour bench test and Timegrapher accuracy calibration (+/- 3s/day). We send high-resolution 4K QC photos and video via WhatsApp before shipment. Once approved, FedEx/DHL express delivery arrives within 5 to 8 business days worldwide.'
      }
    ];
  }, [selectedBrand]);

  return (
    <div className="bg-white min-h-screen text-obsidian-950 pb-20">
      
      {/* 1. Page Container (Figma 1240px container) */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-8">

        {/* 2. Hero Image Banner (Figma Node 2170:1395 - 1240x260) */}
        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] rounded-[12px] overflow-hidden shadow-sm">
          <img
            src={resolveAsset('/figma-assets/brand-hero-banner.png')}
            alt="Ben Thanh Luxury Brand Catalog Banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* 3. Breadcrumbs (Figma Node 2170:1397) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 font-medium py-1">
          <button
            onClick={handleBackToHome}
            className="hover:text-[#008A38] transition-colors flex items-center gap-1"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <button
            onClick={() => handleBrandSelect('All')}
            className={`transition-colors ${selectedBrand === 'All' ? 'text-obsidian-950 font-bold' : 'hover:text-[#008A38]'}`}
          >
            All Brands
          </button>
          {selectedBrand !== 'All' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#A88236] font-bold uppercase tracking-wider">
                {selectedBrand}
              </span>
            </>
          )}
        </nav>

        {/* 4. Frame 208: 12 Brand Selection Cards (Figma Node 2170:1403 - 1240x238) */}
        <section aria-label="Brand Selection">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[10px]">
            {CURATED_BRAND_CARDS.map((brand) => {
              const isSelected = selectedBrand.toLowerCase() === brand.name.toLowerCase();

              return (
                <button
                  key={brand.slug}
                  onClick={() => handleBrandSelect(isSelected ? 'All' : brand.name)}
                  aria-label={brand.name}
                  className={`relative flex items-center justify-center p-3 h-[96px] sm:h-[109px] rounded-[12px] transition-all duration-200 group cursor-pointer ${
                    isSelected
                      ? 'bg-white ring-2 ring-[#0D0D0D] shadow-sm'
                      : 'bg-[#E5E5E5] hover:bg-[#DCDCDC]'
                  }`}
                >
                  <img
                    src={resolveAsset(brand.logo)}
                    alt={brand.name}
                    className="max-h-[50px] max-w-[126px] w-auto object-contain transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Listing Controls Bar (Figma Node 2170:1481) */}
        <div className="flex items-center justify-between pt-2">
          {/* Left: Item Counter (Figma Node 2170:1482) */}
          <div className="text-[16px] font-normal text-[#0D0D0D]">
            {sortedWatches.length} items
          </div>

          {/* Right: Sort Controls (Figma Node 2170:1483) */}
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-normal text-[#0D0D0D]">Sort by:</span>
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort by"
                className="appearance-none bg-[#262626] hover:bg-[#333] text-white text-sm font-medium h-10 pl-4 pr-9 rounded-lg cursor-pointer focus:outline-none transition-colors"
              >
                <option value="price-asc" className="bg-[#262626] text-white">Price, low to high</option>
                <option value="price-desc" className="bg-[#262626] text-white">Price, high to low</option>
                <option value="name-asc" className="bg-[#262626] text-white">Alphabetical: A-Z</option>
                <option value="featured" className="bg-[#262626] text-white">Featured</option>
              </select>
              <ChevronDown className="w-4 h-4 text-white absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 6. Product Grid (Figma Node 2170:1486) with Lazy Loading (pageSize = 50, pageNumber = 1) */}
        {displayedWatches.length > 0 ? (
          <div className="space-y-10">
            <div id="brand-products-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-14">
              {displayedWatches.map((watch) => (
                <ProductCard key={watch.id} watch={watch} />
              ))}
            </div>

            {/* Load More Button (Figma Node 2170:1500 - 168x56 rounded-[16px]) */}
            {hasMore ? (
              <div className="pt-8 pb-4 flex flex-col items-center space-y-3">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-[168px] h-[56px] bg-[#262626] hover:bg-black text-white text-sm font-medium rounded-[16px] shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-60"
                >
                  {isLoadingMore ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    'View More'
                  )}
                </button>
                <p className="text-[12px] text-gray-400 font-mono">
                  Displaying {displayedWatches.length} of {sortedWatches.length} timepieces
                </p>
              </div>
            ) : (
              <div className="py-6 text-xs font-semibold text-gray-500 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008A38]" />
                <span>All {sortedWatches.length} {selectedBrand === 'All' ? 'catalog' : selectedBrand} timepieces loaded.</span>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4 w-full" />
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-obsidian-950 uppercase tracking-wider">
              No matching timepieces found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn't find any models matching your active filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedBrand('All');
                setSelectedCollection('All');
                setSearchQuery('');
              }}
              className="mt-4 px-6 py-2.5 bg-obsidian-950 hover:bg-[#008A38] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset All Filters
            </button>
          </div>
        )}

        {/* 7. Mid-Page Precision Engineering Banner (Figma Node 2170:1501 - Frame 198) */}
        <section className="bg-obsidian-950 text-white rounded-2xl p-6 sm:p-10 md:p-12 shadow-xl border border-gold-900/20 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: 3 Value Pills (Figma Frame 184) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-[#008A38]/20 text-[#008A38] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#008A38]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Performance</h4>
                  <p className="text-[11px] text-gray-400">Swiss Dandong Calibre regulated to +/- 3s/day</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Information</h4>
                  <p className="text-[11px] text-gray-400">Exact 1:1 rehaut engraving & ceramic bezel</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Shipping</h4>
                  <p className="text-[11px] text-gray-400">FedEx 5-8 days with 4K WhatsApp QC proof</p>
                </div>
              </div>
            </div>

            {/* Right: Precision Copy (Figma Frame 197) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A88236]/20 text-[#C4A052] text-xs font-bold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" /> High Precision Craftsmanship
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-heading">
                Precision Engineering, Swiss Performance
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Our {selectedBrand === 'All' ? 'luxury' : selectedBrand} super clones feature correct crown logo alignment,
                laser-etched rehaut engraving, genuine ceramic bezel inserts, and fully functional complications — from
                instantaneous date changes to fully operating chronographs. Every movement is finely regulated for sweep
                smoothness and decades of dependable timekeeping.
              </p>
            </div>

          </div>
        </section>

        {/* 8. Frequently Asked Questions (Figma Node 2170:1510) */}
        <section className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-6 sm:p-10 space-y-8">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#008A38] flex items-center gap-1.5 mb-1">
              <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-obsidian-950 font-heading">
              Questions About Your Choices
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Common inquiries about our 1:1 super clone timepieces, water resistance, discounts, and dispatch procedure.
            </p>
          </div>

          <div className="space-y-3">
            {brandFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-obsidian-950 hover:text-[#008A38] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-[#008A38]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 9. An Unmatched Experience (Figma Node 2170:1524) */}
        <section className="pt-4">
          <UnmatchedExperienceSection />
        </section>

      </div>
    </div>
  );
}
