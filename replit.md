# Son Delicias — Menú Digital PWA

## Descripción
PWA estática mobile-first para menú digital y pedidos online. HTML/JS/CSS puro, sin frameworks. Incluye pizzería y mercado como economías independientes.

## Archivos principales
- `index.html` — app completa (~2300 líneas)
- `menu.js` — catálogo de pizzas (array `G`)
- `bebidas.js` — catálogo de bebidas (array `BEBIDAS`)
- `mercado.js` — productos del mercado (fetch dinámico desde Sheets + fallback local)
- `apps-script.gs` — backend en Google Apps Script (referencia local, se despliega en Google)
- `sw.js` — Service Worker PWA (versión actual: `pizzeria-v5.1.0`)
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
- Hero auto-slide con pizzas destacadas (`featured: true`)
- Carruseles por categoría + vista grid
- Cards con imagen, precio, badge, estado de inventario
- Sistema de pedidos: Delivery / Recoger / Mesa
- Carrito con cantidades y envío por WhatsApp
- Valoraciones anónimas (1 por producto por navegador)
- Modal de reseñas: barras proporcionales por estrella + comentarios paginados
- Tab Mercado: carga dinámica desde Sheets, caché 10 min, fallback local
- Búsqueda en tiempo real
- PWA instalable: manifest relativo (`./`), íconos sin márgenes, SW network-first

## Notas técnicas
- Los íconos PWA se generaron con `sharp`: recorte cuadrado centrado de `logo-app.png`
- `start_url: "./"` y `scope: "./"` para compatibilidad con GitHub Pages en subdirectorio
- Después de cada cambio en `apps-script.gs` → nuevo Deploy en Google (Nueva versión, misma URL)
- El SW borra cachés anteriores al activarse (solo conserva el CACHE_NAME actual)
- Push a GitHub: hacerlo desde el panel Git de Replit (token expira)
