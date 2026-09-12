'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import React from 'react'
import { createUrl } from '@/utilities/createUrl'

export function ProductResultsHeader({ total, filteredCount }: { total: number; filteredCount: number }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const active: { key: string; label: string; value: string }[] = []
  const cats = searchParams.get('categories')?.split(',').filter(Boolean) || (searchParams.get('category') ? [searchParams.get('category')!] : [])
  cats.forEach((c) => active.push({ key: 'categories', label: c, value: c }))
  const brands = searchParams.get('brands')?.split(',').filter(Boolean) || []
  brands.forEach((b) => active.push({ key: 'brands', label: `Brand: ${b}`, value: b }))
  const feats = searchParams.get('features')?.split(',').filter(Boolean) || []
  feats.forEach((f) => active.push({ key: 'features', label: f, value: f }))

  const remove = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get(key)?.split(',').filter(Boolean) || []
    const next = current.filter((v) => v !== value)
    if (next.length) params.set(key, next.join(','))
    else params.delete(key)
    if (key === 'categories' && params.has('category')) {
      const cat = params.get('category')
      if (cat === value) params.delete('category')
    }
    router.push(createUrl('/shop', params))
  }

  const count = active.length

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Product Results</div>
          <div className="text-xs text-muted-foreground">Showing filtered results ({count} filters applied)</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold">{filteredCount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">products found</div>
        </div>
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {active.map((a, i) => (
            <span key={`${a.key}-${a.value}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
              {a.label} <button onClick={() => remove(a.key, a.value)} className="ml-1 hover:text-foreground">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
