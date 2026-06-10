import { z } from "zod";
import { categoriasEnTexto, normalizeText, SINONIMOS } from "@/lib/chat/i18n";
import { loadClima, loadPois, loadRutas } from "@/lib/data";
import { generarRecomendaciones } from "@/lib/recomendaciones";
import type { ChatClima, ChatToolData, ChatToolName, POI, RecomendacionData, RutaConPOIs } from "@/types";

export interface ChatTool<P, R extends ChatToolData> {
  name: ChatToolName;
  description: string;
  parameters: z.ZodType<P>;
  handler: (params: P) => R;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "from", "show", "place", "poi", "near", "within", "port", "km", "kilometer", "distance", "hour", "schedule", "open", "close", "accessible", "accessibility", "not",
  "los", "las", "del", "una", "uno", "para", "desde", "mostrame", "lugar", "lugare", "poi", "cerca", "puerto", "kilometro", "distancia", "horario", "abre", "cierra", "accesible", "accesibilidad",
  "der", "die", "das", "und", "von", "perto", "porto", "entfernung", "hafen", "route", "ruta", "rota", "路线", "行程", "距离", "港口", "מסלול", "מרחק", "נמל",
]);
const CATEGORY_TERMS = new Set(Object.values(SINONIMOS).flat().map(normalizeText));

function singular(token: string): string {
  return /^[a-z]+$/i.test(token) && token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : token;
}
function terms(value?: string): string[] {
  if (!value) return [];
  return normalizeText(value).split(/[^\p{L}\p{N}]+/u)
    .map(singular)
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term) && ![...CATEGORY_TERMS].some((categoryTerm) => term.includes(categoryTerm)));
}
function searchable(value: string): string {
  return normalizeText(value).split(/[^\p{L}\p{N}]+/u).map(singular).join(" ");
}

const consultarClima: ChatTool<Record<string, never>, ChatClima> = {
  name: "consultarClima", description: "Devuelve el clima mock actual de Ushuaia.", parameters: z.object({}).strict(),
  handler: () => {
    const { nota_demo: _notaDemo, ...clima } = loadClima();
    return clima;
  },
};
const RecomendarParams = z.object({
  tiempoDisponible: z.number().positive(),
  accesible: z.boolean().optional(),
  clima: z.enum(["Soleado", "Lluvioso", "Despejado"]).optional(),
});
const recomendar: ChatTool<z.infer<typeof RecomendarParams>, RecomendacionData> = {
  name: "recomendar", description: "Recomienda POIs y ruta según tiempo, accesibilidad y clima mock o indicado.", parameters: RecomendarParams,
  handler: ({ tiempoDisponible, accesible, clima }) => generarRecomendaciones(
    { tiempoDisponible, accesible, clima: clima ?? loadClima().condicion },
    loadPois(),
    loadRutas()
  ),
};
const BuscarParams = z.object({ consulta: z.string().optional(), accesible: z.boolean().optional(), maxDistanciaKm: z.number().nonnegative().optional() });
const buscarPOIs: ChatTool<z.infer<typeof BuscarParams>, POI[]> = {
  name: "buscarPOIs", description: "Busca POIs mock por texto, categoría multilingüe, accesibilidad y distancia al puerto.", parameters: BuscarParams,
  handler: ({ consulta, accesible, maxDistanciaKm }) => {
    const query = terms(consulta);
    const categories = consulta ? categoriasEnTexto(consulta) : [];
    return loadPois().filter((poi) => {
      if (accesible !== undefined && poi.accesible !== accesible) return false;
      if (maxDistanciaKm !== undefined && poi.distancia_puerto_km > maxDistanciaKm) return false;
      if (categories.length > 0 && !categories.includes(poi.categoria)) return false;
      const text = searchable(`${poi.id} ${poi.nombre} ${poi.descripcion} ${poi.categoria}`);
      return query.every((term) => text.includes(term));
    }).sort((a, b) => a.distancia_puerto_km - b.distancia_puerto_km || a.id.localeCompare(b.id)).slice(0, 5);
  },
};
const RutaParams = z.object({ consulta: z.string().optional() });
const infoRuta: ChatTool<z.infer<typeof RutaParams>, RutaConPOIs[]> = {
  name: "infoRuta", description: "Devuelve rutas mock con sus POIs expandidos.", parameters: RutaParams,
  handler: ({ consulta }) => {
    const query = terms(consulta);
    if (consulta !== undefined && query.length === 0) return [];
    const pois = new Map(loadPois().map((poi) => [poi.id, poi]));
    return loadRutas().filter((ruta) => {
      const text = searchable(`${ruta.id} ${ruta.nombre} ${ruta.descripcion}`);
      return query.length === 0 || query.every((term) => text.includes(term));
    }).map((ruta) => ({ ...ruta, pois: ruta.pois.map((id) => pois.get(id)).filter((poi): poi is POI => poi !== undefined) }));
  },
};
export const chatTools = { consultarClima, recomendar, buscarPOIs, infoRuta };
export function runChatTool(name: ChatToolName, rawParams: unknown): ChatToolData {
  const tool = chatTools[name] as ChatTool<unknown, ChatToolData>;
  return tool.handler(tool.parameters.parse(rawParams));
}
