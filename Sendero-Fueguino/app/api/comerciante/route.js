import { NextResponse } from 'next/server';
import { appendComerciante, comercianteInputSchema, loadComerciantes } from '../../../lib/server/data';
import { error, jsonBody, validationMessage } from '../../../lib/server/http';
export function GET() { return NextResponse.json(loadComerciantes()); }
export async function POST(request) {
  const body = await jsonBody(request); if (!body.ok) return body.response;
  const parsed = comercianteInputSchema.safeParse(body.data); if (!parsed.success) return error(validationMessage(parsed), 400);
  try { return NextResponse.json({ ok: true, data: await appendComerciante(parsed.data) }, { status: 201 }); }
  catch (err) { return error(`No se pudo guardar el comerciante: ${err instanceof Error ? err.message : String(err)}`, 500); }
}
