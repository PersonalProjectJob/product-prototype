import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getWatchShowcase } from '../utils/watchShowcase';
import { X, Check, ShoppingBag, ShieldCheck, Star, Truck, Award, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';
import WhatsAppIcon from './common/WhatsAppIcon';

export default function ProductQuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    formatPrice,
    addToCart,
    setIsCheckoutOpen,
    sendQuickProductToWhatsApp,
    navigateToProduct
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0); // 0 = Variant 1, 1 = Variant 2
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'specs'
  const [showQuickContact, setShowQuickContact] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickAddress, setQuickAddress] = useState('');

  if (!quickViewProduct) return null;

  const watch = quickViewProduct;
  const showcase = getWatchShowcase(watch);

  const variants = [
    {
      name: watch.variant1Name || 'Swiss Movement',
      price: Number(watch.variant1Price || watch.priceUSD || 700),
      tag: 'Standard Calibre',
      desc: 'High-beat Asian 2836/2824 clone movement with sapphire glass & 316L/904L steel.'
    },
    {
      name: watch.variant2Name || 'VS / Clean 1:1 Super Clone',
      price: Number(watch.variant2Price || 1199),
      tag: 'Best Replica Edition',
      desc: 'True 1:1 Dandong custom clone movement (3135/3235/4130), clone balance wheel, genuine Cerachrom ceramic.'
    }
  ];

  const currentVariant = variants[variantIndex] || variants[0];
  const isOutOfStock = watch.stock === 'OUT_OF_STOCK';

  const images = Array.isArray(watch.images) && watch.images.length > 0
    ? watch.images
    : [watch.primaryImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(watch, quantity, {
      name: currentVariant.name,
      price: currentVariant.price
    });
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setQuickViewProduct(null);
    }, 900);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(watch, quantity, {
      name: currentVariant.name,
      price: currentVariant.price
    });
    setQuickViewProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleOrderViaWhatsApp = () => {
    if (isOutOfStock) return;
    sendQuickProductToWhatsApp({
      watch,
      variantName: currentVariant.name,
      variantPrice: currentVariant.price,
      quantity,
      customer: {
        fullName: quickName.trim(),
        phone: quickPhone.trim(),
        address: quickAddress.trim()
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-4xl shadow-2xl border border-obsidian-800/20 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Open Dedicated Page Button */}
        {navigateToProduct && (
          <button
            onClick={() => {
              setQuickViewProduct(null);
              navigateToProduct(watch);
            }}
            className="absolute top-4 right-16 z-20 bg-white/95 hover:bg-neutral-900 hover:text-white px-3 py-1.5 text-obsidian-800 transition-colors border border-obsidian-800/10 shadow-sm flex items-center gap-1.5 text-xs font-semibold rounded-xs"
            title="Open Dedicated Product Page (/index-all-brands/:slug)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#008A38]" />
            <span className="hidden sm:inline">View Full Page</span>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-obsidian-950 hover:text-white p-2 text-obsidian-800 transition-colors border border-obsidian-800/10 shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-obsidian-800/5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-obsidian-800/10">
            <div>
              <div className="relative aspect-square overflow-hidden bg-white border border-obsidian-800/10 p-4 mb-4 flex items-center justify-center">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={watch.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute top-3 left-3 bg-obsidian-950 text-gold-400 text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                  {watch.factory || 'VS / CLEAN FACTORY'}
                </span>
                {isOutOfStock && (
                  <span className="absolute bottom-3 left-3 bg-neutral-900 text-neutral-300 text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 flex-shrink-0 border p-1 bg-white transition-all ${
                        activeImageIndex === idx
                          ? 'border-gold-500 ring-2 ring-gold-500/20'
                          : 'border-obsidian-800/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-obsidian-800/10 flex items-center gap-2 text-xs text-obsidian-800/70">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Includes 4K QC inspection video &amp; Timegrapher printout</span>
            </div>
          </div>

          {/* Right Column: Watch Specs & Buying Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">
                  {watch.brand} &middot; {watch.collection}
                </span>
                <span className="text-xs text-obsidian-800/40">&bull;</span>
                <span className="text-xs font-mono text-obsidian-800/60">{watch.modelCode || watch.spu}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-obsidian-950 mb-3">
                {watch.name}
              </h2>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-obsidian-800/10">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-obsidian-950">
                  {formatPrice(currentVariant.price)}
                </span>
                <span className="text-sm font-mono text-obsidian-800/40 line-through">
                  {formatPrice(watch.originalPriceUSD)}
                </span>
                <span className="bg-crimson-600 text-white text-[11px] font-bold px-2 py-0.5">
                  Save {formatPrice(Math.max(0, (watch.originalPriceUSD || 0) - currentVariant.price))}
                </span>
              </div>

              {/* 2-Variant Selector Cards */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-2">
                  Select Calibre Movement &amp; Tier:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {variants.map((v, idx) => {
                    const isSelected = variantIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setVariantIndex(idx)}
                        className={`p-3 border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-gold-500 bg-gold-50/20 ring-1 ring-gold-500 shadow-sm'
                            : 'border-obsidian-800/15 hover:border-obsidian-800/40 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-gold-500 bg-gold-500 text-obsidian-950' : 'border-neutral-400'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-gold-500 text-obsidian-950" />}
                            </span>
                            <span className="text-xs font-bold text-obsidian-950">
                              {v.name}
                            </span>
                          </div>
                        </div>
                        <div className="font-mono font-extrabold text-sm text-gold-600 mb-1">
                          {formatPrice(v.price)}
                        </div>
                        <p className="text-[10px] text-obsidian-800/70 leading-relaxed">
                          {v.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specs / Description / Data Sheet / Video Tabs */}
              <div className="border-b border-obsidian-800/10 mb-3 flex flex-wrap gap-2 sm:gap-4 text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`pb-1.5 border-b-2 transition-colors ${
                    activeTab === 'specs'
                      ? 'border-gold-500 text-obsidian-950'
                      : 'border-transparent text-obsidian-800/50 hover:text-obsidian-950'
                  }`}
                >
                  Technical Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('editorial')}
                  className={`pb-1.5 border-b-2 transition-colors ${
                    activeTab === 'editorial'
                      ? 'border-gold-500 text-obsidian-950'
                      : 'border-transparent text-obsidian-800/50 hover:text-obsidian-950'
                  }`}
                >
                  Editorial Story
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('datasheet')}
                  className={`pb-1.5 border-b-2 transition-colors ${
                    activeTab === 'datasheet'
                      ? 'border-gold-500 text-obsidian-950'
                      : 'border-transparent text-obsidian-800/50 hover:text-obsidian-950'
                  }`}
                >
                  Data Sheet
                </button>
                {(watch.qcVideoVimeoId || watch.qcVideoUrl) && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('video')}
                    className={`pb-1.5 border-b-2 transition-colors flex items-center gap-1 ${
                      activeTab === 'video'
                        ? 'border-crimson-600 text-crimson-600'
                        : 'border-transparent text-obsidian-800/50 hover:text-crimson-600'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-crimson-600 animate-pulse"></span>
                    QC Video
                  </button>
                )}
              </div>


              {activeTab === 'specs' && (
                /* Technical Specifications Grid Matching User Screenshot 2 */
                <div className="space-y-4 mb-6 text-xs animate-in fade-in duration-150">
                  {/* Calibre Highlight Box */}
                  <div className="border-l-4 border-obsidian-950 pl-4 py-2.5 bg-neutral-50/90 border-t border-b border-r border-neutral-200/40">
                    <div className="font-mono font-bold text-xs uppercase tracking-wider text-obsidian-950 mb-1 flex items-center justify-between">
                      <span>{showcase.calibre.headline}</span>
                      <span className="text-[10px] bg-gold-500/20 text-gold-700 px-1.5 py-0.5 font-sans font-bold">VERIFIED CALIBRE</span>
                    </div>
                    <p className="text-xs text-obsidian-800/80 mb-2 leading-relaxed">
                      {showcase.calibre.summary}
                    </p>
                    <ul className="space-y-1 text-xs text-obsidian-800/90">
                      {showcase.calibre.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-obsidian-950 font-bold">&bull;</span>
                          <span><strong className="text-obsidian-950 font-semibold">{b.title}:</strong> {b.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3-Column Top Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-obsidian-800/10">
                    {/* The Bezel */}
                    <div className="space-y-1 p-2 bg-neutral-50/50 border border-neutral-200/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-obsidian-800/50">
                        {showcase.specs.bezel.label}
                      </div>
                      <div className="font-bold text-xs text-obsidian-950">
                        {showcase.specs.bezel.title}
                      </div>
                      <p className="text-[11px] text-obsidian-800/70 leading-relaxed">
                        {showcase.specs.bezel.desc}
                      </p>
                    </div>

                    {/* Crystal */}
                    <div className="space-y-1 p-2 bg-neutral-50/50 border border-neutral-200/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-obsidian-800/50">
                        {showcase.specs.crystal.label}
                      </div>
                      <div className="font-bold text-xs text-obsidian-950">
                        {showcase.specs.crystal.title}
                      </div>
                      <p className="text-[11px] text-obsidian-800/70 leading-relaxed">
                        {showcase.specs.crystal.desc}
                      </p>
                    </div>

                    {/* Case Profile */}
                    <div className="space-y-1 p-2 bg-neutral-50/50 border border-neutral-200/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-obsidian-800/50">
                        {showcase.specs.caseProfile.label}
                      </div>
                      <div className="font-bold text-xs text-obsidian-950">
                        {showcase.specs.caseProfile.title}
                      </div>
                      <p className="text-[11px] text-obsidian-800/70 leading-relaxed">
                        {showcase.specs.caseProfile.desc}
                      </p>
                    </div>
                  </div>

                  {/* Bracelet Row */}
                  <div className="p-2.5 bg-neutral-50/50 border border-neutral-200/50 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-obsidian-800/50">
                      {showcase.specs.bracelet.label}
                    </div>
                    <div className="font-bold text-xs text-obsidian-950">
                      {showcase.specs.bracelet.title}
                    </div>
                    <p className="text-[11px] text-obsidian-800/70 leading-relaxed">
                      {showcase.specs.bracelet.desc}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'editorial' && (
                /* Editorial Story & Full Crawled Magazine Layout */
                <div className="mb-6 animate-in fade-in duration-150">
                  <div className="border border-obsidian-800/10 p-4 bg-white max-h-[380px] overflow-y-auto custom-scrollbar">
                    {watch.rawDescriptionHtml ? (
                      <div
                        className="text-xs text-obsidian-900 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: watch.rawDescriptionHtml }}
                      />
                    ) : (
                      <div className="space-y-3">
                        <h3 className="font-heading text-lg font-bold text-obsidian-950">{showcase.titleLine}</h3>
                        <p className="text-xs text-obsidian-800/80 italic">{showcase.tagline}</p>
                        <div className="whitespace-pre-line text-xs font-mono text-obsidian-800 bg-neutral-50 p-3 border">
                          {watch.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'datasheet' && (
                /* Data Sheet Table (8 Exact Specifications Matching vsfwatch.cc) */
                <div className="space-y-3 mb-6 animate-in fade-in duration-150">
                  <div className="border border-obsidian-800/15 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-obsidian-800/10 bg-neutral-50/80">
                          <td className="p-2.5 font-bold text-[11px] text-obsidian-900 uppercase tracking-wider w-1/3">MODEL REFERENCE</td>
                          <td className="p-2.5 font-mono text-obsidian-950 font-semibold">{watch.dataSheet?.modelReference || watch.modelCode || watch.name}</td>
                        </tr>
                        <tr className="border-b border-obsidian-800/10">
                          <td className="p-2.5 font-bold text-[11px] text-obsidian-900 uppercase tracking-wider">FACTORY / VERSION</td>
                          <td className="p-2.5 text-obsidian-950 font-bold">{watch.dataSheet?.factoryVersion || watch.factory || 'VSF Ultimate Edition'}</td>
                        </tr>
                        <tr className="border-b border-obsidian-800/10 bg-gold-50/30">
                          <td className="p-2.5 font-bold text-[11px] text-gold-950 uppercase tracking-wider">MOVEMENT</td>
                          <td className="p-2.5 font-mono font-bold text-gold-900">{watch.dataSheet?.movement || watch.movement || 'Dandong Super Clone'}</td>
                        </tr>
                        <tr className="border-b border-obsidian-800/10">
                          <td className="p-2.5 font-bold text-[11px] text-obsidian-900 uppercase tracking-wider">BEZEL</td>
                          <td className="p-2.5 text-obsidian-800">{watch.dataSheet?.bezel || watch.bezel || 'Cerachrom Ceramic'}</td>
                        </tr>
                        <tr className="border-b border-obsidian-800/10 bg-neutral-50/80">
                          <td className="p-2.5 font-bold text-[11px] text-obsidian-900 uppercase tracking-wider">CASE MATERIAL</td>
                          <td className="p-2.5 text-obsidian-800">{watch.dataSheet?.caseMaterial || watch.material || 'Solid 904L Oystersteel'}</td>
                        </tr>
                        <tr className="border-b border-obsidian-800/10">
                          <td className="p-2.5 font-bold text-[11px] text-obsidian-900 uppercase tracking-wider">BRACELET</td>
                          <td className="p-2.5 text-obsidian-800">{watch.dataSheet?.bracelet || 'Solid 904L Steel with Comfort Extension'}</td>
                        </tr>
                        <tr className="border-b border-obsidian-800/10 bg-neutral-50/80">
                          <td className="p-2.5 font-bold text-[11px] text-obsidian-900 uppercase tracking-wider">CASE DIMENSIONS</td>
                          <td className="p-2.5 font-mono text-obsidian-950 font-semibold">{watch.dataSheet?.caseDimensions || (watch.caseSize ? `${watch.caseSize} x 12.1 mm` : '40 mm x 12.1 mm')}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-[11px] text-obsidian-900 uppercase tracking-wider">WATER RESISTANCE</td>
                          <td className="p-2.5 text-emerald-700 font-bold">{watch.dataSheet?.waterResistance || watch.waterResistance || '50 Meters (Pressure Tested)'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'video' && (watch.qcVideoVimeoId || watch.qcVideoUrl) && (
                /* Live QC Movement Video Tab */
                <div className="space-y-3 mb-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-obsidian-950">Live Calibre Sweep &amp; Timegrapher QC Video</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">Verified 1:1 Rate</span>
                  </div>
                  <div className="relative pb-[56.25%] h-0 bg-black border border-obsidian-800/20 overflow-hidden shadow-inner">
                    <iframe
                      src={`https://player.vimeo.com/video/${watch.qcVideoVimeoId || '1155540056'}?autoplay=0&loop=1`}
                      title={watch.name}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-[11px] text-obsidian-800/70 italic">
                    Actual factory footage verifying smooth 28,800 VPH sweep and mechanical functionality.
                  </p>
                </div>
              )}

            </div>

            {/* Buying Action Controls */}
            <div className="space-y-3 pt-3 border-t border-obsidian-800/10">
              
              {/* Primary 1-Click WhatsApp Order CTA (CJM: Chốt & Gửi thông tin trực tiếp cho Sale) */}
              {!isOutOfStock && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleOrderViaWhatsApp}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Order via WhatsApp &middot; Request 4K QC ({formatPrice(currentVariant.price * quantity)})</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-obsidian-800/60">Direct 1-on-1 VIP concierge support</span>
                    <button
                      type="button"
                      onClick={() => setShowQuickContact(!showQuickContact)}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
                    >
                      {showQuickContact ? 'Hide delivery fields' : '+ Add shipping info for instant dispatch'}
                    </button>
                  </div>

                  {/* Expandable Quick Contact Inputs */}
                  {showQuickContact && (
                    <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs space-y-2 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-0.5">Your Full Name</label>
                        <input
                          type="text"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          placeholder="e.g. Alexander Wright"
                          className="w-full p-2 border border-neutral-300 text-xs bg-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-0.5">Phone / WhatsApp *</label>
                          <input
                            type="tel"
                            value={quickPhone}
                            onChange={(e) => setQuickPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full p-2 border border-neutral-300 text-xs bg-white focus:outline-none focus:border-gold-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-0.5">City / Country</label>
                          <input
                            type="text"
                            value={quickAddress}
                            onChange={(e) => setQuickAddress(e.target.value)}
                            placeholder="e.g. New York, USA"
                            className="w-full p-2 border border-neutral-300 text-xs bg-white focus:outline-none focus:border-gold-500"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500 italic">
                        ✓ Your shipping details will be pre-formatted into WhatsApp so Sale can prepare dispatch immediately.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Cart & Buy Now Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-obsidian-800/20 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="px-3 py-2 text-obsidian-800 hover:bg-obsidian-800/10 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 font-mono font-bold text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock}
                    className="px-3 py-2 text-obsidian-800 hover:bg-obsidian-800/10 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-emerald-700 text-white'
                      : 'bg-obsidian-950 hover:bg-obsidian-800 text-white'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Currently Out of Stock</span>
                  ) : addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Item Added To Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-gold-400" />
                      <span>Add To Cart &middot; {formatPrice(currentVariant.price * quantity)}</span>
                    </>
                  )}
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-extrabold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buy Now &amp; Proceed To Checkout</span>
                </button>
              )}

              <div className="text-[11px] text-center text-obsidian-800/60 flex items-center justify-center gap-4 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Free Priority Air Express
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-gold-600" /> 2-Year Calibre Warranty
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

