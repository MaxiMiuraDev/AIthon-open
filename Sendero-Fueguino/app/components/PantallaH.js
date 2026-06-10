'use client';

import { useEffect, useState } from 'react';

const RUBROS = ['Gastronomía', 'Artesanías', 'Indumentaria', 'Talleres', 'Otro'];
const STORAGE_KEY = 'sendero_comerciantes_offline';

export default function PantallaH({ t, onVolver }) {
  const [nombre, setNombre] = useState('');
  const [rubro, setRubro] = useState('');
  const [modalidad, setModalidad] = useState('Indoor');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('');
  const [cupos, setCupos] = useState('');
  const [idiomas, setIdiomas] = useState(['es']);
  const [contacto, setContacto] = useState('');
  const [horario, setHorario] = useState('');
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [lista, setLista] = useState([]);

  useEffect(() => {
    cargarLista();
  }, []);

  async function cargarLista() {
    try {
      const res = await fetch('/data/comerciantes.json');
      const data = await res.json();
      const offline = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setLista([...data.filter((c) => c.creado_via_panel), ...offline]);
    } catch (e) {
      const offline = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setLista(offline);
    }
  }

  function toggleIdioma(code) {
    setIdiomas((prev) => (prev.includes(code) ? prev.filter((i) => i !== code) : [...prev, code]));
  }

  function validar() {
    const err = {};
    if (!nombre.trim()) err.nombre = true;
    if (!rubro) err.rubro = true;
    setErrores(err);
    return Object.keys(err).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    setMensaje('');

    const nuevo = { nombre, rubro, modalidad, descripcion, precio, duracion, cupos, idiomas, contacto, horario };

    try {
      const res = await fetch('/api/comerciante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      });
      if (!res.ok) throw new Error('fallo servidor');
      setMensaje(t('comerciante.exito', '¡Listo! Tu emprendimiento fue agregado.'));
    } catch (e) {
      const offline = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      offline.push({ ...nuevo, id: `LOCAL_${Date.now()}`, creado_via_panel: true });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offline));
      setMensaje(t('comerciante.modo_offline', 'Modo demo: esto no se guarda en el servidor, pero podés verlo acá abajo.'));
    }

    setEnviando(false);
    setNombre('');
    setRubro('');
    setDescripcion('');
    setPrecio('');
    setDuracion('');
    setCupos('');
    setContacto('');
    setHorario('');
    cargarLista();
  }

  return (
    <section className="pantalla-comerciante">
      <div className="status-bar" style={{ color: 'var(--text-dark)' }}>
        <span>9:41</span>
        <span>5G ▰▰▰</span>
      </div>
      <div className="header-comerciante">
        <div className="header-light" style={{ padding: 0 }}>
          <button className="btn-circular" onClick={onVolver} aria-label="Atrás">‹</button>
          <span className="paso-label label-mono">PANEL COMERCIANTE</span>
          <span style={{ width: 38, height: 38 }} />
        </div>
        <div className="titulo-comerciante">{t('comerciante.titulo', 'Cargá tu experiencia')}</div>
        <div className="subtitulo-comerciante">{t('comerciante.nota_demo', 'Sumá tu comercio local al recorrido alternativo.')}</div>
      </div>

      <form className="form-comerciante" onSubmit={enviar}>
        <div className="campo">
          <span className="campo-label">{t('comerciante.label_nombre', 'NOMBRE DEL COMERCIO / EXPERIENCIA').toUpperCase()}</span>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={errores.nombre ? 'invalido' : ''}
            placeholder="Ej: Taller Lenga Cerámica"
          />
          {errores.nombre && <div className="error-campo">Campo obligatorio</div>}
        </div>

        <div className="campo-fila">
          <div className="campo">
            <span className="campo-label">{t('comerciante.label_rubro', 'CATEGORÍA').toUpperCase()}</span>
            <select value={rubro} onChange={(e) => setRubro(e.target.value)} className={errores.rubro ? 'invalido' : ''}>
              <option value="">--</option>
              {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errores.rubro && <div className="error-campo">Campo obligatorio</div>}
          </div>
          <div className="campo medio">
            <span className="campo-label">MODALIDAD</span>
            <div className="segmented">
              <button type="button" className={modalidad === 'Indoor' ? 'activo' : ''} onClick={() => setModalidad('Indoor')}>Indoor</button>
              <button type="button" className={modalidad === 'Outdoor' ? 'activo' : ''} onClick={() => setModalidad('Outdoor')}>Outdoor</button>
            </div>
          </div>
        </div>

        <div className="campo">
          <span className="campo-label">
            {t('comerciante.label_descripcion', 'DESCRIPCIÓN BREVE').toUpperCase()}
            <span className="contador-caracteres">{descripcion.length} / 160</span>
          </span>
          <textarea
            maxLength={160}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Contá brevemente de qué se trata tu experiencia"
          />
        </div>

        <div className="campo-fila">
          <div className="campo">
            <span className="campo-label">PRECIO</span>
            <input type="text" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="ARS 9.000" />
          </div>
          <div className="campo">
            <span className="campo-label">DURACIÓN</span>
            <input type="text" value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="45 min" />
          </div>
          <div className="campo estrecho">
            <span className="campo-label">CUPOS</span>
            <input type="text" value={cupos} onChange={(e) => setCupos(e.target.value)} placeholder="6" />
          </div>
        </div>

        <div className="campo-fila">
          <div className="campo">
            <span className="campo-label">IDIOMAS</span>
            <div className="idiomas-chips">
              {['es', 'en', 'pt'].map((code) => (
                <button
                  type="button"
                  key={code}
                  className={`idioma-chip ${idiomas.includes(code) ? 'activo' : ''}`}
                  onClick={() => toggleIdioma(code)}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="campo">
            <span className="campo-label">FOTO</span>
            <div className="foto-upload">＋ Subir</div>
          </div>
        </div>

        <div className="campo">
          <span className="campo-label">{t('comerciante.label_contacto', 'CONTACTO').toUpperCase()}</span>
          <input type="text" value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Teléfono o Instagram" />
        </div>

        <div className="campo">
          <span className="campo-label">{t('comerciante.label_horario', 'HORARIO DE ATENCIÓN').toUpperCase()}</span>
          <input type="text" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="10:00 - 20:00" />
        </div>

        <div className="publicar-sticky">
          <button type="submit" className="btn btn-warm btn-grande" disabled={enviando}>
            {enviando ? t('comerciante.boton_enviando', 'Enviando...') : t('comerciante.boton_enviar', 'Publicar experiencia')}
          </button>
          {mensaje && <p className="nota-pequenia" style={{ padding: 0, textAlign: 'center', marginTop: 8 }}>{mensaje}</p>}
        </div>
      </form>

      <div className="lista-titulo">{t('comerciante.lista_titulo', 'Emprendimientos sumados hoy')}</div>
      <div className="lista-comerciantes">
        {lista.length === 0 && <p className="nota-pequenia" style={{ padding: 0 }}>{t('comerciante.lista_vacia')}</p>}
        {lista.map((c) => (
          <div key={c.id} className="tarjeta-comerciante">
            <div className="tarjeta-comerciante-nombre">{c.nombre}</div>
            <div className="tarjeta-comerciante-rubro">{c.rubro}</div>
            {c.descripcion && <div style={{ fontSize: 13, marginTop: 4 }}>{c.descripcion}</div>}
          </div>
        ))}
      </div>

      <button className="btn-texto" onClick={onVolver} style={{ margin: '0 22px 24px' }}>{t('ruta.boton_volver_mapa', 'Volver al mapa')}</button>
    </section>
  );
}
