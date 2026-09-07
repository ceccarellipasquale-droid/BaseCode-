import type { z } from "zod";
import { InfiniteLoop, infiniteLoopSchema } from "./InfiniteLoop";

/**
 * Registro central de plantillas.
 *
 * Añadir una plantilla nueva = crear su carpeta en src/templates/<Nombre>
 * (componente + schema.ts) y agregar una entrada aquí. Root.tsx recorre
 * este objeto para registrar automáticamente una <Composition> por
 * plantilla, y scripts/render-batch.ts lo usa para saber qué componente y
 * qué schema corresponden al campo "template" de cada entrada del JSON de
 * datos. Ningún otro archivo necesita tocarse.
 */
export const templates = {
  "infinite-loop": {
    label: "Bucle infinito",
    component: InfiniteLoop,
    schema: infiniteLoopSchema,
    defaultProps: infiniteLoopSchema.parse({
      title: "Tu titular aquí",
      subtitle: "Una línea de apoyo breve y clara",
      label: "BASECODE",
      durationInSeconds: 8,
    }),
    /** Cuadros totales de la composición a partir de las props validadas. */
    getDurationInFrames: (
      props: z.infer<typeof infiniteLoopSchema>,
      fps: number,
    ) => Math.round(props.durationInSeconds * fps),
  },
} as const;

export type TemplateId = keyof typeof templates;
