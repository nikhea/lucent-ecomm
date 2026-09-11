'use client'
import { cn } from '@/utilities/cn'
import { Check } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import type { Product, VariantOption } from '@/payload-types'

export function VariantPlugType({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variantTypes = (product.variantTypes || []).filter((t: any) => typeof t === 'object') as any[]
  const plugType = variantTypes.find((t: any) => t.name === 'size') || variantTypes[1]
  const options = (plugType?.options?.docs || []).filter((o: any) => typeof o === 'object') as VariantOption[]
  const variants = (product.variants?.docs || []).filter((v: any) => typeof v === 'object') as any[]
  if (!options.length) return null

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2">
        {plugType.label}: <span className="text-foreground">{searchParams.get(plugType.name) ? options.find((o) => String(o.id) === searchParams.get(plugType.name))?.label : options[0]?.label}</span>
      </div>
      <div className="flex gap-2">
        {options.map((opt) => {
          const active = searchParams.get(plugType.name) === String(opt.id)
          const optionSearchParams = new URLSearchParams(searchParams.toString())
          optionSearchParams.delete('variant')
          optionSearchParams.set(plugType.name, String(opt.id))
          const currentOptions = Array.from(optionSearchParams.values())
          let isAvailable = true
          const matching = variants.find((v: any) => v.options?.every((o: any) => currentOptions.includes(String(typeof o === 'object' ? o.id : o))))
          if (matching) {
            optionSearchParams.set('variant', String(matching.id))
            isAvailable = (matching.inventory ?? 0) > 0
          }
          const href = `${pathname}?${optionSearchParams.toString()}`
          return (
            <button
              key={opt.id}
              onClick={() => router.replace(href, { scroll: false })}
              disabled={!isAvailable}
              className={cn(
                'relative flex-1 rounded-lg border px-3 py-2 text-xs font-medium',
                active ? 'bg-black text-white border-black' : 'bg-white border text-foreground hover:bg-muted',
                !isAvailable && 'opacity-50',
              )}
            >
              {opt.label}
              {active && <Check className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-white p-0.5 border" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
