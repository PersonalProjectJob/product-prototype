#!/usr/bin/env node
/**
 * scripts/r2-upload-v4.mjs
 * Upload all 6,948 V4 media files (6,870 WebP images + 39 MP4 videos + 39 WebP posters)
 * from WEB_DELIVERY_ALL_ASSIGNED_2026-11-16_NICKNAMES_V4/data/asset_manifest.json
 * to Cloudflare R2 bucket via S3-compatible AWS Signature V4 (zero external dependencies).
 *
 * Idempotent & resumable:
 * - Queries existing objects in the bucket via ListObjectsV2 first.
 * - Skips objects already present with matching byte size.
 * - Verifies local file SHA-256 against output_sha256 in asset_manifest.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

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
const ACCOUNT_ID = env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const BUCKET = env.R2_BUCKET || 'watch-saas-media';
const PUBLIC_URL = (env.R2_PUBLIC_URL || '').replace(/\/$/, '');

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error('[ERROR] Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY in .env.local');
  process.exit(1);
}

const HOST = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const agent = new https.Agent({ keepAlive: true, maxSockets: 32 });

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function encodeS3URI(uriPath) {
  return uriPath
    .split('/')
    .map((seg) => encodeURIComponent(seg).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()))
    .join('/');
}

function signS3Request({ method, canonicalUri, canonicalQuery = '', headers = {}, payloadHash }) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const allHeaders = {
    host: HOST,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...headers,
  };

  const sortedHeaderKeys = Object.keys(allHeaders)
    .map((k) => k.toLowerCase())
    .sort();

  const canonicalHeaders = sortedHeaderKeys
    .map((k) => `${k}:${String(allHeaders[k]).trim()}\n`)
    .join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const kDate = hmac('AWS4' + SECRET_ACCESS_KEY, dateStamp);
  const kRegion = hmac(kDate, 'auto');
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  return {
    ...allHeaders,
    Authorization: `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

function httpsRequest({ method, pathWithQuery, headers, body = null }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: HOST,
        path: pathWithQuery,
        method,
        headers,
        agent,
        timeout: 60000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('Request timeout')));
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function listExistingObjects() {
  const existing = new Map(); // key -> size
  let continuationToken = '';

  while (true) {
    const params = new URLSearchParams({ 'list-type': '2', 'max-keys': '1000' });
    if (continuationToken) params.set('continuation-token', continuationToken);
    // URLSearchParams sorts might differ from canonicalQuery; sort keys explicitly
    const sortedEntries = [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const canonicalQuery = sortedEntries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const canonicalUri = `/${BUCKET}`;
    const payloadHash = sha256Hex('');
    const signedHeaders = signS3Request({
      method: 'GET',
      canonicalUri,
      canonicalQuery,
      payloadHash,
    });

    const res = await httpsRequest({
      method: 'GET',
      pathWithQuery: `${canonicalUri}?${canonicalQuery}`,
      headers: signedHeaders,
    });

    if (res.status !== 200) {
      throw new Error(`ListObjectsV2 failed with status ${res.status}: ${res.body.slice(0, 250)}`);
    }

    const contentRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
    let match;
    while ((match = contentRegex.exec(res.body)) !== null) {
      const block = match[1];
      const keyMatch = block.match(/<Key>([\s\S]*?)<\/Key>/);
      const sizeMatch = block.match(/<Size>(\d+)<\/Size>/);
      if (keyMatch && sizeMatch) {
        const key = keyMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
        existing.set(key, Number(sizeMatch[1]));
      }
    }

    const truncMatch = res.body.match(/<IsTruncated>(true|false)<\/IsTruncated>/);
    const nextMatch = res.body.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/);
    if (truncMatch && truncMatch[1] === 'true' && nextMatch) {
      continuationToken = nextMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    } else {
      break;
    }
  }
  return existing;
}

async function uploadSingleObject(item, retries = 3) {
  const relPath = item.relative_path;
  const localPath = path.join(V4_DIR, relPath);
  const buf = await fs.promises.readFile(localPath);

  if (item.output_bytes && buf.length !== Number(item.output_bytes)) {
    throw new Error(`Size mismatch for ${relPath}: local=${buf.length}, manifest=${item.output_bytes}`);
  }

  const actualSha = sha256Hex(buf);
  if (item.output_sha256 && actualSha !== item.output_sha256) {
    throw new Error(`SHA-256 mismatch for ${relPath}: local=${actualSha}, manifest=${item.output_sha256}`);
  }

  const ext = path.extname(relPath).toLowerCase();
  const contentType = ext === '.mp4' ? 'video/mp4' : 'image/webp';
  const canonicalUri = encodeS3URI(`/${BUCKET}/${relPath}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const headers = signS3Request({
        method: 'PUT',
        canonicalUri,
        headers: {
          'cache-control': 'public, max-age=31536000, immutable',
          'content-length': String(buf.length),
          'content-type': contentType,
        },
        payloadHash: actualSha,
      });

      const res = await httpsRequest({
        method: 'PUT',
        pathWithQuery: canonicalUri,
        headers,
        body: buf,
      });

      if (res.status === 200 || res.status === 201) {
        return { uploaded: true, bytes: buf.length };
      }
      throw new Error(`HTTP ${res.status}: ${res.body.slice(0, 160)}`);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
}

async function main() {
  const manifestPath = path.join(V4_DIR, 'data', 'asset_manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`[ERROR] Cannot find asset_manifest.json at ${manifestPath}`);
    process.exit(1);
  }

  const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const assets = Array.isArray(rawManifest) ? rawManifest : rawManifest.assets || [];
  console.log(`[R2-UPLOAD] Loaded ${assets.length} items from asset_manifest.json`);

  console.log(`[R2-UPLOAD] Checking existing objects in bucket "${BUCKET}"...`);
  const existing = await listExistingObjects();
  console.log(`[R2-UPLOAD] Found ${existing.size} existing objects in bucket.`);

  const toUpload = [];
  let skipped = 0;
  for (const item of assets) {
    const existingSize = existing.get(item.relative_path);
    if (existingSize !== undefined && existingSize === Number(item.output_bytes)) {
      skipped++;
    } else {
      toUpload.push(item);
    }
  }

  console.log(`[R2-UPLOAD] Skipping ${skipped} already-uploaded files. Uploading ${toUpload.length} files...`);

  const CONCURRENCY = Number(process.env.R2_CONCURRENCY || 20);
  let cursor = 0;
  let uploadedCount = 0;
  let uploadedBytes = 0;
  const failures = [];
  const startTime = Date.now();

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= toUpload.length) break;
      const item = toUpload[idx];
      try {
        const res = await uploadSingleObject(item);
        uploadedCount++;
        uploadedBytes += res.bytes;
        if (uploadedCount % 250 === 0 || uploadedCount === toUpload.length) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const mb = (uploadedBytes / (1024 * 1024)).toFixed(1);
          console.log(
            `[R2-UPLOAD] Progress: ${uploadedCount + skipped}/${assets.length} (new=${uploadedCount}, ${mb} MB, ${elapsed}s)`
          );
        }
      } catch (err) {
        failures.push({ path: item.relative_path, error: err.message });
        console.error(`[R2-UPLOAD] Failed ${item.relative_path}: ${err.message}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, Math.max(1, toUpload.length)) }, () => worker());
  await Promise.all(workers);

  const finalExisting = await listExistingObjects();
  console.log(
    `[R2-UPLOAD] Completed. Total objects in bucket "${BUCKET}": ${finalExisting.size}/${assets.length}. Failures: ${failures.length}`
  );

  if (failures.length > 0) {
    process.exit(1);
  }

  if (PUBLIC_URL && assets.length > 0) {
    const sampleUrl = `${PUBLIC_URL}/${assets[0].relative_path}`;
    const check = await fetch(sampleUrl, { method: 'HEAD' });
    console.log(`[R2-UPLOAD] Public CDN verification HEAD ${sampleUrl} => HTTP ${check.status} (${check.headers.get('content-type')})`);
  }
}

main().catch((err) => {
  console.error('[R2-UPLOAD] Fatal error:', err);
  process.exit(1);
});
