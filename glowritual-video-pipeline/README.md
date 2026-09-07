# GlowRitual — Pipeline de video para redes (con Claude Code)

Carpeta independiente del sitio web (`index.html` de BaseCode). Todo lo que
tiene que ver con generar videos de TikTok/Reels para la marca de skincare
vive aquí.

## ¿Qué hace esto?

Convierte tus fotos/clips **reales** del producto en un video vertical
(1080x1920) editado automáticamente: zoom tipo Ken Burns, texto animado,
subtítulos estilo TikTok, música de fondo y marca de agua — sin usar
ninguna API de pago ni IA generativa de video. Todo corre localmente con
`ffmpeg` + `moviepy`.

## Por qué así y no con IA generativa de video

Los clips 100% generados por IA (Runway, Sora, Pika) casi nunca se ven
creíbles para vender un producto físico real — la gente detecta que "no es
el producto de verdad" y no compra. Lo que mejor convierte en e-commerce es
**contenido real (UGC)** editado con buen ritmo. Este pipeline automatiza
justo esa parte (la edición), que es la que más tiempo toma.

## Instalación

```bash
cd glowritual-video-pipeline
pip3 install -r requirements.txt

# ffmpeg (si no lo tienes instalado):
# macOS:   brew install ffmpeg
# Ubuntu:  sudo apt-get install ffmpeg
# Windows: choco install ffmpeg   (o descarga desde ffmpeg.org)
```

## Uso paso a paso

1. Cuando te llegue la muestra del producto, graba/fotografía con buena luz
   natural (celular está bien, no necesitas cámara profesional):
   - Foto del empaque/unboxing
   - Foto/clip de la mascarilla puesta, con las luces encendidas
   - Foto de "antes/después" si tienes
   - Foto del empaque cerrando (para el CTA final)

2. Copia esos archivos a `input_media/`

3. Copia `example_config.json` → `video_1.json` y edita:
   - `scenes`: el orden, duración (segundos) y texto de cada escena
   - `hook_text`: la frase que aparece los primeros 3 segundos
   - `brand_text`: tu usuario de Instagram/TikTok
   - `music_file`: ruta a una pista de música libre de derechos que pongas
     en `music/` (YouTube Audio Library o TikTok Sounds son buenas fuentes
     de música sin copyright)

4. Genera el video:
   ```bash
   python3 make_video.py video_1.json
   ```

5. El resultado queda en `output/video_1.mp4`, listo para subir.

6. Repite con distintos `hook_text` y orden de escenas para tener 3-5
   variantes — es lo que vas a testear en los anuncios (ver
   `hooks_y_guiones.md` para los textos ya escritos).

## Archivos de esta carpeta

- `make_video.py` — el script principal del pipeline
- `example_config.json` — plantilla de configuración de un video
- `hooks_y_guiones.md` — guiones, hooks y textos de overlay ya redactados
- `input_media/` — aquí van tus fotos/clips reales del producto
- `music/` — aquí va tu música de fondo (libre de derechos)
- `output/` — aquí se generan los videos finales

## Siguiente nivel (opcional, cuando ya estés vendiendo)

- **Voz en off con IA:** se puede integrar ElevenLabs o el TTS de OpenAI
  para narrar automáticamente el guion sin grabar tu voz — pide esto
  cuando quieras y lo agrego (necesitarás una API key propia).
- **Subtítulos automáticos desde audio real:** si grabas tu voz hablando,
  puedo integrar Whisper para transcribir y quemar subtítulos exactos
  sincronizados con lo que dices.
