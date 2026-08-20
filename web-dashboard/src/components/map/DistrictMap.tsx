import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import { SAMPLE_DISTRICTS } from '../../../../shared/sampleDistricts';

// Fix Leaflet default marker icons for Vite/bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DistrictMapProps {
  gpsLat?: number;
  gpsLng?: number;
  gpsAccuracy?: number;
  districtName?: string;
  anomalyScore?: number;
  height?: string;
  showBoundary?: boolean;
}

export const DistrictMap: React.FC<DistrictMapProps> = ({
  gpsLat,
  gpsLng,
  gpsAccuracy = 15,
  districtName = 'Pune',
  anomalyScore = 90,
  height = '280px',
  showBoundary = true
}) => {
  const district = SAMPLE_DISTRICTS[districtName] || SAMPLE_DISTRICTS['Pune'];
  const centerLat = gpsLat || district.center[0];
  const centerLng = gpsLng || district.center[1];

  const isAnomaly = anomalyScore < 50;

  // Custom marker icon based on anomaly score
  const markerIcon = new L.Icon({
    iconUrl: isAnomaly
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={gpsLat && gpsLng ? 12 : 9}
        scrollWheelZoom={false}
        style={{ height, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* District Boundary Polygon */}
        {showBoundary && district.polygonCoordinates && (
          <Polygon
            positions={district.polygonCoordinates}
            pathOptions={{
              color: isAnomaly ? '#DC2626' : '#2563EB',
              fillColor: isAnomaly ? '#FEE2E2' : '#DBEAFE',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '4, 4'
            }}
          >
            <Popup>
              <div className="text-xs font-semibold">
                {district.districtName} District Boundary ({district.stateName})
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Pinpoint Asset GPS Marker */}
        {gpsLat && gpsLng && (
          <>
            <Marker position={[gpsLat, gpsLng]} icon={markerIcon}>
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-slate-900 mb-1">Asset Verification Pin</div>
                  <div>Lat: {gpsLat.toFixed(5)}</div>
                  <div>Lng: {gpsLng.toFixed(5)}</div>
                  <div className="mt-1 text-[10px] text-slate-500">Accuracy: ±{gpsAccuracy}m</div>
                </div>
              </Popup>
            </Marker>

            {/* GPS Accuracy Radius */}
            <Circle
              center={[gpsLat, gpsLng]}
              radius={Math.max(gpsAccuracy, 20)}
              pathOptions={{
                color: isAnomaly ? '#EF4444' : '#10B981',
                fillColor: isAnomaly ? '#EF4444' : '#10B981',
                fillOpacity: 0.15,
                weight: 1
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};
