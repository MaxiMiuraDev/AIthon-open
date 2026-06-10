# Sendero Fueguino — Fase 3 (UX/UI consolidada)

**MVP en una frase (confirmado, no cambia):**
Una web mobile-first con un mapa de 8-10 puntos del centro de Ushuaia donde, al tocar cada punto, un avatar-guía ("Fin") con framing cultural respetuoso cuenta (texto + audio TTS) una historia curada de un sitio histórico/cultural o de un productor local mock, contrastando un "circuito alternativo" caminable con el circuito turístico masivo saturado. Ahora ampliado con selector de idioma/tiempo/intereses/accesibilidad y un motor de reglas ("Fin") que filtra los POIs a mostrar.

**Usuario principal:** turista de crucero/tránsito corto en Ushuaia (6-8hs en puerto), sin auto, 64% en tránsito antártico de pocas horas (dato real validado, IPIEC/INFUETUR).

**Stack:** vanilla JS + HTML + CSS (sin frameworks pesados), Leaflet + OpenStreetMap (sin API key), Web Speech API para TTS, contenido en `/data/*.json`, Express opcional de un solo archivo (sin DB).

---

## 1. Estructura de archivos (ya creada en `Sendero-Fueguino/`)

```
Sendero-Fueguino/
  FASE3_UX.md              <- este documento
  data/
    pois.json               (8 POIs + 3 MOCK_PRODUCER, con campos ampliados)
    actividades.json         (horarios + duración por poi_id)
    clima_mock.json          (3 escenarios: soleado/lluvia/viento)
    comerciantes.json        (3 MOCK_PRODUCER, formato panel comerciante)
    i18n/
      es.json                 (completo)
      en.json                 (placeholder)
      pt.json                 (placeholder)

  -- A CREAR por constructor-tecnico --
  index.html                 (SPA, todas las pantallas como <section>)
  style.css
  js/
    app.js                    (navegación entre pantallas, estado en localStorage)
    fin-engine.js             (motor de reglas, ver sección 5)
    i18n.js                   (loader de idioma)
    map.js                    (inicialización Leaflet + marcadores)
    tts.js                    (wrapper Web Speech API)
  server.js                   (OPCIONAL: Express de 1 archivo, ver sección 8)
```

---

## 2. Navegación (SPA, una sola página)

```
[Carga inicial]
     v
A. BIENVENIDA (avatar Fin + disclaimer cultural + botón "Empezar")
     v
B. IDIOMA + TIEMPO DISPONIBLE (2h/4h/6h/8h)         [saltable si ya hay localStorage]
     v
C. INTERESES + ACCESIBILIDAD                          [saltable si ya hay localStorage]
     v
[Motor de reglas de Fin -> filtra pois.json]
     v
D. MAPA PRINCIPAL (Leaflet, marcadores filtrados, mensaje de Fin, selector de clima mock)
     |--> toca marcador POI/Productor --> E. FICHA DE ACTIVIDAD (overlay/bottom-sheet)
     |--> botón "Ver ruta sugerida" --> F. RUTA SUGERIDA
     |--> botón "Ver impacto del turismo" --> G. CONTRASTE DE CIRCUITOS
     |--> ícono idioma/ajustes --> vuelve a B/C

H. PANEL COMERCIANTE (acceso aparte, link en footer, fuera del flujo turista)
```

Todo vive en `index.html` como `<section>` que se muestran/ocultan con `display:none/flex` por JS. El mapa (D) queda siempre montado una vez alcanzado; E/F/G son overlays encima.

---

## 3. Pantalla A — Bienvenida

- Título: "Sendero Fueguino"
- Subtítulo: "Un recorrido a pie por el centro de Ushuaia, contado por Fin"
- Avatar de Fin: ícono SVG abstracto (silueta tipo brújula/montaña estilizada, color `--color-primario`). **No representar una figura humana específica.**
- Caja de disclaimer cultural (fondo diferenciado, ícono ℹ️):

  > **Sobre Fin, tu guía**
  >
  > "Este personaje es una representación narrativa con fines educativos, inspirada en la cultura Yagán/Selk'nam, basada en fuentes públicas y académicas citadas (Museo Yámana, Museo del Fin del Mundo). No representa ni habla en nombre de las comunidades originarias actuales."

- Botón grande "Empezar recorrido →" (full width, alto contraste) → navega a B
- Texto pequeño: "Funciona mejor con sonido activado 🔊"

Todos los strings están en `data/i18n/es.json` bajo `bienvenida.*`.

---

## 4. Pantallas B y C — Idioma/Tiempo e Intereses/Accesibilidad

### B. Idioma + tiempo disponible
- 3 botones: Español / English / Português (EN/PT muestran badge "contenido parcial", deshabilitados o con tooltip "Próximamente" si falta tiempo — ver sección 9)
- 4 tarjetas: 2h / 4h / 6h / 8h, cada una con ícono de reloj y subtítulo (`tiempo.*` en es.json)
- Botón "Continuar" deshabilitado hasta elegir idioma + tiempo
- Guarda en `localStorage`: `{ idioma, tiempo_disponible_min }`

### C. Intereses + accesibilidad
- Grilla de 7 chips multi-selección: Gastronomía, Cultura, Compras locales, Naturaleza, Talleres, Museos, Indoor (`intereses.*` en es.json)
- Si no se marca nada → se interpreta como "todos" (mensaje de ayuda visible)
- Toggle: "Necesito un recorrido accesible (sin escaleras, superficies parejas)"
- Botón "Ver mi recorrido" → dispara `fin-engine.js` y navega a D
- Botón "Atrás" → vuelve a B
- Guarda: `{ intereses: [], accesibilidad_requerida: bool }`

**Estado de carga:** al tocar "Ver mi recorrido", mostrar brevemente "Fin está armando tu recorrido..." (1-2 seg simulados).

**Fallback de error:** si `pois.json` no carga, mostrar "No pudimos cargar las paradas. Mostrando recorrido general." y usar los 8 POIs sin filtrar.

---

## 5. Motor de reglas de "Fin" (`fin-engine.js`)

Función pura: `recomendar(preferencias, climaActual, pois)` → `{ pois_recomendados: [], mensaje_fin: string }`

Tabla de decisión, evaluar EN ORDEN:

| Prioridad | Condición | Acción |
|---|---|---|
| 1 | `accesibilidad_requerida = true` | Filtrar: solo `accesibilidad === "accesible"` |
| 2 | `clima === "lluvia"` o `"viento"` | Priorizar `tipo_indoor_outdoor === "indoor"`. Si quedan <3 indoor, completar con outdoor de bajo esfuerzo |
| 3 | `clima === "soleado"` | Priorizar `outdoor`, sin excluir indoor |
| 4 | `tiempo_disponible_min <= 120` | Máx. 3 paradas, ordenadas por `distancia_puerto_km` ascendente |
| 5 | `tiempo_disponible_min` 121-240 | Máx. 5 paradas |
| 6 | `tiempo_disponible_min` 241-360 | Máx. 7 paradas, incluir 1 `MOCK_PRODUCER` |
| 7 | `tiempo_disponible_min > 360` | Todas las que cumplan filtros + 2-3 `MOCK_PRODUCER` |
| 8 | cruzar con `intereses[]` | Las que coincidan con intereses del usuario suben en el orden (no excluyen) |
| 9 | mensaje final | Template: `fin_mensajes.saludo_template` en es.json: "Como elegiste {tiempo}h y hoy está {clima}, te armé un recorrido de {n} paradas, priorizando {intereses}." |

**Caso vacío:** si el resultado es 0 POIs, hacer fallback a las 3 paradas más cercanas al puerto (ignorando intereses, respetando accesibilidad) y usar `mapa.vacio_mensaje`.

**Clima mock:** seleccionable manualmente en pantalla D vía 3 botones (☀️🌧️💨), lee/escribe `clima_mock.json` -> `escenario_activo`. Al cambiar, re-ejecutar el motor de reglas.

---

## 6. Pantalla D — Mapa principal

- Header fijo (~56px): "Sendero Fueguino" + selector de clima (☀️/🌧️/💨, activo resaltado) + ícono idioma (vuelve a B) + ícono ajustes (vuelve a C)
- Mapa Leaflet a pantalla completa (`height: calc(100vh - 56px)` o `100dvh`), centrado en Ushuaia centro/puerto (lat ≈ -54.809, lng ≈ -68.303), zoom inicial ~16
- Marcadores SOLO de `pois_recomendados`:
  - POIs históricos (`tipo: "poi"`): círculo color `--color-acento`, ícono libro/monumento
  - Productores (`tipo: "MOCK_PRODUCER"`): círculo color `--color-secundario`, ícono bolsa/artesanía
  - Visitados: agregar check ✓ superpuesto (no solo cambio de color)
- Burbuja de Fin con `mensaje_fin` generado + botón "🔊 Escuchar" (TTS)
- Lista de tarjetas debajo del mapa (o panel lateral en desktop) con los POIs recomendados en orden, cada una: nombre, ícono indoor/outdoor, distancia, duración — tap abre Ficha (E)
- Badge flotante: "X/10 puntos descubiertos" (`mapa.badge_visitados`)
- Botones: "Ver ruta sugerida →" (F), "Ver impacto del turismo" (G)

**Fallback sin mapa:** si Leaflet/OSM no carga, mostrar `mapa.error_mapa` + lista HTML simple de los puntos (mismo JSON), tocable, abre la misma Ficha (E).

---

## 7. Pantalla E — Ficha de actividad (overlay/bottom-sheet)

Bottom-sheet desde abajo, ~70% de pantalla, fondo semitransparente sobre el mapa.

1. Barra de "agarre" + botón "✕"
2. Avatar Fin + "Fin te cuenta..." (POI) o "Fin te recomienda..." (Productor)
3. Si `tipo === "MOCK_PRODUCER"`: badge visible "PRODUCTOR LOCAL · DATOS SIMULADOS (MOCK)" antes del título
4. Título (`nombre`)
5. **Sección "Datos prácticos"** (grilla 2 columnas en mobile):
   - 📍 Distancia desde el puerto: `distancia_puerto_km` km
   - ⏱️ Duración estimada: `duracion_min` min
   - 💰 Precio estimado: "Gratuito" si `monto === 0`, si no "$X (estimado)"
   - ♿ Accesibilidad: texto de `ficha.accesibilidad_valores[accesibilidad]` + ícono
   - 🗣️ Idioma disponible: `idiomas_disponibles`
   - 🕒 Horario: de `actividades.json` (si no existe, mostrar `ficha.no_disponible`)
6. Texto curado (`texto`) — completo, ya redactado en `pois.json`
7. Línea de fuente (si `fuente` no está vacío): "Fuente: {fuente}"
8. Si MOCK_PRODUCER: en vez de fuente, mostrar `ficha.mock_nota`
9. Botón "🔊 Escuchar" → TTS del campo `texto` (cancelar con `speechSynthesis.cancel()` al cerrar)
10. Botón "Agregar/quitar de mi ruta" (toggle, afecta lista de F)
11. Botón "Cerrar" / tap fuera

**TTS no soportado:** si `window.speechSynthesis` no existe, ocultar botón "Escuchar" y mostrar `ficha.tts_no_soportado`.

---

## 8. Pantalla F — Ruta sugerida

- Título: `ruta.titulo_template` ("Tu recorrido sugerido — {n} paradas, {tiempo} aprox.")
- Lista numerada de `pois_recomendados` en orden, cada ítem:
  - Número + nombre + ícono indoor/outdoor
  - Horario estimado inicio-fin (calculado: hora inicio fija 09:00 + suma acumulada de `duracion_min` + `tiempo_traslado_siguiente_min` de `actividades.json`)
  - Mini-descripción (1 línea recortada de `texto`)
  - Tap → abre Ficha (E)
- Resumen final: `ruta.regreso_label` + horario calculado de regreso
- Si la suma supera `tiempo_disponible_min`: mostrar `ruta.aviso_excede_tiempo` (no bloqueante)
- Botones: "Volver al mapa" (D), "Ver impacto del turismo" (G)
- Vacío: si `pois_recomendados` está vacío → `ruta.vacio_mensaje`

---

## 9. Pantalla G — Contraste de circuitos

- Título: "Dos formas de conocer Ushuaia"
- Bloque narrativo (3 párrafos, texto completo en `data/i18n/es.json` bajo `contraste.parrafo_1/2/3`), integrando:
  - 173.211 cruceristas 2023/24 (+59% desde 2016/17), 64% tránsito antártico de pocas horas
  - PN Tierra del Fuego: 494.202 visitas en 2024 (récord), 61% no residentes
  - "Flujo invisible": no aparecen en estadísticas hoteleras (estadía promedio 2,9 días mide otro público)
- Dos tarjetas comparativas (apiladas en mobile):
  - 🚌 CIRCUITO MASIVO — Av. San Martín + Parque Nacional, miles de visitantes/día
  - 🚶 CIRCUITO SENDERO FUEGUINO — 8 sitios + productores, <20 min a pie, contado por Fin
- Botón "Ver el mapa →" vuelve a D

Accesible desde D (botón "Ver impacto del turismo") y desde F.

---

## 10. Pantalla H — Panel Comerciante (mínimo, opcional)

- Acceso: link discreto en footer "¿Sos comerciante/productor local? Sumate acá"
- Nota: "Esta es una versión de prueba — los datos no se publican automáticamente."
- Formulario: Nombre, Rubro (select: Gastronomía/Artesanías/Indumentaria/Talleres/Otro), Descripción corta (contador de caracteres), Contacto, Horario
- Botón "Enviar" → si hay `server.js`: `POST /api/comerciante` (escribe en `comerciantes.json` con `fs`). Si no hay servidor: guarda en `localStorage`, muestra `comerciante.modo_offline`
- Lista debajo: "Emprendimientos sumados hoy" (los `creado_via_panel: true`)
- Validación: Nombre y Rubro obligatorios (borde rojo + ícono + texto de ayuda si faltan)

---

## 11. server.js (OPCIONAL — Express de 1 archivo)

Si hay tiempo:
```js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/comerciante', (req, res) => {
  const file = path.join(__dirname, 'data', 'comerciantes.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  data.push({ ...req.body, id: `PANEL_${Date.now()}`, creado_via_panel: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

app.get('/api/clima', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'clima_mock.json'));
});

app.listen(3000, () => console.log('Sendero Fueguino en http://localhost:3000'));
```

Si NO hay tiempo: servir con `npx serve` o abrir `index.html` directo, y el Panel Comerciante cae a modo offline (`localStorage`).

---

## 12. Mobile / Accesibilidad

- Touch targets mínimo 48x48px (botones full-width en mobile)
- Contraste mínimo 4.5:1 (WCAG AA) — pensado para uso al sol, exterior
- Fuente base 16px, textos de tarjetas 18px, títulos 20-24px bold
- Marcadores visitados: diferenciar por ÍCONO (check ✓) además de color
- Badges (MOCK, contenido parcial, accesibilidad): texto explícito, no solo color
- `aria-label` en: avatar Fin, ícono "Escuchar", marcadores del mapa, selector de clima
- Mapa: ocupar `calc(100vh - 56px)` o `100dvh`

---

## 13. Paleta visual

```css
:root {
  --color-fondo: #F4F1EC;       /* hueso/marfil cálido */
  --color-texto: #1E2A30;        /* azul-gris oscuro */
  --color-primario: #2C5F6F;     /* azul-petróleo (canal Beagle) */
  --color-secundario: #B5651D;   /* terracota/madera de lenga */
  --color-acento: #8FB8C9;       /* celeste glaciar */
  --color-alerta-mock: #D98E04;  /* mostaza/ámbar - badges MOCK */
  --color-borde: #D8D2C4;        /* beige grisáceo */
}
```

- Tipografía: `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (sin fuentes externas)
- Bordes redondeados 8-12px, sombras sutiles `0 2px 8px rgba(0,0,0,0.1)`
- Avatar Fin: SVG abstracto (brújula/montaña), NO figura humana específica

---

## 14. Qué cortar primero si falta tiempo (orden de prioridad)

1. **Panel Comerciante (H) + `server.js`** — quitar del footer o dejar "Próximamente". Cero impacto en flujo turista.
2. **i18n EN/PT** — dejar solo `es.json` (ya completo). Selector de idioma muestra EN/PT con tooltip "Próximamente", deshabilitados.
3. **Express** — servir estático con `npx serve` o `file://`. Panel Comerciante (si existe) cae a `localStorage`.
4. **Clima mock**: reducir de 3 a 2 escenarios (soleado/lluvia).
5. **Pantalla F (Ruta sugerida)**: simplificar cálculo de traslados a un valor fijo "10 min entre paradas" en vez de leer `tiempo_traslado_siguiente_min` por POI.
6. **Fusionar B + C** en una sola pantalla larga con scroll si hace falta achicar más.

**NÚCLEO QUE NO SE CORTA** (es lo que diferencia esta versión del MVP base y debe verse en la demo):
- Selector de tiempo (2h/4h/6h/8h)
- Selector de intereses + accesibilidad (aunque fusionado con tiempo)
- Motor de reglas funcionando con al menos clima + tiempo
- `pois.json` ampliado (ya está creado, completo)
- Mapa que REALMENTE filtra según la recomendación
- Ficha de actividad con al menos distancia, duración y accesibilidad
- Las 8 historias de POI + disclaimer cultural + pantalla de Contraste de Circuitos (Fase 2/3 base)

---

## 15. Datos ya disponibles (no inventar nada más)

- `data/pois.json`: 8 POIs reales + 3 MOCK_PRODUCER, con `texto`, `fuente`, `lat/lng` aproximados del centro de Ushuaia, y los 7 campos nuevos completos
- `data/actividades.json`: horarios y duraciones por `poi_id`
- `data/clima_mock.json`: 3 escenarios
- `data/comerciantes.json`: 3 MOCK_PRODUCER en formato panel
- `data/i18n/es.json`: TODOS los strings de interfaz necesarios (incluye disclaimer cultural y los 3 párrafos de la pantalla de contraste)
- `data/i18n/en.json`, `pt.json`: placeholders parciales

**Coordenadas:** son aproximadas (centro de Ushuaia, Av. Maipú/San Martín/costanera). Marcado como **Supuesto** — ajustar si se dispone de coordenadas exactas, pero no bloqueante para la demo.
