---
name: aithon-research
description: Investiga una problemática fueguina (Tierra del Fuego) pasada como argumento, generando un brief de contexto territorial, actores, causas, datos, restricciones, oportunidades de IA y recomendación de foco MVP. Use when the user runs "/aithon-research <problemática>" or asks to research a local problem for the AIthon.
---

# AIthon Research

Investigá la problemática indicada por el usuario usando el enfoque del agente `investigador-local`.

## Pasos

1. Tomá el argumento pasado al skill como la problemática a investigar. Si no se pasó ningún argumento, pedile al usuario que indique brevemente el tema o problemática a investigar (ej: "turismo", "residuos", "transporte escolar", "salud rural").
2. Invocá (o aplicá el enfoque de) el agente `investigador-local` sobre esa problemática.
3. Generá el brief de investigación siguiendo exactamente la estructura del agente `investigador-local`:
   - Contexto territorial
   - Actores afectados
   - Causas probables
   - Datos necesarios
   - Restricciones locales
   - Oportunidades de IA
   - Recomendación de foco MVP
4. Marcá explícitamente cualquier supuesto con **Supuesto:**.
5. Cerrá indicando que el resultado puede pasarse directamente al agente/skill `producto-problema` (o `/aithon-build`) como insumo para definir el MVP.

## Reglas

- Aplicá las reglas generales de [aithon.md](../../rules/aithon.md): foco en problemática local concreta, datos simulados si no hay reales, supuestos explícitos.
- No avances a definir producto ni a construir nada — este skill termina en el brief de investigación.
- Mantené la respuesta concisa y accionable, no un informe extenso.
