import { recomendar } from '../finEngine';
import { actividadesParaFecha, fechaUshuaia, loadClima, loadPois } from './data';

const texts = {
  es: { askTime: '¿Cuánto tiempo tenés disponible? Indicá una cantidad mayor a cero en horas o minutos.', fallback: 'Puedo recomendar un recorrido, listar actividades disponibles hoy, consultar clima, horarios, accesibilidad y lugares.', weather: 'Clima simulado actual', rec: 'Recorrido recomendado', activities: 'Actividades disponibles', found: 'Lugares encontrados', none: 'No encontré coincidencias en los datos de la demo.', simulated: 'Datos y clima simulados para la demo.' },
  en: { askTime: 'How much time do you have available? Please provide an amount greater than zero in hours or minutes.', fallback: 'I can recommend a route, list activities available today, or check weather, hours, accessibility, and places.', weather: 'Current simulated weather', rec: 'Recommended route', activities: 'Available activities', found: 'Places found', none: 'I found no matches in the demo data.', simulated: 'Data and weather are simulated for the demo.' },
  pt: { askTime: 'Quanto tempo você tem disponível? Informe uma quantidade maior que zero em horas ou minutos.', fallback: 'Posso recomendar um roteiro, listar atividades disponíveis hoje ou consultar clima, horários, acessibilidade e lugares.', weather: 'Clima simulado atual', rec: 'Roteiro recomendado', activities: 'Atividades disponíveis', found: 'Lugares encontrados', none: 'Não encontrei correspondências nos dados da demonstração.', simulated: 'Dados e clima simulados para a demonstração.' },
};
const interestAliases = {
  gastronomia: /gastronom|food|eat|eating|comida|comer|alcohol|licor|degust|chocolate/i,
  cultura: /cultur|history|historic|historia/i,
  compras_locales: /shopping|compras?|local products?|productos? locales?/i,
  naturaleza: /natur|trek|hiking|senderismo|walk/i,
  talleres: /workshop|taller/i,
  museos: /museum|museo/i,
  indoor: /indoor|techado|refugio/i,
};
function normalize(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function langOf(explicit, message) {
  if (['es', 'en', 'pt'].includes(explicit)) return explicit;
  if (/\b(i |the |show|what|today|hours?|activities|weather|like)\b/i.test(message)) return 'en';
  if (/[¿¡]|\b(tengo|tenes|recomenda|listame|que|hoy|lugares?)\b/i.test(message)) return 'es';
  if (/\b(voce|tenho|atividades|roteiro)\b/i.test(message)) return 'pt';
  return 'es';
}
function minutes(text) { const h = text.match(/(\d+(?:[.,]\d+)?)\s*(?:hours?|hrs?|horas?|h)\b/i); if (h) return Math.round(Number(h[1].replace(',', '.')) * 60); const m = text.match(/(\d+)\s*(?:minutes?|mins?|minutos?|min)\b/i); return m ? Number(m[1]) : undefined; }
function interests(text) { return Object.entries(interestAliases).filter(([, regex]) => regex.test(text)).map(([interest]) => interest); }
function climate(text) { const n = normalize(text); if (/lluv|rain/.test(n)) return 'lluvia'; if (/viento|wind/.test(n)) return 'viento'; if (/solead|sunny|despejad|clear/.test(n)) return 'soleado'; return undefined; }
function accessibility(text) { if (!/accessible|accessibility|wheelchair|accesible|silla de ruedas/i.test(text)) return undefined; return !/(?:not|no|sin)\s+(?:\w+\s+){0,2}(?:accessible|accesible)/i.test(text); }
function poiMatches(text) {
  const n = normalize(text); const requested = interests(text); const pois = loadPois();
  const ignored = new Set(['horario', 'hours', 'schedule', 'open', 'close', 'abre', 'cierra', 'del', 'the', 'ushuaia']);
  const queryTerms = n.split(/[^a-z0-9]+/).filter((word) => word.length >= 5 && !ignored.has(word) && !/museo|museum|place|lugar/.test(word));
  const named = queryTerms.length ? pois.filter((poi) => queryTerms.every((word) => normalize(poi.nombre).includes(word))) : [];
  if (named.length) return named;
  if (requested.length) return pois.filter((poi) => poi.intereses.some((interest) => requested.includes(interest)));
  if (/places?|lugares?|accessible|accesible|accessibility/i.test(n)) return pois;
  return [];
}
function climateLabel(lang, value) {
  const labels = { es: { soleado: 'Soleado / despejado', lluvia: 'Lluvia', viento: 'Viento fuerte' }, en: { soleado: 'Sunny / clear', lluvia: 'Rainy', viento: 'Strong wind' }, pt: { soleado: 'Ensolarado / céu limpo', lluvia: 'Chuva', viento: 'Vento forte' } };
  return labels[lang][value];
}
function recommendationMessage(lang, result, requested) {
  const names = result.pois_recomendados.map((poi) => poi.nombre).join(', ');
  const unavailable = requested.includes('gastronomia') && !result.pois_recomendados.some((poi) => /chocolate/i.test(poi.nombre))
    ? (lang === 'en' ? ' No chocolate tasting is loaded, so I did not invent one.' : lang === 'pt' ? ' Não há degustação de chocolate cadastrada, então não inventei uma.' : ' No hay una degustación de chocolate cargada, así que no inventé una.') : '';
  return `${texts[lang].rec}: ${names}.${unavailable} ${texts[lang].simulated}`;
}
export async function runChat({ mensaje, lang, historial = [] }) {
  const language = langOf(lang, mensaje); const t = texts[language]; const current = normalize(mensaje); const currentMinutes = minutes(current);
  if (/weather|clima|tiempo hoy/i.test(current)) {
    const data = loadClima(); const active = data.escenarios[data.escenario_activo];
    return { respuesta: `${t.weather}: ${climateLabel(language, data.escenario_activo)}, ${active.temp_aprox_c} °C. ${t.simulated}`, toolUsada: 'consultarClima', data };
  }
  if (/(?:all|todas?|list|lista|show).*(?:activities|actividades)|(?:activities|actividades).*(?:today|hoy)/i.test(current)) {
    const fecha = fechaUshuaia(); const data = actividadesParaFecha(fecha).filter((item) => item.disponible);
    const list = data.map((item) => `${item.poi.nombre} (${item.horario_apertura}-${item.horario_cierre})`).join(', ');
    return { respuesta: `${t.activities} ${fecha}: ${list || t.none} ${t.simulated}`, toolUsada: 'listarActividades', data };
  }
  const wantsRecommendation = currentMinutes !== undefined || /recommend|suggest|what.*do|recomend|suger|recorrido|roteiro/i.test(current);
  if (wantsRecommendation) {
    const historyMinutes = [...historial].reverse().filter((item) => item.role === 'user').map((item) => minutes(item.content)).find((value) => value !== undefined);
    const time = currentMinutes ?? historyMinutes; if (!time || time <= 0) return { respuesta: t.askTime, toolUsada: 'ninguna', data: null };
    const requested = interests(current); const activeClimate = climate(current) || loadClima().escenario_activo;
    const prefs = { tiempo_disponible_min: time, intereses: requested, accesibilidad_requerida: accessibility(current) === true };
    const data = recomendar(prefs, activeClimate, loadPois());
    return { respuesta: recommendationMessage(language, data, requested), toolUsada: 'recomendar', data: { ...data, preferencias: prefs, clima: activeClimate } };
  }
  if (/hours?|schedule|open|close|horario|abre|cierra|museum|museo|place|lugar|accessible|accesible/i.test(current) || interests(current).length) {
    let data = poiMatches(current); const access = accessibility(current); if (access !== undefined) data = data.filter((poi) => (poi.accesibilidad === 'accesible') === access);
    const activities = new Map(actividadesParaFecha().map((item) => [item.poi_id, item])); data = data.map((poi) => ({ ...poi, actividad: activities.get(poi.id) }));
    const list = data.map((poi) => `${poi.nombre}${poi.actividad ? ` (${poi.actividad.horario_apertura}-${poi.actividad.horario_cierre})` : ''}`).join(', ');
    return { respuesta: `${t.found}: ${list || t.none} ${t.simulated}`, toolUsada: 'buscarPOIs', data };
  }
  return { respuesta: t.fallback, toolUsada: 'ninguna', data: null };
}
