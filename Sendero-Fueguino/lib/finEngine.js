// Motor de reglas de "Fin" - filtra y prioriza POIs segun preferencias, clima y tiempo.
// Funcion pura: recomendar(preferencias, climaActual, pois, mensajeTemplate) -> { pois_recomendados, mensaje_fin, fallback_usado }

const INTERES_LABELS = {
  gastronomia: 'gastronomía',
  cultura: 'cultura',
  compras_locales: 'compras locales',
  naturaleza: 'naturaleza',
  talleres: 'talleres',
  museos: 'museos',
  indoor: 'lugares techados',
};

const CLIMA_LABELS = {
  soleado: 'soleado',
  lluvia: 'lluvioso',
  viento: 'con viento fuerte',
};

export function recomendar(preferencias, climaActual, pois, mensajeTemplate) {
  const {
    accesibilidad_requerida = false,
    intereses = [],
    tiempo_disponible_min = 240,
  } = preferencias || {};

  let candidatos = pois.slice();

  // Prioridad 1: accesibilidad
  if (accesibilidad_requerida) {
    candidatos = candidatos.filter((p) => p.accesibilidad === 'accesible');
  }

  // Prioridad 2/3: clima
  if (climaActual === 'lluvia' || climaActual === 'viento') {
    const indoor = candidatos.filter((p) => p.tipo_indoor_outdoor === 'indoor');
    const outdoor = candidatos
      .filter((p) => p.tipo_indoor_outdoor !== 'indoor')
      .slice()
      .sort((a, b) => a.duracion_min - b.duracion_min);
    candidatos = indoor.concat(outdoor);
  } else if (climaActual === 'soleado') {
    const outdoor = candidatos.filter((p) => p.tipo_indoor_outdoor === 'outdoor');
    const indoor = candidatos.filter((p) => p.tipo_indoor_outdoor !== 'outdoor');
    candidatos = outdoor.concat(indoor);
  }

  // Prioridad 4-7: tiempo disponible -> maximo de paradas
  let maxParadas;
  let mockProducersDeseados = 0;
  if (tiempo_disponible_min <= 120) {
    maxParadas = 3;
    candidatos = candidatos.slice().sort((a, b) => a.distancia_puerto_km - b.distancia_puerto_km);
  } else if (tiempo_disponible_min <= 240) {
    maxParadas = 5;
  } else if (tiempo_disponible_min <= 360) {
    maxParadas = 7;
    mockProducersDeseados = 1;
  } else {
    maxParadas = candidatos.length;
    mockProducersDeseados = 3;
  }

  // Prioridad 8: cruzar con intereses del usuario (suben en el orden, no excluyen)
  if (intereses && intereses.length > 0) {
    const coincide = (p) => p.intereses && p.intereses.some((i) => intereses.includes(i));
    candidatos = candidatos.slice().sort((a, b) => {
      const aCoincide = coincide(a) ? 0 : 1;
      const bCoincide = coincide(b) ? 0 : 1;
      return aCoincide - bCoincide;
    });
  }

  // Separar pois normales vs mock producers para respetar el cupo de mock_producers
  const normales = candidatos.filter((p) => p.tipo !== 'MOCK_PRODUCER');
  const mocks = candidatos.filter((p) => p.tipo === 'MOCK_PRODUCER');

  let resultado = [];
  if (mockProducersDeseados > 0 && mocks.length > 0) {
    const cupoMocks = Math.min(mockProducersDeseados, mocks.length, maxParadas);
    const cupoNormales = Math.max(0, maxParadas - cupoMocks);
    resultado = normales.slice(0, cupoNormales).concat(mocks.slice(0, cupoMocks));
  } else {
    resultado = candidatos.slice(0, maxParadas);
  }

  // Caso vacio: fallback a las 3 paradas mas cercanas al puerto (respetando accesibilidad)
  let fallback_usado = false;
  if (resultado.length === 0) {
    fallback_usado = true;
    let fallbackPool = pois.slice();
    if (accesibilidad_requerida) {
      fallbackPool = fallbackPool.filter((p) => p.accesibilidad === 'accesible');
    }
    fallbackPool.sort((a, b) => a.distancia_puerto_km - b.distancia_puerto_km);
    resultado = fallbackPool.slice(0, 3);
  }

  // Prioridad 9: mensaje final
  const tiempoHoras = Math.round((tiempo_disponible_min / 60) * 10) / 10;
  const climaLabel = CLIMA_LABELS[climaActual] || climaActual;
  let interesesLabel;
  if (intereses && intereses.length > 0) {
    interesesLabel = intereses.map((i) => INTERES_LABELS[i] || i).join(', ');
  } else {
    interesesLabel = 'un poco de todo';
  }

  const mensaje_fin = (mensajeTemplate || 'Como elegiste {tiempo}h y hoy está {clima}, te armé un recorrido de {n} paradas, priorizando {intereses}.')
    .replace('{tiempo}', String(tiempoHoras))
    .replace('{clima}', climaLabel)
    .replace('{n}', String(resultado.length))
    .replace('{intereses}', interesesLabel);

  return {
    pois_recomendados: resultado,
    mensaje_fin,
    fallback_usado,
  };
}
