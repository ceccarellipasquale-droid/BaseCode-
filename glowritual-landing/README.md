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
6. **Formulario de "10% de descuento por tu correo"**: hoy solo guarda el
   email en el `localStorage` del navegador de quien lo llena (sirve como
   demo, pero no te llega a ti ni envía nada real). Conéctalo a un
   proveedor real antes de lanzar — la forma más simple es crear un
   formulario en Mailchimp/Klaviyo/MailerLite y reemplazar el `<form>`
   por el embed que ellos te dan, o usar un Google Form como atajo rápido.

## Cambios recientes (segunda revisión)

- **Se quitó el countdown y el "quedan 23 unidades"**: un cronómetro que
  se reinicia solo y una cifra de stock inventada son "dark patterns" de
  urgencia falsa — además de no ser honesto, Meta/TikTok Ads suspenden
  cuentas por esto, y es justo el tipo de práctica que la FTC ya está
  sancionando. Se puede volver a agregar un countdown cuando tengas una
  fecha de cierre de promo real, o un dato de stock real.
- **Se quitó el badge "+2,400 clientas felices"**: no hay ventas reales
  todavía — un número de reseñas inventado es lo primero que un comprador
  desconfiado detecta. Agrégalo de vuelta con tu cifra real cuando la tengas.
- **Se agregaron 3 planes de cantidad** (1 / 2 / 3 mascarillas) en la
  sección de oferta, con el de 2 unidades destacado como "Más elegido".
  Esto sube tu ticket promedio sin gastar más en publicidad — es la forma
  más barata de acercarte más rápido a tu meta de ingresos.
- **Se agregó una sección de captura de email** antes del footer, para no
  perder a quienes visitan la página pero no compran en el momento (la
  gran mayoría del tráfico). Ver nota de conexión a ESP arriba.
- **Se agregaron señales de confianza** (pago encriptado, garantía, envío
  gratis, métodos de pago) cerca de los botones de compra — importante
  para una marca nueva sin reputación todavía.

## Cómo verla

Simplemente abre `index.html` en cualquier navegador — no necesita servidor
ni instalación. Es mobile-first: pruébala también achicando la ventana o
desde el celular.

## Deploy

Igual que el sitio principal del repo: puedes subir esta carpeta tal cual
a Vercel/Netlify como sitio estático, o pedirme que te ayude a conectarla
a un dominio propio (ej. glowritual.com) cuando lo tengas registrado.
