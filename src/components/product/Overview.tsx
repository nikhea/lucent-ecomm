import { RichText } from '@/components/RichText'
import { Check } from 'lucide-react'
import React from 'react'
import type { Product } from '@/payload-types'

const fallbackFeatures = [
  { title: 'Premium Fabric', desc: 'Soft, breathable and sustainably sourced for all-day comfort.' },
  { title: 'Flattering Fit', desc: 'Tailored to accentuate silhouette while allowing ease of movement.' },
  { title: 'Versatile Styling', desc: 'Dress up or down — from desk to dinner with effortless elegance.' },
  { title: 'Easy Care', desc: 'Machine washable, wrinkle-resistant and designed to last season after season.' },
]

export function Overview({ product }: { product: Product }) {
  const title = (product as any).overviewTitle || 'Crafted for Everyday Elegance'
  const content = (product as any).overviewContent
  const features = ((product as any).overviewFeatures as { title: string; description: string }[]) || fallbackFeatures

  return (
    <div className="border-t pt-10 mt-10">
      <div className="text-xs tracking-widest text-muted-foreground mb-2">OVERVIEW</div>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-8">
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
          {content ? <RichText data={content} enableGutter={false} /> : product.description ? <RichText data={product.description} enableGutter={false} /> : <p>Premium fashion crafted for everyday elegance. Designed in-house for Lucent with sustainable fabrics and timeless cuts.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {features.map((f: any) => (
            <div key={f.title} className="flex gap-3">
              <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3 w-3" />
              </span>
              <div>
                <div className="text-sm font-medium">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.description || (f as any).desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
