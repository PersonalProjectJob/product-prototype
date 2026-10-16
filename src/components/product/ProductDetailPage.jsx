import React, { useState, useEffect } from 'react';
import { useStore, getFigmaWatchThumbnail } from '../../context/StoreContext';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  ShoppingBag,
  ExternalLink,
  PhoneCall,
  MapPin,
  HelpCircle,
  Share2,
  ChevronDown,
  ChevronRight,
  Eye,
  Award,
  Clock,
  Sparkles,
  Zap,
  ArrowLeft
} from 'lucide-react';
import WhatsAppIcon from '../common/WhatsAppIcon';
import ProductCard from '../ProductCard';

export default function ProductDetailPage({ product, onBackToHome }) {
  const {
    formatPrice,
    addToCart,
    sendQuickProductToWhatsApp,
    products,
    navigateToProduct,
    navigateToBrands,
    setSelectedBrand
  } = useStore();

  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(1); // Default to Clean 1:1 (high-end)
  const [activeSpecTab, setActiveSpecTab] = useState('overall'); // 'overall' | 'features' | 'case' | 'movement'
  const [openAccordion, setOpenAccordion] = useState(null); // Collapsed by default for balanced 2-column stage
  const [copiedShare, setCopiedShare] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);
  }, [product.id]);

  const variants = [
    {
      name: product.variant1Name || 'Swiss Movement',
      price: Number(product.variant1Price || product.priceUSD || 700),
      label: 'Swiss Movement',
      desc: 'High-precision Swiss ETA / 2824 sweep calibre clone'
    },
    {
      name: product.variant2Name || 'VS / Clean 1:1 Super Clone',
      price: Number(product.variant2Price || 1199),
      label: 'Clean 1:1 Super Clone',
      desc: 'Flawless 1:1 Dandong Super Clone Movement with 4K QC video'
    }
  ];

  const currentVariant = variants[selectedVariantIndex] || variants[0];
  const isOutOfStock = product.stock === 'OUT_OF_STOCK';

  const isLogoOrPlaceholder = (url) => {
    if (!url || typeof url !== 'string') return true;
    if (url.includes('932e9558f0dc5') || url.includes('1f65403e05')) return true;
    if (url.includes('images.unsplash.com')) return true;
    if (url.includes('819e9bbafa326f2613358e0363f1a65638564f6d0ff9246c7f8874043a1e936d')) return true;
    return false;
  };

  const figmaImg = typeof getFigmaWatchThumbnail === 'function' ? getFigmaWatchThumbnail(product) : '/figma-assets/watches/watch-0.png';

  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.primaryImage ? [product.primaryImage] : []);

  // Filter out standalone logo banner and repeated generic Daytona
  const watchImagesOnly = rawImages.filter(img => !isLogoOrPlaceholder(img));
  const images = watchImagesOnly.length > 0
    ? [figmaImg, ...watchImagesOnly.filter(img => img !== figmaImg)]
    : [figmaImg];

  const ds = product.dataSheet || {};
  const showcase = product.richShowcase;

  const calibreInfo = showcase?.calibre || {
    headline: `POWERED BY ${product.movement?.toUpperCase() || 'CUSTOM SWISS CALIBRE'}`,
    summary: `Engineered according to genuine tolerances. Powered by a calibrated automatic mechanical calibre tuned for lasting durability and timegrapher accuracy.`,
    bullets: [
      { title: 'Power Reserve Guarantee', desc: 'Extended autonomous running power with optimized mainspring barrel geometry.' },
      { title: 'High-Beat 28,800 VPH', desc: 'Smooth sweeping second hand mimicking authentic mechanical fluidity.' },
      { title: 'Electronic Timegrapher Regulation', desc: 'Regulated to within ±3 seconds per day for optimum chronometric performance.' }
    ]
  };

  const specCards = showcase?.specs ? [
    { label: showcase.specs.bezel.label || 'THE BEZEL', title: showcase.specs.bezel.title, desc: showcase.specs.bezel.desc },
    { label: showcase.specs.crystal.label || 'THE CRYSTAL', title: showcase.specs.crystal.title, desc: showcase.specs.crystal.desc },
    { label: showcase.specs.caseProfile.label || 'CASE PROFILE', title: showcase.specs.caseProfile.title, desc: showcase.specs.caseProfile.desc },
    { label: showcase.specs.bracelet.label || 'BRACELET', title: showcase.specs.bracelet.title, desc: showcase.specs.bracelet.desc }
  ] : [
    { label: 'THE BEZEL', title: ds.bezel || product.bezel || 'Cerachrom Ceramic Bezel', desc: 'Scratch-resistant rotatable bezel with laser-etched markers and platinum/gold PVD deposition.' },
    { label: 'THE CRYSTAL', title: product.crystal || 'Scratch-Proof Sapphire', desc: 'High-purity synthetic corundum sapphire crystal with internal anti-reflective coating.' },
    { label: 'CASE PROFILE', title: ds.caseDimensions || `${product.caseSize || '42 mm'} Case`, desc: `Crafted from ${ds.caseMaterial || product.material || 'Solid 904L Oystersteel'} with satin-brushed surfaces and mirror-polished chamfers.` },
    { label: 'BRACELET', title: ds.bracelet || product.bracelet || 'Solid Oyster / Jubilee Bracelet', desc: 'Solid links with patented comfort extension and folding safety clasp.' }
  ];

  const fullDataSheet = [
    { label: 'Model Reference', value: ds.modelReference || product.modelCode || product.spu || 'N/A' },
    { label: 'Factory / Edition', value: ds.factoryVersion || product.factory || 'VS / Clean Factory' },
    { label: 'Movement / Calibre', value: ds.movement || product.movement || 'Swiss Movement', highlight: true },
    { label: 'Bezel', value: ds.bezel || product.bezel || 'High-grade Ceramic / Steel' },
    { label: 'Dial Color', value: ds.dial || product.dial || 'Custom Guilloche / Sunburst' },
    { label: 'Case Material', value: ds.caseMaterial || product.material || 'Solid 904L Stainless Steel' },
    { label: 'Case Dimensions', value: ds.caseDimensions || `${product.caseSize || '42 mm'} x 12.5 mm` },
    { label: 'Bracelet / Strap', value: ds.bracelet || product.bracelet || 'Solid Steel with Micro-Adjustment' },
    { label: 'Water Resistance', value: ds.waterResistance || product.waterResistance || '50m / 5 ATM Tested', highlight: true }
  ];

  // Find related watches from same brand
  const relatedWatches = products
    .filter((p) => p.brand === product.brand && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, 1, {
      name: currentVariant.name,
      price: currentVariant.price
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#008A38] selection:text-white">
      
      {/* Breadcrumb Navigation Bar (matching Framer site) */}
      <div className="border-b border-gray-100 bg-gray-50/70 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <nav className="flex items-center gap-1.5 text-gray-500 overflow-x-auto whitespace-nowrap">
            <button
              onClick={onBackToHome}
              className="hover:text-black font-medium transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <button
              onClick={() => {
                if (navigateToBrands) {
                  navigateToBrands('All');
                } else {
                  onBackToHome();
                }
              }}
              className="hover:text-black font-medium transition-colors"
            >
              All Brands
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <button
              onClick={() => {
                if (navigateToBrands) {
                  navigateToBrands(product.brand);
                } else {
                  if (setSelectedBrand) setSelectedBrand(product.brand);
                  onBackToHome();
                }
              }}
              className="hover:text-[#008A38] font-semibold text-gray-700 transition-colors"
            >
              {product.brand}
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-black font-bold truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </nav>

          <button
            onClick={onBackToHome}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#008A38] hover:underline"
          >
            &larr; Back to Curated Stock
          </button>
        </div>
      </div>

      {/* Main Product Stage: 2-Column Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ================= LEFT COLUMN: GALLERY & VISUALS (6 Cols - Sticky) ================= */}
          <div className="lg:col-span-6 flex flex-col gap-4 lg:sticky lg:top-24">
            {/* Primary Image Viewport */}
            <div className="relative aspect-square w-full bg-[#f8f8f8] border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center p-6 shadow-xs group">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-contain object-center transform transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
                <span className="bg-[#008A38] text-white text-[11px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase shadow-sm">
                  NEW
                </span>
                <span className="bg-amber-500 text-black text-[11px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase shadow-sm">
                  -10%
                </span>
                {product.factory && (
                  <span className="bg-black/90 text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border border-amber-400/30">
                    {product.factory}
                  </span>
                )}
              </div>

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-white text-black font-extrabold text-sm uppercase px-4 py-2 tracking-widest">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 bg-white rounded-xl overflow-hidden border-2 transition-all p-1.5 ${
                      activeImageIndex === idx
                        ? 'border-[#008A38] shadow-md scale-105'
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Live QC Movement Preview Teaser */}
            {(product.qcVideoVimeoId || product.qcVideoUrl) && (
              <div className="bg-black text-white p-4 rounded-xl flex items-center justify-between shadow-md border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <div>
                    <span className="text-xs font-bold block uppercase tracking-wider text-amber-400">
                      Live 4K Calibre Sweep Video
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Verified 28,800 vph + Timegrapher Printout
                    </span>
                  </div>
                </div>
                <a
                  href={product.qcVideoUrl || `https://vimeo.com/${product.qcVideoVimeoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1 border border-white/20"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </a>
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: BUY BOX & SPECS (7 Cols) ================= */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Title & Brand Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#008A38] uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-xs font-mono text-gray-500">
                  {ds.modelReference || product.modelCode || product.spu}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Subtitle / Case dimension headline */}
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                {ds.caseDimensions || `${product.caseSize || '42 mm'}, ${ds.caseMaterial || product.material || 'Solid 904L Steel & Sedna Gold on alligator'}`}
              </p>
            </div>

            {/* Price & Shipping Note */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold font-mono text-black">
                  {formatPrice(currentVariant.price)}
                </span>
                <span className="text-sm font-mono text-gray-400 line-through">
                  {formatPrice(Math.round(currentVariant.price * 1.15))}
                </span>
                <span className="text-xs font-bold bg-[#008A38]/10 text-[#008A38] px-2 py-0.5 rounded">
                  Save 15% VIP
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Shipping calculated at checkout. <strong className="text-black">Orders over $500 ship free worldwide.</strong>
              </p>
            </div>

            {/* Variant Selector Pills (matching Framer site: Hong Kong / Japanese / Swiss) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center justify-between">
                <span>Select Quality Grade / Movement Edition:</span>
                <span className="text-[11px] text-[#008A38] font-semibold">{currentVariant.label}</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                      selectedVariantIndex === idx
                        ? 'border-[#008A38] bg-[#008A38]/5 ring-2 ring-[#008A38]/20 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-black">{v.label}</span>
                      <span className="font-mono font-extrabold text-xs text-[#008A38]">
                        {formatPrice(v.price)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                      {v.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs: Add to Cart + Direct WhatsApp VIP Concierge */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{justAdded ? '✓ Added to Bag' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => sendQuickProductToWhatsApp(product, currentVariant.name, currentVariant.price)}
                  className="w-full py-3.5 bg-[#008A38] hover:bg-[#00742f] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white fill-white" />
                  <span>Order via WhatsApp</span>
                </button>
              </div>

              {/* Trust Guarantee Badges */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-[#008A38]" />
                  <span className="text-[10px] font-semibold text-gray-700">Orders over $500 ship free</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#008A38]" />
                  <span className="text-[10px] font-semibold text-gray-700">Warranty 2 years</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-4 h-4 text-[#008A38]" />
                  <span className="text-[10px] font-semibold text-gray-700">4K QC Video included</span>
                </div>
              </div>
            </div>

            {/* Specification Tabs (matching Framer site: Overall / Features / Case / Movement) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-gray-200">
                {[
                  { id: 'overall', label: 'Overall' },
                  { id: 'features', label: 'Features' },
                  { id: 'case', label: 'Case' },
                  { id: 'movement', label: 'Movement' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSpecTab(tab.id)}
                    className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                      activeSpecTab === tab.id
                        ? 'border-[#008A38] text-black font-extrabold'
                        : 'border-transparent text-gray-400 hover:text-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Tables */}
              <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 text-xs">
                {activeSpecTab === 'overall' && (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold w-1/3">Reference</td>
                        <td className="py-2 text-black font-mono font-bold">{ds.modelReference || product.modelCode || 'IW359201'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Dial Color</td>
                        <td className="py-2 text-black">{ds.dial || 'Blue Wave Laser Engraved Ceramic'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Case</td>
                        <td className="py-2 text-black">{ds.caseMaterial || product.material || 'Solid 904L Stainless Steel'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Strap</td>
                        <td className="py-2 text-black">{ds.bracelet || 'Blue Rubber Strap with quick-change system'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Diameter</td>
                        <td className="py-2 text-black font-mono">{product.caseSize || '42 mm'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Movement</td>
                        <td className="py-2 text-black font-mono">{ds.movement || product.movement || 'Automatic, self-winding'}</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeSpecTab === 'features' && (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold w-1/3">Bezel</td>
                        <td className="py-2 text-black">{ds.bezel || 'Unidirectional Rotatable Cerachrom Ceramic'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Crystal</td>
                        <td className="py-2 text-black">{product.crystal || 'Scratch-resistant sapphire with AR coating'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Water Resistance</td>
                        <td className="py-2 text-emerald-700 font-bold">{ds.waterResistance || product.waterResistance || '50m / 5 ATM Tested (300M Depth Look)'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Luminescence</td>
                        <td className="py-2 text-black">Super-LumiNova Dual Blue &amp; Green Emitting Glow</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeSpecTab === 'case' && (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold w-1/3">Dimensions</td>
                        <td className="py-2 text-black font-mono">{ds.caseDimensions || `${product.caseSize || '42 mm'} x 13.5 mm`}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Crown</td>
                        <td className="py-2 text-black">Screw-down crown with double waterproof seals</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Case Back</td>
                        <td className="py-2 text-black">Exhibition wave-edged sapphire crystal case back</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Helium Valve</td>
                        <td className="py-2 text-black">Conical escape valve at 10 o'clock position</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeSpecTab === 'movement' && (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold w-1/3">Calibre Engine</td>
                        <td className="py-2 text-black font-mono font-bold">{product.movement || ds.calibre || 'Custom Dandong Co-Axial Master Chronometer 8800'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Frequency</td>
                        <td className="py-2 text-black font-mono">28,800 vph (4 Hz) Smooth Sweep</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Power Reserve</td>
                        <td className="py-2 text-black font-mono">55 to 60 Hours Autonomy</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-semibold">Daily Deviation</td>
                        <td className="py-2 text-emerald-700 font-mono font-bold">-2 / +2 sec/day verified</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Collapsible Accordions (matching Framer site: Product Description / Shipping / Return) */}
            <div className="space-y-2 pt-2">
              {/* Product description */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm bg-white hover:bg-gray-50"
                >
                  <span>Product description</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'desc' ? 'rotate-180 text-[#008A38]' : 'text-gray-400'}`} />
                </button>
                {openAccordion === 'desc' && (
                  <div className="p-4 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50 space-y-3">
                    <p>
                      The <strong>{product.name}</strong> is a masterclass in refined luxury and precision engineering, faithfully recreating one of {product.brand}’s most iconic models. This 1:1 super clone is crafted for discerning individuals who seek the timeless elegance of a classic Swiss timepiece without compromising on performance or style.
                    </p>
                    <p>
                      At the heart of this timepiece lies the <strong>{product.movement || ds.calibre || 'Swiss automatic movement'}</strong>, renowned for its exceptional accuracy and durability with a 55–60 hour power reserve. The sweep motion second hand delivers continuous, silent rotation typical of genuine high-end horology.
                    </p>
                    {product.rawDescriptionHtml && (
                      <div className="pt-2 border-t border-gray-200/60">
                        <a
                          href="#full-editorial-specs"
                          className="text-xs font-bold text-[#008A38] hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Full Technical Teardown &amp; Specs Below</span>
                          <span>&darr;</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping accordion */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm bg-white hover:bg-gray-50"
                >
                  <span>Fast Worldwide Shipping with Tracking</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'shipping' ? 'rotate-180 text-[#008A38]' : 'text-gray-400'}`} />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="p-4 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50 space-y-2">
                    <p>
                      All timepieces undergo a strict 24-point Quality Control (QC) inspection. Prior to dispatch, our master watchmakers record a personalized <strong>4K high-definition video</strong> and <strong>Timegrapher rate test</strong> sent directly to your WhatsApp.
                    </p>
                    <p>
                      Express insured delivery takes <strong>3 to 7 business days worldwide</strong> via DHL Express / FedEx Priority with end-to-end discreet tracking.
                    </p>
                  </div>
                )}
              </div>

              {/* Return accordion */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'return' ? null : 'return')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm bg-white hover:bg-gray-50"
                >
                  <span>2 Years Manufacturer's Warranty &amp; Return</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'return' ? 'rotate-180 text-[#008A38]' : 'text-gray-400'}`} />
                </button>
                {openAccordion === 'return' && (
                  <div className="p-4 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50 space-y-2">
                    <p>
                      Every timepiece comes backed by our comprehensive <strong>2-Year International Warranty</strong> covering mechanical movement defects, timing regulation, and waterproof seal integrity.
                    </p>
                    <p>
                      We provide a <strong>14-day 1:1 replacement or money-back guarantee</strong> if the item does not match our pre-dispatch 4K QC video.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Auxiliary Concierge Actions Row (matching Framer site) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-gray-600 font-medium">
              <button
                onClick={() => sendQuickProductToWhatsApp(product, currentVariant.name, currentVariant.price)}
                className="p-2 border border-gray-200 rounded-lg hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#008A38]" />
                <span>Order by phone</span>
              </button>
              <button
                onClick={() => alert('Boutique Location: Ben Thanh Luxury Concierge Lounge, District 1, Ho Chi Minh City.')}
                className="p-2 border border-gray-200 rounded-lg hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Find in boutique</span>
              </button>
              <button
                onClick={() => sendQuickProductToWhatsApp(product, 'VIP Consultation', currentVariant.price)}
                className="p-2 border border-gray-200 rounded-lg hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Contact support</span>
              </button>
              <button
                onClick={handleShare}
                className="p-2 border border-gray-200 rounded-lg hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-gray-700" />
                <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FULL RESPONSIVE HOROLOGICAL SPECS & CALIBRE BENCHMARK ================= */}
      <div id="full-editorial-specs" className="border-t border-gray-100 bg-[#FBFBFA] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008A38]/10 text-[#008A38] text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deep Dive Horological Engineering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight">
              {showcase?.titleLine || `${product.brand} ${product.name}: Technical Breakdown`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2.5 leading-relaxed">
              {showcase?.tagline || `Comprehensive technical teardown and micro-engineering specifications for ${product.brand} • ${ds.modelReference || product.name}`}
            </p>
          </div>

          {/* 4 Technical Specifications Cards (Bezel, Crystal, Case, Bracelet) */}
          {/* Responsive Grid: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-14">
            {specCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs hover:border-[#008A38]/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#008A38] block mb-2">
                    {card.label}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-black mb-2 leading-snug">
                    {card.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 2-Column Responsive Layout: Calibre Teardown (Left) + Benchmark Data Sheet (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Calibre Mechanism Breakdown (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Calibre Architecture Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#008A38]" />
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs uppercase font-extrabold text-[#008A38] tracking-widest">
                    Mechanism Teardown
                  </span>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2">
                  {calibreInfo.headline}
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                  {calibreInfo.summary}
                </p>

                {/* Bullets */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {calibreInfo.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#008A38]/10 text-[#008A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-black">{bullet.title}: </span>
                        <span className="text-gray-600">{bullet.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Movement QC Video Teaser or Embed (if available) */}
              {(product.qcVideoVimeoId || product.qcVideoUrl) && (
                <div className="bg-black text-white rounded-2xl p-6 border border-white/10 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Live 4K Movement Inspection &amp; Timegrapher
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      28,800 VPH Benchmark
                    </span>
                  </div>

                  {product.qcVideoVimeoId ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                      <iframe
                        src={`https://player.vimeo.com/video/${product.qcVideoVimeoId}?autoplay=0&loop=1`}
                        title={product.name}
                        className="w-full h-full"
                        allow="fullscreen"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div>
                        <span className="text-xs font-bold text-white block">Video Timegrapher QC Available</span>
                        <span className="text-[11px] text-gray-400">Request raw 4K clip of this exact unit on WhatsApp</span>
                      </div>
                      <button
                        onClick={() => sendQuickProductToWhatsApp(product, 'Request 4K QC Video', currentVariant.price)}
                        className="px-3.5 py-2 bg-[#008A38] hover:bg-[#00742f] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>Request QC</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column: Full Technical Data Sheet (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                      Technical Data Sheet
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#008A38] bg-[#008A38]/10 px-2 py-0.5 rounded">
                    1:1 Verified
                  </span>
                </div>

                <div className="divide-y divide-gray-100 text-xs">
                  {fullDataSheet.map((item, dIdx) => (
                    <div
                      key={dIdx}
                      className={`flex items-center justify-between p-3.5 sm:px-5 transition-colors ${
                        item.highlight ? 'bg-[#008A38]/5' : dIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                      }`}
                    >
                      <span className="font-semibold text-gray-500 w-2/5 sm:w-1/3">
                        {item.label}
                      </span>
                      <span className={`w-3/5 sm:w-2/3 text-right font-mono text-xs ${
                        item.highlight ? 'font-bold text-[#008A38]' : 'text-black font-medium'
                      }`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality & Pre-Shipping Guarantee Box */}
              <div className="p-5 bg-[#008A38]/5 border border-[#008A38]/20 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#008A38] flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-black block mb-1">Our "No-Lemon" Pre-Shipment Promise</span>
                  <p className="text-gray-600 leading-relaxed">
                    Prior to dispatch, your timepiece is calibrated on digital Timegrapher machines. We provide free regulation, pressure testing, and personalized WhatsApp QC video before handing off to DHL Express.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ================= 4 PILLARS OF TRUST (matching Framer site) ================= */}
      <div className="bg-gray-50 border-y border-gray-100 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm flex flex-col items-center gap-2">
            <Award className="w-6 h-6 text-[#008A38]" />
            <h4 className="font-extrabold text-sm text-black">25+ Years in Industry</h4>
            <p className="text-[11px] text-gray-500">Unrivaled expertise in Swiss clone watchmaking</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#008A38]" />
            <h4 className="font-extrabold text-sm text-black">5 Years Warranty Option</h4>
            <p className="text-[11px] text-gray-500">Comprehensive movement service &amp; parts protection</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm flex flex-col items-center gap-2">
            <Truck className="w-6 h-6 text-[#008A38]" />
            <h4 className="font-extrabold text-sm text-black">FREE Shipping Over $500</h4>
            <p className="text-[11px] text-gray-500">Express delivery with discrete tracking</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm flex flex-col items-center gap-2">
            <Zap className="w-6 h-6 text-[#008A38]" />
            <h4 className="font-extrabold text-sm text-black">100% Secure Payment</h4>
            <p className="text-[11px] text-gray-500">Direct WhatsApp Concierge &amp; Escrow Available</p>
          </div>
        </div>
      </div>

      {/* ================= CLIENT TESTIMONIALS (matching Framer site "Our Clients") ================= */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold text-[#008A38] tracking-widest">
            Verified Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black mt-1">
            What Our Clients Say
          </h2>
          <p className="text-xs text-gray-500 mt-2">
            Real feedback from watch collectors and connoisseurs worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-xs text-gray-700 italic leading-relaxed">
                "My experience with Ben Thanh Luxury has been outstanding so far. Riley was quick to answer all questions, nothing but praise for him. The 4K QC video prior to shipping gave me total confidence!"
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200 mt-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-black block">Collin Bloch</span>
                <span className="text-[11px] text-gray-400">Restaurateur, Geneva</span>
              </div>
              <span className="text-[10px] font-mono text-[#008A38] font-bold">Rolex GMT-Master II</span>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-xs text-gray-700 italic leading-relaxed">
                "The Seamaster Diver 300M in Moonshine Gold exceeded all expectations. Laser ceramic dial waves, exact weight, and the Dandong 8800 movement runs within +1 sec/day on my timegrapher."
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200 mt-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-black block">Marcus Vance</span>
                <span className="text-[11px] text-gray-400">Architect, London</span>
              </div>
              <span className="text-[10px] font-mono text-[#008A38] font-bold">Omega Seamaster 300M</span>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-xs text-gray-700 italic leading-relaxed">
                "Third purchase from Ben Thanh. Customer service on WhatsApp is fast and polite. Express delivery reached Sydney in 4 days with customs clearance already handled."
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200 mt-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-black block">Alexander Wright</span>
                <span className="text-[11px] text-gray-400">Collector, Sydney</span>
              </div>
              <span className="text-[10px] font-mono text-[#008A38] font-bold">Patek Philippe 5711</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FAQ SECTION (matching Framer site "Questions check here") ================= */}
      <div className="bg-gray-50/80 border-t border-gray-100 py-16 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-extrabold text-[#008A38] tracking-widest">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How long does shipping take?',
                a: 'Standard priority shipping takes between 3 to 7 business days worldwide. After receiving your 4K Timegrapher QC approval, tracking is dispatched via DHL Express or FedEx Priority within 24 to 48 hours.'
              },
              {
                q: 'Does my piece come in any packaging?',
                a: 'Yes. Every timepiece arrives in an anti-magnetic, shockproof travel vault box with warranty card, serial tag, and 4K inspection verification certificate. High-end genuine gift presentation boxes are available upon request.'
              },
              {
                q: 'Do you ship internationally?',
                a: 'Yes, we provide worldwide insured door-to-door delivery across North America, Europe, Australia, and Asia. All packages are insured and pass customs smoothly through our private concierge logistics network.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept direct bank transfers, cryptocurrency (USDT / BTC / ETH for maximum privacy with a 5% discount), and credit cards via secure escrow on WhatsApp VIP Concierge.'
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white border border-gray-200 rounded-xl p-4 transition-all">
                <summary className="font-bold text-xs sm:text-sm text-black flex items-center justify-between cursor-pointer list-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 group-open:text-[#008A38] transition-transform" />
                </summary>
                <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* ================= RELATED WATCHES / KEEP BROWSING ================= */}
      {relatedWatches.length > 0 && (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase font-extrabold text-[#008A38] tracking-widest">
                More From {product.brand}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-black">
                Related Timepieces
              </h3>
            </div>
            <button
              onClick={() => {
                if (setSelectedBrand) setSelectedBrand(product.brand);
                onBackToHome();
                setTimeout(() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-xs font-bold text-[#008A38] hover:underline"
            >
              View Full Collection &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedWatches.map((w) => (
              <div
                key={w.id}
                onClick={() => navigateToProduct(w)}
                className="cursor-pointer"
              >
                <ProductCard watch={w} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
