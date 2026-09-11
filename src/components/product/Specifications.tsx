import React from 'react'

import type { Product } from '@/payload-types'

const fallbackSections = [
  {
    title: 'DETAILS',
    rows: [
      ['Fit', 'True to size, model is 178cm wearing size S'],
      ['Length', 'Midi / Maxi available, see size guide'],
      ['Care', 'Machine wash cold, hang dry'],
    ],
  },
  {
    title: 'FABRIC & CARE',
    rows: [
      ['Fabric', 'Premium blend, breathable and soft'],
      ['Weight', 'Lightweight, 180 GSM'],
      ['Origin', 'Designed in-house, ethically made'],
    ],
  },
  {
    title: 'SHIPPING',
    rows: [
      ['Delivery', 'Free shipping over $99, 2-3 business days'],
      ['Returns', '30-day free returns, tags attached'],
    ],
  },
]

export function Specifications({ product }: { product?: Product }) {
  const sections = ((product as any)?.specifications as { group: string; rows: { label: string; value: string }[] }[]) || []
  const displaySections =
    sections.length > 0
      ? sections.map((s) => ({ title: s.group, rows: s.rows.map((r) => [r.label, r.value] as [string, string]) }))
      : fallbackSections

  const title = displaySections.length ? 'Product Details' : 'Built Like A Pro Tool, Tuned For Daily Use'

  return (
    <div className="pt-10 mt-10 border-t">
      <div className="text-xs tracking-widest text-muted-foreground mb-2">SPECIFICATIONS</div>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="rounded-xl border overflow-hidden">
        {displaySections.map((sec) => (
          <div key={sec.title}>
            <div className="bg-muted px-4 py-2 text-xs font-semibold tracking-widest">{sec.title}</div>
            {sec.rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 px-4 py-3 border-t text-sm">
                <div className="text-muted-foreground">{k}</div>
                <div className="text-foreground">{v}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
