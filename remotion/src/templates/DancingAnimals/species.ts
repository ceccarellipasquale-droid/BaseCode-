/**
 * Configuración visual por especie: cada animal es una figura hecha con
 * formas simples (círculos/óvalos vía CSS), no una imagen. `species` solo
 * cambia la forma de las orejas/pico y si tiene cola, para que se
 * distingan entre sí sin necesitar assets externos.
 */
export const SPECIES = ["fox", "cat", "dog", "duck", "bear"] as const;
export type Species = (typeof SPECIES)[number];

export type SpeciesConfig = {
  label: string;
  bodyColor: string;
  accentColor: string;
  ears: "pointy" | "round" | "floppy" | "none";
  hasBill: boolean;
  hasTail: boolean;
};

export const SPECIES_CONFIG: Record<Species, SpeciesConfig> = {
  fox: {
    label: "Zorro",
    bodyColor: "#ff8a3d",
    accentColor: "#fff3e6",
    ears: "pointy",
    hasBill: false,
    hasTail: true,
  },
  cat: {
    label: "Gato",
    bodyColor: "#6b6f8a",
    accentColor: "#f2f1f8",
    ears: "pointy",
    hasBill: false,
    hasTail: true,
  },
  dog: {
    label: "Perro",
    bodyColor: "#c9873f",
    accentColor: "#fbe8cf",
    ears: "floppy",
    hasBill: false,
    hasTail: true,
  },
  duck: {
    label: "Pato",
    bodyColor: "#ffd23f",
    accentColor: "#ff9f3d",
    ears: "none",
    hasBill: true,
    hasTail: false,
  },
  bear: {
    label: "Oso",
    bodyColor: "#8a5a3b",
    accentColor: "#e8cbab",
    ears: "round",
    hasBill: false,
    hasTail: false,
  },
};
