import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { linearTiming } from "@remotion/transitions";
import { TransitionSeries } from "@remotion/transitions";

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
) => {
  const timing = linearTiming({
    durationInFrames: Math.round(durationInSeconds * fps),
  });

  switch (preset) {
    case "slide-left":
      return { presentation: slide({ direction: "from-right" }), timing };
    case "slide-right":
      return { presentation: slide({ direction: "from-left" }), timing };
    case "wipe-up":
      return { presentation: wipe({ direction: "from-bottom" }), timing };
    case "fade":
    default:
      return { presentation: fade(), timing };
  }
};

export { TransitionSeries };
