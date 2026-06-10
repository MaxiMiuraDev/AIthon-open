Quiero que configures este proyecto para trabajar en un AIthon con un flujo de agentes inspirado en ECC, pero liviano y práctico.

Contexto:
- Estoy en un AIthon en Ushuaia, Tierra del Fuego.
- El objetivo es resolver problemáticas fueguinas usando IA.
- Uso Claude Code en VS Code.
- Necesito un flujo rápido para investigar, definir MVP, construir prototipo, revisar riesgos y armar pitch.
- No quiero sobreconfigurar: sin hooks complejos ni MCPs por ahora.

Creá esta estructura en el proyecto:

.claude/
  agents/
    investigador-local.md
    producto-problema.md
    constructor-tecnico.md
    revisor-critico.md
    pitch-demo.md
  skills/
    aithon-research/
      SKILL.md
    aithon-build/
      SKILL.md
    aithon-pitch/
      SKILL.md
  rules/
    aithon.md

Contenido esperado:

1. Agente investigador-local
Debe investigar contexto territorial, actores afectados, causas, datos necesarios, restricciones locales, oportunidades de IA y recomendación de foco MVP.

2. Agente producto-problema
Debe convertir investigación en una propuesta de producto: usuario principal, dolor concreto, solución, flujo de uso, MVP, qué queda fuera, métrica de éxito y riesgos de adopción.

3. Agente constructor-tecnico
Debe diseñar y construir prototipos simples: app, chatbot, dashboard, mapa, formulario o automatización. Debe priorizar demo funcional sobre arquitectura perfecta.

4. Agente revisor-critico
Debe revisar la solución como jurado: impacto, factibilidad, privacidad, riesgos, claridad, preguntas difíciles y mejoras rápidas.

5. Agente pitch-demo
Debe armar narrativa, pitch de 3 minutos y guion de demo de 90 segundos.

6. Skill /aithon-research
Debe investigar una problemática fueguina pasada como argumento.

7. Skill /aithon-build
Debe convertir una idea o brief en un prototipo mínimo demostrable.

8. Skill /aithon-pitch
Debe crear pitch y guion de demo para presentar al jurado.

9. Rules aithon.md
Debe incluir reglas de trabajo:
- Priorizar problemática local concreta.
- No construir antes de definir usuario, dolor, MVP y demo.
- Evitar datos sensibles o privados salvo que sea imprescindible.
- Preferir datos simulados realistas si no hay datos confiables.
- Priorizar demo funcional en pocas horas.
- Mantener cada salida concreta y accionable.
- Marcar supuestos explícitamente.
- Revisar privacidad, sesgos, factibilidad y mantenimiento.
- Preparar siempre una explicación simple para jurado no técnico.

Además:
- Escribí cada archivo con frontmatter válido cuando corresponda.
- Usá nombres compatibles con Claude Code.
- Al terminar, mostrame un resumen de qué creaste y cómo usarlo.
- No instales dependencias.
- No configures MCPs.
- No agregues hooks.