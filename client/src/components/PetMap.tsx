import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Circle, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './PetMap.css'

// Fix Leaflet default icon bundling issue in Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const currentIcon = L.divIcon({
  className: '',
  html: '<div class="pm-dot pm-dot-current"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const startIcon = L.divIcon({
  className: '',
  html: '<div class="pm-dot pm-dot-start"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})

const homeIcon = L.divIcon({
  className: '',
  html: '<div class="pm-home-pin"><span class="pm-home-emoji">🏠</span></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

export interface Coord {
  latitude: number
  longitude: number
}

interface FitBoundsProps {
  positions: [number, number][]
  showZones: boolean
  fenceOrigin: [number, number]
}

function FitBounds({ positions, showZones, fenceOrigin }: FitBoundsProps) {
  const map = useMap()
  useEffect(() => {
    if (showZones) {
      // Zoom in tight on the geofence so the 20 m circle is clearly visible.
      // At zoom 18 the viewport is ~150 m wide, making 20 m take up ~25% of the width.
      map.setView(fenceOrigin, 18)
    } else if (positions.length > 1) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])))
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 17 })
    } else if (positions.length === 1) {
      map.setView(positions[0], 17)
    }
  }, [map, positions, showZones, fenceOrigin])
  return null
}

// Haversine distance in metres — used to determine if pet is inside geofence
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const SAFE_ZONE_RADIUS_M = 20

interface Props {
  center: Coord      // pet's current position — always shown as a marker
  home?: Coord       // geofence origin; falls back to center when omitted
  path?: Coord[]     // historical trail; omit or leave empty to hide the path
  height?: number
  showZones?: boolean
  showPath?: boolean // draw the historical polyline + start marker (default true)
}

export default function PetMap({
  center,
  home,
  path = [],
  height = 220,
  showZones = true,
  showPath = true,
}: Props) {
  const toLL = (c: Coord): [number, number] => [c.latitude, c.longitude]
  const positions    = path.map(toLL)
  const fenceOrigin: Coord = home ?? center

  const distFromHome = haversineM(
    fenceOrigin.latitude, fenceOrigin.longitude,
    center.latitude,      center.longitude,
  )
  const insideSafeZone = distFromHome <= SAFE_ZONE_RADIUS_M

  return (
    <div className="pet-map-wrap" style={{ height }}>
      <MapContainer
        center={toLL(center)}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        <FitBounds positions={positions} showZones={showZones} fenceOrigin={toLL(fenceOrigin)} />

        {/* 20 m geofence circle centred on home */}
        {showZones && (
          <Circle
            center={toLL(fenceOrigin)}
            radius={SAFE_ZONE_RADIUS_M}
            pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.15, weight: 2 }}
          />
        )}

        {/* Historical trail — only when showPath */}
        {showPath && positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: '#2E86C1', weight: 3, opacity: 0.85, lineJoin: 'round', lineCap: 'round' }}
          />
        )}

        {/* Trail start marker — only when showPath */}
        {showPath && positions.length > 1 && (
          <Marker position={positions[0]} icon={startIcon} />
        )}

        {/* Current position — always visible */}
        <Marker position={toLL(center)} icon={currentIcon} />

        {/* Home / geofence-origin marker */}
        {showZones && (
          <Marker position={toLL(fenceOrigin)} icon={homeIcon} />
        )}
      </MapContainer>

      {showZones && (
        <div className={`pm-fence-badge ${insideSafeZone ? 'pm-fence-in' : 'pm-fence-out'}`}>
          {insideSafeZone
            ? '✓ Inside safe zone'
            : `⚠ Outside safe zone · ${Math.round(distFromHome)} m from home`}
        </div>
      )}

      <div className="pm-legend">
        {showPath && positions.length > 1 && (
          <span className="pm-legend-item"><span className="pm-ld pm-ld-start" />Start</span>
        )}
        <span className="pm-legend-item"><span className="pm-ld pm-ld-current" />Pet</span>
        {showZones && (
          <span className="pm-legend-item"><span className="pm-ld pm-ld-safe" />20 m safe zone</span>
        )}
      </div>
    </div>
  )
}
