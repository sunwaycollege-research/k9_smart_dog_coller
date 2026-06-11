import { useState } from 'react'
import { ChevronDown, ArrowRight, Radio } from 'lucide-react'
import './forms.css'
import './SelectPet.css'

const ANIMALS = [
  {
    key: 'Dog', emoji: '🐕',
    breeds: ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Beagle', 'Poodle', 'Husky', 'Rottweiler', 'Dachshund', 'Shih Tzu'],
  },
  {
    key: 'Cat', emoji: '🐈',
    breeds: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Ragdoll', 'Sphynx', 'British Shorthair', 'Abyssinian', 'Scottish Fold', 'Burmese'],
  },
  {
    key: 'Rabbit', emoji: '🐰',
    breeds: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Lionhead', 'Flemish Giant', 'Angora', 'Dutch', 'Rex', 'Himalayan', 'American'],
  },
]

interface Props {
  onNext: () => void
}

export default function SelectPet({ onNext }: Props) {
  const [selected, setSelected] = useState(0)
  const [breed, setBreed] = useState(ANIMALS[0].breeds[0])

  const handleAnimal = (i: number) => {
    setSelected(i)
    setBreed(ANIMALS[i].breeds[0])
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
              <span className="animal-em">{a.emoji}</span>
              <span className="animal-lbl">{a.key}</span>
            </button>
          ))}
        </div>

        <div className="breed-section">
          <span className="section-label">{ANIMALS[selected].key} breed</span>
          <div className="collar-badge">
            <Radio size={12} strokeWidth={2} />
            Collar ID: V-GNN3
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

        <button className="btn-primary full" onClick={onNext}>
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
