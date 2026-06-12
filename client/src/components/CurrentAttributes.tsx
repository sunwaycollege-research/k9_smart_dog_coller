import { Activity, Thermometer, BatteryFull, MapPin, Clock, History } from 'lucide-react'
import petData from '../assets/data/mock_api_pet_arrtibutes.json'
import './CurrentAttributes.css'

type Status = 'active' | 'resting' | 'sleeping'

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string }> = {
  active:   { label: 'Active',   color: '#2E86C1', bg: '#E8F4FD' },
  resting:  { label: 'Resting',  color: '#d97706', bg: '#fef3c7' },
  sleeping: { label: 'Sleeping', color: '#7c3aed', bg: '#ede9fe' },
}

const recent = petData.history.slice(-8)

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
}

export default function CurrentAttributes({ onViewHistory }: Props) {
  const status = petData.status as Status
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.active

  const hrData  = recent.map(h => h.heartRate)
  const tmpData = recent.map(h => h.temperature)
  const batData = recent.map(h => h.batteryLevel)

  const avgHR   = Math.round(petData.history.reduce((s, h) => s + h.heartRate, 0) / petData.history.length)
  const avgTemp = (petData.history.reduce((s, h) => s + h.temperature, 0) / petData.history.length).toFixed(1)
  const activeCount = petData.history.filter(h => h.status === 'active').length
  const lastUpdated = new Date(petData.updatedAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const hrWarn  = petData.heartRate > 120 || petData.heartRate < 50
  const tmpWarn = petData.temperature > 39.2 || petData.temperature < 37.5
  const batWarn = petData.batteryLevel < 20

  return (
    <div className="ca-page">
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
                {petData.heartRate}
                <span className="mc-unit"> bpm</span>
              </div>
              <span className="mc-range">Normal: 50–120 bpm</span>
            </div>
          </div>
          <div className="mc-right">
            <Sparkline data={hrData} color={hrWarn ? '#ef4444' : '#2E86C1'} />
            <span className="mc-spark-lbl">Last 8 readings</span>
          </div>
          {hrWarn && <div className="mc-warn-badge">⚠ Out of range</div>}
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
                {petData.temperature}
                <span className="mc-unit"> °C</span>
              </div>
              <span className="mc-range">Normal: 37.5–39.2°C</span>
            </div>
          </div>
          <div className="mc-right">
            <Sparkline data={tmpData} color={tmpWarn ? '#ef4444' : '#f97316'} />
            <span className="mc-spark-lbl">Last 8 readings</span>
          </div>
          {tmpWarn && <div className="mc-warn-badge">⚠ Out of range</div>}
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
                {petData.batteryLevel}
                <span className="mc-unit"> %</span>
              </div>
              <BatteryBar level={petData.batteryLevel} />
            </div>
          </div>
          <div className="mc-right">
            <Sparkline data={batData} color={batWarn ? '#ef4444' : '#22c55e'} />
            <span className="mc-spark-lbl">Last 8 readings</span>
          </div>
          {batWarn && <div className="mc-warn-badge">⚠ Low battery</div>}
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
              <span className="coord-val">{petData.coordinates.latitude.toFixed(4)}°</span>
            </div>
            <div className="coord-item">
              <span className="coord-lbl">Longitude</span>
              <span className="coord-val">{petData.coordinates.longitude.toFixed(4)}°</span>
            </div>
            <div className="coord-item">
              <span className="coord-lbl">Pet ID</span>
              <span className="coord-val mono">{petData.petId.slice(-8)}</span>
            </div>
            <div className="coord-item">
              <span className="coord-lbl">Collar ID</span>
              <span className="coord-val mono">{petData.collarId.slice(-8)}</span>
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
              <span className="summary-num">{petData.history.length}</span>
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
