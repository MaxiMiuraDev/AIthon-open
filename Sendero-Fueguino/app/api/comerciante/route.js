import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FILE = path.join(process.cwd(), 'public', 'data', 'comerciantes.json');

export async function GET() {
  const raw = await fs.readFile(FILE, 'utf-8');
  return NextResponse.json(JSON.parse(raw));
}

export async function POST(request) {
  const body = await request.json();

  if (!body.nombre || !body.rubro) {
    return NextResponse.json({ ok: false, error: 'nombre y rubro son obligatorios' }, { status: 400 });
  }

  const raw = await fs.readFile(FILE, 'utf-8');
  const data = JSON.parse(raw);

  data.push({
    id: `PANEL_${Date.now()}`,
    nombre: body.nombre,
    rubro: body.rubro,
    descripcion: body.descripcion || '',
    contacto: body.contacto || '',
    horario: body.horario || '',
    creado_via_panel: true,
  });

  await fs.writeFile(FILE, JSON.stringify(data, null, 2));

  return NextResponse.json({ ok: true });
}
