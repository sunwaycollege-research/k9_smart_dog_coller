import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, MapPin, HeartPulse, Thermometer, BatteryMedium, History, UserRound, Link2, ShieldCheck } from 'lucide-react'
import { useAppSelector } from '../store/hooks'
import { products } from '../data/products'
import ProductSequenceScroll from './ProductSequenceScroll'
import ProductTextOverlays from './ProductTextOverlays'
import PawtrackNavbar from './PawtrackNavbar'
import PawtrackFooter from './PawtrackFooter'
import PawtrackMiniMap from './PawtrackMiniMap'

// ── Static canvas frames (Vite resolves to hashed URLs) ──────────────────────
import frame001 from '../assets/petcollar.jpeg'
import frame075 from '../assets/canvas/ezgif-frame-075.jpg'
import frame150 from '../assets/canvas/ezgif-frame-150.jpg'
import frame220 from '../assets/canvas/ezgif-frame-220.jpg'
import frame280 from '../assets/canvas/ezgif-frame-280.jpg'

// ── Design tokens ─────────────────────────────────────────────────────────────
const GOLD      = '#C9A84C'
const GOLD_LIGHT = '#E5C76B'
const product = products[0]

// ── Helpers ───────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] px-3 py-1 rounded-full border mb-5"
      style={{ color: GOLD, borderColor: `${GOLD}35`, background: `${GOLD}12` }}
    >
      {label}
    </span>
  )
}

// Shared stick-image frame container
function StickImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ border: `1px solid ${GOLD}20` }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ filter: 'brightness(0.92) contrast(1.05)' }}
      />
      {/* subtle gold tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${GOLD}08 0%, transparent 60%)` }}
      />
    </div>
  )
}

// ── 1. ABOUT SECTION ─────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section className="relative py-28 overflow-hidden" style={{ background: '#080608' }}>
      {/* top rule */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)` }} />

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: text */}
          <Reveal>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-5">
              Built for dogs.<br />Designed for you.
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: '#808080' }}>
              Pawtrack is a research prototype developed at the RAIN Research and
              Incubation Centre. It brings together IoT hardware, real-time GPS,
              and health monitoring into a single wearable built specifically for dogs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: 'IP68',  label: 'Waterproof Rating' },
                { num: 'LTE',   label: 'Connectivity'      },
                { num: '14 Day',label: 'Target Battery Life'},
                { num: 'BLE 5', label: 'Bluetooth'         },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl border"
                  style={{ borderColor: `${GOLD}18`, background: `${GOLD}06` }}>
                  <div className="text-2xl font-black" style={{ color: GOLD }}>{s.num}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#666666' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right: stick image */}
          <Reveal delay={0.15}>
            <StickImage src={frame075} alt="Pawtrack collar close-up" className="h-[420px]" />
          </Reveal>

        </div>
      </div>
    </section>
  )
}

// ── 2. FEATURES SECTION (backend-verified) ────────────────────────────────────
function FeaturesSection() {
  // Every feature maps directly to a real backend endpoint or model field
  const features = [
    {
      icon: MapPin,
      title: 'Live GPS Coordinates',
      desc: 'Collar pushes latitude/longitude to the server every 10 seconds via POST /pet/update-attributes. Visualised live on an in-app map.',
    },
    {
      icon: HeartPulse,
      title: 'Heart Rate Monitoring',
      desc: 'Real-time BPM streamed from the collar sensor and stored per update. Accessible via GET /pet/:petId/attributes.',
    },
    {
      icon: Thermometer,
      title: 'Body Temperature',
      desc: 'Core body temperature (°C) logged on every 10-second hardware tick alongside GPS and heart rate.',
    },
    {
      icon: BatteryMedium,
      title: 'Battery Level',
      desc: 'Collar battery percentage (0–100%) reported on each update, so you always know when to charge before a walk.',
    },
    {
      icon: History,
      title: 'Full Sensor History',
      desc: 'Every previous reading is archived into a timestamped history[] array — enabling trend graphs and health analytics over time.',
    },
    {
      icon: UserRound,
      title: 'Pet Profile & Health Notes',
      desc: 'Store breed, age, weight, vaccinations, temperament, and vet notes per pet. All accessible after JWT-authenticated login.',
    },
    {
      icon: Link2,
      title: 'Collar Pairing',
      desc: 'Each physical collar (collarModelNo) is paired to exactly one pet via POST /pet/assign-collar with collision detection.',
    },
    {
      icon: ShieldCheck,
      title: 'JWT Auth & Rate Limiting',
      desc: 'All user-facing endpoints are protected by JWT middleware with a 10 req / 15 min rate limiter to prevent abuse.',
    },
  ]

  return (
    <section className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080608 0%, #0c0a06 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}25, transparent)` }} />

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <Reveal>
          <div className="mb-14">
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              What the system actually does.
            </h2>
            <p className="text-base mt-4 max-w-xl" style={{ color: '#737373' }}>
              Every feature below is live in the codebase — backed by a real API endpoint or database field.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal key={i} delay={i * 0.06}>
                <div
                  className="p-5 rounded-2xl border h-full transition-all duration-300 group"
                  style={{ borderColor: `${GOLD}15`, background: `${GOLD}04` }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = `${GOLD}35`
                    el.style.background = `${GOLD}09`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = `${GOLD}15`
                    el.style.background = `${GOLD}04`
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${GOLD}18`, color: GOLD }}>
                    <Icon size={17} strokeWidth={1.8} />
                  </div>
                  <div className="text-sm font-bold text-white mb-2">{f.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: '#6b6b6b' }}>{f.desc}</div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── 3. QUOTE BANNER ───────────────────────────────────────────────────────────
function QuoteBanner() {
  return (
    <section className="relative py-20 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${GOLD}22 0%, ${GOLD}10 50%, ${GOLD}18 100%)` }}>
      <div className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, #0a0806 0%, #100d06 100%)`, opacity: 0.75 }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)` }} />

      <div className="relative w-full max-w-4xl mx-auto px-6 sm:px-10 text-center">
        <Reveal>
          <div className="text-5xl mb-6" style={{ color: GOLD, opacity: 0.5 }}>&ldquo;</div>
          <blockquote className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight">
            The spirit of adventure is the spirit of discovery — if you push beyond
            your limits and reach who you truly are.
          </blockquote>
          <div className="mt-6 text-sm font-bold" style={{ color: GOLD }}>— Pawtrack Team</div>
        </Reveal>
      </div>
    </section>
  )
}


// ── 4. SMART ECOSYSTEM (MAP) ──────────────────────────────────────────────────
function TechSection() {
  return (
    <section className="relative py-28 text-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080608 0%, #050405 100%)' }}>

      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `linear-gradient(${GOLD}99 1px, transparent 1px), linear-gradient(90deg, ${GOLD}99 1px, transparent 1px)`,
        backgroundSize: '100px 100px',
      }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)` }} />

      <div className="relative w-full max-w-3xl mx-auto px-6 sm:px-10">
        <Reveal>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-5">
            {product.techSection.title}
          </h2>
          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: '#737373' }}>
            {product.techSection.description}
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="relative mt-14 mx-auto rounded-3xl overflow-hidden"
            style={{
              maxWidth: '640px',
              height: '360px',
              border: `1px solid ${GOLD}25`,
              boxShadow: `0 0 60px ${GOLD}15, 0 24px 80px #000000`,
            }}>
            <PawtrackMiniMap />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── 6. PRODUCT CARDS ─────────────────────────────────────────────────────────
const CARD_FRAMES = [frame001, frame220, frame280]

function ProductCardsSection() {
  return (
    <section className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #060404 0%, #080608 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}25, transparent)` }} />

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <Reveal>
          <div className="text-center mb-14">
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Our Collections
            </h2>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <div className="group rounded-2xl overflow-hidden border transition-all duration-300"
                style={{ borderColor: `${GOLD}15`, background: `${GOLD}04` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${GOLD}35`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `${GOLD}15`)}
              >
                {/* Image */}
                <div className="h-52 overflow-hidden">
                  <img
                    src={CARD_FRAMES[i]}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: 'brightness(0.88) contrast(1.05)' }}
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-base font-black text-white">{p.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#666666' }}>{p.subName}</div>
                    </div>
                    <span className="text-lg font-black shrink-0 ml-2" style={{ color: GOLD }}>{p.price}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: '#666666' }}>
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.features.slice(0, 2).map(f => (
                      <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${GOLD}15`, color: GOLD }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── 7. CTA SECTION ───────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated)

  return (
    <section className="relative py-28 overflow-hidden text-center"
      style={{ background: '#060404' }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)` }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[100px] opacity-15 pointer-events-none"
        style={{ background: GOLD }} />

      {/* Background stick image */}
      <div className="absolute inset-0 opacity-[0.06]">
        <img src={frame001} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto px-6 sm:px-10">
        <Reveal>
          <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-5">
            Track. Connect.<br />Protect.
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: '#737373' }}>
            Pawtrack is developed at RAIN — Research and Incubation Centre.
            An MVP-phase IoT project bringing GPS tracking and health monitoring
            to your dog&apos;s collar. Early access available now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="px-10 py-4 rounded-2xl text-base font-black"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                color: '#060404',
                boxShadow: `0 8px 40px ${GOLD}50`,
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : `Order Now — ${product.buyNowSection.price}`}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl text-sm font-bold border"
              style={{ borderColor: `${GOLD}30`, color: '#999999' }}
            >
              Learn More
            </motion.button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="relative font-['Outfit',sans-serif] w-full"
      style={{ background: '#060404' }}>

      <PawtrackNavbar themeColor={GOLD} />

      {/* Canvas scroll hero */}
      <div className="relative">
        <ProductSequenceScroll product={product} />
        <ProductTextOverlays product={product} />
      </div>

      <AboutSection />
      <FeaturesSection />
      <QuoteBanner />
      <TechSection />
      <ProductCardsSection />
      <CTASection />
      <PawtrackFooter />
    </div>
  )
}
