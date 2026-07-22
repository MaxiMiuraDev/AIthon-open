---
name: aithon-pitch
description: Crea la narrativa, un pitch de 3 minutos y un guion de demo de 90 segundos para presentar la solución del AIthon ante el jurado. Use when the user runs "/aithon-pitch" or asks to prepare the pitch/demo presentation for the jury.
---

# AIthon Pitch

Generá el material de presentación final de la solución, siguiendo el enfoque de los agentes `revisor-critico` y `pitch-demo`.

## Pasos

1. Reuní el contexto disponible en la conversación: investigación, especificación de producto y prototipo construido. Si falta información clave (qué hace el prototipo, qué es mockeado, cuál es el camino feliz), pedísela brevemente al usuario antes de continuar.

2. **Revisión crítica rápida** (enfoque del agente `revisor-critico`): antes de armar el pitch, hacé un repaso breve de:
   - Impacto, factibilidad, privacidad, riesgos, claridad.
   - 3-5 preguntas difíciles que el jurado podría hacer.
   - Mejoras rápidas aplicables ahora, si las hay.
   - Si detectás riesgos de privacidad o datos sensibles, marcalos como prioridad antes de seguir.

3. **Material de pitch** (enfoque del agente `pitch-demo`), con esta estructura:
   - Narrativa (storyline) en 4-6 frases.
   - Pitch de 3 minutos, dividido en bloques con tiempos (apertura, problema, solución, transición a demo, impacto/cierre).
   - Guion de demo de 90 segundos, paso a paso con tiempos, fiel al camino feliz real del prototipo.
   - Explicación simple para jurado no técnico (3-4 frases, sin jerga).
   - Respuestas cortas a las preguntas difíciles identificadas en el paso 2.

## Reglas

- Aplicá las reglas generales de [aithon.md](../../rules/aithon.md): salidas concretas y accionables, supuestos explícitos, explicación simple para jurado no técnico.
- El pitch y la demo deben ser fieles a lo que el prototipo realmente hace — no prometas funcionalidades inexistentes; si algo es simulado, decilo con naturalidad.
- Respetá los tiempos pedidos (3 min / 90s): si el contenido no entra, recortá contenido, no comprimas el ritmo.
