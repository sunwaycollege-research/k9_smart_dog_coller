import { useEffect, useRef, useState } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import './PolicyModal.css'

interface Props {
  title:    string
  content:  React.ReactNode
  agreed:   boolean
  onAgree:  (v: boolean) => void
  onClose:  () => void
}

export default function PolicyModal({ title, content, agreed, onAgree, onClose }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(false)

  // Track scroll position to flip chevron → check
  const handleScroll = () => {
    const el = bodyRef.current
    if (!el) return
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8)
  }

  // Scroll down on chevron click
  const scrollDown = () => {
    bodyRef.current?.scrollBy({ top: 200, behavior: 'smooth' })
  }

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="pm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="pm-title">

        {/* Header */}
        <div className="pm-header">
          <h2 id="pm-title">{title}</h2>
          <button className="pm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="pm-body" ref={bodyRef} onScroll={handleScroll}>
          {content}
        </div>

        {/* Scroll-down chevron */}
        <button
          className={`pm-scroll-btn${atBottom ? ' at-bottom' : ''}`}
          onClick={scrollDown}
          aria-label="Scroll down"
          tabIndex={-1}
        >
          {atBottom ? <Check size={16} strokeWidth={2.5} /> : <ChevronDown size={18} />}
        </button>

        {/* Footer — agree checkbox + done */}
        <div className="pm-footer">
          <label className="pm-agree-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => onAgree(e.target.checked)}
              id={`agree-${title.replace(/\s+/g, '-').toLowerCase()}`}
            />
            <span>I have read and agree to the <strong>{title}</strong></span>
          </label>
          <button
            className="btn-primary pm-done-btn"
            onClick={onClose}
            disabled={!agreed}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}
