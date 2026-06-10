import { type NextRequest } from "next/server";
import { loadPois } from "@/lib/data";
import { respond, respondError } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const poi = loadPois().find((p) => p.id === id);

  if (!poi) {
    return respondError(`POI '${id}' no encontrado`, 404);
  }

  return respond(poi);
}
