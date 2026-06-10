'use client';

const TIEMPOS = [
  { min: 120, key: '2h', desc: '2h_desc' },
  { min: 240, key: '4h', desc: '4h_desc' },
  { min: 360, key: '6h', desc: '6h_desc' },
  { min: 480, key: '8h', desc: '8h_desc' },
];

const IDIOMAS = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
];

export default function PantallaA({ t, idioma, setIdioma, tiempoMin, setTiempoMin, onContinuar }) {
  const puedeContinuar = !!idioma && !!tiempoMin;

  return (
    <section className="pantalla-inicio">
      <div className="montana-1" />
      <div className="montana-2" />
      <div className="nieve" />
      <div className="agua-degrade" />
      <div className="agua" />

      <div className="contenido">
        <div className="status-bar" style={{ color: '#CFE0E4' }}>
          <span>9:41</span>
          <span>5G ▰▰▰</span>
        </div>

        <div className="fila-superior">
          <div>
            <div className="marca-titulo">USHUAIA</div>
            <div className="marca-subtitulo">ALTERNATIVA</div>
          </div>
          <div className="lang-switcher">
            {IDIOMAS.map((l) => (
              <button
                key={l.code}
                className={idioma === l.code ? 'activo' : ''}
                onClick={() => setIdioma(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relleno" />

        <div className="controles-bottom">
          <div className="eyebrow">TU TIEMPO EN PUERTO</div>
          <div className="titulo-pregunta">{t('tiempo.titulo', '¿Cuánto tiempo tenés en Ushuaia?')}</div>
          <div className="grid-tiempo">
            {TIEMPOS.map((opt) => (
              <button
                key={opt.min}
                className={`time-chip ${tiempoMin === opt.min ? 'activo' : ''}`}
                onClick={() => setTiempoMin(opt.min)}
              >
                <span className="valor">{opt.key}</span>
                <span className="desc">{t(`tiempo.${opt.desc}`)}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primario btn-grande" disabled={!puedeContinuar} onClick={onContinuar}>
            Armar mi recorrido <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
