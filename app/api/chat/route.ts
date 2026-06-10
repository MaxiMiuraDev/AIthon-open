import { type NextRequest } from "next/server";
import { z } from "zod";
import { respond, respondError } from "@/lib/api";
import { runChat } from "@/lib/chat/llm";

const BodySchema = z.object({
  mensaje: z.string().trim().min(1, "mensaje es requerido").max(1000, "mensaje no puede superar 1000 caracteres"),
  lang: z.string().trim().min(1).optional(),
  historial: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000, "content no puede superar 2000 caracteres") })).max(20, "historial no puede superar 20 mensajes").optional(),
}).strict();
export async function POST(request: NextRequest) {
  let raw: unknown;
  try { raw = await request.json(); } catch { return respondError("El body debe ser JSON válido", 400); }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return respondError(parsed.error.issues.map((issue) => issue.message).join("; "), 400);
  return respond(await runChat(parsed.data));
}
