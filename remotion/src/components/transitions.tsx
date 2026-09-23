import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { linearTiming } from "@remotion/transitions";
import { TransitionSeries } from "@remotion/transitions";
import type {
  TransitionPresentation,
  TransitionTiming,
} from "@remotion/transitions";

type AnyPresentation = TransitionPresentation<Record<string, unknown>>;

/**
 * Cada preset tiene su propio tipo de props (SlideProps, WipeProps...),
 * así que sin esto la función devuelve una UNIÓN que
 * `<TransitionSeries.Transition>` no sabe aceptar. Se unifica el tipo acá,
 * una sola vez: los props concretos ya están fijados dentro de cada
 * presentación y nadie los vuelve a leer desde afuera.
 */
export type SmoothTransition = {
  presentation: AnyPresentation;
  timing: TransitionTiming;
};

/**
 * Transiciones reutilizables entre escenas.
 *
 * Uso típico, para encadenar varias escenas dentro de UNA composición:
 *
 * ```tsx
 * <TransitionSeries>
 *   <TransitionSeries.Sequence durationInFrames={90}>
 *     <EscenaA />
 *   </TransitionSeries.Sequence>
 *   <TransitionSeries.Transition {...smoothTransition("fade", 0.5, fps)} />
 *   <TransitionSeries.Sequence durationInFrames={90}>
 *     <EscenaB />
 *   </TransitionSeries.Sequence>
 * </TransitionSeries>
 * ```
 *
 * Se centraliza aquí para que todas las plantillas usen la misma duración
 * y "easing" por defecto, en vez de que cada una reinvente su transición.
 */
export type TransitionPreset = "fade" | "slide-left" | "slide-right" | "wipe-up";

export const smoothTransition = (
  preset: TransitionPreset,
  durationInSeconds: number,
  fps: number,
): SmoothTransition => {
  const timing = linearTiming({
    durationInFrames: Math.round(durationInSeconds * fps),
  });

  const presentation = (() => {
    switch (preset) {
      case "slide-left":
        return slide({ direction: "from-right" });
      case "slide-right":
        return slide({ direction: "from-left" });
      case "wipe-up":
        return wipe({ direction: "from-bottom" });
      case "fade":
      default:
        return fade();
    }
  })();

  return { presentation: presentation as unknown as AnyPresentation, timing };
};

export { TransitionSeries };
