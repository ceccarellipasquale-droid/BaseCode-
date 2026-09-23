import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export const KEN_BURNS_MOVES = [
  "zoom-in",
  "zoom-out",
  "pan-left",
  "pan-right",
  "pan-up",
  "pan-down",
] as const;

const photoSchema = z.object({
  /** Ruta bajo /public (ej. "/images/cafe/barra.jpg") o URL absoluta. */
  src: z.string().min(1),
  /** Texto corto sobre la foto (ej. "Nuestro espresso"). Opcional. */
  caption: z.string().max(60).optional(),
  /**
   * Mínimo 2s: siempre más larga que la transición máxima (1.5s), porque
   * Remotion exige que una transición no dure más que las escenas que une.
   */
  durationInSeconds: z.number().min(2).max(15).default(3),
  /**
   * Movimiento de "cámara" sobre la foto. Si se omite, se elige solo en
   * rotación (zoom-in, pan-right, zoom-out, pan-left, ...) para que dos
   * fotos seguidas nunca se muevan igual.
   */
  move: z.enum(KEN_BURNS_MOVES).optional(),
  /**
   * Punto de interés de la foto, en % (0-100). El zoom se acerca hacia
   * ahí — útil para que no quede cortado lo importante (una taza, una
   * cara) en el formato vertical.
   */
  focusX: z.number().min(0).max(100).default(50),
  focusY: z.number().min(0).max(100).default(50),
});

export const photoStorySchema = z.object({
  /** Título que aparece sobre la primera foto (ej. el nombre del local). */
  title: z.string().max(60).optional(),
  subtitle: z.string().max(80).optional(),
  photos: z.array(photoSchema).min(1).max(20),
  /** Duración del fundido entre fotos. */
  transitionInSeconds: z.number().min(0.2).max(1.5).default(0.6),
  /**
   * Intensidad del temblor de "cámara en mano": 0 = trípode, 1 = normal,
   * 2 = mucho. Es lo que más vende la sensación de "lo grabé yo".
   */
  handheld: z.number().min(0).max(2).default(1),
  audioSrc: z.string().optional(),
  textColor: zColor().default("#ffffff"),
  accentColor: zColor().default("#f2c38b"),
  /** Tinte cálido sutil sobre todas las fotos, para unificar el "look". */
  tintColor: zColor().default("#ff9a3c"),
  tintOpacity: z.number().min(0).max(0.4).default(0.08),
});

export type PhotoStoryProps = z.infer<typeof photoStorySchema>;
