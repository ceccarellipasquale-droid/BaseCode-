# Videos verticales — BaseCode

Proyecto Remotion para generar videos verticales (1080×1920, 9:16) para
TikTok, Instagram Reels y YouTube Shorts.

## Estructura

```
remotion/
├── data/videos.json          # Lista de videos a generar (contenido, sin código)
├── public/
│   ├── fonts/                 # Fuentes de marca autohospedadas (Geist, Inter, JetBrains Mono)
│   ├── images/                # Imágenes que uses como imageSrc
│   └── audio/                 # Música / voces que uses como audioSrc
├── src/
│   ├── config/brand.ts        # Paleta y tipografía de marca (fuente única de verdad)
│   ├── lib/loop.ts            # Utilidad matemática del "bucle infinito"
│   ├── components/
│   │   ├── AnimatedSubtitles.tsx  # Subtítulos palabra por palabra
│   │   └── transitions.tsx        # Transiciones reutilizables entre escenas
│   ├── templates/
│   │   ├── InfiniteLoop/      # Plantilla "Bucle infinito"
│   │   ├── DancingAnimals/    # Plantilla "Animales bailando salsa" (formas animadas, no IA)
│   │   └── index.ts           # Registro de plantillas (agregar una nueva = una línea acá)
│   ├── data/schema.ts          # Validación (Zod) de data/videos.json
│   └── Root.tsx                # Registra una <Composition> por plantilla
└── scripts/render-batch.ts     # Renderiza todo data/videos.json a out/
```

## Previsualizar en el Studio

```bash
npm install
npm run dev
```

Abre el Remotion Studio, donde podés ver cada plantilla, tocar sus props
(con validación de Zod en vivo) y reproducir el loop para confirmar que no
se nota el corte entre el último y el primer cuadro.

## Renderizar UN video suelto

Usando el `id` de una composición (hoy: `infinite-loop` o `dancing-animals`) y props en JSON:

```bash
npx remotion render infinite-loop out/mi-video.mp4 --props='{"title":"Hola","subtitle":"Un subtítulo"}'
```

También podés pasar un archivo de props:

```bash
npx remotion render infinite-loop out/mi-video.mp4 --props=./mis-props.json
```

## Renderizar TODO el lote (data/videos.json)

1. Editá `data/videos.json`: agregá, quitá o modificá entradas. Cada una
   define `id`, `template` (qué plantilla usar) y `props` (validadas con
   el schema de esa plantilla — ver `src/templates/<Plantilla>/schema.ts`).
2. Colocá las imágenes/audios que referencies en `public/images` o
   `public/audio`, y apuntalos desde el JSON como `"/images/archivo.jpg"`.
3. Corré:

```bash
npm run render:batch
```

Esto valida **todas** las entradas antes de renderizar nada (si algo está
mal en el JSON, te dice exactamente qué video y qué campo), y después
genera un `.mp4` por video en `out/`, con nombre automático
(`01-<id>.mp4`, `02-<id>.mp4`, …). También podés apuntar a otro archivo de
datos: `npm run render:batch -- ruta/a/otro.json`.

## Agregar una plantilla nueva

1. Creá `src/templates/<NombrePlantilla>/schema.ts` (Zod) y
   `<NombrePlantilla>.tsx` (el componente, que solo lee de sus props).
2. Agregala en `src/templates/index.ts`.

Con eso ya aparece sola en el Studio y queda disponible como `template` en
`data/videos.json` — no hace falta tocar `Root.tsx` ni el script de batch.
