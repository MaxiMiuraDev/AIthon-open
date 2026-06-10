import { loadClima } from "@/lib/data";
import { respond } from "@/lib/api";

export function GET() {
  return respond(loadClima());
}
