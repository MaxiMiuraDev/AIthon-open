'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import React from 'react';

const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), {
  ssr: false,
  loading: () => <div className="mapa" />,
});

const CLIMA_INFO = {
  soleado: { icono: '☀️', label: 'Soleado', valor: '4°C', alerta: false },
  lluvia: { icono: '🌧️', label: 'Lluvia', valor: '2°C', alerta: true },
  viento: { icono: '🌬', label: 'Viento fuerte', valor: '−2°C', alerta: true },
};

function formatearTiempoRestante(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function PantallaD({
  t,
  idioma,
  pois,
  pois_recomendados,
  mensajeFin,
  visitadosCount,
  totalCount,
  clima,
  setClima,
  tiempoMin,
  onSeleccionarPoi,
  onVerRuta,
  onVerImpacto,
  onCambiarIdioma,
  onCambiarPreferencias,
  onAbrirComerciante,
  hablar,
  soportaTts,
}) {
  const [mapaError, setMapaError] = useState(false);

  const climaInfo = CLIMA_INFO[clima] || CLIMA_INFO.soleado;
  const distanciaPuerto = pois_recomendados[0]?.distancia_puerto_km;
  const distanciaLabel = distanciaPuerto != null ? `${Math.round(distanciaPuerto * 1000)} m` : '—';

  return (
    <section className="pantalla-mapa">
      <div className="status-bar" style={{ color: '#CFE0E4' }}>
        <span>9:41</span>
        <span>5G ▰▰▰</span>
      </div>

      <div className="header-mapa-compacto">
        <div className="header-mapa-fila">
          <button className="btn-circular-oscuro" onClick={onCambiarPreferencias} aria-label={t('mapa.cambiar_preferencias')}>‹</button>
          <span className="titulo-recorrido">{t('app_nombre', 'Tu recorrido')}</span>
          <button className="lang-switcher compacto" onClick={onCambiarIdioma} aria-label={t('mapa.cambiar_idioma')}>
            🌐 {idioma.toUpperCase()}
          </button>
        </div>

        <div className="context-strip">
          <div className={`context-pill ${climaInfo.alerta ? 'alerta' : ''}`}>
            <span className="label">{climaInfo.icono} {t(`clima.${clima}`, climaInfo.label)}</span>
            <span className="valor">{climaInfo.valor}</span>
          </div>
          <div className="context-pill">
            <span className="label">⏱ Restante</span>
            <span className="valor">{formatearTiempoRestante(tiempoMin || 240)}</span>
          </div>
          <div className="context-pill">
            <span className="label">📍 Al puerto</span>
            <span className="valor">{distanciaLabel}</span>
          </div>
        </div>

        {/* selector de clima demo */}
        <div className="chips-row" role="group" aria-label={t('clima.selector_label', 'Clima (demo)')}>
          {['soleado', 'lluvia', 'viento'].map((c) => (
            <button
              key={c}
              className={`filter-chip cuadrado ${clima === c ? 'activo' : ''}`}
              style={{ background: clima === c ? undefined : 'rgba(255,255,255,.06)', borderColor: clima === c ? undefined : 'rgba(255,255,255,.14)', color: clima === c ? undefined : '#CFE0E4' }}
              onClick={() => setClima(c)}
            >
              {CLIMA_INFO[c].icono} {t(`clima.${c}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mapa-contenedor">
        {!mapaError ? (
          <ErrorBoundaryMapa onError={() => setMapaError(true)}>
            <MapaLeaflet pois={pois_recomendados} onSeleccionar={onSeleccionarPoi} />
          </ErrorBoundaryMapa>
        ) : (
          <div className="mapa-fallback">{t('mapa.error_mapa')}</div>
        )}

        <div className="guide-bubble">
          <span className="guide-avatar"><span className="pico" /></span>
          <div className="guide-bubble-texto">
            <div>
              <b>Fin · guía</b>
              {mensajeFin}
            </div>
            {soportaTts && (
              <button className="btn-mini-tts" aria-label={t('ficha.boton_escuchar', 'Escuchar')} onClick={() => hablar(mensajeFin)}>
                🔊
              </button>
            )}
          </div>
        </div>

        <button className="guide-fab" aria-label="Chat con Fin" onClick={onVerImpacto}>💬</button>
      </div>

      <div className="bottom-sheet-fijo">
        <div className="agarre" />
        <div className="bottom-sheet-header">
          <span className="bottom-sheet-titulo">Recomendadas para vos</span>
          <button className="bottom-sheet-contador" onClick={onVerRuta}>{pois_recomendados.length} paradas →</button>
        </div>

        {pois_recomendados.length === 0 ? (
          <div className="estado-vacio">🔍 No hay actividades disponibles con estos filtros.</div>
        ) : (
          <div className="cards-row">
            {pois_recomendados.map((poi) => {
              const esLocal = poi.tipo === 'MOCK_PRODUCER';
              const esIndoor = poi.tipo_indoor_outdoor === 'indoor';
              const esCerca = poi.distancia_puerto_km <= 0.5;
              return (
                <button key={poi.id} className="activity-card" onClick={() => onSeleccionarPoi(poi)}>
                  <div className="activity-card-foto">
                    <div className="activity-card-badges">
                      {esLocal && <span className="badge badge-local">LOCAL</span>}
                      {esIndoor && <span className="badge badge-indoor">INDOOR</span>}
                      {!esLocal && esCerca && <span className="badge badge-near">CERCA</span>}
                    </div>
                    <span className="activity-card-foto-label">FOTO · {poi.tipo === 'MOCK_PRODUCER' ? 'productor' : 'sitio'}</span>
                  </div>
                  <div className="activity-card-body">
                    <span className="activity-card-categoria">{(poi.intereses?.[0] || poi.tipo).toUpperCase()}</span>
                    <span className="activity-card-nombre">{poi.visitado ? '✓ ' : ''}{poi.nombre}</span>
                    <div className="activity-card-meta">
                      <span>📍 {Math.round((poi.distancia_puerto_km || 0) * 1000)} m</span>
                      <span>⏱ {poi.duracion_min}′</span>
                      <span>{poi.precio_estimado?.monto === 0 ? 'Gratis' : '$$'}</span>
                    </div>
                    {esCerca && (
                      <span className="badge badge-now"><span className="dot" />Disponible ahora</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {(clima === 'lluvia' || clima === 'viento') && (
          <div className="alerta-clima">🌬 El clima no acompaña para actividades al aire libre. Priorizamos opciones indoor.</div>
        )}
      </div>

      <footer className="footer-app">
        <a href="#" onClick={(e) => { e.preventDefault(); onAbrirComerciante(); }}>
          {t('comerciante.link_footer')}
        </a>
      </footer>
    </section>
  );
}

class ErrorBoundaryMapa extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(err) {
    console.warn('Error en mapa', err);
    this.props.onError?.();
  }
  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}
