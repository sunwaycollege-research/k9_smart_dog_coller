import { PawPrint, Check } from 'lucide-react'
import './TopNav.css'

const STEPS = ['Login', 'Select pet', 'Pet details', 'Dashboard']

interface Props {
  currentStep: number
}

export default function TopNav({ currentStep }: Props) {
  return (
    <nav className="tnav">
      <div className="tnav-brand">
        <div className="tnav-logo">
          <PawPrint size={18} strokeWidth={2.5} />
        </div>
        <span className="tnav-title">PawTrack</span>
      </div>

      <ol className="tnav-steps">
        {STEPS.map((label, i) => (
          <li key={i} className="tnav-step-item">
            {i > 0 && (
              <div className={`tnav-line${i <= currentStep ? ' done' : ''}`} />
            )}
            <div className={`tnav-step${i < currentStep ? ' done' : i === currentStep ? ' active' : ''}`}>
              <div className="tnav-dot">
                {i < currentStep
                  ? <Check size={10} strokeWidth={3.5} />
                  : <span>{i + 1}</span>
                }
              </div>
              <span className="tnav-label">{label}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="tnav-hint">Step {currentStep + 1} of 4</div>
    </nav>
  )
}
