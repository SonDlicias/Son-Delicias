// mercado.js — Catálogo del Mercado (dinámico desde Google Sheets)

const SCRIPT_URL_MERCADO = 'https://script.google.com/macros/s/AKfycbwa5zphMRuekSJyOfs52j88VN-Z-Pf0HkqWQbSL1j43UvV4BBvBO6bM1fZ0NWi4HMys/exec';
const MERCADO_CACHE_KEY  = 'mercado_cache';
const MERCADO_CACHE_TTL  = 10 * 60 * 1000; // 10 minutos

// Datos locales de respaldo (se usan si la hoja está vacía o sin red)
const MERCADO_LOCAL = [
  { nombre: "Jabón de Baño",       precio: 1.50, presentacion: "125 g",  categoria: "Aseo",      emoji: "🧼", img: "img/mercado/jabon.jpg",       disponible: true },
  { nombre: "Shampoo",             precio: 4.00, presentacion: "200 ml", categoria: "Aseo",      emoji: "🧴", img: "img/mercado/shampoo.jpg",      disponible: true },
  { nombre: "Detergente en Polvo", precio: 3.50, presentacion: "500 g",  categoria: "Aseo",      emoji: "🧺", img: "img/mercado/detergente.jpg",   disponible: true },
  { nombre: "Pasta Dental",        precio: 2.00, presentacion: "75 ml",  categoria: "Aseo",      emoji: "🦷", img: "img/mercado/pasta.jpg",        disponible: true },
  { nombre: "Aceite de Cocina",    precio: 3.50, presentacion: "1 litro",categoria: "Alimentos", emoji: "🫙", img: "img/mercado/aceite.jpg",       disponible: true },
  { nombre: "Arroz",               precio: 2.00, presentacion: "1 kg",   categoria: "Alimentos", emoji: "🍚", img: "img/mercado/arroz.jpg",        disponible: true },
  { nombre: "Frijoles Negros",     precio: 2.50, presentacion: "1 kg",   categoria: "Alimentos", emoji: "🫘", img: "img/mercado/frijoles.jpg",     disponible: true },
  { nombre: "Sal Refinada",        precio: 0.75, presentacion: "500 g",  categoria: "Alimentos", emoji: "🧂", img: "img/mercado/sal.jpg",          disponible: true },
  { nombre: "Papel Higiénico",     precio: 2.50, presentacion: "4 rollos",categoria:"Hogar",     emoji: "🧻", img: "img/mercado/papel.jpg",        disponible: true },
  { nombre: "Bolsas de Basura",    precio: 1.50, presentacion: "10 uds", categoria: "Hogar",     emoji: "🛍️",img: "img/mercado/bolsas.jpg",       disponible: true },
  { nombre: "Servilletas",         precio: 1.25, presentacion: "100 uds",categoria: "Hogar",     emoji: "📄", img: "img/mercado/servilletas.jpg",  disponible: true }
];

// Cache en memoria para esta sesión
let _mercadoMemCache = null;
let _mercadoMemTs    = 0;

/**
 * Carga los productos del Mercado.
 * 1. Si hay caché en memoria reciente → la usa
 * 2. Si hay caché válida en localStorage → la usa
 * 3. Intenta fetch desde Google Sheets
 * 4. Si falla → usa datos locales de respaldo
 * Devuelve array de productos mezclando sheet + local (sheet tiene prioridad)
 */
async function fetchMercado() {
  const now = Date.now();

  // 1. Caché en memoria
  if (_mercadoMemCache && now - _mercadoMemTs < MERCADO_CACHE_TTL) {
    return _mercadoMemCache;
  }

  // 2. Caché en localStorage
  try {
    const raw = localStorage.getItem(MERCADO_CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (now - ts < MERCADO_CACHE_TTL && Array.isArray(data) && data.length > 0) {
        _mercadoMemCache = _mergeMercado(data);
        _mercadoMemTs    = now;
        return _mercadoMemCache;
      }
    }
  } catch (_) {}

  // 3. Fetch desde Sheets
  try {
    const res  = await fetch(`${SCRIPT_URL_MERCADO}?action=mercado`, { cache: 'no-store' });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      try { localStorage.setItem(MERCADO_CACHE_KEY, JSON.stringify({ ts: now, data })); } catch (_) {}
      _mercadoMemCache = _mergeMercado(data);
      _mercadoMemTs    = now;
      return _mercadoMemCache;
    }
  } catch (_) {}

  // 4. Respaldo local
  return MERCADO_LOCAL;
}

/**
 * Mezcla productos de Sheets con los locales.
 * - Productos del sheet reemplazan locales con el mismo nombre (normalizado).
 * - Productos nuevos en el sheet se añaden al final.
 * - Productos locales que no están en el sheet se mantienen.
 */
function _mergeMercado(sheetData) {
  const norm = s => s.toString().trim().toLowerCase();
  const localMap = new Map(MERCADO_LOCAL.map(p => [norm(p.nombre), { ...p }]));

  // Insertar / reemplazar con datos del sheet
  sheetData.forEach(sp => {
    const key = norm(sp.nombre);
    const local = localMap.get(key) || {};
    localMap.set(key, {
      nombre      : sp.nombre,
      precio      : sp.precio,
      presentacion: sp.presentacion || local.presentacion || '',
      categoria   : sp.categoria   || local.categoria   || 'General',
      emoji       : sp.emoji       || local.emoji       || '🛒',
      img         : sp.img         || local.img         || '',
      disponible  : sp.disponible  !== undefined ? sp.disponible : (local.disponible !== false)
    });
  });

  return [...localMap.values()];
}
