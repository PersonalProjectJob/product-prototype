import React, { createContext, useContext, useState, useEffect } from 'react';
import CRAWLED_WATCHES from '../data/crawled_watches.json';
import { CURRENCY_RATES } from '../data/watches';
import { fetchGoogleSheetData, downloadCsv } from '../services/googleSheetsService';
import {
  getStoreWhatsAppNumber,
  setStoreWhatsAppNumber,
  buildWhatsAppOrderMessage,
  buildWhatsAppQuickProductMessage,
  openWhatsAppChat,
  generateWhatsAppUrl
} from '../services/whatsappService';

const StoreContext = createContext();

export const CURRENT_CATALOG_VERSION = 'v2.6_figma_standalone_inlined_thumbnails';

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
  const name = (p.name || '').toLowerCase();
  const brand = (p.brand || '').toLowerCase();

  // 1. Omega Models
  if (brand.includes('omega') || name.includes('omega')) {
    if (name.includes('constellation')) return getFigmaWatchImageByIndex(1);
    if (name.includes('speedmaster') || name.includes('moonwatch') || name.includes('chronometer')) return getFigmaWatchImageByIndex(5);
    return getFigmaWatchImageByIndex(0); // Omega De Ville
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

  // 3. Deterministic hash across 17 Figma watch assets
  const seed = (p.id || p.name || 'watch').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return getFigmaWatchImageByIndex(seed);
}

export function normalizeWatch(p) {
  if (!p) return null;
  const rawGallery = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : (Array.isArray(p.galleryImages) && p.galleryImages.length > 0
      ? p.galleryImages
      : (typeof p.galleryImages === 'string' && p.galleryImages
        ? p.galleryImages.split(',').map(s => s.trim()).filter(Boolean)
        : [p.primaryImage].filter(Boolean)));

  const isLogoOrPlaceholder = (url) => {
    if (!url || typeof url !== 'string') return true;
    if (url.includes('932e9558f0dc5') || url.includes('1f65403e05')) return true;
    if (url.includes('images.unsplash.com')) return true;
    if (url.includes('819e9bbafa326f2613358e0363f1a65638564f6d0ff9246c7f8874043a1e936d')) return true;
    return false;
  };

  const figmaThumbnail = getFigmaWatchThumbnail(p);
  const cleanGallery = rawGallery.filter(img => !isLogoOrPlaceholder(img));

  // Authentic Figma watch thumbnail always placed first as primary luxury studio photo
  const gallery = cleanGallery.length > 0
    ? [figmaThumbnail, ...cleanGallery]
    : [figmaThumbnail];
  const primaryImage = figmaThumbnail;

  const v1Price = Number(p.variant1Price || p.priceUSD || 700);
  const v2Price = Number(p.variant2Price || 1199);

  return {
    ...p,
    id: p.id || `cw-${Math.random().toString(36).substring(2, 9)}`,
    brand: p.brand || 'Rolex',
    collection: p.collection || 'Signature Collection',
    name: p.name || 'Master Clone Watch',
    modelCode: p.modelCode || p.spu || 'SPU-1001',
    factory: p.factory || (p.dataSheet?.factoryVersion || 'VS / CLEAN FACTORY'),
    variant1Name: p.variant1Name || 'Swiss Movement',
    variant1Price: v1Price,
    variant2Name: p.variant2Name || 'VS / Clean 1:1 Super Clone',
    variant2Price: v2Price,
    priceUSD: v1Price,
    originalPriceUSD: Number(p.originalPriceUSD || Math.round(v2Price * 1.15)),
    primaryImage,
    galleryImages: gallery,
    images: gallery,
    movement: p.movement || (p.dataSheet?.movement || 'Custom Dandong Super Clone Movement'),
    caseSize: p.caseSize || '40mm',
    material: p.material || (p.dataSheet?.caseMaterial || 'Solid 904L Oystersteel, Cerachrom Bezel'),
    bezel: p.bezel || (p.dataSheet?.bezel || 'Unidirectional Rotatable Cerachrom Ceramic'),
    crystal: p.crystal || 'Scratch-Resistant Sapphire with AR Coating',
    waterResistance: p.waterResistance || (p.dataSheet?.waterResistance || '50m / 5 ATM Waterproof Tested'),
    description: p.description || '',
    rawDescriptionHtml: p.rawDescriptionHtml || '',
    dataSheet: p.dataSheet || null,
    richShowcase: p.richShowcase || null,
    qcVideoVimeoId: p.qcVideoVimeoId || null,
    qcVideoUrl: p.qcVideoUrl || null,
    status: (p.status || 'ACTIVE').toUpperCase(),
    stock: (p.stock || 'IN_STOCK').toUpperCase(),
    rating: p.rating || 4.9,
    reviewsCount: p.reviewsCount || 48,
    badge: p.badge || (v2Price > 1000 ? 'BEST SELLER' : 'SUPER CLONE')
  };
}

export function getProductSlug(watch) {
  if (!watch) return '';
  if (watch.slug) return watch.slug;
  const name = String(watch.name || '').toLowerCase();
  if (name.includes('seamaster') && name.includes('300m')) {
    if (name.includes('007')) return 'seamaster-diver-300m-007';
    return 'seamaster-diver-300m';
  }
  return name
    .replace(/^(omega|rolex|patek\s+philippe|audemars\s+piguet)\s+super\s+clone\s+watches\s+\d+\s+/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || (watch.id || 'watch').toLowerCase();
}

export function StoreProvider({ children }) {
  // Currency state
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('cw_currency') || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('cw_currency', currency);
  }, [currency]);

  // Product Catalog (SSoT: Google Sheets -> LocalStorage -> Crawled JSON Fallback)
  const [products, setProducts] = useState(() => {
    try {
      const storedVersion = localStorage.getItem('cw_catalog_version');
      const saved = localStorage.getItem('cw_products_catalog');

      // Check if stored data is present and belongs to the current enriched version
      if (storedVersion === CURRENT_CATALOG_VERSION && saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasEnrichedData = parsed.some(p => p.dataSheet || (p.rawDescriptionHtml && p.rawDescriptionHtml.length > 100));
          if (hasEnrichedData) {
            return parsed.map(normalizeWatch).filter(Boolean);
          }
        }
      }

      // If version mismatch or old cache detected, auto-migrate to latest enriched dataset
      console.log('Migrating local catalog to latest enriched 991-watch master dataset...');
      localStorage.setItem('cw_catalog_version', CURRENT_CATALOG_VERSION);
      const freshCatalog = (CRAWLED_WATCHES || []).map(normalizeWatch).filter(Boolean);
      try {
        localStorage.setItem('cw_products_catalog', JSON.stringify(freshCatalog));
      } catch (e) {
        console.warn('LocalStorage quota warning:', e);
      }
      return freshCatalog;
    } catch (e) {
      console.warn('Failed to parse local catalog:', e);
    }
    return (CRAWLED_WATCHES || []).map(normalizeWatch).filter(Boolean);
  });

  const resetToMasterCatalog = () => {
    localStorage.setItem('cw_catalog_version', CURRENT_CATALOG_VERSION);
    const fresh = (CRAWLED_WATCHES || []).map(normalizeWatch).filter(Boolean);
    setProducts(fresh);
    try {
      localStorage.setItem('cw_products_catalog', JSON.stringify(fresh));
    } catch (e) {
      console.warn('LocalStorage quota warning:', e);
    }
    return fresh.length;
  };

  useEffect(() => {
    try {
      localStorage.setItem('cw_products_catalog', JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for products:', e);
    }
  }, [products]);


  // Google Sheet Integration State
  const [googleSheetId, setGoogleSheetId] = useState(() => {
    return localStorage.getItem('cw_sheet_id') || '';
  });

  const [syncStatus, setSyncStatus] = useState('IDLE'); // 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'
  const [syncError, setSyncError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem('cw_last_sync_time') || null;
  });

  const syncWithGoogleSheet = async (customId = null) => {
    const targetId = customId || googleSheetId;
    if (!targetId) {
      setSyncStatus('IDLE');
      return;
    }

    setSyncStatus('SYNCING');
    setSyncError(null);

    try {
      const liveProducts = await fetchGoogleSheetData(targetId);
      if (liveProducts && liveProducts.length > 0) {
        const normalized = liveProducts.map(normalizeWatch).filter(Boolean);
        setProducts(normalized);
        const now = new Date().toLocaleTimeString();
        setLastSyncTime(now);
        setSyncStatus('SUCCESS');
        localStorage.setItem('cw_last_sync_time', now);
        localStorage.setItem('cw_sheet_id', targetId);
      } else {
        throw new Error('Google Sheet returned 0 valid products');
      }
    } catch (err) {
      console.error('Google Sheets Sync Failed:', err);
      setSyncStatus('ERROR');
      setSyncError(err.message || 'Failed to sync with Google Sheet');
    }
  };

  // Background Auto-sync (SWR pattern) on mount if Sheet ID exists
  useEffect(() => {
    if (googleSheetId) {
      syncWithGoogleSheet(googleSheetId);
    }
  }, [googleSheetId]);

  // Modals & Navigation
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAntiScamOpen, setIsAntiScamOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Hash routing for #/admin
  useEffect(() => {
    if (import.meta.env.VITE_PROTOTYPE_MODE === 'true') return;
    const checkHash = () => {
      if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Dedicated Routing: /brands, /index-all-brands/:slug, etc.
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
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
    return { page: 'home', slug: null };
  };

  const [route, setRoute] = useState(parseCurrentUrl);

  const findProductBySlug = (slug) => {
    if (!slug) return null;
    const clean = String(slug).toLowerCase().trim();
    
    // 1. Direct Seamaster Diver 300M matching (per user request link)
    if (clean.includes('seamaster') && clean.includes('300m')) {
      const found = products.find(p => {
        const n = (p.name || '').toLowerCase();
        return n.includes('seamaster') && n.includes('300m');
      });
      if (found) return found;
    }

    // 2. Direct slug match
    let found = products.find(p => getProductSlug(p) === clean || (p.id && p.id.toLowerCase() === clean));
    if (found) return found;

    // 3. Partial slug match
    found = products.find(p => {
      const pSlug = getProductSlug(p);
      return pSlug.includes(clean) || clean.includes(pSlug);
    });
    if (found) return found;

    // 4. Model reference match
    found = products.find(p => {
      const ref = (p.dataSheet?.modelReference || p.modelCode || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return ref && clean.replace(/[^a-z0-9]/g, '').includes(ref);
    });

    return found || products[0];
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
    setQuickViewProduct(null); // close quick view if opened

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

  // Sync route on popstate and hashchange
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

    // Initial check
    if (route.page === 'product' && route.slug && !detailProduct) {
      setDetailProduct(findProductBySlug(route.slug));
    }

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [products]);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cw_cart');
      return saved ? JSON.parse(saved) : [
        {
          product: products[0] || CRAWLED_WATCHES[0],
          variantName: 'VS / Clean 1:1 Super Clone',
          priceUSD: (products[0] || CRAWLED_WATCHES[0])?.variant2Price || 1199,
          quantity: 1
        }
      ];
    } catch {
      return [{
        product: products[0] || CRAWLED_WATCHES[0],
        variantName: 'VS / Clean 1:1 Super Clone',
        priceUSD: (products[0] || CRAWLED_WATCHES[0])?.variant2Price || 1199,
        quantity: 1
      }];
    }
  });

  useEffect(() => {
    localStorage.setItem('cw_cart', JSON.stringify(cart));
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

  // Filter & Search
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Formatting helpers
  const formatPrice = (priceUSD) => {
    const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
    const converted = Number(priceUSD || 0) * rateInfo.rate;
    return `${rateInfo.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const getRawConverted = (priceUSD) => {
    const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
    return Number(priceUSD || 0) * rateInfo.rate;
  };

  // Cart operations
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

  // Update a single product (used by Admin)
  const updateProduct = (productId, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? normalizeWatch({ ...p, ...updatedFields }) : p))
    );
  };

  const addProduct = (newProductData) => {
    const normalized = normalizeWatch(newProductData);
    setProducts((prev) => [normalized, ...prev]);
    return normalized;
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Export & Import CSV helpers
  const exportCatalog = () => {
    downloadCsv(products, `clonewatches_catalog_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const importCatalogFromCsv = (csvText) => {
    // Basic CSV parser
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return 0;
    
    // Parse rows ignoring header
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

      newItems.push(normalizeWatch({
        id: clean(row[0]) || `cw-imported-${i}`,
        brand: clean(row[1]) || 'Rolex',
        collection: clean(row[2]) || 'Signature Collection',
        name,
        variant1Name: clean(row[4]) || 'Swiss Movement',
        variant1Price: getNum(row[5], 700),
        variant2Name: clean(row[6]) || 'VS / Clean 1:1 Super Clone',
        variant2Price: getNum(row[7], 1199),
        primaryImage: clean(row[8]) || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        galleryImages: clean(row[9]).split(',').map(s => s.trim()).filter(Boolean),
        movement: clean(row[10]) || 'Swiss Dandong Calibre',
        caseSize: clean(row[11]) || '41mm',
        material: clean(row[12]) || 'Solid 904L Oystersteel',
        waterResistance: clean(row[13]) || '50m / 5 ATM Tested',
        description: clean(row[14]) || '',
        status: clean(row[15]) || 'ACTIVE',
        stock: clean(row[16]) || 'IN_STOCK'
      }));
    }

    if (newItems.length > 0) {
      setProducts(newItems.filter(Boolean));
      return newItems.length;
    }
    return 0;
  };

  // Calculations
  const cartSubtotalUSD = cart.reduce(
    (sum, item) => sum + (item.priceUSD || item.product.priceUSD || item.product.variant1Price || 700) * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingThreshold = 500;
  const freeShippingUnlocked = cartSubtotalUSD >= freeShippingThreshold;
  const freeShippingProgress = Math.min(
    100,
    Math.round((cartSubtotalUSD / freeShippingThreshold) * 100)
  );

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
    clearCart();
    setIsCheckoutOpen(false);
    return newOrder;
  };

  // WhatsApp Integration State & Actions
  const [whatsappNumber, setWhatsappNumberState] = useState(() => getStoreWhatsAppNumber());

  const updateWhatsappNumber = (newNumber) => {
    setStoreWhatsAppNumber(newNumber);
    setWhatsappNumberState(getStoreWhatsAppNumber());
  };

  const sendOrderToWhatsApp = (orderData) => {
    const message = buildWhatsAppOrderMessage({
      orderId: orderData.orderId,
      customer: orderData.customer,
      items: orderData.items || cart,
      totalFormatted: orderData.totalFormatted || formatPrice(orderData.totalUSD),
      totalUSD: orderData.totalUSD,
      notes: orderData.notes,
      coupon: orderData.coupon || appliedCoupon,
      paymentMethod: orderData.paymentMethod || 'WhatsApp VIP Concierge',
      shippingFee: orderData.shippingFee ?? (freeShippingUnlocked ? 0 : 35)
    });
    return openWhatsAppChat(message, whatsappNumber);
  };

  const sendQuickProductToWhatsApp = ({ watch, variantName, variantPrice, quantity = 1, customer = {}, notes = '' }) => {
    const message = buildWhatsAppQuickProductMessage({
      watch,
      variantName,
      variantPrice,
      quantity,
      customer,
      notes
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
        products,
        setProducts,
        watches: products,
        googleSheetId,
        setGoogleSheetId,
        syncStatus,
        syncError,
        lastSyncTime,
        syncWithGoogleSheet,
        updateProduct,
        addProduct,
        deleteProduct,
        exportCatalog,
        importCatalogFromCsv,
        resetToMasterCatalog,
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
