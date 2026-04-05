// menu.js — Catálogo de pizzas
// Estructura compatible con el sistema de render existente (campos t, g, r, d, col, c, s, badge, fotos)
const G = [

  // ── CLÁSICAS ────────────────────────────────────────────────
  {
  t: 'Pizza Mixta',
  g: 'Especiales',
  r: 4.7,
  d: 'Combinación perfecta de jamón, pepperoni, cebolla y carne. Todos los sabores en un solo bocado.',
  c: 'img/pizza-mixta.jpg',
  col: '#1a0c04',
  price: 7.00,
  sizes: [
    { label: 'Personal', cm: 20, price: 7.00 },
    { label: 'Mediana', cm: 28, price: 11.00 },
    { label: 'Grande', cm: 35, price: 14.50 }
  ],
  s: 'Personal 20cm · Mediana 28cm · Grande 35cm',
  badge: null
},
{
  t: 'Pizza Mixta Completa',
  g: 'Especiales',
  r: 4.9,
  d: 'Nuestra mixta premium con jamón, pepperoni, cebolla y carne extra. La favorita de la casa.',
  c: 'img/pizza-mixta-negra.jpg',
  col: '#140a02',
  price: 8.00,
  sizes: [
    { label: 'Personal', cm: 20, price: 8.00 },
    { label: 'Mediana', cm: 28, price: 12.50 },
    { label: 'Grande', cm: 35, price: 16.00 }
  ],
  s: 'Personal 20cm · Mediana 28cm · Grande 35cm',
  badge: 'Oferta'
},
  {
    t: "Margherita",
    g: "Clásicas",
    r: 4.9,
    d: "La reina de las pizzas: salsa de tomate San Marzano, mozzarella fior di latte y hojas de albahaca fresca.",
    col: "#7a1a0a",
    c: "img/margherita.jpg",
    s: "Personal · Mediana · Grande",
    price: 8.50,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 8.50 },
      { label: "Mediana",  cm: 32, price: 12.00 },
      { label: "Grande",   cm: 40, price: 16.50 }
    ]
  },
   {
  t: 'Pizza Pepperoni',
  g: 'Clásicas',
  r: 4.8,
  d: 'La clásica de siempre. Abundante pepperoni sobre base de tomate y queso mozzarella derretido.',
  c: 'img/pizza-pepperoni.webp',
  col: '#1a0a04',
  price: 6.00,
  sizes: [
    { label: 'Personal', cm: 20, price: 6.00 },
    { label: 'Mediana', cm: 28, price: 9.50 },
    { label: 'Grande', cm: 35, price: 13.00 }
  ],
  s: 'Personal 20cm · Mediana 28cm · Grande 35cm',
  badge: null
},
  {
    t: "Cuatro Quesos",
    g: "Clásicas",
    r: 4.7,
    d: "Mozzarella, gorgonzola, parmesano y provolone sobre base blanca con un toque de romero.",
    col: "#6B4226",
    c: "img/cuatro-quesos.jpg",
    s: "Personal · Mediana · Grande",
    price: 10.00,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 10.00 },
      { label: "Mediana",  cm: 32, price: 14.50 },
      { label: "Grande",   cm: 40, price: 19.00 }
    ]
  },
  {
    t: "Napolitana",
    g: "Clásicas",
    r: 4.6,
    d: "Salsa de tomate, mozzarella, tomate cherry, aceitunas negras, anchoas y orégano fresco.",
    col: "#7a1a0a",
    c: "img/napolitana.jpg",
    s: "Personal · Mediana · Grande",
    price: 8.50,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 8.50 },
      { label: "Mediana",  cm: 32, price: 12.00 },
      { label: "Grande",   cm: 40, price: 16.50 }
    ]
  },

  // ── ESPECIALES ──────────────────────────────────────────────
  {
    t: "BBQ Chicken",
    g: "Especiales",
    r: 4.8,
    d: "Pollo a la parrilla, salsa BBQ casera, cebolla caramelizada, pimientos y mozzarella.",
    col: "#4a1a00",
    c: "img/bbq-chicken.jpg",
    s: "Personal · Mediana · Grande",
    price: 11.00,
    badge: "Estreno",
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 11.00 },
      { label: "Mediana",  cm: 32, price: 15.50 },
      { label: "Grande",   cm: 40, price: 21.00 }
    ]
  },
  {
    t: "Hawaiana",
    g: "Especiales",
    r: 4.5,
    d: "Jamón dulce y piña tropical caramelizada sobre salsa de tomate y mozzarella dorada.",
    col: "#7a4a00",
    c: "img/hawaiana.jpg",
    s: "Personal · Mediana · Grande",
    price: 10.00,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 10.00 },
      { label: "Mediana",  cm: 32, price: 14.00 },
      { label: "Grande",   cm: 40, price: 18.50 }
    ]
  },
  {
    t: "Mexicana",
    g: "Especiales",
    r: 4.7,
    d: "Carne molida sazonada, jalapeños, maíz tierno, salsa picante y mezcla de quesos gratinados.",
    col: "#6b1a00",
    c: "img/mexicana.jpg",
    s: "Personal · Mediana · Grande",
    price: 11.50,
    badge: "Oferta",
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 11.50 },
      { label: "Mediana",  cm: 32, price: 16.00 },
      { label: "Grande",   cm: 40, price: 21.50 }
    ]
  },
  {
    t: "Del Chef",
    g: "Especiales",
    r: 4.9,
    d: "Creación semanal exclusiva. Ingredientes premium seleccionados por nuestro chef. ¡Pregunta por el sabor de hoy!",
    col: "#1a2a0a",
    c: "img/del-chef.jpg",
    s: "Personal · Mediana · Grande",
    price: 13.00,
    badge: "Nuevo",
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 13.00 },
      { label: "Mediana",  cm: 32, price: 18.00 },
      { label: "Grande",   cm: 40, price: 24.00 }
    ]
  },

  // ── VEGETARIANAS ────────────────────────────────────────────
  {
    t: "Mediterránea",
    g: "Vegetarianas",
    r: 4.6,
    d: "Berenjenas, zucchini, pimientos asados, tomate cherry, aceitunas y rúcula fresca con aceite de oliva.",
    col: "#1a3a0a",
    c: "img/mediterranea.jpg",
    s: "Personal · Mediana · Grande",
    price: 10.50,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 10.50 },
      { label: "Mediana",  cm: 32, price: 14.50 },
      { label: "Grande",   cm: 40, price: 19.50 }
    ]
  },
  {
    t: "Verduras al Grill",
    g: "Vegetarianas",
    r: 4.5,
    d: "Mix de vegetales de temporada a la plancha con hummus, mozzarella y orégano sobre base de aceite de oliva.",
    col: "#1a3a0a",
    c: "img/verduras.jpg",
    s: "Personal · Mediana · Grande",
    price: 10.00,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 10.00 },
      { label: "Mediana",  cm: 32, price: 14.00 },
      { label: "Grande",   cm: 40, price: 18.50 }
    ]
  },

  // ── CARNES ──────────────────────────────────────────────────
  {
    t: "Carnicera",
    g: "Carnes",
    r: 4.8,
    d: "Carne molida, chorizo artesanal, tocino crocante y salchicha italiana sobre rica salsa de tomate.",
    col: "#3a0a0a",
    c: "img/carnicera.jpg",
    s: "Personal · Mediana · Grande",
    price: 12.50,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 12.50 },
      { label: "Mediana",  cm: 32, price: 17.50 },
      { label: "Grande",   cm: 40, price: 23.00 }
    ]
  },
  {
    t: "Americana",
    g: "Carnes",
    r: 4.6,
    d: "Hamburguesa artesanal, pepinillos, cheddar, cebolla crujiente y salsa especial de la casa.",
    col: "#3a0a0a",
    c: "img/americana.jpg",
    s: "Personal · Mediana · Grande",
    price: 11.50,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 11.50 },
      { label: "Mediana",  cm: 32, price: 16.00 },
      { label: "Grande",   cm: 40, price: 21.50 }
    ]
  },

  // ── MARISCOS ────────────────────────────────────────────────
  {
    t: "Frutti di Mare",
    g: "Mariscos",
    r: 4.7,
    d: "Camarones, mejillones, calamar y almejas en salsa de tomate con ajo y perejil fresco.",
    col: "#0a1a3a",
    c: "img/frutti-mare.jpg",
    s: "Personal · Mediana · Grande",
    price: 14.00,
    badge: null,
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 14.00 },
      { label: "Mediana",  cm: 32, price: 20.00 },
      { label: "Grande",   cm: 40, price: 27.00 }
    ]
  },
  {
    t: "Salmón Premium",
    g: "Mariscos",
    r: 4.8,
    d: "Salmón ahumado noruego, alcaparras, crema de queso, cebolla morada y eneldo sobre base blanca.",
    col: "#0a1a3a",
    c: "img/salmon.jpg",
    s: "Personal · Mediana · Grande",
    price: 14.50,
    badge: "Nuevo",
    fotos: [],
    sizes: [
      { label: "Personal", cm: 25, price: 14.50 },
      { label: "Mediana",  cm: 32, price: 20.50 },
      { label: "Grande",   cm: 40, price: 28.00 }
    ]
  },

  // ── PROMOS ──────────────────────────────────────────────────
  {
    t: "Combo Familiar",
    g: "Promos",
    r: 4.9,
    d: "Pizza Grande a elección + 2 bebidas + postre del día. ¡La mejor relación precio-calidad para toda la familia!",
    col: "#6b4a00",
    c: "img/combo-familiar.jpg",
    s: "Grande (40cm) + extras",
    price: 22.00,
    badge: "Oferta",
    fotos: [],
    sizes: [
      { label: "Combo Familiar", cm: 40, price: 22.00 }
    ]
  },
  {
    t: "Duo Romántico",
    g: "Promos",
    r: 4.8,
    d: "2 Pizzas Medianas a elección + 2 bebidas + vela incluida. Perfecta para una noche especial.",
    col: "#6b0a3a",
    c: "img/duo-romantico.jpg",
    s: "2x Mediana (32cm) + extras",
    price: 26.00,
    badge: "Estreno",
    fotos: [],
    sizes: [
      { label: "Duo Romántico", cm: 32, price: 26.00 }
    ]
  },
// ── PASTAS ────────────────────────────────────────────────────
{
  t: 'Lasaña de Carne',
  g: 'Pastas',
  r: 4.6,
  d: 'Lasaña hecha en casa con carne molida, salsa de tomate casera y queso gratinado en su punto.',
  c: 'img/lasagna-carne.jpg',
  col: '#2a1a0e',
  price: 4.50,
  sizes: [
    { label: 'Individual', cm: 0, price: 4.50 },
    { label: 'Porción doble', cm: 0, price: 8.00 }
  ],
  s: 'Individual · Porción doble',
  badge: null
},
{
  t: 'Espaguetis al Rojo',
  g: 'Pastas',
  r: 4.4,
  d: 'Espaguetis con salsa de tomate artesanal, hierbas frescas y abundante queso parmesano rallado.',
  c: 'img/espaguetis-rojo.webp',
  col: '#2a1208',
  price: 3.50,
  sizes: [
    { label: 'Individual', cm: 0, price: 3.50 },
    { label: 'Porción doble', cm: 0, price: 6.50 }
  ],
  s: 'Individual · Porción doble',
  badge: null
},

// ── ENTRANTES ─────────────────────────────────────────────────
{
  t: 'Tabla de Embutidos',
  g: 'Entrantes',
  r: 4.7,
  d: 'Selección de jamón, queso curado, queso azul, aceitunas y maní. Ideal para compartir.',
  c: 'img/tabla-embutidos.webp',
  col: '#1a1408',
  price: 5.50,
  sizes: [
    { label: 'Para 2', cm: 0, price: 5.50 },
    { label: 'Para 4', cm: 0, price: 9.50 }
  ],
  s: 'Para 2 · Para 4 personas',
  badge: 'Nuevo'
},

// ── POSTRES ───────────────────────────────────────────────────
{
  t: 'Postre en Vaso',
  g: 'Postres',
  r: 4.5,
  d: 'Cheesecake cremoso en vaso con dulce de leche, trocitos de almendra y coco rallado.',
  c: 'img/postre-vaso.webp',
  col: '#1e1208',
  price: 2.50,
  sizes: [
    { label: 'Individual', cm: 0, price: 2.50 }
  ],
  s: 'Porción individual',
  badge: null
},
];
