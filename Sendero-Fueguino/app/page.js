'use client';

import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../lib/useI18n';
import { useTts } from '../lib/useTts';
import { recomendar } from '../lib/finEngine';

import PantallaA from './components/PantallaA';
import PantallaC from './components/PantallaC';
import PantallaD from './components/PantallaD';
import FichaActividad from './components/FichaActividad';
import PantallaF from './components/PantallaF';
import PantallaG from './components/PantallaG';
import PantallaH from './components/PantallaH';

const STORAGE_KEY = 'sendero_fueguino_estado';

function cargarEstadoGuardado() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

export default function Home() {
  const guardado = useMemo(cargarEstadoGuardado, []);

  const [pantalla, setPantalla] = useState('a');
  const [pantallaPrevia, setPantallaPrevia] = useState('d');

  const [idioma, setIdioma] = useState(guardado?.idioma || 'es');
  const [tiempoMin, setTiempoMin] = useState(guardado?.tiempo_disponible_min || null);
  const [intereses, setIntereses] = useState(guardado?.intereses || []);
  const [accesibilidad, setAccesibilidad] = useState(guardado?.accesibilidad || []);
  const [presupuesto, setPresupuesto] = useState(guardado?.presupuesto || 'Bajo');

  const [pois, setPois] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [clima, setClima] = useState('soleado');
  const [cargandoRecomendacion, setCargandoRecomendacion] = useState(false);

  const [poisRecomendados, setPoisRecomendados] = useState([]);
  const [mensajeFin, setMensajeFin] = useState('');
  const [poiSeleccionado, setPoiSeleccionado] = useState(null);
  const [rutaIds, setRutaIds] = useState(guardado?.ruta_ids || []);
  const [errorPois, setErrorPois] = useState(false);

  const { t, listo: i18nListo } = useI18n(idioma);
  const { soportado: soportaTts, hablando, hablar, pausar } = useTts();

  // Carga inicial de datos
  useEffect(() => {
    fetch('/data/pois.json')
      .then((r) => {
        if (!r.ok) throw new Error('no pois');
        return r.json();
      })
      .then((data) => setPois(data.map((p) => ({ ...p, visitado: false }))))
      .catch(() => setErrorPois(true));

    fetch('/data/actividades.json')
      .then((r) => r.json())
      .then(setActividades)
      .catch(() => setActividades([]));

    fetch('/api/clima')
      .then((r) => r.json())
      .then((data) => setClima(data.escenario_activo || 'soleado'))
      .catch(() => {});
  }, []);

  // Persistir estado en localStorage
  useEffect(() => {
    if (!tiempoMin) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      idioma,
      tiempo_disponible_min: tiempoMin,
      intereses,
      accesibilidad,
      presupuesto,
      ruta_ids: rutaIds,
    }));
  }, [idioma, tiempoMin, intereses, accesibilidad, presupuesto, rutaIds]);

  function ejecutarMotor() {
    if (pois.length === 0) return;
    const preferencias = {
      accesibilidad_requerida: accesibilidad.includes('silla_ruedas'),
      intereses,
      tiempo_disponible_min: tiempoMin || 240,
    };
    const template = t('fin_mensajes.saludo_template');
    const { pois_recomendados, mensaje_fin, fallback_usado } = recomendar(preferencias, clima, pois, template);
    setPoisRecomendados(pois_recomendados.map((p) => ({
      ...p,
      visitado: rutaIds.includes(p.id) ? p.visitado : p.visitado,
    })));
    setMensajeFin(fallback_usado ? t('mapa.vacio_mensaje') : mensaje_fin);
  }

  // Re-ejecutar motor cuando cambia el clima (estando en pantalla D) o al entrar a D
  useEffect(() => {
    if (pantalla === 'd' && pois.length > 0 && i18nListo) {
      ejecutarMotor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clima, pantalla, pois, i18nListo]);

  function handleContinuarA() {
    setPantalla('c');
  }

  async function handleVerRecorrido() {
    setCargandoRecomendacion(true);
    await new Promise((r) => setTimeout(r, 1200));
    if (errorPois) {
      // fallback: usar todos los POIs sin filtrar
      setPoisRecomendados(pois);
      setMensajeFin(t('mapa.error_mapa'));
    } else {
      ejecutarMotor();
    }
    setCargandoRecomendacion(false);
    setPantalla('d');
  }

  function handleSeleccionarPoi(poi) {
    setPoiSeleccionado(poi);
  }

  function handleCerrarFicha() {
    pausar();
    setPoiSeleccionado(null);
  }

  function handleToggleRuta(poi) {
    setRutaIds((prev) => {
      const yaEsta = prev.includes(poi.id);
      const nuevo = yaEsta ? prev.filter((id) => id !== poi.id) : [...prev, poi.id];
      return nuevo;
    });
    // marcar como visitado al agregarlo a la ruta
    setPois((prev) => prev.map((p) => (p.id === poi.id ? { ...p, visitado: true } : p)));
    setPoisRecomendados((prev) => prev.map((p) => (p.id === poi.id ? { ...p, visitado: true } : p)));
  }

  function irAMapa() {
    setPantalla('d');
  }

  function irAImpacto(origen) {
    setPantallaPrevia(origen);
    setPantalla('g');
  }

  const ruta = poisRecomendados.filter((p) => rutaIds.includes(p.id));
  const visitadosCount = poisRecomendados.filter((p) => p.visitado).length;

  if (!i18nListo) {
    return <div className="cargando">Cargando…</div>;
  }

  return (
    <main>
      {pantalla === 'a' && (
        <PantallaA
          t={t}
          idioma={idioma}
          setIdioma={setIdioma}
          tiempoMin={tiempoMin}
          setTiempoMin={setTiempoMin}
          onContinuar={handleContinuarA}
        />
      )}

      {pantalla === 'c' && (
        <PantallaC
          t={t}
          intereses={intereses}
          setIntereses={setIntereses}
          accesibilidad={accesibilidad}
          setAccesibilidad={setAccesibilidad}
          presupuesto={presupuesto}
          setPresupuesto={setPresupuesto}
          cargando={cargandoRecomendacion}
          onAtras={() => setPantalla('a')}
          onVer={handleVerRecorrido}
        />
      )}

      {pantalla === 'd' && (
        <PantallaD
          t={t}
          idioma={idioma}
          pois={pois}
          pois_recomendados={poisRecomendados}
          mensajeFin={mensajeFin}
          visitadosCount={visitadosCount}
          totalCount={pois.length}
          clima={clima}
          setClima={setClima}
          tiempoMin={tiempoMin}
          onSeleccionarPoi={handleSeleccionarPoi}
          onVerRuta={() => setPantalla('f')}
          onVerImpacto={() => irAImpacto('d')}
          onCambiarIdioma={() => setPantalla('a')}
          onCambiarPreferencias={() => setPantalla('c')}
          onAbrirComerciante={() => setPantalla('h')}
          hablar={(texto) => hablar(texto, idioma)}
          soportaTts={soportaTts}
        />
      )}

      {pantalla === 'f' && (
        <PantallaF
          t={t}
          ruta={ruta}
          actividades={actividades}
          tiempoDisponibleMin={tiempoMin || 240}
          onSeleccionarPoi={handleSeleccionarPoi}
          onVolverMapa={irAMapa}
          onVerImpacto={() => irAImpacto('f')}
        />
      )}

      {pantalla === 'g' && (
        <PantallaG t={t} onVolver={() => setPantalla(pantallaPrevia === 'f' ? 'f' : 'd')} />
      )}

      {pantalla === 'h' && (
        <PantallaH t={t} onVolver={irAMapa} />
      )}

      {poiSeleccionado && (
        <FichaActividad
          t={t}
          poi={poiSeleccionado}
          actividad={actividades.find((a) => a.poi_id === poiSeleccionado.id)}
          enRuta={rutaIds.includes(poiSeleccionado.id)}
          onCerrar={handleCerrarFicha}
          onToggleRuta={handleToggleRuta}
          hablar={(texto) => hablar(texto, idioma)}
          pausar={pausar}
          hablando={hablando}
          soportaTts={soportaTts}
        />
      )}
    </main>
  );
}
