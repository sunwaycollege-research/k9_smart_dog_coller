import { motion } from 'framer-motion'
import { Share2, Camera, Play, ArrowRight } from 'lucide-react'

const GOLD = '#C9A84C'

const SOCIAL = [
  { icon: Share2,  label: 'X'         },
  { icon: Camera,  label: 'Instagram' },
  { icon: Play,    label: 'YouTube'   },
]

export default function PawtrackFooter() {
  return (
    <footer className="relative border-t pt-20 pb-12 px-6 sm:px-14"
      style={{ background: 'linear-gradient(180deg, #050304 0%, #030202 100%)', borderColor: '#141008' }}>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${GOLD}14`, border: `1px solid ${GOLD}30` }}>
              <svg width="14" height="14" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="5" fill={GOLD} />
                <circle cx="11" cy="13" r="2.5" fill={GOLD} fillOpacity="0.65" />
                <circle cx="25" cy="13" r="2.5" fill={GOLD} fillOpacity="0.65" />
                <path d="M10 24 C10 20 13 17 18 17 C23 17 26 20 26 24"
                  stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span className="text-base font-black text-white tracking-tight">Pawtrack</span>
          </div>
          <p className="text-sm leading-relaxed max-w-[190px]" style={{ color: '#595959' }}>
            Premium IoT smart wearables for dogs. Because they deserve the best.
          </p>
          <div className="flex gap-2.5 mt-1">
            {SOCIAL.map(({ icon: Icon, label }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.1 }}
                aria-label={label}
                className="w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{ borderColor: '#262013', color: '#595959' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'
                  ;(e.currentTarget as HTMLElement).style.color = '#C9A84C'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#262013'
                  ;(e.currentTarget as HTMLElement).style.color = '#4d4d4d'
                }}
              >
                <Icon size={13} strokeWidth={1.8} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* App */}
        <div className="flex flex-col gap-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: `${GOLD}60` }}>App</span>
          {['Download for iOS', 'Download for Android', 'Changelog', 'API Docs'].map(t => (
            <span key={t} className="text-sm cursor-pointer transition-colors duration-200"
              style={{ color: '#595959' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#cccccc')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#595959')}
            >{t}</span>
          ))}
        </div>

        {/* Support */}
        <div className="flex flex-col gap-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: `${GOLD}60` }}>Support</span>
          {['Help Centre', 'Track Your Order', 'Warranty Claims', 'Contact Us'].map(t => (
            <span key={t} className="text-sm cursor-pointer transition-colors duration-200"
              style={{ color: '#595959' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#cccccc')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#595959')}
            >{t}</span>
          ))}
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: `${GOLD}60` }}>Newsletter</span>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Product updates and dog care tips delivered to you.
          </p>
          <div className="flex mt-1 gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 min-w-0 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(201,168,76,0.15)',
                color: 'rgba(255,255,255,0.8)',
              }}
              onFocus={e => ((e.currentTarget as HTMLInputElement).style.borderColor = `${GOLD}45`)}
              onBlur={e => ((e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(201,168,76,0.15)')}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-lg px-3 py-2.5 flex items-center justify-center transition-all"
              style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}30`, color: GOLD }}
            >
              <ArrowRight size={15} strokeWidth={2} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2026 Pawtrack Systems Inc. All rights reserved.
        </p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Cookies'].map(t => (
            <span key={t} className="text-xs cursor-pointer transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = `${GOLD}80`)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)')}
            >{t}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
