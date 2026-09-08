# GlowRitual — Landing Page

Carpeta independiente para la landing de e-commerce de GlowRitual (mascarilla
LED de fototerapia facial). Separada del sitio de BaseCode y de las demás
carpetas del proyecto para que no se mezcle nada.

## Archivos

- `index.html` — la landing completa (HTML + Tailwind CDN + JS vanilla, sin
  build step, igual que el resto del repo). Ábrela directo en el navegador
  para verla, o despliégala en Vercel/Netlify/GitHub Pages tal cual.

## ⚠️ Antes de publicarla de verdad, reemplaza esto

El archivo trae marcado con comentarios `<!-- ... -->` cada lugar que es
un **placeholder** y no debe salir a producción tal cual:

1. **Imagen del producto** (sección Hero): hoy hay un círculo con degradado
   como marcador visual. Reemplázalo por una foto o video real del producto
   encendido en cuanto te llegue la muestra (puedes generarlo con el
   pipeline de `glowritual-video-pipeline/` o simplemente subir una foto).
2. **Testimonios**: son de ejemplo, marcados como "(reseña de ejemplo)".
   Nunca los dejes así en producción — sustitúyelos por reseñas reales de
   clientas. Publicar testimonios inventados como si fueran reales es
   información engañosa (además de un riesgo legal y de cuenta de ads).
3. **Antes/Después**: son bloques de color de referencia. Sustitúyelos por
   fotos reales de clientas con su autorización explícita para usar su imagen.
4. **Cifras** ("+2,400 clientas felices", "quedan 23 unidades"): son
   ilustrativas. Actualízalas con tus números reales de ventas/inventario.
5. **Enlaces**: redes sociales, política de privacidad y términos apuntan
   a `#` — conéctalos a tus páginas reales.
6. **Countdown de la oferta**: hoy se reinicia cada 24h automáticamente
   (para mantener la sensación de urgencia sin fecha fija). Si prefieres
   una oferta con fecha de cierre real, dime y lo cambio a una fecha fija.

## Cómo verla

Simplemente abre `index.html` en cualquier navegador — no necesita servidor
ni instalación. Es mobile-first: pruébala también achicando la ventana o
desde el celular.

## Deploy

Igual que el sitio principal del repo: puedes subir esta carpeta tal cual
a Vercel/Netlify como sitio estático, o pedirme que te ayude a conectarla
a un dominio propio (ej. glowritual.com) cuando lo tengas registrado.
