# Son Delicias — Menú Digital PWA

## Descripción
PWA estática mobile-first para menú digital y pedidos online. HTML/JS/CSS puro, sin frameworks. Incluye pizzería y mercado como economías independientes.

## Archivos principales
- `index.html` — app completa (~2300 líneas)
- `menu.js` — catálogo de pizzas (array `G`)
- `bebidas.js` — catálogo de bebidas (array `BEBIDAS`)
- `mercado.js` — productos del mercado (fetch dinámico desde Sheets + fallback local)
- `apps-script.gs` — backend en Google Apps Script (referencia local, se despliega en Google)
- `sw.js` — Service Worker PWA (versión actual: `pizzeria-v6.1.4`)
- `robots.txt` · `sitemap.xml` — SEO (raíz)
- `site.webmanifest` — manifest de la app instalable

## Configuración importante
- **SCRIPT_URL**: `https://script.google.com/macros/s/AKfycbwa5zphMRuekSJyOfs52j88VN-Z-Pf0HkqWQbSL1j43UvV4BBvBO6bM1fZ0NWi4HMys/exec`
- **WhatsApp**: `5355207586`
- **GitHub Pages**: `sondelicias.github.io/Son-Delicias/` (sensible a mayúsculas)

## Google Sheets — dos documentos independientes

### Sheet Pizzería (`1JWFobYrSnDbrY03KrvyQhkO9A01EZvW4UIBfMKxTbak`)
- **Pedidos**: Pedido# · Fecha · Hora · Tipo · Nombre · CI · Mesa · Dirección · Referencia · Productos · Total($) · Estado
- **Inventario**: Nombre · Estado
- **Valoraciones**: Producto · Estrellas · Timestamp · AnonID · Comentario

### Sheet Mercado — "Son D'licias" (`148MC038qatmyLPGaA3BbEwm7FgxmpBs4Ln57lrS55Wk`)
- **Productos**: Nombre · Precio · Presentacion · Categoria · Emoji · Imagen · Disponible
- Hoja independiente, acceso solo para el encargado del mercado
- Si la pestaña "Productos" no existe, el Apps Script la crea automáticamente

## Versionado del Service Worker
```
v5 → v5.0 → v5.0.0 → v5.0.1 → ... → v5.1 → v5.1.0 → v5.1.1 → ... → v5.2 → ...
```

## Funcionalidades implementadas
- Hero auto-slide con pizzas destacadas (`featured: true`) + hero dinámico desde hoja "Hero" en Sheets
- Carruseles por categoría + vista grid con jerarquía de productos (ancla/destacado/normal)
- Cards con imagen, precio, badge, estado de inventario, badges comerciales, auto-labels, urgencia
- Sistema comercial editable desde Sheets: Prioridad, Etiqueta_Comercial, Urgencia, Destacado
- Auto-labels basados en ratings reales: "Más reseñada", "Mejor valorada", "Popular"
- Sistema de pedidos: Delivery / Recoger / Mesa
- Carrito con cantidades y envío por WhatsApp
- Valoraciones anónimas (1 por producto por navegador)
- Modal de reseñas: barras proporcionales por estrella + comentarios paginados
- Tab Mercado: carga dinámica desde Sheets, caché 10 min, fallback local
- Búsqueda en tiempo real
- PWA instalable: manifest relativo (`./`), íconos sin márgenes, SW network-first
- Carga por fases: Fase 1 (render crítico), Fase 2 (datos dinámicos), Fase 3 (polling diferido)

## Inventario — columnas en Google Sheets
Nombre · Estado · Descripcion · Precio_Personal · Precio_Mediana · Precio_Grande · Badge · Categoria · Foto · Prioridad · Etiqueta_Comercial · Urgencia · Destacado

## Hoja Hero — columnas
Orden · Producto · Titulo · Subtitulo · Etiqueta · CTA_Texto · Imagen · Activo

## Notas técnicas
- Los íconos PWA se generaron con `sharp`: recorte cuadrado centrado de `logo-app.png`
- `start_url: "./"` y `scope: "./"` para compatibilidad con GitHub Pages en subdirectorio
- Después de cada cambio en `apps-script.gs` → nuevo Deploy en Google (Nueva versión, misma URL)
- El SW borra cachés anteriores al activarse (solo conserva el CACHE_NAME actual)
- Push a GitHub: hacerlo desde el panel Git de Replit (token expira)

## Auditoría de seguridad aplicada (mayo 2026)
- **XSS**: todo `innerHTML` con datos del Sheet pasa por `_escHtml()` (cards mercado/pizza/bebidas, hero, modal pizza, comentarios reseñas, carrito).
- **CSP** vía `<meta http-equiv>`: `default-src 'self'`, `'unsafe-inline'` para scripts/estilos (necesario por onclick=), `connect-src` permite `script.google.com`, bloquea fuentes externas no autorizadas.
- **Headers extra**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Apps Script** (`doPost`): valida tamaño payload (max 8 KB), rate limit anti-DoS 60 req/min global vía `CacheService`, valida `tipo` contra lista blanca, valida productos no vacío, valida `total` numérico [0,1M], trunca cada campo a longitud máxima antes de guardar.
- **Service Worker**: bypass para `script.google.com` y `script.googleusercontent.com` (no cachea respuestas dinámicas del backend).
- **SEO**: `meta description`, `keywords`, `robots`, `canonical`, OpenGraph completo (`og:url`, `og:locale`, `og:site_name`), Twitter Cards, `robots.txt` y `sitemap.xml` en raíz.
- **A11y**: `aria-label` en botones de ícono (carrito, limpiar búsqueda), `alt` agregados a imágenes faltantes (thumbnail carrito, modal pizza, carousel fotos).
- **Validación form**: input CI ahora con `pattern="\d{11}"` para validación HTML5 nativa.

## Mejoras post-auditoría (mayo 2026, v6.1.6)
- **Semántica + accesibilidad** (B3): `<div class="navtabs">` → `<nav aria-label="Navegación principal">`; `<div class="body">` → `<main id="main-content">`. CSS sin tocar (apunta a clases, no tags).
- **Logs solo en dev** (B1): helper `_isDev` (true en localhost/127.0.0.1/*.replit.dev). Todos los `console.warn/log` envueltos con guardia → silencio total en GitHub Pages.
- **Mensajes inline** (sustituye `alert()` en formulario): helpers `_showFieldError(id,msg)`, `_clearFieldErrors()`, `_showCartBanner(msg,kind)`. CSS: `.ofield-invalid`, `.field-msg`, `.cart-banner`. Banner `<div id="cart-form-banner">` antes de `order-fields`. Auto-limpia al escribir, scroll suave al primer error.
- **Timeouts en fetch**: helper `_fetchWithTimeout(url, opts, ms=10000)` con `AbortController`. Aplicado a todas las llamadas a Apps Script (8 en index.html: nextNum 8s, sendOrder 12s, bebidas/hero/inventory/poll/ratings/rating 10s) + mercado.js inline 10s. Evita que el menú se quede colgado en redes lentas.
- **SW v6.1.6**: bump de cache para forzar actualización en clientes existentes.
