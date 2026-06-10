import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import type { POI, Ruta, Clima } from "@/types";

// ──────────────────────────────────────────────
// Schemas Zod
// ──────────────────────────────────────────────

const CategoriaPOISchema = z.enum([
  "parque_natural",
  "museo",
  "atraccion_historica",
  "tour_marino",
  "fauna_marina",
  "glaciar",
  "senderismo",
  "paisaje",
  "gastronomia_cultural",
  "mirador",
  "deporte_aventura",
  "reserva_natural",
]);

const CondicionClimaSchema = z.enum(["Soleado", "Lluvioso", "Despejado"]);

export const PoiSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  categoria: CategoriaPOISchema,
  descripcion: z.string().min(1),
  duracion_min: z.number().positive(),
  distancia_puerto_km: z.number().nonnegative(),
  accesible: z.boolean(),
  accesibilidad_detalle: z.string(),
  idiomas: z.array(z.string()).min(1),
  horarios: z.string(),
  clima_recomendado: z.array(CondicionClimaSchema).min(1),
  requiere_navegacion: z.boolean().optional(),
});

export const RutaSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  origen: z.literal("puerto"),
  descripcion: z.string().min(1),
  pois: z.array(z.string()).min(1),
  duracion_total_min: z.number().positive(),
  distancia_total_km: z.number().nonnegative(),
});

export const ClimaSchema = z.object({
  condicion: CondicionClimaSchema,
  temp_c: z.number(),
  condiciones_disponibles: z.array(CondicionClimaSchema).min(1),
  nota_demo: z.string(),
});

export const PoisArraySchema = z.array(PoiSchema).min(1);
export const RutasArraySchema = z.array(RutaSchema).min(1);

// ──────────────────────────────────────────────
// Guard de drift (compile-time)
// Si un schema Zod y su tipo a mano en @/types divergen, esto NO compila
// (Exact<...> pasa a ser `false` y no es asignable a `true`). Costo cero en runtime.
// ──────────────────────────────────────────────

type Exact<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;

const _driftPoi: Exact<z.infer<typeof PoiSchema>, POI> = true;
const _driftRuta: Exact<z.infer<typeof RutaSchema>, Ruta> = true;
const _driftClima: Exact<z.infer<typeof ClimaSchema>, Clima> = true;
void [_driftPoi, _driftRuta, _driftClima];

// ──────────────────────────────────────────────
// Loader interno
// ──────────────────────────────────────────────

function readJson(filename: string): unknown {
  const filePath = join(process.cwd(), "data", filename);
  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`[data] No se pudo leer ${filename}: ${String(err)}`);
  }
}

function parseOrThrow<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  filename: string
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`[data] ${filename} no pasa la validación:\n${issues}`);
  }
  return result.data;
}

// ──────────────────────────────────────────────
// Funciones públicas
// ──────────────────────────────────────────────

export function loadPois(): POI[] {
  return parseOrThrow(PoisArraySchema, readJson("pois.json"), "pois.json");
}

export function loadRutas(): Ruta[] {
  const rutas = parseOrThrow(RutasArraySchema, readJson("rutas.json"), "rutas.json");

  // Integridad referencial: los ids en rutas.pois deben existir en pois.json.
  // Los schemas Zod validan forma, no referencias; sin esto, un id mal escrito
  // produciría una ruta hidratada con POIs faltantes sin ningún error.
  const poiIds = new Set(loadPois().map((p) => p.id));
  const rotas = rutas.flatMap((r) =>
    r.pois
      .filter((pid) => !poiIds.has(pid))
      .map((pid) => `  • ${r.id} → POI inexistente '${pid}'`)
  );
  if (rotas.length > 0) {
    throw new Error(
      `[data] rutas.json referencia POIs que no existen en pois.json:\n${rotas.join("\n")}`
    );
  }

  return rutas;
}

export function loadClima(): Clima {
  return parseOrThrow(ClimaSchema, readJson("clima.json"), "clima.json");
}
