// ══════════════════════════════════════════════════════════════
//  Son Delicias — Apps Script
//  Sheet Pizzería : 1JWFobYrSnDbrY03KrvyQhkO9A01EZvW4UIBfMKxTbak
//  Sheet Mercado  : 148MC038qatmyLPGaA3BbEwm7FgxmpBs4Ln57lrS55Wk
// ══════════════════════════════════════════════════════════════

// ── Pizzería ──────────────────────────────────────────────────
const SHEET_ID           = '1JWFobYrSnDbrY03KrvyQhkO9A01EZvW4UIBfMKxTbak';
const PEDIDOS_SHEET      = 'Pedidos';
const INVENTARIO_SHEET   = 'Inventario';
const VALORACIONES_SHEET = 'Valoraciones';

// ── Mercado (economía independiente) ─────────────────────────
const MERCADO_SHEET_ID = '148MC038qatmyLPGaA3BbEwm7FgxmpBs4Ln57lrS55Wk';
const MERCADO_SHEET    = 'Productos';

// ── Enrutador GET ─────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action || '';

  if (action === 'inventory') return getInventory();
  if (action === 'ratings')   return getRatings();
  if (action === 'mercado')   return getMercado();
  if (action === 'comments')  return getComments(
    e.parameter.producto || '',
    parseInt(e.parameter.offset) || 0,
    parseInt(e.parameter.limit)  || 3
  );

  return ContentService
    .createTextOutput(JSON.stringify({ nextNum: getNextOrderNum() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Enrutador POST ────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'rating') return saveRating(data);

    // Guardar pedido
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(PEDIDOS_SHEET) || ss.insertSheet(PEDIDOS_SHEET);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Pedido #', 'Fecha', 'Hora', 'Tipo',
        'Nombre', 'CI', 'Mesa', 'Dirección', 'Referencia',
        'Productos', 'Total ($)', 'Estado'
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    const orderNum = generateOrderNum(sheet);
    sheet.appendRow([
      orderNum,
      data.fecha       || new Date().toLocaleDateString('es-CU'),
      data.hora        || new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' }),
      data.tipo        || '',
      data.nombre      || '',
      data.ci          || '',
      data.mesa        || '',
      data.direccion   || '',
      data.referencia  || '',
      data.productos   || '',
      data.total       || '0.00',
      data.estado      || 'Pendiente'
    ]);

    const lastRow = sheet.getLastRow();
    const color = { delivery: '#d4edda', recoger: '#fff3cd', table: '#d1ecf1' }[data.tipo] || '#f8f9fa';
    sheet.getRange(lastRow, 1, 1, 12).setBackground(color);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, orderNumber: orderNum }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Número de pedido ──────────────────────────────────────────
function generateOrderNum(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 'PZ-001';
  const col = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().filter(Boolean);
  let max = 0;
  col.forEach(v => {
    const n = parseInt(String(v).replace(/\D/g, ''));
    if (!isNaN(n) && n > max) max = n;
  });
  return 'PZ-' + String(max + 1).padStart(3, '0');
}

function getNextOrderNum() {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(PEDIDOS_SHEET);
  if (!sheet) return 'PZ-001';
  return generateOrderNum(sheet);
}

// ── Inventario (catálogo completo + disponibilidad pizzería) ──
function getInventory() {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    let   sheet = ss.getSheetByName(INVENTARIO_SHEET);

    // Crear hoja con encabezado completo si no existe
    if (!sheet) {
      sheet = ss.insertSheet(INVENTARIO_SHEET);
      sheet.appendRow([
        'Nombre', 'Estado',
        'Descripcion',
        'Precio_Personal', 'Precio_Mediana', 'Precio_Grande',
        'Badge', 'Categoria'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold')
        .setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      return jsonResponse([]);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse([]);

    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    const col = {
      nombre         : headers.indexOf('nombre'),
      estado         : headers.indexOf('estado'),
      descripcion    : headers.indexOf('descripcion'),
      precio_personal: headers.indexOf('precio_personal'),
      precio_mediana : headers.indexOf('precio_mediana'),
      precio_grande  : headers.indexOf('precio_grande'),
      badge          : headers.indexOf('badge'),
      categoria      : headers.indexOf('categoria')
    };
    if (col.nombre < 0) return jsonResponse([]);

    const result = [];
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      const nombre = (r[col.nombre] || '').toString().trim();
      if (!nombre) continue;

      const entry = { nombre };
      if (col.estado >= 0)          entry.estado          = (r[col.estado] || 'Disponible').toString().trim();
      if (col.descripcion >= 0)     entry.descripcion     = (r[col.descripcion] || '').toString().trim();
      if (col.precio_personal >= 0) entry.precio_personal = parseFloat(r[col.precio_personal]) || null;
      if (col.precio_mediana >= 0)  entry.precio_mediana  = parseFloat(r[col.precio_mediana])  || null;
      if (col.precio_grande >= 0)   entry.precio_grande   = parseFloat(r[col.precio_grande])   || null;
      if (col.badge >= 0)           entry.badge           = (r[col.badge] || '').toString().trim() || null;
      if (col.categoria >= 0)       entry.categoria       = (r[col.categoria] || '').toString().trim();
      result.push(entry);
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse([]);
  }
}

// ── Productos del Mercado (Sheet independiente) ───────────────
function getMercado() {
  try {
    const ss  = SpreadsheetApp.openById(MERCADO_SHEET_ID);
    let sheet = ss.getSheetByName(MERCADO_SHEET);

    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(MERCADO_SHEET);
      sheet.appendRow(['Nombre', 'Precio', 'Presentacion', 'Categoria', 'Descripcion', 'Imagen', 'Disponible']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      sheet.appendRow(['Azúcar Refino', 1.50, '1 lb', 'Alimentos', 'Azúcar blanca refinada', '', 'Si']);
      return jsonResponse([]);
    }

    if (sheet.getLastRow() < 2) return jsonResponse([]);

    const rows    = sheet.getDataRange().getValues();
    const headers = rows[0].map(h => h.toString().toLowerCase().trim());
    const col = {
      nombre      : headers.indexOf('nombre'),
      precio      : headers.indexOf('precio'),
      presentacion: headers.indexOf('presentacion'),
      categoria   : headers.indexOf('categoria'),
      descripcion : headers.indexOf('descripcion'),
      imagen      : headers.indexOf('imagen'),
      disponible  : headers.indexOf('disponible')
    };

    if (col.nombre < 0 || col.precio < 0) return jsonResponse([]);

    const result = [];
    for (let i = 1; i < rows.length; i++) {
      const r      = rows[i];
      const nombre = r[col.nombre].toString().trim();
      if (!nombre) continue;

      const disponible = col.disponible >= 0
        ? r[col.disponible].toString().trim().toLowerCase() !== 'no'
        : true;

      result.push({
        nombre      : nombre,
        precio      : parseFloat(r[col.precio]) || 0,
        presentacion: col.presentacion >= 0 ? r[col.presentacion].toString().trim() : '',
        categoria   : col.categoria   >= 0 ? r[col.categoria].toString().trim()   : 'General',
        descripcion : col.descripcion >= 0 ? r[col.descripcion].toString().trim()  : '',
        img         : col.imagen      >= 0 ? r[col.imagen].toString().trim()      : '',
        disponible  : disponible
      });
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse([]);
  }
}

// ── Valoraciones ──────────────────────────────────────────────
function saveRating(data) {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(VALORACIONES_SHEET) || ss.insertSheet(VALORACIONES_SHEET);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Producto', 'Estrellas', 'Timestamp', 'AnonID', 'Comentario']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.producto   || '',
      Number(data.estrellas) || 0,
      new Date().toISOString(),
      data.anonId     || '',
      data.comentario || ''
    ]);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function getRatings() {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(VALORACIONES_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return jsonResponse({});

    const rows   = sheet.getDataRange().getValues();
    const totals = {};

    for (let i = 1; i < rows.length; i++) {
      const producto  = String(rows[i][0]).trim();
      const estrellas = Number(rows[i][1]);
      if (!producto || !estrellas) continue;
      if (!totals[producto]) totals[producto] = { sum: 0, count: 0, dist: [0,0,0,0,0] };
      totals[producto].sum   += estrellas;
      totals[producto].count += 1;
      const idx = Math.round(estrellas) - 1;
      if (idx >= 0 && idx <= 4) totals[producto].dist[idx]++;
    }

    const out = {};
    for (const [producto, v] of Object.entries(totals)) {
      out[producto] = {
        avg:   Math.round(v.sum / v.count * 10) / 10,
        count: v.count,
        dist:  v.dist
      };
    }
    return jsonResponse(out);
  } catch (err) {
    return jsonResponse({});
  }
}

function getComments(producto, offset, limit) {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(VALORACIONES_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return jsonResponse({ comments: [], total: 0, hasMore: false });

    const rows    = sheet.getDataRange().getValues();
    const matches = [];

    for (let i = 1; i < rows.length; i++) {
      const prod       = String(rows[i][0]).trim();
      const estrellas  = Number(rows[i][1]);
      const timestamp  = String(rows[i][2]).trim();
      const comentario = String(rows[i][4]).trim();
      if (prod !== producto || !comentario) continue;
      matches.push({ stars: estrellas, text: comentario, date: timestamp });
    }

    matches.reverse();
    const total   = matches.length;
    const page    = matches.slice(offset, offset + limit);
    const hasMore = (offset + limit) < total;

    return jsonResponse({ comments: page, total, hasMore });
  } catch (err) {
    return jsonResponse({ comments: [], total: 0, hasMore: false });
  }
}

// ── Colores automáticos al editar Estado en Pedidos ───────────
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();

  if (sheet.getName() === 'Pedidos' && range.getColumn() === 12) {
    const estado    = range.getValue().toString().toLowerCase().trim();
    const row       = range.getRow();
    const numCols   = sheet.getLastColumn();
    if (row <= 1) return;

    let colorFondo = null;
    let colorTexto = '#000000';

    if (estado === 'entregado') { colorFondo = '#28a745'; colorTexto = '#ffffff'; }
    if (estado === 'cancelado') { colorFondo = '#dc3545'; colorTexto = '#ffffff'; }

    if (colorFondo) {
      sheet.getRange(row, 1, 1, numCols).setBackground(colorFondo);
      sheet.getRange(row, 1, 1, numCols).setFontColor(colorTexto);
    }
  }
}

// ── Utilidad ──────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
