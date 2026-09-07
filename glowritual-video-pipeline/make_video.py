#!/usr/bin/env python3
"""
GlowRitual — Video Pipeline
============================
Convierte tus fotos/clips reales del producto en un video vertical
(1080x1920) listo para TikTok/Reels/Shorts, con:
  - Efecto Ken Burns (zoom/paneo suave) en fotos estáticas
  - Texto animado (hook + subtítulos por escena)
  - Música de fondo con volumen controlado
  - Marca de agua opcional (logo/nombre de tienda)

USO
---
1. Coloca tus fotos/clips del producto en `input_media/`
   (nombres libres: foto1.jpg, clip1.mp4, etc.)
2. Copia `example_config.json` a `mi_video.json` y edítalo:
   - "scenes": lista de escenas en orden, cada una con su archivo,
     duración y texto que aparece en pantalla.
3. (Opcional) pon una pista de música libre de derechos en `music/`
4. Corre:
     python3 make_video.py mi_video.json
5. El resultado queda en `output/`

No requiere ninguna API key ni conexión a internet: todo corre local
con moviepy + ffmpeg. Probado con moviepy 2.x.
"""

import json
import sys
import os
from moviepy import (
    ImageClip, VideoFileClip, CompositeVideoClip, TextClip,
    AudioFileClip, concatenate_videoclips,
)
from moviepy.video.fx import CrossFadeIn, Resize, Crop

W, H = 1080, 1920  # formato vertical TikTok/Reels/Shorts
FONT = None  # None = fuente por defecto de Pillow/moviepy; pon una .ttf si quieres otra


def ken_burns(clip, duration, zoom_start=1.0, zoom_end=1.15):
    """Aplica un zoom lento tipo Ken Burns a una imagen estática."""
    clip = clip.with_duration(duration)

    def scaler(t):
        progress = t / duration if duration > 0 else 0
        return zoom_start + (zoom_end - zoom_start) * progress

    return clip.resized(scaler)


def fit_vertical(clip):
    """Escala y recorta (crop) el clip para llenar 1080x1920 sin deformar."""
    clip_ratio = clip.w / clip.h
    target_ratio = W / H
    if clip_ratio > target_ratio:
        clip = clip.resized(height=H)
    else:
        clip = clip.resized(width=W)
    return clip.with_effects([
        Crop(x_center=clip.w / 2, y_center=clip.h / 2, width=W, height=H)
    ])


def make_text_clip(text, duration, fontsize=70, color="white",
                    y_frac=0.78, start=0):
    """Texto con contorno, estilo captions de TikTok."""
    kwargs = dict(
        text=text, font_size=fontsize, color=color,
        method="caption", size=(int(W * 0.85), None),
        stroke_color="black", stroke_width=2, text_align="center",
    )
    if FONT:
        kwargs["font"] = FONT
    txt = TextClip(**kwargs)
    txt = txt.with_start(start).with_duration(duration)
    txt = txt.with_effects([CrossFadeIn(0.25)])
    return txt.with_position(("center", int(H * y_frac)))


def build_scene(scene, media_dir):
    path = os.path.join(media_dir, scene["file"])
    duration = float(scene.get("duration", 3.0))

    if path.lower().endswith((".mp4", ".mov", ".m4v")):
        raw = VideoFileClip(path)
        base = raw.subclipped(0, min(duration, raw.duration)).with_duration(duration)
    else:
        base = ImageClip(path)
        base = ken_burns(base, duration)

    base = fit_vertical(base)

    layers = [base]
    if scene.get("text"):
        layers.append(
            make_text_clip(
                scene["text"], duration=duration,
                y_frac=scene.get("text_y", 0.78),
            )
        )
    return CompositeVideoClip(layers, size=(W, H)).with_duration(duration)


def build_hook_overlay(hook_text, total_duration):
    """Texto de hook grande arriba, presente en los primeros ~3s del video
    (el gancho que decide si alguien sigue viendo o hace scroll)."""
    if not hook_text:
        return None
    dur = min(3.0, total_duration)
    return make_text_clip(hook_text, duration=dur, fontsize=85, y_frac=0.12)


def build_watermark(brand_text, total_duration):
    if not brand_text:
        return None
    return make_text_clip(
        brand_text, duration=total_duration, fontsize=44,
        color="white", y_frac=0.94
    ).with_opacity(0.85)


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 make_video.py config.json")
        sys.exit(1)

    config_path = sys.argv[1]
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    media_dir = config.get("media_dir", "input_media")
    scenes_cfg = config["scenes"]

    scene_clips = [build_scene(s, media_dir) for s in scenes_cfg]
    video = concatenate_videoclips(scene_clips, method="compose")
    total_duration = video.duration

    overlays = [video]
    hook_overlay = build_hook_overlay(config.get("hook_text"), total_duration)
    if hook_overlay:
        overlays.append(hook_overlay)
    watermark = build_watermark(config.get("brand_text"), total_duration)
    if watermark:
        overlays.append(watermark)

    final = CompositeVideoClip(overlays, size=(W, H)).with_duration(total_duration)

    music_path = config.get("music_file")
    if music_path and os.path.exists(music_path):
        audio = AudioFileClip(music_path)
        if audio.duration < total_duration:
            loops = int(total_duration // audio.duration) + 1
            audio = concatenate_videoclips([audio] * loops)
        audio = audio.subclipped(0, total_duration)
        audio = audio.with_volume_scaled(config.get("music_volume", 0.35))
        final = final.with_audio(audio)

    out_name = config.get("output_name", "glowritual_video.mp4")
    out_path = os.path.join("output", out_name)
    os.makedirs("output", exist_ok=True)

    final.write_videofile(
        out_path, fps=30, codec="libx264", audio_codec="aac",
        preset="medium", threads=4
    )
    print(f"\n✅ Video generado: {out_path}")


if __name__ == "__main__":
    main()
