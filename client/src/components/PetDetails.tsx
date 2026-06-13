import { useRef, useState } from 'react'
import { Camera, User, Calendar, Ruler, Palette, FileText, ArrowRight, AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { saveProfile } from '../store/slices/petSlice'
import './forms.css'
import './PetDetails.css'

import { useRegisterPetMutation, useAssignCollarMutation } from '../store/apiSlice'

interface Props {
  onNext: () => void
}

export default function PetDetails({ onNext }: Props) {
  const dispatch  = useAppDispatch()
  const user      = useAppSelector(s => s.auth.user)
  const selection = useAppSelector(s => s.pet.selection)

  const [registerPet, { isLoading: isRegistering }] = useRegisterPetMutation()
  const [assignCollar, { isLoading: isAssigning }] = useAssignCollarMutation()

  const [photo, setPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Form field state
  const [name,         setName]         = useState('')
  const [age,          setAge]          = useState('')
  const [gender,       setGender]       = useState('Male')
  const [breed,        setBreed]        = useState(selection?.breed ?? '')
  const [weight,       setWeight]       = useState('')
  const [color,        setColor]        = useState('')
  const [medicalNotes, setMedicalNotes] = useState('')
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?._id) {
      setErrorMsg('User not found. Please log in again.')
      return
    }
    setErrorMsg(null)

    try {
      // 1. Register pet
      const petRes = await registerPet({
        name,
        breed,
        age: parseInt(age) || 3,
        gender: gender.toLowerCase() as 'male' | 'female',
        color,
        weight: parseInt(weight) || 28,
        healthNotes: medicalNotes,
        owner: user._id,
      }).unwrap()

      // 2. Assign collar
      const collarModelNo = selection?.collarId || 'V-GNN3'
      await assignCollar({
        collarModelNo,
        petId: petRes.pet._id,
      }).unwrap()

      // 3. Save profile in state
      dispatch(saveProfile({ name, age, gender, breed, weight, color, medicalNotes, photoDataUrl: photo }))
      onNext()
    } catch (err: unknown) {
      console.error(err)
      const msg = (err as { data?: { message?: string } })?.data?.message
      setErrorMsg(msg ?? 'Failed to register pet and assign collar')
    }
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

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <div className="input-wrap">
                <User size={14} className="field-icon" />
                <input type="text" placeholder="Max" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label>Age</label>
              <div className="input-wrap">
                <Calendar size={14} className="field-icon" />
                <input type="text" placeholder="3 yrs" value={age} onChange={e => setAge(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div className="field">
              <label>Breed</label>
              <input type="text" placeholder="Golden Retriever" value={breed} onChange={e => setBreed(e.target.value)} />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Weight</label>
              <div className="input-wrap">
                <Ruler size={14} className="field-icon" />
                <input type="text" placeholder="28 kg" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Color</label>
              <div className="input-wrap">
                <Palette size={14} className="field-icon" />
                <input type="text" placeholder="Golden" value={color} onChange={e => setColor(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="field" style={{ marginBottom: '20px' }}>
            <label>Medical notes</label>
            <div className="textarea-wrap">
              <FileText size={14} className="ta-icon" />
              <textarea
                placeholder="Allergies, medications, vet info…"
                rows={3}
                value={medicalNotes}
                onChange={e => setMedicalNotes(e.target.value)}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="lv-error" style={{ marginBottom: 15, padding: 10, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, background: '#FCEBEB', color: '#ef4444' }}>
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          <button type="submit" className="btn-primary full" disabled={isRegistering || isAssigning}>
            {isRegistering || isAssigning ? 'Saving Pet Vitals…' : 'Go to dashboard'} <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
