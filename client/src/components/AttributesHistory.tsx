import { useState } from 'react'
import { Activity, Thermometer, BatteryFull, MapPin, ArrowLeft, Route, ChevronLeft, ChevronRight } from 'lucide-react'
import petData from '../assets/data/mock_api_pet_arrtibutes.json'
import PetMap from './PetMap'
import './AttributesHistory.css'

type StatusFilter = 'all' | 'active' | 'resting' | 'sleeping'

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  active:   { color: '#2E86C1', bg: '#E8F4FD' },
  resting:  { color: '#d97706', bg: '#fef3c7' },
  sleeping: { color: '#7c3aed', bg: '#ede9fe' },
}

const HR_NORMAL  = [50, 120]
const TMP_NORMAL = [37.5, 39.2]

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

function calcTotalDistance(entries: typeof petData.history): number {
  return entries.slice(1).reduce((total, h, i) => {
    const prev = entries[i]
    return (
      total +
      haversineM(
        prev.coordinates.latitude,
        prev.coordinates.longitude,
        h.coordinates.latitude,
        h.coordinates.longitude
      )
    )
  }, 0)
}

function fmtDist(meters: number): string {
  if (meters < 10)   return '0 m'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

// Group history entries by date string (YYYY-MM-DD)
const grouped: Record<string, typeof petData.history> = {}
petData.history.forEach(h => {
  const date = h.time.split('T')[0]
  if (!grouped[date]) grouped[date] = []
  grouped[date].push(h)
})

// Sorted most-recent-first
const DATES = Object.keys(grouped).sort().reverse()
const DAY_LABELS = ['Today', 'Yesterday', 'Day Before']

interface Props {
  onBack: () => void
}

export default function AttributesHistory({ onBack }: Props) {
  const [dayIdx, setDayIdx] = useState(0)
  const [filter, setFilter] = useState<StatusFilter>('all')

  const currentDate = DATES[dayIdx]
  const dayData     = grouped[currentDate] ?? []
  const filtered    = filter === 'all' ? dayData : dayData.filter(h => h.status === filter)

  const distance = calcTotalDistance(dayData)
  const avgHR    = dayData.length
    ? Math.round(dayData.reduce((s, h) => s + h.heartRate, 0) / dayData.length)
    : 0
  const avgTemp  = dayData.length
    ? (dayData.reduce((s, h) => s + h.temperature, 0) / dayData.length).toFixed(1)
    : '—'

  const mapPath   = dayData.map(h => h.coordinates)
  const mapCenter = dayData[dayData.length - 1]?.coordinates ?? petData.coordinates

  const fmtDate = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })

  const fmtShort = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="ah-page">
      {/* Header */}
      <div className="ah-header">
        <button className="ah-back" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="ah-title-group">
          <h2>Attributes History</h2>
          <p>{petData.history.length} total readings · {DATES.length} days tracked</p>
        </div>
      </div>

      {/* Day tabs */}
      <div className="day-tabs-wrap">
        <button
          className="day-nav-btn"
          onClick={() => { setDayIdx(i => Math.min(i + 1, DATES.length - 1)); setFilter('all') }}
          disabled={dayIdx >= DATES.length - 1}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="day-tabs">
          {DATES.map((d, i) => {
            const dist = calcTotalDistance(grouped[d] ?? [])
            return (
              <button
                key={d}
                className={`day-tab${dayIdx === i ? ' active' : ''}`}
                onClick={() => { setDayIdx(i); setFilter('all') }}
              >
                <span className="day-tab-label">{DAY_LABELS[i] ?? d}</span>
                <span className="day-tab-date">{fmtShort(d)}</span>
                <span className="day-tab-dist">
                  <Route size={10} strokeWidth={2} />
                  {fmtDist(dist)}
                </span>
              </button>
            )
          })}
        </div>

        <button
          className="day-nav-btn"
          onClick={() => { setDayIdx(i => Math.max(i - 1, 0)); setFilter('all') }}
          disabled={dayIdx <= 0}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day summary cards */}
      <div className="day-summary">
        <div className="dsc dsc-highlight">
          <div className="dsc-icon" style={{ background: '#E8F4FD', color: '#2E86C1' }}>
            <Route size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div className="dsc-val">{fmtDist(distance)}</div>
            <div className="dsc-lbl">Distance traveled</div>
          </div>
        </div>
        <div className="dsc">
          <div className="dsc-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Activity size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div className="dsc-val">{avgHR} <span className="dsc-unit">bpm</span></div>
            <div className="dsc-lbl">Avg heart rate</div>
          </div>
        </div>
        <div className="dsc">
          <div className="dsc-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <Thermometer size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div className="dsc-val">{avgTemp} <span className="dsc-unit">°C</span></div>
            <div className="dsc-lbl">Avg temperature</div>
          </div>
        </div>
        <div className="dsc">
          <div className="dsc-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
            <BatteryFull size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div className="dsc-val">
              {dayData.filter(h => h.status === 'active').length}
              <span className="dsc-unit">/{dayData.length}</span>
            </div>
            <div className="dsc-lbl">Active readings</div>
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="ah-map-section">
        <div className="ah-map-header">
          <div>
            <span className="ah-map-title">Path trace · {fmtDate(currentDate)}</span>
            <span className="ah-map-sub">
              {fmtDist(distance)} total · {dayData.length} readings
            </span>
          </div>
        </div>
        {/* key forces map remount on day change so fitBounds resets */}
        <PetMap key={currentDate} center={mapCenter} path={mapPath} height={260} showZones={false} />
      </div>

      {/* Status filter */}
      <div className="ah-filters">
        <span className="filter-label">Filter:</span>
        {(['all', 'active', 'resting', 'sleeping'] as StatusFilter[]).map(s => (
          <button
            key={s}
            className={`filter-btn${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
            style={
              filter === s && s !== 'all'
                ? {
                    color:       STATUS_STYLE[s]?.color,
                    background:  STATUS_STYLE[s]?.bg,
                    borderColor: STATUS_STYLE[s]?.color,
                  }
                : undefined
            }
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span className="filter-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Readings table */}
      <div className="ah-table-wrap">
        {filtered.length === 0 ? (
          <div className="ah-empty">No readings match this filter for {DAY_LABELS[dayIdx]}.</div>
        ) : (
          <table className="ah-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Status</th>
                <th><Activity size={12} /> Heart Rate</th>
                <th><Thermometer size={12} /> Temperature</th>
                <th><BatteryFull size={12} /> Battery</th>
                <th><MapPin size={12} /> Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => {
                const d     = new Date(h.time)
                const st    = STATUS_STYLE[h.status] ?? STATUS_STYLE.active
                const hrW   = h.heartRate   < HR_NORMAL[0]  || h.heartRate   > HR_NORMAL[1]
                const tmpW  = h.temperature < TMP_NORMAL[0] || h.temperature > TMP_NORMAL[1]
                const batC  = h.batteryLevel > 50 ? '#22c55e' : h.batteryLevel > 20 ? '#f59e0b' : '#ef4444'

                // Step distance from the previous point in filtered list
                const stepDist =
                  i > 0
                    ? haversineM(
                        filtered[i - 1].coordinates.latitude,
                        filtered[i - 1].coordinates.longitude,
                        h.coordinates.latitude,
                        h.coordinates.longitude
                      )
                    : null

                return (
                  <tr key={h._id}>
                    <td>
                      <div className="td-time-main">
                        {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {stepDist !== null && stepDist > 1 && (
                        <div className="td-step-dist">+{fmtDist(stepDist)}</div>
                      )}
                    </td>

                    <td>
                      <span className="status-chip" style={{ color: st.color, background: st.bg }}>
                        <span className="status-dot" style={{ background: st.color }} />
                        {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                      </span>
                    </td>

                    <td>
                      <div className={`td-metric${hrW ? ' td-warn' : ''}`}>
                        <span className="td-num">{h.heartRate}</span>
                        <span className="td-unit"> bpm</span>
                        {hrW && <span className="td-flag">⚠</span>}
                      </div>
                    </td>

                    <td>
                      <div className={`td-metric${tmpW ? ' td-warn' : ''}`}>
                        <span className="td-num">{h.temperature}</span>
                        <span className="td-unit"> °C</span>
                        {tmpW && <span className="td-flag">⚠</span>}
                      </div>
                    </td>

                    <td>
                      <div className="td-battery">
                        <div className="td-bat-track">
                          <div
                            className="td-bat-fill"
                            style={{ width: `${h.batteryLevel}%`, background: batC }}
                          />
                        </div>
                        <span style={{ color: batC, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {h.batteryLevel}%
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="td-coord">
                        {h.coordinates.latitude.toFixed(4)},{' '}
                        {h.coordinates.longitude.toFixed(4)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
