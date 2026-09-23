import React from "react";
import { SPECIES_CONFIG, type Species } from "./species";

export type DancingAnimalProps = {
  species: Species;
  bodyColor?: string;
  accentColor?: string;
  /**
   * Posición dentro del paso básico de salsa, de 0 a 8 (los "counts" de
   * un compás de baile: 1-2-3, pausa-4, 5-6-7, pausa-8). Es una función
   * PURA de `count` — nada de spring() ni estado propio — así que la
   * garantía de bucle exacto de la plantilla se hereda sola (ver el
   * comentario largo en DancingAnimals.tsx).
   */
  count: number;
  /** Escala general de la figura (px de alto aprox. * scale). */
  scale?: number;
};

/**
 * Interpolación lineal por tramos entre puntos de control (count, valor).
 * Los pasos de baile son más creíbles con tramos rectos y CON PAUSAS
 * reales (ver `HIP_KEYFRAMES`) que con una curva de seno continua: así
 * se nota el "quick-quick-slow" característico de la salsa en vez de un
 * simple vaivén.
 */
const keyframe = (count: number, points: [number, number][]): number => {
  for (let i = 0; i < points.length - 1; i++) {
    const [c0, v0] = points[i];
    const [c1, v1] = points[i + 1];
    if (count >= c0 && count <= c1) {
      const t = c1 === c0 ? 0 : (count - c0) / (c1 - c0);
      return v0 + (v1 - v0) * t;
    }
  }
  return points[points.length - 1][1];
};

/**
 * Paso básico lateral de salsa ("side basic"), investigado a partir de
 * guías de baile reales:
 *   1: paso al costado izquierdo (peso a la izquierda)
 *   2: transferencia de peso de vuelta al pie derecho, en el lugar
 *   3: el pie izquierdo cierra junto al derecho
 *   4: PAUSA
 *   5-6-7: espejado hacia el lado derecho
 *   8: PAUSA
 * `hipX` es la posición lateral de la cadera: -1 (extremo izquierdo) a
 * +1 (extremo derecho). Nótese que entre 3→4 y 7→8 el valor se mantiene
 * en 0 (la pausa real), en vez de seguir oscilando.
 */
const HIP_KEYFRAMES: [number, number][] = [
  [0, 0],
  [1, -1],
  [2, -0.4],
  [3, 0],
  [4, 0],
  [5, 1],
  [6, 0.4],
  [7, 0],
  [8, 0],
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Pequeño "golpe" de energía alrededor de un count dado (para el rebote). */
const bump = (count: number, center: number, width: number) => {
  const d = Math.abs(count - center);
  if (d >= width) return 0;
  const t = 1 - d / width;
  return t * t;
};

/**
 * Un personaje "sticker" (formas simples vía CSS, sin imágenes ni video
 * generado por IA — no tengo esa herramienta disponible) bailando el
 * paso básico lateral de salsa descripto arriba.
 */
export const DancingAnimal: React.FC<DancingAnimalProps> = ({
  species,
  bodyColor,
  accentColor,
  count,
  scale = 1,
}) => {
  const config = SPECIES_CONFIG[species];
  const body = bodyColor ?? config.bodyColor;
  const accent = accentColor ?? config.accentColor;
  const maneColor = config.maneColor ?? body;
  const neckLength = config.neckLength ?? 0;

  /**
   * Sombreado con volumen: degradé radial que aclara la esquina superior
   * (luz de escena) y oscurece hacia el borde. `color-mix()` lo soporta
   * el Chrome que usa Remotion para renderizar.
   */
  const shaded = (color: string) =>
    `radial-gradient(circle at 32% 26%, color-mix(in srgb, ${color} 60%, white) 0%, ${color} 55%, color-mix(in srgb, ${color} 80%, black) 100%)`;

  /** Igual que `shaded`, pero con manchas tipo jirafa por encima. */
  const patched = (color: string, spots: string) =>
    `radial-gradient(circle at 20% 25%, ${spots} 14%, transparent 15%),` +
    `radial-gradient(circle at 55% 12%, ${spots} 10%, transparent 11%),` +
    `radial-gradient(circle at 78% 42%, ${spots} 13%, transparent 14%),` +
    `radial-gradient(circle at 28% 62%, ${spots} 12%, transparent 13%),` +
    `radial-gradient(circle at 68% 72%, ${spots} 11%, transparent 12%),` +
    `radial-gradient(circle at 12% 88%, ${spots} 9%, transparent 10%),` +
    shaded(color);

  /** Igual que `shaded`, pero con rayas diagonales tipo cebra por encima. */
  const striped = (color: string, stripeColor: string) =>
    `repeating-linear-gradient(125deg, ${stripeColor} 0px, ${stripeColor} 6px, transparent 6px, transparent 17px),` +
    shaded(color);

  const fill = config.hasStripes
    ? striped(body, accent)
    : config.hasPatches
      ? patched(body, accent)
      : shaded(body);

  // --- Coreografía: todo derivado de `count` (ver HIP_KEYFRAMES arriba) ---
  const hipX = keyframe(count, HIP_KEYFRAMES); // -1..1
  const sideStep = hipX * 26; // px
  const hipSway = hipX * 9; // grados, leve inclinación de torso/cabeza
  const bounce =
    12 * bump(count, 1, 0.65) +
    12 * bump(count, 5, 0.65) +
    5 * bump(count, 3, 0.4) +
    5 * bump(count, 7, 0.4); // "pop" en cada paso, quieto en las pausas (4 y 8)
  const headBob = bounce * 0.35;
  const armLeft = -hipX * 42 + bump(count, 1, 0.5) * 20; // grados
  const armRight = hipX * 42 + bump(count, 5, 0.5) * 20;
  const legLiftLeft = clamp01(hipX) * 16; // el pie libre se levanta un poco
  const legLiftRight = clamp01(-hipX) * 16;
  const tailSway = -hipX * 22;

  return (
    <div style={{ position: "relative", width: 220, height: 320 }}>
      {/* Sombra de contacto: sigue el paso lateral pero NO el salto, así
          se queda "pegada" al piso y se achica/aclara cuando el personaje
          rebota — vende mejor la sensación de peso real. */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 300,
          width: 140,
          height: 30,
          borderRadius: "50%",
          backgroundColor: "#000000",
          filter: "blur(6px)",
          opacity: 0.35 - (bounce / 12) * 0.22,
          transform: `translateX(${sideStep}px) scale(${scale * (1 - bounce / 90)})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          // Traslado primero y escala después: así el paso lateral/rebote
          // se mide siempre en los mismos px, sin importar `scale`.
          transform: `translateX(${sideStep}px) translateY(${-bounce}px) scale(${scale})`,
        }}
      >
        {/* Cola */}
        {config.hasTail ? (
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 150,
              width: 70,
              height: 30,
              borderRadius: 20,
              background: fill,
              transformOrigin: "right center",
              transform: `rotate(${40 + tailSway}deg)`,
              zIndex: 0,
            }}
          />
        ) : null}

        {/* Pierna izquierda (con pata al final) */}
        <div
          style={{
            position: "absolute",
            left: 58,
            top: 240 - legLiftLeft,
            width: 38,
            height: 78,
            borderRadius: 20,
            background: fill,
            transformOrigin: "top center",
            transform: `rotate(${-hipSway * 0.6}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: -4,
              width: 46,
              height: 22,
              borderRadius: 12,
              backgroundColor: accent,
            }}
          />
        </div>
        {/* Pierna derecha (con pata al final) */}
        <div
          style={{
            position: "absolute",
            right: 58,
            top: 240 - legLiftRight,
            width: 38,
            height: 78,
            borderRadius: 20,
            background: fill,
            transformOrigin: "top center",
            transform: `rotate(${hipSway * 0.6}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: -4,
              width: 46,
              height: 22,
              borderRadius: 12,
              backgroundColor: accent,
            }}
          />
        </div>

        {/* Brazo izquierdo (con mano al final). El offset lo apoya justo
            sobre el borde del cuerpo (el cuerpo se dibuja DESPUÉS y tapa
            el nacimiento del brazo). */}
        <div
          style={{
            position: "absolute",
            left: 36,
            top: 112,
            width: 26,
            height: 92,
            borderRadius: 14,
            background: fill,
            transformOrigin: "top center",
            transform: `rotate(${armLeft}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -4,
              left: 1,
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: accent,
            }}
          />
        </div>
        {/* Brazo derecho (con mano al final) */}
        <div
          style={{
            position: "absolute",
            right: 36,
            top: 112,
            width: 26,
            height: 92,
            borderRadius: 14,
            background: fill,
            transformOrigin: "top center",
            transform: `rotate(${armRight}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -4,
              left: 1,
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: accent,
            }}
          />
        </div>

        {/* Cuerpo + cuello + cabeza, giran juntos con la cadera. El
            cuello (jirafa) crece hacia ARRIBA (top más chico), no hacia
            abajo: así el cuerpo queda siempre a la misma altura, apoyado
            sobre las piernas, y es la cabeza la que sube. */}
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 100 - neckLength,
            width: 160,
            height: 190 + neckLength,
            transformOrigin: "bottom center",
            transform: `rotate(${hipSway}deg)`,
          }}
        >
          {/* Cuerpo */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 20,
              width: 120,
              height: 150,
              borderRadius: "60px 60px 50px 50px",
              background: fill,
            }}
          />
          {/* Panza / pechera */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 50,
              width: 60,
              height: 100,
              borderRadius: "30px 30px 24px 24px",
              backgroundColor: accent,
              opacity: 0.9,
            }}
          />

          {/* Cuello largo (jirafa): conecta la cabeza (arriba) con el
              cuerpo (abajo). Ancho: 0 para el resto de las especies. */}
          {neckLength > 0 ? (
            <div
              style={{
                position: "absolute",
                top: 85,
                left: 55,
                width: 50,
                height: neckLength - 30,
                borderRadius: 22,
                background: fill,
              }}
            />
          ) : null}

          {/* Cabeza */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 30,
              width: 100,
              height: 100,
              transformOrigin: "bottom center",
              transform: `rotate(${headBob}deg)`,
            }}
          >
            {/* Melena (león): anillo de mechones detrás de la cara. */}
            {config.hasMane ? (
              <div style={{ position: "absolute", inset: 0 }}>
                {Array.from({ length: 14 }, (_, i) => {
                  const angle = (i / 14) * Math.PI * 2;
                  const r = 58;
                  const x = 50 + r * Math.cos(angle);
                  const y = 50 + r * Math.sin(angle);
                  const rotateDeg = (angle * 180) / Math.PI + 90;
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: x - 12,
                        top: y - 18,
                        width: 24,
                        height: 38,
                        borderRadius: "50%",
                        background: shaded(maneColor),
                        transform: `rotate(${rotateDeg}deg)`,
                      }}
                    />
                  );
                })}
              </div>
            ) : null}

            {config.hasOssicones ? (
              <>
                {[-18, 18].map((x) => (
                  <div key={x}>
                    <div
                      style={{
                        position: "absolute",
                        left: 50 + x - 4,
                        top: -26,
                        width: 8,
                        height: 28,
                        borderRadius: 4,
                        background: shaded(body),
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 50 + x - 8,
                        top: -32,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: accent,
                      }}
                    />
                  </div>
                ))}
              </>
            ) : null}

            {!config.hasOssicones && config.ears === "pointy" ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: -6,
                    top: -34,
                    width: 0,
                    height: 0,
                    borderLeft: "16px solid transparent",
                    borderRight: "16px solid transparent",
                    borderBottom: `44px solid ${body}`,
                    transform: "rotate(-18deg)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -34,
                    width: 0,
                    height: 0,
                    borderLeft: "16px solid transparent",
                    borderRight: "16px solid transparent",
                    borderBottom: `44px solid ${body}`,
                    transform: "rotate(18deg)",
                  }}
                />
              </>
            ) : null}

            {!config.hasOssicones && !config.hasMane && config.ears === "round" ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: -14,
                    top: -18,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: fill,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: -14,
                    top: -18,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: fill,
                  }}
                />
              </>
            ) : null}

            {!config.hasOssicones && config.ears === "floppy" ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: -18,
                    top: 4,
                    width: 30,
                    height: 62,
                    borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                    background: fill,
                    transformOrigin: "top center",
                    transform: `rotate(${-10 + hipSway * 0.5}deg)`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: -18,
                    top: 4,
                    width: 30,
                    height: 62,
                    borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                    background: fill,
                    transformOrigin: "top center",
                    transform: `rotate(${10 - hipSway * 0.5}deg)`,
                  }}
                />
              </>
            ) : null}

            {/* Mini-cresta (cebra): unos triangulitos sobre la cabeza. */}
            {config.hasStripes ? (
              <div style={{ position: "absolute", left: 28, top: -14, display: "flex", gap: 2 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderBottom: `14px solid ${accent}`,
                    }}
                  />
                ))}
              </div>
            ) : null}

            {/* Cara */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: fill,
              }}
            />

            {config.hasBill ? (
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  top: 46,
                  width: 56,
                  height: 30,
                  borderRadius: "40% 40% 50% 50%",
                  backgroundColor: accent,
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  left: 30,
                  top: 58,
                  width: 40,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: config.hasStripes ? "#2a2a2b" : accent,
                  opacity: 0.9,
                }}
              />
            )}

            {/* Cachetes (dan calidez/expresividad) */}
            <div
              style={{
                position: "absolute",
                left: 8,
                top: 52,
                width: 20,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#ff6f91",
                opacity: 0.3,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 8,
                top: 52,
                width: 20,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#ff6f91",
                opacity: 0.3,
              }}
            />

            {/* Ojos, con un brillito para que no queden "muertos" */}
            <div
              style={{
                position: "absolute",
                left: 26,
                top: 34,
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#1c1b1c",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 1,
                  top: 1,
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                right: 26,
                top: 34,
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#1c1b1c",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 1,
                  top: 1,
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
