import { useEffect, useRef } from 'react'

// Kathmandu coords as demo dog location
const DOG_LAT = 27.7172
const DOG_LNG = 85.3240

const GOLD = '#C9A84C'

export default function PawtrackMiniMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    // Dynamically import to avoid SSR issues
    import('leaflet').then(L => {
      if (mapRef.current || !containerRef.current) return

      // Fix default marker icon path (Vite asset issue)
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center:          [DOG_LAT, DOG_LNG],
        zoom:            14,
        zoomControl:     false,
        attributionControl: false,
        dragging:        false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom:       false,
        keyboard:        false,
      })

      mapRef.current = map

      // Dark map tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      ).addTo(map)

      // Pulsing dog marker using a DivIcon
      const pulsingIcon = L.divIcon({
        className: '',
        iconSize:  [32, 32],
        iconAnchor:[16, 16],
        html: `
          <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
            <div style="
              position:absolute;
              width:40px;height:40px;
              border-radius:50%;
              background:${GOLD}30;
              animation:pawPulse 2s ease-out infinite;
              top:50%;left:50%;
              transform:translate(-50%,-50%);
            "></div>
            <div style="
              width:16px;height:16px;
              border-radius:50%;
              background:${GOLD};
              border:2.5px solid #fff;
              box-shadow:0 0 12px ${GOLD}99;
              position:relative;z-index:1;
            "></div>
          </div>
        `,
      })

      L.marker([DOG_LAT, DOG_LNG], { icon: pulsingIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Outfit,sans-serif;color:#fff;background:#1a1a1a;padding:6px 10px;border-radius:8px;border:1px solid ${GOLD}40;font-size:12px;font-weight:700;">
            🐾 Buddy &nbsp;<span style="color:${GOLD}">Live</span>
          </div>`,
          { className: 'paw-popup', closeButton: false }
        )
        .openPopup()

      // Safe zone circle
      L.circle([DOG_LAT, DOG_LNG], {
        radius:      400,
        color:       GOLD,
        fillColor:   GOLD,
        fillOpacity: 0.06,
        weight:      1.5,
        dashArray:   '6 4',
      }).addTo(map)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <>
      {/* Inject leaflet CSS + pulse keyframes */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        @keyframes pawPulse {
          0%   { transform:translate(-50%,-50%) scale(1);   opacity:0.7; }
          100% { transform:translate(-50%,-50%) scale(2.8); opacity:0;   }
        }
        .paw-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .paw-popup .leaflet-popup-tip-container { display:none; }
        .paw-popup .leaflet-popup-content { margin:0 !important; }
      `}</style>

      <div
        ref={containerRef}
        style={{
          width:        '100%',
          height:       '100%',
          borderRadius: 'inherit',
          overflow:     'hidden',
        }}
      />
    </>
  )
}
