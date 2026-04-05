const SHEET_ID           = '1JWFobYrSnDbrY03KrvyQhkO9A01EZvW4UIBfMKxTbak';
const PEDIDOS_SHEET      = 'Pedidos';
const INVENTARIO_SHEET   = 'Inventario';
const VALORACIONES_SHEET = 'Valoraciones';

// ── GET: devuelve inventario, valoraciones o número de pedido siguiente ──
function doGet(e) {
  const action = e.parameter.action || '';

  if (action === 'inventory') return getInventory();
  if (action === 'ratings')   return getRatings();
  if (action === 'comments')  return getComments(
    e.parameter.producto || '',
    parseInt(e.parameter.offset) || 0,
    parseInt(e.parameter.limit)  || 3
  );

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

    // Ruta pedido (comportamiento original tuyo)
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

    // Colorear fila nueva según tipo de pedido (tus colores originales)
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

// ── Guarda una valoración anónima en la hoja "Valoraciones" ───
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

// ── Devuelve promedios + distribución de estrellas por producto ──
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
        dist:  v.dist   // [n1★, n2★, n3★, n4★, n5★]
      };
    }
    return jsonResponse(out);
  } catch (err) {
    return jsonResponse({});
  }
}

// ── Devuelve comentarios con texto de un producto (paginados) ──
function getComments(producto, offset, limit) {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(VALORACIONES_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return jsonResponse({ comments: [], total: 0, hasMore: false });

    const rows    = sheet.getDataRange().getValues();
    const matches = [];

    // Recopilar filas con comentario no vacío del producto
    for (let i = 1; i < rows.length; i++) {
      const prod      = String(rows[i][0]).trim();
      const estrellas = Number(rows[i][1]);
      const timestamp = String(rows[i][2]).trim();
      const comentario = String(rows[i][4]).trim();
      if (prod !== producto || !comentario) continue;
      matches.push({ stars: estrellas, text: comentario, date: timestamp });
    }

    // Más recientes primero
    matches.reverse();
    const total   = matches.length;
    const page    = matches.slice(offset, offset + limit);
    const hasMore = (offset + limit) < total;

    return jsonResponse({ comments: page, total, hasMore });
  } catch (err) {
    return jsonResponse({ comments: [], total: 0, hasMore: false });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función que cambia el color de la fila automáticamente al editar el Estado.
 * Se activa en la columna L (12) de la hoja "Pedidos".
 */
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  
  // 1. Verificamos que sea la hoja "Pedidos" y la columna L (12)
  if (sheet.getName() === "Pedidos" && range.getColumn() === 12) {
    const estado = range.getValue().toString().toLowerCase().trim();
    const row = range.getRow();
    const numCols = sheet.getLastColumn();
    
    // Saltamos la fila 1 (encabezados)
    if (row <= 1) return;

    let colorFondo = null;
    let colorTexto = "#000000"; // Negro por defecto para lectura clara

    if (estado === "entregado") {
      colorFondo = "#28a745"; // Verde fuerte
      colorTexto = "#ffffff"; // Letra blanca para contraste
    } else if (estado === "cancelado") {
      colorFondo = "#dc3545"; // Rojo fuerte
      colorTexto = "#ffffff"; // Letra blanca
    }

    // Si el estado coincide, aplicamos el cambio a toda la fila
    if (colorFondo) {
      sheet.getRange(row, 1, 1, numCols).setBackground(colorFondo);
      sheet.getRange(row, 1, 1, numCols).setFontColor(colorTexto);
    }
  }
}
