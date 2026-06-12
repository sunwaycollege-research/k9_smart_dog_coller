import { useState } from 'react'
import {
  Home, MapPin, Heart, Stethoscope, Settings, LogOut,
  Bell, Play, Thermometer, Activity, BatteryFull,
  Route, TrendingUp, AlertTriangle, CalendarCheck,
  AlertCircle, Bone, Moon, Syringe, PawPrint, History,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import CurrentAttributes from './CurrentAttributes'
import AttributesHistory from './AttributesHistory'
import PetMap from './PetMap'
import petData from '../assets/data/mock_api_pet_arrtibutes.json'
import userData from '../assets/data/user_mock_data.json'
import './Dashboard.css'

// Pre-calculate today's distance (most recent date in history)
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const todayDate = petData.history[petData.history.length - 1].time.split('T')[0]
const todayEntries = petData.history.filter(h => h.time.startsWith(todayDate))
const todayDistM = todayEntries.slice(1).reduce((sum, h, i) => {
  const prev = todayEntries[i]
  return sum + haversineM(
    prev.coordinates.latitude, prev.coordinates.longitude,
    h.coordinates.latitude,   h.coordinates.longitude,
  )
}, 0)
const todayDistLabel = todayDistM < 1000
  ? `${Math.round(todayDistM)} m`
  : `${(todayDistM / 1000).toFixed(2)} km`

type NavKey = 'home' | 'location' | 'health' | 'history' | 'vet' | 'settings'

const NAV_ITEMS: { key: NavKey; Icon: LucideIcon; label: string }[] = [
  { key: 'home',     Icon: Home,       label: 'Home'    },
  { key: 'location', Icon: MapPin,      label: 'Location'},
  { key: 'health',   Icon: Heart,       label: 'Health'  },
  { key: 'history',  Icon: History,     label: 'History' },
  { key: 'vet',      Icon: Stethoscope, label: 'Vet'     },
  { key: 'settings', Icon: Settings,    label: 'Settings'},
]

const STATS: { Icon: LucideIcon; value: string; unit: string; label: string; highlight?: boolean }[] = [
  { Icon: Route,       value: todayDistLabel, unit: '',     label: 'Distance today'   },
  { Icon: Thermometer, value: String(petData.temperature), unit: '°C',   label: 'Body temperature' },
  { Icon: Activity,    value: String(petData.heartRate),   unit: ' bpm', label: 'Heart rate'       },
  { Icon: BatteryFull, value: String(petData.batteryLevel),unit: '%',    label: 'Collar battery',  highlight: true },
]

const TEMP_BARS = [40, 55, 45, 80, 65, 100, 70]
const TEMP_TIMES = ['6am', '8am', '10am', '12pm', '2pm', '4pm', 'Now']

const EVENTS: { bg: string; Icon: LucideIcon; title: string; sub: string; time: string }[] = [
  { bg: '#EAF3DE', Icon: Activity,      title: 'Heart rate spike',  sub: '108 bpm · brief, resolved', time: '9:05 AM'  },
  { bg: '#FCEBEB', Icon: AlertTriangle, title: 'Left safe zone',    sub: 'Home perimeter breach',     time: '11:34 AM' },
  { bg: '#FAEEDA', Icon: Thermometer,   title: 'Temp slightly high',sub: '38.8°C · monitor advised',  time: '2:10 PM'  },
]

const TILES: { Icon: LucideIcon; title: string; sub: string }[] = [
  { Icon: Bone,    title: 'Feeding', sub: 'Last: 12:00 PM'    },
  { Icon: Moon,    title: 'Sleep',   sub: '7.2 hrs last night' },
  { Icon: Syringe, title: 'Vaccine', sub: 'Due in 3 weeks'    },
]

interface Props {
  onSignOut?: () => void
}

function HomeDashboard() {
  return (
    <>
      {/* Banner */}
      <div className="dash-banner">
        <div className="banner-avatar">🐕</div>
        <div className="banner-info">
          <h2>Max <span className="banner-breed">· Golden Retriever</span></h2>
          <p>3 yrs · Male · 28 kg · Golden</p>
          <div className="banner-chip">📡 V-GNN3 · 2/s · collar live</div>
        </div>
        <div className="banner-right">
          <span className="banner-greeting">Good morning, Alex 👋</span>
          <div className="banner-actions">
            <button className="banner-btn"><Bell size={16} /></button>
            <button className="banner-btn"><Play size={14} /></button>
          </div>
        </div>
      </div>

      {/* Emotion strip */}
      <div className="emotion-strip">
        <div className="emotion-icon">😊</div>
        <div className="emotion-text">
          <p>Feeling happy &amp; calm</p>
          <span>HR 85 bpm · Temp 38.5°C · BP 118/78 — all within normal range</span>
        </div>
        <div className="emotion-badge">✓ Normal</div>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        {STATS.map(({ Icon, value, unit, label, highlight }, i) => (
          <div className="stat-card" key={i}>
            <div className="sc-icon"><Icon size={22} strokeWidth={1.5} /></div>
            <div className={`sc-val${highlight ? ' highlight' : ''}`}>
              {value}<span className="sc-unit">{unit}</span>
            </div>
            <div className="sc-lbl">{label}</div>
          </div>
        ))}
      </div>

      {/* Map + Vitals */}
      <div className="dash-cols">
        <div className="sec-card">
          <div className="sec-card-title"><MapPin size={13} strokeWidth={2.5} /> Live location + path trace</div>
          <PetMap
            center={petData.coordinates}
            home={userData.home}
            height={200}
            showZones
            showPath={false}
          />
        </div>

        <div className="sec-card">
          <div className="sec-card-title"><Activity size={13} strokeWidth={2.5} /> Vitals</div>
          <div className="vitals-grid">
            <div className="v-card">
              <div className="v-label"><Heart size={11} strokeWidth={2.5} /> Heartbeat</div>
              <div><span className="v-value">85</span><span className="v-unit"> bpm</span></div>
              <div className="heartwave">
                <svg viewBox="0 0 140 32" width="100%" height="32">
                  <polyline
                    points="0,16 16,16 21,4 27,28 33,16 52,16 57,2 63,30 69,16 88,16 93,4 99,28 105,16 140,16"
                    fill="none" stroke="#2E86C1" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="v-card">
              <div className="v-label"><Activity size={11} strokeWidth={2.5} /> Blood pressure</div>
              <div><span className="v-value">118</span><span className="v-unit"> /78</span></div>
              <div className="bp-bar-wrap"><div className="bp-bar-fill" /></div>
              <div className="bp-labels"><span>Low</span><span>Normal</span><span>High</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Temp + Events */}
      <div className="dash-cols">
        <div className="sec-card">
          <div className="sec-card-title"><TrendingUp size={13} strokeWidth={2.5} /> Temperature trend</div>
          <div className="temp-header">
            <span>Body temp today</span>
            <span>38.5 °C</span>
          </div>
          <div className="temp-bars">
            {TEMP_BARS.map((h, i) => (
              <div key={i} className={`t-bar${h === 100 ? ' high' : ''}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="temp-times">{TEMP_TIMES.map(t => <span key={t}>{t}</span>)}</div>
        </div>

        <div className="sec-card">
          <div className="sec-card-title"><Bell size={13} strokeWidth={2.5} /> Recent events</div>
          <div className="ev-list">
            {EVENTS.map(({ bg, Icon, title, sub, time }, i) => (
              <div className="ev-item" key={i}>
                <div className="ev-dot" style={{ background: bg }}><Icon size={16} strokeWidth={2} /></div>
                <div className="ev-text"><p>{title}</p><span>{sub}</span></div>
                <span className="ev-time">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vet cards */}
      <div className="dash-col-full">
        <div className="sec-card">
          <div className="sec-card-title"><Stethoscope size={13} strokeWidth={2.5} /> Vet &amp; health alerts</div>
          <div className="vet-card vet-blue">
            <div className="vet-icon"><CalendarCheck size={26} strokeWidth={1.5} /></div>
            <div className="vet-info"><p>Vet appointment</p><span>Dr. Mehta · Jun 15, 10:00 AM</span></div>
            <button className="vet-btn blue-btn">Set reminder</button>
          </div>
          <div className="vet-card vet-red">
            <div className="vet-icon"><AlertCircle size={26} strokeWidth={1.5} /></div>
            <div className="vet-info"><p>Health alert</p><span>Temp elevated · book a checkup soon</span></div>
            <button className="vet-btn red-btn">Book now</button>
          </div>
        </div>
      </div>

      {/* Quick tiles */}
      <div className="dash-col-full">
        <div className="sec-card">
          <div className="sec-card-title"><Settings size={13} strokeWidth={2.5} /> Quick stats</div>
          <div className="tiles-grid">
            {TILES.map(({ Icon, title, sub }, i) => (
              <div className="tile" key={i}>
                <div className="t-icon"><Icon size={26} strokeWidth={1.5} /></div>
                <div className="t-title">{title}</div>
                <div className="t-sub">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function Dashboard({ onSignOut }: Props) {
  const [activeNav, setActiveNav] = useState<NavKey>('home')

  return (
    <div className="app-wrapper">
      {/* Top Nav */}
      <nav className="topnav">
        <div className="topnav-brand">
          <div className="topnav-logo"><PawPrint size={18} strokeWidth={2.5} /></div>
          <span className="topnav-title">PawTrack</span>
        </div>
        <div className="topnav-right">Smart Collar Companion</div>
      </nav>

      <div className="dash-page">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-pet">
            <div className="sidebar-avatar">🐕</div>
            <h3>Max</h3>
            <p>Golden Retriever · 3 yrs</p>
            <div className="collar-chip">📡 V-GNN3 · live</div>
          </div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ key, Icon, label }) => (
              <div
                key={key}
                className={`snav-item${activeNav === key ? ' active' : ''}`}
                onClick={() => setActiveNav(key)}
              >
                <Icon size={17} strokeWidth={activeNav === key ? 2.5 : 2} className="ni" />
                {label}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="snav-item" onClick={onSignOut}>
              <LogOut size={17} strokeWidth={2} className="ni" />
              Sign out
            </div>
          </div>
        </aside>

        {/* Main content — switches per nav */}
        <main className="dash-main">
          {activeNav === 'home' && <HomeDashboard />}

          {activeNav === 'health' && (
            <CurrentAttributes onViewHistory={() => setActiveNav('history')} />
          )}

          {activeNav === 'history' && (
            <AttributesHistory onBack={() => setActiveNav('health')} />
          )}

          {(activeNav === 'location' || activeNav === 'vet' || activeNav === 'settings') && (
            <div className="placeholder-view">
              <div className="placeholder-icon">
                {activeNav === 'location' ? <MapPin size={40} strokeWidth={1.2} /> :
                 activeNav === 'vet'      ? <Stethoscope size={40} strokeWidth={1.2} /> :
                                            <Settings size={40} strokeWidth={1.2} />}
              </div>
              <h3>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h3>
              <p>This section is coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
