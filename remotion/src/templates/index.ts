import type React from "react";
import type { z } from "zod";
import { DancingAnimals, dancingAnimalsSchema } from "./DancingAnimals";
import { InfiniteLoop, infiniteLoopSchema } from "./InfiniteLoop";
import {
  PhotoStory,
  getPhotoStoryDurationInFrames,
  photoStorySchema,
} from "./PhotoStory";

type TemplateEntry<Props> = {
  label: string;
  component: React.ComponentType<Props>;
  schema: z.ZodTypeAny;
  defaultProps: Props;
  /** Cuadros totales de la composición a partir de las props validadas. */
  getDurationInFrames: (props: Props, fps: number) => number;
};

/**
 * Registra una plantilla verificando, en ESTE punto, que su componente,
 * schema y props por defecto coinciden entre sí (gracias al genérico
 * `Props`, inferido del propio objeto que se le pasa). El resultado se
 * "borra" a `TemplateEntry<unknown>` para que TypeScript pueda guardar
 * plantillas con props distintas en el mismo registro sin quejarse; la
 * seguridad de tipos ya se validó acá, una única vez, por plantilla.
 */
const defineTemplate = <Props,>(
  entry: TemplateEntry<Props>,
): TemplateEntry<unknown> => entry as unknown as TemplateEntry<unknown>;

/**
 * Registro central de plantillas.
 *
 * Añadir una plantilla nueva = crear su carpeta en src/templates/<Nombre>
 * (componente + schema.ts) y agregar una entrada aquí con
 * `defineTemplate({...})`. Root.tsx recorre este objeto para registrar
 * automáticamente una <Composition> por plantilla, y
 * scripts/render-batch.ts lo usa para saber qué componente y qué schema
 * corresponden al campo "template" de cada entrada del JSON de datos.
 * Ningún otro archivo necesita tocarse.
 */
export const templates = {
  "infinite-loop": defineTemplate({
    label: "Bucle infinito",
    component: InfiniteLoop,
    schema: infiniteLoopSchema,
    defaultProps: infiniteLoopSchema.parse({
      title: "Tu titular aquí",
      subtitle: "Una línea de apoyo breve y clara",
      label: "BASECODE",
      durationInSeconds: 8,
    }),
    getDurationInFrames: (props, fps) =>
      Math.round(props.durationInSeconds * fps),
  }),
  "dancing-animals": defineTemplate({
    label: "Animales bailando salsa",
    component: DancingAnimals,
    schema: dancingAnimalsSchema,
    defaultProps: dancingAnimalsSchema.parse({
      title: "¡A bailar salsa! 💃🕺",
    }),
    getDurationInFrames: (props, fps) =>
      Math.round(props.durationInSeconds * fps),
  }),
  "photo-story": defineTemplate({
    label: "Historia en fotos (Ken Burns)",
    component: PhotoStory,
    schema: photoStorySchema,
    defaultProps: photoStorySchema.parse({
      title: "Café de la Esquina",
      subtitle: "Tostado artesanal · desde 2019",
      photos: [
        { src: "/images/cafe-demo/01-fachada.svg" },
        { src: "/images/cafe-demo/02-barra.svg", caption: "La barra" },
        { src: "/images/cafe-demo/03-latte.svg", caption: "Latte art" },
        { src: "/images/cafe-demo/04-pasteleria.svg", caption: "Pastelería del día" },
        { src: "/images/cafe-demo/05-mesa.svg", caption: "Te esperamos ☕" },
      ],
    }),
    // La duración NO es un campo: sale de sumar las fotos y restar las
    // superposiciones de las transiciones (ver PhotoStory.tsx).
    getDurationInFrames: getPhotoStoryDurationInFrames,
  }),
} as const;

export type TemplateId = keyof typeof templates;
