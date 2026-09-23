/**
 * Utilidad para animaciones "de bucle infinito".
 *
 * Garantía que ofrece: para cualquier duración `durationInFrames`, el cuadro
 * 0 y el cuadro `durationInFrames - 1` producen EXACTAMENTE el mismo valor
 * de progreso. Si toda la animación de una plantilla se deriva de este
 * progreso (opacidades, escalas, posiciones, rotación de fondo, etc.), el
 * primer y el último cuadro son visualmente idénticos y la repetición del
 * video (loop) no se nota.
 *
 * Cómo funciona: en vez de un progreso lineal 0→1 a lo largo de todo el
 * clip, se refleja el avance como un "ping-pong": sube desde 0 hasta 1 en
 * la mitad del clip y luego vuelve a bajar hasta 0 en la otra mitad. Como
 * la bajada es la imagen especular exacta de la subida, el punto de
 * partida (frame 0) y el punto de llegada (último frame) caen en el mismo
 * valor (0) por construcción matemática, no por aproximación.
 */

/**
 * Devuelve un "frame espejado": crece de 0 a la mitad de la duración y
 * luego decrece simétricamente, terminando en 0 en el último frame.
 */
export const getMirroredFrame = (
  frame: number,
  durationInFrames: number,
): number => {
  const lastFrame = durationInFrames - 1;
  const half = lastFrame / 2;
  return half - Math.abs(frame - half);
};

/**
 * Progreso 0→1→0 pensado para manejar animaciones de entrada/salida
 * simétricas (fade in/out, escala, desplazamiento): sube durante
 * `transitionFrames`, se mantiene en 1 el resto del clip, y baja
 * simétricamente durante los últimos `transitionFrames`.
 */
export const useLoopProgress = (
  frame: number,
  durationInFrames: number,
  transitionFrames: number,
): number => {
  const lastFrame = durationInFrames - 1;
  const fadeOutStart = lastFrame - transitionFrames;

  if (frame <= transitionFrames) {
    return frame / transitionFrames;
  }

  if (frame >= fadeOutStart) {
    return (lastFrame - frame) / transitionFrames;
  }

  return 1;
};

/**
 * Progreso continuo 0→1 pensado para elementos decorativos de fondo
 * (rotaciones, degradés en movimiento, partículas) que deben completar un
 * número entero de ciclos exactamente al final del clip, de modo que su
 * estado en el frame 0 y en el último frame coincida.
 *
 * Importante: se divide por `durationInFrames - 1` (el índice del último
 * frame), no por `durationInFrames`. Así, con `cycles` entero, el progreso
 * en el frame 0 y en el último frame es EXACTAMENTE el mismo (0), y además
 * la velocidad angular/de desplazamiento es constante en todo el clip, por
 * lo que el "empalme" al repetir el video no tiene salto de posición ni de
 * velocidad.
 */
export const useCyclicProgress = (
  frame: number,
  durationInFrames: number,
  cycles = 1,
): number => {
  const lastFrame = Math.max(durationInFrames - 1, 1);
  const t = frame / lastFrame;
  return (t * cycles) % 1;
};
