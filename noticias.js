// noticias.js — Novedades dinámicas desde Google Sheets
(function () {

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwa5zphMRuekSJyOfs52j88VN-Z-Pf0HkqWQbSL1j43UvV4BBvBO6bM1fZ0NWi4HMys/exec';
  const WA_NUMBER  = '5355207586';

  // ── Colores por tipo (el dueño escribe la palabra, el código pone el color) ──
  const TIPO_COLOR = {
    promo   : '#D62828',  // rojo    — descuentos, 2x1
    nuevo   : '#1a5a1a',  // verde   — producto nuevo
    aviso   : '#b84d00',  // naranja — cierre, cambio de horario
    evento  : '#5a0a8a',  // morado  — reservas, celebraciones
    especial: '#7a5a00',  // dorado  — navidad, temporadas
  };
  const COLOR_DEFAULT = '#333';

  // ── Datos de respaldo (se usan si Google Sheets no responde) ──
  const FALLBACK = [
    {
      tipo: 'especial',
      titulo: 'Menú Especial Navideño',
      subtitulo: 'Reservá tu mesa ahora',
      desc: 'Esta temporada tenemos un menú exclusivo con sabores especiales. Plazas limitadas — contáctanos y asegurá tu lugar.',
      imagen: 'img/promo-navidena.webp',
      wapp: 'Hola, me interesa el menú especial navideño 🎄'
    },
    {
      tipo: 'aviso',
      titulo: 'Cerramos el 18 de marzo',
      subtitulo: 'Aviso importante',
      desc: 'Ese día no habrá servicio. Disculpe las molestias. Volvemos el 19 con toda la energía.',
      imagen: 'img/aviso-cierre.webp',
      wapp: 'Hola, vi el aviso de cierre del 18 de marzo, ¿cuándo retoman el servicio?'
    },
    {
      tipo: 'evento',
      titulo: 'Reservas para Eventos',
      subtitulo: 'Cumpleaños · Reuniones · Celebraciones',
      desc: 'Reservá el local para tu evento especial. Menú personalizado, decoración incluida. Contáctanos para armar tu paquete.',
      imagen: '',
      wapp: 'Hola, me interesa reservar para un evento 🎉'
    },
    {
      tipo: 'nuevo',
      titulo: 'Nueva Pizza: Salmón Premium',
      subtitulo: '¡Ya disponible!',
      desc: 'Salmón ahumado noruego, alcaparras y crema de queso. Una experiencia única que no te podés perder. Disponible en todos los tamaños.',
      imagen: '',
      wapp: 'Hola, me interesa probar la nueva Pizza Salmón Premium 🐟'
    },
    {
      tipo: 'promo',
      titulo: '2x1 en Pizzas Clásicas',
      subtitulo: 'Todos los martes',
      desc: 'Ordena 2 pizzas medianas clásicas y paga solo una. Válido únicamente por WhatsApp. No acumulable con otras promociones.',
      imagen: '',
      wapp: 'Hola, quiero aprovechar el 2x1 en Pizzas Clásicas del martes 🍕'
    },
  ];

  // ── Render ─────────────────────────────────────────────────────
  function renderNoticias(lista) {
    const container = document.getElementById('contenedor-noticias');
    if (!container) return;

    if (!lista || lista.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#666">
          <div style="font-size:40px;margin-bottom:12px">📭</div>
          <div style="font-size:14px">No hay novedades por el momento.</div>
        </div>`;
      return;
    }

    container.style.padding = '0';
    container.innerHTML = `
      <div style="font-size:13px;color:#aaa;text-align:center;padding:16px 0 8px;font-weight:700;letter-spacing:.5px">
        📣 NOVEDADES Y PROMOCIONES
      </div>
      ${lista.map(n => {
        const color  = TIPO_COLOR[n.tipo] || COLOR_DEFAULT;
        const waText = encodeURIComponent(n.wapp || 'Hola, vi una novedad en el menú');
        const waUrl  = `https://wa.me/${WA_NUMBER}?text=${waText}`;
        const imgHtml = n.imagen
          ? `<img src="${n.imagen}" alt="${n.titulo}" loading="lazy"
               style="width:100%;height:180px;object-fit:cover;border-radius:10px;margin-bottom:14px;display:block"
               onerror="this.style.display='none'">`
          : '';
        return `
        <div style="
          background:linear-gradient(145deg,#1a1208,#140e04);
          border:1px solid rgba(255,255,255,.07);
          border-left:4px solid ${color};
          border-radius:16px;
          padding:18px;
          margin-bottom:12px;
          cursor:pointer;
          -webkit-tap-highlight-color:transparent;
        " onclick="window.open('${waUrl}','_blank')">
          ${imgHtml}
          <div style="font-size:11px;color:${color};font-weight:800;margin-bottom:6px;text-transform:uppercase;letter-spacing:.6px">${n.subtitulo}</div>
          <div style="font-size:16px;font-weight:900;margin-bottom:10px;color:#fff">${n.titulo}</div>
          <div style="font-size:13px;color:#ccc;line-height:1.7;margin-bottom:14px">${n.desc}</div>
          <div style="
            display:inline-flex;align-items:center;gap:6px;
            background:#25D366;border-radius:8px;
            padding:8px 14px;color:#fff;font-size:12px;font-weight:800;
          ">💬 Consultar por WhatsApp</div>
        </div>`;
      }).join('')}
      <div style="height:10px"></div>`;
  }

  // ── Skeleton de carga ─────────────────────────────────────────
  function showSkeleton() {
    const container = document.getElementById('contenedor-noticias');
    if (!container) return;
    const card = `
      <div style="
        background:#1a1208;border:1px solid rgba(255,255,255,.07);
        border-left:4px solid #333;border-radius:16px;padding:18px;margin-bottom:12px
      ">
        <div style="height:180px;background:#2a2010;border-radius:10px;margin-bottom:14px"></div>
        <div style="height:10px;background:#2a2010;border-radius:4px;width:40%;margin-bottom:8px"></div>
        <div style="height:16px;background:#2a2010;border-radius:4px;width:75%;margin-bottom:10px"></div>
        <div style="height:12px;background:#2a2010;border-radius:4px;width:90%;margin-bottom:6px"></div>
        <div style="height:12px;background:#2a2010;border-radius:4px;width:70%"></div>
      </div>`;
    container.innerHTML = `
      <div style="font-size:13px;color:#aaa;text-align:center;padding:16px 0 8px;font-weight:700;letter-spacing:.5px">
        📣 NOVEDADES Y PROMOCIONES
      </div>
      ${card}${card}`;
  }

  // ── Caché en memoria (dura mientras la app esté abierta) ──────
  let _cache = null;
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

  function fetchAndCache(silent) {
    fetch(`${SCRIPT_URL}?action=noticias`)
      .then(r => r.json())
      .then(data => {
        const lista = Array.isArray(data) && data.length > 0 ? data : FALLBACK;
        _cache = { data: lista, ts: Date.now() };
        renderNoticias(lista);
      })
      .catch(() => {
        if (!silent) renderNoticias(_cache ? _cache.data : FALLBACK);
      });
  }

  // ── Carga con caché: instantáneo en revisitas, fresco al abrir ─
  function loadNoticias() {
    if (_cache) {
      renderNoticias(_cache.data);                       // muestra al instante
      if (Date.now() - _cache.ts > CACHE_TTL) {
        fetchAndCache(true);                             // refresca en silencio
      }
      return;
    }
    showSkeleton();
    fetchAndCache(false);
  }

  // ── Arrancar al cambiar a la pestaña Novedades ────────────────
  const _setTab = window.setTab;
  window.setTab = function (tab) {
    if (typeof _setTab === 'function') _setTab(tab);
    if (tab === 'noticias') loadNoticias();
  };

  // Si la pestaña ya está activa al cargar la página
  const secNoticias = document.getElementById('sec-noticias');
  if (secNoticias && secNoticias.style.display !== 'none') loadNoticias();

})();
