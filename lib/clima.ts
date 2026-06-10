import type { CondicionClima } from "@/types";

export const CONDICIONES_CLIMA: CondicionClima[] = ["Soleado", "Lluvioso", "Despejado"];

/**
 * Normaliza una condición de clima recibida del cliente (case-insensitive)
 * a uno de los valores válidos del contrato. Devuelve null si no matchea.
 */
export function normalizeClima(raw: string): CondicionClima | null {
  const s = raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1).toLowerCase();
  return CONDICIONES_CLIMA.includes(s as CondicionClima)
    ? (s as CondicionClima)
    : null;
}
