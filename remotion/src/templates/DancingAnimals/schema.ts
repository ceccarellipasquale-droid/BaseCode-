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
    { species: "fox" },
    { species: "cat" },
    { species: "duck" },
  ]),
  durationInSeconds: z.number().min(2).max(60).default(8),
  /**
   * Cuántas veces completan el paso básico (balanceo de cadera de lado a
   * lado) a lo largo de todo el clip. Un número más alto = baile más
   * rápido/enérgico. Tiene que ser un entero para que el loop cierre
   * exacto (ver src/lib/loop.ts).
   */
  danceCycles: z.number().int().min(1).max(40).default(6),
  /** Ruta bajo /public o URL absoluta a una pista de salsa. */
  audioSrc: z.string().optional(),
  backgroundColor: zColor().default("#1a1030"),
  floorColor: zColor().default("#2a1a4d"),
  spotlightColor: zColor().default("#ff2fb0"),
});

export type DancingAnimalsProps = z.infer<typeof dancingAnimalsSchema>;
