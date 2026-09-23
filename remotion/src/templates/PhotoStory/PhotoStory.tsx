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

// --- Ritmo de los textos (en frames). Las mismas constantes las usan las
// animaciones de abajo Y el cálculo de duración mínima de cada foto, para
// que lo que se calcula sea exactamente lo que se ve. ---
const CAPTION_DELAY = 4;
const CAPTION_FADE = 14;
const TITLE_DELAY = 6;
const TITLE_FADE_IN = 16;
const TITLE_FADE_OUT = 14;
const LINE_OFFSET = 18; // las líneas del cierre entran después del título...
const LINE_STAGGER = 7; // ...de a una
const LINE_FADE = 12;
const END_FADE = 15; // fundido a negro final

/**
 * Tiempo que un texto tiene que quedar QUIETO y 100% visible para leerse
 * cómodo. Criterio de subtitulado profesional: ~14 caracteres por
 * segundo (un poco por debajo del estándar de 15-17, porque en redes se
 * mira de pasada), con un piso de 1.8s para que un texto corto no
 * parpadee y un techo de 4s para que uno largo no aburra.
 */
const READING_CPS = 14;
const readingFrames = (text: string, fps: number) =>
  Math.round(Math.min(4, Math.max(1.8, text.length / READING_CPS)) * fps);

export const transitionFrames = (props: PhotoStoryProps, fps: number) =>
  Math.round(props.transitionInSeconds * fps);

/**
 * Duración real (en frames) de cada foto: la pedida en el JSON, o más si
 * su texto no alcanza a leerse en ese tiempo. Así nunca hace falta
 * calcular a mano cuánto dura una foto con leyenda: se pide la duración
 * "visual" y la plantilla alarga lo que haga falta para la lectura.
 */
export const resolvePhotoFrames = (props: PhotoStoryProps, fps: number): number[] => {
  const tf = transitionFrames(props, fps);
  const last = props.photos.length - 1;
  const hasOutro = Boolean(props.outroTitle) && props.photos.length > 1;

  return props.photos.map((photo, i) => {
    const requested = Math.round(photo.durationInSeconds * fps);
    const intro = i > 0 ? tf : 0;
    const outro = i < last ? tf : 0;
    let needed = 0;

    if (i === 0 && props.title) {
      const text = `${props.title} ${props.subtitle ?? ""}`;
      needed =
        intro + outro + TITLE_DELAY + TITLE_FADE_IN + TITLE_FADE_OUT + readingFrames(text, fps);
    } else if (i === last && hasOutro) {
      const lines = props.outroLines ?? [];
      // Se lee sobre todo lo último que aparece: subtítulo y datos prácticos.
      const text = [props.outroSubtitle ?? "", ...lines].join(" ");
      const entrance =
        lines.length > 0
          ? LINE_OFFSET + (lines.length - 1) * LINE_STAGGER + LINE_FADE
          : TITLE_FADE_IN;
      needed = intro + TITLE_DELAY + entrance + readingFrames(text, fps) + END_FADE;
    } else if (photo.caption) {
      needed = intro + outro + CAPTION_DELAY + 2 * CAPTION_FADE + readingFrames(photo.caption, fps);
    }

    return Math.max(requested, needed);
  });
};

/**
 * Las transiciones SUPERPONEN fotos consecutivas (mientras una se funde,
 * la otra ya se ve), así que la duración total es la suma de las fotos
 * menos una transición por cada unión.
 */
export const getPhotoStoryDurationInFrames = (props: PhotoStoryProps, fps: number) =>
  resolvePhotoFrames(props, fps).reduce((acc, f) => acc + f, 0) -
  (props.photos.length - 1) * transitionFrames(props, fps);

/** Frame (global) en el que empieza cada foto, contando las superposiciones. */
const photoStarts = (frames: number[], tf: number) => {
  const starts: number[] = [];
  let acc = 0;
  frames.forEach((f) => {
    starts.push(acc);
    acc += f - tf;
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
  const src = resolveSrc(photo.src);
  const cameraMove = `scale(${scale}) translate(${x}%, ${y}%)`;

  if (photo.fit === "blur-fill") {
    return (
      <AbsoluteFill>
        {/* Fondo: la misma foto, agrandada y desenfocada. Escala extra para
            que el borde oscuro que deja el blur quede fuera de cuadro. */}
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(40px) brightness(0.75) saturate(1.2)",
            transform: "scale(1.2)",
          }}
        />
        {/* Frente: la foto entera, con el movimiento de cámara y una sombra
            que la despega del fondo. */}
        <AbsoluteFill>
          <Img
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transformOrigin: origin,
              transform: cameraMove,
              filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.5))",
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // Qué parte de la foto sobrevive al recorte 9:16 (clave en fotos
          // horizontales): la del punto de interés, no siempre el centro.
          objectPosition: `${photo.focusX}% ${photo.focusY}%`,
          transformOrigin: origin,
          transform: cameraMove,
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
  const inStart = introFrames + CAPTION_DELAY;
  const outEnd = durationInFrames - outroFrames;
  const opacity = interpolate(
    frame,
    [inStart, inStart + CAPTION_FADE, outEnd - CAPTION_FADE, outEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const lift = interpolate(frame, [inStart, inStart + CAPTION_FADE], [24, 0], {
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

/**
 * Título grande centrado: se usa para la apertura (sobre la primera foto)
 * y para el cierre (sobre la última). Con `outroFrames` = 0 se queda
 * hasta el final en vez de irse — el cierre no debe desaparecer antes de
 * que termine el video.
 */
const TitleCard: React.FC<{
  title: string;
  subtitle?: string;
  lines?: string[];
  durationInFrames: number;
  introFrames: number;
  outroFrames: number;
  textColor: string;
}> = ({ title, subtitle, lines, durationInFrames, introFrames, outroFrames, textColor }) => {
  const frame = useCurrentFrame();
  const inStart = introFrames + TITLE_DELAY;
  const outEnd = durationInFrames - outroFrames;
  const opacity =
    outroFrames > 0
      ? interpolate(
          frame,
          [inStart, inStart + TITLE_FADE_IN, outEnd - TITLE_FADE_OUT, outEnd],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : interpolate(frame, [inStart, inStart + TITLE_FADE_IN], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const scale = interpolate(frame, [inStart, inStart + TITLE_FADE_IN], [0.96, 1], {
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
          height: lines && lines.length > 0 ? 800 : 520,
          opacity,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 70%)",
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
              // Color del texto (no el de acento): el acento suele salir de
              // la marca y puede coincidir con el fondo de la foto (ej. una
              // pared pintada del mismo color) y volverse ilegible.
              color: textColor,
              opacity: 0.9,
              margin: "20px 0 0",
              textShadow: "0 2px 18px rgba(0,0,0,0.6)",
            }}
          >
            {subtitle}
          </p>
        ) : null}
        {lines && lines.length > 0 ? (
          <div
            style={{
              marginTop: 36,
              paddingTop: 28,
              borderTop: `2px solid ${textColor}40`,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {lines.map((line, i) => {
              // Entran de a una, después del título: el ojo lee en orden.
              const lineStart = inStart + LINE_OFFSET + i * LINE_STAGGER;
              const lineOpacity = interpolate(frame, [lineStart, lineStart + LINE_FADE], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <p
                  key={i}
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 32,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    color: textColor,
                    margin: 0,
                    opacity: lineOpacity,
                    textShadow: "0 2px 14px rgba(0,0,0,0.7)",
                  }}
                >
                  {line}
                </p>
              );
            })}
          </div>
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
 *   - Transiciones entre fotos elegibles por foto (fundido, deslizamiento,
 *     barrido; reutiliza src/components/transitions.tsx).
 *   - Título de apertura y cierre opcionales, y fundido a negro final
 *     junto con la música.
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
    outroTitle,
    outroSubtitle,
    outroLines,
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
  const frames = resolvePhotoFrames(props, fps);
  const starts = photoStarts(frames, tf);
  const last = photos.length - 1;
  const hasOutro = Boolean(outroTitle) && photos.length > 1;
  // Fundido a negro de los últimos ~0.5s, sincronizado con el de la música.
  const fadeToBlack = interpolate(frame, [durationInFrames - END_FADE, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
                  {...smoothTransition(photo.transition, transitionInSeconds, fps)}
                />
              ) : null}
              <TransitionSeries.Sequence durationInFrames={frames[i]}>
                <KenBurnsPhoto
                  photo={photo}
                  move={photo.move ?? AUTO_MOVES[i % AUTO_MOVES.length]}
                  durationInFrames={frames[i]}
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
        photo.caption && !(i === 0 && title) && !(i === last && hasOutro) ? (
          <Sequence key={i} from={starts[i]} durationInFrames={frames[i]}>
            <Caption
              text={photo.caption}
              durationInFrames={frames[i]}
              introFrames={i > 0 ? tf : 0}
              outroFrames={i < photos.length - 1 ? tf : 0}
              textColor={textColor}
              accentColor={accentColor}
            />
          </Sequence>
        ) : null,
      )}

      {title ? (
        <Sequence durationInFrames={frames[0]}>
          <TitleCard
            title={title}
            subtitle={subtitle}
            durationInFrames={frames[0]}
            introFrames={0}
            outroFrames={photos.length > 1 ? tf : 0}
            textColor={textColor}
          />
        </Sequence>
      ) : null}

      {hasOutro && outroTitle ? (
        <Sequence from={starts[last]} durationInFrames={frames[last]}>
          <TitleCard
            title={outroTitle}
            subtitle={outroSubtitle}
            lines={outroLines}
            durationInFrames={frames[last]}
            introFrames={tf}
            outroFrames={0}
            textColor={textColor}
          />
        </Sequence>
      ) : null}

      <AbsoluteFill style={{ backgroundColor: "#000000", opacity: fadeToBlack }} />

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
