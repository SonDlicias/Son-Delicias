// bebidas.js — Catálogo de bebidas estático
const BEBIDAS = [

  // ── CÓCTELES ──────────────────────────────────────────────────
{
  nombre: 'Cóctel Spritz',
  precio: 2.50,
  img: 'img/coctel-spritz.jpg',
  emoji: '🍊',
  disponible: true,
  specs: 'Naranja · Cava · Hielo · Rodaja deshidratada'
},
{
  nombre: 'Cóctel Tropical',
  precio: 2.75,
  img: 'img/coctel-tropical.jpg',
  emoji: '🍹',
  disponible: true,
  specs: 'Piña · Mango · Limón · Sombrillita decorativa'
},
{
  nombre: 'Limonada Frappé',
  precio: 1.75,
  img: 'img/limonada-frappe.jpg',
  emoji: '🍋',
  disponible: true,
  specs: 'Limón natural · Hielo triturado · Menta fresca'
},
{
  nombre: 'Cóctel Carambola',
  precio: 3.00,
  img: 'img/coctel-carambola.jpg',
  emoji: '⭐',
  disponible: true,
  specs: 'Carambola · Piña · Base roja tropical · Decoración frutal'
},

// ── CAFÉ ──────────────────────────────────────────────────────
{
  nombre: 'Servicio de Café',
  precio: 1.25,
  img: 'img/cafe-dulces.jpg',
  emoji: '☕',
  disponible: true,
  specs: 'Espresso + café con leche · Con galleta y dulces de cortesía'
},
  // ── GASEOSAS ────────────────────────────────────────────────
  {
    nombre: "Coca-Cola",
    categoria: "Gaseosas",
    precio: 2.50,
    specs: "500ml · Lata fría",
    emoji: "🥤",
    img: "img/coca-cola.jpg",
    disponible: true
  },
  {
    nombre: "Sprite",
    categoria: "Gaseosas",
    precio: 2.50,
    specs: "500ml · Lata fría",
    emoji: "🥤",
    img: "img/sprite.jpg",
    disponible: true
  },
  {
    nombre: "Fanta Naranja",
    categoria: "Gaseosas",
    precio: 2.50,
    specs: "500ml · Lata fría",
    emoji: "🍊",
    img: "img/fanta.jpg",
    disponible: true
  },

  // ── AGUA ────────────────────────────────────────────────────
  {
    nombre: "Agua Mineral",
    categoria: "Agua",
    precio: 1.50,
    specs: "500ml · Sin gas",
    emoji: "💧",
    img: "img/agua.jpg",
    disponible: true
  },
  {
    nombre: "Agua con Gas",
    categoria: "Agua",
    precio: 1.80,
    specs: "500ml · Con gas natural",
    emoji: "💧",
    img: "img/agua-gas.jpg",
    disponible: true
  },

  // ── JUGOS ───────────────────────────────────────────────────
  {
    nombre: "Jugo Natural de Naranja",
    categoria: "Jugos",
    precio: 3.50,
    specs: "400ml · Exprimido al momento",
    emoji: "🍊",
    img: "img/jugo-naranja.jpg",
    disponible: true
  },
  {
    nombre: "Limonada Casera",
    categoria: "Jugos",
    precio: 3.00,
    specs: "400ml · Con menta fresca",
    emoji: "🍋",
    img: "img/limonada.jpg",
    disponible: true
  },

  // ── CERVEZAS ────────────────────────────────────────────────
  {
    nombre: "Cerveza Artesanal IPA",
    categoria: "Cervezas",
    precio: 4.50,
    specs: "355ml · Botella · +18",
    emoji: "🍺",
    img: "img/cerveza-ipa.jpg",
    disponible: true
  },
  {
    nombre: "Cerveza Rubia",
    categoria: "Cervezas",
    precio: 3.50,
    specs: "355ml · Lata fría · +18",
    emoji: "🍺",
    img: "img/cerveza-rubia.jpg",
    disponible: true
  },

  // ── VINOS ───────────────────────────────────────────────────
  {
    nombre: "Copa de Vino Tinto",
    categoria: "Vinos",
    precio: 5.00,
    specs: "150ml · Malbec · +18",
    emoji: "🍷",
    img: "img/vino-tinto.jpg",
    disponible: true
  },
  {
    nombre: "Copa de Vino Blanco",
    categoria: "Vinos",
    precio: 5.00,
    specs: "150ml · Chardonnay · +18",
    emoji: "🥂",
    img: "img/vino-blanco.jpg",
    disponible: false
  },

  // ── POSTRES ─────────────────────────────────────────────────
  {
    nombre: "Tiramisú",
    categoria: "Postres",
    precio: 4.50,
    specs: "Porción individual · Receta italiana",
    emoji: "🍮",
    img: "img/tiramisu.jpg",
    disponible: true
  },
  {
    nombre: "Panna Cotta",
    categoria: "Postres",
    precio: 4.00,
    specs: "Con coulis de frutos rojos",
    emoji: "🍮",
    img: "img/panna-cotta.jpg",
    disponible: true
  }

];
