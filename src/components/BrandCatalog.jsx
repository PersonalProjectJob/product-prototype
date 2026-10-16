import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import { Filter, Search, RefreshCw, ArrowUpDown, ChevronDown, Sparkles } from 'lucide-react';

const POPULAR_BRANDS = [
  'All',
  'Rolex',
  'Omega',
  'Patek Philippe',
  'Audemars Piguet',
  'Cartier',
  'Breitling',
  'Panerai',
  'Richard Mille',
  'Hublot',
  'Vacheron Constantin',
  'IWC',
  'Franck Muller'
];

export default function BrandCatalog() {
  const { products, selectedBrand, setSelectedBrand, searchQuery, setSearchQuery } = useStore();
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(24);

  // Compute brand counts
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
      : products.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());

    const collMap = {};
    brandProducts.forEach((p) => {
      if (p.collection) {
        collMap[p.collection] = (collMap[p.collection] || 0) + 1;
      }
    });

    const sortedCols = Object.keys(collMap).sort((a, b) => collMap[b] - collMap[a]);
    return ['All', ...sortedCols.slice(0, 10)];
  }, [products, selectedBrand]);

  // Filter products
  const filteredWatches = useMemo(() => {
    return products.filter((w) => {
      // Brand filter
      if (selectedBrand !== 'All' && w.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
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

  // Visible page slice
  const displayedWatches = useMemo(() => {
    return sortedWatches.slice(0, visibleCount);
  }, [sortedWatches, visibleCount]);

  const handleBrandChange = (b) => {
    setSelectedBrand(b);
    setSelectedCollection('All');
    setVisibleCount(24);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 24);
  };

  return (
    <section id="catalog-section" className="py-16 bg-neutral-50/60 border-b border-obsidian-800/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-obsidian-800/10">
          <div>
            <div className="text-xs uppercase font-bold text-gold-600 tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Full Master Catalog &bull; 991 Super Clones
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-obsidian-950">
              Verified Calibre Showcase
            </h2>
            <p className="text-xs sm:text-sm text-obsidian-800/60 mt-1">
              Showing {displayedWatches.length} of {sortedWatches.length} verified pieces with dual Swiss &amp; Clean 1:1 variants
            </p>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 991 watches by model, calibre..."
                className="w-full bg-white border border-obsidian-800/15 pl-9 pr-3 py-2 text-xs text-obsidian-950 placeholder:text-obsidian-800/40 focus:outline-none focus:border-gold-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-obsidian-800/40 hover:text-crimson-600"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-obsidian-800/15 px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-obsidian-800/60" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-obsidian-950 font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Brand Selection Tabs */}
        <div className="flex overflow-x-auto gap-1.5 pb-3 mb-6 scrollbar-none">
          {POPULAR_BRANDS.map((b) => {
            const count = brandCounts[b] || 0;
            const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
            return (
              <button
                key={b}
                onClick={() => handleBrandChange(b)}
                className={`px-3.5 py-2 text-xs uppercase font-bold tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-obsidian-950 text-white border-obsidian-950 shadow-sm'
                    : 'bg-white text-obsidian-800/70 border-obsidian-800/10 hover:border-obsidian-800/30 hover:text-obsidian-950'
                }`}
              >
                <span>{b}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-gold-500 text-obsidian-950 font-bold' : 'bg-obsidian-800/5 text-obsidian-800/60'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Collection Filter Chips */}
        {collections.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-xs text-obsidian-800/50 flex items-center gap-1 uppercase tracking-wider font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" /> Series:
            </span>
            {collections.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSelectedCollection(c);
                  setVisibleCount(24);
                }}
                className={`px-3 py-1 text-xs transition-colors border ${
                  selectedCollection === c
                    ? 'bg-gold-500 text-obsidian-950 border-gold-500 font-bold'
                    : 'bg-white text-obsidian-800/70 border-obsidian-800/10 hover:border-obsidian-800/30 font-medium'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {displayedWatches.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedWatches.map((watch) => (
                <ProductCard key={watch.id} watch={watch} />
              ))}
            </div>

            {/* Load More Pagination Bar */}
            {visibleCount < sortedWatches.length && (
              <div className="mt-12 text-center space-y-3">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3.5 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 font-extrabold uppercase text-xs tracking-widest shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>Load More Models ({sortedWatches.length - visibleCount} Remaining)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="text-xs text-obsidian-800/50 font-mono">
                  Displaying {visibleCount} of {sortedWatches.length} pieces
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-obsidian-800/20 p-8">
            <Search className="w-10 h-10 text-obsidian-800/30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-obsidian-950 uppercase tracking-wider">
              No matching pieces found
            </h3>
            <p className="text-xs text-obsidian-800/60 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or reset filters to browse all 991 models.
            </p>
            <button
              onClick={() => {
                setSelectedBrand('All');
                setSelectedCollection('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-obsidian-950 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-gold-500 hover:text-obsidian-950 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

