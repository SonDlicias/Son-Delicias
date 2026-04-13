// horarios.js — Motor centralizado de horarios comerciales "Son D'licias"
// Modificar SOLO aquí para ajustar horarios. No tocar otro archivo.

const HORARIOS = {
  // Mercado: siempre activo 24h (nunca se cierra).
  // Local físico: recoger y mesa disponibles en este rango.
  local: { abre: 9, cierra: 24 },        // 9:00 AM – 12:00 AM (medianoche)
  // Delivery: rango más restrictivo.
  delivery: { abre: 11, cierra: 17 }     // 11:00 AM – 5:00 PM
};

// ── Hora actual como decimal (ej: 14.5 = 2:30 PM) ────────────
function _hFloat() {
  const n = new Date();
  return n.getHours() + n.getMinutes() / 60;
}

/**
 * Evalúa el estado actual de cada modalidad.
 * @returns {{ localAbierto, deliveryActivo, recogerActivo, mesaActiva }}
 */
function getEstadoHorario() {
  const h = _hFloat();
  const localAbierto   = h >= HORARIOS.local.abre    && h < HORARIOS.local.cierra;
  const deliveryActivo = h >= HORARIOS.delivery.abre && h < HORARIOS.delivery.cierra;
  return {
    localAbierto,
    deliveryActivo,
    recogerActivo: localAbierto,
    mesaActiva:    localAbierto
  };
}

/**
 * Descripción del estado para el badge del hero.
 * @returns {{ texto: string, tipo: 'full'|'parcial'|'cerrado' }}
 */
function getMensajeHero() {
  const e = getEstadoHorario();
  if (e.localAbierto && e.deliveryActivo)
    return { texto: 'Abierto · Delivery disponible', tipo: 'full' };
  if (e.localAbierto)
    return { texto: 'Abierto · Solo recogida y mesa', tipo: 'parcial' };
  return { texto: 'Mercado 24h · Local cerrado', tipo: 'cerrado' };
}

/**
 * Texto informativo de horario para cada modalidad.
 * Se muestra debajo del botón cuando está deshabilitada.
 */
function getMensajeModalidad(tipo) {
  if (tipo === 'delivery') return '11:00 AM – 5:00 PM';
  return '9:00 AM – 12:00 AM';
}

/**
 * Primera modalidad disponible según el horario actual.
 * Retorna null si ninguna está disponible (madrugada, etc.).
 */
function getPrimerTipoValido() {
  const e = getEstadoHorario();
  if (e.deliveryActivo) return 'delivery';
  if (e.recogerActivo)  return 'recoger';
  return null;
}
