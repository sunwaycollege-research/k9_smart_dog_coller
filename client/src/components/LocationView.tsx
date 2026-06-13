import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Home, MapPin, CheckCircle, Loader, Edit2, AlertCircle } from 'lucide-react'
import PetMap from './PetMap'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setHomeCoord } from '../store/slices/authSlice'
import { useSetHomeMutation } from '../store/apiSlice'
import './LocationView.css'

import type { PetAttributes } from '../store/apiSlice'

// ── Fix Leaflet icon in Vite (shared with PetMap) ────────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const homePinIcon = L.divIcon({
  className: '',
  html: `<div class="lv-home-pin">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
         fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 36],
})

// ── Click-to-place helper ─────────────────────────────────────────────────────

interface PlacerProps {
  onPlace: (lat: number, lng: number) => void
}

function MapClickPlacer({ onPlace }: PlacerProps) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LocationViewProps {
  attributes?: PetAttributes | null
}

export default function LocationView({ attributes }: LocationViewProps) {
  const petCenter = attributes?.coordinates ?? { latitude: 27.705578, longitude: 85.334061 }
  const petPath = attributes?.history?.map(h => ({
    latitude: h.coordinates.latitude,
    longitude: h.coordinates.longitude,
  })) ?? [
    { latitude: 27.704578, longitude: 85.333061 },
    { latitude: 27.705078, longitude: 85.333561 },
    { latitude: 27.705578, longitude: 85.334061 },
  ]

  const dispatch   = useAppDispatch()
  const user       = useAppSelector(s => s.auth.user)
  const [setHome, { isLoading }] = useSetHomeMutation()

  const storedHome = user?.home?.coordinates ?? null

  // pending pin — set by clicking on the placement map
  const [pendingPin, setPendingPin] = useState<{ latitude: number; longitude: number } | null>(null)
  const [editing,    setEditing]    = useState(!storedHome)   // open panel if no home yet
  const [error,      setError]      = useState<string | null>(null)
  const [saved,      setSaved]      = useState(false)

  const handlePlace = useCallback((lat: number, lng: number) => {
    setPendingPin({ latitude: lat, longitude: lng })
    setSaved(false)
    setError(null)
  }, [])

  const handleSave = async () => {
    if (!pendingPin) return
    setError(null)
    try {
      await setHome(pendingPin).unwrap()
      dispatch(setHomeCoord(pendingPin))
      setSaved(true)
      setEditing(false)
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message
      setError(msg ?? 'Failed to save home location')
    }
  }

  const activeHome = pendingPin ?? storedHome

  return (
    <div className="lv-root">
      {/* ── Top live-tracking map ────────────────────────────────────── */}
      <div className="lv-section">
        <div className="lv-section-header">
          <MapPin size={16} className="lv-icon" />
          <h3>Live location</h3>
        </div>
        <PetMap
          center={petCenter}
          home={storedHome ?? undefined}
          path={petPath}
          height={260}
          showZones={!!storedHome}
          showPath
        />
      </div>

      {/* ── Home setup / edit panel ──────────────────────────────────── */}
      <div className="lv-section">
        <div className="lv-section-header">
          <Home size={16} className="lv-icon" />
          <h3>Home location</h3>
          {storedHome && !editing && (
            <button className="lv-edit-btn" onClick={() => { setEditing(true); setPendingPin(null) }}>
              <Edit2 size={13} /> Edit
            </button>
          )}
        </div>

        {/* Status chip when home is set and not editing */}
        {storedHome && !editing && (
          <div className="lv-home-set-chip">
            <CheckCircle size={15} className="lv-chip-icon" />
            Home is set · {storedHome.latitude.toFixed(5)}, {storedHome.longitude.toFixed(5)}
          </div>
        )}

        {/* Placement panel */}
        {editing && (
          <div className="lv-placement-panel">
            <p className="lv-hint">
              <MapPin size={13} /> Tap anywhere on the map to drop your home pin
            </p>

            <div className="lv-placement-map">
              <MapContainer
                center={storedHome ? [storedHome.latitude, storedHome.longitude] : [petCenter.latitude, petCenter.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <MapClickPlacer onPlace={handlePlace} />

                {activeHome && (
                  <>
                    <Marker
                      position={[activeHome.latitude, activeHome.longitude]}
                      icon={homePinIcon}
                    />
                    <Circle
                      center={[activeHome.latitude, activeHome.longitude]}
                      radius={40}
                      pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.18, weight: 2 }}
                    />
                  </>
                )}
              </MapContainer>
            </div>

            {pendingPin && (
              <div className="lv-coord-preview">
                <MapPin size={13} /> {pendingPin.latitude.toFixed(6)}, {pendingPin.longitude.toFixed(6)}
              </div>
            )}

            {error && (
              <div className="lv-error">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="lv-actions">
              {storedHome && (
                <button className="lv-cancel-btn" onClick={() => { setEditing(false); setPendingPin(null) }}>
                  Cancel
                </button>
              )}
              <button
                className="lv-save-btn"
                onClick={handleSave}
                disabled={!pendingPin || isLoading}
              >
                {isLoading
                  ? <><Loader size={14} className="lv-spin" /> Saving…</>
                  : <><CheckCircle size={14} /> Confirm home location</>}
              </button>
            </div>
          </div>
        )}

        {saved && (
          <div className="lv-success">
            <CheckCircle size={14} /> Home location saved!
          </div>
        )}
      </div>
    </div>
  )
}
