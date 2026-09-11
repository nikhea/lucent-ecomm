import { RichText } from '@/components/RichText'
import { Check } from 'lucide-react'
import React from 'react'
import type { Product } from '@/payload-types'

const features = [
  { title: 'Hybrid ANC', desc: 'Six mics adapt to street, office, and flight cabins automatically.' },
  { title: '40-Hour Battery', desc: 'Or 30 hours with ANC; 3 hours of playback from a 5-minute charge.' },
  { title: 'Multipoint Bluetooth', desc: 'Stay connected to a laptop and a phone at once with seamless switching.' },
  { title: 'Replaceable Ear Pads', desc: 'Memory-foam pads swap with a magnetic ring - no tools, no glue.' },
]

export function Overview({ product }: { product: Product }) {
  return (
    <div className="border-t border-white/10 pt-10 mt-10">
      <div className="text-xs tracking-widest text-white/50 mb-2">OVERVIEW</div>
      <h2 className="text-2xl font-bold mb-6">A Flagship Over-Ear, Refined Twice</h2>
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-8">
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-white/80">
          {product.description ? <RichText data={product.description} enableGutter={false} className="prose-invert" /> : <p>Premium fashion crafted for everyday elegance. Designed in-house for Lucent with sustainable fabrics and timeless cuts.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {features.map((f) => (
            <div key={f.title} className="flex gap-3">
              <span className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3 w-3" />
              </span>
              <div>
                <div className="text-sm font-medium">{f.title}</div>
                <div className="text-xs text-white/60">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
