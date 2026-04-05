/**
 * ═══════════════════════════════════════════════════════════════
 *  La Pizzería — Google Apps Script
 *  Versión: 2.0 (con Valoraciones)
 * ═══════════════════════════════════════════════════════════════
 *
 *  CÓMO INSTALAR (solo una vez):
 *
 *  1. Ve a https://script.google.com y crea un nuevo proyecto
 *  2. Borra el código que aparece y pega TODO este archivo
 *  3. Cambia SHEET_ID por el ID de tu Google Sheet (está en la URL de la hoja)
 *     Ejemplo URL: docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
 *  4. Clic en "Desplegar" → "Nueva implementación"
 *  5. Tipo: Aplicación web
 *     Ejecutar como: Yo
 *     Quién tiene acceso: Cualquier persona
 *  6. Copia la URL que te da y pégala en index.html en la variable SCRIPT_URL
 *
 *  HOJAS NECESARIAS EN TU GOOGLE SHEET:
 *  - "Pedidos"      → para registrar cada pedido
 *  - "Inventario"   → para controlar disponibilidad del menú
 *  - "Valoraciones" → se crea automáticamente al primera valoración
 *
 * ═══════════════════════════════════════════════════════════════
 */

const SHEET_ID           = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';
const PEDIDOS_SHEET      = 'Pedidos';
const INVENTARIO_SHEET   = 'Inventario';
const VALORACIONES_SHEET = 'Valoraciones';

// ── GET: devuelve inventario, ratings o número de pedido siguiente ──
function doGet(e) {
  const action = e.parameter.action || '';

  if (action === 'inventory') return getInventory();
  if (action === 'ratings')   return getRatings();

  // Acción por defecto: devuelve el próximo número de pedido
  return ContentService
    .createTextOutput(JSON.stringify({ nextNum: getNextOrderNum() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── POST: guarda un pedido o una valoración ────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Ruta valoración anónima
    if (data.action === 'rating') {
      return saveRating(data);
    }

    // Ruta pedido (comportamiento original)
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
    const color = { delivery: '#0d3b2e', recoger: '#2e1a0d', table: '#1a1a2e' }[data.tipo] || '#1a1208';
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

// ── Guarda una valoración anónima ──────────────────────────────
function saveRating(data) {
  try {
    const ss     = SpreadsheetApp.openById(SHEET_ID);
    const sheet  = ss.getSheetByName(VALORACIONES_SHEET) || ss.insertSheet(VALORACIONES_SHEET);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Producto', 'Estrellas', 'Timestamp', 'AnonID']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.producto  || '',
      Number(data.estrellas) || 0,
      new Date().toISOString(),
      data.anonId    || ''
    ]);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ── Devuelve promedios de valoraciones por producto ────────────
function getRatings() {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(VALORACIONES_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return jsonResponse({});

    const rows = sheet.getDataRange().getValues();
    const totals = {}; // { producto: { sum, count } }

    for (let i = 1; i < rows.length; i++) {
      const producto  = String(rows[i][0]).trim();
      const estrellas = Number(rows[i][1]);
      if (!producto || !estrellas) continue;
      if (!totals[producto]) totals[producto] = { sum: 0, count: 0 };
      totals[producto].sum   += estrellas;
      totals[producto].count += 1;
    }

    const out = {};
    for (const [producto, v] of Object.entries(totals)) {
      out[producto] = {
        avg:   Math.round(v.sum / v.count * 10) / 10,
        count: v.count
      };
    }
    return jsonResponse(out);
  } catch (err) {
    return jsonResponse({});
  }
}

// ── Genera número de pedido consecutivo ───────────────────────
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

// ── Devuelve inventario desde la hoja "Inventario" ────────────
function getInventory() {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(INVENTARIO_SHEET);
    if (!sheet) return jsonResponse([]);

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse([]);

    const headers    = data[0].map(h => h.toString().toLowerCase().trim());
    const nombreIdx  = headers.indexOf('nombre');
    const estadoIdx  = headers.indexOf('estado');
    if (nombreIdx < 0 || estadoIdx < 0) return jsonResponse([]);

    const result = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[nombreIdx]) continue;
      result.push({
        nombre: row[nombreIdx].toString().trim(),
        estado: row[estadoIdx].toString().trim() || 'Disponible'
      });
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse([]);
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
