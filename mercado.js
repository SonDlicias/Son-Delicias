// mercado.js — Catálogo del Mercado (dinámico desde Google Sheets)

const SCRIPT_URL_MERCADO = 'https://script.google.com/macros/s/AKfycbwa5zphMRuekSJyOfs52j88VN-Z-Pf0HkqWQbSL1j43UvV4BBvBO6bM1fZ0NWi4HMys/exec';

// Caché en memoria — 2 min para tab switching rápido.
const MERCADO_MEM_TTL = 2 * 60 * 1000;
let _mercadoMemCache  = null;
let _mercadoMemTs     = 0;

// Datos de respaldo LOCAL — SOLO se usan si el Sheet no responde o está vacío.
// No se mezclan nunca con datos del sheet. Son el último recurso.
const MERCADO_LOCAL = [
  { nombre: "Jabón de Baño",       precio: 1.50, presentacion: "125 g",    categoria: "Aseo",      descripcion: "Jabón corporal",           img: "", disponible: true },
  { nombre: "Shampoo",             precio: 4.00, presentacion: "200 ml",   categoria: "Aseo",      descripcion: "Para todo tipo de cabello", img: "", disponible: true },
  { nombre: "Detergente en Polvo", precio: 3.50, presentacion: "500 g",    categoria: "Aseo",      descripcion: "Para ropa blanca y color",  img: "", disponible: true },
  { nombre: "Pasta Dental",        precio: 2.00, presentacion: "75 ml",    categoria: "Aseo",      descripcion: "Higiene bucal",             img: "", disponible: true },
  { nombre: "Aceite de Cocina",    precio: 3.50, presentacion: "1 litro",  categoria: "Alimentos", descripcion: "Aceite vegetal refinado",   img: "", disponible: true },
  { nombre: "Arroz",               precio: 2.00, presentacion: "1 kg",     categoria: "Alimentos", descripcion: "Grano largo seleccionado",  img: "", disponible: true },
  { nombre: "Frijoles Negros",     precio: 2.50, presentacion: "1 kg",     categoria: "Alimentos", descripcion: "Frijoles negros secos",     img: "", disponible: true },
  { nombre: "Sal Refinada",        precio: 0.75, presentacion: "500 g",    categoria: "Alimentos", descripcion: "Sal de mesa yodada",        img: "", disponible: true },
  { nombre: "Papel Higiénico",     precio: 2.50, presentacion: "4 rollos", categoria: "Hogar",     descripcion: "Doble hoja suave",          img: "", disponible: true },
  { nombre: "Bolsas de Basura",    precio: 1.50, presentacion: "10 uds",   categoria: "Hogar",     descripcion: "Resistentes, 20 litros",    img: "", disponible: true },
  { nombre: "Servilletas",         precio: 1.25, presentacion: "100 uds",  categoria: "Hogar",     descripcion: "Papel de 2 capas",          img: "", disponible: true }
];

/**
 * Normaliza un producto del Sheet a formato interno.
 */
function _normalizeSheetProduct(sp) {
  return {
    nombre      : (sp.nombre      || '').toString().trim(),
    precio      : parseFloat(sp.precio) || 0,
    presentacion: (sp.presentacion || sp.specs || '').toString().trim(),
    categoria   : (sp.categoria   || 'General').toString().trim(),
    descripcion : (sp.descripcion || '').toString().trim(),
    img         : (sp.img         || '').toString().trim(),
    disponible  : typeof sp.disponible === 'boolean' ? sp.disponible : true
  };
}

/**
 * Carga los productos del Mercado.
 *
 * Prioridad:
 *   1. Caché en memoria reciente (< 2 min) — evita fetch al cambiar de tab rápido
 *   2. Fetch fresco desde Google Sheets   — fuente de verdad única
 *   3. Respaldo local                     — SOLO si el sheet falla completamente
 *
 * IMPORTANTE: los datos del sheet son la única fuente de verdad.
 * Los datos locales NO se mezclan con el sheet — solo aparecen si
 * el fetch falla o el sheet devuelve un array vacío.
 */
async function fetchMercado() {
  const now = Date.now();

  // 1. Caché en memoria válida
  if (_mercadoMemCache && now - _mercadoMemTs < MERCADO_MEM_TTL) {
    return _mercadoMemCache;
  }

  // 2. Fetch fresco desde Google Sheets
  try {
    const res  = await fetch(`${SCRIPT_URL_MERCADO}?action=mercado&_t=${now}`, { cache: 'no-store' });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      // Solo datos del sheet, normalizados. Sin mezcla con local.
      const productos = data
        .map(_normalizeSheetProduct)
        .filter(p => p.nombre !== '');          // descartar filas vacías
      if (productos.length > 0) {
        _mercadoMemCache = productos;
        _mercadoMemTs    = now;
        return _mercadoMemCache;
      }
    }
  } catch (_) {}

  // 3. Respaldo local — solo si el sheet no respondió o está vacío
  return MERCADO_LOCAL;
}
