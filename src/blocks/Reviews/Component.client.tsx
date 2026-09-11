'use client'
import { Media } from '@/components/Media'
import { Star } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'

type Item = {
  id?: string | null
  quote: string
  authorName: string
  authorRole: string
  avatar?: any
  rating: number
}

export function ReviewsClient({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const onScroll = () => {
    if (!ref.current) return
    const el = ref.current
    const scrollLeft = el.scrollLeft
    const width = el.clientWidth
    const idx = Math.round(scrollLeft / (width * 0.85 * 0.33 + 16))
    setActive(Math.min(Math.max(idx, 0), items.length - 1))
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (i: number) => {
    if (!ref.current) return
    const el = ref.current
    const card = el.children[i] as HTMLElement
    if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  return (
    <>
      <div ref={ref} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => (
          <div key={item.id} className="snap-start shrink-0 w-[85%] sm:w-[340px] lg:w-[380px] rounded-2xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col min-h-[220px]">
            <div className="text-4xl leading-none text-neutral-700 font-serif">“</div>
            <p className="text-sm leading-relaxed text-neutral-100 flex-1 -mt-2">“{item.quote}”</p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-8 w-8 rounded-full bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                {item.avatar && typeof item.avatar === 'object' && item.avatar.url ? (
                  <Media resource={item.avatar} className="h-full w-full" imgClassName="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold">{item.authorName[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-none truncate">{item.authorName}</div>
                <div className="text-xs text-neutral-400 truncate">{item.authorRole}</div>
              </div>
              <div className="flex text-yellow-400 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < (item.rating || 5) ? 'fill-yellow-400' : 'fill-transparent'}`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to review ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-1.5 bg-neutral-700'}`}
          />
        ))}
      </div>
    </>
  )
}
