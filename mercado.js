// mercado.js — Catálogo del Mercado (dinámico desde Google Sheets)

const SCRIPT_URL_MERCADO = 'https://script.google.com/macros/s/AKfycbwa5zphMRuekSJyOfs52j88VN-Z-Pf0HkqWQbSL1j43UvV4BBvBO6bM1fZ0NWi4HMys/exec';

// Caché en memoria — 2 min para tab switching rápido.
// NO se usa localStorage: la disponibilidad debe ser fresca en cada carga de página.
const MERCADO_MEM_TTL = 2 * 60 * 1000;
let _mercadoMemCache  = null;
let _mercadoMemTs     = 0;

// Datos locales de respaldo (solo se usan si el Sheet está vacío o sin red)
const MERCADO_LOCAL = [
  { nombre: "Jabón de Baño",       precio: 1.50, presentacion: "125 g",   categoria: "Aseo",      emoji: "🧼",  img: "img/mercado/jabon.jpg",      disponible: true },
  { nombre: "Shampoo",             precio: 4.00, presentacion: "200 ml",  categoria: "Aseo",      emoji: "🧴",  img: "img/mercado/shampoo.jpg",     disponible: true },
  { nombre: "Detergente en Polvo", precio: 3.50, presentacion: "500 g",   categoria: "Aseo",      emoji: "🧺",  img: "img/mercado/detergente.jpg",  disponible: true },
  { nombre: "Pasta Dental",        precio: 2.00, presentacion: "75 ml",   categoria: "Aseo",      emoji: "🦷",  img: "img/mercado/pasta.jpg",       disponible: true },
  { nombre: "Aceite de Cocina",    precio: 3.50, presentacion: "1 litro", categoria: "Alimentos", emoji: "🫙",  img: "img/mercado/aceite.jpg",      disponible: true },
  { nombre: "Arroz",               precio: 2.00, presentacion: "1 kg",    categoria: "Alimentos", emoji: "🍚",  img: "img/mercado/arroz.jpg",       disponible: true },
  { nombre: "Frijoles Negros",     precio: 2.50, presentacion: "1 kg",    categoria: "Alimentos", emoji: "🫘",  img: "img/mercado/frijoles.jpg",    disponible: true },
  { nombre: "Sal Refinada",        precio: 0.75, presentacion: "500 g",   categoria: "Alimentos", emoji: "🧂",  img: "img/mercado/sal.jpg",         disponible: true },
  { nombre: "Papel Higiénico",     precio: 2.50, presentacion: "4 rollos",categoria: "Hogar",     emoji: "🧻",  img: "img/mercado/papel.jpg",       disponible: true },
  { nombre: "Bolsas de Basura",    precio: 1.50, presentacion: "10 uds",  categoria: "Hogar",     emoji: "🛍️", img: "img/mercado/bolsas.jpg",      disponible: true },
  { nombre: "Servilletas",         precio: 1.25, presentacion: "100 uds", categoria: "Hogar",     emoji: "📄",  img: "img/mercado/servilletas.jpg", disponible: true }
];

/**
 * Carga los productos del Mercado.
 *
 * Orden de prioridad:
 *   1. Caché en memoria reciente (< 2 min) → evita llamadas repetidas al cambiar de tab
 *   2. Fetch fresco desde Google Sheets    → fuente de verdad para disponibilidad
 *   3. Datos locales de respaldo           → solo si el Sheet falla o está vacío
 *
 * IMPORTANTE: no se usa localStorage para que cada carga de página
 * refleje el estado real de la hoja sin depender de datos viejos.
 */
async function fetchMercado() {
  const now = Date.now();

  // 1. Caché en memoria (dentro de la misma sesión, tab switching rápido)
  if (_mercadoMemCache && now - _mercadoMemTs < MERCADO_MEM_TTL) {
    return _mercadoMemCache;
  }

  // 2. Fetch fresco desde Google Sheets
  try {
    const res  = await fetch(`${SCRIPT_URL_MERCADO}?action=mercado&_t=${now}`, { cache: 'no-store' });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      _mercadoMemCache = _mergeMercado(data);
      _mercadoMemTs    = now;
      return _mercadoMemCache;
    }
  } catch (_) {}

  // 3. Respaldo local (sheet vacío o sin conexión)
  return MERCADO_LOCAL;
}

/**
 * Mezcla datos del Sheet con los locales.
 * - El Sheet tiene prioridad total (precio, disponibilidad, etc.)
 * - Productos del Sheet que no están en local se añaden como tarjetas nuevas.
 * - Productos locales que no están en el Sheet se mantienen como respaldo visual.
 */
function _mergeMercado(sheetData) {
  const norm     = s => s.toString().trim().toLowerCase();
  const localMap = new Map(MERCADO_LOCAL.map(p => [norm(p.nombre), { ...p }]));

  sheetData.forEach(sp => {
    const key   = norm(sp.nombre);
    const local = localMap.get(key) || {};
    localMap.set(key, {
      nombre      : sp.nombre,
      precio      : sp.precio,
      presentacion: sp.presentacion || local.presentacion || '',
      categoria   : sp.categoria   || local.categoria    || 'General',
      emoji       : sp.emoji       || local.emoji        || '🛒',
      img         : sp.img         || local.img          || '',
      disponible  : typeof sp.disponible === 'boolean' ? sp.disponible : true
    });
  });

  return [...localMap.values()];
}
