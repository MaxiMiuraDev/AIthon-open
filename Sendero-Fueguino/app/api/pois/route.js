import { loadPois } from '../../../lib/server/data';
import { error, ok } from '../../../lib/server/http';
function numberParam(value, name) { if (value === null) return null; const n = Number(value); if (!Number.isFinite(n) || n < 0) throw new Error(`${name} debe ser un número no negativo`); return n; }
export function GET(request) {
  try {
    const sp = request.nextUrl.searchParams; const q = sp.get('q')?.toLowerCase(); const interes = sp.get('interes');
    const accesible = sp.get('accesible') ?? sp.get('accessible'); const tipo = sp.get('tipo');
    if (accesible !== null && !['true', 'false'].includes(accesible)) return error("accesible debe ser 'true' o 'false'");
    const maxDuracion = numberParam(sp.get('maxDuracion') ?? sp.get('maxDuration'), 'maxDuracion');
    const maxDistancia = numberParam(sp.get('maxDistancia') ?? sp.get('maxDistance'), 'maxDistancia');
    const data = loadPois().filter((poi) => {
      if (q && !`${poi.id} ${poi.nombre} ${poi.texto} ${poi.intereses.join(' ')}`.toLowerCase().includes(q)) return false;
      if (interes && !poi.intereses.includes(interes)) return false;
      if (tipo && poi.tipo !== tipo) return false;
      if (accesible !== null && (poi.accesibilidad === 'accesible') !== (accesible === 'true')) return false;
      if (maxDuracion !== null && poi.duracion_min > maxDuracion) return false;
      if (maxDistancia !== null && poi.distancia_puerto_km > maxDistancia) return false;
      return true;
    });
    return ok(data);
  } catch (err) { return error(err instanceof Error ? err.message : String(err)); }
}
