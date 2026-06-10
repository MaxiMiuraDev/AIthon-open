# Backend integrado de Sendero Fueguino

## Arquitectura

`Sendero-Fueguino` es la aplicación ejecutable única. Los comandos de la raíz (`npm run dev`, `npm run build` y `npm run validate-data`) delegan en esta app. Los componentes visuales, estilos, flujo de pantallas y `lib/finEngine.js` no fueron modificados.

La fuente de verdad es `public/data/`: POIs, actividades, clima mock y comerciantes. `lib/server/data.js` valida esos archivos con Zod, controla referencias entre actividades y POIs, calcula disponibilidad por fecha en la zona horaria `America/Argentina/Ushuaia` y permite usar `DATA_DIR` para pruebas aisladas.

Todo continúa siendo mock y local: no se consumen APIs externas.

## APIs

- `GET /api/clima`: conserva el objeto crudo esperado por el frontend.
- `GET /api/comerciante`: conserva el array crudo esperado por el frontend.
- `POST /api/comerciante`: valida y persiste todos los campos del formulario mediante escritura atómica.
- `GET /api/pois`: lista y filtra por `q`, `interes`, `tipo`, `accesible`, `maxDuracion` y `maxDistancia`.
- `GET /api/pois/:id`: obtiene un POI canónico.
- `GET /api/actividades?fecha=YYYY-MM-DD`: expande cada actividad con su POI y marca `disponible` según `dias_cerrado`.
- `POST /api/recomendaciones`: acepta el estado exacto del frontend y aliases legacy; ejecuta directamente `lib/finEngine.js`, por lo que mantiene paridad exacta.
- `POST /api/chat`: chatbot mock sin red, con límites de body, historial user-only para recuperar tiempo y una tool por mensaje.

Los endpoints nuevos usan `{ "ok": true, "data": ... }` o `{ "ok": false, "error": ... }`. Clima y GET de comerciantes mantienen respuesta cruda por compatibilidad con el frontend existente.

## Chatbot

El chatbot decide la intención usando el mensaje actual. Puede consultar clima, buscar POIs y horarios, listar actividades disponibles hoy y pedir recomendaciones. Las recomendaciones reutilizan el mismo motor del frontend y nunca inventan actividades ausentes.

Ejemplos:

```json
{"mensaje":"i have 6 hours per day to do activities, i like trekking, eating, and doing alcohol and chocolate degustation"}
```

Extrae 360 minutos, intereses `naturaleza` y `gastronomia`, usa el clima mock y devuelve siete paradas. Aclara que no existe una degustación de chocolate cargada.

```json
{"mensaje":"listame todas las actividades que hay el dia de hoy"}
```

Usa la fecha de Ushuaia, excluye actividades cerradas ese día y devuelve horarios junto con los POIs.

```json
{"mensaje":"Horario del Museo Marítimo"}
```

Conserva la entidad concreta y devuelve solo `poi_03`.

## Verificación

```bash
npm run validate-data
npm run build
```

La persistencia se puede probar sin tocar datos reales iniciando la app con `DATA_DIR=/tmp/sendero-data-test`.

## Limitaciones visibles del frontend

El backend ya acepta presupuesto y preferencias completas, pero el `finEngine` visual todavía no usa presupuesto, `caminata_corta` ni `bajo_esfuerzo`. El FAB del guía no llama a `/api/chat`, el selector de clima es local y favoritos/“Cómo llegar” no tienen acción. Corregir esos puntos requiere modificar componentes o flujo frontend, fuera del alcance acordado.
