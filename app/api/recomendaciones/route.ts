import { type NextRequest } from "next/server";
import { z } from "zod";
import { loadPois, loadRutas, loadClima } from "@/lib/data";
import { respond, respondError } from "@/lib/api";
import { CONDICIONES_CLIMA, normalizeClima } from "@/lib/clima";
import { generarRecomendaciones } from "@/lib/recomendaciones";

const BodySchema = z.object({
  tiempoDisponible: z
    .number({ message: "tiempoDisponible es requerido y debe ser un número (minutos)" })
    .positive("tiempoDisponible debe ser mayor a 0"),
  accesible: z.boolean().optional(),
  // clima se normaliza aparte (case-insensitive); acá solo aceptamos string.
  clima: z.string().optional(),
  lang: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // 1. Parseo del body
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return respondError("El body debe ser JSON válido", 400);
  }

  // 2. Validación de forma
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    return respondError(msg, 400);
  }
  const { tiempoDisponible, accesible, clima: climaRaw } = parsed.data;

  // 3. Resolución del clima: el provisto (normalizado) o el mock actual.
  let clima = loadClima().condicion;
  if (climaRaw !== undefined) {
    const normalizado = normalizeClima(climaRaw);
    if (!normalizado) {
      return respondError(
        `clima inválido. Valores aceptados: ${CONDICIONES_CLIMA.join(", ")}`,
        400
      );
    }
    clima = normalizado;
  }

  // 4. Scoring (datos siempre vía lib/data.ts; cero APIs externas).
  const data = generarRecomendaciones(
    { tiempoDisponible, accesible, clima },
    loadPois(),
    loadRutas()
  );

  return respond(data);
}
