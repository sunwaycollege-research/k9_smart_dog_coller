import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { PawPrint, User } from 'lucide-react'

export default function PawtrackNavbar({ themeColor }: { themeColor: string }) {
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated)

  return (
    /* Outer: full-width row, sits at top-8, pointer-events-none so canvas below stays clickable */
    <div className="fixed z-[999] top-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-6">

      {/* Inner pill — only this element is visible / interactive */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto flex items-center justify-between px-5 py-2.5 rounded-2xl"
        style={{
          width: '50vw',
          background: 'rgba(19, 17, 16, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 2px 12px rgba(19, 17, 16, 0.5)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: themeColor, boxShadow: `0 2px 12px ${themeColor}55` }}
          >
            <PawPrint size={16} strokeWidth={2.2} className="text-white" />
          </div>
          <span className="text-[15px] font-black text-white tracking-tight">Pawtrack</span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-white/10" />

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6">
          {[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }].map(({ label, href }) => (
            <button
              key={label}
              onClick={() => navigate(href)}
              className="text-[13px] font-medium text-white/50 hover:text-white/90 transition-colors duration-200"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-white/10" />

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          className="flex items-center gap-2 px-4 py-3 rounded-full text-[13px] font-bold text-white"
          style={{ background: themeColor, boxShadow: `0 2px 14px ${themeColor}50` }}
        >
          <User size={13} strokeWidth={2.5} />
          {isAuthenticated ? 'Dashboard' : 'Login'}
        </motion.button>
      </motion.nav>

    </div>
  )
}

