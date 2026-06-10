import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FILE = path.join(process.cwd(), 'public', 'data', 'clima_mock.json');

export async function GET() {
  const raw = await fs.readFile(FILE, 'utf-8');
  return NextResponse.json(JSON.parse(raw));
}
