import { zColor } from "@remotion/zod-types";
import { z } from "zod";

/**
 * Todas las variables de la plantilla viajan por props y se validan con
 * este schema. Nada de contenido queda escrito en el componente: cambiar
 * un video es cambiar el JSON de datos (ver data/videos.json), nunca el
 * código de la plantilla.
 */
export const infiniteLoopSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(200).optional(),
  /** Etiqueta corta tipo "chip" (ej. marca, categoría, hashtag). */
  label: z.string().max(40).optional(),
  /** Ruta bajo /public (staticFile) o URL absoluta a una imagen. */
  imageSrc: z.string().optional(),
  /** Ruta bajo /public (staticFile) o URL absoluta a un audio de fondo. */
  audioSrc: z.string().optional(),
  /**
   * Subtítulos palabra por palabra, sincronizados con `audioSrc`.
   * `start`/`end` son segundos dentro del clip. Opcional: si no se manda,
   * la plantilla no muestra subtítulos.
   */
  words: z
    .array(
      z.object({
        text: z.string(),
        start: z.number().min(0),
        end: z.number().min(0),
      }),
    )
    .optional(),
  /** Duración total del video en segundos. Ver Root.tsx (calculateMetadata). */
  durationInSeconds: z.number().min(1).max(180).default(8),
  /** Duración del fundido de entrada/salida, en segundos. */
  transitionInSeconds: z.number().min(0.2).max(3).default(0.6),
  backgroundColor: zColor().default("#0e0e0f"),
  surfaceColor: zColor().default("#1c1b1c"),
  primaryColor: zColor().default("#0266ff"),
  secondaryColor: zColor().default("#00dce5"),
  textColor: zColor().default("#e5e2e3"),
});

export type InfiniteLoopProps = z.infer<typeof infiniteLoopSchema>;
