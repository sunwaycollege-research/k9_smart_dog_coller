import { useState } from 'react'
import { ChevronDown, ArrowRight, Radio, PawPrint } from 'lucide-react'
import { useAppDispatch } from '../store/hooks'
import { saveSelection } from '../store/slices/petSlice'
import './forms.css'
import './SelectPet.css'

const ANIMALS = [
  {
    key: 'Dog',
    breeds: ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Beagle', 'Poodle', 'Husky', 'Rottweiler', 'Dachshund', 'Shih Tzu'],
  },
  {
    key: 'Cat',
    breeds: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Ragdoll', 'Sphynx', 'British Shorthair', 'Abyssinian', 'Scottish Fold', 'Burmese'],
  },
  {
    key: 'Rabbit',
    breeds: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Lionhead', 'Flemish Giant', 'Angora', 'Dutch', 'Rex', 'Himalayan', 'American'],
  },
]

const COLLAR_ID = 'V-GNN3'

interface Props {
  onNext: () => void
}

export default function SelectPet({ onNext }: Props) {
  const dispatch = useAppDispatch()
  const [selected, setSelected] = useState(0)
  const [breed,    setBreed]    = useState(ANIMALS[0].breeds[0])

  const handleAnimal = (i: number) => {
    setSelected(i)
    setBreed(ANIMALS[i].breeds[0])
  }

  const handleContinue = () => {
    dispatch(saveSelection({
      species:  ANIMALS[selected].key,
      breed,
      collarId: COLLAR_ID,
    }))
    onNext()
  }

  return (
    <div className="sp-page">
      <div className="sp-card">
        <div className="sp-header">
          <h2>What's your pet?</h2>
          <p>Select species — we'll tailor collar settings</p>
        </div>

        <span className="section-label">Choose animal</span>
        <div className="animal-grid">
          {ANIMALS.map((a, i) => (
            <button
              key={a.key}
              className={`animal-btn${selected === i ? ' sel' : ''}`}
              onClick={() => handleAnimal(i)}
            >
              <span className="animal-em"><PawPrint size={20} strokeWidth={1.8} /></span>
              <span className="animal-lbl">{a.key}</span>
            </button>
          ))}
        </div>

        <div className="breed-section">
          <span className="section-label">{ANIMALS[selected].key} breed</span>
          <div className="collar-badge">
            <Radio size={12} strokeWidth={2} />
            Collar ID: {COLLAR_ID}
          </div>
          <div className="sp-select-wrap">
            <select value={breed} onChange={e => setBreed(e.target.value)}>
              {ANIMALS[selected].breeds.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown size={15} className="sp-chevron" />
          </div>
        </div>

        <div className="confirm-bar">
          Selected: <strong>{ANIMALS[selected].key}</strong> · <strong>{breed}</strong>
        </div>

        <div className="signal-bar">
          <span className="signal-dot" />
          <span>Signal: <strong>2/s</strong> · collar live and syncing</span>
        </div>

        <button className="btn-primary full" onClick={handleContinue}>
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
