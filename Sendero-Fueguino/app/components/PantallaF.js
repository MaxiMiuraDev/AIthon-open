'use client';

function sumarMinutos(horaInicio, minutos) {
  const [h, m] = horaInicio.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function PantallaF({ t, ruta, actividades, tiempoDisponibleMin, onSeleccionarPoi, onVolverMapa, onVerImpacto }) {
  const horaInicio = '09:00';
  let cursor = horaInicio;
  let minutosAcumulados = 0;

  const items = ruta.map((poi, idx) => {
    const act = actividades.find((a) => a.poi_id === poi.id);
    const duracion = act?.duracion_visita_min ?? poi.duracion_min;
    const traslado = act?.tiempo_traslado_siguiente_min ?? 10;

    const horaDesde = cursor;
    const horaHasta = sumarMinutos(cursor, duracion);
    cursor = sumarMinutos(horaHasta, traslado);
    minutosAcumulados += duracion + traslado;

    return { poi, horaDesde, horaHasta, duracion, traslado };
  });

  const horaRegreso = ruta.length > 0 ? sumarMinutos(horaInicio, minutosAcumulados) : horaInicio;
  const excedeTiempo = minutosAcumulados > tiempoDisponibleMin;
  const excesoMin = Math.max(0, minutosAcumulados - tiempoDisponibleMin);
  const tiempoLabel = `${Math.round((tiempoDisponibleMin / 60) * 10) / 10}h`;

  return (
    <section className="pantalla-light">
      <div className="status-bar">
        <span>9:41</span>
        <span>5G ▰▰▰</span>
      </div>
      <div className="header-light">
        <button className="btn-circular" onClick={onVolverMapa} aria-label="Atrás">‹</button>
        <span className="paso-label">TU RUTA SUGERIDA</span>
        <span className="btn-circular" style={{ cursor: 'default' }}>↗</span>
      </div>

      {ruta.length === 0 ? (
        <div className="contenido-scroll">
          <div className="cargando" style={{ color: 'var(--text-dark)' }}>{t('ruta.vacio_mensaje')}</div>
        </div>
      ) : (
        <>
          <div className="resumen-ruta-card">
            <div className="info-izq">
              <div className="label-mono">{tiempoLabel.toUpperCase()} DISPONIBLES · {ruta.length} PARADAS</div>
              <div className="titulo">Regreso al puerto {horaRegreso}</div>
            </div>
            <div className="info-der">
              <div className="label-embarque">EMBARQUE</div>
              <div className="hora-embarque">{horaRegreso}</div>
            </div>
          </div>

          <div className="timeline">
            {/* puerto inicio */}
            <div className="timeline-item">
              <div className="timeline-hora">{horaInicio}</div>
              <div className="timeline-rail">
                <span className="timeline-dot puerto">⚓</span>
                <span className="timeline-line" />
              </div>
              <div className="timeline-content">
                <div className="titulo-puerto">Puerto de Ushuaia</div>
                <div className="sub-puerto">🚶 {items[0]?.traslado ? Math.round(items[0].traslado / 2) : 5} min hasta la 1ª parada</div>
              </div>
            </div>

            {items.map(({ poi, horaDesde, horaHasta, duracion, traslado }, idx) => {
              const esLocal = poi.tipo === 'MOCK_PRODUCER';
              const esUltimo = idx === items.length - 1;
              return (
                <div className="timeline-item" key={poi.id}>
                  <div className={`timeline-hora ${esLocal ? 'local' : 'glacier'}`}>{horaDesde}</div>
                  <div className="timeline-rail">
                    <span className={`timeline-dot ${esLocal ? 'local' : ''}`}>{idx + 1}</span>
                    {!esUltimo && <span className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className={`timeline-card ${esLocal ? 'local' : ''}`} onClick={() => onSeleccionarPoi(poi)}>
                      <div className="timeline-card-fila">
                        <div className="categoria">{(poi.intereses?.[0] || poi.tipo).toUpperCase()}</div>
                        {esLocal && <span className="badge badge-local">LOCAL</span>}
                      </div>
                      <div className="nombre">{poi.nombre}</div>
                      <div className="meta">{duracion} min · {horaDesde} – {horaHasta}{!esUltimo ? ` · 🚶 ${traslado} min` : ''}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {excedeTiempo && (
              <div className="timeline-item">
                <div className="timeline-hora" />
                <div className="alerta-tiempo" style={{ flex: 1, marginLeft: 0 }}>
                  <span style={{ fontSize: 15 }}>⚠️</span>
                  <div>
                    <b>{t('ruta.aviso_excede_tiempo')}</b> Esta ruta supera tu tiempo por ~{excesoMin} min. Probá quitar una parada o cambiá a una opción más cercana.
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="timeline-acciones">
        <button className="btn btn-oscuro btn-grande" onClick={onVolverMapa}>▶ Iniciar recorrido</button>
        <button className="btn btn-secundario acento btn-grande" onClick={onVerImpacto}>🏠 {t('ruta.boton_ver_impacto', 'Ver impacto del turismo')}</button>
      </div>
    </section>
  );
}
