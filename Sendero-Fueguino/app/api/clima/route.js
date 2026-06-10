import { NextResponse } from 'next/server';
import { loadClima } from '../../../lib/server/data';
export function GET() { return NextResponse.json(loadClima()); }
