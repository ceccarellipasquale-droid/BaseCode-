import { z } from "zod";
import { templates, type TemplateId } from "../templates";

const templateIds = Object.keys(templates) as [TemplateId, ...TemplateId[]];

/**
 * Envoltorio de cada entrada de data/videos.json. Solo valida la forma
 * general (qué plantilla usar, cómo se llamará el archivo de salida);
 * `props` se valida aparte con el schema de Zod específico de la
 * plantilla (ver scripts/render-batch.ts), para dar errores señalando
 * exactamente qué campo de qué video está mal.
 */
export const videoEntrySchema = z.object({
  id: z.string().min(1),
  template: z.enum(templateIds),
  /** Nombre del archivo de salida, sin extensión. Si se omite, se usa `id`. */
  outputName: z.string().min(1).optional(),
  props: z.record(z.string(), z.unknown()),
});

export const videoDataFileSchema = z.array(videoEntrySchema).min(1);

export type VideoEntry = z.infer<typeof videoEntrySchema>;
