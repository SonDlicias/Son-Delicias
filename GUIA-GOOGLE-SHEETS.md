# Guía para llenar las Hojas de Google — Son Delicias

Esta guía explica paso a paso cómo llenar correctamente cada hoja de Google Sheets para que tu menú digital funcione sin problemas. No necesitas saber de programación, solo seguir estas instrucciones.

---

## Resumen rápido

Tu negocio usa **2 archivos de Google Sheets**:

| Archivo | Para qué sirve |
|---------|----------------|
| **Pizzería** | Todo lo de la pizzería: inventario de pizzas, pedidos, valoraciones de clientes y el banner principal (hero) |
| **Mercado** | Los productos del minimercado (economía aparte) |

---

## ARCHIVO 1: PIZZERÍA

Este archivo tiene **4 hojas** (pestañas abajo). Cada una controla una parte diferente del menú.

---

### HOJA 1: Inventario

**Para qué sirve:** Controlar qué pizzas aparecen, sus precios, si están disponibles, y cómo se ven en el menú.

**Columnas que debes llenar:**

| Columna | Qué poner | Ejemplo | Obligatoria |
|---------|-----------|---------|-------------|
| **Nombre** | El nombre exacto de la pizza tal como aparece en el menú | Pizza Hawaiana | Sí |
| **Estado** | Si está disponible o no | Disponible | Sí |
| **Descripcion** | Una descripción corta del producto | Jamón, piña y queso mozzarella | No |
| **Precio_Personal** | Precio del tamaño personal en CUP (solo el número) | 500 | No |
| **Precio_Mediana** | Precio del tamaño mediana en CUP | 800 | No |
| **Precio_Grande** | Precio del tamaño grande en CUP | 1200 | No |
| **Badge** | Etiqueta visual que aparece en diagonal sobre la foto | Oferta | No |
| **Categoria** | Categoría de la pizza | Especiales | No |
| **Foto** | Enlace (URL) de la imagen del producto | https://ejemplo.com/foto.jpg | No |
| **Prioridad** | Número del 1 al 10 que controla qué tan arriba aparece | 8 | No |
| **Etiqueta_Comercial** | Texto promocional que aparece sobre la foto | Recomendada por el Chef | No |
| **Urgencia** | Mensaje de urgencia que aparece con animación | Solo hoy | No |
| **Destacado** | Si quieres que se vea más grande en el carrusel | Si | No |

#### Cómo llenar cada columna correctamente:

**Nombre**
- Escribe el nombre exactamente como aparece en el menú
- Si escribes mal el nombre, el sistema no lo va a reconocer
- Ejemplo correcto: `Pizza Hawaiana`
- Ejemplo incorrecto: `pizza hawaiana` (puede no coincidir)

**Estado** — Solo puedes poner una de estas 3 opciones:

| Valor | Qué pasa |
|-------|----------|
| `Disponible` | La pizza aparece normal en el menú y se puede pedir |
| `Agotada` | La pizza aparece pero con un cartel de "Agotada hoy" y no se puede agregar al carrito |
| `Oculta` | La pizza desaparece completamente del menú |

**Precio_Personal / Precio_Mediana / Precio_Grande**
- Pon solo el número, sin letras ni símbolos
- Correcto: `500`
- Incorrecto: `500 CUP` o `$500`
- Si una pizza no tiene ese tamaño, deja la celda vacía

**Badge** — Etiqueta visual en diagonal sobre la foto. Puedes poner:

| Valor | Color que sale |
|-------|---------------|
| `Oferta` | Rojo |
| `Combo` | Naranja |
| `Recomendada` | Verde |
| `Especialidad` | Morado |
| `Nueva` | Verde claro |
| `De la Casa` | Gris elegante |

- Escribe el texto exacto de la tabla
- Solo pon UNA etiqueta por producto
- Si no quieres etiqueta, deja la celda vacía

**Prioridad** — Controla el orden y tamaño visual en el menú:

| Número | Qué significa | Cómo se ve |
|--------|--------------|------------|
| 9 o 10 | Producto estrella (ancla) | Tarjeta grande, aparece primero. Solo 1 por categoría |
| 7 u 8 | Producto destacado | Tarjeta mediana, aparece entre los primeros |
| 4 a 6 | Producto normal | Tarjeta estándar |
| 1 a 3 | Producto secundario | Tarjeta estándar, aparece al final |

- Si dejas la celda vacía, el producto tiene prioridad 0 (al final)
- No pongas más de 1 producto con prioridad 9-10 por categoría, porque solo uno se verá grande

**Etiqueta_Comercial** — Texto promocional libre que aparece sobre la foto:
- Puedes escribir lo que quieras, el sistema detecta palabras clave para elegir el color automáticamente
- Si tu texto contiene "oferta" → sale en rojo
- Si contiene "combo" → naranja
- Si contiene "recomendada" → verde
- Si contiene "especialidad" → morado
- Si contiene "nueva" → verde claro
- Si contiene "pedida" → dorado
- Si contiene "casa" → gris elegante
- Cualquier otro texto → sale con fondo transparente
- Ejemplos: `Oferta de temporada`, `Recomendada por el Chef`, `Nueva receta`

**Urgencia** — Mensaje animado que pulsa para llamar la atención:
- Si tu texto contiene la palabra "hoy" → sale en rojo fuerte (ejemplo: `Solo por hoy`)
- Si contiene "poca" → sale en naranja (ejemplo: `Pocas unidades`)
- Cualquier otro texto → sale en rojo por defecto
- Si no hay urgencia, deja la celda vacía

**Destacado**
- Pon `Si` si quieres que la tarjeta sea un poco más grande
- Deja vacío o pon `No` para tamaño normal

#### Ejemplo completo de una fila del Inventario:

| Nombre | Estado | Descripcion | Precio_Personal | Precio_Mediana | Precio_Grande | Badge | Categoria | Foto | Prioridad | Etiqueta_Comercial | Urgencia | Destacado |
|--------|--------|-------------|-----------------|----------------|---------------|-------|-----------|------|-----------|-------------------|----------|-----------|
| Pizza Hawaiana | Disponible | Jamón, piña y queso mozzarella | 500 | 800 | 1200 | Oferta | Especiales | https://foto.jpg | 8 | Recomendada por el Chef | Solo hoy | Si |

---

### HOJA 2: Hero

**Para qué sirve:** Controlar las imágenes grandes que rotan automáticamente en la parte superior del menú (el banner principal).

**Columnas que debes llenar:**

| Columna | Qué poner | Ejemplo | Obligatoria |
|---------|-----------|---------|-------------|
| **Orden** | Número que indica en qué posición aparece (1 = primero) | 1 | Sí |
| **Producto** | Nombre exacto de la pizza que quieres mostrar | Pizza Hawaiana | No* |
| **Titulo** | Título grande que se ve sobre la imagen | La Favorita de Todos | No* |
| **Subtitulo** | Texto pequeño debajo del título | Jamón, piña y queso real | No |
| **Etiqueta** | Etiqueta que aparece arriba del título | Especiales | No |
| **CTA_Texto** | Texto del botón de acción | Pedir ahora | No |
| **Imagen** | Enlace (URL) de la imagen de fondo | https://foto.jpg | No* |
| **Activo** | Si este slide está activo o no | Si | Sí |

*Al menos necesitas un **Producto** (para usar su foto y nombre del menú) o una **Imagen** con un **Titulo**. Si no pones ninguno, ese slide no aparece.

#### Reglas importantes:

1. **Orden**: Cada slide debe tener un número diferente. Si pones dos slides con el mismo número, solo aparece uno
2. **Producto**: Escribe el nombre exactamente como está en el Inventario. Si el nombre no coincide, el sistema no encontrará la pizza y usará solo la imagen
3. **Titulo**: Si lo dejas vacío y pusiste un Producto válido, se usa el nombre de la pizza automáticamente
4. **Subtitulo**: Si lo dejas vacío y pusiste un Producto válido, se usa la descripción de la pizza
5. **CTA_Texto**: Si lo dejas vacío, aparece "Ordenar ahora" por defecto
6. **Imagen**: Si la dejas vacía y pusiste un Producto válido, se usa la foto de la pizza del Inventario
7. **Activo**: Pon `Si` para que aparezca, `No` para ocultarlo sin borrarlo. Si dejas vacío, se asume que está activo
8. **Etiqueta**: Se colorea automáticamente igual que la Etiqueta_Comercial del Inventario (si contiene "oferta" → rojo, "recomendada" → verde, etc.)

#### Ejemplo completo:

| Orden | Producto | Titulo | Subtitulo | Etiqueta | CTA_Texto | Imagen | Activo |
|-------|----------|--------|-----------|----------|-----------|--------|--------|
| 1 | Pizza Mixta Completa | | | Especiales | Pedir ahora | | Si |
| 2 | | Promo del Día | 2 medianas por el precio de 1 grande | Oferta | Ver promo | https://promo.jpg | Si |
| 3 | Pizza Hawaiana | La Tropical | Sabor del Caribe | Nueva | | | Si |
| 4 | Pizza BBQ Chicken | | | | | | No |

En este ejemplo:
- Slide 1: Usa la foto y nombre de la Pizza Mixta Completa del menú
- Slide 2: Usa una imagen propia con texto personalizado (no está ligado a ninguna pizza)
- Slide 3: Usa la foto de la Pizza Hawaiana pero con título y subtítulo personalizados
- Slide 4: Está desactivado (no aparece)

---

### HOJA 3: Pedidos

**Para qué sirve:** Aquí llegan automáticamente todos los pedidos que hacen los clientes desde el menú digital. Tú no tienes que llenar esta hoja, solo revisarla y actualizar el estado.

**Columnas (se llenan solas):**

| Columna | Qué contiene |
|---------|-------------|
| Pedido # | Número único del pedido (PZ-001, PZ-002...) |
| Fecha | Fecha del pedido |
| Hora | Hora del pedido |
| Tipo | Delivery, Recoger o Mesa |
| Nombre | Nombre del cliente |
| CI | Carnet de identidad del cliente |
| Mesa | Número de mesa (si aplica) |
| Dirección | Dirección de entrega (si es delivery) |
| Referencia | Referencia adicional de la dirección |
| Productos | Lista de lo que pidió |
| Total ($) | Monto total en CUP |
| Estado | Estado actual del pedido |

**Lo único que tú cambias es la columna "Estado":**

| Valor | Qué pasa |
|-------|----------|
| `Pendiente` | El pedido acaba de llegar (aparece con fondo claro) |
| `Entregado` | El pedido ya se entregó (la fila se pone verde y se suma a las ventas del día) |
| `Cancelado` | El pedido se canceló (la fila se pone roja) |

**Ventas del día**: En las columnas N y O aparece automáticamente un resumen de ventas por fecha. Solo cuenta los pedidos marcados como "Entregado". No toques esas columnas, se actualizan solas.

---

### HOJA 4: Valoraciones

**Para qué sirve:** Aquí se guardan automáticamente las opiniones y estrellas que los clientes dejan sobre las pizzas. No necesitas tocar esta hoja para nada.

**Columnas (se llenan solas):**

| Columna | Qué contiene |
|---------|-------------|
| Producto | Nombre de la pizza que valoraron |
| Estrellas | Calificación de 1 a 5 |
| Timestamp | Fecha y hora exacta de la valoración |
| AnonID | Identificador anónimo del cliente |
| Comentario | Lo que escribió el cliente |

**Etiquetas automáticas basadas en valoraciones:**
- Si una pizza tiene 5 o más valoraciones y es la que más tiene, aparece con la etiqueta "MÁS PEDIDA" en dorado
- Si una pizza tiene 3 o más valoraciones con promedio de 4.5 o más estrellas, aparece como "TOP ⭐" en azul
- Estas etiquetas aparecen solas, no tienes que hacer nada
- Si pones una Etiqueta_Comercial manual en el Inventario, esa siempre tiene prioridad sobre las automáticas

---

## ARCHIVO 2: MERCADO

Este archivo tiene **1 hoja** llamada "Productos".

---

### HOJA: Productos

**Para qué sirve:** Controlar los productos del minimercado (víveres, artículos de limpieza, etc.).

**Columnas que debes llenar:**

| Columna | Qué poner | Ejemplo | Obligatoria |
|---------|-----------|---------|-------------|
| **Nombre** | Nombre del producto | Azúcar Refino | Sí |
| **Precio** | Precio en CUP (solo el número) | 150 | Sí |
| **Presentacion** | Tamaño o formato del producto | 1 lb | No |
| **Categoria** | Categoría del producto | Alimentos | No |
| **Descripcion** | Descripción corta | Azúcar blanca refinada | No |
| **Imagen** | Enlace (URL) de la foto | https://foto.jpg | No |
| **Disponible** | Si el producto está disponible | Si | No |

#### Reglas:

- **Nombre**: Obligatorio. Sin nombre, el producto no aparece
- **Precio**: Obligatorio. Pon solo el número sin letras. Correcto: `150`. Incorrecto: `150 CUP`
- **Categoria**: Si la dejas vacía, el producto aparece en la categoría "General"
- **Disponible**: Pon `Si` o deja vacío para que aparezca. Pon `No` para ocultarlo sin borrarlo

#### Ejemplo completo:

| Nombre | Precio | Presentacion | Categoria | Descripcion | Imagen | Disponible |
|--------|--------|-------------|-----------|-------------|--------|------------|
| Azúcar Refino | 150 | 1 lb | Alimentos | Azúcar blanca refinada | | Si |
| Jabón de baño | 200 | Unidad | Aseo | Jabón perfumado | https://foto.jpg | Si |
| Aceite de cocina | 350 | 1 litro | Alimentos | Aceite vegetal | | No |

---

## Errores comunes y cómo evitarlos

| Error | Problema | Solución |
|-------|----------|----------|
| Escribir el nombre diferente en el Hero y en el Inventario | El sistema no encuentra la pizza y el slide sale sin datos | Copia y pega el nombre exacto del Inventario |
| Poner letras en los precios | El precio no se lee correctamente | Pon solo números: `500`, no `500 CUP` |
| Poner dos slides del Hero con el mismo Orden | Solo aparece uno de los dos | Usa números diferentes: 1, 2, 3... |
| Dejar el Estado vacío en el Inventario | El producto aparece como "Disponible" por defecto | Siempre pon el estado explícitamente |
| Poner un Badge que no existe | Sale una etiqueta visual genérica sin color especial | Usa solo: Oferta, Combo, Recomendada, Especialidad, Nueva, De la Casa |
| Borrar la primera fila (encabezados) | La hoja deja de funcionar | Nunca borres la primera fila de ninguna hoja |
| Poner Prioridad 9-10 a muchos productos de la misma categoría | Solo el primero sale grande, los demás salen normales | Pon 9-10 solo a 1 producto por categoría |

---

## Resumen: qué hojas tocas y cuáles no

| Hoja | Tú la llenas | Se llena sola |
|------|-------------|---------------|
| Inventario | Sí | |
| Hero | Sí | |
| Pedidos | Solo cambias el Estado | El resto se llena solo |
| Valoraciones | | Sí, toda |
| Productos (Mercado) | Sí | |

---

## Cuándo se ven los cambios

- Los cambios que hagas en las hojas se reflejan en el menú digital **en unos segundos** (la próxima vez que alguien abra la página o cada pocos minutos automáticamente)
- No necesitas reiniciar nada ni avisar a nadie
- Si algo no se ve, pide al cliente que recargue la página
