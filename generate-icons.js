/**
 * generate-icons.js
 * Script para generar los iconos de la PWA en diferentes tamaños a partir del SVG base
 * 
 * Para ejecutar este script, necesitas tener instalado Node.js y sharp:
 * npm install
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuración
const SVG_SOURCE = path.join(__dirname, 'img/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, 'img/icons');
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Asegurarse de que el directorio de salida existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Directorio creado: ${OUTPUT_DIR}`);
}

// Función para generar los iconos
async function generateIcons() {
  console.log('Generando iconos para PWA...');
  
  try {
    // Verificar que el archivo SVG fuente existe
    if (!fs.existsSync(SVG_SOURCE)) {
      console.error(`Error: El archivo SVG fuente no existe en ${SVG_SOURCE}`);
      return;
    }
    
    // Generar cada tamaño directamente con sharp
    await Promise.all(ICON_SIZES.map(async size => {
      const outputFile = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

      console.log(`Generando icono de ${size}x${size} píxeles...`);
      await sharp(SVG_SOURCE)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      console.log(`✓ Icono generado: ${outputFile}`);
    }));
    
    console.log('\n¡Todos los iconos han sido generados con éxito!');
    console.log('\nPara usar estos iconos, asegúrate de que las rutas en manifest.json son correctas.');
  } catch (error) {
    console.error('Error al generar los iconos:', error.message);
    process.exitCode = 1;
  }
}

// Ejecutar la función principal
generateIcons();
