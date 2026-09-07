import "./index.css";
import { Composition } from "remotion";
import { templates } from "./templates";

/** Composición base para todo video vertical (TikTok / Reels / Shorts). */
const VERTICAL_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/**
 * Se registra una <Composition> por cada plantilla del registro
 * (src/templates/index.ts) en vez de escribirlas a mano una por una: así,
 * agregar una plantilla nueva no requiere tocar este archivo.
 *
 * La duración es parametrizable: `calculateMetadata` la recalcula a partir
 * de `durationInSeconds` (parte del schema de cada plantilla) cada vez que
 * cambian las props, ya sea en el Studio o al renderizar con --props.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {Object.entries(templates).map(([id, template]) => (
        <Composition
          key={id}
          id={id}
          component={template.component}
          schema={template.schema}
          defaultProps={template.defaultProps}
          durationInFrames={template.getDurationInFrames(
            template.defaultProps,
            VERTICAL_VIDEO.fps,
          )}
          fps={VERTICAL_VIDEO.fps}
          width={VERTICAL_VIDEO.width}
          height={VERTICAL_VIDEO.height}
          calculateMetadata={async ({ props }) => ({
            durationInFrames: template.getDurationInFrames(
              props,
              VERTICAL_VIDEO.fps,
            ),
          })}
        />
      ))}
    </>
  );
};
