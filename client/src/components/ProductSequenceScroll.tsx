import { useEffect, useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import type { Product } from '../data/products'

// Vite glob import: eagerly loads all 300 frames as URLs
const frameModules = import.meta.glob<{ default: string }>(
  '../assets/canvas/ezgif-frame-*.jpg',
  { eager: true }
)

// Build a sorted array of image URLs
const FRAME_URLS: string[] = Object.entries(frameModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, mod]) => mod.default)

const TOTAL_FRAMES = FRAME_URLS.length   // 300

interface Props {
  product: Product
}

export default function ProductSequenceScroll({ product }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const stickyRef    = useRef<HTMLDivElement>(null)
  const imagesRef    = useRef<HTMLImageElement[]>([])
  const loadedRef    = useRef(0)
  const rafRef       = useRef<number | null>(null)
  const currentFrame = useRef(0)

  // ── Preload all frames ─────────────────────────────────────────────────────
  useEffect(() => {
    imagesRef.current = []
    loadedRef.current = 0

    FRAME_URLS.forEach((url, i) => {
      const img = new Image()
      img.src = url
      img.onload = () => { 
        loadedRef.current++ 
        if (i === currentFrame.current) {
          drawFrame(i)
        }
      }
      imagesRef.current[i] = img
    })
  }, [])

  // ── Canvas resize (object-contain) ────────────────────────────────────────
  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    drawFrame(currentFrame.current)
  }

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  })

  // ── Draw a specific frame (object-cover: fills full viewport) ──────────────
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = imagesRef.current[idx]
    if (!img?.complete || img.naturalWidth === 0) return

    const { width: cw, height: ch } = canvas
    const iw = img.naturalWidth
    const ih = img.naturalHeight

    // object-cover: scale to fill, crop excess
    const scale = Math.max(cw / iw, ch / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2

    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, dx, dy, dw, dh)
  }

  // ── Framer Motion scroll tracking ─────────────────────────────────────────
  // scrollYProgress covers the full page (0→1 across 500vh sticky wrapper)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Map scroll progress → frame index
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v: number) => {
      const clamp = Math.min(1, Math.max(0, v))
      const idx   = Math.min(TOTAL_FRAMES - 1, Math.floor(clamp * TOTAL_FRAMES))
      if (idx === currentFrame.current) return
      currentFrame.current = idx
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => drawFrame(idx))
    })
    return () => {
      unsubscribe()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [scrollYProgress])

  // ── Product switch: redraw first frame ────────────────────────────────────
  useEffect(() => {
    currentFrame.current = 0
    drawFrame(0)
  }, [product.id])

  return (
    // 500vh scroll room → sticky inner keeps canvas pinned
    <div ref={containerRef} className="relative h-[500vh]">
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        style={{ background: product.gradient }}
      >
        {/* Radial vignette for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, #000000 100%)',
          }}
        />

        {/* Canvas — fills full sticky area */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Scroll hint — fades out after first 10% */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.08], [1, 0]) }}
        >
          <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  )
}
