/**
 * Paleta y tipografía de marca — fuente única de verdad.
 *
 * Los valores replican el sistema de diseño del sitio (ver ../../../DESIGN.md,
 * tema "Tech Industrial Dark") para que los videos generados se vean
 * coherentes con la web de BaseCode. Si la marca cambia, se edita SOLO
 * este archivo: ninguna plantilla debe tener colores o fuentes “hardcodeados”.
 *
 * Cada plantilla puede sobreescribir puntualmente un color vía props
 * (ver `colors` en el schema de cada plantilla y en data/videos.json),
 * pero siempre debe caer aquí por defecto.
 *
 * Fuentes autohospedadas: los .woff2 viven en public/fonts/ (en vez de
 * usar @remotion/google-fonts, que los descarga de Google en cada render).
 * Así los renders no dependen de la red -son más rápidos, reproducibles y
 * funcionan detrás de proxies/firewalls restrictivos-, algo especialmente
 * importante para un render por lotes de muchos videos.
 */
import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

const FONT_FAMILIES = {
  display: "Geist",
  body: "Inter",
  mono: "JetBrains Mono",
} as const;

/** Registra la carga de una fuente local y bloquea el render hasta que esté lista. */
const loadLocalFont = (family: string, fileName: string, weight = "100 900") => {
  const handle = delayRender(`Cargando fuente ${family}`);
  loadFont({
    family,
    url: staticFile(`/fonts/${fileName}`),
    weight,
  })
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(`No se pudo cargar la fuente ${family}:`, err);
      continueRender(handle);
    });
};

loadLocalFont(FONT_FAMILIES.display, "Geist-Variable.woff2");
loadLocalFont(FONT_FAMILIES.body, "Inter-Variable.woff2");
loadLocalFont(FONT_FAMILIES.mono, "JetBrainsMono-Variable.woff2", "500");

export const palette = {
  background: "#0e0e0f",
  surface: "#131314",
  surfaceContainer: "#1c1b1c",
  surfaceContainerHigh: "#2a2a2b",
  onSurface: "#e5e2e3",
  onSurfaceVariant: "#c2c6d8",
  outline: "#8c90a1",
  outlineVariant: "#424656",
  primary: "#0266ff",
  onPrimary: "#f8f7ff",
  secondary: "#00dce5",
  onSecondary: "#003739",
  error: "#ffb4ab",
} as const;

export type BrandColors = typeof palette;

export const fonts = FONT_FAMILIES;

export const typography = {
  displayLg: {
    fontFamily: fonts.display,
    fontSize: 88,
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: "-0.02em",
  },
  headlineMd: {
    fontFamily: fonts.display,
    fontSize: 52,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },
  bodyLg: {
    fontFamily: fonts.body,
    fontSize: 34,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 24,
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
  },
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};

export const spacing = {
  xs: 8,
  sm: 16,
  md: 32,
  lg: 64,
};
