// ──────────────────────────────────────────────
// Dominios
// ──────────────────────────────────────────────

export type CategoriaPOI =
  | "parque_natural"
  | "museo"
  | "atraccion_historica"
  | "tour_marino"
  | "fauna_marina"
  | "glaciar"
  | "senderismo"
  | "paisaje"
  | "gastronomia_cultural"
  | "mirador"
  | "deporte_aventura"
  | "reserva_natural";

export type CondicionClima = "Soleado" | "Lluvioso" | "Despejado";

export interface POI {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  categoria: CategoriaPOI;
  descripcion: string;
  duracion_min: number;
  distancia_puerto_km: number;
  accesible: boolean;
  accesibilidad_detalle: string;
  idiomas: string[];
  horarios: string;
  clima_recomendado: CondicionClima[];
}

export interface Ruta {
  id: string;
  nombre: string;
  origen: "puerto";
  descripcion: string;
  pois: string[];
  duracion_total_min: number;
  distancia_total_km: number;
}

export interface Clima {
  condicion: CondicionClima;
  temp_c: number;
  condiciones_disponibles: CondicionClima[];
  nota_demo: string;
}

// ──────────────────────────────────────────────
// Contratos de respuesta de la API
// ──────────────────────────────────────────────

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiOk<T> | ApiError;

export type POIsResponse = ApiResponse<POI[]>;
export type RutasResponse = ApiResponse<Ruta[]>;
export type ClimaResponse = ApiResponse<Clima>;

// Respuesta de ruta única con sus POIs expandidos
export interface RutaConPOIs extends Omit<Ruta, "pois"> {
  pois: POI[];
}
export type RutaConPOIsResponse = ApiResponse<RutaConPOIs>;
