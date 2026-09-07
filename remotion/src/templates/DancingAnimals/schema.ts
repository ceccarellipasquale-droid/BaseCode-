import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { SPECIES } from "./species";

const animalSchema = z.object({
  species: z.enum(SPECIES),
  /** Si se omite, se usa el color por defecto de la especie (ver species.ts). */
  bodyColor: zColor().optional(),
  accentColor: zColor().optional(),
});

export const dancingAnimalsSchema = z.object({
  title: z.string().max(80).optional(),
  animals: z.array(animalSchema).min(1).max(4).default([
    { species: "giraffe" },
    { species: "lion" },
    { species: "zebra" },
  ]),
  durationInSeconds: z.number().min(2).max(60).default(8),
  /**
   * Cuántas veces se repite el paso básico COMPLETO de salsa (un compás
   * de 8 counts: 1-2-3, pausa-4, 5-6-7, pausa-8 — ver DancingAnimal.tsx)
   * a lo largo de todo el clip. Tiene que ser un entero para que el loop
   * cierre exacto (ver src/lib/loop.ts). Para que el ritmo del paso
   * coincida con una pista real: cycles ≈ (duración_seg × bpm / 60) / 8.
   */
  danceCycles: z.number().int().min(1).max(40).default(2),
  /** Ruta bajo /public o URL absoluta a una pista de salsa. */
  audioSrc: z.string().optional(),
  backgroundColor: zColor().default("#1a1030"),
  floorColor: zColor().default("#2a1a4d"),
  spotlightColor: zColor().default("#ff2fb0"),
});

export type DancingAnimalsProps = z.infer<typeof dancingAnimalsSchema>;
