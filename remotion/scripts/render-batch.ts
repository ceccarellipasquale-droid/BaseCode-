/**
 * Renderiza en lote todos los videos definidos en data/videos.json.
 *
 * Flujo: 1) valida CADA entrada contra el schema de Zod de su plantilla
 * (así un error de datos se detecta antes de gastar tiempo de render, y
 * señala exactamente qué video y qué campo están mal); 2) empaqueta el
 * proyecto una sola vez (bundle); 3) renderiza cada video a out/, con un
 * nombre de archivo automático (no hay que tipearlo a mano).
 *
 * Uso: npm run render:batch  [-- ruta/al/data.json]
 */
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { z } from "zod";
import { videoDataFileSchema, type VideoEntry } from "../src/data/schema";
import { templates } from "../src/templates";

const ROOT = path.join(__dirname, "..");
const ENTRY_POINT = path.join(ROOT, "src", "index.ts");
const OUTPUT_DIR = path.join(ROOT, "out");

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "") // saca acentos (tras normalize("NFD"))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Nombre de archivo automático: "01-slug-del-id.mp4". */
const outputFileName = (entry: VideoEntry, index: number) => {
  const base = slugify(entry.outputName ?? entry.id);
  const prefix = String(index + 1).padStart(2, "0");
  return `${prefix}-${base}.mp4`;
};

type ValidatedEntry = {
  entry: VideoEntry;
  fileName: string;
  props: Record<string, unknown>;
};

const loadDataFile = (dataPath: string) => {
  const raw = fs.readFileSync(dataPath, "utf-8");
  const json = JSON.parse(raw);
  return videoDataFileSchema.parse(json);
};

/**
 * Valida las props de cada entrada contra el schema Zod de SU plantilla.
 * Se validan todas antes de renderizar nada, para fallar rápido y de una
 * sola vez si hay varios errores en el JSON.
 */
const validateEntries = (entries: VideoEntry[]): ValidatedEntry[] => {
  const errors: string[] = [];
  const validated: ValidatedEntry[] = [];

  entries.forEach((entry, index) => {
    const template = templates[entry.template];
    const result = template.schema.safeParse(entry.props);

    if (!result.success) {
      const details = result.error.issues
        .map((issue: z.ZodIssue) => `  - ${issue.path.join(".") || "(raíz)"}: ${issue.message}`)
        .join("\n");
      errors.push(`Video "${entry.id}" (plantilla "${entry.template}"):\n${details}`);
      return;
    }

    validated.push({
      entry,
      fileName: outputFileName(entry, index),
      // El registro tipa `schema` como z.ZodTypeAny (para poder guardar
      // plantillas con props distintas en el mismo objeto — ver
      // src/templates/index.ts), así que acá se pierde el tipo concreto.
      // En runtime siempre es el objeto de props validado.
      props: result.data as Record<string, unknown>,
    });
  });

  if (errors.length > 0) {
    throw new Error(
      `Se encontraron ${errors.length} error(es) en data/videos.json:\n\n${errors.join("\n\n")}`,
    );
  }

  return validated;
};

const main = async () => {
  const dataPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(ROOT, "data", "videos.json");

  console.log(`Leyendo datos de: ${dataPath}`);
  const entries = loadDataFile(dataPath);
  const validated = validateEntries(entries);
  console.log(`${validated.length} video(s) válido(s). Empaquetando el proyecto...`);

  const bundleLocation = await bundle({
    entryPoint: ENTRY_POINT,
    webpackOverride: (config) => config,
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results: { id: string; status: "ok" | "error"; detail?: string }[] = [];

  for (const { entry, fileName, props } of validated) {
    const outputLocation = path.join(OUTPUT_DIR, fileName);
    console.log(`\n▶ Renderizando "${entry.id}" → out/${fileName}`);

    try {
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: entry.template,
        inputProps: props,
      });

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation,
        inputProps: props,
        onProgress: ({ progress }) => {
          process.stdout.write(`\r  progreso: ${Math.round(progress * 100)}%  `);
        },
      });

      process.stdout.write("\n");
      console.log(`  ✔ Listo: out/${fileName}`);
      results.push({ id: entry.id, status: "ok" });
    } catch (error) {
      process.stdout.write("\n");
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`  ✘ Falló "${entry.id}": ${detail}`);
      results.push({ id: entry.id, status: "error", detail });
    }
  }

  const failed = results.filter((r) => r.status === "error");
  console.log(
    `\nResumen: ${results.length - failed.length}/${results.length} video(s) renderizados en out/.`,
  );

  if (failed.length > 0) {
    console.log("Fallaron:");
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.detail}`));
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
