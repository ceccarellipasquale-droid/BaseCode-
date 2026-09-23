import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, smoothTransition } from "../../components/transitions";
import { fonts, typography } from "../../config/brand";
import type { PhotoStoryProps } from "./schema";

type Photo = PhotoStoryProps["photos"][number];
type Move = NonNullable<Photo["move"]>;

const resolveSrc = (src: string) =>
  src.startsWith("/") ? staticFile(src) : src;

/** Rotación automática de movimientos: dos fotos seguidas nunca se mueven igual. */
const AUTO_MOVES: Move[] = ["zoom-in", "pan-right", "zoom-out", "pan-left", "pan-up"];

// --- Tiempos: compartidos con el registro (src/templates/index.ts) para
// que la duración de la composición coincida EXACTO con la de la serie. ---
export const photoFrames = (photo: Photo, fps: number) =>
  Math.round(photo.durationInSeconds * fps);

export const transitionFrames = (props: PhotoStoryProps, fps: number) =>
  Math.round(props.transitionInSeconds * fps);

/**
 * Las transiciones SUPERPONEN fotos consecutivas (mientras una se funde,
 * la otra ya se ve), así que la duración total es la suma de las fotos
 * menos una transición por cada unión.
 */
export const getPhotoStoryDurationInFrames = (props: PhotoStoryProps, fps: number) =>
  props.photos.reduce((acc, p) => acc + photoFrames(p, fps), 0) -
  (props.photos.length - 1) * transitionFrames(props, fps);

/** Frame (global) en el que empieza cada foto, contando las superposiciones. */
const photoStarts = (props: PhotoStoryProps, fps: number) => {
  const tf = transitionFrames(props, fps);
  const starts: number[] = [];
  let acc = 0;
  props.photos.forEach((p) => {
    starts.push(acc);
    acc += photoFrames(p, fps) - tf;
  });
  return starts;
};

/**
 * Una foto con efecto "Ken Burns": zoom o paneo lento y constante, como
 * una cámara que se mueve sobre la escena. La foto siempre está escalada
 * ≥ 1.08x, así que ningún movimiento deja ver sus bordes.
 */
const KenBurnsPhoto: React.FC<{
  photo: Photo;
  move: Move;
  durationInFrames: number;
}> = ({ photo, move, durationInFrames }) => {
  const frame = useCurrentFrame(); // local: 0 al empezar esta foto
  // Lineal a propósito: un operador de cámara mueve parejo; una curva con
  // "frenada" se notaría raro justo durante el fundido con la próxima foto.
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let scale = 1.18;
  let x = 0;
  let y = 0;
  switch (move) {
    case "zoom-in":
      scale = interpolate(t, [0, 1], [1.08, 1.24]);
      break;
    case "zoom-out":
      scale = interpolate(t, [0, 1], [1.24, 1.08]);
      break;
    case "pan-left":
      x = interpolate(t, [0, 1], [4, -4]);
      break;
    case "pan-right":
      x = interpolate(t, [0, 1], [-4, 4]);
      break;
    case "pan-up":
      y = interpolate(t, [0, 1], [4, -4]);
      break;
    case "pan-down":
      y = interpolate(t, [0, 1], [-4, 4]);
      break;
  }

  // El zoom se acerca al punto de interés (focusX/Y). Los paneos giran
  // alrededor del centro: si el origen estuviera corrido, el margen de un
  // lado podría quedar más chico que el recorrido y se verían los bordes.
  const isZoom = move === "zoom-in" || move === "zoom-out";
  const origin = isZoom ? `${photo.focusX}% ${photo.focusY}%` : "50% 50%";

  return (
    <AbsoluteFill>
      <Img
        src={resolveSrc(photo.src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: origin,
          transform: `scale(${scale}) translate(${x}%, ${y}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Leyenda de una foto: entra subiendo una vez TERMINADO el fundido de
 * entrada (`introFrames`) y se va ANTES del fundido de salida
 * (`outroFrames`), para que dos textos nunca compartan pantalla.
 */
const Caption: React.FC<{
  text: string;
  durationInFrames: number;
  introFrames: number;
  outroFrames: number;
  textColor: string;
  accentColor: string;
}> = ({ text, durationInFrames, introFrames, outroFrames, textColor, accentColor }) => {
  const frame = useCurrentFrame();
  const inStart = introFrames + 6;
  const outEnd = durationInFrames - outroFrames;
  const opacity = interpolate(
    frame,
    [inStart, inStart + 12, outEnd - 10, outEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const lift = interpolate(frame, [inStart, inStart + 12], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    // Zona segura: TikTok/Reels tapan el borde inferior (descripción) y el
    // derecho (botones), así que la leyenda va arriba de ~el 20% inferior y
    // con margen derecho generoso.
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 180px 420px 72px" }}>
      <div
        style={{
          opacity,
          transform: `translateY(${lift}px)`,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div style={{ width: 6, height: 64, borderRadius: 3, backgroundColor: accentColor }} />
        <span
          style={{
            ...typography.headlineMd,
            fontFamily: fonts.display,
            color: textColor,
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

/** Título sobre la primera foto (ej. el nombre del local). */
const TitleCard: React.FC<{
  title: string;
  subtitle?: string;
  durationInFrames: number;
  outroFrames: number;
  textColor: string;
  accentColor: string;
}> = ({ title, subtitle, durationInFrames, outroFrames, textColor, accentColor }) => {
  const frame = useCurrentFrame();
  const outEnd = durationInFrames - outroFrames;
  const opacity = interpolate(
    frame,
    [6, 22, outEnd - 14, outEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(frame, [6, 22], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
        textAlign: "center",
      }}
    >
      {/* Sombra difusa detrás del texto: legible sobre cualquier foto. */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 520,
          opacity,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 70%)",
        }}
      />
      <div style={{ opacity, transform: `scale(${scale})`, position: "relative" }}>
        <h1
          style={{
            ...typography.displayLg,
            fontFamily: fonts.display,
            color: textColor,
            margin: 0,
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            style={{
              ...typography.bodyLg,
              fontFamily: fonts.body,
              color: accentColor,
              margin: "20px 0 0",
              textShadow: "0 2px 18px rgba(0,0,0,0.6)",
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Plantilla "Historia en fotos": arma un video vertical a partir de fotos
 * fijas, simulando que alguien lo filmó con el celular:
 *   - Ken Burns por foto (zoom/paneo lento hacia el punto de interés).
 *   - Temblor sutil de "cámara en mano" sobre TODA la serie (como una
 *     sola cámara), hecho con senos de frecuencias distintas para que se
 *     sienta orgánico y no un vaivén regular.
 *   - Fundidos entre fotos (reutiliza src/components/transitions.tsx).
 *   - Un tinte cálido y viñeta comunes, para que fotos de distinto origen
 *     se sientan parte del mismo video.
 *
 * A diferencia de la plantilla "Bucle infinito", esta NO busca que el
 * primer y el último cuadro coincidan: es un relato lineal (entrar al
 * local, ver la barra, el café...), no un loop.
 */
export const PhotoStory: React.FC<PhotoStoryProps> = (props) => {
  const {
    title,
    subtitle,
    photos,
    transitionInSeconds,
    handheld,
    audioSrc,
    textColor,
    accentColor,
    tintColor,
    tintOpacity,
  } = props;
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const tf = transitionFrames(props, fps);
  const starts = photoStarts(props, fps);

  const shakeX = (Math.sin(frame / 13) * 1.6 + Math.sin(frame / 7.3) * 0.8) * handheld;
  const shakeY = (Math.sin(frame / 11.1) * 1.4 + Math.cos(frame / 5.7) * 0.6) * handheld;
  const shakeRot = (Math.sin(frame / 17) * 0.25 + Math.sin(frame / 9.1) * 0.1) * handheld;
  // Margen extra de escala para que el temblor nunca deje ver bordes negros.
  const shakeScale = 1 + 0.025 * handheld;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) rotate(${shakeRot}deg) scale(${shakeScale})`,
        }}
      >
        <TransitionSeries>
          {photos.map((photo, i) => (
            <React.Fragment key={i}>
              {i > 0 ? (
                <TransitionSeries.Transition
                  {...smoothTransition("fade", transitionInSeconds, fps)}
                />
              ) : null}
              <TransitionSeries.Sequence durationInFrames={photoFrames(photo, fps)}>
                <KenBurnsPhoto
                  photo={photo}
                  move={photo.move ?? AUTO_MOVES[i % AUTO_MOVES.length]}
                  durationInFrames={photoFrames(photo, fps)}
                />
              </TransitionSeries.Sequence>
            </React.Fragment>
          ))}
        </TransitionSeries>
      </AbsoluteFill>

      {/* Tinte cálido común + degradé inferior (legibilidad de leyendas) + viñeta */}
      <AbsoluteFill style={{ backgroundColor: tintColor, opacity: tintOpacity }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Textos: capa aparte, fuera del temblor de cámara (son "postproducción"). */}
      {photos.map((photo, i) =>
        photo.caption && !(i === 0 && title) ? (
          <Sequence key={i} from={starts[i]} durationInFrames={photoFrames(photo, fps)}>
            <Caption
              text={photo.caption}
              durationInFrames={photoFrames(photo, fps)}
              introFrames={i > 0 ? tf : 0}
              outroFrames={i < photos.length - 1 ? tf : 0}
              textColor={textColor}
              accentColor={accentColor}
            />
          </Sequence>
        ) : null,
      )}

      {title ? (
        <Sequence durationInFrames={photoFrames(photos[0], fps)}>
          <TitleCard
            title={title}
            subtitle={subtitle}
            durationInFrames={photoFrames(photos[0], fps)}
            outroFrames={photos.length > 1 ? tf : 0}
            textColor={textColor}
            accentColor={accentColor}
          />
        </Sequence>
      ) : null}

      {audioSrc ? (
        <Audio
          src={resolveSrc(audioSrc)}
          // Fundido de entrada y salida: un corte seco de música al final
          // es lo primero que delata un video "armado".
          volume={(f) =>
            interpolate(f, [0, 15, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
