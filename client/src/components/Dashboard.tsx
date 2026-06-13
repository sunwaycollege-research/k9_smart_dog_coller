import { useState } from 'react'
import {
  Home, MapPin, Heart, Stethoscope, Settings, LogOut,
  Bell, Play, Thermometer, Activity, BatteryFull,
  Route, TrendingUp, AlertTriangle,
  AlertCircle, Bone, Moon, Syringe, PawPrint, History, Radio,
  Dog, Smile, Check,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import CurrentAttributes from './CurrentAttributes'
import AttributesHistory from './AttributesHistory'
import PetMap from './PetMap'
import LocationView from './LocationView'
import petData from '../assets/data/mock_api_pet_arrtibutes.json'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { clearPet } from '../store/slices/petSlice'
import { useGetMeQuery, useGetPetAttributesQuery } from '../store/apiSlice'
import type { PopulatedPet, PetAttributes } from '../store/apiSlice'
import './Dashboard.css'

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type NavKey = 'home' | 'location' | 'health' | 'history' | 'vet' | 'settings'

const NAV_ITEMS: { key: NavKey; Icon: LucideIcon; label: string }[] = [
  { key: 'home',     Icon: Home,       label: 'Home'    },
  { key: 'location', Icon: MapPin,      label: 'Location'},
  { key: 'health',   Icon: Heart,       label: 'Health'  },
  { key: 'history',  Icon: History,     label: 'History' },
  { key: 'vet',      Icon: Stethoscope, label: 'Vet'     },
  { key: 'settings', Icon: Settings,    label: 'Settings'},
]

const TEMP_BARS = [40, 55, 45, 80, 65, 100, 70]
const TEMP_TIMES = ['6am', '8am', '10am', '12pm', '2pm', '4pm', 'Now']

const EVENTS: { bg: string; Icon: LucideIcon; title: string; sub: string; time: string }[] = [
  { bg: '#1c1810', Icon: Activity,      title: 'Heart rate spike',   sub: '108 bpm · brief, resolved', time: '9:05 AM'  },
  { bg: '#2b0f0f',  Icon: AlertTriangle, title: 'Left safe zone',     sub: 'Home perimeter breach',     time: '11:34 AM' },
  { bg: '#1c1810', Icon: Thermometer,   title: 'Temp slightly high', sub: '38.8°C · monitor advised',  time: '2:10 PM'  },
]

const TILES: { Icon: LucideIcon; title: string; sub: string }[] = [
  { Icon: Bone,    title: 'Feeding', sub: 'Last: 12:00 PM'    },
  { Icon: Moon,    title: 'Sleep',   sub: '7.2 hrs last night' },
  { Icon: Syringe, title: 'Vaccine', sub: 'Due in 3 weeks'    },
]

interface HomeDashboardProps {
  greeting: string
  activePet?: PopulatedPet | null
  attributes?: PetAttributes | null
  home?: { coordinates: { latitude: number; longitude: number } } | null
}

function HomeDashboard({ greeting, activePet, attributes, home }: HomeDashboardProps) {
  const isDemo = !attributes
  const source = attributes || petData

  const history = source.history || []
  const todayDateStr = history.length > 0
    ? history[history.length - 1].time.split('T')[0]
    : ''
  const todayEntries = todayDateStr
    ? history.filter(h => h.time.startsWith(todayDateStr))
    : []

  const todayDistM = todayEntries.slice(1).reduce((sum, h, i) => {
    const prev = todayEntries[i]
    return sum + haversineM(
      prev.coordinates.latitude, prev.coordinates.longitude,
      h.coordinates.latitude,   h.coordinates.longitude,
    )
  }, 0)

  const todayDistLabel = todayEntries.length > 0
    ? (todayDistM < 1000
        ? `${Math.round(todayDistM)} m`
        : `${(todayDistM / 1000).toFixed(2)} km`)
    : '0 m'

  const stats = [
    { Icon: Route,       value: todayDistLabel, unit: '',     label: 'Distance today'   },
    { Icon: Thermometer, value: String(source.temperature ?? '--'), unit: '°C',   label: 'Body temperature' },
    { Icon: Activity,    value: String(source.heartRate ?? '--'),   unit: ' bpm', label: 'Heart rate'       },
    { Icon: BatteryFull, value: String(source.batteryLevel ?? '--'),unit: '%',    label: 'Collar battery',  highlight: true },
  ]

  const displayName  = activePet?.name ?? 'Max'
  const displayBreed = activePet?.breed ? activePet.breed : 'Golden Retriever'
  const displayAge   = activePet ? `${activePet.age} yrs` : '3 yrs'
  const displayGender = activePet ? (activePet.gender.charAt(0).toUpperCase() + activePet.gender.slice(1)) : 'Male'
  const displayWeight = activePet ? `${activePet.weight} kg` : '28 kg'
  const displayColor  = activePet ? activePet.color : 'Golden'

  return (
    <>
      {/* Demo Warning Banner */}
      {isDemo && (
        <div className="lv-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={15} />
          <span>Demo Data: Collar has not transmitted any coordinates or metrics yet.</span>
        </div>
      )}

      {/* Banner */}
      <div className="dash-banner">
        <div className="banner-avatar"><Dog size={32} strokeWidth={1.8} /></div>
        <div className="banner-info">
          <h2>{displayName} <span className="banner-breed">· {displayBreed}</span></h2>
          <p>{displayAge} · {displayGender} · {displayWeight} · {displayColor}</p>
          <div className="banner-chip"><Radio size={12} strokeWidth={2} /> {activePet?.collarModelNo ?? 'V-GNN3'} · 2/s · collar live</div>
        </div>
        <div className="banner-right">
          <span className="banner-greeting">
            {greeting} <Smile size={12} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px', marginTop: '-2px' }} />
          </span>
          <div className="banner-actions">
            <button className="banner-btn"><Bell size={16} /></button>
            <button className="banner-btn"><Play size={14} /></button>
          </div>
        </div>
      </div>

      {/* Emotion strip */}
      <div className="emotion-strip">
        <div className="emotion-icon"><Smile size={24} strokeWidth={1.8} /></div>
        <div className="emotion-text">
          <p>Feeling happy &amp; calm</p>
          <span>HR {source.heartRate ?? '--'} bpm · Temp {source.temperature ?? '--'}°C · BP 118/78 — all within normal range</span>
        </div>
        <div className="emotion-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Check size={12} strokeWidth={3} />
          <span>Normal</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        {stats.map(({ Icon, value, unit, label, highlight }, i) => (
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
            center={source.coordinates ?? { latitude: 27.705578, longitude: 85.334061 }}
            home={home?.coordinates ?? undefined}
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
              <div><span className="v-value">{source.heartRate ?? '--'}</span><span className="v-unit"> bpm</span></div>
              <div className="heartwave">
                <svg viewBox="0 0 140 32" width="100%" height="32">
                  <polyline
                    points="0,16 16,16 21,4 27,28 33,16 52,16 57,2 63,30 69,16 88,16 93,4 99,28 105,16 140,16"
                    fill="none" stroke="#C9A84C" strokeWidth="2"
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
            <span>{source.temperature ?? '--'} °C</span>
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
                <div className="ev-icon" style={{ background: bg }}><Icon size={14} /></div>
                <div className="ev-info">
                  <div className="ev-title">{title}</div>
                  <div className="ev-sub">{sub}</div>
                </div>
                <div className="ev-time">{time}</div>
              </div>
            ))}
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

interface Props {
  onSignOut?: () => void
}

export default function Dashboard({ onSignOut }: Props) {
  const dispatch  = useAppDispatch()
  const [activeNav, setActiveNav] = useState<NavKey>('home')

  // Retrieve populated user (with populated pets)
  const { data: meData, isLoading: meLoading } = useGetMeQuery()
  const activeUser = meData?.user
  
  // Pick the first pet as active pet
  const activePet = activeUser?.pets?.[0] || null

  // Fetch attributes for the active pet from DB (polling every 20 seconds)
  const { data: attrData, isLoading: attrLoading } = useGetPetAttributesQuery(
    { petId: activePet?._id ?? '', page: 1, limit: 10 },
    { 
      skip: !activePet?._id,
      pollingInterval: 20000
    }
  )
  const attributes = attrData?.attributes || null

  const handleSignOut = () => {
    dispatch(logout())
    dispatch(clearPet())
    onSignOut?.()
  }

  // Display metadata for the sidebar
  const displayName  = activePet?.name ?? 'Max'
  const displayBreed = activePet?.breed ? activePet.breed : 'Golden Retriever'
  const displayAge   = activePet ? `${activePet.age} yrs` : '3 yrs'
  const displayGreeting = activeUser?.username
    ? `Good morning, ${activeUser.username}`
    : 'Good morning'

  const isLoadingData = meLoading || (activePet?._id && attrLoading)

  if (isLoadingData) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#060404' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #262013', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      </div>
    )
  }

  return (
    <div className="app-wrapper">
      {/* Top Nav */}
      <nav className="topnav">
        <div className="topnav-brand">
          <div className="topnav-logo"><PawPrint size={16} strokeWidth={2.5} /></div>
          <span className="topnav-title">PawTrack</span>
        </div>
        <div className="topnav-right">K9 Smart Collar — RAIN</div>
      </nav>

      <div className="dash-page">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-pet">
            <div className="sidebar-avatar"><PawPrint size={26} strokeWidth={1.8} /></div>
            <h3>{displayName}</h3>
            <p>{displayBreed} · {displayAge}</p>
            <div className="collar-chip"><Radio size={12} strokeWidth={2} /> {activePet?.collarModelNo ?? 'V-GNN3'} · live</div>
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
            <div className="snav-item" onClick={handleSignOut}>
              <LogOut size={17} strokeWidth={2} className="ni" />
              Sign out
            </div>
          </div>
        </aside>

        {/* Main content — switches per nav */}
        <main className="dash-main">
          {activeNav === 'home' && (
            <HomeDashboard 
              greeting={displayGreeting} 
              activePet={activePet}
              attributes={attributes}
              home={activeUser?.home}
            />
          )}

          {activeNav === 'health' && (
            <CurrentAttributes 
              onViewHistory={() => setActiveNav('history')} 
              attributes={attributes}
            />
          )}

          {activeNav === 'history' && (
            <AttributesHistory 
              onBack={() => setActiveNav('health')} 
              attributes={attributes}
              petId={activePet?._id}
            />
          )}

          {activeNav === 'location' && (
            <LocationView 
              attributes={attributes}
            />
          )}

          {(activeNav === 'vet' || activeNav === 'settings') && (
            <div className="placeholder-view">
              <div className="placeholder-icon">
                {activeNav === 'vet' ? <Stethoscope size={40} strokeWidth={1.2} /> :
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
