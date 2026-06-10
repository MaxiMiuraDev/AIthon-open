import { loadPois } from '../../../../lib/server/data';
import { error, ok } from '../../../../lib/server/http';
export function GET(_request, { params }) { const poi = loadPois().find((item) => item.id === params.id); return poi ? ok(poi) : error(`POI '${params.id}' no encontrado`, 404); }
