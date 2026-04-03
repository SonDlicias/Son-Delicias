// noticias.js — Novedades y promociones de la pizzería
(function () {
  const NOTICIAS = [
    {
      emoji: "🔥",
      titulo: "2x1 en Pizzas Clásicas",
      subtitulo: "Todos los martes",
      desc: "Ordena 2 pizzas medianas clásicas y paga solo una. Válido únicamente por WhatsApp. No acumulable con otras promociones.",
      color: "#D62828",
      wapp: "Hola, quiero aprovechar el 2x1 en Pizzas Clásicas del martes 🍕"
    },
    {
      emoji: "🆕",
      titulo: "Nueva Pizza: Salmón Premium",
      subtitulo: "¡Ya disponible!",
      desc: "Salmón ahumado noruego, alcaparras y crema de queso. Una experiencia única que no te podés perder. Disponible en todos los tamaños.",
      color: "#0D3B5E",
      wapp: "Hola, me interesa probar la nueva Pizza Salmón Premium 🐟"
    },
    {
      emoji: "🛵",
      titulo: "Delivery disponible",
      subtitulo: "Lunes a domingo · 12pm – 11pm",
      desc: "Recibí tu pedido en casa. Tiempo estimado: 30–45 minutos según tu zona. Pedido mínimo $15.",
      color: "#1a5a1a",
      wapp: "Hola, quiero hacer un pedido para delivery 🛵"
    },
    {
      emoji: "🍽️",
      titulo: "Auto-Servicio en Mesa",
      subtitulo: "Escaneá el QR de tu mesa",
      desc: "Hacé tu pedido directamente desde el teléfono sin esperar al mozo. Escaneá el código QR en tu mesa y listo.",
      color: "#6b4a00",
      wapp: "Hola, estoy en una mesa y quiero hacer un pedido 🍽️"
    },
    {
      emoji: "👨‍👩‍👧‍👦",
      titulo: "Combo Familiar",
      subtitulo: "Oferta permanente",
      desc: "Pizza Grande a elección + 2 bebidas + postre del día. Precio especial. Ideal para compartir en familia.",
      color: "#4a0a5a",
      wapp: "Hola, me interesa el Combo Familiar 👨‍👩‍👧‍👦"
    },
    {
      emoji: "🎉",
      titulo: "Reservas para Eventos",
      subtitulo: "Cumpleaños · Reuniones · Celebraciones",
      desc: "Reservá el local para tu evento especial. Menú personalizado, decoración incluida. Contactanos para armar tu paquete.",
      color: "#0a4a3a",
      wapp: "Hola, me interesa reservar para un evento 🎉"
    }
  ];

  const WA_NUMBER = '5355207586'; // ← Cambiar por el número real

  const container = document.getElementById('contenedor-noticias');
  if (!container) return;

  container.style.padding = '0';

  container.innerHTML = `
    <div style="font-size:13px;color:#aaa;text-align:center;padding:16px 0 8px;font-weight:700;letter-spacing:.5px">
      📣 NOVEDADES Y PROMOCIONES
    </div>
    ${NOTICIAS.map(n => `
      <div style="
        background:linear-gradient(145deg,#1a1208,#140e04);
        border:1px solid rgba(255,255,255,.07);
        border-left:4px solid ${n.color};
        border-radius:16px;
        padding:18px;
        margin-bottom:12px;
        cursor:pointer;
        -webkit-tap-highlight-color:transparent;
        transition:transform .15s;
        active:transform:scale(.98)
      " onclick="window.open('https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(n.wapp)}','_blank')">
        <div style="font-size:32px;margin-bottom:10px">${n.emoji}</div>
        <div style="font-size:16px;font-weight:900;margin-bottom:4px;color:#fff">${n.titulo}</div>
        <div style="font-size:11px;color:#E8A020;font-weight:800;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">${n.subtitulo}</div>
        <div style="font-size:13px;color:#ccc;line-height:1.7;margin-bottom:14px">${n.desc}</div>
        <div style="
          display:inline-flex;align-items:center;gap:6px;
          background:#25D366;border:none;border-radius:8px;
          padding:8px 14px;color:#fff;font-size:12px;font-weight:800;
        ">
          💬 Consultar por WhatsApp
        </div>
      </div>
    `).join('')}
    <div style="height:10px"></div>
  `;
})();
