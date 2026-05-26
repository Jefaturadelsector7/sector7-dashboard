import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fijar iconos de Leaflet (necesario en React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapaMatamoros() {
  // Coordenadas de Heroica Matamoros, Tamaulipas
  const posicionCentral = [25.8717, -97.5049];

  // Ubicaciones clave en Matamoros (puedes agregar más)
  const ubicaciones = [
    {
      id: 1,
      nombre: 'Centro de Matamoros',
      lat: 25.8717,
      lng: -97.5049,
      descripcion: 'Centro de la ciudad'
    },
    {
      id: 2,
      nombre: 'Puente Internacional',
      lat: 25.9131,
      lng: -97.4341,
      descripcion: 'Acceso fronterizo principal'
    },
    {
      id: 3,
      nombre: 'Avenida 5 de Mayo',
      lat: 25.8734,
      lng: -97.5111,
      descripcion: 'Zona comercial principal'
    }
  ];

  return (
    <div style={{ width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={posicionCentral} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {ubicaciones.map((ubicacion) => (
          <Marker key={ubicacion.id} position={[ubicacion.lat, ubicacion.lng]}>
            <Popup>
              <div>
                <strong>{ubicacion.nombre}</strong>
                <p style={{ margin: '5px 0' }}>{ubicacion.descripcion}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
