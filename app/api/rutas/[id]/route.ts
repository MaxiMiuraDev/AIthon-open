import { type NextRequest } from "next/server";
import { loadRutas, loadPois } from "@/lib/data";
import { respond, respondError } from "@/lib/api";
import type { POI, RutaConPOIs } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ruta = loadRutas().find((r) => r.id === id);

  if (!ruta) {
    return respondError(`Ruta '${id}' no encontrada`, 404);
  }

  const poisMap = new Map(loadPois().map((p) => [p.id, p]));

  const hydrated: RutaConPOIs = {
    ...ruta,
    pois: ruta.pois
      .map((pid) => poisMap.get(pid))
      .filter((p): p is POI => p !== undefined),
  };

  return respond(hydrated);
}
