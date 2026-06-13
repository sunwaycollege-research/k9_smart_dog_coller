import { motion } from 'framer-motion'
import PawtrackNavbar from './PawtrackNavbar'
import PawtrackFooter from './PawtrackFooter'

const GOLD = '#C9A84C'

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

// ── Team photo map — drop images into src/assets/team/ named by slug ──────────
const teamPhotos = import.meta.glob<{ default: string }>(
  '../assets/team/*.{jpg,jpeg,png,webp}',
  { eager: true }
)
function teamPhoto(slug: string): string | null {
  const exts = ['jpg', 'jpeg', 'png', 'webp']
  for (const ext of exts) {
    const key = `../assets/team/${slug}.${ext}`
    if (teamPhotos[key]) return teamPhotos[key].default
  }
  return null
}

// ── Data ──────────────────────────────────────────────────────────────────────
const team = [
  { name: 'Prashant Adhikari', role: 'Project Lead',  slug: 'prashant' },
  { name: 'Rajat Upadhyay',    role: 'IoT Hardware Development', slug: 'rajat'    },
  { name: 'Anubhav Subedi',   role: 'Embedded Systems Development',      slug: 'anubhav'   },
  { name: 'Shreya Ganeju',       role: 'React/Frontend Developer',      slug: 'shreya'    },
  { name: 'Swikriti Luitel',     role: 'IoT Research and Development',      slug: 'swikriti'  },
]

const internalMentors = [
  { name: 'Ayush Kaji Dangol', dept: 'RAIN — Research and Incubation Centre, Sunway College Kathmandu' },
]

const externalMentors = [
  { name: 'Ram Pd. Rimal', org: 'Ram Laxman Innovations'     },
]

const acknowledgements = [
  'RAIN — Research and Incubation Centre',
  'IoT Research Laboratory - Sunway College Kathmandu',
]

// ── Sub-heading ───────────────────────────────────────────────────────────────
function CardHeading({ label }: { label: string }) {
  return (
    <h3
      className="text-xs font-black uppercase tracking-[0.2em] mb-5"
      style={{ color: GOLD }}
    >
      {label}
    </h3>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden font-['Outfit',sans-serif]"
      style={{ background: '#060404' }}
    >
      <PawtrackNavbar themeColor={GOLD} />

      {/* Hero strip */}
      <div className="relative pt-40 pb-20 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(${GOLD}99 1px, transparent 1px), linear-gradient(90deg, ${GOLD}99 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)` }}
        />
        <div className="relative w-full max-w-3xl mx-auto px-6 sm:px-10">
          <Reveal>
            <div
              className="inline-block text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full border mb-6"
              style={{ color: GOLD, borderColor: `${GOLD}35`, background: `${GOLD}12` }}
            >
              RAIN — Research &amp; Incubation Centre
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              The Team
            </h1>
            <p className="text-base leading-relaxed" style={{ color: '#737373' }}>
              Pawtrack is a student-led IoT research project developed under the
              RAIN incubation programme at Sunway College Kathmandu. Meet the people
              who built it.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Team cards */}
      <section className="py-20 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {team.map((m, i) => {
            const photo = teamPhoto(m.slug)
            return (
              <Reveal key={m.name} delay={i * 0.08}>
                <div
                  className="rounded-2xl overflow-hidden border"
                  style={{ borderColor: `${GOLD}22`, background: '#0c0a06' }}
                >
                  {/* Photo / fallback */}
                  <div className="h-64 relative overflow-hidden">
                    {photo ? (
                      <>
                        <img
                          src={photo}
                          alt={m.name}
                          className="w-full h-full object-cover object-top"
                          style={{ filter: 'brightness(0.88)' }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              'linear-gradient(to top, #060404 0%, transparent 55%)',
                          }}
                        />
                      </>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-5xl font-black"
                        style={{ background: `${GOLD}10`, color: GOLD }}
                      >
                        {m.name.charAt(0)}
                      </div>
                    )}
                    {/* Live dot */}
                    <div
                      className="absolute top-3 right-3 w-2 h-2 rounded-full"
                      style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                    />
                  </div>

                  {/* Info strip */}
                  <div
                    className="px-4 py-4 border-t"
                    style={{ borderColor: `${GOLD}15` }}
                  >
                    <div className="text-sm font-black text-white">{m.name}</div>
                    <div className="text-xs mt-0.5 font-medium" style={{ color: GOLD }}>
                      {m.role}
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Mentors + Acknowledgements */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Internal Mentors */}
          <Reveal delay={0.08}>
            <div
              className="p-6 rounded-2xl border h-full"
              style={{ borderColor: '#262013', background: '#0a0808' }}
            >
              <CardHeading label="Internal Mentors" />
              <div className="space-y-5">
                {internalMentors.map(m => (
                  <div key={m.name}>
                    <div className="text-sm font-semibold text-white">{m.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#616161' }}>
                      {m.dept}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* External Mentors */}
          <Reveal delay={0.14}>
            <div
              className="p-6 rounded-2xl border h-full"
              style={{ borderColor: '#262013', background: '#0a0808' }}
            >
              <CardHeading label="External Mentors" />
              <div className="space-y-5">
                {externalMentors.map(m => (
                  <div key={m.name}>
                    <div className="text-sm font-semibold text-white">{m.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#616161' }}>
                      {m.org}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Acknowledgements */}
          <Reveal delay={0.2}>
            <div
              className="p-6 rounded-2xl border h-full"
              style={{ borderColor: '#262013', background: '#0a0808' }}
            >
              <CardHeading label="Acknowledgements" />
              <ul className="space-y-3">
                {acknowledgements.map(a => (
                  <li
                    key={a}
                    className="flex gap-2.5 text-xs leading-relaxed"
                    style={{ color: '#6b6b6b' }}
                  >
                    <span style={{ color: GOLD, flexShrink: 0 }}>—</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <PawtrackFooter />
    </div>
  )
}
