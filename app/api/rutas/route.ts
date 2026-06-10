import { loadRutas } from "@/lib/data";
import { respond } from "@/lib/api";

export function GET() {
  return respond(loadRutas());
}
