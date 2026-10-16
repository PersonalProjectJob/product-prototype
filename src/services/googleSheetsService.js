/**
 * Service to connect directly with Google Sheets via Google GViz JSON Feed
 * Requires ZERO backend, ZERO API key!
 */

export function extractSheetId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  // If user pasted a full Google Sheet URL
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return trimmed;
}

/**
 * Fetch and parse data from a public Google Sheet
 * @param {string} sheetId 
 * @returns {Promise<Array>} Array of parsed product objects
 */
export async function fetchGoogleSheetData(sheetId) {
  const cleanId = extractSheetId(sheetId);
  if (!cleanId) throw new Error('Invalid Sheet ID');

  const url = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json&tq=`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Sheets responded with status ${response.status}`);
  }

  const rawText = await response.text();

  // GViz wraps response in: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonMatch = rawText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
  if (!jsonMatch) {
    throw new Error('Invalid GViz response format. Ensure sheet sharing is set to "Anyone with the link can view".');
  }

  const gvizData = JSON.parse(jsonMatch[1]);
  if (!gvizData.table || !gvizData.table.rows) {
    throw new Error('Google Sheet table contains no rows');
  }

  const cols = gvizData.table.cols.map(c => (c.label || '').trim().toLowerCase());
  const rows = gvizData.table.rows;

  // Flexible column finder (matches column by name, or falls back to positional index)
  const findCol = (keywords, defaultIdx) => {
    for (const kw of keywords) {
      const idx = cols.findIndex(c => c.includes(kw.toLowerCase()));
      if (idx >= 0) return idx;
    }
    return defaultIdx;
  };

  const idCol = findCol(['id'], 0);
  const brandCol = findCol(['brand'], 1);
  const collCol = findCol(['collection'], 2);
  const nameCol = findCol(['product name', 'name', 'title'], 3);
  const v1NameCol = findCol(['variant 1 name'], 4);
  const v1PriceCol = findCol(['variant 1 price'], 5);
  const v2NameCol = findCol(['variant 2 name'], 6);
  const v2PriceCol = findCol(['variant 2 price'], 7);
  const primaryImgCol = findCol(['primary image', 'image'], 8);
  const galleryImgCol = findCol(['gallery images', 'gallery'], 9);
  const movCol = findCol(['movement'], 10);
  const sizeCol = findCol(['case size', 'size'], 11);
  const matCol = findCol(['material'], 12);
  const wrCol = findCol(['water resistance', 'water'], 13);
  const modelRefCol = findCol(['model reference', 'reference'], 14);
  const factoryCol = findCol(['factory version', 'factory'], 15);
  const bezelCol = findCol(['bezel'], 16);
  const dimsCol = findCol(['case dimensions', 'dimensions'], 17);
  const descCol = findCol(['description'], 18);
  const statusCol = findCol(['status'], 19);
  const stockCol = findCol(['stock'], 20);

  const products = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const c = row.c || [];

    const getVal = (idx) => {
      if (idx < 0 || !c[idx] || c[idx].v === null || c[idx].v === undefined) return '';
      return String(c[idx].v).trim();
    };

    const getNum = (idx, fallback) => {
      if (idx < 0 || !c[idx] || c[idx].v === null || c[idx].v === undefined) return fallback;
      const parsed = parseFloat(String(c[idx].v).replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? fallback : parsed;
    };

    const name = getVal(nameCol);
    if (!name) continue; // skip blank rows

    const id = getVal(idCol) || `cw-row-${i + 1}`;
    const brand = getVal(brandCol) || 'Rolex';
    const collection = getVal(collCol) || 'Signature Collection';

    const variant1Name = getVal(v1NameCol) || 'Swiss Movement';
    const variant1Price = getNum(v1PriceCol, 700);
    const variant2Name = getVal(v2NameCol) || 'VS / Clean 1:1 Super Clone';
    const variant2Price = getNum(v2PriceCol, 1199);

    const primaryImage = getVal(primaryImgCol) || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
    const galleryRaw = getVal(galleryImgCol);
    const galleryImages = galleryRaw ? galleryRaw.split(',').map(s => s.trim()).filter(Boolean) : [primaryImage];

    const movement = getVal(movCol) || 'Custom Dandong Super Clone Movement';
    const caseSize = getVal(sizeCol) || '40mm';
    const material = getVal(matCol) || 'Solid 904L Oystersteel, Cerachrom Ceramic Bezel';
    const waterResistance = getVal(wrCol) || '50m / 5 ATM Tested';

    // Data sheet properties
    const modelReference = getVal(modelRefCol) || name;
    const factoryVersion = getVal(factoryCol) || 'VSF / Clean 1:1 Edition';
    const bezel = getVal(bezelCol) || 'Cerachrom Ceramic';
    const caseDimensions = getVal(dimsCol) || `${caseSize} x 12.0 mm`;

    const description = getVal(descCol) || '';
    const status = (getVal(statusCol) || 'ACTIVE').toUpperCase();
    const stock = (getVal(stockCol) || 'IN_STOCK').toUpperCase();

    products.push({
      id,
      spu: id.replace('cw-', ''),
      brand,
      collection,
      name,
      variant1Name,
      variant1Price,
      variant2Name,
      variant2Price,
      primaryImage,
      galleryImages,
      images: galleryImages,
      movement,
      caseSize,
      material,
      waterResistance,
      description,
      status,
      stock,
      priceUSD: variant1Price,
      originalPriceUSD: variant2Price,
      dataSheet: {
        modelReference,
        factoryVersion,
        movement,
        bezel,
        caseMaterial: material,
        bracelet: 'Solid Steel Bracelet',
        caseDimensions,
        waterResistance
      }
    });
  }

  return products;
}

/**
 * Download products array as a CSV file in browser, 100% formatted for Google Sheets import
 */
export function downloadCsv(products, filename = 'clonewatches_master_catalog.csv') {
  const headers = [
    'ID',
    'Brand',
    'Collection',
    'Product Name',
    'Model Reference',
    'Factory / Version',
    'Variant 1 Name',
    'Variant 1 Price (USD)',
    'Variant 2 Name',
    'Variant 2 Price (USD)',
    'Stock Status',
    'Movement',
    'Case Size',
    'Case Dimensions',
    'Case Material',
    'Bezel',
    'Bracelet',
    'Water Resistance',
    'Primary Image URL',
    'Summary Description',
    'Full Technical Details',
    'Status'
  ];

  // Escaping that replaces raw line breaks with bullet point delimiter so Google Sheets never blows up row heights!
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""').replace(/\r?\n+/g, ' • ');
    return `"${str}"`;
  };

  const rows = [headers.map(h => `"${h}"`).join(',')];

  for (const p of products) {
    const ds = p.dataSheet || {};
    const sc = p.richShowcase || {};

    const summaryDesc = sc.tagline || (p.description ? p.description.split('\n')[0] : `${p.name} - ${ds.factoryVersion || 'VSF/Clean 1:1'}.`);
    const calibreBullets = sc.calibre?.bullets ? sc.calibre.bullets.map(b => `${b.title}: ${b.desc}`).join(' • ') : '';
    const fullTechDetails = `[CALIBRE] ${sc.calibre?.headline || ds.movement || ''}: ${calibreBullets} | [SPECS] Bezel: ${sc.specs?.bezel?.title || ds.bezel || ''} • Crystal: ${sc.specs?.crystal?.title || ''} • Case: ${sc.specs?.caseProfile?.title || ds.caseDimensions || ''} • Bracelet: ${sc.specs?.bracelet?.title || ds.bracelet || ''}`;

    const row = [
      escapeCsv(p.id),
      escapeCsv(p.brand),
      escapeCsv(p.collection),
      escapeCsv(p.name),
      escapeCsv(ds.modelReference || p.modelCode || p.spu || p.name),
      escapeCsv(ds.factoryVersion || p.factory || 'VSF / Clean 1:1'),
      escapeCsv(p.variant1Name || 'Swiss Movement'),
      escapeCsv(p.variant1Price || 700),
      escapeCsv(p.variant2Name || 'VS / Clean 1:1 Super Clone'),
      escapeCsv(p.variant2Price || 1199),
      escapeCsv(p.stock || 'IN_STOCK'),
      escapeCsv(p.movement || ds.movement || ''),
      escapeCsv(p.caseSize || ''),
      escapeCsv(ds.caseDimensions || ''),
      escapeCsv(p.material || ds.caseMaterial || ''),
      escapeCsv(ds.bezel || p.bezel || ''),
      escapeCsv(ds.bracelet || ''),
      escapeCsv(p.waterResistance || ds.waterResistance || ''),
      escapeCsv(p.primaryImage || ''),
      escapeCsv(summaryDesc),
      escapeCsv(fullTechDetails),
      escapeCsv(p.status || 'ACTIVE')
    ];
    rows.push(row.join(','));
  }


  // Prepend UTF-8 BOM so Microsoft Excel & Google Sheets correctly render Vietnamese and special symbols
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
