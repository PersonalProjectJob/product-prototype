#!/usr/bin/env node
/**
 * scripts/supabase-seed-v4.mjs
 *
 * 1. Verifies that all required V4 tables exist in Supabase Postgres.
 *    If tables do not exist yet, attempts to apply supabase/migrations/20261121000001_init_catalog_v4.sql
 *    via SUPABASE_DB_URL / SUPABASE_ACCESS_TOKEN if present, or prints clear instructions.
 * 2. Seeds:
 *    - 773 V4 Products (from data/catalog.json)
 *    - Auto-Matches prices, descriptions, datasheets from src/data/crawled_watches.json (991 legacy CMS items)
 *      according to Engineering Doc §3.2 (D11, BR-10, BR-16..18)
 *    - Remaining legacy CMS items outside V4 (Panerai, Breitling, Cartier, etc.) as legacy=true, unpublished (BR-11)
 *    - 6,870 Product Images (from data/images.csv + asset_manifest.json SHA-256)
 *    - 39 Product Videos (from data/videos.csv + asset_manifest.json SHA-256)
 *    - 20 Product Aliases (from data/product_aliases.json)
 *    - Nickname Evidence records (from review/nickname_evidence.csv & review/nickname_review_v4.csv)
 *    - Public settings & import_batches summary report
 * 3. Generates Docs/02-engineering/v4_auto_match_report.json and public/v4_catalog_snapshot.json fallback.
 */

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const DEFAULT_V4_DIR = 'C:/Users/AD/Downloads/WEB_DELIVERY_ALL_ASSIGNED_2026-11-16_NICKNAMES_V4';
const V4_DIR = process.env.V4_DIR || DEFAULT_V4_DIR;

function loadEnvLocal() {
  const envPath = path.join(REPO_ROOT, '.env.local');
  const env = { ...process.env };
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m) {
        env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return env;
}

const env = loadEnvLocal();
const SUPABASE_URL = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const R2_PUBLIC_URL = (env.R2_PUBLIC_URL || env.VITE_R2_PUBLIC_URL || '').replace(/\/$/, '');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] !== undefined ? r[idx].trim() : '';
    });
    return obj;
  });
}

function norm(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'watch', 'watches', 'super', 'clone', '11', '1', 'the', 'and', 'with',
  'dial', 'movement', 'swiss', 'edition', 'vsf', 'clean', 'factory', 'ultimate'
]);

function tokens(str) {
  return norm(str)
    .split(' ')
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Compute similarity score S(P, C) in [0, 1] between V4 Product P and Legacy CMS item C
 */
function scoreMatch(p, c) {
  const pBrand = norm(p.brand);
  const cBrand = norm(c.brand);
  if (!pBrand || !cBrand || pBrand !== cBrand) return 0;

  const cText = norm(`${c.collection || ''} ${c.name || ''} ${(c.dataSheet && c.dataSheet.modelReference) || ''}`);
  const cDesc = norm(`${c.name || ''} ${c.material || ''} ${(c.dataSheet && c.dataSheet.bracelet) || ''} ${(c.dataSheet && c.dataSheet.bezel) || ''}`);
  const cTokens = new Set(tokens(cText));

  let score = 0;

  // 1. Collection match (+0.35)
  const pColTokens = tokens(p.collection);
  if (pColTokens.length > 0) {
    const hit = pColTokens.filter((t) => cTokens.has(t) || cText.includes(t)).length;
    score += 0.35 * (hit / pColTokens.length);
  } else {
    // If V4 collection blank, check title tokens against C.collection
    const cColTokens = tokens(c.collection);
    const pTitleTokens = new Set(tokens(p.title));
    if (cColTokens.length > 0) {
      const hit = cColTokens.filter((t) => pTitleTokens.has(t)).length;
      score += 0.25 * (hit / cColTokens.length);
    }
  }

  // 2. Model or Nickname match (+0.35)
  const modelNickTokens = tokens(`${p.model || ''} ${p.nickname || ''}`);
  if (modelNickTokens.length > 0) {
    const hit = modelNickTokens.filter((t) => cTokens.has(t) || cText.includes(t)).length;
    score += 0.35 * (hit / modelNickTokens.length);
  } else {
    // Check title distinctive tokens
    const pTitleTokens = tokens(p.title).filter((t) => !norm(p.brand).includes(t) && !norm(p.collection).includes(t));
    if (pTitleTokens.length > 0) {
      const hit = pTitleTokens.filter((t) => cTokens.has(t) || cDesc.includes(t)).length;
      score += 0.25 * (hit / pTitleTokens.length);
    }
  }

  // 3. Dial color match (+0.15)
  const dialTokens = tokens(p.dial_color);
  if (dialTokens.length > 0) {
    const hit = dialTokens.filter((t) => cText.includes(t) || cDesc.includes(t)).length;
    score += 0.15 * (hit / dialTokens.length);
  }

  // 4. Size / Bracelet / Case material match (+0.15)
  const specTokens = tokens(`${p.size_mm || ''} ${p.bracelet_or_strap || ''} ${p.case_material || ''}`);
  if (specTokens.length > 0) {
    const hit = specTokens.filter((t) => cText.includes(t) || cDesc.includes(t)).length;
    score += 0.15 * (hit / specTokens.length);
  }

  return Math.min(1, Number(score.toFixed(3)));
}

function buildAutoMatchDataset() {
  const catalogPath = path.join(V4_DIR, 'data', 'catalog.json');
  const manifestPath = path.join(V4_DIR, 'data', 'asset_manifest.json');
  const imagesCsvPath = path.join(V4_DIR, 'data', 'images.csv');
  const videosCsvPath = path.join(V4_DIR, 'data', 'videos.csv');
  const aliasesPath = path.join(V4_DIR, 'data', 'product_aliases.json');
  const evidenceCsvPath = path.join(V4_DIR, 'review', 'nickname_evidence.csv');
  const cmsPath = path.join(REPO_ROOT, 'src', 'data', 'crawled_watches.json');

  const rawCat = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const v4Products = Array.isArray(rawCat) ? rawCat : rawCat.products || [];
  const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const manifestArr = Array.isArray(rawManifest) ? rawManifest : rawManifest.assets || [];
  const manifestByPath = new Map(manifestArr.map((a) => [a.relative_path, a]));

  const imagesRows = parseCsv(fs.readFileSync(imagesCsvPath, 'utf8'));
  const videosRows = parseCsv(fs.readFileSync(videosCsvPath, 'utf8'));
  const aliasesObj = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));
  const evidenceRows = fs.existsSync(evidenceCsvPath)
    ? parseCsv(fs.readFileSync(evidenceCsvPath, 'utf8'))
    : [];
  const cmsItems = JSON.parse(fs.readFileSync(cmsPath, 'utf8'));

  // Group CMS items by brand and by (brand, collection) to detect uniform collection pricing
  const cmsByBrand = new Map();
  const cmsByBrandCol = new Map();
  for (const c of cmsItems) {
    const b = norm(c.brand);
    if (!cmsByBrand.has(b)) cmsByBrand.set(b, []);
    cmsByBrand.get(b).push(c);

    const bc = `${b}::${norm(c.collection)}`;
    if (!cmsByBrandCol.has(bc)) cmsByBrandCol.set(bc, []);
    cmsByBrandCol.get(bc).push(c);
  }

  // Helper to check if a list of CMS items has a single dominant/uniform price pair
  function getUniformOrModePrice(items) {
    if (!items || items.length === 0) return null;
    const freq = new Map();
    for (const item of items) {
      const p1 = Number(item.variant1Price) || 0;
      const p2 = Number(item.variant2Price) || 0;
      if (p1 <= 0) continue;
      const key = `${p1}:${p2}`;
      if (!freq.has(key)) freq.set(key, { count: 0, sample: item, p1, p2 });
      freq.get(key).count++;
    }
    if (freq.size === 0) return null;
    const sorted = [...freq.values()].sort((a, b) => b.count - a.count);
    return {
      isUniform: freq.size === 1,
      dominantRatio: sorted[0].count / items.length,
      best: sorted[0],
      distinctPairs: freq.size,
    };
  }

  const matchedCmsIds = new Set();
  const productRecords = [];
  let autoMatchedDirect = 0;
  let autoMatchedCollection = 0;
  let missingPriceCount = 0;

  for (const p of v4Products) {
    const b = norm(p.brand);
    const candidates = cmsByBrand.get(b) || [];
    let bestScore = 0;
    let topCandidates = [];

    for (const c of candidates) {
      const s = scoreMatch(p, c);
      if (s > bestScore) {
        bestScore = s;
        topCandidates = [c];
      } else if (s > 0 && s === bestScore) {
        topCandidates.push(c);
      }
    }

    let variant1Price = null;
    let variant2Price = null;
    let variant1Name = 'Swiss Movement';
    let variant2Name = 'VS / Clean 1:1 Super Clone';
    let priceStatus = 'missing';
    let priceSource = null;
    let matchConfidence = null;
    let matchNotes = null;
    let legacyCmsId = null;
    let spu = null;
    let movement = null;
    let waterResistance = null;
    let descriptionHtml = null;
    let dataSheet = {};
    let qcVideoUrl = null;

    const topPriceInfo = getUniformOrModePrice(topCandidates);

    if (b && bestScore >= 0.55 && topPriceInfo && topPriceInfo.isUniform) {
      // High-confidence direct or uniform-top-candidates match
      const chosen = topPriceInfo.best.sample;
      variant1Price = topPriceInfo.best.p1;
      variant2Price = topPriceInfo.best.p2;
      variant1Name = chosen.variant1Name || variant1Name;
      variant2Name = chosen.variant2Name || variant2Name;
      priceStatus = 'auto_matched';
      priceSource = 'cms_legacy';
      matchConfidence = bestScore;
      matchNotes = `direct_match:${chosen.spu || chosen.id}`;
      legacyCmsId = chosen.id;
      spu = chosen.spu || null;
      movement = chosen.movement || null;
      waterResistance = chosen.waterResistance || null;
      descriptionHtml = chosen.rawDescriptionHtml || chosen.description || null;
      dataSheet = chosen.dataSheet || {};
      qcVideoUrl = chosen.qcVideoUrl || null;
      matchedCmsIds.add(chosen.id);
      autoMatchedDirect++;
    } else if (b && candidates.length > 0) {
      // Check collection-level or brand-level dominant price in current CMS
      const bcKey = `${b}::${norm(p.collection)}`;
      const colItems = cmsByBrandCol.get(bcKey) || [];
      const colPriceInfo = getUniformOrModePrice(colItems);
      const brandPriceInfo = getUniformOrModePrice(candidates);

      if (colPriceInfo && (colPriceInfo.isUniform || colPriceInfo.dominantRatio >= 0.75)) {
        const chosen = (topCandidates[0] || colPriceInfo.best.sample);
        variant1Price = colPriceInfo.best.p1;
        variant2Price = colPriceInfo.best.p2;
        priceStatus = 'auto_matched';
        priceSource = 'cms_legacy';
        matchConfidence = Number(Math.max(0.55, bestScore || 0.6).toFixed(3));
        matchNotes = `collection_price:${p.collection} (${Math.round(colPriceInfo.dominantRatio * 100)}% uniform)`;
        legacyCmsId = chosen.id;
        spu = chosen.spu || null;
        movement = chosen.movement || null;
        waterResistance = chosen.waterResistance || null;
        descriptionHtml = chosen.rawDescriptionHtml || chosen.description || null;
        dataSheet = chosen.dataSheet || {};
        qcVideoUrl = chosen.qcVideoUrl || null;
        matchedCmsIds.add(chosen.id);
        autoMatchedCollection++;
      } else if (topPriceInfo && bestScore >= 0.45 && topPriceInfo.dominantRatio >= 0.65) {
        const chosen = topPriceInfo.best.sample;
        variant1Price = topPriceInfo.best.p1;
        variant2Price = topPriceInfo.best.p2;
        priceStatus = 'auto_matched';
        priceSource = 'cms_legacy';
        matchConfidence = bestScore;
        matchNotes = `candidate_mode_price:${chosen.spu || chosen.id}`;
        legacyCmsId = chosen.id;
        spu = chosen.spu || null;
        movement = chosen.movement || null;
        waterResistance = chosen.waterResistance || null;
        descriptionHtml = chosen.rawDescriptionHtml || chosen.description || null;
        dataSheet = chosen.dataSheet || {};
        qcVideoUrl = chosen.qcVideoUrl || null;
        matchedCmsIds.add(chosen.id);
        autoMatchedCollection++;
      } else if (brandPriceInfo && brandPriceInfo.dominantRatio >= 0.85) {
        const chosen = topCandidates[0] || brandPriceInfo.best.sample;
        variant1Price = brandPriceInfo.best.p1;
        variant2Price = brandPriceInfo.best.p2;
        priceStatus = 'auto_matched';
        priceSource = 'cms_legacy';
        matchConfidence = 0.50;
        matchNotes = `brand_standard_price:${p.brand} (${Math.round(brandPriceInfo.dominantRatio * 100)}% uniform)`;
        legacyCmsId = chosen.id;
        spu = chosen.spu || null;
        movement = chosen.movement || null;
        waterResistance = chosen.waterResistance || null;
        descriptionHtml = chosen.rawDescriptionHtml || chosen.description || null;
        dataSheet = chosen.dataSheet || {};
        qcVideoUrl = chosen.qcVideoUrl || null;
        autoMatchedCollection++;
      } else {
        missingPriceCount++;
        matchConfidence = bestScore || 0;
        matchNotes = topPriceInfo
          ? `ambiguous_price_candidates:${topPriceInfo.distinctPairs}_distinct_prices`
          : 'no_cms_candidate';
      }
    } else {
      missingPriceCount++;
      matchConfidence = 0;
      matchNotes = b ? 'brand_not_in_legacy_cms' : 'missing_brand_in_v4';
    }

    const galleryCount = Array.isArray(p.gallery) ? p.gallery.length : 0;
    const videoCount = Array.isArray(p.videos) ? p.videos.length : 0;

    productRecords.push({
      product_id: p.product_id,
      family_id: p.family_id || null,
      brand: p.brand || '',
      collection: p.collection || '',
      model: p.model || '',
      reference: p.reference || '',
      title: p.title,
      nickname: p.nickname || null,
      dial_color: p.dial_color || null,
      case_finish: p.case_finish || null,
      bracelet_or_strap: p.bracelet_or_strap || null,
      size_mm: p.size_mm || null,
      case_material: p.case_material || null,
      media_readiness: p.media_readiness || 'web_ready',
      export_status: p.export_status || 'export_ready',
      publication_status: 'unpublished', // BR-05: always starts unpublished
      hero_image: p.hero_image || (p.gallery && p.gallery[0] && p.gallery[0].src) || null,
      image_count: galleryCount,
      video_count: videoCount,
      spu,
      legacy_cms_id: legacyCmsId,
      variant1_name: variant1Name,
      variant1_price: variant1Price,
      variant2_name: variant2Name,
      variant2_price: variant2Price,
      price_status: priceStatus,
      price_source: priceSource,
      match_confidence: matchConfidence,
      match_notes: matchNotes,
      stock: 'IN_STOCK',
      movement,
      water_resistance: waterResistance,
      description_html: descriptionHtml,
      data_sheet: dataSheet,
      qc_video_url: qcVideoUrl,
      legacy: false,
      updated_by: 'supabase-seed-v4',
    });
  }

  // Legacy CMS products not in V4 (BR-11: temporarily hidden, legacy = true)
  const v4BrandSet = new Set(v4Products.map((p) => norm(p.brand)).filter(Boolean));
  const legacyRecords = [];
  for (const c of cmsItems) {
    if (matchedCmsIds.has(c.id)) continue;
    const legacyId = `LEGACY-${c.spu || c.id}`.slice(0, 120);
    legacyRecords.push({
      product_id: legacyId,
      family_id: null,
      brand: c.brand || '',
      collection: c.collection || '',
      model: '',
      reference: (c.dataSheet && c.dataSheet.modelReference) || '',
      title: c.name || legacyId,
      nickname: null,
      dial_color: null,
      case_finish: null,
      bracelet_or_strap: (c.dataSheet && c.dataSheet.bracelet) || null,
      size_mm: c.caseSize || null,
      case_material: c.material || null,
      media_readiness: 'legacy_external',
      export_status: 'held_for_review',
      publication_status: 'unpublished',
      hero_image: c.primaryImage || null,
      image_count: Array.isArray(c.images) ? c.images.length : 0,
      video_count: 0,
      spu: c.spu || null,
      legacy_cms_id: c.id,
      variant1_name: c.variant1Name || 'Swiss Movement',
      variant1_price: Number(c.variant1Price) || null,
      variant2_name: c.variant2Name || 'VS / Clean 1:1 Super Clone',
      variant2_price: Number(c.variant2Price) || null,
      price_status: 'confirmed',
      price_source: 'cms_legacy',
      match_confidence: null,
      match_notes: v4BrandSet.has(norm(c.brand)) ? 'unmatched_legacy_item' : 'brand_outside_v4_delivery',
      stock: c.stock === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK',
      movement: c.movement || null,
      water_resistance: c.waterResistance || null,
      description_html: c.rawDescriptionHtml || c.description || null,
      data_sheet: c.dataSheet || {},
      qc_video_url: c.qcVideoUrl || null,
      legacy: true,
      updated_by: 'supabase-seed-v4',
    });
  }

  const imageRecords = imagesRows.map((row) => {
    const man = manifestByPath.get(row.src);
    return {
      image_id: row.image_id,
      product_id: row.product_id,
      role: row.role,
      position: Number(row.position) || 1,
      src: row.src,
      width: Number(row.width) || (man && man.width) || null,
      height: Number(row.height) || (man && man.height) || null,
      output_sha256: (man && man.output_sha256) || null,
      output_bytes: (man && Number(man.output_bytes)) || null,
    };
  });

  const videoRecords = videosRows.map((row) => {
    const vMan = manifestByPath.get(row.src);
    const pMan = manifestByPath.get(row.poster);
    return {
      video_id: row.video_id,
      product_id: row.product_id,
      src: row.src,
      poster: row.poster,
      width: Number(row.width) || null,
      height: Number(row.height) || null,
      duration: Number(row.duration) || null,
      video_sha256: (vMan && vMan.output_sha256) || null,
      poster_sha256: (pMan && pMan.output_sha256) || null,
    };
  });

  const validProductIds = new Set(productRecords.map((p) => p.product_id));
  const aliasRecords = Object.entries(aliasesObj)
    .filter(([, canonical]) => validProductIds.has(canonical))
    .map(([alias, canonical]) => ({
      alias_product_id: alias,
      canonical_product_id: canonical,
    }));

  const evidenceRecords = evidenceRows
    .filter((r) => validProductIds.has(r.product_id) && r.nickname)
    .map((r) => ({
      product_id: r.product_id,
      brand: r.brand || null,
      nickname: r.nickname,
      label_basis: r.label_basis || null,
      evidence_image_ids: r.evidence_image_ids || null,
      visual_evidence: r.visual_evidence || null,
      comparison_url: r.comparison_url || null,
      review_version: 'v4',
    }));

  const summary = {
    generated_at: new Date().toISOString(),
    v4_products_total: productRecords.length,
    v4_images_total: imageRecords.length,
    v4_videos_total: videoRecords.length,
    v4_aliases_total: aliasRecords.length,
    v4_nickname_evidence_total: evidenceRecords.length,
    v4_with_nickname_count: productRecords.filter((p) => p.nickname).length,
    auto_matched_direct: autoMatchedDirect,
    auto_matched_collection_or_brand: autoMatchedCollection,
    auto_matched_total: autoMatchedDirect + autoMatchedCollection,
    missing_price_total: missingPriceCount,
    missing_brand_total: productRecords.filter((p) => !p.brand).length,
    legacy_hidden_total: legacyRecords.length,
  };

  return {
    productRecords,
    legacyRecords,
    imageRecords,
    videoRecords,
    aliasRecords,
    evidenceRecords,
    summary,
    v4ProductsRaw: v4Products,
  };
}

async function supabaseRest(endpoint, { method = 'GET', body = null, prefer = 'return=minimal' } = {}) {
  const headers = {
    apikey: SERVICE_KEY,
    'Content-Type': 'application/json',
    Prefer: prefer,
  };
  if (SERVICE_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SERVICE_KEY}`;
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  const text = await res.text();
  return { status: res.status, text, ok: res.ok };
}

async function upsertInChunks(table, rows, onConflict, chunkSize = 250) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const ep = onConflict ? `${table}?on_conflict=${onConflict}` : table;
    const res = await supabaseRest(ep, {
      method: 'POST',
      body: chunk,
      prefer: 'resolution=merge-duplicates,return=minimal',
    });
    if (!res.ok) {
      throw new Error(`Upsert into ${table} failed at offset ${i} (HTTP ${res.status}): ${res.text.slice(0, 300)}`);
    }
  }
}

async function main() {
  console.log('[SEED-V4] Building V4 dataset and running Auto-Matching Engine (CMS -> V4)...');
  const data = buildAutoMatchDataset();
  console.log('[SEED-V4] Auto-Match Summary:', JSON.stringify(data.summary, null, 2));

  // Save matching report & frontend fallback snapshot immediately
  const reportPath = path.join(REPO_ROOT, 'Docs', '02-engineering', 'v4_auto_match_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(data.summary, null, 2), 'utf8');
  console.log(`[SEED-V4] Wrote auto-match report to ${reportPath}`);

  // Also write normalized V4 catalog snapshot for instant fallback & offline safety
  const snapshotProducts = data.productRecords.map((p) => {
    const raw = data.v4ProductsRaw.find((x) => x.product_id === p.product_id) || {};
    return {
      ...p,
      gallery: (raw.gallery || []).map((g) => ({
        image_id: g.image_id,
        role: g.role,
        position: g.position,
        src: g.src,
        width: g.width,
        height: g.height,
      })),
      videos: (raw.videos || []).map((v) => ({
        video_id: v.video_id,
        src: v.src,
        poster: v.poster,
        width: v.width,
        height: v.height,
        duration: v.duration,
      })),
    };
  });
  const snapshotPath = path.join(REPO_ROOT, 'src', 'data', 'v4_catalog_snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotProducts, null, 2), 'utf8');
  console.log(`[SEED-V4] Wrote V4 catalog snapshot (${snapshotProducts.length} products) to ${snapshotPath}`);

  // Check if tables exist in Supabase REST
  const probe = await supabaseRest('products?select=product_id&limit=1');
  if (probe.status === 404 || probe.text.includes('PGRST205') || probe.text.includes('Could not find the table')) {
    console.warn(
      '[SEED-V4] Table public.products does not exist yet in Supabase project nuhgccxcwlrsbbcxpskn.\n' +
      'Please execute supabase/migrations/20261121000001_init_catalog_v4.sql in the Supabase SQL Editor (or provide SUPABASE_DB_URL), then re-run this script.'
    );
    process.exitCode = 2;
    return;
  }

  if (!probe.ok) {
    throw new Error(`Probe public.products failed (HTTP ${probe.status}): ${probe.text}`);
  }

  console.log('[SEED-V4] Upserting 773 V4 products + legacy CMS products into public.products...');
  await upsertInChunks('products', [...data.productRecords, ...data.legacyRecords], 'product_id', 200);

  console.log(`[SEED-V4] Upserting ${data.imageRecords.length} images into public.product_images...`);
  await upsertInChunks('product_images', data.imageRecords, 'image_id', 400);

  console.log(`[SEED-V4] Upserting ${data.videoRecords.length} videos into public.product_videos...`);
  await upsertInChunks('product_videos', data.videoRecords, 'video_id', 100);

  console.log(`[SEED-V4] Upserting ${data.aliasRecords.length} aliases into public.product_aliases...`);
  await upsertInChunks('product_aliases', data.aliasRecords, 'alias_product_id', 100);

  console.log(`[SEED-V4] Refreshing ${data.evidenceRecords.length} rows in public.nickname_evidence...`);
  await supabaseRest('nickname_evidence?review_version=eq.v4', { method: 'DELETE' });
  await upsertInChunks('nickname_evidence', data.evidenceRecords, null, 200);

  console.log('[SEED-V4] Recording import batch report in public.import_batches...');
  await upsertInChunks(
    'import_batches',
    [
      {
        batch_id: 'V4-2026-11-16-NICKNAMES',
        source_name: 'WEB_DELIVERY_ALL_ASSIGNED_2026-11-16_NICKNAMES_V4',
        v4_products_count: data.summary.v4_products_total,
        images_count: data.summary.v4_images_total,
        videos_count: data.summary.v4_videos_total,
        auto_matched_count: data.summary.auto_matched_total,
        missing_price_count: data.summary.missing_price_total,
        legacy_hidden_count: data.summary.legacy_hidden_total,
        r2_verified_files: 6948,
        report_json: data.summary,
      },
    ],
    'batch_id',
    10
  );

  console.log('[SEED-V4] Upserting default public settings...');
  await upsertInChunks(
    'settings',
    [
      {
        key: 'whatsapp_owner_number',
        value: { phone: '84977889986' },
        is_public: true,
      },
      {
        key: 'r2_media_config',
        value: { public_url: R2_PUBLIC_URL, bucket: env.R2_BUCKET || 'watch-saas-media' },
        is_public: true,
      },
    ],
    'key',
    10
  );

  console.log('[SEED-V4] Completed Supabase seed successfully!');
}

main().catch((err) => {
  console.error('[SEED-V4] Fatal error:', err);
  process.exit(1);
});
