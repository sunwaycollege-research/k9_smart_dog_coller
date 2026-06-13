import { Activity, Thermometer, BatteryFull, MapPin, Clock, History, AlertCircle } from 'lucide-react'
import petData from '../assets/data/mock_api_pet_arrtibutes.json'
import type { PetAttributes } from '../store/apiSlice'
import './CurrentAttributes.css'

type Status = 'active' | 'resting' | 'sleeping'

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string }> = {
  active:   { label: 'Active',   color: '#2E86C1', bg: '#E8F4FD' },
  resting:  { label: 'Resting',  color: '#d97706', bg: '#fef3c7' },
  sleeping: { label: 'Sleeping', color: '#7c3aed', bg: '#ede9fe' },
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const W = 130, H = 40
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W
      const y = H - ((v - min) / range) * (H - 8) - 4
      return `${x},${y}`
    })
    .join(' ')
  const area = `0,${H} ${pts} ${W},${H}`

  return (
    <svg width={W} height={H} className="sparkline">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {(() => {
        if (!pts) return null
        const last = pts.split(' ').pop()!
        const [lx, ly] = last.split(',')
        return <circle cx={lx} cy={ly} r="3" fill={color} />
      })()}
    </svg>
  )
}

function BatteryBar({ level }: { level: number }) {
  const color = level > 50 ? '#22c55e' : level > 20 ? '#f59e0b' : '#ef4444'
  return (
    <div className="bat-wrap">
      <div className="bat-track">
        <div className="bat-fill" style={{ width: `${level}%`, background: color }} />
      </div>
      <span className="bat-pct" style={{ color }}>{level}%</span>
    </div>
  )
}

interface Props {
  onViewHistory: () => void
  attributes?: PetAttributes | null
}

export default function CurrentAttributes({ onViewHistory, attributes }: Props) {
  // If no attributes in DB yet, show the mock data but label it clearly.
  const isDemo = !attributes
  const source = attributes || petData

  const status = (source.status || 'active') as Status
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.active

  const recent = source.history && source.history.length > 0
    ? source.history.slice(-8)
    : []

  const hrData  = recent.map(h => h.heartRate)
  const tmpData = recent.map(h => h.temperature)
  const batData = recent.map(h => h.batteryLevel)

  // Cast history to a minimal typed array to avoid union-type ambiguity with mock JSON
  type HistoryEntry = { heartRate: number; temperature: number; batteryLevel: number; status: string }
  const history: HistoryEntry[] = (source.history ?? []) as HistoryEntry[]
  const historyLen = history.length
  const avgHR = historyLen
    ? Math.round(history.reduce((s, h) => s + h.heartRate, 0) / historyLen)
    : (source.heartRate ?? 0)

  const avgTemp = historyLen
    ? (history.reduce((s, h) => s + h.temperature, 0) / historyLen).toFixed(1)
    : (source.temperature ?? 0).toFixed(1)

  const activeCount = history.filter(h => h.status === 'active').length

  const lastUpdated = (source as any).updatedAt
    ? new Date((source as any).updatedAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : 'Never'

  const hrWarn  = (source.heartRate ?? 0) > 120 || (source.heartRate ?? 0) < 50
  const tmpWarn = (source.temperature ?? 0) > 39.2 || (source.temperature ?? 0) < 37.5
  const batWarn = (source.batteryLevel ?? 0) < 20

  return (
    <div className="ca-page">
      {/* Demo Warning Banner */}
      {isDemo && (
        <div className="lv-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={15} />
          <span>Demo Data: Collar has not transmitted any coordinates or metrics yet.</span>
        </div>
      )}

      {/* Header */}
      <div className="ca-header">
        <div>
          <h2 className="ca-title">Current Health Status</h2>
          <div className="ca-updated">
            <Clock size={12} />
            Last updated: {lastUpdated}
          </div>
        </div>
        <div className="ca-header-right">
          <span className="status-chip" style={{ color: cfg.color, background: cfg.bg }}>
            <span className="status-dot" style={{ background: cfg.color }} />
            {cfg.label}
          </span>
          <button className="ca-hist-btn" onClick={onViewHistory}>
            <History size={14} />
            View History
          </button>
        </div>
      </div>

      {/* 3 metric cards */}
      <div className="ca-metrics">
        {/* Heart Rate */}
        <div className={`metric-card${hrWarn ? ' warn' : ''}`}>
          <div className="mc-left">
            <div className="mc-icon" style={{ background: '#E8F4FD', color: '#2E86C1' }}>
              <Activity size={22} strokeWidth={1.8} />
            </div>
            <div className="mc-info">
              <span className="mc-label">Heart Rate</span>
              <div className="mc-value">
                {source.heartRate ?? '--'}
                <span className="mc-unit"> bpm</span>
              </div>
              <span className="mc-range">Normal: 50–120 bpm</span>
            </div>
          </div>
          <div className="mc-right">
            {hrData.length > 1 ? (
              <Sparkline data={hrData} color={hrWarn ? '#ef4444' : '#2E86C1'} />
            ) : (
              <span className="mc-spark-lbl">Waiting for readings…</span>
            )}
            {hrData.length > 1 && <span className="mc-spark-lbl">Last {hrData.length} readings</span>}
          </div>
          {hrWarn && source.heartRate !== undefined && (
            <div className="mc-warn-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} strokeWidth={2.5} />
              <span>Out of range</span>
            </div>
          )}
        </div>

        {/* Temperature */}
        <div className={`metric-card${tmpWarn ? ' warn' : ''}`}>
          <div className="mc-left">
            <div className="mc-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
              <Thermometer size={22} strokeWidth={1.8} />
            </div>
            <div className="mc-info">
              <span className="mc-label">Body Temperature</span>
              <div className="mc-value">
                {source.temperature ?? '--'}
                <span className="mc-unit"> °C</span>
              </div>
              <span className="mc-range">Normal: 37.5–39.2°C</span>
            </div>
          </div>
          <div className="mc-right">
            {tmpData.length > 1 ? (
              <Sparkline data={tmpData} color={tmpWarn ? '#ef4444' : '#f97316'} />
            ) : (
              <span className="mc-spark-lbl">Waiting for readings…</span>
            )}
            {tmpData.length > 1 && <span className="mc-spark-lbl">Last {tmpData.length} readings</span>}
          </div>
          {tmpWarn && source.temperature !== undefined && (
            <div className="mc-warn-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} strokeWidth={2.5} />
              <span>Out of range</span>
            </div>
          )}
        </div>

        {/* Battery */}
        <div className={`metric-card${batWarn ? ' warn' : ''}`}>
          <div className="mc-left">
            <div className="mc-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
              <BatteryFull size={22} strokeWidth={1.8} />
            </div>
            <div className="mc-info">
              <span className="mc-label">Collar Battery</span>
              <div className="mc-value">
                {source.batteryLevel ?? '--'}
                <span className="mc-unit"> %</span>
              </div>
              <BatteryBar level={source.batteryLevel ?? 0} />
            </div>
          </div>
          <div className="mc-right">
            {batData.length > 1 ? (
              <Sparkline data={batData} color={batWarn ? '#ef4444' : '#22c55e'} />
            ) : (
              <span className="mc-spark-lbl">Waiting for readings…</span>
            )}
            {batData.length > 1 && <span className="mc-spark-lbl">Last {batData.length} readings</span>}
          </div>
          {batWarn && source.batteryLevel !== undefined && (
            <div className="mc-warn-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} strokeWidth={2.5} />
              <span>Low battery</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="ca-bottom">
        {/* GPS */}
        <div className="ca-card">
          <div className="ca-card-title">
            <MapPin size={13} strokeWidth={2.5} /> GPS Coordinates
          </div>
          <div className="coord-grid">
            <div className="coord-item">
              <span className="coord-lbl">Latitude</span>
              <span className="coord-val">{source.coordinates?.latitude ? `${source.coordinates.latitude.toFixed(4)}°` : '--'}</span>
            </div>
            <div className="coord-item">
              <span className="coord-lbl">Longitude</span>
              <span className="coord-val">{source.coordinates?.longitude ? `${source.coordinates.longitude.toFixed(4)}°` : '--'}</span>
            </div>
            <div className="coord-item">
              <span className="coord-lbl">Pet ID</span>
              <span className="coord-val mono">{source.petId ? source.petId.slice(-8) : '--'}</span>
            </div>
            <div className="coord-item">
              <span className="coord-lbl">Collar ID</span>
              <span className="coord-val mono">{source.collarId ? source.collarId.slice(-8) : '--'}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="ca-card">
          <div className="ca-card-title">
            <Activity size={13} strokeWidth={2.5} /> Reading Summary
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-num">{historyLen}</span>
              <span className="summary-lbl">Total readings</span>
            </div>
            <div className="summary-item">
              <span className="summary-num">{avgHR}</span>
              <span className="summary-lbl">Avg heart rate</span>
            </div>
            <div className="summary-item">
              <span className="summary-num">{avgTemp}</span>
              <span className="summary-lbl">Avg temperature</span>
            </div>
            <div className="summary-item">
              <span className="summary-num">{activeCount}</span>
              <span className="summary-lbl">Active readings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
