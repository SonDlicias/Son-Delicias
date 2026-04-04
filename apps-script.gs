/**
 * ═══════════════════════════════════════════════════════════════
 *  La Pizzería — Google Apps Script
 *  Versión: 1.0
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
 *  - "Pedidos"   → para registrar cada pedido
 *  - "Inventario" → para controlar disponibilidad del menú
 *
 * ═══════════════════════════════════════════════════════════════
 */

const SHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';
const PEDIDOS_SHEET  = 'Pedidos';
const INVENTARIO_SHEET = 'Inventario';

// ── GET: devuelve inventario o número de pedido siguiente ──────
function doGet(e) {
  const action = e.parameter.action || '';

  if (action === 'inventory') {
    return getInventory();
  }

  // Acción por defecto: devuelve el próximo número de pedido
  return ContentService
    .createTextOutput(JSON.stringify({ nextNum: getNextOrderNum() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── POST: guarda un pedido en la hoja "Pedidos" ────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(PEDIDOS_SHEET) || ss.insertSheet(PEDIDOS_SHEET);

    // Crear cabeceras si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Pedido #', 'Fecha', 'Hora', 'Tipo',
        'Nombre', 'CI', 'Mesa', 'Dirección', 'Referencia',
        'Productos', 'Total ($)', 'Estado'
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // Generar número de pedido
    const orderNum = generateOrderNum(sheet);

    // Agregar fila
    sheet.appendRow([
      orderNum,
      data.fecha  || new Date().toLocaleDateString('es-CU'),
      data.hora   || new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' }),
      data.tipo   || '',
      data.nombre || '',
      data.ci     || '',
      data.mesa   || '',
      data.direccion  || '',
      data.referencia || '',
      data.productos  || '',
      data.total  || '0.00',
      data.estado || 'Pendiente'
    ]);

    // Colorear fila nueva según tipo de pedido
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

// ── Genera número de pedido consecutivo ───────────────────────
function generateOrderNum(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 'PZ-001'; // solo cabecera

  // Buscar el último número en la columna A
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

    // Cabecera esperada: ID | Nombre | Categoría | Precio | Estado
    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    const nombreIdx = headers.indexOf('nombre');
    const estadoIdx = headers.indexOf('estado');
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
