import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fonts, typography } from "../../config/brand";
import { useCyclicProgress } from "../../lib/loop";
import { DancingAnimal } from "./DancingAnimal";
import type { DancingAnimalsProps } from "./schema";

const resolveSrc = (src: string) =>
  src.startsWith("/") ? staticFile(src) : src;

/**
 * Plantilla "Animales bailando salsa".
 *
 * No es video generado por IA: son formas simples animadas por código
 * (ver DancingAnimal.tsx). El "baile" es 100% función de `theta`, un
 * ángulo que avanza con `useCyclicProgress` — la misma utilidad que usa
 * la plantilla de bucle infinito (ver src/lib/loop.ts) — así que, gratis,
 * el video entero (piso, luces, animales) vuelve exactamente a su estado
 * inicial en el último frame y el loop no se nota al repetirse.
 */
export const DancingAnimals: React.FC<DancingAnimalsProps> = ({
  title,
  animals,
  danceCycles,
  audioSrc,
  backgroundColor,
  floorColor,
  spotlightColor,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const beatProgress = useCyclicProgress(frame, durationInFrames, danceCycles);
  const theta = beatProgress * Math.PI * 2;
  // Giro lento del reflector, con su propio ciclo entero -> también cierra
  // el loop exacto (ver useCyclicProgress).
  const spotlightAngle =
    useCyclicProgress(frame, durationInFrames, 1) * 360;

  const slotWidth = 1080 / animals.length;

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      {/* Reflectores de pista */}
      <AbsoluteFill
        style={{ transform: `rotate(${spotlightAngle}deg)`, opacity: 0.5 }}
      >
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 25% 15%, ${spotlightColor}55, transparent 55%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 75% 20%, ${spotlightColor}33, transparent 50%)`,
          }}
        />
      </AbsoluteFill>

      {title ? (
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              ...typography.headlineMd,
              fontFamily: fonts.display,
              color: "#ffffff",
              margin: 0,
              padding: "0 64px",
            }}
          >
            {title}
          </h1>
        </div>
      ) : null}

      {/* Piso de baile */}
      <AbsoluteFill
        style={{
          top: "auto",
          height: 760,
          background: `linear-gradient(180deg, transparent 0%, ${floorColor} 55%)`,
        }}
      />

      {/* Animales, uno por "carril" horizontal */}
      <AbsoluteFill
        style={{ alignItems: "flex-end", justifyContent: "center" }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            marginBottom: 320,
          }}
        >
          {animals.map((animal, i) => {
            // Pequeño corrimiento de fase por animal: bailan juntos pero
            // no clonados. Es una CONSTANTE sumada a theta, así que no
            // rompe la exactitud del loop (ver DancingAnimal.tsx).
            const phaseOffset = i * 0.6;
            return (
              <div
                key={i}
                style={{
                  width: slotWidth,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <DancingAnimal
                  species={animal.species}
                  bodyColor={animal.bodyColor}
                  accentColor={animal.accentColor}
                  theta={theta + phaseOffset}
                  scale={1.5}
                />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {audioSrc ? <Audio src={resolveSrc(audioSrc)} /> : null}
    </AbsoluteFill>
  );
};
