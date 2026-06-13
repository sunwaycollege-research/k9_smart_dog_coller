import { PawPrint } from 'lucide-react'
import './TopNav.css'

export default function TopNav() {
  return (
    <nav className="tnav">
      <div className="tnav-brand">
        <div className="tnav-logo">
          <PawPrint size={18} strokeWidth={2.5} />
        </div>
        <span className="tnav-title">PawTrack</span>
      </div>
    </nav>
  )
}
