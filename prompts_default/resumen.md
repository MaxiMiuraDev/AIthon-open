Resumen del stack en .claude/agents/
Nuevos:

orquestador.md — coordina el flujo (research → producto → UX → build → polish → code review → revisor crítico → pitch). No deja avanzar a construcción sin usuario/dolor/MVP/demo definidos. Decide qué agente sigue y detecta inconsistencias entre entregables.
frontend-ux-designer.md — toma la spec de producto-problema y define pantallas, navegación, contenido, estados (vacío/carga/error), mobile y accesibilidad básica. Output pensado para que constructor-tecnico lo implemente directo.
ui-polish-reviewer.md — pule el front ya construido: jerarquía, espaciado, contraste, botones, responsive, consistencia y detalles de "producto terminado". Solo cambios visuales, sin tocar funcionalidad.
code-reviewer.md — revisa calidad técnica del código: bugs, edge cases, duplicación, nombres, estados inconsistentes, riesgos. Prioriza lo que pueda romper la demo en vivo, clasificado por severidad (Bloqueante/Importante/Menor).
Existentes (sin cambios): investigador-local, producto-problema, constructor-tecnico, pitch-demo, revisor-critico.

Sin tocar: skills aithon-research, aithon-build, aithon-pitch y .claude/rules/aithon.md.

Cómo usarlo
Flujo típico de una sesión:

Empezá con orquestador para que te diga en qué fase estás y qué sigue.
investigador-local → producto-problema (definen problema/usuario/MVP — obligatorio antes de construir).
frontend-ux-designer define pantallas/flujo (puede ir en paralelo con backend).
constructor-tecnico construye el prototipo.
ui-polish-reviewer y code-reviewer pulen visual y técnicamente.
revisor-critico evalúa como jurado.
pitch-demo arma el pitch final.
Podés invocarlos como subagentes (Agent con subagent_type: nombre-del-agente) o pedirle a orquestador que te oriente primero.