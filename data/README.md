# data/ — Datos del backend

> **TODOS LOS DATOS DE ESTE DIRECTORIO SON SIMULADOS.**
> No representan información oficial ni en tiempo real.
> Son datos de ejemplo realistas creados para el prototipo del AIthon.

## Archivos

### `pois.json`
15 Puntos de Interés (POIs) de Ushuaia simulados con coordenadas aproximadas reales,
descripciones plausibles y atributos de accesibilidad inventados.

**Supuesto:** las coordenadas son aproximadas (±500 m). Los horarios y duraciones
son estimaciones típicas de temporada alta, no datos confirmados con operadores.
Los nombres, descripciones y horarios base están cargados solo en español; el
chatbot traduce etiquetas y tokens conocidos de horarios de forma best-effort.
Los POIs con `requiere_navegacion: true` no son visitas independientes: forman
parte de una excursión marítima.

### `rutas.json`
4 rutas temáticas con POI ordenados y distancias/duraciones calculadas a mano.

**Supuesto:** las distancias y tiempos totales incluyen desplazamiento entre POIs
pero no contemplan colas ni esperas. Son orientativos.

### `clima.json`
Clima actual completamente mockeado. La condición se puede cambiar manualmente
entre `"Soleado"`, `"Lluvioso"` y `"Despejado"` para la demo.

**Supuesto:** en producción esto vendría de una API meteorológica (SMN, OpenMeteo, etc.).

## Por qué datos simulados

Regla del proyecto (`.claude/rules/aithon.md`): preferir datos simulados realistas
marcados explícitamente antes que datos no verificados o APIs externas que
pueden fallar durante la demo.
