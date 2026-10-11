#!/usr/bin/env bash
# Genera los PDF del CV (ES y EN) a partir de cv/es.html y cv/en.html con
# Chrome/Chromium en modo headless.
#   scripts/build-cv.sh            -> escribe en la raíz del repo
#   scripts/build-cv.sh <carpeta>  -> escribe en otra carpeta (previsualizar)
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$(cd "${1:-$root}" && pwd)"
chrome="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)}"

if [ -z "$chrome" ]; then
    echo "No encuentro Chrome/Chromium; indícalo con CHROME=/ruta/al/binario" >&2
    exit 1
fi

for lang in es en; do
    case "$lang" in
        es) name="Rogert-Guevara-CV.pdf" ;;
        en) name="Rogert-Guevara-CV-EN.pdf" ;;
    esac
    "$chrome" --headless=new --disable-gpu --no-pdf-header-footer \
        --virtual-time-budget=3000 \
        --print-to-pdf="$out/$name" "file://$root/cv/$lang.html" 2>/dev/null
    echo "✓ $out/$name"
done
