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

const CONFETTI_COLORS = ["#ffd23f", "#ff2fb0", "#00dce5", "#ff8a3d"];

/**
 * Posiciones/colores de las partículas de confeti, calculadas UNA vez
 * (no en cada render) a partir de un patrón determinístico (proporción
 * áurea) en vez de Math.random(): así el resultado es siempre el mismo
 * entre renders — importante porque el render por lotes puede pintar
 * cuadros de un mismo video en pestañas/procesos distintos en paralelo
 * (ver scripts/render-batch.ts), y necesitan coincidir cuadro a cuadro.
 */
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  x: ((i * 0.618033988749895 + i * 0.13) % 1) * 1080,
  y: 260 + ((i * 233) % 1500),
  size: 6 + (i % 4) * 3,
  speed: 0.6 + (i % 3) * 0.35,
  phase: i * 0.9,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

/**
 * Plantilla "Animales bailando salsa".
 *
 * No es video generado por IA ni fotorrealista (no tengo esa herramienta
 * disponible acá): son formas simples animadas por código (ver
 * DancingAnimal.tsx). Lo que sí es real es la coreografía: `count` avanza
 * de 0 a 8 -los "counts" de un compás de baile- siguiendo el paso básico
 * lateral de salsa (1-2-3, pausa-4, 5-6-7, pausa-8; ver el comentario
 * largo en DancingAnimal.tsx), en vez de un vaivén senoidal genérico.
 *
 * `count` sale de `useCyclicProgress` — la misma utilidad que usa la
 * plantilla de bucle infinito (ver src/lib/loop.ts) — así que, gratis, el
 * video entero (piso, luces, animales) vuelve exactamente a su estado
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

  // beatProgress: 0..1 exacto por vuelta (loop-safe). Cada vuelta completa
  // es UN compás de 8 counts del paso básico de salsa.
  const beatProgress = useCyclicProgress(frame, durationInFrames, danceCycles);
  const count = beatProgress * 8; // 0..8 -> ver HIP_KEYFRAMES en DancingAnimal.tsx
  // Ángulo auxiliar (misma progresión, en radianes) para las decoraciones
  // ambiente (confeti, pulso de cámara), que no necesitan seguir el
  // conteo exacto del paso, solo moverse suave y en loop.
  const theta = beatProgress * Math.PI * 2;
  // Giro lento del reflector, con su propio ciclo entero -> también cierra
  // el loop exacto (ver useCyclicProgress).
  const spotlightAngle =
    useCyclicProgress(frame, durationInFrames, 1) * 360;
  // Pulso de cámara sutil al ritmo del baile: función de `theta`, así que
  // también respeta el bucle exacto (nunca reduce por debajo de 1x, para
  // no dejar ver el fondo por fuera del AbsoluteFill recortado).
  const cameraScale = 1 + Math.abs(Math.sin(theta * 4)) * 0.018;

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

      {/* Confeti: brillitos que flotan, todo derivado de `theta` (loop-safe). */}
      {CONFETTI.map((c, i) => {
        const bob = Math.sin(theta * c.speed + c.phase) * 22;
        const drift = Math.cos(theta * c.speed * 0.6 + c.phase) * 14;
        const twinkle = 0.35 + 0.55 * Math.abs(Math.sin(theta * c.speed + c.phase));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x + drift,
              top: c.y + bob,
              width: c.size,
              height: c.size,
              borderRadius: "50%",
              backgroundColor: c.color,
              opacity: twinkle,
            }}
          />
        );
      })}

      {/* Escenario (piso + animales): pulsa levemente al ritmo del baile. */}
      <AbsoluteFill style={{ transform: `scale(${cameraScale})` }}>
        {/* Piso de baile */}
        <AbsoluteFill
          style={{
            top: "auto",
            height: 760,
            background: `linear-gradient(180deg, transparent 0%, ${floorColor} 55%)`,
          }}
        />

        {/* Animales, uno por "carril" horizontal. alignItems:"flex-end"
            para que todos apoyen los pies en la misma línea de piso, sin
            importar que alguno (la jirafa, por su cuello largo) sea
            bastante más alto que el resto. */}
        <AbsoluteFill
          style={{ alignItems: "flex-end", justifyContent: "center" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
              justifyContent: "center",
              marginBottom: 320,
            }}
          >
            {animals.map((animal, i) => {
              // Pequeño corrimiento de fase por animal: bailan juntos pero
              // no clonados. Es una CONSTANTE sumada a `count`, envuelta
              // en el mismo rango 0-8, así que no rompe la exactitud del
              // loop (ver DancingAnimal.tsx).
              const phaseOffset = i * 0.5;
              const animalCount = (count + phaseOffset) % 8;
              return (
                <div
                  key={i}
                  style={{
                    width: slotWidth,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <DancingAnimal
                    species={animal.species}
                    bodyColor={animal.bodyColor}
                    accentColor={animal.accentColor}
                    count={animalCount}
                    scale={1.5}
                  />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Viñeta: oscurece las esquinas para dar look "cinematográfico". */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {audioSrc ? <Audio src={resolveSrc(audioSrc)} /> : null}
    </AbsoluteFill>
  );
};
