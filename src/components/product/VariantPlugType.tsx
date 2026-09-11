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
  // Use size variant as plug type for fashion (or generic second variant type)
  const variantTypes = (product.variantTypes || []).filter((t: any) => typeof t === 'object') as any[]
  const plugType = variantTypes.find((t: any) => t.name === 'size') || variantTypes[1]
  const options = (plugType?.options?.docs || []).filter((o: any) => typeof o === 'object') as VariantOption[]
  if (!options.length) return null

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2">
        {plugType.label}: <span className="text-foreground">{searchParams.get(plugType.name) ? options.find((o) => String(o.id) === searchParams.get(plugType.name))?.label : options[0]?.label}</span>
      </div>
      <div className="flex gap-2">
        {options.map((opt) => {
          const active = searchParams.get(plugType.name) === String(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set(plugType.name, String(opt.id))
                params.delete('variant')
                router.replace(`${pathname}?${params.toString()}`, { scroll: false })
              }}
              className={cn(
                'relative flex-1 rounded-lg border px-3 py-2 text-xs font-medium',
                active ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-white hover:bg-white/10',
              )}
            >
              {opt.label}
              {active && <Check className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white text-black p-0.5 border" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
