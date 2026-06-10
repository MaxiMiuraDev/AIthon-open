import { actividadesParaFecha, fechaUshuaia } from '../../../lib/server/data';
import { error, ok } from '../../../lib/server/http';
export function GET(request) {
  const fecha = request.nextUrl.searchParams.get('fecha') || fechaUshuaia();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return error('fecha debe tener formato YYYY-MM-DD');
  try { return ok(actividadesParaFecha(fecha)); } catch (err) { return error(err instanceof Error ? err.message : String(err)); }
}
