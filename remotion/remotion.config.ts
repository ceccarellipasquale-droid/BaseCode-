/**
 * Config para el Remotion Studio y el CLI (`npx remotion render` / `npm run dev`).
 * No aplica cuando se renderiza por código (scripts/render-batch.ts): ahí las
 * opciones se pasan directamente a las funciones de @remotion/renderer.
 *
 * Documentación completa: https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
