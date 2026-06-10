# AIthon Open

Proyecto de trabajo para el AIthon: construir un MVP de IA para una problemática concreta de Tierra del Fuego.

## Estructura

- `.claude/` — agentes y skills personalizados (orquestador, investigador-local, producto-problema, constructor-tecnico, frontend-ux-designer, ui-polish-reviewer, code-reviewer, revisor-critico, pitch-demo, debugger) y reglas del AIthon (`.claude/rules/aithon.md`).
- `prompts_default/` — prompts y notas de arranque del flujo de trabajo.
- `tmp_ipiec/` — datos de turismo (IPIEC Tierra del Fuego) y scripts de exploración usados como insumo.

## Flujo de trabajo

1. `investigador-local` → `producto-problema` para definir problema, usuario y MVP.
2. `frontend-ux-designer` define pantallas y flujo.
3. `constructor-tecnico` construye el prototipo.
4. `ui-polish-reviewer` y `code-reviewer` pulen el resultado.
5. `revisor-critico` evalúa como jurado.
6. `pitch-demo` arma el pitch final.

Ver `prompts_default/resumen.md` y `prompts_default/run.md` para más detalle.

## Estado actual

Ver [`CONTEXTO.md`](CONTEXTO.md) para el resumen de avance, qué está definido y cuáles son los próximos pasos.
