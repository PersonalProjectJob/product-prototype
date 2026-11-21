/**
 * src/services/supabaseService.js
 * Central service for Supabase Postgres REST API & Cloudflare R2 Media Resolution.
 * No raw fetch() in UI components per frontend-code-standards.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://nuhgccxcwlrsbbcxpskn.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const DEFAULT_R2_PUBLIC_URL = (import.meta.env.VITE_R2_PUBLIC_URL || '').replace(/\/$/, '');

const R2_CONFIG_STORAGE_KEY = 'cw_r2_public_url';

export function getR2PublicBaseUrl() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(R2_CONFIG_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/$/, '');
    }
  }
  return DEFAULT_R2_PUBLIC_URL;
}

export function setR2PublicBaseUrl(url) {
  if (typeof window === 'undefined') return;
  const clean = String(url || '').trim().replace(/\/$/, '');
  if (clean) {
    localStorage.setItem(R2_CONFIG_STORAGE_KEY, clean);
  } else {
    localStorage.removeItem(R2_CONFIG_STORAGE_KEY);
  }
}

export function isS3ApiEndpointInsteadOfPublicDev(url) {
  if (!url) return false;
  return /\.r2\.cloudflarestorage\.com/i.test(url);
}

/**
 * Resolves a V4 relative path (e.g. 'assets/P000001/P000001-front-01.webp')
 * to a full Cloudflare R2 public URL, or returns existing https:// / local paths.
 */
export function resolveMediaUrl(relativePath, fallbackUrl = '') {
  if (!relativePath || typeof relativePath !== 'string') return fallbackUrl;
  const trimmed = relativePath.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const base = getR2PublicBaseUrl();
  if (base && !isS3ApiEndpointInsteadOfPublicDev(base)) {
    return `${base}/${trimmed.replace(/^\//, '')}`;
  }
  return fallbackUrl || `/${trimmed.replace(/^\//, '')}`;
}

/**
 * BR-06 / BR-07 Publish Gate validation:
 * Checks whether a product meets all business requirements to be published.
 */
export function evaluatePublishGate(product) {
  const reasons = [];
  if (!product) {
    return { canPublish: false, reasons: ['Không tìm thấy sản phẩm'] };
  }
  if (product.legacy) {
    reasons.push('Sản phẩm CMS cũ (Legacy) đang tạm ẩn theo BR-11');
  }
  if (!product.brand || !String(product.brand).trim() || product.brand === 'Unassigned') {
    reasons.push('Thiếu thương hiệu (Brand trống — BR-06)');
  }
  const imgCount = Number(product.image_count ?? product.images?.length ?? 0);
  if (imgCount < 4) {
    reasons.push(`Chưa đủ 4 ảnh đã duyệt (hiện có ${imgCount} ảnh — BR-06)`);
  }
  if (product.export_status && product.export_status !== 'export_ready') {
    reasons.push(`Trạng thái media (${product.export_status}) chưa sẵn sàng xuất bản (BR-07)`);
  }
  const v1Price = Number(product.variant1_price ?? product.variant1Price ?? 0);
  const priceStatus = product.price_status || product.priceStatus || 'missing';
  if (!v1Price || v1Price <= 0 || priceStatus === 'missing' || priceStatus === 'crawled') {
    reasons.push('Chưa có giá hợp lệ được duyệt hoặc tự khớp (BR-06 / BR-17)');
  }
  return {
    canPublish: reasons.length === 0,
    reasons,
  };
}

function getHeaders(accessToken = null, prefer = null) {
  const key = accessToken || SUPABASE_ANON_KEY;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (SUPABASE_ANON_KEY) {
    headers.apikey = SUPABASE_ANON_KEY;
  } else if (key) {
    headers.apikey = key;
  }
  if (key && key.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${key}`;
  }
  if (prefer) {
    headers.Prefer = prefer;
  }
  return headers;
}

/**
 * Fetch products from Supabase Postgres with nested images and videos.
 */
export async function fetchSupabaseCatalog({ includeUnpublished = false, accessToken = null } = {}) {
  if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !accessToken)) {
    throw new Error('Missing Supabase configuration');
  }

  const filter = includeUnpublished
    ? 'select=*,product_images(*),product_videos(*)&order=product_id.asc'
    : 'select=*,product_images(*),product_videos(*)&publication_status=eq.published&legacy=eq.false&order=product_id.asc';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?${filter}`, {
    method: 'GET',
    headers: getHeaders(accessToken),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase fetch failed (${res.status}): ${errText.slice(0, 180)}`);
  }

  return res.json();
}

/**
 * Fetch latest import batch summary from Supabase (only when authenticated accessToken is provided)
 */
export async function fetchLatestImportBatch(accessToken = null) {
  if (!SUPABASE_URL || !accessToken) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/import_batches?select=*&order=created_at.desc&limit=1`, {
      method: 'GET',
      headers: getHeaders(accessToken),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

/**
 * Update a single product in Supabase Postgres
 */
export async function updateSupabaseProduct(productId, dbPatch, accessToken = null) {
  if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !accessToken)) {
    return { ok: false, offline: true };
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?product_id=eq.${encodeURIComponent(productId)}`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken, 'return=representation'),
        body: JSON.stringify({
          ...dbPatch,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, status: res.status, error: text };
    }
    const data = await res.json();
    return { ok: true, data: data[0] || null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Bulk update products in Supabase Postgres (e.g. approve price or publish in batch)
 */
export async function bulkUpdateSupabaseProducts(productIds, dbPatch, accessToken = null) {
  if (!Array.isArray(productIds) || productIds.length === 0) return { ok: true, count: 0 };
  if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !accessToken)) {
    return { ok: false, offline: true };
  }
  try {
    const inList = productIds.map((id) => `"${String(id).replace(/"/g, '')}"`).join(',');
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?product_id=in.(${encodeURIComponent(inList)})`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken, 'return=minimal'),
        body: JSON.stringify({
          ...dbPatch,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Record customer order into Supabase orders & order_items tables
 */
export async function recordOrderInSupabase(orderPayload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { ok: false, offline: true };
  try {
    const orderRow = {
      order_code: orderPayload.orderId,
      customer_name: orderPayload.customer?.fullName || 'Guest',
      customer_phone: orderPayload.customer?.phone || '',
      customer_email: orderPayload.customer?.email || null,
      shipping_address: orderPayload.customer?.address || null,
      notes: orderPayload.notes || null,
      currency: orderPayload.currency || 'USD',
      total_amount: Number(orderPayload.totalUSD || 0),
      status: 'PENDING_WHATSAPP',
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: getHeaders(null, 'return=representation'),
      body: JSON.stringify(orderRow),
    });

    if (!res.ok) return { ok: false, status: res.status };
    const created = await res.json();
    const orderId = created?.[0]?.id;

    if (orderId && Array.isArray(orderPayload.items) && orderPayload.items.length > 0) {
      const itemRows = orderPayload.items.map((item) => ({
        order_id: orderId,
        product_id: item.product?.product_id || item.product?.id || 'UNKNOWN',
        title: item.product?.name || item.product?.title || 'Watch',
        variant_name: item.variantName || 'Standard',
        unit_price: Number(item.priceUSD || 0),
        quantity: Number(item.quantity || 1),
      }));

      await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
        method: 'POST',
        headers: getHeaders(null, 'return=minimal'),
        body: JSON.stringify(itemRows),
      });
    }

    return { ok: true, orderId };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
