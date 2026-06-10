import { z } from 'zod';
import { recomendar } from '../../../lib/finEngine';
import { loadClima, loadPois } from '../../../lib/server/data';
import { error, jsonBody, ok, validationMessage } from '../../../lib/server/http';
const schema = z.object({
  tiempo_disponible_min: z.number().positive().optional(), tiempoDisponible: z.number().positive().optional(),
  intereses: z.array(z.string()).default([]), accesibilidad: z.array(z.string()).default([]), accesible: z.boolean().optional(),
  presupuesto: z.string().optional(), clima: z.string().optional(), idioma: z.string().optional(), lang: z.string().optional(),
}).strict().refine((v) => v.tiempo_disponible_min || v.tiempoDisponible, 'tiempo_disponible_min es requerido y debe ser mayor a 0');
const climaAlias = { soleado: 'soleado', despejado: 'soleado', sunny: 'soleado', lluvia: 'lluvia', lluvioso: 'lluvia', rainy: 'lluvia', viento: 'viento', ventoso: 'viento', windy: 'viento' };
const templates = {
  es: 'Como elegiste {tiempo}h y hoy está {clima}, te armé un recorrido de {n} paradas, priorizando {intereses}.',
  en: 'With {tiempo}h available and {clima} weather, I built a {n}-stop route prioritizing {intereses}.',
  pt: 'Com {tiempo}h disponíveis e clima {clima}, montei um roteiro de {n} paradas priorizando {intereses}.',
};
export async function POST(request) {
  const body = await jsonBody(request); if (!body.ok) return body.response; const parsed = schema.safeParse(body.data); if (!parsed.success) return error(validationMessage(parsed));
  const value = parsed.data; const rawClima = value.clima?.toLowerCase() || loadClima().escenario_activo; const clima = climaAlias[rawClima];
  if (!clima) return error('clima inválido. Valores aceptados: soleado, lluvia, viento');
  const preferencias = { tiempo_disponible_min: value.tiempo_disponible_min || value.tiempoDisponible, intereses: value.intereses, accesibilidad_requerida: value.accesible ?? value.accesibilidad.includes('silla_ruedas') };
  const idioma = value.idioma || value.lang || 'es'; return ok({ ...recomendar(preferencias, clima, loadPois(), templates[idioma] || templates.es), preferencias, clima, presupuesto: value.presupuesto || null });
}
