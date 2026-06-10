import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const precioSchema = z.object({ moneda: z.string().min(1), monto: z.number().nonnegative(), nota: z.string() });
export const poiSchema = z.object({
  id: z.string().min(1), tipo: z.enum(['poi', 'MOCK_PRODUCER']), nombre: z.string().min(1),
  lat: z.number(), lng: z.number(), texto: z.string().min(1), fuente: z.string(), visitado: z.boolean(),
  tipo_indoor_outdoor: z.enum(['indoor', 'outdoor']), accesibilidad: z.enum(['accesible', 'parcial', 'no_accesible']),
  intereses: z.array(z.string()), duracion_min: z.number().positive(), precio_estimado: precioSchema,
  idiomas_disponibles: z.array(z.string()).min(1), distancia_puerto_km: z.number().nonnegative(),
});
export const actividadSchema = z.object({
  poi_id: z.string().min(1), horario_apertura: z.string().regex(/^\d{2}:\d{2}$/), horario_cierre: z.string().regex(/^\d{2}:\d{2}$/),
  dias_cerrado: z.array(z.string()), duracion_visita_min: z.number().positive(), tiempo_traslado_siguiente_min: z.number().nonnegative(),
});
export const climaSchema = z.object({ escenario_activo: z.enum(['soleado', 'lluvia', 'viento']), escenarios: z.record(z.object({ label: z.string().min(1), icono: z.string().min(1), temp_aprox_c: z.number() })) });
export const comercianteSchema = z.object({
  id: z.string().min(1), nombre: z.string().min(1), rubro: z.string().min(1), modalidad: z.enum(['Indoor', 'Outdoor']).optional(),
  descripcion: z.string().max(160), precio: z.string().optional(), duracion: z.string().optional(), cupos: z.string().optional(),
  idiomas: z.array(z.string()).optional(), contacto: z.string(), horario: z.string(), creado_via_panel: z.boolean(),
});
export const comercianteInputSchema = comercianteSchema.omit({ id: true, creado_via_panel: true }).extend({
  modalidad: z.enum(['Indoor', 'Outdoor']).default('Indoor'), descripcion: z.string().max(160).default(''),
  precio: z.string().max(80).default(''), duracion: z.string().max(80).default(''), cupos: z.string().max(80).default(''),
  idiomas: z.array(z.enum(['es', 'en', 'pt'])).max(3).default(['es']), contacto: z.string().max(200).default(''), horario: z.string().max(200).default(''),
}).strict();
const schemas = { 'pois.json': z.array(poiSchema).min(1), 'actividades.json': z.array(actividadSchema).min(1), 'clima_mock.json': climaSchema, 'comerciantes.json': z.array(comercianteSchema) };
export function dataDir() { return process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), 'public', 'data'); }
export function dataFile(filename) { return path.join(dataDir(), filename); }
export function readData(filename) { return schemas[filename].parse(JSON.parse(fs.readFileSync(dataFile(filename), 'utf8'))); }
export const loadPois = () => readData('pois.json');
export const loadClima = () => readData('clima_mock.json');
export const loadComerciantes = () => readData('comerciantes.json');
export const loadActividades = () => {
  const actividades = readData('actividades.json'); const ids = new Set(loadPois().map((poi) => poi.id));
  const invalidas = actividades.filter((actividad) => !ids.has(actividad.poi_id));
  if (invalidas.length) throw new Error(`Actividades con POI inexistente: ${invalidas.map((a) => a.poi_id).join(', ')}`);
  return actividades;
};
export function fechaUshuaia() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Ushuaia', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
export function diaEnEspanol(fecha = fechaUshuaia()) {
  const date = new Date(`${fecha}T12:00:00-03:00`); if (Number.isNaN(date.getTime())) throw new Error('fecha inválida');
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long', timeZone: 'America/Argentina/Ushuaia' }).format(date).toLowerCase();
}
export function actividadesParaFecha(fecha = fechaUshuaia()) {
  const dia = diaEnEspanol(fecha); const pois = new Map(loadPois().map((poi) => [poi.id, poi]));
  return loadActividades().map((actividad) => ({ ...actividad, disponible: !actividad.dias_cerrado.map((d) => d.toLowerCase()).includes(dia), fecha, dia, poi: pois.get(actividad.poi_id) }));
}
export async function appendComerciante(input) {
  const nuevo = { id: `PANEL_${Date.now()}`, ...comercianteInputSchema.parse(input), creado_via_panel: true }; const comerciantes = loadComerciantes(); comercianteSchema.parse(nuevo);
  const target = dataFile('comerciantes.json'); const tmp = `${target}.${process.pid}.tmp`;
  await fs.promises.writeFile(tmp, `${JSON.stringify([...comerciantes, nuevo], null, 2)}\n`, 'utf8'); await fs.promises.rename(tmp, target); return nuevo;
}
export function validateAllData() { return { pois: loadPois().length, actividades: loadActividades().length, comerciantes: loadComerciantes().length, clima: loadClima().escenario_activo }; }
