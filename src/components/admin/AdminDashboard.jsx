import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  WHATSAPP_CONTACT_NAME,
  DEFAULT_WHATSAPP_NUMBER,
  DEFAULT_WHATSAPP_TEMPLATE_CONFIG,
  WHATSAPP_TEMPLATE_VARIABLES,
  normalizeWhatsAppPhone,
  formatWhatsAppDisplayPhone,
  buildWhatsAppQuickProductMessage,
  generateWhatsAppUrl
} from '../../services/whatsappService';
import WhatsAppIcon from '../common/WhatsAppIcon';
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
  Package,
  ChevronLeft,
  ChevronRight,
  Database,
  Phone,
  RotateCcw,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Film,
  Image as ImageIcon,
  ShieldAlert,
  Cloud
} from 'lucide-react';

const DEFAULT_PIN = '888888';

export default function AdminDashboard() {
  const {
    isAdminOpen,
    setIsAdminOpen,
    adminProducts,
    products,
    updateProduct,
    bulkUpdateProducts,
    addProduct,
    deleteProduct,
    exportCatalog,
    importCatalogFromCsv,
    resetToMasterCatalog,
    r2PublicUrl,
    updateR2PublicUrl,
    isS3EndpointWarning,
    syncStatus,
    lastSyncTime,
    importBatchReport,
    syncWithSupabase,
    evaluatePublishGate,
    formatPrice,
    whatsappNumber,
    updateWhatsappNumber,
    whatsappTemplateConfig,
    updateWhatsappTemplateConfig,
    resetWhatsappTemplate
  } = useStore();

  const catalogList = Array.isArray(adminProducts) && adminProducts.length > 0 ? adminProducts : products;

  // Authentication & Security State
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cw_admin_auth') === 'true';
  });

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        window.location.hash = '';
      }
    }
  };

  // Active Sub-View ('products' | 'price_review' | 'import_report')
  const [activeAdminView, setActiveAdminView] = useState('products');

  // Table & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All');
  const [selectedPubStatus, setSelectedPubStatus] = useState('All'); // 'All' | 'published' | 'unpublished'
  const [selectedPriceStatus, setSelectedPriceStatus] = useState('All'); // 'All' | 'auto_matched' | 'confirmed' | 'missing'
  const [showLegacyOnly, setShowLegacyOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [tempR2Url, setTempR2Url] = useState(r2PublicUrl || '');
  const [tempWhatsapp, setTempWhatsapp] = useState(whatsappNumber || DEFAULT_WHATSAPP_NUMBER);
  const [tempTemplateCfg, setTempTemplateCfg] = useState(() => ({
    ...DEFAULT_WHATSAPP_TEMPLATE_CONFIG,
    ...(whatsappTemplateConfig || {})
  }));
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvFileContent, setCsvFileContent] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    setTempWhatsapp(whatsappNumber || DEFAULT_WHATSAPP_NUMBER);
  }, [whatsappNumber]);

  useEffect(() => {
    setTempTemplateCfg({
      ...DEFAULT_WHATSAPP_TEMPLATE_CONFIG,
      ...(whatsappTemplateConfig || {})
    });
  }, [whatsappTemplateConfig]);

  useEffect(() => {
    setTempR2Url(r2PublicUrl || '');
  }, [r2PublicUrl]);

  const activeFormattedPhone = formatWhatsAppDisplayPhone(whatsappNumber);
  const previewCleanPhone = normalizeWhatsAppPhone(tempWhatsapp) || DEFAULT_WHATSAPP_NUMBER;
  const previewFormattedPhone = formatWhatsAppDisplayPhone(previewCleanPhone);

  // Inline price edit state
  const [inlineEditing, setInlineEditing] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setActionNotice({ msg, type });
    setTimeout(() => setActionNotice(null), 3500);
  };

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

  // V4 + Supabase + R2 Metrics
  const stats = useMemo(() => {
    const v4List = catalogList.filter((p) => !p.legacy);
    const legacyList = catalogList.filter((p) => p.legacy);
    const total = v4List.length;
    const published = v4List.filter((p) => p.publication_status === 'published').length;
    const autoMatched = v4List.filter((p) => p.price_status === 'auto_matched').length;
    const confirmedPrice = v4List.filter((p) => p.price_status === 'confirmed').length;
    const missingPrice = v4List.filter((p) => p.price_status === 'missing' || !p.variant1Price).length;
    const missingBrand = v4List.filter((p) => !p.brand).length;
    const withNickname = v4List.filter((p) => p.nickname).length;
    const totalImages = v4List.reduce((acc, p) => acc + (Number(p.image_count) || 0), 0);
    const totalVideos = v4List.reduce((acc, p) => acc + (Number(p.video_count) || 0), 0);
    const uniqueBrands = new Set(v4List.map((p) => p.brand).filter(Boolean)).size;

    return {
      total,
      published,
      unpublished: total - published,
      autoMatched,
      confirmedPrice,
      missingPrice,
      missingBrand,
      withNickname,
      totalImages,
      totalVideos,
      uniqueBrands,
      legacyCount: legacyList.length
    };
  }, [catalogList]);

  const brandList = useMemo(() => {
    const brands = Array.from(new Set(catalogList.map((p) => p.brand).filter(Boolean))).sort();
    return ['All', '(Blank Brand)', ...brands];
  }, [catalogList]);

  const filteredProducts = useMemo(() => {
    return catalogList.filter((p) => {
      if (showLegacyOnly) {
        if (!p.legacy) return false;
      } else if (p.legacy) {
        return false;
      }

      if (activeAdminView === 'price_review') {
        if (p.price_status !== 'auto_matched' && p.price_status !== 'missing') return false;
      }

      if (selectedBrand === '(Blank Brand)') {
        if (p.brand) return false;
      } else if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
        return false;
      }

      if (selectedStock === 'IN_STOCK' && p.stock === 'OUT_OF_STOCK') return false;
      if (selectedStock === 'OUT_OF_STOCK' && p.stock !== 'OUT_OF_STOCK') return false;

      if (selectedPubStatus !== 'All' && p.publication_status !== selectedPubStatus) return false;
      if (selectedPriceStatus !== 'All' && p.price_status !== selectedPriceStatus) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchId = (p.product_id || p.id || '').toLowerCase().includes(q);
        const matchName = (p.name || p.title || '').toLowerCase().includes(q);
        const matchNick = (p.nickname || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchCol = (p.collection || '').toLowerCase().includes(q);
        const matchModel = (p.model || p.modelCode || p.spu || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchNick && !matchBrand && !matchCol && !matchModel) return false;
      }
      return true;
    });
  }, [
    catalogList,
    showLegacyOnly,
    activeAdminView,
    selectedBrand,
    selectedStock,
    selectedPubStatus,
    selectedPriceStatus,
    searchTerm
  ]);

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

  // Inline price save -> auto marks price_status = 'confirmed' & price_source = 'admin' (BR-16/BR-17)
  const handleSaveInline = (product, field) => {
    if (!inlineEditing || inlineEditing.id !== product.id) return;
    const currentVal = inlineEditing.value;
    setInlineEditing(null);
    const num = parseFloat(currentVal);
    if (!isNaN(num) && num > 0) {
      const patch = {
        [field]: num,
        price_status: 'confirmed',
        price_source: 'admin'
      };
      if (field === 'variant1Price' && (!product.variant2Price || product.variant2Price <= 0)) {
        patch.variant2Price = Math.round(num * 1.45);
      }
      updateProduct(product.id, patch);
      showNotification(`Đã lưu và xác nhận giá cho ${product.product_id} (${product.name})`);
    }
  };

  // Approve auto-matched price (1-click)
  const handleApprovePrice = (product) => {
    if (!product.variant1Price || product.variant1Price <= 0) {
      showNotification('Sản phẩm chưa có giá. Vui lòng nhấp vào ô giá để nhập trước khi duyệt.', 'error');
      return;
    }
    updateProduct(product.id, {
      price_status: 'confirmed',
      price_source: 'admin'
    });
    showNotification(`Đã duyệt giá (${formatPrice(product.variant1Price)}) cho ${product.product_id}`);
  };

  // Toggle publication_status ('published' <-> 'unpublished') with BR-06 Publish Gate check
  const handleTogglePublish = (product) => {
    const isCurrentlyPublished = product.publication_status === 'published';
    if (isCurrentlyPublished) {
      updateProduct(product.id, { publication_status: 'unpublished' });
      showNotification(`Đã gỡ xuất bản ${product.product_id}`);
      return;
    }

    const gate = evaluatePublishGate ? evaluatePublishGate(product) : { canPublish: product.canPublish, reasons: product.publishBlockReasons || [] };
    if (!gate.canPublish) {
      showNotification(`Không thể xuất bản ${product.product_id}: ${gate.reasons.join('; ')}`, 'error');
      return;
    }

    updateProduct(product.id, { publication_status: 'published' });
    showNotification(`Đã xuất bản ${product.product_id} lên Storefront!`);
  };

  // Bulk actions
  const toggleSelectId = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllPage = () => {
    const pageIds = paginatedProducts.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBulkApprovePrices = async () => {
    const targets = catalogList.filter((p) => selectedIds.includes(p.id) && p.variant1Price > 0);
    if (targets.length === 0) {
      showNotification('Không có sản phẩm nào đã chọn có giá hợp lệ để duyệt.', 'error');
      return;
    }
    const ids = targets.map((p) => p.id);
    await bulkUpdateProducts(ids, { price_status: 'confirmed', price_source: 'admin' });
    setSelectedIds([]);
    showNotification(`Đã duyệt giá hàng loạt cho ${ids.length} sản phẩm!`);
  };

  const handleBulkPublish = async () => {
    const selectedProducts = catalogList.filter((p) => selectedIds.includes(p.id));
    const eligible = selectedProducts.filter((p) => (evaluatePublishGate ? evaluatePublishGate(p).canPublish : p.canPublish));
    const blockedCount = selectedProducts.length - eligible.length;

    if (eligible.length === 0) {
      showNotification('Các sản phẩm đã chọn chưa đủ điều kiện xuất bản (thiếu brand hoặc giá — BR-06).', 'error');
      return;
    }
    const ids = eligible.map((p) => p.id);
    await bulkUpdateProducts(ids, { publication_status: 'published' });
    setSelectedIds([]);
    showNotification(
      `Đã xuất bản ${ids.length} sản phẩm!${blockedCount > 0 ? ` (${blockedCount} SP bị bỏ qua do thiếu giá/brand)` : ''}`
    );
  };

  const handleBulkUnpublish = async () => {
    if (selectedIds.length === 0) return;
    await bulkUpdateProducts(selectedIds, { publication_status: 'unpublished' });
    const count = selectedIds.length;
    setSelectedIds([]);
    showNotification(`Đã chuyển ${count} sản phẩm về Chưa xuất bản.`);
  };

  const handleToggleStock = (product) => {
    const nextStock = product.stock === 'OUT_OF_STOCK' ? 'IN_STOCK' : 'OUT_OF_STOCK';
    updateProduct(product.id, { stock: nextStock });
    showNotification(`Đã đổi trạng thái kho ${product.product_id}: ${nextStock}`);
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${product.name}" (${product.product_id})?`)) {
      deleteProduct(product.id);
      showNotification(`Đã xóa ${product.product_id}`);
    }
  };

  const handleSaveFullProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      const nextPriceStatus = editingProduct.variant1Price > 0 ? 'confirmed' : editingProduct.price_status;
      updateProduct(editingProduct.id, {
        ...editingProduct,
        price_status: nextPriceStatus,
        price_source: 'admin'
      });
      showNotification(`Đã lưu thông tin "${editingProduct.name}"`);
      setEditingProduct(null);
    }
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!editingProduct?.name) return;
    const added = addProduct({
      ...editingProduct,
      product_id: editingProduct.product_id || `P9${String(Date.now()).slice(-5)}`
    });
    showNotification(`Đã thêm sản phẩm mới "${added.name}"`);
    setIsCreatingProduct(false);
    setEditingProduct(null);
  };

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
      showNotification(`Đã nhập thành công ${count} sản phẩm từ CSV!`);
      setImportModalOpen(false);
      setCsvFileContent('');
    } else {
      alert('Không đọc được CSV. Vui lòng kiểm tra định dạng cột.');
    }
  };

  const samplePreviewWatch = useMemo(() => {
    return (
      catalogList.find((p) => p.product_id === 'P000028') ||
      catalogList[0] || {
        product_id: 'P000028',
        brand: 'Rolex',
        name: 'Rolex GMT-Master II Black dial',
        nickname: 'Bruce Wayne',
        collection: 'GMT-Master II',
        modelCode: 'M126710GRNR',
        factory: 'VSF Ultimate Edition',
        dial_color: 'Black',
        caseSize: '40 mm x 12.1 mm',
        material: 'Solid 904L Oystersteel',
        bracelet_or_strap: 'Jubilee Bracelet',
        movement: 'Dandong DD3285 (72h Reserve)',
        waterResistance: '50 Meters (Pressure Tested)',
        primaryImage: 'https://pub-82e156ad04d14534bbbdde8d20f65e25.r2.dev/assets/P000028/P000028-front-006738.webp'
      }
    );
  }, [catalogList]);

  const adminPreviewWaMessage = useMemo(() => {
    return buildWhatsAppQuickProductMessage({
      watch: samplePreviewWatch,
      variantName: 'VS / Clean 1:1 Super Clone',
      quantity: 1,
      templateConfig: tempTemplateCfg
    });
  }, [samplePreviewWatch, tempTemplateCfg]);

  const handleSaveWhatsappDirect = (e) => {
    if (e) e.preventDefault();
    const normalized = normalizeWhatsAppPhone(tempWhatsapp) || DEFAULT_WHATSAPP_NUMBER;
    if (updateWhatsappNumber) {
      updateWhatsappNumber(normalized);
    }
    if (updateWhatsappTemplateConfig) {
      updateWhatsappTemplateConfig(tempTemplateCfg);
    }
    setTempWhatsapp(normalized);
    setIsWhatsappModalOpen(false);
    showNotification(
      `Đã lưu SĐT (${formatWhatsAppDisplayPhone(normalized)}) & cấu hình mẫu tin nhắn gửi WhatsApp!`
    );
  };

  const handleResetWhatsappDefault = () => {
    if (updateWhatsappNumber) {
      updateWhatsappNumber(DEFAULT_WHATSAPP_NUMBER);
    }
    setTempWhatsapp(DEFAULT_WHATSAPP_NUMBER);
    showNotification(`Đã khôi phục SĐT mặc định: ${formatWhatsAppDisplayPhone(DEFAULT_WHATSAPP_NUMBER)}`);
  };

  const handleResetTemplateDefault = () => {
    const defaults = resetWhatsappTemplate ? resetWhatsappTemplate() : { ...DEFAULT_WHATSAPP_TEMPLATE_CONFIG };
    setTempTemplateCfg(defaults);
    showNotification('Đã khôi phục mẫu tin nhắn WhatsApp về mặc định!');
  };

  const handleSaveCloudSettings = async (e) => {
    e.preventDefault();
    if (updateR2PublicUrl) {
      updateR2PublicUrl(tempR2Url);
    }
    const normalizedWa = normalizeWhatsAppPhone(tempWhatsapp) || DEFAULT_WHATSAPP_NUMBER;
    if (updateWhatsappNumber) {
      updateWhatsappNumber(normalizedWa);
    }
    setTempWhatsapp(normalizedWa);
    setIsSettingsOpen(false);
    await syncWithSupabase({ includeUnpublished: true });
    showNotification('Đã lưu cấu hình Supabase + Cloudflare R2 CDN và đồng bộ dữ liệu!');
  };

  if (!isAdminOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950/85 backdrop-blur-md flex flex-col justify-between overflow-y-auto font-sans text-neutral-900">
      {/* Toast Notification */}
      {actionNotice && (
        <div
          className={`fixed top-5 right-5 z-[70] text-white border shadow-2xl px-4 py-3 flex items-center gap-2 text-xs font-mono animate-in slide-in-from-top-3 ${
            actionNotice.type === 'error'
              ? 'bg-crimson-700 border-crimson-400'
              : 'bg-obsidian-900 border-gold-500/50'
          }`}
        >
          {actionNotice.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="bg-obsidian-950 text-white px-3 sm:px-8 py-3 sm:py-3.5 border-b border-white/10 flex items-center justify-between gap-2 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="bg-gold-500/20 text-gold-400 p-2 border border-gold-500/30 flex-shrink-0">
            <Lock className="w-4 h-4 text-gold-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="truncate">CloneWatches Admin CMS</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 font-mono whitespace-nowrap flex-shrink-0">
                V4 Supabase + R2
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-white/50 font-mono truncate">
              773 V4 Products &bull; 6,870 WebP Stills &bull; 39 MP4 Videos &bull; 128 Nicknames
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setActiveAdminView('products');
                  setShowLegacyOnly(false);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  activeAdminView === 'products' && !showLegacyOnly
                    ? 'bg-gold-500 text-obsidian-950'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Catalog ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAdminView('price_review');
                  setShowLegacyOnly(false);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  activeAdminView === 'price_review'
                    ? 'bg-gold-500 text-obsidian-950'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Rà soát giá ({stats.autoMatched + stats.missingPrice})
              </button>
              <button
                type="button"
                onClick={() => setActiveAdminView('import_report')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  activeAdminView === 'import_report'
                    ? 'bg-gold-500 text-obsidian-950'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Báo cáo V4
              </button>
            </div>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-[11px] sm:text-xs text-white/70 hover:text-white px-2.5 py-1.5 border border-white/15 hover:border-white/30 transition-colors whitespace-nowrap"
            >
              Sign Out
            </button>
          )}

          <button
            onClick={handleCloseAdmin}
            className="p-1.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/15 transition-colors border border-white/10 flex-shrink-0"
            title="Close Admin Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-6 lg:p-8">
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
                Nhập mã bảo mật Admin để quản trị Catalog V4 (773 sản phẩm), duyệt giá tự khớp và đồng bộ Supabase + Cloudflare R2.
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
                <div
                  className={`p-2.5 text-xs border flex items-center gap-2 ${
                    lockoutSeconds > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-crimson-50 text-crimson-700 border-crimson-200'
                  }`}
                >
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
                <span>{lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Unlock CMS Dashboard'}</span>
              </button>

              <div className="bg-obsidian-800/5 p-3 border border-obsidian-800/10 text-[11px] text-obsidian-800/70 font-mono text-center">
                Demo Security PIN: <strong className="text-obsidian-950">888888</strong>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Warning banner if R2_PUBLIC_URL is set to the S3 API host instead of pub-*.r2.dev */}
            {isS3EndpointWarning && (
              <div className="bg-amber-50 border border-amber-400 p-3.5 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold uppercase tracking-wider block">
                      Lưu ý URL Public của Cloudflare R2
                    </strong>
                    <span>
                      Toàn bộ 6.948 file V4 đã upload lên bucket <code className="font-mono font-bold">watch-saas-media</code>, nhưng URL hiện tại đang là S3 Endpoint (<code className="font-mono">{r2PublicUrl}</code>). Hãy bấm <strong>Cloudflare R2 &amp; DB Setup</strong> để dán link <code className="font-mono">https://pub-xxxx.r2.dev</code> của bucket.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-1.5 bg-obsidian-950 hover:bg-obsidian-800 text-gold-400 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap border border-gold-500/40"
                >
                  Cập nhật R2 Public URL
                </button>
              </div>
            )}

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setActiveAdminView('products');
                  setShowLegacyOnly(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase whitespace-nowrap border ${
                  activeAdminView === 'products' && !showLegacyOnly
                    ? 'bg-obsidian-950 text-gold-400 border-obsidian-950'
                    : 'bg-white text-obsidian-800 border-obsidian-800/20'
                }`}
              >
                Catalog ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAdminView('price_review');
                  setShowLegacyOnly(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase whitespace-nowrap border ${
                  activeAdminView === 'price_review'
                    ? 'bg-obsidian-950 text-gold-400 border-obsidian-950'
                    : 'bg-white text-obsidian-800 border-obsidian-800/20'
                }`}
              >
                Rà soát giá ({stats.autoMatched + stats.missingPrice})
              </button>
              <button
                type="button"
                onClick={() => setActiveAdminView('import_report')}
                className={`px-3 py-1.5 text-xs font-bold uppercase whitespace-nowrap border ${
                  activeAdminView === 'import_report'
                    ? 'bg-obsidian-950 text-gold-400 border-obsidian-950'
                    : 'bg-white text-obsidian-800 border-obsidian-800/20'
                }`}
              >
                Báo cáo V4
              </button>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white border border-obsidian-800/15 p-3.5 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-obsidian-800 uppercase font-bold">
                  <span>V4 Products</span>
                  <Package className="w-4 h-4 text-gold-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-obsidian-950 mt-1">
                  {stats.total}
                </div>
                <div className="text-[11px] text-obsidian-800 mt-1 font-mono font-medium">
                  {stats.uniqueBrands} Brands &bull; {stats.withNickname} Nicknames
                </div>
              </div>

              <div className="bg-white border border-obsidian-800/15 p-3.5 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-emerald-800 uppercase font-bold">
                  <span>Chế Độ Báo Giá</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-800 mt-1">
                  Giá: Liên hệ
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 font-mono font-medium">
                  1-Click đẩy thông tin qua WhatsApp
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveAdminView('products');
                  setSelectedBrand('(Blank Brand)');
                  setShowLegacyOnly(false);
                }}
                className="bg-white hover:bg-amber-50 border border-obsidian-800/15 p-3.5 sm:p-4 shadow-sm cursor-pointer transition-colors"
                title="Bấm để lọc các sản phẩm thiếu brand"
              >
                <div className="flex items-center justify-between text-xs text-amber-900 uppercase font-bold">
                  <span>Cần Bổ Sung Brand</span>
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-900 mt-1">
                  {stats.missingBrand}
                </div>
                <div className="text-[11px] text-amber-900 mt-1 font-mono font-medium">
                  Trống brand: {stats.missingBrand} &bull; Xuất bản: {stats.published}
                </div>
              </div>

              <div
                onClick={() => setIsSettingsOpen(true)}
                className="bg-white hover:bg-neutral-50 border border-obsidian-800/15 p-3.5 sm:p-4 shadow-sm cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-obsidian-800 uppercase font-bold">
                  <span>Supabase + R2 CDN</span>
                  <Database className="w-4 h-4 text-gold-600" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      syncStatus === 'SUCCESS'
                        ? 'bg-emerald-600'
                        : syncStatus === 'SYNCING'
                        ? 'bg-gold-500 animate-pulse'
                        : 'bg-amber-600'
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-bold font-mono text-obsidian-950 uppercase truncate">
                    {syncStatus === 'SUCCESS' ? 'SUPABASE LIVE' : 'V4 SNAPSHOT + R2'}
                  </span>
                </div>
                <div className="text-[10px] text-obsidian-800 font-mono font-medium mt-1 truncate">
                  {stats.totalImages.toLocaleString()} ảnh &bull; {stats.totalVideos} video trên R2
                </div>
              </div>

              <div
                onClick={() => setIsWhatsappModalOpen(true)}
                className="col-span-2 md:col-span-1 bg-white hover:bg-neutral-50 border-2 border-emerald-700 p-3.5 sm:p-4 shadow-sm cursor-pointer transition-colors group"
                title="Bấm để cài đặt nhanh số điện thoại WhatsApp nhận đơn hàng"
              >
                <div className="flex items-center justify-between text-xs text-emerald-800 uppercase font-extrabold">
                  <span>WhatsApp Owner</span>
                  <WhatsAppIcon className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-sm sm:text-base font-extrabold font-mono text-obsidian-950 mt-1.5 truncate">
                  {activeFormattedPhone}
                </div>
                <div className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center justify-between gap-1">
                  <span className="truncate">{WHATSAPP_CONTACT_NAME}</span>
                  <span className="underline group-hover:text-obsidian-950 flex-shrink-0">Sửa SĐT &rarr;</span>
                </div>
              </div>
            </div>

            {/* ===================== VIEW: IMPORT REPORT (Product Doc §6.4) ===================== */}
            {activeAdminView === 'import_report' && (
              <div className="bg-white border border-obsidian-800/15 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-obsidian-800/10">
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-obsidian-950">
                      Báo Cáo Lô Import Gói Ảnh Chính V4 &amp; Auto-Matching Giá
                    </h2>
                    <p className="text-xs text-obsidian-800/60 font-mono">
                      Batch ID: {importBatchReport?.batch_id || 'V4-2026-11-16-NICKNAMES'} &bull; Bucket R2: watch-saas-media
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAdminView('products')}
                    className="px-3 py-1.5 bg-obsidian-950 text-white text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
                  >
                    &larr; Quay lại Danh sách Product
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-neutral-50 border border-obsidian-800/10 space-y-1.5">
                    <div className="font-bold uppercase text-obsidian-800/60">Toàn vẹn Media V4 &amp; R2</div>
                    <div className="text-lg font-extrabold font-mono text-obsidian-950">
                      773 Product &bull; 6.870 Ảnh &bull; 39 Video
                    </div>
                    <p className="text-emerald-700 font-semibold">
                      ✔ 6.948 / 6.948 file trên Cloudflare R2 khớp 100% SHA-256 (asset_manifest.json)
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                    <div className="font-bold uppercase text-emerald-900">Kết Quả Tự Động Nối Giá (D11 / BR-10)</div>
                    <div className="text-lg font-extrabold font-mono text-emerald-800">
                      {stats.autoMatched + stats.confirmedPrice} / {stats.total} Product có giá
                    </div>
                    <p className="text-emerald-800/80">
                      Khớp trực tiếp mẫu: 193 SP &bull; Khớp theo bộ sưu tập/thương hiệu đồng giá: 564 SP
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/60 border border-amber-200 space-y-1.5">
                    <div className="font-bold uppercase text-amber-900">Ngoại Lệ Cần Admin Kiểm Tra</div>
                    <div className="text-lg font-extrabold font-mono text-amber-800">
                      {stats.missingPrice} SP chưa có giá &bull; {stats.missingBrand} SP trống brand
                    </div>
                    <p className="text-amber-900/80">
                      CMS cũ ngoài V4 (Panerai, Breitling, Cartier...) đang tạm ẩn (BR-11)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminView('products');
                      setSelectedPriceStatus('missing');
                      setSelectedBrand('All');
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Xem {stats.missingPrice} Product chưa có giá
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminView('products');
                      setSelectedBrand('(Blank Brand)');
                      setSelectedPriceStatus('All');
                    }}
                    className="px-3.5 py-2 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-bold uppercase tracking-wider"
                  >
                    Xem {stats.missingBrand} Product thiếu Brand
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="bg-white border border-obsidian-800/10 p-3.5 sm:p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      brand: 'Rolex',
                      collection: 'Submariner',
                      modelCode: `P90${Math.floor(1000 + Math.random() * 9000)}`,
                      variant1Name: 'Swiss Movement',
                      variant1Price: 700,
                      variant2Name: 'VS / Clean 1:1 Super Clone',
                      variant2Price: 1199,
                      caseSize: '41mm',
                      movement: 'Super Clone Dandong 3235 Movement',
                      material: 'Solid 904L Oystersteel',
                      waterResistance: '50m / 5 ATM Tested',
                      primaryImage: '/figma-assets/watches/watch-0.png',
                      galleryImages: ['/figma-assets/watches/watch-0.png'],
                      description: 'Custom Swiss Dandong movement, authentic sapphire glass, ceramic bezel.',
                      stock: 'IN_STOCK'
                    });
                    setIsCreatingProduct(true);
                  }}
                  className="px-3 py-2 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Watch</span>
                </button>

                <button
                  onClick={exportCatalog}
                  className="px-3 py-2 bg-white hover:bg-obsidian-800/5 text-obsidian-950 text-xs font-bold uppercase tracking-wider border border-obsidian-800/20 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-gold-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setImportModalOpen(true)}
                  className="px-3 py-2 bg-white hover:bg-obsidian-800/5 text-obsidian-950 text-xs font-bold uppercase tracking-wider border border-obsidian-800/20 transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-obsidian-700" />
                  <span>Import CSV</span>
                </button>

                <button
                  onClick={() => setIsWhatsappModalOpen(true)}
                  className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border-2 border-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp ({activeFormattedPhone})</span>
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-2 bg-gold-50 hover:bg-gold-100 text-gold-950 text-xs font-bold uppercase tracking-wider border border-gold-300 transition-all flex items-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5 text-gold-700" />
                  <span>Cloudflare R2 &amp; DB Setup</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Khôi phục dữ liệu V4 gốc (773 Product + giá tự khớp)?')) {
                      const count = resetToMasterCatalog();
                      showNotification(`Đã khôi phục ${count} Product V4!`);
                    }
                  }}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-obsidian-900 text-xs font-bold uppercase tracking-wider border border-obsidian-800/15 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset V4 Snapshot</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => syncWithSupabase({ includeUnpublished: true })}
                  disabled={syncStatus === 'SYNCING'}
                  className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border flex items-center gap-2 transition-all ${
                    syncStatus === 'SYNCING'
                      ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                      : 'bg-white hover:bg-obsidian-950 hover:text-white text-obsidian-950 border-obsidian-800/20'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                  <span>{syncStatus === 'SYNCING' ? 'Syncing...' : 'Sync Supabase'}</span>
                </button>
              </div>
            </div>

            {/* Bulk Action Bar (appears when items selected — Product Doc §6.1) */}
            {selectedIds.length > 0 && (
              <div className="bg-obsidian-950 text-white p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 border border-gold-500/40">
                <div className="text-xs font-mono">
                  Đã chọn <strong className="text-gold-400">{selectedIds.length}</strong> sản phẩm
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBulkApprovePrices}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    ✔ Duyệt giá đã chọn
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkPublish}
                    className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-extrabold uppercase tracking-wider"
                  >
                    Xuất bản lên Storefront
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkUnpublish}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Gỡ xuất bản
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-2.5 py-1.5 text-xs text-white/70 hover:text-white"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
            )}

            {/* Quick Inline WhatsApp Phone Setup Bar */}
            <form
              onSubmit={handleSaveWhatsappDirect}
              className="bg-white border-2 border-emerald-700 p-3.5 sm:p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-obsidian-950">
                      Cài Đặt Nhanh Số Điện Thoại WhatsApp Nhận Đơn Hàng
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-800 text-white">
                      Đang dùng: {activeFormattedPhone}
                    </span>
                  </div>
                  <p className="text-[11px] text-obsidian-800 font-medium mt-0.5">
                    Nhập SĐT dạng <code className="font-mono bg-neutral-100 text-obsidian-950 px-1 border border-obsidian-800/20">0977889986</code> hoặc <code className="font-mono bg-neutral-100 text-obsidian-950 px-1 border border-obsidian-800/20">+84 97 788 99 86</code> — tự động chuẩn hóa sang <code className="font-mono font-bold text-emerald-800">wa.me/{previewCleanPhone}</code>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Phone className="w-3.5 h-3.5 text-obsidian-800 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tempWhatsapp}
                    onChange={(e) => setTempWhatsapp(e.target.value)}
                    placeholder="VD: 0977889986 hoặc 84977889986"
                    className="w-full bg-white border border-obsidian-800/30 focus:border-emerald-700 focus:outline-none pl-8 pr-3 py-2 text-xs font-mono font-bold text-obsidian-950"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lưu SĐT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWhatsappModalOpen(true)}
                  className="px-3 py-2 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa Mẫu Tin Gửi</span>
                </button>

                <a
                  href={generateWhatsAppUrl(adminPreviewWaMessage, previewCleanPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white hover:bg-neutral-100 text-emerald-800 border border-emerald-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Chat</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetWhatsappDefault}
                  className="px-2.5 py-2 bg-white hover:bg-neutral-100 text-obsidian-900 hover:text-obsidian-950 border border-obsidian-800/30 text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Mặc định</span>
                </button>
              </div>
            </form>

            {/* Filters & Search Row (Product Doc §6.1) */}
            <div className="bg-white border border-obsidian-800/10 p-3.5 sm:p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm Product ID (P000001), Nickname, Tên..."
                  className="w-full bg-neutral-50/60 border border-obsidian-800/15 pl-9 pr-3 py-2 text-xs text-obsidian-950 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Brand Filter */}
                <div className="flex items-center gap-1 text-xs text-obsidian-800/70">
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
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Status Filter (BR-17) */}
                <div className="flex items-center gap-1 text-xs text-obsidian-800/70">
                  <span className="font-semibold uppercase text-[10px]">Giá:</span>
                  <select
                    value={selectedPriceStatus}
                    onChange={(e) => {
                      setSelectedPriceStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-neutral-50/60 border border-obsidian-800/15 px-2 py-1.5 text-xs text-obsidian-950 font-medium focus:outline-none"
                  >
                    <option value="All">Tất cả giá</option>
                    <option value="auto_matched">Tự khớp ({stats.autoMatched})</option>
                    <option value="confirmed">Đã duyệt ({stats.confirmedPrice})</option>
                    <option value="missing">Chưa có giá ({stats.missingPrice})</option>
                  </select>
                </div>

                {/* Publication Status Filter (BR-05/BR-06) */}
                <div className="flex items-center gap-1 text-xs text-obsidian-800/70">
                  <span className="font-semibold uppercase text-[10px]">Xuất bản:</span>
                  <select
                    value={selectedPubStatus}
                    onChange={(e) => {
                      setSelectedPubStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-neutral-50/60 border border-obsidian-800/15 px-2 py-1.5 text-xs text-obsidian-950 font-medium focus:outline-none"
                  >
                    <option value="All">Tất cả ({stats.total})</option>
                    <option value="published">Đã xuất bản ({stats.published})</option>
                    <option value="unpublished">Chưa xuất bản ({stats.unpublished})</option>
                  </select>
                </div>

                {/* Stock Filter */}
                <div className="flex items-center gap-1 text-xs text-obsidian-800/70">
                  <span className="font-semibold uppercase text-[10px]">Kho:</span>
                  <select
                    value={selectedStock}
                    onChange={(e) => {
                      setSelectedStock(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-neutral-50/60 border border-obsidian-800/15 px-2 py-1.5 text-xs text-obsidian-950 font-medium focus:outline-none"
                  >
                    <option value="All">Tất cả</option>
                    <option value="IN_STOCK">Còn hàng</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                  </select>
                </div>

                {/* Legacy toggle (BR-11) */}
                {stats.legacyCount > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-obsidian-800 cursor-pointer select-none px-2 py-1 bg-neutral-100 border border-obsidian-800/15">
                    <input
                      type="checkbox"
                      checked={showLegacyOnly}
                      onChange={(e) => {
                        setShowLegacyOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                    />
                    <span>Legacy ẩn ({stats.legacyCount})</span>
                  </label>
                )}
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white border border-obsidian-800/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-obsidian-800/10">
                  <thead className="bg-obsidian-950 text-white font-mono uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <button
                          type="button"
                          onClick={toggleSelectAllPage}
                          className="text-white/80 hover:text-gold-400 flex items-center"
                          title="Chọn tất cả trang này"
                        >
                          {paginatedProducts.length > 0 &&
                          paginatedProducts.every((p) => selectedIds.includes(p.id)) ? (
                            <CheckSquare className="w-4 h-4 text-gold-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-3">Product V4 / Nickname</th>
                      <th className="py-3 px-3">Brand / Series</th>
                      <th className="py-3 px-3">Giá (Swiss / 1:1) &amp; Nguồn</th>
                      <th className="py-3 px-3 text-center">Media R2</th>
                      <th className="py-3 px-3 text-center">Xuất Bản (BR-06)</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian-800/5">
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((p) => {
                        const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.primaryImage || '');
                        const isSelected = selectedIds.includes(p.id);
                        const isPublished = p.publication_status === 'published';
                        const gate = evaluatePublishGate ? evaluatePublishGate(p) : { canPublish: p.canPublish, reasons: p.publishBlockReasons || [] };

                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-neutral-50/80 transition-colors ${
                              isSelected ? 'bg-gold-50/30' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => toggleSelectId(p.id)}
                                className="text-obsidian-800/60 hover:text-obsidian-950"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-obsidian-950" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* Watch info & thumbnail */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={img}
                                  alt={p.name}
                                  className="w-12 h-12 object-cover border border-obsidian-800/10 flex-shrink-0 bg-neutral-100"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/figma-assets/watches/watch-0.png';
                                  }}
                                />
                                <div className="max-w-xs sm:max-w-md">
                                  <div className="font-bold text-obsidian-950 line-clamp-1">
                                    {p.name}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-mono font-bold text-obsidian-800 bg-neutral-100 px-1.5 py-0.2 border border-obsidian-800/10">
                                      {p.product_id}
                                    </span>
                                    {p.nickname && (
                                      <span
                                        className="text-[10px] font-bold bg-obsidian-950 text-gold-400 px-1.5 py-0.2"
                                        title="Nickname mô tả kiểu dáng (BR-08)"
                                      >
                                        &ldquo;{p.nickname}&rdquo;
                                      </span>
                                    )}
                                    {p.dial_color && (
                                      <span className="text-[10px] text-obsidian-800 font-mono">
                                        &bull; {p.dial_color}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Brand / Series */}
                            <td className="py-3 px-3 font-mono">
                              {p.brand ? (
                                <span className="font-bold text-obsidian-950 block">{p.brand}</span>
                              ) : (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 border border-amber-300 inline-block">
                                  ⚠ Thiếu Brand
                                </span>
                              )}
                              <span className="text-[10px] text-gold-700 block">
                                {p.collection || p.model || '—'}
                              </span>
                            </td>

                            {/* Price -> Contact for Price Mode ("Giá: Liên hệ") */}
                            <td className="py-3 px-3">
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-700/30 text-emerald-800 font-bold text-xs">
                                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Giá: Liên hệ</span>
                              </div>
                              <div className="text-[10px] text-obsidian-800 font-mono mt-1">
                                1-Click đẩy thông số qua WhatsApp
                              </div>
                            </td>

                            {/* Media readiness & counts */}
                            <td className="py-3 px-3 text-center font-mono">
                              <div className="inline-flex items-center gap-2 text-[11px]">
                                <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold" title="Số ảnh WebP đã duyệt">
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  {p.image_count || p.images?.length || 0}
                                </span>
                                {(p.video_count > 0 || (p.videos && p.videos.length > 0)) && (
                                  <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold" title="Có video MP4 + poster (BR-04)">
                                    <Film className="w-3.5 h-3.5" />
                                    {p.video_count || p.videos.length}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Publication Gate & Toggle (BR-05 / BR-06) */}
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(p)}
                                title={
                                  isPublished
                                    ? 'Đang hiển thị trên Storefront — bấm để gỡ xuất bản'
                                    : gate.canPublish
                                    ? 'Đủ điều kiện BR-06 — bấm để xuất bản lên Storefront'
                                    : `Bị khóa xuất bản: ${gate.reasons.join('; ')}`
                                }
                                className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border transition-colors inline-flex items-center gap-1 ${
                                  isPublished
                                    ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                                    : gate.canPublish
                                    ? 'bg-white text-obsidian-900 border-obsidian-800/30 hover:bg-obsidian-950 hover:text-white'
                                    : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                                }`}
                              >
                                {isPublished ? (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    <span>Đã XB</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
                                    <span>{gate.canPublish ? 'Chưa XB' : 'Khóa XB'}</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStock(p)}
                                  className={`px-1.5 py-0.5 text-[10px] font-mono border ${
                                    p.stock === 'OUT_OF_STOCK'
                                      ? 'bg-crimson-50 text-crimson-700 border-crimson-200'
                                      : 'bg-neutral-50 text-obsidian-800 border-obsidian-800/15'
                                  }`}
                                  title="Đổi trạng thái Còn hàng / Hết hàng"
                                >
                                  {p.stock === 'OUT_OF_STOCK' ? 'Hết' : 'Kho ✔'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct({ ...p })}
                                  className="p-1.5 hover:bg-obsidian-800/10 text-obsidian-800 hover:text-obsidian-950 transition-colors"
                                  title="Chỉnh sửa chi tiết sản phẩm"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 hover:bg-crimson-50 text-obsidian-800/40 hover:text-crimson-600 transition-colors"
                                  title="Xóa sản phẩm"
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
                        <td colSpan={7} className="py-12 text-center text-obsidian-800/60">
                          Không tìm thấy sản phẩm khớp bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar */}
              <div className="p-4 border-t border-obsidian-800/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-obsidian-800 font-mono font-medium">
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

      {/* ===================== DEDICATED WHATSAPP PHONE & MESSAGE TEMPLATE SETUP MODAL ===================== */}
      {isWhatsappModalOpen && (
        <div className="fixed inset-0 z-60 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white max-w-4xl w-full border border-obsidian-800/20 shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-start justify-between gap-2 border-b pb-3 border-obsidian-800/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-obsidian-950 leading-snug">
                    Cài Đặt Số Điện Thoại &amp; Điều Chỉnh Mẫu Tin Nhắn Gửi WhatsApp
                  </h3>
                  <p className="text-[11px] text-obsidian-800 truncate">
                    {WHATSAPP_CONTACT_NAME} &bull; Cho phép bật/tắt thông số hoặc tự soạn mẫu tin nhắn theo biến động
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsappModalOpen(false)}
                className="p-1 text-obsidian-800 hover:text-obsidian-950 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWhatsappDirect} className="space-y-5">
              {/* Section 1: Phone Number */}
              <div className="p-3.5 bg-neutral-50 border border-obsidian-800/15 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-obsidian-950">
                    1. Số Điện Thoại WhatsApp Nhận Đơn Hàng:
                  </label>
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    Đang hiển thị: {previewFormattedPhone} (wa.me/{previewCleanPhone})
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={tempWhatsapp}
                    onChange={(e) => setTempWhatsapp(e.target.value)}
                    placeholder="VD: 0977889986 hoặc +84 97 788 99 86"
                    className="w-full sm:flex-1 p-2.5 text-sm font-mono font-bold bg-white border border-obsidian-800/30 focus:border-emerald-700 focus:outline-none min-w-0 text-obsidian-950"
                  />
                  <button
                    type="button"
                    onClick={() => setTempWhatsapp(DEFAULT_WHATSAPP_NUMBER)}
                    className="px-3 py-2 text-xs font-semibold bg-white border border-obsidian-800/30 hover:bg-neutral-100 text-obsidian-900 whitespace-nowrap flex-shrink-0"
                  >
                    Khôi phục SĐT mặc định
                  </button>
                </div>
              </div>

              {/* Section 2: Message Template Mode & Field Toggles */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 border-obsidian-800/10">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-obsidian-950">
                      2. Điều Chỉnh Nội Dung Tin Nhắn Gửi WhatsApp:
                    </span>
                    <button
                      type="button"
                      onClick={handleResetTemplateDefault}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi phục mẫu mặc định</span>
                    </button>
                  </div>

                  {/* Mode Switch: Structured vs Full Raw Template */}
                  <div className="flex items-center gap-2 bg-neutral-100 p-1.5 border border-obsidian-800/15 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setTempTemplateCfg((prev) => ({ ...prev, useCustomRawTemplate: false }))
                      }
                      className={`flex-1 py-1.5 px-2 font-bold transition-colors cursor-pointer ${
                        !tempTemplateCfg.useCustomRawTemplate
                          ? 'bg-obsidian-950 text-white shadow-xs'
                          : 'text-obsidian-800 hover:text-obsidian-950'
                      }`}
                    >
                      Chế độ Bật/Tắt Trường &amp; Sửa Nhanh
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTempTemplateCfg((prev) => ({ ...prev, useCustomRawTemplate: true }))
                      }
                      className={`flex-1 py-1.5 px-2 font-bold transition-colors cursor-pointer ${
                        tempTemplateCfg.useCustomRawTemplate
                          ? 'bg-obsidian-950 text-white shadow-xs'
                          : 'text-obsidian-800 hover:text-obsidian-950'
                      }`}
                    >
                      Chế độ Tự Soạn Mẫu Tự Do (Raw Template)
                    </button>
                  </div>

                  {!tempTemplateCfg.useCustomRawTemplate ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-obsidian-950 mb-1">
                            Tiêu đề đầu tin nhắn:
                          </label>
                          <input
                            type="text"
                            value={tempTemplateCfg.headerTitle || ''}
                            onChange={(e) =>
                              setTempTemplateCfg((prev) => ({ ...prev, headerTitle: e.target.value }))
                            }
                            className="w-full p-2 text-xs border border-obsidian-800/30 bg-white text-obsidian-950 focus:outline-none focus:border-emerald-700"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-obsidian-950 mb-1">
                            Nhãn dòng Giá (Price):
                          </label>
                          <input
                            type="text"
                            value={tempTemplateCfg.priceLabel || ''}
                            onChange={(e) =>
                              setTempTemplateCfg((prev) => ({ ...prev, priceLabel: e.target.value }))
                            }
                            className="w-full p-2 text-xs border border-obsidian-800/30 bg-white text-obsidian-950 focus:outline-none focus:border-emerald-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-obsidian-950 mb-1.5">
                          Chọn các thông số đồng hồ muốn đẩy qua WhatsApp:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-neutral-50 border border-obsidian-800/15">
                          {[
                            { key: 'includeTimestamp', label: 'Thời gian gửi' },
                            { key: 'includeProductId', label: 'Mã Product ID' },
                            { key: 'includeNickname', label: 'Nickname' },
                            { key: 'includeCollection', label: 'Bộ sưu tập / Dòng' },
                            { key: 'includeRef', label: 'Mã Ref / SPU' },
                            { key: 'includeFactory', label: 'Nhà máy (Factory)' },
                            { key: 'includeVariant', label: 'Phiên bản máy' },
                            { key: 'includeDial', label: 'Màu mặt số (Dial)' },
                            { key: 'includeCaseSize', label: 'Kích thước vỏ' },
                            { key: 'includeCaseMaterial', label: 'Chất liệu vỏ' },
                            { key: 'includeBracelet', label: 'Dây đeo' },
                            { key: 'includeMovement', label: 'Bộ máy (Calibre)' },
                            { key: 'includeWaterResistance', label: 'Chống nước' },
                            { key: 'includeImageUrl', label: 'Link ảnh R2 CDN' },
                            { key: 'includeProductUrl', label: 'Link sản phẩm' },
                            { key: 'includeServicesBlock', label: 'Khối Dịch vụ' }
                          ].map((item) => (
                            <label
                              key={item.key}
                              className="flex items-center gap-1.5 text-[11px] font-semibold text-obsidian-900 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(tempTemplateCfg[item.key])}
                                onChange={(e) =>
                                  setTempTemplateCfg((prev) => ({
                                    ...prev,
                                    [item.key]: e.target.checked
                                  }))
                                }
                              />
                              <span>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {tempTemplateCfg.includeServicesBlock && (
                        <div>
                          <label className="block font-bold text-obsidian-950 mb-1">
                            Nội dung khối Dịch vụ yêu cầu:
                          </label>
                          <textarea
                            rows={3}
                            value={tempTemplateCfg.servicesText || ''}
                            onChange={(e) =>
                              setTempTemplateCfg((prev) => ({ ...prev, servicesText: e.target.value }))
                            }
                            className="w-full p-2 text-[11px] font-mono border border-obsidian-800/30 bg-white text-obsidian-950 focus:outline-none focus:border-emerald-700"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block font-bold text-obsidian-950 mb-1">
                          Câu chào cuối tin nhắn (Hỗ trợ biến <code className="font-mono">{'{{product_id}}'}</code>, <code className="font-mono">{'{{brand}}'}</code>, <code className="font-mono">{'{{title}}'}</code>, <code className="font-mono">{'{{variant}}'}</code>):
                        </label>
                        <textarea
                          rows={2}
                          value={tempTemplateCfg.closingMessageTemplate || ''}
                          onChange={(e) =>
                            setTempTemplateCfg((prev) => ({
                              ...prev,
                              closingMessageTemplate: e.target.value
                            }))
                          }
                          className="w-full p-2 text-[11px] font-mono border border-obsidian-800/30 bg-white text-obsidian-950 focus:outline-none focus:border-emerald-700"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="block font-bold text-obsidian-950 mb-1">
                          Bấm vào biến bên dưới để chèn nhanh vào mẫu tin nhắn:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {WHATSAPP_TEMPLATE_VARIABLES.map((v) => (
                            <button
                              key={v.token}
                              type="button"
                              onClick={() =>
                                setTempTemplateCfg((prev) => ({
                                  ...prev,
                                  customRawTemplate: `${prev.customRawTemplate || ''}\n${v.token}`
                                }))
                              }
                              title={v.label}
                              className="px-2 py-1 bg-neutral-100 hover:bg-emerald-50 text-obsidian-950 hover:text-emerald-800 border border-obsidian-800/20 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              + {v.token}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-obsidian-950 mb-1">
                          Nội dung mẫu tin nhắn tự do (Raw Template):
                        </label>
                        <textarea
                          rows={11}
                          value={tempTemplateCfg.customRawTemplate || ''}
                          onChange={(e) =>
                            setTempTemplateCfg((prev) => ({
                              ...prev,
                              customRawTemplate: e.target.value
                            }))
                          }
                          className="w-full p-2.5 text-[11px] font-mono border border-obsidian-800/30 bg-white text-obsidian-950 focus:outline-none focus:border-emerald-700 leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-neutral-50 border border-obsidian-800/15 p-3.5 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-obsidian-950">
                      <span>Bản Xem Trước Tin Nhắn (Live Preview)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-800 text-white rounded">
                        {samplePreviewWatch.product_id || 'P000028'}
                      </span>
                    </div>
                    <pre className="p-3 bg-white border border-obsidian-800/20 text-[11px] font-mono text-obsidian-950 whitespace-pre-wrap break-words max-h-80 overflow-y-auto leading-relaxed">
                      {adminPreviewWaMessage}
                    </pre>
                  </div>

                  <p className="text-[11px] text-obsidian-800 leading-relaxed">
                    ⓘ Ngoài mẫu chuẩn tại đây, trên trang chi tiết đồng hồ và trang giỏ hàng khách hàng cũng có khung <strong>&ldquo;Điều chỉnh nội dung tin gửi WhatsApp&rdquo;</strong> để sửa trực tiếp hoặc thêm ghi chú trước khi bấm gửi.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-obsidian-800/10">
                <a
                  href={generateWhatsAppUrl(adminPreviewWaMessage, previewCleanPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-800 hover:underline whitespace-nowrap py-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Gửi thử mẫu tin nhắn này qua WhatsApp ({previewFormattedPhone})</span>
                </a>

                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsWhatsappModalOpen(false)}
                    className="px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-obsidian-800 hover:text-obsidian-950 border border-obsidian-800/20 sm:border-0 whitespace-nowrap"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer whitespace-nowrap"
                  >
                    Lưu Số Điện Thoại &amp; Mẫu Tin Nhắn
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CLOUDFLARE R2 & SUPABASE SETTINGS MODAL ===================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-60 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full border border-obsidian-800/20 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-obsidian-800/10">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-gold-600" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-obsidian-950">
                  Cấu Hình Supabase Postgres &amp; Cloudflare R2 Media CDN
                </h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)}>
                <X className="w-5 h-5 text-obsidian-800/60 hover:text-obsidian-950" />
              </button>
            </div>

            <form onSubmit={handleSaveCloudSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-1">
                  Cloudflare R2 Public Development URL (<code className="font-mono">pub-xxxx.r2.dev</code> hoặc Custom Domain):
                </label>
                <input
                  type="text"
                  value={tempR2Url}
                  onChange={(e) => setTempR2Url(e.target.value)}
                  placeholder="https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev"
                  className="w-full p-2.5 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                />
                <p className="text-[11px] text-obsidian-800/60 mt-1">
                  Lấy tại Cloudflare Dashboard &rarr; R2 &rarr; <code className="font-mono">watch-saas-media</code> &rarr; Settings &rarr; Public Development URL. Hệ thống tự động ghép với đường dẫn <code className="font-mono">assets/P000001/...</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-1">
                  Sales WhatsApp Phone Number:
                </label>
                <input
                  type="text"
                  value={tempWhatsapp}
                  onChange={(e) => setTempWhatsapp(e.target.value)}
                  placeholder="84977889986 (+84 97 788 99 86)"
                  className="w-full p-2.5 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="bg-obsidian-800/5 p-4 border border-obsidian-800/10 text-xs space-y-1.5 font-mono">
                <div className="font-bold uppercase text-obsidian-950">Trạng thái hạ tầng hiện tại:</div>
                <div>&bull; Supabase URL: https://nuhgccxcwlrsbbcxpskn.supabase.co</div>
                <div>&bull; R2 Bucket: watch-saas-media (6.948 / 6.948 files uploaded)</div>
                <div>&bull; Migration SQL: supabase/migrations/20261121000001_init_catalog_v4.sql</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-obsidian-800/60 hover:text-obsidian-950"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md"
                >
                  Lưu &amp; Đồng Bộ Ngay
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
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-obsidian-950">
                  {isCreatingProduct ? 'Add New Timepiece' : `${editingProduct?.product_id} · ${editingProduct?.name}`}
                </h3>
                {!isCreatingProduct && editingProduct && (
                  <p className="text-[11px] font-mono text-obsidian-800/60 mt-0.5">
                    Ảnh V4: {editingProduct.image_count || editingProduct.images?.length || 0} &bull; Video: {editingProduct.video_count || editingProduct.videos?.length || 0}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreatingProduct(false);
                }}
              >
                <X className="w-5 h-5 text-obsidian-800/60 hover:text-obsidian-950" />
              </button>
            </div>

            <form onSubmit={isCreatingProduct ? handleCreateProduct : handleSaveFullProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Watch Title:</label>
                  <input
                    type="text"
                    required
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value, title: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Nickname (BR-08):</label>
                  <input
                    type="text"
                    value={editingProduct?.nickname || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nickname: e.target.value })}
                    placeholder="VD: Pepsi, Spectre..."
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Brand (bắt buộc để XB):</label>
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
                    value={editingProduct?.variant1Price || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, variant1Price: parseFloat(e.target.value) || 0 })
                    }
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
                    value={editingProduct?.variant2Price || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, variant2Price: parseFloat(e.target.value) || 0 })
                    }
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
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Publication Status:</label>
                  <select
                    value={editingProduct?.publication_status || 'unpublished'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, publication_status: e.target.value })}
                    className="w-full p-2 text-xs border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="unpublished">Unpublished (Nháp)</option>
                    <option value="published">Published (Xuất bản)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Hero Image Relative Path / URL:
                </label>
                <input
                  type="text"
                  value={editingProduct?.hero_image || editingProduct?.primaryImage || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, hero_image: e.target.value, primaryImage: e.target.value })
                  }
                  className="w-full p-2 text-xs font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Full Product Description:
                </label>
                <textarea
                  rows={6}
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 text-[11px] font-mono border border-obsidian-800/20 focus:border-gold-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-obsidian-800/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsCreatingProduct(false);
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-obsidian-800/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-obsidian-950 hover:bg-gold-500 text-white hover:text-obsidian-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md"
                >
                  {isCreatingProduct ? 'Create Watch' : 'Save & Confirm Price'}
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
              Upload file CSV UTF-8 chứa danh mục sản phẩm (Product ID, Brand, Collection, Title, Variant 1, Variant 2...).
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
