import { NextResponse } from 'next/server';
export function ok(data, status = 200) { return NextResponse.json({ ok: true, data }, { status }); }
export function error(message, status = 400) { return NextResponse.json({ ok: false, error: message }, { status }); }
export async function jsonBody(request) { try { return { ok: true, data: await request.json() }; } catch { return { ok: false, response: error('El body debe ser JSON válido', 400) }; } }
export function validationMessage(result) { return result.error.issues.map((issue) => issue.message).join('; '); }
