import { z } from 'zod';
import { runChat } from '../../../lib/server/chat';
import { error, jsonBody, ok, validationMessage } from '../../../lib/server/http';
const schema = z.object({
  mensaje: z.string().trim().min(1, 'mensaje es requerido').max(1000, 'mensaje no puede superar 1000 caracteres'),
  lang: z.enum(['es', 'en', 'pt']).optional(),
  historial: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(2000) })).max(20).optional(),
}).strict();
export async function POST(request) {
  const body = await jsonBody(request); if (!body.ok) return body.response; const parsed = schema.safeParse(body.data); if (!parsed.success) return error(validationMessage(parsed));
  try { return ok(await runChat(parsed.data)); }
  catch { return ok({ respuesta: 'No pude procesar esos parámetros. Reformulá la consulta con valores válidos.', toolUsada: 'ninguna', data: null }); }
}
