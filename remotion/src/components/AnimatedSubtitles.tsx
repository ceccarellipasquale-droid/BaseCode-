import React, { useMemo } from "react";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption } from "@remotion/captions";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, palette } from "../config/brand";

/** Una palabra con su ventana de tiempo, en SEGUNDOS (como se escribe en el JSON de datos). */
export type SubtitleWord = {
  text: string;
  /** Segundo en el que empieza a sonar la palabra. */
  start: number;
  /** Segundo en el que termina. */
  end: number;
};

export type AnimatedSubtitlesProps = {
  words: SubtitleWord[];
  /** Máx. ventana temporal (ms) que se agrupa en una misma línea en pantalla. */
  groupWindowMs?: number;
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  /** Distancia en px desde el borde inferior del video (composición vertical). */
  bottomOffset?: number;
};

/**
 * Subtítulos animados palabra por palabra, sincronizados con el audio.
 *
 * Recibe una lista plana de palabras con marca de tiempo (en segundos —
 * el formato natural para escribir a mano o generar con un
 * transcriptor/ASR) y usa `@remotion/captions` (createTikTokStyleCaptions)
 * para agruparlas en "páginas" cortas, estilo TikTok/Reels: unas pocas
 * palabras en pantalla a la vez, con la palabra que se está diciendo en
 * ese instante resaltada.
 *
 * El resaltado se calcula a partir de `useCurrentFrame()`/`fps`, así que
 * queda perfectamente sincronizado con cualquier audio que dure lo mismo
 * que las marcas de tiempo (ver <Audio> en la plantilla que lo use).
 */
export const AnimatedSubtitles: React.FC<AnimatedSubtitlesProps> = ({
  words,
  groupWindowMs = 1200,
  activeColor = palette.secondary,
  inactiveColor = palette.onSurface,
  backgroundColor = `${palette.background}cc`,
  fontSize = 44,
  bottomOffset = 220,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const { pages } = useMemo(() => {
    const captions: Caption[] = words.map((w) => ({
      text: w.text,
      startMs: w.start * 1000,
      endMs: w.end * 1000,
      timestampMs: null,
      confidence: null,
    }));
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: groupWindowMs,
    });
  }, [words, groupWindowMs]);

  const activePage = useMemo(() => {
    return pages.find(
      (page) =>
        currentMs >= page.startMs && currentMs < page.startMs + page.durationMs,
    );
  }, [pages, currentMs]);

  if (!activePage) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        display: "flex",
        justifyContent: "center",
        padding: "0 64px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 16px",
          backgroundColor,
          padding: "20px 32px",
          borderRadius: 20,
          fontFamily: fonts.body,
          fontSize,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {activePage.tokens.map((token, i) => {
          const isActive = currentMs >= token.fromMs && currentMs < token.toMs;
          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                // Color derivado 100% de `currentMs` (ver arriba), sin
                // transiciones CSS: así el resaltado queda perfectamente
                // sincronizado cuadro a cuadro y no "parpadea" al renderizar.
                color: isActive ? activeColor : inactiveColor,
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
