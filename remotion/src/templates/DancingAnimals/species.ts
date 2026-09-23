/**
 * Configuración visual por especie: cada animal es una figura hecha con
 * formas simples (CSS), no una imagen. `species` cambia orejas/pico/cola
 * Y ahora también "decoraciones" propias de cada animal (melena, rayas,
 * manchas, cuello largo) para que se distingan bien sin necesitar
 * assets externos.
 */
export const SPECIES = [
  "fox",
  "cat",
  "dog",
  "duck",
  "bear",
  "lion",
  "giraffe",
  "zebra",
] as const;
export type Species = (typeof SPECIES)[number];

export type SpeciesConfig = {
  label: string;
  bodyColor: string;
  accentColor: string;
  ears: "pointy" | "round" | "floppy" | "none";
  hasBill: boolean;
  hasTail: boolean;
  /** Melena tipo león (círculos alrededor de la cabeza). */
  hasMane?: boolean;
  maneColor?: string;
  /** Cuello largo tipo jirafa (agrega un segmento entre cuerpo y cabeza). */
  neckLength?: number;
  /** Manchas tipo jirafa. */
  hasPatches?: boolean;
  /** Rayas tipo cebra (reemplaza el sombreado sólido por un patrón). */
  hasStripes?: boolean;
  /** Ossicones (los "cuernitos" de la jirafa) en vez de orejas visibles. */
  hasOssicones?: boolean;
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
  lion: {
    label: "León",
    bodyColor: "#e8a548",
    accentColor: "#fff3df",
    ears: "round",
    hasBill: false,
    hasTail: true,
    hasMane: true,
    maneColor: "#c96a1f",
  },
  giraffe: {
    label: "Jirafa",
    bodyColor: "#f0c375",
    accentColor: "#a85f2a",
    ears: "round",
    hasBill: false,
    hasTail: true,
    neckLength: 150,
    hasPatches: true,
    hasOssicones: true,
  },
  zebra: {
    label: "Cebra",
    bodyColor: "#f5f4f0",
    accentColor: "#1c1b1c",
    ears: "round",
    hasBill: false,
    hasTail: true,
    hasStripes: true,
  },
};
