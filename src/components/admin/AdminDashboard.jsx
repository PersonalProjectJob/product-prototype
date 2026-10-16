import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { extractSheetId } from '../../services/googleSheetsService';
import {
  Lock,
  Unlock,
  KeyRound,
  X,
  Search,
  Plus,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  DollarSign,
  Package,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  FileSpreadsheet
} from 'lucide-react';

const DEFAULT_PIN = '888888';

export default function AdminDashboard() {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    updateProduct,
    addProduct,
    deleteProduct,
    exportCatalog,
    importCatalogFromCsv,
    resetToMasterCatalog,
    googleSheetId,
    setGoogleSheetId,
    syncStatus,
    syncError,
    lastSyncTime,
    syncWithGoogleSheet,
    formatPrice,
    whatsappNumber,
    updateWhatsappNumber
  } = useStore();

  // Authentication & Security State
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cw_admin_auth') === 'true';
  });

  // Countdown timer for security lockout (FE-06)
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  // Clean URL hash on modal close (FE-01)
  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) {
        window.location.hash = '';
      }
    }
  };

  // Table & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSheetId, setTempSheetId] = useState(googleSheetId);
  const [tempWhatsapp, setTempWhatsapp] = useState(whatsappNumber || '84900000000');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvFileContent, setCsvFileContent] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  // Inline price edit state
  const [inlineEditing, setInlineEditing] = useState(null); // { id: '...', field: 'variant1Price' | 'variant2Price', value: 700 }

  const showNotification = (msg, type = 'success') => {
    setActionNotice({ msg, type });
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Auth Submit with Rate Limiting (FE-06)
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    if (pinInput.trim() === DEFAULT_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('cw_admin_auth', 'true');
      setAuthError('');
      setPinInput('');
      setFailedAttempts(0);
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setLockoutSeconds(30);
        setAuthError('Too many failed attempts. Security lockout active for 30 seconds.');
      } else {
        setAuthError(`Incorrect Security PIN (${5 - nextFailed} attempts remaining). Hint: Default PIN is 888888`);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cw_admin_auth');
    handleCloseAdmin();
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stock !== 'OUT_OF_STOCK').length;
    const outOfStock = total - inStock;
    const uniqueBrands = new Set(products.map((p) => p.brand)).size;
    return { total, inStock, outOfStock, uniqueBrands };
  }, [products]);

  // Brand list for filter
  const brandList = useMemo(() => {
    const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
    return ['All', ...brands];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      if (selectedStock === 'IN_STOCK' && p.stock === 'OUT_OF_STOCK') return false;
      if (selectedStock === 'OUT_OF_STOCK' && p.stock !== 'OUT_OF_STOCK') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchModel = (p.modelCode || p.spu || p.id || '').toLowerCase().includes(q);
        const matchFactory = (p.factory || p.dataSheet?.factoryVersion || '').toLowerCase().includes(q);
        const matchCalibre = (p.dataSheet?.calibre || p.dataSheet?.movement || p.movement || '').toLowerCase().includes(q);
        const matchRef = (p.dataSheet?.modelReference || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchModel && !matchFactory && !matchCalibre && !matchRef) return false;
      }
      return true;
    });
  }, [products, selectedBrand, selectedStock, searchTerm]);

  // Paginated slice with auto-clamp (FE-03)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Inline price save (FE-04)
  const handleSaveInline = (productId, field) => {
    if (!inlineEditing || inlineEditing.id !== productId) return;
    const currentVal = inlineEditing.value;
    setInlineEditing(null);
    const num = parseFloat(currentVal);
    if (!isNaN(num) && num > 0) {
      updateProduct(productId, { [field]: num });
      showNotification(`Updated price for watch.`);
    }
  };

  // Stock status toggle
  const handleToggleStock = (product) => {
    const nextStock = product.stock === 'OUT_OF_STOCK' ? 'IN_STOCK' : 'OUT_OF_STOCK';
    updateProduct(product.id, { stock: nextStock });
    showNotification(`Watch marked as ${nextStock === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}.`);
  };

  // Delete product
  const handleDeleteProduct = (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
      showNotification(`Deleted ${product.name}`);
    }
  };

  // Save product from full modal
  const handleSaveFullProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct);
      showNotification(`Saved changes to "${editingProduct.name}"`);
      setEditingProduct(null);
    }
  };

  // Create new product
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!editingProduct?.name) return;
    const added = addProduct({
      ...editingProduct,
      id: `cw-custom-${Date.now()}`
    });
    showNotification(`Added new watch "${added.name}"`);
    setIsCreatingProduct(false);
    setEditingProduct(null);
  };

  // Handle CSV Import
  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvFileContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleConfirmCsvImport = () => {
    if (!csvFileContent) return;
    const count = importCatalogFromCsv(csvFileContent);
    if (count > 0) {
      showNotification(`Successfully imported ${count} watches from CSV!`);
      setImportModalOpen(false);
      setCsvFileContent('');
    } else {
      alert('Failed to parse CSV file. Please ensure it follows the Clonewatches catalog structure.');
    }
  };

  // Save Google Sheet ID & Sales WhatsApp Phone
  const handleSaveSheetSettings = async (e) => {
    e.preventDefault();
    const clean = extractSheetId(tempSheetId);
    setGoogleSheetId(clean);
    if (tempWhatsapp && updateWhatsappNumber) {
      updateWhatsappNumber(tempWhatsapp);
    }
    setIsSettingsOpen(false);
    if (clean) {
      await syncWithGoogleSheet(clean);
    }
    showNotification('Settings & Sales WhatsApp number updated successfully!');
  };

  if (!isAdminOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950/85 backdrop-blur-md flex flex-col justify-between overflow-y-auto font-sans text-neutral-900">
      
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-[70] bg-obsidian-900 text-white border border-gold-500/50 shadow-2xl px-4 py-3 flex items-center gap-2 text-xs font-mono animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="bg-obsidian-950 text-white px-4 sm:px-8 py-3.5 border-b border-white/10 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-gold-500/20 text-gold-400 p-2 border border-gold-500/30">
            <Lock className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <span>CloneWatches SaaS Admin CMS</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 font-mono">
                v2.0 Live
              </span>
            </h1>
            <p className="text-[11px] text-white/50 font-mono">
              Hybrid Frontend &bull; Google Sheets Database SSoT &bull; Zero Backend
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xs text-white/60 hover:text-white px-2.5 py-1 border border-white/10 hover:border-white/30 transition-colors"
            >
              Sign Out
            </button>
          )}

          <button
            onClick={handleCloseAdmin}
            className="p-1.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/15 transition-colors border border-white/10"
            title="Close Admin Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ===================== PIN GATE SCREEN ===================== */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto my-12 bg-white border border-obsidian-800/15 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-obsidian-950 text-gold-400 mx-auto flex items-center justify-center border border-gold-500/30">
                <KeyRound className="w-6 h-6 text-gold-400" />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wide text-obsidian-950">
                Storeowner Security Access
              </h2>
              <p className="text-xs text-obsidian-800/60 leading-relaxed">
                Enter your 6-digit administrative security PIN to manage product catalog, pricing variants, and Google Sheet integration.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-800/80 mb-1.5">
                  Admin PIN Code:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  disabled={lockoutSeconds > 0}
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono py-2.5 border border-obsidian-800/20 focus:border-gold-500 focus:outline-none disabled:bg-neutral-100 disabled:opacity-60"
                  autoFocus
                />
              </div>

              {authError && (
                <div className={`p-2.5 text-xs border flex items-center gap-2 ${
                  lockoutSeconds > 0 ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-crimson-50 text-crimson-700 border-crimson-200'
                }`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {lockoutSeconds > 0 ? `Security lockout active: Retry in ${lockoutSeconds}s` : authError}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={lockoutSeconds > 0}
                className="w-full py-3 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-extrabold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlock className="w-4 h-4" />
                <span>
                  {lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Unlock CMS Dashboard'}
                </span>
              </button>

              <div className="bg-obsidian-800/5 p-3 border border-obsidian-800/10 text-[11px] text-obsidian-800/70 font-mono text-center">
                Demo Security PIN: <strong className="text-obsidian-950">888888</strong>
              </div>
            </form>
          </div>
        ) : (
          /* ===================== AUTHENTICATED CMS DASHBOARD ===================== */
          <div className="space-y-6">
            
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-obsidian-800/10 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-obsidian-800/60 uppercase font-semibold">
                  <span>Total Watches</span>
                  <Package className="w-4 h-4 text-gold-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-obsidian-950 mt-1">
                  {stats.total}
                </div>
                <div className="text-[11px] text-obsidian-800/60 mt-1 font-mono">
                  {stats.uniqueBrands} Luxury Brands
                </div>
              </div>

              <div className="bg-white border border-obsidian-800/10 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-emerald-800 uppercase font-semibold">
                  <span>In Stock</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-1">
                  {stats.inStock}
                </div>
                <div className="text-[11px] text-emerald-700/80 mt-1">
                  Ready for express dispatch
                </div>
              </div>

              <div className="bg-white border border-obsidian-800/10 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-crimson-800 uppercase font-semibold">
                  <span>Out of Stock</span>
                  <AlertCircle className="w-4 h-4 text-crimson-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-crimson-700 mt-1">
                  {stats.outOfStock}
                </div>
                <div className="text-[11px] text-crimson-700/80 mt-1">
                  Requires factory restock
                </div>
              </div>

              <div className="bg-white border border-obsidian-800/10 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-obsidian-800/60 uppercase font-semibold">
                  <span>Google Sheet SSoT</span>
                  <Database className="w-4 h-4 text-gold-600" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    syncStatus === 'SUCCESS' ? 'bg-emerald-500' : syncStatus === 'SYNCING' ? 'bg-gold-500 animate-pulse' : syncStatus === 'ERROR' ? 'bg-crimson-500' : 'bg-neutral-400'
                  }`} />
                  <span className="text-sm font-bold font-mono text-obsidian-950 uppercase">
                    {syncStatus}
                  </span>
                </div>
                <div className="text-[10px] text-obsidian-800/60 font-mono mt-1 truncate">
                  {lastSyncTime ? `Synced: ${lastSyncTime}` : 'Offline Cached Data'}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border border-obsidian-800/10 p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Left Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      brand: 'Rolex',
                      collection: 'Submariner',
                      modelCode: `SPU-${Math.floor(1000 + Math.random() * 9000)}`,
                      variant1Name: 'Swiss Movement',
                      variant1Price: 700,
                      variant2Name: 'VS / Clean 1:1 Super Clone',
                      variant2Price: 1199,
                      caseSize: '41mm',
                      movement: 'Super Clone Dandong 3235 Movement',
                      material: 'Solid 904L Oystersteel',
                      waterResistance: '50m / 5 ATM Tested',
                      primaryImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
                      galleryImages: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'],
                      description: 'Custom Swiss Dandong movement, authentic sapphire glass, ceramic bezel.',
                      stock: 'IN_STOCK'
                    });
                    setIsCreatingProduct(true);
                  }}
                  className="px-3.5 py-2 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Watch</span>
                </button>

                <button
                  onClick={exportCatalog}
                  className="px-3.5 py-2 bg-white hover:bg-obsidian-800/5 text-obsidian-950 text-xs font-bold uppercase tracking-wider border border-obsidian-800/20 transition-all flex items-center gap-1.5 shadow-sm"
                  title="Xuất danh mục 991 sản phẩm chuẩn định dạng Google Sheets / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-gold-600" />
                  <span>Export Google Sheet CSV</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Tải lại toàn bộ 991 sản phẩm gốc đã làm giàu đầy đủ thông tin (Description, Data Sheet, Calibre Engine, 4K CDN Images)? Thao tác này sẽ làm mới bộ nhớ cache của trình duyệt.')) {
                      const count = resetToMasterCatalog();
                      showNotification(`Đã tải lại thành công ${count} sản phẩm với đầy đủ Data Sheet và mô tả chi tiết!`);
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold uppercase tracking-wider border border-emerald-300 transition-all flex items-center gap-1.5 shadow-sm"
                  title="Làm mới bộ nhớ cache và nạp lại toàn bộ 991 sản phẩm đã làm giàu thông tin"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Reload 991 Catalog</span>
                </button>

                <button
                  onClick={() => setImportModalOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-obsidian-800/5 text-obsidian-950 text-xs font-bold uppercase tracking-wider border border-obsidian-800/20 transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-obsidian-700" />
                  <span>Import CSV</span>
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3.5 py-2 bg-gold-50 hover:bg-gold-100 text-gold-950 text-xs font-bold uppercase tracking-wider border border-gold-300 transition-all flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-gold-700" />
                  <span>Google Sheet Setup</span>
                </button>
              </div>

              {/* Right: Live Sync Trigger */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => syncWithGoogleSheet()}
                  disabled={syncStatus === 'SYNCING'}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border flex items-center gap-2 transition-all ${
                    syncStatus === 'SYNCING'
                      ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                      : 'bg-white hover:bg-obsidian-950 hover:text-white text-obsidian-950 border-obsidian-800/20'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                  <span>{syncStatus === 'SYNCING' ? 'Syncing...' : 'Sync Live Data'}</span>
                </button>
              </div>

            </div>

            {/* Filters & Search Row */}
            <div className="bg-white border border-obsidian-800/10 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Title, Model, SPU..."
                  className="w-full bg-neutral-50/60 border border-obsidian-800/15 pl-9 pr-3 py-2 text-xs text-obsidian-950 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Brand Filter */}
                <div className="flex items-center gap-1.5 text-xs text-obsidian-800/70">
                  <span className="font-semibold uppercase text-[10px]">Brand:</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-neutral-50/60 border border-obsidian-800/15 px-2 py-1.5 text-xs text-obsidian-950 font-medium focus:outline-none"
                  >
                    {brandList.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Filter */}
                <div className="flex items-center gap-1.5 text-xs text-obsidian-800/70">
                  <span className="font-semibold uppercase text-[10px]">Stock:</span>
                  <select
                    value={selectedStock}
                    onChange={(e) => {
                      setSelectedStock(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-neutral-50/60 border border-obsidian-800/15 px-2 py-1.5 text-xs text-obsidian-950 font-medium focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="IN_STOCK">In Stock Only</option>
                    <option value="OUT_OF_STOCK">Out of Stock Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white border border-obsidian-800/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-obsidian-800/10">
                  <thead className="bg-obsidian-950 text-white font-mono uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Watch</th>
                      <th className="py-3 px-4">Brand / Series</th>
                      <th className="py-3 px-4">Variant 1 (Swiss)</th>
                      <th className="py-3 px-4">Variant 2 (Clean 1:1)</th>
                      <th className="py-3 px-4 text-center">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian-800/5">
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((p) => {
                        const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.primaryImage || '');
                        const isOut = p.stock === 'OUT_OF_STOCK';

                        return (
                          <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                            {/* Watch info & thumbnail */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={img}
                                  alt={p.name}
                                  className="w-12 h-12 object-cover border border-obsidian-800/10 flex-shrink-0"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
                                  }}
                                />
                                <div className="max-w-xs sm:max-w-md">
                                  <div className="font-bold text-obsidian-950 line-clamp-1">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] text-obsidian-800/60 font-mono">
                                    {p.modelCode || p.spu || p.id} &bull; {p.caseSize || '40mm'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Brand / Series */}
                            <td className="py-3 px-4 font-mono">
                              <span className="font-bold text-obsidian-950 block">{p.brand}</span>
                              <span className="text-[10px] text-gold-700">{p.collection}</span>
                            </td>

                            {/* Variant 1 Price (Inline editable) */}
                            <td className="py-3 px-4">
                              {inlineEditing?.id === p.id && inlineEditing.field === 'variant1Price' ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-mono font-bold">$</span>
                                  <input
                                    type="number"
                                    value={inlineEditing.value}
                                    onChange={(e) => setInlineEditing({ ...inlineEditing, value: e.target.value })}
                                    onBlur={() => handleSaveInline(p.id, 'variant1Price')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.currentTarget.blur();
                                      } else if (e.key === 'Escape') {
                                        setInlineEditing(null);
                                      }
                                    }}
                                    className="w-20 px-1 py-0.5 border border-gold-500 font-mono text-xs focus:outline-none"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div
                                  onClick={() => setInlineEditing({ id: p.id, field: 'variant1Price', value: p.variant1Price || 700 })}
                                  className="cursor-pointer group flex items-center gap-1 hover:text-gold-600"
                                  title="Click to edit Variant 1 price"
                                >
                                  <span className="font-mono font-bold">{formatPrice(p.variant1Price || 700)}</span>
                                  <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-obsidian-800/40" />
                                </div>
                              )}
                              <span className="text-[10px] text-obsidian-800/50 block font-mono">
                                {p.variant1Name || 'Swiss Movt'}
                              </span>
                            </td>

                            {/* Variant 2 Price (Inline editable) */}
                            <td className="py-3 px-4">
                              {inlineEditing?.id === p.id && inlineEditing.field === 'variant2Price' ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-mono font-bold">$</span>
                                  <input
                                    type="number"
                                    value={inlineEditing.value}
                                    onChange={(e) => setInlineEditing({ ...inlineEditing, value: e.target.value })}
                                    onBlur={() => handleSaveInline(p.id, 'variant2Price')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.currentTarget.blur();
                                      } else if (e.key === 'Escape') {
                                        setInlineEditing(null);
                                      }
                                    }}
                                    className="w-20 px-1 py-0.5 border border-gold-500 font-mono text-xs focus:outline-none"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div
                                  onClick={() => setInlineEditing({ id: p.id, field: 'variant2Price', value: p.variant2Price || 1199 })}
                                  className="cursor-pointer group flex items-center gap-1 hover:text-gold-600"
                                  title="Click to edit Variant 2 price"
                                >
                                  <span className="font-mono font-bold">{formatPrice(p.variant2Price || 1199)}</span>
                                  <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-obsidian-800/40" />
                                </div>
                              )}
                              <span className="text-[10px] text-obsidian-800/50 block font-mono">
                                {p.variant2Name || 'Clean 1:1'}
                              </span>
                            </td>

                            {/* Stock status toggle */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleToggleStock(p)}
                                className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border transition-colors ${
                                  isOut
                                    ? 'bg-crimson-50 text-crimson-700 border-crimson-200 hover:bg-crimson-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {isOut ? 'Out of Stock' : 'In Stock'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingProduct({ ...p })}
                                  className="p-1.5 hover:bg-obsidian-800/10 text-obsidian-800 hover:text-obsidian-950 transition-colors"
                                  title="Edit Full Specifications"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 hover:bg-crimson-50 text-obsidian-800/40 hover:text-crimson-600 transition-colors"
                                  title="Delete Watch"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-obsidian-800/60">
                          No matching watches found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar */}
              <div className="p-4 border-t border-obsidian-800/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-obsidian-800/60 font-mono">
                  Showing {(currentPage - 1) * itemsPerPage + 1} &ndash;{' '}
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-obsidian-800/15 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-mono font-bold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-obsidian-800/15 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ===================== GOOGLE SHEETS SETTINGS MODAL ===================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-60 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full border border-obsidian-800/20 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-obsidian-800/10">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-obsidian-950">
                  Google Sheets Real-time SSoT Integration
                </h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)}>
                <X className="w-5 h-5 text-obsidian-800/60 hover:text-obsidian-950" />
              </button>
            </div>

            <form onSubmit={handleSaveSheetSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-1">
                  Sales WhatsApp Phone Number (E.164 without +, e.g. 84900000000):
                </label>
                <input
                  type="text"
                  value={tempWhatsapp}
                  onChange={(e) => setTempWhatsapp(e.target.value)}
                  placeholder="e.g. 84900000000"
                  className="w-full p-2.5 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                />
                <p className="text-[11px] text-obsidian-800/60 mt-1">
                  All customer 1-click orders and VIP inquiries will be dispatched directly to this WhatsApp phone.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-1">
                  Google Sheet ID or Full Shareable Link:
                </label>
                <input
                  type="text"
                  value={tempSheetId}
                  onChange={(e) => setTempSheetId(e.target.value)}
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms or paste URL"
                  className="w-full p-2.5 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                />
                <p className="text-[11px] text-obsidian-800/60 mt-1">
                  Extracts the ID automatically from any Google Sheet URL.
                </p>
              </div>

              {/* Instructions Guide */}
              <div className="bg-obsidian-800/5 p-4 border border-obsidian-800/10 text-xs space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-obsidian-950">
                  How To Connect Your Google Sheet (Zero Backend):
                </h4>
                <ol className="list-decimal pl-4 space-y-1 text-obsidian-800/80 text-[11px]">
                  <li>Import <code className="bg-white px-1 font-mono">public/clonewatches_master_catalog.csv</code> into Google Drive / Sheets.</li>
                  <li>In Google Sheets, click the green <strong>Share</strong> button (top right).</li>
                  <li>Under <em>General Access</em>, change from "Restricted" to <strong>"Anyone with the link can view"</strong>.</li>
                  <li>Copy the URL or Sheet ID and paste it into the field above.</li>
                  <li>Click <strong>Save &amp; Sync Now</strong> below. The frontend will immediately read live prices and stock changes!</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-obsidian-800/60 hover:text-obsidian-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md"
                >
                  Save &amp; Sync Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT / CREATE PRODUCT MODAL ===================== */}
      {(editingProduct || isCreatingProduct) && (
        <div className="fixed inset-0 z-60 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-obsidian-800/20 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-obsidian-800/10">
              <h3 className="font-bold text-sm uppercase tracking-wider text-obsidian-950">
                {isCreatingProduct ? 'Add New Timepiece' : `Edit: ${editingProduct?.name}`}
              </h3>
              <button onClick={() => { setEditingProduct(null); setIsCreatingProduct(false); }}>
                <X className="w-5 h-5 text-obsidian-800/60 hover:text-obsidian-950" />
              </button>
            </div>

            <form onSubmit={isCreatingProduct ? handleCreateProduct : handleSaveFullProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Watch Title:</label>
                <input
                  type="text"
                  required
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Brand:</label>
                  <input
                    type="text"
                    required
                    value={editingProduct?.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Collection / Series:</label>
                  <input
                    type="text"
                    required
                    value={editingProduct?.collection || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, collection: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 border border-obsidian-800/10">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Variant 1 Name:</label>
                  <input
                    type="text"
                    value={editingProduct?.variant1Name || 'Swiss Movement'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, variant1Name: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Variant 1 Price (USD):</label>
                  <input
                    type="number"
                    value={editingProduct?.variant1Price || 700}
                    onChange={(e) => setEditingProduct({ ...editingProduct, variant1Price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Variant 2 Name:</label>
                  <input
                    type="text"
                    value={editingProduct?.variant2Name || 'VS / Clean 1:1 Super Clone'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, variant2Name: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Variant 2 Price (USD):</label>
                  <input
                    type="number"
                    value={editingProduct?.variant2Price || 1199}
                    onChange={(e) => setEditingProduct({ ...editingProduct, variant2Price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Case Size:</label>
                  <input
                    type="text"
                    value={editingProduct?.caseSize || '40mm'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, caseSize: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Water Resistance:</label>
                  <input
                    type="text"
                    value={editingProduct?.waterResistance || '50m / 5 ATM'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, waterResistance: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Stock Status:</label>
                  <select
                    value={editingProduct?.stock || 'IN_STOCK'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="IN_STOCK">IN_STOCK</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Movement Details:</label>
                <input
                  type="text"
                  value={editingProduct?.movement || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, movement: e.target.value })}
                  className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                />
              </div>

              {/* Data Sheet Specifications Group */}
              <div className="bg-neutral-50 p-3 border border-obsidian-800/10 space-y-3">
                <div className="font-bold text-[11px] uppercase tracking-wider text-obsidian-950 flex items-center justify-between">
                  <span>Data Sheet Specifications (vsfwatch.cc Standard):</span>
                  <span className="text-[10px] text-gold-700 font-mono">8-Field Spec Table</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Model Reference:</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.modelReference || editingProduct?.modelCode || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          modelCode: val,
                          dataSheet: { ...editingProduct?.dataSheet, modelReference: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white"
                      placeholder="e.g. 126610LN"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Factory / Version:</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.factoryVersion || editingProduct?.factory || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          factory: val,
                          dataSheet: { ...editingProduct?.dataSheet, factoryVersion: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white"
                      placeholder="e.g. VSF Ultimate Edition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Movement / Calibre:</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.calibre || editingProduct?.dataSheet?.movement || editingProduct?.movement || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          movement: val,
                          dataSheet: { ...editingProduct?.dataSheet, calibre: val, movement: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white font-mono"
                      placeholder="e.g. Dandong Super Clone VS3235"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Dial:</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.dial || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          dataSheet: { ...editingProduct?.dataSheet, dial: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white"
                      placeholder="e.g. Black Sunray Dial with Chromalight"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Bezel:</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.bezel || editingProduct?.bezel || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          bezel: val,
                          dataSheet: { ...editingProduct?.dataSheet, bezel: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white"
                      placeholder="e.g. Cerachrom Ceramic 60-Minute Graduated"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Case Material:</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.caseMaterial || editingProduct?.material || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          material: val,
                          dataSheet: { ...editingProduct?.dataSheet, caseMaterial: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white"
                      placeholder="e.g. Solid 904L Oystersteel"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Case Dimensions:</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.caseDimensions || (editingProduct?.caseSize ? `${editingProduct.caseSize} x 12.0 mm` : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          dataSheet: { ...editingProduct?.dataSheet, caseDimensions: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white"
                      placeholder="e.g. 41 mm x 12.1 mm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Bracelet:</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.bracelet || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          dataSheet: { ...editingProduct?.dataSheet, bracelet: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white"
                      placeholder="e.g. Solid 904L Steel Oyster with Glidelock"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-obsidian-800/70 mb-0.5">Water Resistance (Data Sheet):</label>
                    <input
                      type="text"
                      value={editingProduct?.dataSheet?.waterResistance || editingProduct?.waterResistance || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          waterResistance: val,
                          dataSheet: { ...editingProduct?.dataSheet, waterResistance: val }
                        });
                      }}
                      className="w-full p-1.5 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none bg-white"
                      placeholder="e.g. 50 Meters (Pressure Tested)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Primary Image URL:</label>
                <input
                  type="text"
                  value={editingProduct?.primaryImage || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, primaryImage: e.target.value })}
                  className="w-full p-2 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider">Full Product Description (Calibre Engine &amp; Specifications):</label>
                  <span className="text-[10px] text-obsidian-800/60 font-mono">Multi-line formatted</span>
                </div>
                <textarea
                  rows={8}
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 text-[11px] font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none leading-relaxed"
                  placeholder="Full watch description with Calibre and Technical Specifications..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-obsidian-800/10">
                <button
                  type="button"
                  onClick={() => { setEditingProduct(null); setIsCreatingProduct(false); }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-obsidian-800/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md"
                >
                  {isCreatingProduct ? 'Create Watch' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CSV IMPORT MODAL ===================== */}
      {importModalOpen && (
        <div className="fixed inset-0 z-60 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-obsidian-800/20 shadow-2xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-obsidian-800/10">
              <h3 className="font-bold text-sm uppercase tracking-wider text-obsidian-950">
                Import Products from CSV
              </h3>
              <button onClick={() => setImportModalOpen(false)}>
                <X className="w-5 h-5 text-obsidian-800/60 hover:text-obsidian-950" />
              </button>
            </div>

            <p className="text-xs text-obsidian-800/70">
              Upload a UTF-8 CSV file containing your product catalog. Columns should match the standard Clonewatches catalog structure (ID, Brand, Collection, Title, Variant 1, Variant 2...).
            </p>

            <div className="border-2 border-dashed border-obsidian-800/20 p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvFileUpload}
                className="text-xs file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-obsidian-950 file:text-white hover:file:bg-gold-500 hover:file:text-obsidian-950"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-obsidian-800/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCsvImport}
                disabled={!csvFileContent}
                className="px-5 py-2.5 bg-obsidian-950 hover:bg-gold-500 disabled:opacity-40 disabled:cursor-not-allowed text-white hover:text-obsidian-950 text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                Import &amp; Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
