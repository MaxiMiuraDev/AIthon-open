'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const CENTRO = [-54.809, -68.303];
const PUERTO = [-54.8103, -68.3026];

function divIconPara(poi, numero) {
  const esLocal = poi.tipo === 'MOCK_PRODUCER';
  const claseExtra = poi.visitado ? 'visitado' : '';
  const clase = esLocal ? `marcador-poi local ${claseExtra}` : `marcador-poi ${claseExtra}`;
  const contenido = poi.visitado ? '✓' : numero;
  return L.divIcon({
    html: `<div class="${clase}">${contenido}</div>`,
    className: 'marcador-contenedor',
    iconSize: esLocal ? [30, 30] : [28, 28],
    iconAnchor: esLocal ? [15, 15] : [14, 14],
  });
}

function iconoPuerto() {
  return L.divIcon({
    html: '<div class="marcador-puerto">⚓</div>',
    className: 'marcador-contenedor',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function AjustarVista({ pois }) {
  const map = useMap();
  useEffect(() => {
    if (pois.length === 0) return;
    const bounds = L.latLngBounds(pois.map((p) => [p.lat, p.lng]).concat([PUERTO]));
    try {
      map.fitBounds(bounds.pad(0.25));
    } catch (e) {
      /* ignore */
    }
    setTimeout(() => map.invalidateSize(), 100);
  }, [pois, map]);
  return null;
}

export default function MapaLeaflet({ pois, onSeleccionar }) {
  return (
    <MapContainer center={CENTRO} zoom={16} className="mapa" zoomControl>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
        maxZoom={19}
      />
      <AjustarVista pois={pois} />
      <Marker position={PUERTO} icon={iconoPuerto()} alt="Puerto de Ushuaia" />
      {pois.map((poi, idx) => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lng]}
          icon={divIconPara(poi, idx + 1)}
          eventHandlers={{ click: () => onSeleccionar(poi) }}
          alt={poi.nombre}
        />
      ))}
    </MapContainer>
  );
}
