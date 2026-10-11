# Despliegue en GitHub Pages

## Configuración Local

Antes de publicar, ejecuta la validación estática:
```bash
npm install
npm run validate
```

### Opción 1: Servidor Python (Recomendado)
```bash
python -m http.server 8000
```
Luego visita: http://localhost:8000

### Opción 2: Servidor Node.js
```bash
npm install
npm start
```

## Despliegue en GitHub Pages

### Opción 1: GitHub Actions (Recomendado - Método Moderno)

1. **Subir el código a GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Configurar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Navega a Settings > Pages
   - En "Source", selecciona "GitHub Actions"
   - El workflow ya está configurado en `.github/workflows/deploy.yml`
   - Las pull requests solo ejecutan la validación; el despliegue ocurre al hacer push a `main`.

3. **Activar GitHub Pages:**
   - El despliegue se ejecutará automáticamente con cada push a la rama `main`
   - Tu sitio estará disponible en: `https://rjgu.es`

### Opción 2: Rama gh-pages (Método Tradicional)

Si prefieres usar el método tradicional que ya conoces:

1. **Crear y cambiar a la rama gh-pages:**
   ```bash
   git checkout -b gh-pages
   git add .
   git commit -m "Deploy to gh-pages"
   git push origin gh-pages
   ```

2. **Configurar GitHub Pages:**
   - Ve a Settings > Pages en tu repositorio
   - En "Source", selecciona "Deploy from a branch"
   - Selecciona la rama "gh-pages"
   - Selecciona "/ (root)" como carpeta

3. **Para actualizaciones futuras:**
   ```bash
   # Hacer cambios en main
   git checkout main
   # ... hacer cambios ...
   git add .
   git commit -m "Update content"
   git push origin main
   
   # Desplegar a gh-pages
   git checkout gh-pages
   git merge main
   git push origin gh-pages
   ```

### Configurar dominio personalizado (ambas opciones):
- Ve a Settings > Pages en tu repositorio
- En "Custom domain", ingresa: `rjgu.es`
- Marca "Enforce HTTPS" (recomendado)
- El archivo CNAME ya está incluido en el repositorio

### Archivos importantes para el despliegue:

- `.github/workflows/deploy.yml` - Workflow de GitHub Actions
- `CNAME` - Configuración del dominio personalizado (rjgu.es)
- `index.html` - Página principal
- Todos los archivos estáticos (CSS, JS, imágenes)

### Configuración DNS para rjgu.es:

✅ **Tu configuración DNS actual está correcta:**

```
Tipo: CNAME
Nombre: www
Valor: rogertgu.github.io
```

**Configuración DNS completa recomendada:**

```
# Para el dominio raíz (rjgu.es)
Tipo: A
Nombre: @
Valor: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153

# Para IPv6 (opcional)
Tipo: AAAA
Nombre: @
Valor: 2606:50c0:8000::153
       2606:50c0:8001::153
       2606:50c0:8002::153
       2606:50c0:8003::153

# Para www (ya configurado ✅)
Tipo: CNAME
Nombre: www
Valor: rogertgu.github.io
```

### Notas:

- El sitio es completamente estático, no requiere servidor backend
- GitHub Pages sirve archivos estáticos directamente
- Los cambios se despliegan automáticamente al hacer push
- El dominio rjgu.es está configurado con el archivo CNAME
- Puede tomar hasta 24 horas para que los cambios DNS se propaguen
