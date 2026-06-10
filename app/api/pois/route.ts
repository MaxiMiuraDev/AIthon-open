import { type NextRequest } from "next/server";
import { loadPois } from "@/lib/data";
import { respond, respondError } from "@/lib/api";
import { CONDICIONES_CLIMA, normalizeClima } from "@/lib/clima";
import type { CondicionClima } from "@/types";

export function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const climaRaw = sp.get("clima");
  const maxDuracionRaw = sp.get("maxDuracion");
  const accesibleRaw = sp.get("accesible");
  const maxDistanciaRaw = sp.get("maxDistancia");

  // Validate query params
  let climaFilter: CondicionClima | null = null;
  if (climaRaw !== null) {
    climaFilter = normalizeClima(climaRaw);
    if (!climaFilter) {
      return respondError(
        `clima inválido. Valores aceptados: ${CONDICIONES_CLIMA.join(", ")}`,
        400
      );
    }
  }

  let maxDuracion: number | null = null;
  if (maxDuracionRaw !== null) {
    maxDuracion = Number(maxDuracionRaw);
    if (isNaN(maxDuracion) || maxDuracion < 0) {
      return respondError("maxDuracion debe ser un número no negativo (minutos)", 400);
    }
  }

  if (accesibleRaw !== null && accesibleRaw !== "true" && accesibleRaw !== "false") {
    return respondError("accesible debe ser 'true' o 'false'", 400);
  }

  let maxDistancia: number | null = null;
  if (maxDistanciaRaw !== null) {
    maxDistancia = Number(maxDistanciaRaw);
    if (isNaN(maxDistancia) || maxDistancia < 0) {
      return respondError("maxDistancia debe ser un número no negativo (km)", 400);
    }
  }

  // Apply filters
  let pois = loadPois();

  if (climaFilter !== null) {
    const cf = climaFilter;
    pois = pois.filter((p) => p.clima_recomendado.includes(cf));
  }
  if (maxDuracion !== null) {
    const md = maxDuracion;
    pois = pois.filter((p) => p.duracion_min <= md);
  }
  if (accesibleRaw !== null) {
    const af = accesibleRaw === "true";
    pois = pois.filter((p) => p.accesible === af);
  }
  if (maxDistancia !== null) {
    const mdist = maxDistancia;
    pois = pois.filter((p) => p.distancia_puerto_km <= mdist);
  }

  return respond(pois);
}
