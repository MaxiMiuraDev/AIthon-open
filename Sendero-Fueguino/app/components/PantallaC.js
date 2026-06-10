'use client';

const INTERESES = ['gastronomia', 'cultura', 'compras_locales', 'naturaleza', 'talleres', 'museos', 'indoor'];
const INTERES_ICONOS = {
  gastronomia: '🍽',
  cultura: '🏛',
  compras_locales: '🛍',
  naturaleza: '🌲',
  talleres: '🏺',
  museos: '🏛',
  indoor: '🏠',
};

const ACCESIBILIDAD_OPCIONES = [
  { key: 'caminata_corta', icono: '🚶', label: 'Caminata corta' },
  { key: 'silla_ruedas', icono: '♿', label: 'Silla de ruedas' },
  { key: 'bajo_esfuerzo', icono: '🫧', label: 'Bajo esfuerzo' },
];

const PRESUPUESTOS = ['Gratis', 'Bajo', 'Medio', 'Premium'];

export default function PantallaC({
  t,
  intereses,
  setIntereses,
  accesibilidad,
  setAccesibilidad,
  presupuesto,
  setPresupuesto,
  cargando,
  onAtras,
  onVer,
}) {
  function toggleInteres(key) {
    setIntereses((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  }

  function toggleAccesibilidad(key) {
    setAccesibilidad((prev) => {
      const lista = Array.isArray(prev) ? prev : [];
      return lista.includes(key) ? lista.filter((a) => a !== key) : [...lista, key];
    });
  }

  const accesibilidadActiva = Array.isArray(accesibilidad) ? accesibilidad : [];

  return (
    <section className="pantalla-light">
      <div className="status-bar">
        <span>9:41</span>
        <span>5G ▰▰▰</span>
      </div>
      <div className="header-light">
        <button className="btn-circular" onClick={onAtras} aria-label="Atrás">‹</button>
        <span className="paso-label">PASO 2 · PREFERENCIAS</span>
        <span style={{ width: 38, height: 38 }} />
      </div>

      <div className="contenido-scroll">
        <div>
          <div className="titulo-paso">{t('intereses.titulo', '¿Qué te gustaría descubrir?')}</div>
          <div className="subtitulo-paso">{t('intereses.nota_ninguno', 'Elegí lo que te interesa. Si no marcás nada, te mostramos todo.')}</div>
        </div>

        <div className="chips-row">
          {INTERESES.map((key) => (
            <button
              key={key}
              className={`filter-chip ${intereses.includes(key) ? 'activo' : ''}`}
              onClick={() => toggleInteres(key)}
            >
              {INTERES_ICONOS[key]} {t(`intereses.${key}`)}
            </button>
          ))}
        </div>

        <div className="grupo-seccion">
          <div className="label-mono">ACCESIBILIDAD</div>
          <div className="chips-row">
            {ACCESIBILIDAD_OPCIONES.map((opt) => (
              <button
                key={opt.key}
                className={`filter-chip cuadrado ${accesibilidadActiva.includes(opt.key) ? 'activo' : ''}`}
                onClick={() => toggleAccesibilidad(opt.key)}
              >
                {opt.icono} {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grupo-seccion">
          <div className="label-mono">PRESUPUESTO</div>
          <div className="segmented">
            {PRESUPUESTOS.map((p) => (
              <button
                key={p}
                className={presupuesto === p ? 'activo' : ''}
                onClick={() => setPresupuesto(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {cargando && <div className="skeleton-msg">{t('intereses.cargando', 'Fin está armando tu recorrido…')}</div>}
      </div>

      <div className="cta-sticky">
        <button className="btn btn-oscuro btn-grande" onClick={onVer} disabled={cargando}>
          {t('intereses.boton_ver_recorrido', 'Ver recomendaciones')} <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>
        </button>
      </div>
    </section>
  );
}
