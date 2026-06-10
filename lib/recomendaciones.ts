import type {
  POI,
  Ruta,
  CondicionClima,
  POIRecomendado,
  RutaRecomendada,
  RecomendacionData,
  ScoreComponentes,
} from "@/types";

// ──────────────────────────────────────────────
// Constantes de scoring (ajustables en un solo lugar)
// ──────────────────────────────────────────────

/**
 * Pesos de cada componente del score. SUMAN 1 → el score final queda
 * normalizado en [0,1] y es directamente comparable / explicable.
 */
export const PESO_CLIMA = 0.35; // el clima actual es el factor más decisivo para disfrutar el POI
export const PESO_TIEMPO = 0.25; // aprovechar bien el tiempo en tierra (sin agotarlo)
export const PESO_CERCANIA = 0.25; // menos traslado = más tiempo útil para el crucerista
export const PESO_ACCESIBILIDAD = 0.15; // bonus por ser accesible aunque no se haya pedido

/**
 * Supuesto: velocidad media de traslado puerto↔POI en Ushuaia (mezcla de
 * combi/auto por rutas locales). NO usamos API de routing/Maps; el traslado
 * se estima solo a partir de distancia_puerto_km.
 */
export const VELOCIDAD_TRASLADO_KMH = 40;

/** Cantidad máxima de POIs a devolver en el ranking. */
export const TOP_N = 5;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));
const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Supuesto: traslado ida (en minutos) estimado linealmente desde la distancia
 * al puerto. El crucerista debe volver al barco, así que el costo de tiempo de
 * visitar un POI es duracion + 2×traslado (ida y vuelta) — ver tiempoTotalPoi.
 */
export function estimarTrasladoMin(distanciaPuertoKm: number): number {
  return (distanciaPuertoKm / VELOCIDAD_TRASLADO_KMH) * 60;
}

/** Tiempo total que "cuesta" un POI: visita + ida y vuelta al puerto. */
export function tiempoTotalPoi(poi: POI): number {
  return poi.duracion_min + 2 * estimarTrasladoMin(poi.distancia_puerto_km);
}

// ──────────────────────────────────────────────
// Scoring de POIs
// ──────────────────────────────────────────────

function calcularComponentes(
  poi: POI,
  clima: CondicionClima,
  tiempoDisponible: number,
  maxDistancia: number
): ScoreComponentes {
  const climaMatch = poi.clima_recomendado.includes(clima) ? 1 : 0;
  // Cuanta más holgura deja el POI dentro del tiempo disponible, mejor.
  const tiempo = clamp01(1 - tiempoTotalPoi(poi) / tiempoDisponible);
  const accesibilidad = poi.accesible ? 1 : 0;
  // maxDistancia > 0 garantizado por los datos (hay POIs lejanos); guard por las dudas.
  const cercania = maxDistancia > 0 ? clamp01(1 - poi.distancia_puerto_km / maxDistancia) : 1;
  return { clima: climaMatch, tiempo, accesibilidad, cercania };
}

function scoreDesde(c: ScoreComponentes): number {
  return round2(
    PESO_CLIMA * c.clima +
      PESO_TIEMPO * c.tiempo +
      PESO_ACCESIBILIDAD * c.accesibilidad +
      PESO_CERCANIA * c.cercania
  );
}

function motivoPoi(poi: POI, clima: CondicionClima, c: ScoreComponentes): string {
  const partes: string[] = [];
  if (c.clima === 1) {
    partes.push(`ideal con clima ${clima.toLowerCase()}`);
  } else {
    partes.push(`apto aunque no es lo óptimo para clima ${clima.toLowerCase()}`);
  }
  partes.push(
    `~${Math.round(tiempoTotalPoi(poi))} min ida y vuelta desde el puerto`
  );
  if (poi.distancia_puerto_km <= 1) {
    partes.push("muy cerca del puerto");
  } else {
    partes.push(`a ${poi.distancia_puerto_km} km del puerto`);
  }
  if (poi.accesible) partes.push("accesible");
  return partes.join("; ") + ".";
}

// ──────────────────────────────────────────────
// Motor de recomendación (puro, determinístico)
// ──────────────────────────────────────────────

export interface RecomendacionInput {
  tiempoDisponible: number;
  accesible?: boolean;
  clima: CondicionClima;
}

export function generarRecomendaciones(
  input: RecomendacionInput,
  pois: POI[],
  rutas: Ruta[]
): RecomendacionData {
  const { tiempoDisponible, accesible, clima } = input;
  const maxDistancia = Math.max(...pois.map((p) => p.distancia_puerto_km));

  // Filtros duros: debe entrar en el tiempo (ida y vuelta) y, si se pidió,
  // ser accesible. No recomendamos algo que el crucerista no puede hacer.
  const candidatos = pois.filter((p) => {
    if (accesible === true && !p.accesible) return false;
    return tiempoTotalPoi(p) <= tiempoDisponible;
  });

  const rankeados: POIRecomendado[] = candidatos
    .map((poi) => {
      const componentes = calcularComponentes(poi, clima, tiempoDisponible, maxDistancia);
      return {
        ...poi,
        componentes,
        score: scoreDesde(componentes),
        motivo: motivoPoi(poi, clima, componentes),
      };
    })
    // Orden determinístico: score desc, luego más cercano, luego id (desempate estable).
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.distancia_puerto_km - b.distancia_puerto_km ||
        a.id.localeCompare(b.id)
    )
    .slice(0, TOP_N);

  const rutaRecomendada = mejorRuta(input, pois, rutas, maxDistancia);

  const data: RecomendacionData = { clima, pois: rankeados, rutaRecomendada };

  if (rankeados.length === 0) {
    data.mensaje = mensajeVacio(input, pois);
  }

  return data;
}

// ──────────────────────────────────────────────
// Ruta recomendada
// ──────────────────────────────────────────────

/**
 * Supuesto: el tiempo total de una ruta = suma de duraciones de sus POIs
 * (duracion_total_min) + traslado ida y vuelta estimado sobre distancia_total_km. Se elige
 * la ruta de mayor score (mismo criterio clima/cercanía/accesibilidad) que
 * entre en el tiempo disponible.
 */
function mejorRuta(
  input: RecomendacionInput,
  pois: POI[],
  rutas: Ruta[],
  maxDistancia: number
): RutaRecomendada | null {
  const { tiempoDisponible, accesible, clima } = input;
  const poisPorId = new Map(pois.map((p) => [p.id, p]));

  const candidatas = rutas
    .map((ruta) => {
      const miembros = ruta.pois
        .map((id) => poisPorId.get(id))
        .filter((p): p is POI => p !== undefined);
      const tiempoTotal = ruta.duracion_total_min + 2 * estimarTrasladoMin(ruta.distancia_total_km);
      return { ruta, miembros, tiempoTotal };
    })
    .filter(({ ruta, miembros, tiempoTotal }) => {
      if (tiempoTotal > tiempoDisponible) return false;
      if (accesible === true && !miembros.every((p) => p.accesible)) return false;
      return miembros.length > 0 && miembros.length === ruta.pois.length;
    });

  if (candidatas.length === 0) return null;

  const conScore = candidatas.map(({ ruta, miembros }) => {
    // Score de ruta: promedio de los componentes de sus POIs (clima/cercanía/
    // accesibilidad) ponderados igual que en los POIs individuales.
    const avg = (sel: (c: ScoreComponentes) => number) =>
      miembros.reduce(
        (acc, p) => acc + sel(calcularComponentes(p, clima, tiempoDisponible, maxDistancia)),
        0
      ) / miembros.length;
    const score = round2(
      PESO_CLIMA * avg((c) => c.clima) +
        PESO_TIEMPO * avg((c) => c.tiempo) +
        PESO_ACCESIBILIDAD * avg((c) => c.accesibilidad) +
        PESO_CERCANIA * avg((c) => c.cercania)
    );
    const climaOk = miembros.filter((p) => p.clima_recomendado.includes(clima)).length;
    const motivo =
      `Entra en tus ${tiempoDisponible} min; ${miembros.length} paradas, ` +
      `${climaOk} ideales para clima ${clima.toLowerCase()}` +
      (accesible === true ? "; toda accesible" : "") +
      ".";
    return { ruta, miembros, score, motivo };
  });

  conScore.sort(
    (a, b) =>
      b.score - a.score ||
      b.miembros.length - a.miembros.length ||
      a.ruta.id.localeCompare(b.ruta.id)
  );

  const mejor = conScore[0];
  return {
    ...mejor.ruta,
    pois: mejor.miembros,
    score: mejor.score,
    motivo: mejor.motivo,
  };
}

// ──────────────────────────────────────────────
// Estado vacío explicado
// ──────────────────────────────────────────────

function mensajeVacio(input: RecomendacionInput, pois: POI[]): string {
  const { tiempoDisponible, accesible } = input;
  const universo = accesible === true ? pois.filter((p) => p.accesible) : pois;

  if (accesible === true && universo.length === 0) {
    return "No hay POIs accesibles cargados para recomendar.";
  }

  const minNecesario = Math.min(...universo.map((p) => tiempoTotalPoi(p)));
  const accTxt = accesible === true ? " accesible" : "";
  return (
    `Con ${tiempoDisponible} min no llegás a visitar ningún punto${accTxt} ida y vuelta ` +
    `desde el puerto (el más cercano necesita ~${Math.round(minNecesario)} min). ` +
    `Probá con más tiempo disponible.`
  );
}
