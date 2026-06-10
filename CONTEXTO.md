# Contexto del proyecto (AIthon Tierra del Fuego)

> Resumen de avance para retomar el trabajo en cualquier momento. Actualizar a medida que se avanza por las fases.

## Dónde estamos

- **Repo creado y publicado:** https://github.com/MaxiMiuraDev/AIthon-open
- **Fase actual:** setup completo (agentes, skills, reglas). Todavía **no se definió** problemática, usuario, dolor ni MVP. No se construyó nada de prototipo.
- Próximo paso obligatorio según `.claude/rules/aithon.md`: correr `investigador-local` → `producto-problema` antes de tocar código.

## Qué se configuró

Estructura de trabajo inspirada en un flujo "ECC" liviano para Claude Code, sin MCPs ni hooks:

```
.claude/
  agents/
    orquestador.md
    investigador-local.md
    producto-problema.md
    frontend-ux-designer.md
    constructor-tecnico.md
    ui-polish-reviewer.md
    code-reviewer.md
    revisor-critico.md
    pitch-demo.md
    debugger.md
  skills/
    aithon-research/SKILL.md
    aithon-build/SKILL.md
    aithon-pitch/SKILL.md
  rules/
    aithon.md
```

### Flujo de trabajo previsto

1. `orquestador` — coordina fases, no deja avanzar a construcción sin usuario/dolor/MVP/demo definidos.
2. `investigador-local` → `producto-problema` — definen problema, usuario, dolor, solución, MVP, qué queda fuera, métrica de éxito y riesgos. **(obligatorio antes de construir)**
3. `frontend-ux-designer` — pantallas, navegación, estados (vacío/carga/error/resultado), mobile, accesibilidad básica.
4. `constructor-tecnico` — construye el prototipo, prioriza demo funcional sobre arquitectura ideal, usa datos simulados si faltan reales.
5. `debugger` — solo si algo se rompe, fix mínimo viable.
6. `ui-polish-reviewer` — pulido visual (jerarquía, espaciado, contraste, responsive), sin tocar funcionalidad.
7. `code-reviewer` — bugs, edge cases, duplicación, riesgos, clasificados Bloqueante/Importante/Menor.
8. `revisor-critico` — revisión tipo jurado: impacto, factibilidad, privacidad, sesgos, riesgos, preguntas difíciles.
9. `pitch-demo` — pitch de 3 min + guion de demo de 90 seg.

### Reglas clave (`.claude/rules/aithon.md`)

- Problemática local concreta de Tierra del Fuego (Ushuaia, Río Grande, Tolhuin, zonas rurales/antárticas).
- No construir sin usuario, dolor, MVP y demo definidos.
- Evitar datos sensibles/privados; preferir datos simulados realistas marcados como tales.
- Priorizar demo funcional de punta a punta por sobre solución completa.
- Marcar supuestos explícitamente con **Supuesto:**.
- Revisión final cubre privacidad, sesgos, factibilidad, mantenimiento, impacto y claridad.
- Explicación simple para jurado no técnico.

## Datos disponibles

`tmp_ipiec/` contiene datos de turismo de Tierra del Fuego (fuente IPIEC) y scripts de exploración en Python:

- `16_1_01_Pernoctaciones.xlsx` — pernoctaciones por mes/año.
- `16_1_02_PernoctesViajeros.xlsx` — pernoctes por viajeros.
- `16_1_03_Crucerismo.xlsx` — datos de cruceros.
- `16_1_04_PNTDF.xlsx` — datos PNTDF (Parque Nacional Tierra del Fuego, a confirmar).
- Scripts: `read_xlsx.py`, `read_sheet.py`, `read_sheet_idx.py`, `read_pntdf_annual.py` — para inspeccionar las hojas/celdas de los Excel.

Estos datos son un insumo posible para un MVP relacionado a **turismo** (estacionalidad, ocupación, cruceros, etc.), pero todavía no se definió si el proyecto va por ese lado.

## Pendiente / próximos pasos

1. Elegir problemática concreta (turismo es la pista más fuerte por los datos ya cargados, pero está abierto).
2. Correr `investigador-local` con la problemática elegida (o usar `/aithon-research <problemática>`).
3. Pasar a `producto-problema` para cerrar: usuario, dolor, MVP, fuera de alcance, métrica de éxito.
4. Confirmar el MVP en una frase antes de construir.
5. Seguir el resto del flujo (UX → build → polish → review → pitch).

## Notas

- `prompts_default/` guarda los prompts originales usados para configurar el flujo (`Stack.md`, `arquitectura_mvp.md`, `resumen.md`, `run.md`) — útiles como referencia, no hace falta tocarlos.
- `.claude/settings.json` tiene permisos pre-aprobados para git/gh y para correr los scripts de lectura de Excel.
