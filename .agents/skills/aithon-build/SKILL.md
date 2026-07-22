---
name: aithon-build
description: Convierte una idea, brief de investigación o especificación de producto en un prototipo mínimo demostrable (app, chatbot, dashboard, mapa, formulario o automatización). Use when the user runs "/aithon-build <idea o brief>" or asks to build/prototype an MVP for the AIthon.
---

# AIthon Build

Convertí la idea o brief pasado por el usuario en un prototipo funcional mínimo, siguiendo el flujo producto → construcción.

## Pasos

1. Tomá el argumento del skill como la idea/brief de partida. Puede ser:
   - Un brief de investigación ya generado (de `/aithon-research` o el agente `investigador-local`).
   - Una idea de producto ya definida.
   - Una idea muy general — en ese caso, primero hay que acotarla.

2. **Si falta una especificación de producto clara** (usuario principal, dolor, MVP definido), aplicá primero el enfoque del agente `producto-problema` para definirla brevemente:
   - Usuario principal
   - Dolor concreto
   - Solución
   - Flujo de uso
   - MVP
   - Qué queda fuera
   - Métrica de éxito
   - Riesgos de adopción

3. **Construí el prototipo** aplicando el enfoque del agente `constructor-tecnico`:
   - Elegí el formato más simple que demuestre el flujo (app web, chatbot, dashboard, mapa, formulario, script).
   - Usá datos simulados realistas si no hay datos reales, y dejalo explícito.
   - Construí solo el camino feliz del MVP definido, nada del "qué queda fuera".
   - Preferí HTML/CSS/JS plano o Python simple (Streamlit/Flask) salvo que el proyecto ya tenga stack propio.

4. Al finalizar, entregá:
   - El código del prototipo.
   - Instrucciones exactas para correrlo localmente.
   - Resumen de qué funciona, qué está mockeado, decisiones técnicas clave, y qué falta.

## Reglas

- Aplicá las reglas generales de [aithon.md](../../rules/aithon.md): no construir sin definir usuario/dolor/MVP/demo, priorizar demo funcional, marcar supuestos.
- No instales dependencias pesadas ni configures infraestructura externa.
- No sobre-ingenierar: priorizá que algo funcione de punta a punta sobre arquitectura prolija.
- Si el alcance pedido es demasiado ambicioso para horas, recortalo vos mismo y decilo explícitamente.
