import { NextResponse } from "next/server";
import type { ApiOk, ApiError } from "@/types";

export function respond<T>(data: T, status = 200): NextResponse<ApiOk<T>> {
  return NextResponse.json({ ok: true as const, data }, { status });
}

export function respondError(message: string, status: number): NextResponse<ApiError> {
  return NextResponse.json({ ok: false as const, error: message }, { status });
}
