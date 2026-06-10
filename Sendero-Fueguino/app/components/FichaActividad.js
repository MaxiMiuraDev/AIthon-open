'use client';

export default function FichaActividad({ t, poi, actividad, enRuta, onCerrar, onToggleRuta, hablar, pausar, hablando, soportaTts }) {
  if (!poi) return null;

  const esLocal = poi.tipo === 'MOCK_PRODUCER';
  const esIndoor = poi.tipo_indoor_outdoor === 'indoor';
  const esCerca = poi.distancia_puerto_km <= 0.5;
  const accesibilidadTexto = t(`ficha.accesibilidad_valores.${poi.accesibilidad}`, poi.accesibilidad);
  const horario = actividad ? `${actividad.horario_apertura} - ${actividad.horario_cierre}` : t('ficha.no_disponible');
  const distanciaM = Math.round((poi.distancia_puerto_km || 0) * 1000);
  const minCaminata = Math.max(1, Math.round((poi.distancia_puerto_km || 0) * 12));
  const precioTexto = poi.precio_estimado?.monto === 0
    ? 'Gratis'
    : `$$ · ~${poi.precio_estimado?.moneda || 'ARS'} ${poi.precio_estimado?.monto?.toLocaleString('es-AR') || '—'}`;

  return (
    <div className="overlay" onClick={onCerrar}>
      <div className="ficha-detalle" onClick={(e) => e.stopPropagation()}>
        <div className="ficha-foto">
          <div className="ficha-foto-degrade" />
          <div className="status-bar" style={{ position: 'relative', color: '#fff' }}>
            <span>9:41</span>
            <span>5G ▰▰▰</span>
          </div>
          <div className="ficha-foto-acciones">
            <button className="btn-circular-flotante" onClick={onCerrar} aria-label={t('ficha.boton_cerrar', 'Cerrar')}>‹</button>
            <button className="btn-circular-flotante" aria-label="Favorito">♥</button>
          </div>
          <span className="ficha-foto-label">FOTO · {poi.nombre.toLowerCase()}</span>
          <div className="ficha-foto-badges">
            {esLocal && <span className="badge badge-local">LOCAL</span>}
            {esIndoor && <span className="badge badge-indoor">INDOOR</span>}
            {esCerca && <span className="badge badge-indoor">CERCA DEL PUERTO</span>}
          </div>
        </div>

        <div className="ficha-contenido">
          {esLocal && <div className="badge-mock">{t('ficha.badge_mock')}</div>}

          <div>
            <span className="ficha-categoria">{(poi.intereses?.[0] || poi.tipo).toUpperCase()}</span>
            <div className="ficha-nombre">{poi.nombre}</div>
            <div className="ficha-subnombre">{esLocal ? 'Emprendimiento local · Ushuaia centro' : 'Sitio histórico · Ushuaia centro'}</div>
          </div>

          <div className="grilla-datos">
            <div className="dato-card">
              <div className="label">⏱ {t('ficha.duracion_label')}</div>
              <div className="valor">{poi.duracion_min} min</div>
            </div>
            <div className="dato-card">
              <div className="label">📍 {t('ficha.distancia_label')}</div>
              <div className="valor">{distanciaM} m · {minCaminata}′</div>
            </div>
            <div className="dato-card">
              <div className="label">💰 {t('ficha.precio_label')}</div>
              <div className="valor">{precioTexto}</div>
            </div>
            <div className="dato-card">
              <div className="label">♿ {t('ficha.accesibilidad_label')}</div>
              <div className="valor">{accesibilidadTexto}</div>
            </div>
            <div className="dato-card">
              <div className="label">🗣 {t('ficha.idioma_label')}</div>
              <div className="valor">{(poi.idiomas_disponibles || []).join(' · ').toUpperCase()}</div>
            </div>
            <div className="dato-card">
              <div className="label">🎟 Cupos hoy</div>
              <div className="valor exito">Disponible</div>
            </div>
          </div>

          <p className="ficha-texto">{poi.texto}</p>

          <div className="ficha-tags">
            <span className="tag-pill">🕒 {horario}</span>
            {esIndoor && <span className="tag-pill acento">🏠 Indoor</span>}
          </div>

          {esLocal ? (
            <p className="ficha-mock-nota">{t('ficha.mock_nota')}</p>
          ) : (
            poi.fuente && <p className="ficha-fuente">{t('ficha.fuente_label', 'Fuente:')} {poi.fuente}</p>
          )}

          {!soportaTts && <p className="nota-pequenia" style={{ padding: 0 }}>{t('ficha.tts_no_soportado')}</p>}
        </div>

        <div className="ficha-acciones">
          <button className="btn btn-oscuro btn-grande" onClick={() => onToggleRuta(poi)}>
            {enRuta ? `✓ ${t('ficha.boton_quitar_ruta', 'Quitar de mi ruta')}` : `＋ ${t('ficha.boton_agregar_ruta', 'Agregar a mi ruta')}`}
          </button>
          <div className="fila-botones horizontal">
            <button className="btn btn-secundario acento" style={{ flex: 1 }}>📍 Cómo llegar</button>
            {soportaTts ? (
              <button className="btn btn-secundario" style={{ flex: 1 }} onClick={() => (hablando ? pausar() : hablar(poi.texto))}>
                {hablando ? `⏸ ${t('ficha.boton_pausar', 'Pausar')}` : `🔊 ${t('ficha.boton_escuchar', 'Escuchar')}`}
              </button>
            ) : (
              <button className="btn btn-secundario" style={{ flex: 1 }}>💬 Consultar al guía</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
