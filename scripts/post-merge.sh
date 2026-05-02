#!/bin/bash
# Post-merge script para Son D'licias (PWA estática).
# No hay dependencias que instalar ni build que correr — solo se sirve con `npx serve`.
# Mantenemos el script idempotente y rápido.
set -e

echo "[post-merge] Sitio estático: nada que instalar/compilar."
echo "[post-merge] Archivos en raíz:"
ls -1 *.html *.js *.css 2>/dev/null | head -20 || true

echo "[post-merge] OK"
