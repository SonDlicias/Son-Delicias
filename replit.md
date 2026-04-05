# La Pizzería — Menú Digital PWA

## Descripción
PWA estática mobile-first para menú digital y pedidos online de una pizzería. HTML/JS/CSS puro, sin frameworks.

## Archivos principales
- `index.html` — app completa (~2100 líneas)
- `menu.js` — catálogo de pizzas (array `G`)
- `bebidas.js` — catálogo de bebidas (array `BEBIDAS`)
- `noticias.js` — novedades/promociones
- `apps-script.gs` — código del backend en Google Apps Script (referencia local, se despliega en Google)
- `sw.js` — Service Worker PWA
- `site.webmanifest` — manifest de la app instalable

## Configuración importante
- **SCRIPT_URL**: `https://script.google.com/macros/s/AKfycbwa5zphMRuekSJyOfs52j88VN-Z-Pf0HkqWQbSL1j43UvV4BBvBO6bM1fZ0NWi4HMys/exec`
- **SHEET_ID**: `1JWFobYrSnDbrY03KrvyQhkO9A01EZvW4UIBfMKxTbak`
- **WhatsApp**: `5355207586`
- **GitHub Pages**: `sondelicias.github.io/Son-Delicias/` (sensible a mayúsculas)

## Versionado del Service Worker
Esquema acordado con el usuario — no usar números crecientes simples:

```
v5 → v5.0 → v5.0.0 → v5.0.1 → v5.0.2 → ... → v5.1 → v5.1.0 → v5.1.1 → ... → v5.2 → ...
```

Versión actual: `pizzeria-v5`

## Hojas de Google Sheets
- **Pedidos**: columnas Pedido# · Fecha · Hora · Tipo · Nombre · CI · Mesa · Dirección · Referencia · Productos · Total($) · Estado
- **Inventario**: columnas Nombre · Estado
- **Valoraciones**: columnas Producto · Estrellas · Timestamp · AnonID · Comentario

## Funcionalidades implementadas
- Hero auto-slide con 6 pizzas destacadas (`featured: true`)
- Carruseles por categoría + vista grid
- Cards con imagen, precio, badge, estado de inventario
- Sistema de pedidos: Delivery / Recoger / Mesa
- Carrito con cantidades y envío por WhatsApp
- Valoraciones anónimas (1 por producto por navegador, localStorage)
- Modal de reseñas estilo Amazon: barras proporcionales por estrella + comentarios paginados (3 en 3)
- Mini modal de valoración para bebidas (sin sheet de detalle)
- Búsqueda en tiempo real
- PWA instalable: manifest relativo (`./`), íconos sin márgenes, SW network-first

## Notas técnicas
- Los íconos PWA se generaron con `sharp`: recorte cuadrado centrado de `logo-app.png` (739×1024) → sin padding
- `start_url: "./"` y `scope: "./"` en el manifest para compatibilidad con GitHub Pages en subdirectorio
- Después de cada cambio en `apps-script.gs` hay que hacer nuevo Deploy en Google (Nueva versión)
- El SW borra cachés anteriores al activarse (solo conserva el CACHE_NAME actual)
