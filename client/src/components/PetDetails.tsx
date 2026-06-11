import { useRef, useState } from 'react'
import { Camera, User, Calendar, Ruler, Palette, FileText, ArrowRight } from 'lucide-react'
import './forms.css'
import './PetDetails.css'

interface Props {
  onNext: () => void
}

export default function PetDetails({ onNext }: Props) {
  const [photo, setPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  return (
    <div className="pd-page">
      <div className="pd-card">
        <div className="pd-header">
          <h2>Tell us about your pet</h2>
          <p>Personalises health baselines &amp; alerts</p>
        </div>

        {/* Photo upload */}
        <div
          className="photo-upload"
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          {photo ? (
            <img src={photo} className="photo-preview" alt="Pet profile" />
          ) : (
            <>
              <div className="pu-icon"><Camera size={28} strokeWidth={1.5} /></div>
              <span className="pu-title">Add profile photo</span>
              <span className="pu-sub">Click to upload or take photo</span>
            </>
          )}
        </div>

        <form onSubmit={e => { e.preventDefault(); onNext() }}>
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <div className="input-wrap">
                <User size={14} className="field-icon" />
                <input type="text" placeholder="Max" />
              </div>
            </div>
            <div className="field">
              <label>Age</label>
              <div className="input-wrap">
                <Calendar size={14} className="field-icon" />
                <input type="text" placeholder="3 yrs" />
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Gender</label>
              <select>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div className="field">
              <label>Breed</label>
              <input type="text" placeholder="Golden Retriever" />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Weight</label>
              <div className="input-wrap">
                <Ruler size={14} className="field-icon" />
                <input type="text" placeholder="28 kg" />
              </div>
            </div>
            <div className="field">
              <label>Color</label>
              <div className="input-wrap">
                <Palette size={14} className="field-icon" />
                <input type="text" placeholder="Golden" />
              </div>
            </div>
          </div>

          <div className="field" style={{ marginBottom: '20px' }}>
            <label>Medical notes</label>
            <div className="textarea-wrap">
              <FileText size={14} className="ta-icon" />
              <textarea placeholder="Allergies, medications, vet info…" rows={3} />
            </div>
          </div>

          <button type="submit" className="btn-primary full">
            Go to dashboard <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
