import { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import type { Product } from '../data/products'

interface BeatConfig {
  text: { title: string; subtitle: string }
  scrollIn: number
  scrollPeak: number
  scrollOut: number
  align: 'left' | 'center' | 'right'
}

function getBeats(p: Product): BeatConfig[] {
  return [
    {
      text: p.section1,
      scrollIn: 0.00, scrollPeak: 0.06, scrollOut: 0.16,
      align: 'center',
    },
    {
      text: p.section2,
      scrollIn: 0.18, scrollPeak: 0.26, scrollOut: 0.36,
      align: 'left',
    },
    {
      text: p.section3,
      scrollIn: 0.40, scrollPeak: 0.48, scrollOut: 0.58,
      align: 'right',
    },
    {
      text: p.section4,
      scrollIn: 0.62, scrollPeak: 0.70, scrollOut: 0.82,
      align: 'center',
    },
  ]
}

interface BeatProps {
  beat: BeatConfig
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
  themeColor: string
}

function StoryBeat({ beat, scrollYProgress, themeColor }: BeatProps) {
  const opacity = useTransform(
    scrollYProgress,
    [beat.scrollIn, beat.scrollPeak, beat.scrollOut - 0.02, beat.scrollOut],
    [0, 1, 1, 0]
  )
  const y = useTransform(
    scrollYProgress,
    [beat.scrollIn, beat.scrollPeak],
    [40, 0]
  )

  const alignClass =
    beat.align === 'left'
      ? 'items-start text-left pl-8 sm:pl-16 md:pl-24'
      : beat.align === 'right'
      ? 'items-end text-right pr-8 sm:pr-16 md:pr-24'
      : 'items-center text-center'

  return (
    <motion.div
      style={{ opacity, y, pointerEvents: 'none' }}
      className={`absolute inset-0 flex flex-col justify-center ${alignClass}`}
    >
      <div className="max-w-lg">
        {/* Accent line */}
        <motion.div
          style={{ background: themeColor }}
          className="h-0.5 w-12 mb-6 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight"
          style={{ textShadow: '0 4px 32px #000000' }}
        >
          {beat.text.title}
        </h2>

        {beat.text.subtitle && (
          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed font-medium max-w-sm"
            style={{ textShadow: '0 2px 16px #000000' }}
          >
            {beat.text.subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}

interface Props {
  product: Product
}

export default function ProductTextOverlays({ product }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const beats = getBeats(product)

  return (
    // Must span same 500vh as ProductSequenceScroll
    <div
      ref={containerRef}
      className="absolute inset-0 h-[500vh] pointer-events-none"
    >
      {/* Sticky layer that overlays the canvas */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {beats.map((beat, i) => (
          <StoryBeat
            key={`${product.id}-beat-${i}`}
            beat={beat}
            scrollYProgress={scrollYProgress}
            themeColor={product.themeColor}
          />
        ))}
      </div>
    </div>
  )
}
