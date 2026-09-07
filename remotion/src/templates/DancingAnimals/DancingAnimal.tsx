import React from "react";
import { SPECIES_CONFIG, type Species } from "./species";

export type DancingAnimalProps = {
  species: Species;
  bodyColor?: string;
  accentColor?: string;
  /**
   * Fase actual del baile, en radianes. Es una función PURA de `theta`
   * (ver comentario largo en DancingAnimals.tsx): nada de spring() ni de
   * estado propio, para que la garantía de bucle exacto se herede sola.
   */
  theta: number;
  /** Escala general de la figura (px de alto aprox. * scale). */
  scale?: number;
};

/**
 * Un personaje "sticker" (formas simples, sin imágenes) bailando un paso
 * básico de salsa: balanceo de cadera de lado a lado, rebote, brazos y
 * piernas en contratiempo. Todo el movimiento sale de `theta`.
 */
export const DancingAnimal: React.FC<DancingAnimalProps> = ({
  species,
  bodyColor,
  accentColor,
  theta,
  scale = 1,
}) => {
  const config = SPECIES_CONFIG[species];
  const body = bodyColor ?? config.bodyColor;
  const accent = accentColor ?? config.accentColor;

  const hipSway = Math.sin(theta) * 12; // grados
  const sideStep = Math.sin(theta) * 22; // px
  const bounce = Math.abs(Math.sin(theta)) * 16; // px, hacia arriba
  const headBob = Math.sin(theta) * 5; // grados, leve contratiempo
  const armLeft = Math.sin(theta + Math.PI) * 38; // grados
  const armRight = Math.sin(theta) * 38;
  const legLiftLeft = Math.max(0, Math.sin(theta)) * 16; // px
  const legLiftRight = Math.max(0, -Math.sin(theta)) * 16;
  const tailSway = Math.sin(theta + Math.PI) * 20; // opuesto a la cadera

  return (
    <div
      style={{
        position: "relative",
        width: 220,
        height: 320,
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
            backgroundColor: body,
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
          backgroundColor: body,
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
          backgroundColor: body,
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
          sobre el borde del cuerpo (ver bloque de cuerpo más abajo, que
          se dibuja DESPUÉS y tapa el nacimiento del brazo). */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 112,
          width: 26,
          height: 92,
          borderRadius: 14,
          backgroundColor: body,
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
          backgroundColor: body,
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

      {/* Cuerpo + cabeza, giran juntos con la cadera */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 100,
          width: 160,
          height: 190,
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
            backgroundColor: body,
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
          {config.ears === "pointy" ? (
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

          {config.ears === "round" ? (
            <>
              <div
                style={{
                  position: "absolute",
                  left: -14,
                  top: -18,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: body,
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
                  backgroundColor: body,
                }}
              />
            </>
          ) : null}

          {config.ears === "floppy" ? (
            <>
              <div
                style={{
                  position: "absolute",
                  left: -18,
                  top: 4,
                  width: 30,
                  height: 62,
                  borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                  backgroundColor: body,
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
                  backgroundColor: body,
                  transformOrigin: "top center",
                  transform: `rotate(${10 - hipSway * 0.5}deg)`,
                }}
              />
            </>
          ) : null}

          {/* Cara */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: body,
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
                backgroundColor: accent,
                opacity: 0.9,
              }}
            />
          )}

          {/* Ojos */}
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
          />
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
          />
        </div>
      </div>
    </div>
  );
};
