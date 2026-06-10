import { normalizeClima } from "@/lib/clima";
import type { CategoriaPOI, ChatLang, CondicionClima } from "@/types";

export const SUPPORTED: ChatLang[] = ["es", "en", "pt", "de", "zh", "he"];

export function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function resolveLang(lang: string | undefined, message: string): ChatLang {
  if (lang) {
    const normalized = lang.toLowerCase().split(/[-_]/)[0] as ChatLang;
    if (SUPPORTED.includes(normalized)) return normalized;
  }
  if (/[\u0590-\u05ff]/u.test(message)) return "he";
  if (/[\u3400-\u9fff]/u.test(message)) return "zh";
  if (/\b(wetter|empfehlung|öffn|barrierefrei|hafen|ich|habe|stunden?|sonnig|klar)\b/i.test(message)) return "de";
  if (/\b(recomenda|sugestão|horário|acessível|perto|porto|chuva|tenho|ensolarad|chuvoso)\b/i.test(message)) return "pt";
  if (/[¿¡]|\b(recomienda|recomendás|mostrame|tengo|horas?|soleado|lluv|despejado|está|horario|accesible|puerto|clima|ruta|museo)\b/i.test(message)) return "es";
  return "en";
}

export const SINONIMOS: Record<CategoriaPOI, string[]> = {
  parque_natural: ["parque", "parques", "park", "parks", "national park", "parque nacional", "naturpark", "公园", "פארק"],
  museo: ["museo", "museos", "museum", "museums", "museu", "museus", "博物馆", "מוזיאון", "מוזיאונים"],
  atraccion_historica: ["historico", "historica", "historic", "history", "histórico", "geschichte", "历史", "היסטורי"],
  tour_marino: ["navegacion", "barco", "boat", "sailing", "marino", "marine", "schiff", "航海", "שיט"],
  fauna_marina: ["fauna", "lobos marinos", "sea lions", "wildlife", "seelöwen", "海狮", "אריות ים"],
  glaciar: ["glaciar", "glacier", "gletscher", "冰川", "קרחון"],
  senderismo: ["senderismo", "trekking", "hiking", "trilha", "wandern", "徒步", "טיול רגלי"],
  paisaje: ["paisaje", "scenery", "landscape", "paisagem", "landschaft", "风景", "נוף"],
  gastronomia_cultural: ["gastronomia", "comida", "food", "gastronomy", "essen", "美食", "אוכל"],
  mirador: ["mirador", "viewpoint", "lookout", "aussichtspunkt", "观景台", "תצפית"],
  deporte_aventura: ["aventura", "adventure", "abenteuer", "探险", "הרפתקה"],
  reserva_natural: ["reserva", "reserve", "nature reserve", "naturreservat", "自然保护区", "שמורת טבע"],
};

export function categoriasEnTexto(text: string): CategoriaPOI[] {
  const normalized = normalizeText(text);
  return (Object.entries(SINONIMOS) as [CategoriaPOI, string[]][])
    .filter(([, synonyms]) => synonyms.some((synonym) => normalized.includes(normalizeText(synonym))))
    .map(([category]) => category);
}

const WEATHER_WORDS: Array<[CondicionClima, RegExp]> = [
  ["Soleado", /solead|sunny|sunshine|ensolarad|sonnig|晴朗|晴天|שמש/i],
  ["Lluvioso", /lluv|rain|chuv|regner|regen|下雨|雨天|גש/i],
  ["Despejado", /despejad|clear(?:\s+sky)?|ceu limpo|klar|晴空|בהיר/i],
];

export function extraerClima(text: string): CondicionClima | undefined {
  const exact = normalizeClima(text);
  if (exact) return exact;
  return WEATHER_WORDS.find(([, pattern]) => pattern.test(text))?.[0];
}

export function detectarNegacionAccesible(text: string): boolean {
  return /(?:\b(?:not|no|sin|nicht)\b|不|לא)\s*(?:\w+\s+){0,2}(?:accessible|accesible|acessivel|barrierefrei|无障碍|נגיש)/iu.test(normalizeText(text));
}

export const CLIMA_T: Record<CondicionClima, Record<ChatLang, string>> = {
  Soleado: { es: "Soleado", en: "Sunny", pt: "Ensolarado", de: "Sonnig", zh: "晴朗", he: "שמשי" },
  Lluvioso: { es: "Lluvioso", en: "Rainy", pt: "Chuvoso", de: "Regnerisch", zh: "下雨", he: "גשום" },
  Despejado: { es: "Despejado", en: "Clear", pt: "Céu limpo", de: "Klar", zh: "晴", he: "בהיר" },
};

export const ACCESIBLE_T: Record<"true" | "false", Record<ChatLang, string>> = {
  true: { es: "sí", en: "yes", pt: "sim", de: "ja", zh: "是", he: "כן" },
  false: { es: "no", en: "no", pt: "não", de: "nein", zh: "否", he: "לא" },
};

export const LABELS: Record<string, Record<ChatLang, string>> = {
  weather: { es: "clima", en: "weather", pt: "clima", de: "Wetter", zh: "天气", he: "מזג אוויר" },
  route: { es: "Ruta", en: "Route", pt: "Rota", de: "Route", zh: "路线", he: "מסלול" },
  distance: { es: "distancia", en: "distance", pt: "distância", de: "Entfernung", zh: "距离", he: "מרחק" },
  schedule: { es: "horario", en: "hours", pt: "horário", de: "Öffnungszeiten", zh: "开放时间", he: "שעות" },
  accessible: { es: "accesible", en: "accessible", pt: "acessível", de: "barrierefrei", zh: "无障碍", he: "נגיש" },
  marine: { es: "requiere navegación", en: "requires a boat tour", pt: "requer navegação", de: "erfordert eine Bootstour", zh: "需要乘船游览", he: "דורש שיט" },
  min: { es: "min", en: "min", pt: "min", de: "Min.", zh: "分钟", he: "דק׳" },
  pois: { es: "POIs", en: "POIs", pt: "POIs", de: "POIs", zh: "景点", he: "נקודות עניין" },
  noPois: { es: "No se encontraron POIs.", en: "No matching POIs were found.", pt: "Nenhum POI correspondente foi encontrado.", de: "Keine passenden POIs gefunden.", zh: "未找到匹配的景点。", he: "לא נמצאו נקודות עניין מתאימות." },
  noRoutes: { es: "No se encontraron rutas.", en: "No matching routes were found.", pt: "Nenhuma rota correspondente foi encontrada.", de: "Keine passenden Routen gefunden.", zh: "未找到匹配的路线。", he: "לא נמצאו מסלולים מתאימים." },
  noRecommendations: { es: "No hay recomendaciones que entren en ese tiempo.", en: "No recommendations fit that amount of time.", pt: "Nenhuma recomendação cabe nesse tempo.", de: "Für diesen Zeitraum gibt es keine passende Empfehlung.", zh: "该时间范围内没有合适的推荐。", he: "אין המלצות שמתאימות לזמן הזה." },
};

const SCHEDULE_T: Record<ChatLang, Array<[RegExp, string]>> = {
  es: [],
  en: [[/Todos los días/gi, "Every day"], [/Abierto/gi, "Open"], [/Lun/gi, "Mon"], [/Vie/gi, "Fri"], [/Sáb/gi, "Sat"], [/Dom/gi, "Sun"], [/Salidas/gi, "Departures"], [/temporada alta/gi, "high season"]],
  pt: [[/Todos los días/gi, "Todos os dias"], [/Abierto/gi, "Aberto"], [/Lun/gi, "Seg"], [/Vie/gi, "Sex"], [/Sáb/gi, "Sáb"], [/Dom/gi, "Dom"], [/Salidas/gi, "Saídas"], [/temporada alta/gi, "alta temporada"]],
  de: [[/Todos los días/gi, "Täglich"], [/Abierto/gi, "Geöffnet"], [/Lun/gi, "Mo"], [/Vie/gi, "Fr"], [/Sáb/gi, "Sa"], [/Dom/gi, "So"], [/Salidas/gi, "Abfahrten"], [/temporada alta/gi, "Hochsaison"]],
  zh: [[/Todos los días/gi, "每天"], [/Abierto/gi, "开放"], [/Lun/gi, "周一"], [/Vie/gi, "周五"], [/Sáb/gi, "周六"], [/Dom/gi, "周日"], [/Salidas/gi, "出发时间"], [/temporada alta/gi, "旺季"]],
  he: [[/Todos los días/gi, "כל יום"], [/Abierto/gi, "פתוח"], [/Lun/gi, "ב׳"], [/Vie/gi, "ו׳"], [/Sáb/gi, "ש׳"], [/Dom/gi, "א׳"], [/Salidas/gi, "יציאות"], [/temporada alta/gi, "עונת השיא"]],
};

export function localizarHorario(value: string, lang: ChatLang): string {
  return SCHEDULE_T[lang].reduce((translated, [pattern, replacement]) => translated.replace(pattern, replacement), value);
}
