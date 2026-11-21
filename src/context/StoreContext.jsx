import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import V4_SNAPSHOT from '../data/v4_catalog_snapshot.json';
import { CURRENCY_RATES } from '../data/watches';
import { downloadCsv } from '../services/googleSheetsService';
import {
  resolveMediaUrl,
  evaluatePublishGate,
  fetchSupabaseCatalog,
  fetchLatestImportBatch,
  updateSupabaseProduct,
  bulkUpdateSupabaseProducts,
  recordOrderInSupabase,
  getR2PublicBaseUrl,
  setR2PublicBaseUrl,
  isS3ApiEndpointInsteadOfPublicDev
} from '../services/supabaseService';
import {
  getStoreWhatsAppNumber,
  setStoreWhatsAppNumber,
  getWhatsAppTemplateConfig,
  setWhatsAppTemplateConfig,
  resetWhatsAppTemplateConfig,
  buildWhatsAppOrderMessage,
  buildWhatsAppQuickProductMessage,
  openWhatsAppChat,
  generateWhatsAppUrl
} from '../services/whatsappService';

const StoreContext = createContext();

export const CURRENT_CATALOG_VERSION = 'v4.0_supabase_r2_nicknames';

export const FIGMA_WATCH_IMAGES = [
  '/figma-assets/watches/watch-0.png',
  '/figma-assets/watches/watch-1.png',
  '/figma-assets/watches/watch-2.png',
  '/figma-assets/watches/watch-3.png',
  '/figma-assets/watches/watch-4.png',
  '/figma-assets/watches/watch-5.png',
  '/figma-assets/watches/watch-6.png',
  '/figma-assets/watches/watch-7.png',
  '/figma-assets/watches/watch-8.png',
  '/figma-assets/watches/watch-9.png',
  '/figma-assets/watches/watch-10.png',
  '/figma-assets/watches/watch-11.png',
  '/figma-assets/watches/watch-12.png',
  '/figma-assets/watches/watch-13.png',
  '/figma-assets/watches/watch-14.png',
  '/figma-assets/watches/watch-15.png',
  '/figma-assets/watches/watch-16.png'
];

export function getFigmaWatchImageByIndex(index) {
  const safeIdx = Math.abs(Number(index) || 0) % 17;
  if (typeof window !== 'undefined' && Array.isArray(window.__FIGMA_WATCH_IMAGES__) && window.__FIGMA_WATCH_IMAGES__[safeIdx]) {
    return window.__FIGMA_WATCH_IMAGES__[safeIdx];
  }
  return FIGMA_WATCH_IMAGES[safeIdx];
}

export function getFigmaWatchThumbnail(p) {
  if (!p) return getFigmaWatchImageByIndex(0);
  const name = (p.name || p.title || '').toLowerCase();
  const brand = (p.brand || '').toLowerCase();

  // 1. Omega Models
  if (brand.includes('omega') || name.includes('omega')) {
    if (name.includes('constellation')) return getFigmaWatchImageByIndex(1);
    if (name.includes('speedmaster') || name.includes('moonwatch') || name.includes('chronometer')) return getFigmaWatchImageByIndex(5);
    return getFigmaWatchImageByIndex(0);
  }

  // 2. Rolex Specific Models
  if (name.includes('bruce wayne') || name.includes('grnr')) return getFigmaWatchImageByIndex(4);
  if (name.includes('batman') || name.includes('blnr')) return getFigmaWatchImageByIndex(8);
  if (name.includes('pepsi') || name.includes('blro')) return getFigmaWatchImageByIndex(4);
  if (name.includes('root beer') || name.includes('chnr')) return getFigmaWatchImageByIndex(8);
  if (name.includes('gmt master') || name.includes('gmt-master')) return getFigmaWatchImageByIndex(11);
  if (name.includes('submariner') || name.includes('hulk') || name.includes('kermit')) return getFigmaWatchImageByIndex(6);
  if (name.includes('green') || name.includes('oyster perpetual') || name.includes('datejust')) return getFigmaWatchImageByIndex(2);
  if (name.includes('day date') || name.includes('rose gold') || name.includes('gold')) return getFigmaWatchImageByIndex(11);
  if (name.includes('panda')) return getFigmaWatchImageByIndex(16);
  if (name.includes('ghost') || name.includes('grey') || name.includes('gray')) return getFigmaWatchImageByIndex(10);
  if (name.includes('rainbow') || name.includes('gem')) return getFigmaWatchImageByIndex(9);
  if (name.includes('carbon') || name.includes('diw')) return getFigmaWatchImageByIndex(7);
  if (name.includes('oysterflex') || name.includes('rubber')) return getFigmaWatchImageByIndex(3);
  if (name.includes('paul newman')) return getFigmaWatchImageByIndex(14);
  if (name.includes('two-tone') || name.includes('two tone') || name.includes('bicolor')) return getFigmaWatchImageByIndex(15);
  if (name.includes('daytona')) return getFigmaWatchImageByIndex(13);

  const seed = (p.product_id || p.id || p.title || p.name || 'watch').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return getFigmaWatchImageByIndex(seed);
}

/**
 * Normalizes a V4 or Legacy CMS record into the unified shape consumed by both Storefront and Admin CMS.
 * - Preserves BR-01 (product_id as primary identity), BR-03 (gallery sorted by position, position 1 = hero_image),
 *   BR-04 (video posters excluded from product gallery count), BR-08 (nickname descriptive label),
 *   BR-12 (strips any Unsplash placeholder URLs).
 */
export function normalizeWatch(p) {
  if (!p) return null;

  const productId = p.product_id || p.id || `P${Math.floor(100000 + Math.random() * 900000)}`;
  const figmaFallback = getFigmaWatchThumbnail(p);

  // Extract structured V4 gallery or array of URLs
  const structuredGallery = Array.isArray(p.product_images) && p.product_images.length > 0
    ? [...p.product_images].sort((a, b) => (Number(a.position) || 1) - (Number(b.position) || 1))
    : (Array.isArray(p.gallery) && p.gallery.length > 0
      ? [...p.gallery].sort((a, b) => (Number(a.position) || 1) - (Number(b.position) || 1))
      : []);

  const isPlaceholder = (url) => {
    if (!url || typeof url !== 'string') return true;
    if (url.includes('images.unsplash.com')) return true;
    if (url.includes('932e9558f0dc5') || url.includes('1f65403e05')) return true;
    if (url.includes('819e9bbafa326f2613358e0363f1a65638564f6d0ff9246c7f8874043a1e936d')) return true;
    return false;
  };

  const galleryPaths = structuredGallery.length > 0
    ? structuredGallery.map((g) => g.src).filter(Boolean)
    : (Array.isArray(p.images) && p.images.length > 0
      ? p.images.filter((u) => !isPlaceholder(u))
      : (typeof p.galleryImages === 'string' && p.galleryImages
        ? p.galleryImages.split(',').map((s) => s.trim()).filter((u) => !isPlaceholder(u))
        : []));

  const heroRelPath = p.hero_image || galleryPaths[0] || '';
  const resolvedGallery = galleryPaths.length > 0
    ? galleryPaths.map((src) => resolveMediaUrl(src, figmaFallback))
    : [resolveMediaUrl(heroRelPath, figmaFallback)];

  const primaryImage = resolveMediaUrl(heroRelPath, resolvedGallery[0] || figmaFallback);

  // Structured V4 Videos (BR-04: posters separate from product images)
  const rawVideos = Array.isArray(p.product_videos) && p.product_videos.length > 0
    ? p.product_videos
    : (Array.isArray(p.videos) ? p.videos : []);

  const videos = rawVideos.map((v) => ({
    video_id: v.video_id,
    src: v.src,
    poster: v.poster,
    url: resolveMediaUrl(v.src, ''),
    posterUrl: resolveMediaUrl(v.poster, primaryImage),
    width: v.width,
    height: v.height,
    duration: v.duration
  }));

  const rawV1 = p.variant1_price ?? p.variant1Price ?? p.priceUSD;
  const rawV2 = p.variant2_price ?? p.variant2Price;
  const hasValidPrice = rawV1 !== null && rawV1 !== undefined && Number(rawV1) > 0;
  const v1Price = hasValidPrice ? Number(rawV1) : 0;
  const v2Price = rawV2 !== null && rawV2 !== undefined && Number(rawV2) > 0
    ? Number(rawV2)
    : (hasValidPrice ? Math.round(v1Price * 1.45) : 0);

  const priceStatus = p.price_status || p.priceStatus || (hasValidPrice ? 'auto_matched' : 'missing');
  const priceSource = p.price_source || p.priceSource || (hasValidPrice ? 'cms_legacy' : null);
  const publicationStatus = (p.publication_status || p.publicationStatus || (p.status === 'ACTIVE' ? 'published' : 'unpublished')).toLowerCase();
  const isLegacy = Boolean(p.legacy);
  const imageCount = Number(p.image_count ?? (structuredGallery.length || galleryPaths.length || 0));
  const videoCount = Number(p.video_count ?? videos.length);
  const ds = p.data_sheet || p.dataSheet || {};

  const record = {
    ...p,
    id: productId,
    product_id: productId,
    family_id: p.family_id || null,
    spu: p.spu || p.modelCode || productId,
    modelCode: p.reference || p.spu || productId,
    brand: p.brand !== undefined && p.brand !== null ? String(p.brand).trim() : '',
    collection: p.collection || '',
    model: p.model || '',
    reference: p.reference || ds.modelReference || '',
    title: p.title || p.name || productId,
    name: p.title || p.name || productId,
    nickname: p.nickname || null,
    dial_color: p.dial_color || p.dial || null,
    case_finish: p.case_finish || null,
    bracelet_or_strap: p.bracelet_or_strap || ds.bracelet || null,
    size_mm: p.size_mm || p.caseSize || null,
    caseSize: p.size_mm ? `${String(p.size_mm).replace(/mm$/i, '')}mm` : (p.caseSize || '40mm'),
    case_material: p.case_material || p.material || ds.caseMaterial || null,
    material: p.case_material || p.material || ds.caseMaterial || 'Solid 904L Stainless Steel',
    media_readiness: p.media_readiness || 'web_ready',
    export_status: p.export_status || 'export_ready',
    publication_status: publicationStatus,
    status: publicationStatus === 'published' ? 'ACTIVE' : 'DRAFT',
    hero_image: heroRelPath,
    primaryImage,
    gallery: structuredGallery.map((g) => ({
      ...g,
      resolvedUrl: resolveMediaUrl(g.src, figmaFallback)
    })),
    galleryImages: resolvedGallery,
    images: resolvedGallery,
    image_count: imageCount,
    videos,
    video_count: videoCount,
    factory: p.factory || ds.factoryVersion || 'VS / CLEAN FACTORY',
    variant1Name: p.variant1_name || p.variant1Name || 'Swiss Movement',
    variant1Price: v1Price,
    variant1_price: hasValidPrice ? v1Price : null,
    variant2Name: p.variant2_name || p.variant2Name || 'VS / Clean 1:1 Super Clone',
    variant2Price: v2Price,
    variant2_price: v2Price > 0 ? v2Price : null,
    priceUSD: v1Price || 700,
    originalPriceUSD: Number(p.originalPriceUSD || Math.round((v2Price || 1199) * 1.15)),
    price_status: priceStatus,
    price_source: priceSource,
    match_confidence: p.match_confidence ?? null,
    match_notes: p.match_notes || null,
    legacy_cms_id: p.legacy_cms_id || null,
    legacy: isLegacy,
    stock: (p.stock || 'IN_STOCK').toUpperCase(),
    movement: p.movement || ds.movement || 'Custom Super Clone Calibre',
    bezel: p.bezel || ds.bezel || 'Precision Ceramic / Brushed Bezel',
    crystal: p.crystal || 'Scratch-Resistant Sapphire with AR Coating',
    waterResistance: p.water_resistance || p.waterResistance || ds.waterResistance || '50m / 5 ATM Waterproof Tested',
    description: p.description || p.description_html || '',
    rawDescriptionHtml: p.description_html || p.rawDescriptionHtml || p.description || '',
    dataSheet: ds,
    data_sheet: ds,
    qcVideoVimeoId: p.qcVideoVimeoId || null,
    qcVideoUrl: videos[0]?.url || p.qc_video_url || p.qcVideoUrl || null,
    rating: p.rating || 4.9,
    reviewsCount: p.reviewsCount || 48,
    badge: p.nickname ? `"${p.nickname}"` : (p.badge || (v2Price > 1000 ? 'BEST SELLER' : 'V4 VERIFIED'))
  };

  const gate = evaluatePublishGate(record);
  record.canPublish = gate.canPublish;
  record.publishBlockReasons = gate.reasons;
  return record;
}

export function getProductSlug(watch) {
  if (!watch) return '';
  if (watch.slug) return watch.slug;
  const pid = (watch.product_id || watch.id || '').toLowerCase();
  const name = String(watch.name || watch.title || '').toLowerCase();
  const baseSlug = name
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (pid && /^p\d{6}$/i.test(pid)) {
    return baseSlug ? `${pid}-${baseSlug}` : pid;
  }
  return baseSlug || pid || 'watch';
}

function buildInitialV4Catalog() {
  // By default V4 products start unpublished (BR-05).
  // For initial storefront experience when no products have been published yet,
  // we keep track of publication_status accurately while exposing a storefront subset.
  return (V4_SNAPSHOT || []).map(normalizeWatch).filter(Boolean);
}

export function StoreProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('cw_currency') || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('cw_currency', currency);
  }, [currency]);

  const [r2PublicUrl, setR2PublicUrlState] = useState(() => getR2PublicBaseUrl());

  // All products state (Admin sees all 773 V4 + legacy if loaded; Storefront filters published or previewable V4)
  const [allProducts, setAllProducts] = useState(() => {
    try {
      const storedVersion = localStorage.getItem('cw_catalog_version');
      const overridesRaw = localStorage.getItem('cw_v4_product_overrides');
      const base = buildInitialV4Catalog();

      if (storedVersion === CURRENT_CATALOG_VERSION && overridesRaw) {
        const overrides = JSON.parse(overridesRaw);
        return base.map((item) => {
          const patch = overrides[item.product_id];
          return patch ? normalizeWatch({ ...item, ...patch }) : item;
        });
      }
      localStorage.setItem('cw_catalog_version', CURRENT_CATALOG_VERSION);
      localStorage.removeItem('cw_products_catalog'); // clean old 12.9MB legacy cache
      return base;
    } catch {
      return buildInitialV4Catalog();
    }
  });

  // Save lightweight overrides (price, publication_status, brand edits) locally as instant cache alongside Supabase
  const saveLocalOverride = (productId, patch) => {
    try {
      const raw = localStorage.getItem('cw_v4_product_overrides');
      const map = raw ? JSON.parse(raw) : {};
      map[productId] = { ...(map[productId] || {}), ...patch };
      localStorage.setItem('cw_v4_product_overrides', JSON.stringify(map));
    } catch {
      // ignore localStorage quota/access warning
    }
  };

  // Supabase + R2 Sync State (replaces Google Sheets per D1-D4)
  const [syncStatus, setSyncStatus] = useState('IDLE'); // 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR' | 'LOCAL_SNAPSHOT'
  const [syncError, setSyncError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem('cw_last_sync_time') || null;
  });
  const [importBatchReport, setImportBatchReport] = useState(null);

  const syncWithSupabase = async ({ includeUnpublished = true } = {}) => {
    setSyncStatus('SYNCING');
    setSyncError(null);
    try {
      const rows = await fetchSupabaseCatalog({ includeUnpublished });
      if (Array.isArray(rows) && rows.length > 0) {
        const normalized = rows.map(normalizeWatch).filter(Boolean);
        setAllProducts(normalized);
        const now = new Date().toLocaleTimeString();
        setLastSyncTime(now);
        setSyncStatus('SUCCESS');
        localStorage.setItem('cw_last_sync_time', now);
      } else {
        // Supabase reachable, table empty or 0 rows returned (e.g. all unpublished for anon)
        setSyncStatus('LOCAL_SNAPSHOT');
      }
      const batch = await fetchLatestImportBatch();
      if (batch) setImportBatchReport(batch);
    } catch (err) {
      setSyncStatus('LOCAL_SNAPSHOT');
      setSyncError(err.message);
    }
  };

  useEffect(() => {
    syncWithSupabase({ includeUnpublished: true });
  }, []);

  const updateR2PublicUrl = (newUrl) => {
    setR2PublicBaseUrl(newUrl);
    setR2PublicUrlState(getR2PublicBaseUrl());
    setAllProducts((prev) => prev.map((p) => normalizeWatch(p)));
  };

  // Storefront visible products:
  // Strictly excludes legacy=true (BR-11).
  // Shows published products; if 0 products are published yet (initial V4 state before Admin publishes first batch),
  // shows V4 export_ready products that have valid brand and auto_matched/confirmed price so Storefront is never blank.
  const storefrontProducts = useMemo(() => {
    const nonLegacy = allProducts.filter((p) => !p.legacy && p.brand);
    const explicitlyPublished = nonLegacy.filter((p) => p.publication_status === 'published');
    return explicitlyPublished.length > 0 ? explicitlyPublished : nonLegacy;
  }, [allProducts]);

  const resetToMasterCatalog = () => {
    localStorage.removeItem('cw_v4_product_overrides');
    localStorage.setItem('cw_catalog_version', CURRENT_CATALOG_VERSION);
    const fresh = buildInitialV4Catalog();
    setAllProducts(fresh);
    return fresh.length;
  };

  // Modals & Navigation
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAntiScamOpen, setIsAntiScamOpen] = useState(false);
  const isDirectAdminUrl = () => {
    if (typeof window === 'undefined') return false;
    const path = (window.location.pathname || '').replace(/\/+$/, '').toLowerCase();
    const hash = (window.location.hash || '').replace(/\/+$/, '').toLowerCase();
    return path === '/admin' || hash === '#/admin' || hash === '#admin';
  };

  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (import.meta.env.VITE_PROTOTYPE_MODE === 'true') return false;
    return isDirectAdminUrl();
  });

  // Direct link routing for /admin and #/admin
  useEffect(() => {
    if (import.meta.env.VITE_PROTOTYPE_MODE === 'true') return;
    const checkAdminUrl = () => {
      if (isDirectAdminUrl()) {
        setIsAdminOpen(true);
      }
    };
    checkAdminUrl();
    window.addEventListener('hashchange', checkAdminUrl);
    window.addEventListener('popstate', checkAdminUrl);
    return () => {
      window.removeEventListener('hashchange', checkAdminUrl);
      window.removeEventListener('popstate', checkAdminUrl);
    };
  }, []);

  const parseCurrentUrl = () => {
    try {
      const path = window.location.pathname || '';
      const hash = window.location.hash || '';

      const pathMatch = path.match(/\/index-all-brands\/([a-zA-Z0-9-_]+)/i);
      if (pathMatch) return { page: 'product', slug: pathMatch[1] };

      const hashMatch = hash.match(/index-all-brands\/([a-zA-Z0-9-_]+)/i);
      if (hashMatch) return { page: 'product', slug: hashMatch[1] };

      if (path === '/brands' || path.startsWith('/brands/') || path === '/index-all-brands' || path === '/index-all-brands/') {
        return { page: 'brands', brand: 'All' };
      }
      if (hash === '#/brands' || hash.startsWith('#/brands') || hash === '#brands') {
        return { page: 'brands', brand: 'All' };
      }
    } catch {
      // ignore URL parsing error
    }
    return { page: 'home', slug: null };
  };

  const [route, setRoute] = useState(parseCurrentUrl);

  const findProductBySlug = (slug) => {
    if (!slug) return null;
    const clean = String(slug).toLowerCase().trim();

    let found = allProducts.find(
      (p) =>
        getProductSlug(p) === clean ||
        (p.product_id && p.product_id.toLowerCase() === clean) ||
        (p.id && p.id.toLowerCase() === clean)
    );
    if (found) return found;

    found = allProducts.find((p) => {
      const pSlug = getProductSlug(p);
      return pSlug.includes(clean) || clean.includes(pSlug);
    });
    if (found) return found;

    return storefrontProducts[0] || allProducts[0];
  };

  const navigateToProduct = (watchOrSlug) => {
    let slug = '';
    let targetProduct = null;
    if (typeof watchOrSlug === 'string') {
      slug = watchOrSlug;
      targetProduct = findProductBySlug(slug);
    } else if (watchOrSlug) {
      slug = getProductSlug(watchOrSlug);
      targetProduct = watchOrSlug;
    }
    if (!slug) return;

    setRoute({ page: 'product', slug });
    setDetailProduct(targetProduct);
    setQuickViewProduct(null);

    try {
      if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        window.location.hash = `#/index-all-brands/${slug}`;
      } else {
        window.history.pushState(null, '', `/index-all-brands/${slug}`);
      }
    } catch {
      window.location.hash = `#/index-all-brands/${slug}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBrands = (brand = 'All') => {
    if (brand && brand !== 'All') {
      setSelectedBrand(brand);
    }
    setRoute({ page: 'brands', brand: brand || 'All' });
    setDetailProduct(null);
    setQuickViewProduct(null);
    try {
      if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        window.location.hash = '#/brands';
      } else {
        window.history.pushState(null, '', '/brands');
      }
    } catch {
      window.location.hash = '#/brands';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setRoute({ page: 'home', slug: null });
    setDetailProduct(null);
    try {
      if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        window.location.hash = '';
      } else {
        window.history.pushState(null, '', '/');
      }
    } catch {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const parsed = parseCurrentUrl();
      setRoute(parsed);
      if (parsed.page === 'product' && parsed.slug) {
        setDetailProduct(findProductBySlug(parsed.slug));
      } else {
        setDetailProduct(null);
      }
      if (parsed.page === 'brands' && parsed.brand) {
        setSelectedBrand(parsed.brand);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    if (route.page === 'product' && route.slug && !detailProduct) {
      setDetailProduct(findProductBySlug(route.slug));
    }

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [allProducts]);

  // Cart state
  const [cart, setCart] = useState(() => {
    const initialWatch = storefrontProducts[0] || allProducts[0];
    try {
      const saved = localStorage.getItem('cw_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialWatch
      ? [
          {
            product: initialWatch,
            variantName: 'VS / Clean 1:1 Super Clone',
            priceUSD: initialWatch.variant2Price || 1199,
            quantity: 1
          }
        ]
      : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('cw_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState({
    code: 'SUPERCLONE10',
    discountPercent: 10,
    label: 'VIP 10% Welcome Discount'
  });
  const [couponError, setCouponError] = useState('');

  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('cw_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (priceUSD) => {
    const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
    const converted = Number(priceUSD || 0) * rateInfo.rate;
    return `${rateInfo.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const getRawConverted = (priceUSD) => {
    const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
    return Number(priceUSD || 0) * rateInfo.rate;
  };

  const addToCart = (product, quantity = 1, variantSelection = null) => {
    const selectedVariantName = variantSelection?.name || product.variant1Name || 'Swiss Movement';
    const selectedPrice = Number(variantSelection?.price || product.variant1Price || product.priceUSD || 700);

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.variantName === selectedVariantName
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.variantName === selectedVariantName
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          variantName: selectedVariantName,
          priceUSD: selectedPrice,
          quantity
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, variantName) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && (!variantName || item.variantName === variantName))));
  };

  const updateQuantity = (productId, variantName, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && (!variantName || item.variantName === variantName)) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Update a single product (Admin CRUD -> Local state + Supabase Postgres)
  const updateProduct = async (productId, updatedFields) => {
    const dbPatch = {};
    if ('brand' in updatedFields) dbPatch.brand = updatedFields.brand;
    if ('collection' in updatedFields) dbPatch.collection = updatedFields.collection;
    if ('name' in updatedFields || 'title' in updatedFields) dbPatch.title = updatedFields.title || updatedFields.name;
    if ('nickname' in updatedFields) dbPatch.nickname = updatedFields.nickname || null;
    if ('variant1Price' in updatedFields || 'variant1_price' in updatedFields) {
      dbPatch.variant1_price = Number(updatedFields.variant1Price ?? updatedFields.variant1_price) || null;
    }
    if ('variant2Price' in updatedFields || 'variant2_price' in updatedFields) {
      dbPatch.variant2_price = Number(updatedFields.variant2Price ?? updatedFields.variant2_price) || null;
    }
    if ('price_status' in updatedFields) dbPatch.price_status = updatedFields.price_status;
    if ('price_source' in updatedFields) dbPatch.price_source = updatedFields.price_source;
    if ('publication_status' in updatedFields) dbPatch.publication_status = updatedFields.publication_status;
    if ('stock' in updatedFields) dbPatch.stock = updatedFields.stock;
    if ('movement' in updatedFields) dbPatch.movement = updatedFields.movement;
    if ('caseSize' in updatedFields || 'size_mm' in updatedFields) dbPatch.size_mm = updatedFields.size_mm || updatedFields.caseSize;
    if ('material' in updatedFields || 'case_material' in updatedFields) dbPatch.case_material = updatedFields.case_material || updatedFields.material;
    if ('waterResistance' in updatedFields) dbPatch.water_resistance = updatedFields.waterResistance;
    if ('description' in updatedFields) dbPatch.description_html = updatedFields.description;

    saveLocalOverride(productId, { ...updatedFields, ...dbPatch });

    setAllProducts((prev) =>
      prev.map((p) => (p.id === productId || p.product_id === productId ? normalizeWatch({ ...p, ...updatedFields, ...dbPatch }) : p))
    );

    return updateSupabaseProduct(productId, dbPatch);
  };

  // Bulk update helper for Admin (approve price or publish in batch)
  const bulkUpdateProducts = async (productIds, patch) => {
    const idSet = new Set(productIds);
    productIds.forEach((id) => saveLocalOverride(id, patch));
    setAllProducts((prev) =>
      prev.map((p) => (idSet.has(p.id) || idSet.has(p.product_id) ? normalizeWatch({ ...p, ...patch }) : p))
    );
    return bulkUpdateSupabaseProducts(productIds, patch);
  };

  const addProduct = (newProductData) => {
    const normalized = normalizeWatch({
      ...newProductData,
      price_status: 'confirmed',
      price_source: 'admin'
    });
    saveLocalOverride(normalized.product_id, normalized);
    setAllProducts((prev) => [normalized, ...prev]);
    return normalized;
  };

  const deleteProduct = (productId) => {
    setAllProducts((prev) => prev.filter((p) => p.id !== productId && p.product_id !== productId));
  };

  const exportCatalog = () => {
    downloadCsv(allProducts, `clonewatches_v4_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const importCatalogFromCsv = (csvText) => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return 0;

    const newItems = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (!row || row.length < 4) continue;
      const clean = (s) => (s ? s.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '');
      const getNum = (s, def) => {
        const n = parseFloat(clean(s).replace(/[^0-9.]/g, ''));
        return isNaN(n) ? def : n;
      };

      const name = clean(row[3]);
      if (!name) continue;

      newItems.push(
        normalizeWatch({
          product_id: clean(row[0]) || `P90${String(i).padStart(4, '0')}`,
          brand: clean(row[1]) || 'Rolex',
          collection: clean(row[2]) || 'Signature Collection',
          title: name,
          variant1Name: clean(row[4]) || 'Swiss Movement',
          variant1_price: getNum(row[5], 700),
          variant2Name: clean(row[6]) || 'VS / Clean 1:1 Super Clone',
          variant2_price: getNum(row[7], 1199),
          price_status: 'confirmed',
          price_source: 'admin',
          hero_image: clean(row[8]) || '',
          images: clean(row[9]).split(',').map((s) => s.trim()).filter(Boolean),
          movement: clean(row[10]) || 'Swiss Dandong Calibre',
          size_mm: clean(row[11]) || '41mm',
          case_material: clean(row[12]) || 'Solid 904L Oystersteel',
          water_resistance: clean(row[13]) || '50m / 5 ATM Tested',
          description_html: clean(row[14]) || '',
          publication_status: clean(row[15]).toLowerCase() === 'published' ? 'published' : 'unpublished',
          stock: clean(row[16]) || 'IN_STOCK'
        })
      );
    }

    if (newItems.length > 0) {
      setAllProducts(newItems.filter(Boolean));
      return newItems.length;
    }
    return 0;
  };

  const cartSubtotalUSD = cart.reduce(
    (sum, item) => sum + (item.priceUSD || item.product.priceUSD || item.product.variant1Price || 700) * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingThreshold = 500;
  const freeShippingUnlocked = cartSubtotalUSD >= freeShippingThreshold;
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotalUSD / freeShippingThreshold) * 100));

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SUPERCLONE10' || clean === 'VSF10' || clean === 'VIP10') {
      setAppliedCoupon({
        code: clean,
        discountPercent: 10,
        label: '10% Super Clone VIP Discount'
      });
      setCouponError('');
      return true;
    } else {
      setCouponError('Invalid coupon code. Try SUPERCLONE10');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const placeOrder = (orderData) => {
    const newOrder = {
      orderId: `CW-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleString(),
      ...orderData,
      trackingNumber: `DHL-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'received'
    };
    setLastOrder(newOrder);
    localStorage.setItem('cw_last_order', JSON.stringify(newOrder));
    recordOrderInSupabase({
      ...newOrder,
      currency,
      items: orderData.items || cart
    });
    clearCart();
    return newOrder;
  };

  const [whatsappNumber, setWhatsappNumberState] = useState(() => getStoreWhatsAppNumber());
  const [whatsappTemplateConfig, setWhatsappTemplateConfigState] = useState(() => getWhatsAppTemplateConfig());

  const updateWhatsappNumber = (newNumber) => {
    setStoreWhatsAppNumber(newNumber);
    setWhatsappNumberState(getStoreWhatsAppNumber());
  };

  const updateWhatsappTemplateConfig = (partialConfig) => {
    const updated = setWhatsAppTemplateConfig(partialConfig);
    setWhatsappTemplateConfigState(updated);
    return updated;
  };

  const resetWhatsappTemplate = () => {
    const defaults = resetWhatsAppTemplateConfig();
    setWhatsappTemplateConfigState(defaults);
    return defaults;
  };

  const getWhatsAppContactUrl = (customMessage = '') => {
    return generateWhatsAppUrl(customMessage, whatsappNumber);
  };

  const sendOrderToWhatsApp = (orderData) => {
    const customMsg = (orderData?.customMessage || '').trim();
    const message =
      customMsg ||
      buildWhatsAppOrderMessage({
        orderId: orderData.orderId,
        customer: orderData.customer,
        items: orderData.items || cart,
        totalFormatted: orderData.totalFormatted || formatPrice(orderData.totalUSD),
        totalUSD: orderData.totalUSD,
        notes: orderData.notes,
        coupon: orderData.coupon || appliedCoupon,
        shippingFee: orderData.shippingFee ?? (freeShippingUnlocked ? 0 : 35),
        templateConfig: whatsappTemplateConfig
      });
    return openWhatsAppChat(message, whatsappNumber);
  };

  const sendQuickProductToWhatsApp = (
    watchOrOptions,
    variantNameArg,
    variantPriceArg,
    quantityArg = 1,
    customMessageArg = ''
  ) => {
    let watch = null;
    let variantName = 'VS / Clean 1:1 Super Clone';
    let variantPrice = 1199;
    let quantity = 1;
    let customer = {};
    let notes = '';
    let customMessage = '';

    if (
      watchOrOptions &&
      typeof watchOrOptions === 'object' &&
      ('watch' in watchOrOptions || 'customer' in watchOrOptions || 'customMessage' in watchOrOptions)
    ) {
      watch = watchOrOptions.watch;
      variantName = watchOrOptions.variantName || watch?.variant2Name || 'VS / Clean 1:1 Super Clone';
      variantPrice = Number(watchOrOptions.variantPrice || watch?.variant2Price || watch?.priceUSD || 1199);
      quantity = Number(watchOrOptions.quantity || 1);
      customer = watchOrOptions.customer || {};
      notes = watchOrOptions.notes || '';
      customMessage = (watchOrOptions.customMessage || '').trim();
    } else {
      watch = watchOrOptions;
      variantName = variantNameArg || watch?.variant2Name || 'VS / Clean 1:1 Super Clone';
      variantPrice = Number(variantPriceArg || watch?.variant2Price || watch?.priceUSD || 1199);
      quantity = Number(quantityArg || 1);
      customMessage = (customMessageArg || '').trim();
    }

    if (!watch && !customMessage) return '';

    // 1-Click Direct Push: Immediately push watch details (or user-adjusted custom message) to Owner's WhatsApp
    const message =
      customMessage ||
      buildWhatsAppQuickProductMessage({
        watch,
        variantName,
        variantPrice,
        quantity,
        customer,
        notes,
        templateConfig: whatsappTemplateConfig
      });
    return openWhatsAppChat(message, whatsappNumber);
  };

  return (
    <StoreContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        getRawConverted,
        products: storefrontProducts,
        adminProducts: allProducts,
        setProducts: setAllProducts,
        watches: storefrontProducts,
        r2PublicUrl,
        updateR2PublicUrl,
        isS3EndpointWarning: isS3ApiEndpointInsteadOfPublicDev(r2PublicUrl),
        syncStatus,
        syncError,
        lastSyncTime,
        importBatchReport,
        syncWithSupabase,
        updateProduct,
        bulkUpdateProducts,
        addProduct,
        deleteProduct,
        exportCatalog,
        importCatalogFromCsv,
        resetToMasterCatalog,
        evaluatePublishGate,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotalUSD,
        freeShippingThreshold,
        freeShippingUnlocked,
        freeShippingProgress,
        couponCode,
        setCouponCode,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        couponError,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        setQuickViewWatch: setQuickViewProduct,
        detailProduct,
        setDetailProduct,
        route,
        setRoute,
        navigateToProduct,
        navigateToBrands,
        navigateToHome,
        getProductSlug,
        findProductBySlug,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        isAntiScamOpen,
        setIsAntiScamOpen,
        isAdminOpen,
        setIsAdminOpen,
        lastOrder,
        placeOrder,
        selectedBrand,
        setSelectedBrand,
        searchQuery,
        setSearchQuery,
        whatsappNumber,
        updateWhatsappNumber,
        whatsappTemplateConfig,
        updateWhatsappTemplateConfig,
        resetWhatsappTemplate,
        getWhatsAppContactUrl,
        sendOrderToWhatsApp,
        sendQuickProductToWhatsApp
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
