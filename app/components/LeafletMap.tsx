"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  sites: {
    id: number;
    name: string;
    lat: number;
    lng: number;
    status: "operational" | "construction" | "planned";
    capacity: number;
    description: string;
    image?: string;
  }[];
  colors: Record<string, string>;
  statusLabels: Record<string, string>;
}

export default function LeafletMap({ sites, colors, statusLabels }: LeafletMapProps) {
  return (
    <MapContainer
      center={[-6.369028, 34.888822]} // Tanzania center
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sites.map((site) => (
        <CircleMarker
          key={site.id}
          center={[site.lat, site.lng]}
          radius={12}
          fillColor={colors[site.status]}
          color={colors[site.status]}
          fillOpacity={0.8}
          stroke={false}
        >
          <Popup>
            <div className="w-56">
              {site.image && (
                <img src={site.image} alt={site.name} className="rounded-md mb-2" />
              )}
              <h3 className="font-bold">{site.name}</h3>
              <p className="text-sm">{site.description}</p>
              <p className="text-xs text-gray-600">Status: {statusLabels[site.status]}</p>
              <p className="text-xs text-gray-600">Capacity: {site.capacity} MW</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
