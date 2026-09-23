import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedSubtitles } from "../../components/AnimatedSubtitles";
import { fonts, typography } from "../../config/brand";
import { useCyclicProgress, useLoopProgress } from "../../lib/loop";
import type { InfiniteLoopProps } from "./schema";

/**
 * Resuelve un `src` de props: si empieza con "/" se trata como un archivo
 * dentro de /public (staticFile), si no, se asume una URL absoluta.
 * Así el mismo campo del JSON sirve tanto para assets locales como remotos.
 */
const resolveSrc = (src: string) =>
  src.startsWith("/") ? staticFile(src) : src;

/**
 * Plantilla "Bucle infinito".
 *
 * Contrato de diseño: TODO el movimiento (fondo, texto, imagen) se deriva
 * de `progress` (0→1→0, ver useLoopProgress) o de `bgProgress` (ciclo
 * exacto, ver useCyclicProgress). Por construcción matemática, el frame 0
 * y el último frame producen el mismo `progress`/`bgProgress`, así que
 * literalmente pintan lo mismo en pantalla: el primer y el último cuadro
 * son idénticos y la repetición del clip no se percibe.
 *
 * Regla para quien extienda esta plantilla: no introducir animaciones
 * basadas en `spring()` ni en curvas que no sean simétricas respecto al
 * punto medio del clip — romperían la garantía de loop.
 */
export const InfiniteLoop: React.FC<InfiniteLoopProps> = ({
  title,
  subtitle,
  label,
  imageSrc,
  audioSrc,
  words,
  transitionInSeconds,
  backgroundColor,
  surfaceColor,
  primaryColor,
  secondaryColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const transitionFrames = Math.round(transitionInSeconds * fps);
  const progress = useLoopProgress(frame, durationInFrames, transitionFrames);
  const bgProgress = useCyclicProgress(frame, durationInFrames, 1);

  const opacity = progress;
  const scale = interpolate(progress, [0, 1], [0.94, 1]);
  const glowRotation = bgProgress * 360;

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      {/* Fondo: resplandor giratorio de marca. Gira exactamente 360° a lo
          largo del clip (useCyclicProgress), por lo que su ángulo en el
          frame 0 y en el último frame es el mismo. */}
      <AbsoluteFill
        style={{
          transform: `rotate(${glowRotation}deg)`,
          opacity: 0.55,
        }}
      >
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 20% 20%, ${secondaryColor}33, transparent 60%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 80% 85%, ${primaryColor}33, transparent 60%)`,
          }}
        />
      </AbsoluteFill>

      {/* Contenido principal: entra y sale con el mismo fundido simétrico
          (progress), terminando en el mismo estado (opacidad 0, escala
          0.94) en el que empezó. */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 96,
        }}
      >
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 28,
            maxWidth: 900,
          }}
        >
          {imageSrc ? (
            <div
              style={{
                width: 320,
                height: 320,
                borderRadius: 32,
                overflow: "hidden",
                border: `2px solid ${secondaryColor}55`,
                backgroundColor: surfaceColor,
                marginBottom: 8,
              }}
            >
              <Img
                src={resolveSrc(imageSrc)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : null}

          {label ? (
            <span
              style={{
                ...typography.label,
                color: secondaryColor,
                padding: "10px 20px",
                borderRadius: 999,
                border: `1px solid ${secondaryColor}66`,
              }}
            >
              {label}
            </span>
          ) : null}

          <h1
            style={{
              ...typography.displayLg,
              color: textColor,
              margin: 0,
            }}
          >
            {title}
          </h1>

          {subtitle ? (
            <p
              style={{
                ...typography.bodyLg,
                color: `${textColor}cc`,
                margin: 0,
                fontFamily: fonts.body,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </AbsoluteFill>

      {words && words.length > 0 ? (
        <AnimatedSubtitles
          words={words}
          activeColor={secondaryColor}
          inactiveColor={textColor}
          backgroundColor={`${backgroundColor}cc`}
        />
      ) : null}

      {audioSrc ? <Audio src={resolveSrc(audioSrc)} /> : null}
    </AbsoluteFill>
  );
};
