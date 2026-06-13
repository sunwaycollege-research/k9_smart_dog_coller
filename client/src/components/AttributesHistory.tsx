import { useState } from 'react'
import { Activity, Thermometer, BatteryFull, MapPin, ArrowLeft, Route, AlertCircle } from 'lucide-react'
import petData from '../assets/data/mock_api_pet_arrtibutes.json'
import { useGetPetAttributesQuery } from '../store/apiSlice'
import type { PetAttributes } from '../store/apiSlice'
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

function calcTotalDistance(entries: { coordinates: { latitude: number; longitude: number } }[]): number {
  if (entries.length < 2) return 0
  // Since entries are sorted recent-first (newest first), we reduce in reverse or normal order.
  // The distance between consecutive items is the same regardless of direction.
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

interface Props {
  onBack: () => void
  attributes?: PetAttributes | null
  petId?: string
}

export default function AttributesHistory({ onBack, attributes, petId }: Props) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<StatusFilter>('all')

  const isDemo = !petId
  const { data: dbData, isLoading } = useGetPetAttributesQuery(
    { petId: petId || '', page, limit: 10 },
    { skip: isDemo }
  )

  const source = isDemo ? (attributes || petData) : (dbData?.attributes || attributes || petData)

  const historyEntries = source.history || []
  const totalEntries = isDemo ? historyEntries.length : ((source as { totalHistoryCount?: number }).totalHistoryCount || historyEntries.length)
  const totalPages = Math.max(1, Math.ceil(totalEntries / 10))

  // For demo/mock data we do client-side pagination
  const paginatedEntries = isDemo
    ? historyEntries.slice((page - 1) * 10, page * 10)
    : historyEntries

  const filtered = filter === 'all' ? paginatedEntries : paginatedEntries.filter(h => h.status === filter)

  const distance = calcTotalDistance(paginatedEntries)
  const avgHR    = paginatedEntries.length
    ? Math.round(paginatedEntries.reduce((s, h) => s + h.heartRate, 0) / paginatedEntries.length)
    : 0
  const avgTemp  = paginatedEntries.length
    ? (paginatedEntries.reduce((s, h) => s + h.temperature, 0) / paginatedEntries.length).toFixed(1)
    : '—'

  const mapPath   = paginatedEntries.map(h => h.coordinates)
  const mapCenter = paginatedEntries[0]?.coordinates ?? source.coordinates ?? { latitude: 27.705578, longitude: 85.334061 }

  return (
    <div className="ah-page">
      {/* Demo Warning Banner */}
      {isDemo && (
        <div className="lv-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={15} />
          <span>Demo Data: Collar has not transmitted any coordinates or metrics yet.</span>
        </div>
      )}

      {/* Header */}
      <div className="ah-header">
        <button className="ah-back" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="ah-title-group">
          <h2>Attributes History</h2>
          <p>{totalEntries} total readings · Page {page} of {totalPages}</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#94a3b8' }}>
          <span>Loading historical readings...</span>
        </div>
      ) : (
        <>
          {/* Day summary cards */}
          <div className="day-summary">
            <div className="dsc dsc-highlight">
              <div className="dsc-icon" style={{ background: '#E8F4FD', color: '#2E86C1' }}>
                <Route size={20} strokeWidth={1.8} />
              </div>
              <div>
                <div className="dsc-val">{fmtDist(distance)}</div>
                <div className="dsc-lbl">Distance on page</div>
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
                <Activity size={20} strokeWidth={1.8} />
              </div>
              <div>
                <div className="dsc-val">
                  {paginatedEntries.filter(h => h.status === 'active').length}
                  <span className="dsc-unit">/{paginatedEntries.length}</span>
                </div>
                <div className="dsc-lbl">Active readings</div>
              </div>
            </div>
          </div>

          {/* Map section */}
          {paginatedEntries.length > 0 && (
            <div className="ah-map-section">
              <div className="ah-map-header">
                <div>
                  <span className="ah-map-title">Path trace (Page {page})</span>
                  <span className="ah-map-sub">
                    {fmtDist(distance)} total · {paginatedEntries.length} readings shown
                  </span>
                </div>
              </div>
              {/* key forces map remount on page/filter change */}
              <PetMap key={`${page}-${filter}`} center={mapCenter} path={mapPath} height={260} showZones={false} />
            </div>
          )}

          {/* Status filter */}
          <div className="ah-filters">
            <span className="filter-label">Filter Page:</span>
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
              <div className="ah-empty">No readings match this filter on page {page}.</div>
            ) : (
              <table className="ah-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
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

                    // Step distance from the next point in chronological order.
                    // Since the list is reversed (recent-first), the "previous" chronological point
                    // is index i + 1.
                    const stepDist =
                      i < filtered.length - 1
                        ? haversineM(
                            filtered[i + 1].coordinates.latitude,
                            filtered[i + 1].coordinates.longitude,
                            h.coordinates.latitude,
                            h.coordinates.longitude
                          )
                        : null

                    return (
                      <tr key={i}>
                        <td>
                          <div className="td-time-main">
                            {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="td-time">
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
                            {hrW && <AlertCircle size={12} strokeWidth={2.5} className="td-flag" style={{ color: '#dc2626', display: 'inline-block', verticalAlign: 'middle' }} />}
                          </div>
                        </td>

                        <td>
                          <div className={`td-metric${tmpW ? ' td-warn' : ''}`}>
                            <span className="td-num">{h.temperature}</span>
                            <span className="td-unit"> °C</span>
                            {tmpW && <AlertCircle size={12} strokeWidth={2.5} className="td-flag" style={{ color: '#dc2626', display: 'inline-block', verticalAlign: 'middle' }} />}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', background: '#fff', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <button
                className="filter-btn"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'default' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="filter-btn"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                style={{ opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'default' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
