import { runChatTool } from "@/lib/chat/tools";
import {
  ACCESIBLE_T,
  categoriasEnTexto,
  CLIMA_T,
  detectarNegacionAccesible,
  extraerClima,
  LABELS,
  localizarHorario,
  resolveLang,
} from "@/lib/chat/i18n";
import type { ChatClima, ChatData, ChatLang, ChatMessage, ChatToolData, ChatToolName, CondicionClima, POI, RecomendacionData, RutaConPOIs } from "@/types";

/**
 * Único punto de swap del chatbot. Para OpenAI real, reemplazar runMockChat
 * por una llamada al modelo con chatTools como function tools, limitarla a una
 * tool call y conservar el contrato ChatData. Este mock no usa red.
 */
export async function runChat(input: { mensaje: string; lang?: string; historial?: ChatMessage[] }): Promise<ChatData> {
  return runMockChat(input);
}

type Intent =
  | { tool: "consultarClima"; params: Record<string, never> }
  | { tool: "recomendar"; params: { tiempoDisponible: number; accesible?: boolean; clima?: CondicionClima } }
  | { tool: "buscarPOIs"; params: { consulta?: string; accesible?: boolean; maxDistanciaKm?: number } }
  | { tool: "infoRuta"; params: { consulta?: string } }
  | { tool: "ninguna"; reason: "fallback" | "tiempo" };

const rule = {
  recommend: /recommend|suggest|what (?:can|should) i do|recomend|sugier|que hacer|qué hacer|recomenda|sugest|empfehl|vorschlag|推荐|建议|המלצ|מה לעשות/i,
  weather: /weather|climate|forecast|clima|tiempo hoy|chuva|chov|wetter|regen|天气|气候|מזג|גשם/i,
  schedule: /hours|schedule|open|close|horario|abre|cierra|horário|aberto|öffnet|öffnungs|开放|时间|שעות|פתוח/i,
  access: /accessible|accessibility|wheelchair|accesible|accesibilidad|silla de ruedas|acessível|cadeira de rodas|barrierefrei|rollstuhl|无障碍|轮椅|נגיש|כיסא גלגלים/i,
  distance: /distance|near|close to (?:the )?port|km|kilometer|distancia|cerca del puerto|perto do porto|entfernung|nahe.*hafen|距离|港口附近|מרחק|קרוב.*נמל/i,
  route: /route|itinerary|ruta|recorrido|rota|roteiro|rundgang|路线|行程|מסלול/i,
  poi: /poi|place|attraction|lugar|atracci|ponto|atração|sehenswürdigkeit|景点|אטרקציה/i,
};

async function runMockChat({ mensaje, lang, historial = [] }: { mensaje: string; lang?: string; historial?: ChatMessage[] }): Promise<ChatData> {
  const resolved = resolveLang(lang, mensaje);
  const userHistory = historial.filter((item) => item.role === "user").map((item) => item.content);
  const intent = selectIntent(mensaje, userHistory);
  if (intent.tool === "ninguna") {
    return { respuesta: intent.reason === "tiempo" ? askTime[resolved] : fallback[resolved], toolUsada: "ninguna", data: null };
  }
  try {
    const data = runChatTool(intent.tool, intent.params);
    return { respuesta: formatResponse(resolved, intent.tool, data), toolUsada: intent.tool, data };
  } catch {
    return { respuesta: toolError[resolved], toolUsada: "ninguna", data: null };
  }
}

function selectIntent(message: string, userHistory: string[]): Intent {
  const current = message.toLowerCase();
  const currentMinutes = extractMinutes(current);
  const accessible = rule.access.test(current) ? !detectarNegacionAccesible(current) : undefined;

  if (rule.weather.test(current)) return { tool: "consultarClima", params: {} };
  if (rule.schedule.test(current) || rule.access.test(current) || rule.distance.test(current)) {
    return { tool: "buscarPOIs", params: { consulta: current, accesible: accessible, maxDistanciaKm: extractDistance(current) } };
  }
  if (rule.route.test(current)) return { tool: "infoRuta", params: { consulta: isGenericBrowse(current, "route") ? undefined : current } };
  if (rule.recommend.test(current) || currentMinutes !== undefined) {
    const historyMinutes = [...userHistory].reverse().map((content) => extractMinutes(content.toLowerCase())).find((value) => value !== undefined);
    const minutes = currentMinutes ?? historyMinutes;
    if (minutes === undefined || minutes <= 0) return { tool: "ninguna", reason: "tiempo" };
    return { tool: "recomendar", params: { tiempoDisponible: minutes, accesible: accessible, clima: extraerClima(current) } };
  }
  if (rule.poi.test(current) || categoriasEnTexto(current).length > 0) return { tool: "buscarPOIs", params: { consulta: isGenericBrowse(current, "poi") ? undefined : current } };
  return { tool: "ninguna", reason: "fallback" };
}

function isGenericBrowse(text: string, kind: "route" | "poi"): boolean {
  const normalized = text.trim().toLowerCase();
  return kind === "route"
    ? /^(?:show me |mostrame )?(?:routes?|rutas?|rotas?|路线|行程|מסלולים?)$/i.test(normalized)
    : /^(?:show me |mostrame )?(?:pois?|places?|lugares?|景点|אטרקציות?)$/i.test(normalized);
}

function extractMinutes(text: string): number | undefined {
  const hours = text.match(/(\d+(?:[.,]\d+)?)\s*(?:hours?|hrs?|horas?|h|stunden?|小时|小時|שעות?)/i);
  if (hours) return Math.round(Number(hours[1].replace(",", ".")) * 60);
  const minutes = text.match(/(\d+)\s*(?:minutes?|mins?|minutos?|minuten?|分钟|דקות?)/i);
  return minutes ? Number(minutes[1]) : undefined;
}
function extractDistance(text: string): number | undefined {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:km|kilometers?|kilometros?|kilómetros?|公里|קמ)/i);
  return match ? Number(match[1].replace(",", ".")) : undefined;
}

const simulated: Record<ChatLang, string> = {
  es: "Datos y clima simulados para la demo.", en: "Data and weather are simulated for the demo.", pt: "Dados e clima simulados para a demonstração.",
  de: "Daten und Wetter sind für die Demo simuliert.", zh: "数据和天气均为演示模拟。", he: "הנתונים ומזג האוויר מדומים לצורך ההדגמה.",
};
const fallback: Record<ChatLang, string> = {
  es: "Puedo recomendar según tu tiempo y el clima, o consultar clima, horarios, accesibilidad, distancia al puerto, POIs y rutas. No identifiqué una de esas consultas.",
  en: "I can recommend by time and weather, or check weather, hours, accessibility, distance from the port, POIs, and routes. I could not identify one of those requests.",
  pt: "Posso recomendar conforme seu tempo e o clima, ou consultar clima, horários, acessibilidade, distância do porto, POIs e rotas. Não identifiquei uma dessas consultas.",
  de: "Ich kann Besuche nach Zeit und Wetter empfehlen oder Wetter, Öffnungszeiten, Barrierefreiheit, Entfernung zum Hafen, POIs und Routen prüfen. Diese Anfrage konnte ich nicht zuordnen.",
  zh: "我可以根据时间和天气推荐行程，也可以查询天气、开放时间、无障碍信息、距港口距离、景点和路线。当前请求无法识别。",
  he: "אפשר לקבל המלצה לפי הזמן ומזג האוויר, או לבדוק מזג אוויר, שעות, נגישות, מרחק מהנמל, נקודות עניין ומסלולים. לא הצלחתי לזהות בקשה מתאימה.",
};
const askTime: Record<ChatLang, string> = {
  es: "¿Cuánto tiempo tenés disponible? Indicá una cantidad mayor a cero en horas o minutos.",
  en: "How much time do you have available? Please provide an amount greater than zero in hours or minutes.",
  pt: "Quanto tempo você tem disponível? Informe uma quantidade maior que zero em horas ou minutos.",
  de: "Wie viel Zeit haben Sie? Bitte geben Sie mehr als null Stunden oder Minuten an.",
  zh: "您有多少可用时间？请提供大于零的小时数或分钟数。",
  he: "כמה זמן עומד לרשותך? יש לציין מספר שעות או דקות גדול מאפס.",
};
const toolError: Record<ChatLang, string> = {
  es: "No pude procesar esos parámetros. Reformulá la consulta con valores válidos.",
  en: "I could not process those parameters. Please rephrase the request with valid values.",
  pt: "Não foi possível processar esses parâmetros. Reformule a solicitação com valores válidos.",
  de: "Diese Parameter konnten nicht verarbeitet werden. Bitte formulieren Sie die Anfrage mit gültigen Werten neu.",
  zh: "无法处理这些参数。请使用有效值重新表述请求。",
  he: "לא ניתן לעבד את הפרמטרים האלה. יש לנסח מחדש את הבקשה עם ערכים תקינים.",
};
const intro: Record<ChatLang, Record<ChatToolName, string>> = {
  es: { consultarClima: "Clima actual de referencia", recomendar: "Mi recomendación", buscarPOIs: "Opciones encontradas", infoRuta: "Información de rutas" },
  en: { consultarClima: "Current reference weather", recomendar: "My recommendation", buscarPOIs: "Options found", infoRuta: "Route information" },
  pt: { consultarClima: "Clima atual de referência", recomendar: "Minha recomendação", buscarPOIs: "Opções encontradas", infoRuta: "Informações de rotas" },
  de: { consultarClima: "Aktuelles Referenzwetter", recomendar: "Meine Empfehlung", buscarPOIs: "Gefundene Optionen", infoRuta: "Routeninformationen" },
  zh: { consultarClima: "当前参考天气", recomendar: "我的推荐", buscarPOIs: "找到的选项", infoRuta: "路线信息" },
  he: { consultarClima: "מזג האוויר הנוכחי לעיון", recomendar: "ההמלצה שלי", buscarPOIs: "אפשרויות שנמצאו", infoRuta: "מידע על מסלולים" },
};

function label(key: keyof typeof LABELS, lang: ChatLang): string { return LABELS[key][lang]; }
function formatResponse(lang: ChatLang, tool: ChatToolName, data: ChatToolData): string {
  return `${intro[lang][tool]}: ${summarize(lang, tool, data)} ${simulated[lang]}`;
}
function summarize(lang: ChatLang, tool: ChatToolName, data: ChatToolData): string {
  if (tool === "consultarClima") {
    const weather = data as ChatClima;
    return `${CLIMA_T[weather.condicion][lang]}, ${weather.temp_c} °C.`;
  }
  if (tool === "recomendar") {
    const recommendation = data as RecomendacionData;
    const names = recommendation.pois.slice(0, 3).map((poi) => `${poi.nombre} (${poi.score})`).join(", ");
    const route = recommendation.rutaRecomendada ? ` ${label("route", lang)}: ${recommendation.rutaRecomendada.nombre}.` : "";
    return `${label("weather", lang)}: ${CLIMA_T[recommendation.clima][lang]}. ${names || label("noRecommendations", lang)}.${route}`;
  }
  if (tool === "buscarPOIs") {
    const pois = data as POI[];
    return pois.map((poi) => {
      const marine = poi.requiere_navegacion ? `; ${label("marine", lang)}` : "";
      return `${poi.nombre}: ${label("distance", lang)} ${poi.distancia_puerto_km} km; ${label("schedule", lang)} ${localizarHorario(poi.horarios, lang)}; ${label("accessible", lang)} ${ACCESIBLE_T[String(poi.accesible) as "true" | "false"][lang]}${marine}`;
    }).join(" | ") || label("noPois", lang);
  }
  const routes = data as RutaConPOIs[];
  return routes.map((route) => `${route.nombre}: ${route.duracion_total_min} ${label("min", lang)}, ${route.distancia_total_km} km, ${route.pois.length} ${label("pois", lang)}`).join(" | ") || label("noRoutes", lang);
}
