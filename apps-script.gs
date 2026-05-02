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
  if (action === 'hero')      return getHero();
  if (action === 'comments')  return getComments(
    e.parameter.producto || '',
    parseInt(e.parameter.offset) || 0,
    parseInt(e.parameter.limit)  || 3
  );

  return ContentService
    .createTextOutput(JSON.stringify({ nextNum: getNextOrderNum() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Validación y rate limit (anti-spam / anti-DoS) ───────────
const MAX_PAYLOAD_BYTES = 8 * 1024;     // 8 KB por request
const MAX_FIELD_LEN     = 500;          // límite por campo de texto
const MAX_PRODUCTOS_LEN = 4000;         // límite del campo productos
const RATE_WINDOW_SEC   = 60;           // ventana de 1 min
const RATE_MAX_REQS     = 60;           // máx 60 requests/min globales (anti-DoS)

function _checkRateLimit_() {
  try {
    const cache = CacheService.getScriptCache();
    const key   = 'rate_' + Math.floor(Date.now() / (RATE_WINDOW_SEC * 1000));
    const cur   = parseInt(cache.get(key)) || 0;
    if (cur >= RATE_MAX_REQS) return false;
    cache.put(key, String(cur + 1), RATE_WINDOW_SEC + 5);
    return true;
  } catch (err) {
    return true; // si el cache falla, no bloqueamos
  }
}

function _truncStr_(v, max) {
  if (v == null) return '';
  const s = String(v);
  return s.length > max ? s.slice(0, max) : s;
}

function _validateOrder_(data) {
  // Tipo de pedido permitido
  const tiposValidos = ['delivery', 'recoger', 'table', ''];
  if (data.tipo && tiposValidos.indexOf(String(data.tipo).toLowerCase()) === -1) {
    return 'Tipo de pedido inválido';
  }
  // Productos requeridos
  if (!data.productos || String(data.productos).trim() === '') {
    return 'Lista de productos vacía';
  }
  // Longitud productos
  if (String(data.productos).length > MAX_PRODUCTOS_LEN) {
    return 'Lista de productos demasiado larga';
  }
  // Total numérico razonable
  const tot = parseFloat(data.total);
  if (data.total !== undefined && (isNaN(tot) || tot < 0 || tot > 1000000)) {
    return 'Total inválido';
  }
  return null;
}

// ── Enrutador POST ────────────────────────────────────────────
function doPost(e) {
  try {
    // Validar tamaño del payload antes de parsear
    if (!e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Sin datos' });
    }
    if (e.postData.contents.length > MAX_PAYLOAD_BYTES) {
      return jsonResponse({ success: false, error: 'Payload demasiado grande' });
    }

    // Rate limit anti-DoS
    if (!_checkRateLimit_()) {
      return jsonResponse({ success: false, error: 'Demasiadas solicitudes, intenta en un minuto' });
    }

    const data = JSON.parse(e.postData.contents);

    if (data.action === 'rating') return saveRating(data);

    // Validar pedido antes de guardar
    const errMsg = _validateOrder_(data);
    if (errMsg) return jsonResponse({ success: false, error: errMsg });

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

    const orderNum = data.orderNumber || generateOrderNum(sheet);
    sheet.appendRow([
      _truncStr_(orderNum, 50),
      _truncStr_(data.fecha || new Date().toLocaleDateString('es-CU'), 30),
      _truncStr_(data.hora  || new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' }), 30),
      _truncStr_(data.tipo, 20),
      _truncStr_(data.nombre, 80),
      _truncStr_(data.ci, 30),
      _truncStr_(data.mesa, 10),
      _truncStr_(data.direccion, MAX_FIELD_LEN),
      _truncStr_(data.referencia, MAX_FIELD_LEN),
      _truncStr_(data.productos, MAX_PRODUCTOS_LEN),
      _truncStr_(data.total || '0.00', 30),
      _truncStr_(data.estado || 'Pendiente', 30)
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

// Columnas requeridas del Inventario en orden canónico
const INV_COLS = [
  'Nombre', 'Estado',
  'Descripcion',
  'Precio_Personal', 'Precio_Mediana', 'Precio_Grande',
  'Badge', 'Categoria', 'Foto',
  'Prioridad', 'Etiqueta_Comercial', 'Urgencia', 'Destacado'
];

// Añade las columnas faltantes a una hoja existente
function _ensureInvCols(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(h => h.toString().trim());
  INV_COLS.forEach(col => {
    if (!headers.some(h => h.toLowerCase() === col.toLowerCase())) {
      const newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue(col)
        .setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
    }
  });
}

// ── Inventario (catálogo completo + disponibilidad pizzería) ──
function getInventory() {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    let   sheet = ss.getSheetByName(INVENTARIO_SHEET);

    // Crear hoja con encabezado completo si no existe
    if (!sheet) {
      sheet = ss.insertSheet(INVENTARIO_SHEET);
      sheet.appendRow(INV_COLS);
      sheet.getRange(1, 1, 1, INV_COLS.length).setFontWeight('bold')
        .setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      return jsonResponse([]);
    }

    // Añadir columnas faltantes si la hoja ya existe con encabezado viejo
    if (sheet.getLastRow() >= 1) _ensureInvCols(sheet);

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse([]);

    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    const col = {
      nombre             : headers.indexOf('nombre'),
      estado             : headers.indexOf('estado'),
      descripcion        : headers.indexOf('descripcion'),
      precio_personal    : headers.indexOf('precio_personal'),
      precio_mediana     : headers.indexOf('precio_mediana'),
      precio_grande      : headers.indexOf('precio_grande'),
      badge              : headers.indexOf('badge'),
      categoria          : headers.indexOf('categoria'),
      foto               : headers.indexOf('foto'),
      prioridad          : headers.indexOf('prioridad'),
      etiqueta_comercial : headers.indexOf('etiqueta_comercial'),
      urgencia           : headers.indexOf('urgencia'),
      destacado          : headers.indexOf('destacado')
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
      if (col.foto >= 0)            entry.foto            = (r[col.foto] || '').toString().trim();
      if (col.prioridad >= 0)          entry.prioridad          = parseInt(r[col.prioridad]) || 0;
      if (col.etiqueta_comercial >= 0) entry.etiqueta_comercial = (r[col.etiqueta_comercial] || '').toString().trim() || null;
      if (col.urgencia >= 0)           entry.urgencia           = (r[col.urgencia] || '').toString().trim() || null;
      if (col.destacado >= 0)          entry.destacado          = (r[col.destacado] || '').toString().trim().toLowerCase() === 'si';
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
    // Validar entrada
    const stars = Number(data.estrellas);
    if (!data.producto || isNaN(stars) || stars < 1 || stars > 5) {
      return jsonResponse({ success: false, error: 'Datos de valoración inválidos' });
    }
    if (data.comentario && String(data.comentario).length > MAX_FIELD_LEN) {
      data.comentario = String(data.comentario).slice(0, MAX_FIELD_LEN);
    }

    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(VALORACIONES_SHEET) || ss.insertSheet(VALORACIONES_SHEET);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Producto', 'Estrellas', 'Timestamp', 'AnonID', 'Comentario']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      _truncStr_(data.producto, 100),
      Number(data.estrellas) || 0,
      new Date().toISOString(),
      _truncStr_(data.anonId, 50),
      _truncStr_(data.comentario, MAX_FIELD_LEN)
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

  if (sheet.getName() !== 'Pedidos') return;

  // ── Colorear fila según estado (columna L = 12) ──
  if (range.getColumn() === 12) {
    const estado  = range.getValue().toString().toLowerCase().trim();
    const row     = range.getRow();
    if (row <= 1) return;

    if (estado === 'entregado') {
      sheet.getRange(row, 1, 1, 12).setBackground('#28a745').setFontColor('#ffffff');
    } else if (estado === 'cancelado') {
      sheet.getRange(row, 1, 1, 12).setBackground('#dc3545').setFontColor('#ffffff');
    }

    // Recalcular resumen de ventas cada vez que cambia el estado
    actualizarVentasDiarias(sheet);
  }
}

// ── Resumen de ventas diarias (columnas N y O) ────────────────
// Llámala manualmente desde el editor para inicializar por primera vez,
// o se llama automáticamente al marcar un pedido como "entregado".
function actualizarVentasDiarias(sheet) {
  if (!sheet) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    sheet    = ss.getSheetByName(PEDIDOS_SHEET);
  }
  if (!sheet) return;

  const COL_FECHA  = 14; // N
  const COL_VENTA  = 15; // O
  const lastRow    = sheet.getLastRow();

  // ── Garantizar encabezados en N1:O1 ──
  sheet.getRange(1, COL_FECHA).setValue('Fecha');
  sheet.getRange(1, COL_VENTA).setValue('Venta Diaria');
  sheet.getRange(1, COL_FECHA, 1, 2)
    .setFontWeight('bold')
    .setBackground('#1a1a1a')
    .setFontColor('#ffffff');

  // ── Limpiar resumen anterior (desde N2 hasta el final del rango) ──
  if (lastRow >= 2) {
    sheet.getRange(2, COL_FECHA, lastRow - 1, 2).clearContent();
  }

  if (lastRow < 2) return;

  // ── Leer columnas B (fecha), K (total), L (estado) ──
  const data = sheet.getRange(2, 2, lastRow - 1, 11).getValues(); // B2:L
  // índices relativos: [0]=B, [9]=K, [10]=L

  const totalesPorFecha = {};
  data.forEach(row => {
    const estado = (row[10] || '').toString().toLowerCase().trim();
    if (estado !== 'entregado') return;

    const fechaRaw = row[0];
    if (!fechaRaw) return;

    // Normalizar fecha: puede ser Date (si Sheets la interpretó) o string
    let fechaStr;
    if (fechaRaw instanceof Date) {
      const d = fechaRaw;
      fechaStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    } else {
      fechaStr = fechaRaw.toString().trim();
    }
    if (!fechaStr) return;

    const total = parseFloat(String(row[9]).replace(/[^0-9.]/g, '')) || 0;
    totalesPorFecha[fechaStr] = (totalesPorFecha[fechaStr] || 0) + total;
  });

  const entries = Object.entries(totalesPorFecha);
  if (entries.length === 0) return;

  // Ordenar cronológicamente: dd/mm/yyyy → año, mes, día
  entries.sort((a, b) => {
    const toMs = s => {
      const p = s.split('/');
      return p.length === 3 ? new Date(p[2], p[1]-1, p[0]).getTime() : 0;
    };
    return toMs(a[0]) - toMs(b[0]);
  });

  // ── Escribir resumen ──
  const filas = entries.map(([fecha, total]) => [fecha, total]);
  sheet.getRange(2, COL_FECHA, filas.length, 2).setValues(filas);

  // Formato numérico para la columna O (venta)
  sheet.getRange(2, COL_VENTA, filas.length, 1).setNumberFormat('#,##0.00');

  // Alineación y ancho mínimo
  sheet.getRange(2, COL_FECHA, filas.length, 1).setHorizontalAlignment('center');
  sheet.getRange(2, COL_VENTA, filas.length, 1).setHorizontalAlignment('right');
}

// ── Hero dinámico (slides editables desde Google Sheets) ─────
function getHero() {
  try {
    const ss  = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName('Hero');

    if (!sheet) {
      sheet = ss.insertSheet('Hero');
      sheet.appendRow(['Orden', 'Producto', 'Titulo', 'Subtitulo', 'Etiqueta', 'CTA_Texto', 'Imagen', 'Activo']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      return jsonResponse([]);
    }

    if (sheet.getLastRow() < 2) return jsonResponse([]);

    const rows    = sheet.getDataRange().getValues();
    const headers = rows[0].map(h => h.toString().toLowerCase().trim());
    const col = {
      orden    : headers.indexOf('orden'),
      producto : headers.indexOf('producto'),
      titulo   : headers.indexOf('titulo'),
      subtitulo: headers.indexOf('subtitulo'),
      etiqueta : headers.indexOf('etiqueta'),
      cta      : headers.indexOf('cta_texto'),
      imagen   : headers.indexOf('imagen'),
      activo   : headers.indexOf('activo')
    };

    const result = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const activo = col.activo >= 0 ? r[col.activo].toString().trim().toLowerCase() !== 'no' : true;
      if (!activo) continue;

      result.push({
        orden    : col.orden >= 0    ? (parseInt(r[col.orden]) || i) : i,
        producto : col.producto >= 0 ? r[col.producto].toString().trim() : '',
        titulo   : col.titulo >= 0   ? r[col.titulo].toString().trim()   : '',
        subtitulo: col.subtitulo >= 0? r[col.subtitulo].toString().trim() : '',
        etiqueta : col.etiqueta >= 0 ? r[col.etiqueta].toString().trim() : '',
        cta      : col.cta >= 0      ? r[col.cta].toString().trim()      : '',
        imagen   : col.imagen >= 0   ? r[col.imagen].toString().trim()   : ''
      });
    }

    result.sort((a, b) => a.orden - b.orden);
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse([]);
  }
}

// ── Utilidad ──────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
