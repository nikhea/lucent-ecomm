'use client'
import { cn } from '@/utilities/cn'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import type { Product, VariantOption } from '@/payload-types'

const colorMap: Record<string, string> = {
  black: 'bg-black',
  white: 'bg-white border',
  beige: 'bg-[#d8c8b0]',
  blush: 'bg-[#f4c2c2]',
  sage: 'bg-[#8da399]',
  navy: 'bg-[#1a2340]',
  graphite: 'bg-[#2a2a2a]',
  blue: 'bg-blue-500',
}

export function VariantColor({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variantTypes = (product.variantTypes || []).filter((t): t is VariantOption | any => typeof t === 'object') as any[]
  const colorType = variantTypes.find((t: any) => t.name === 'color')
  const options = (colorType?.options?.docs || []).filter((o: any) => typeof o === 'object') as VariantOption[]
  if (!options.length) return null

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2">
        Color: <span className="text-foreground">{searchParams.get('color') ? options.find((o) => String(o.id) === searchParams.get('color'))?.label : options[0]?.label}</span>
      </div>
      <div className="flex gap-2">
        {options.map((opt) => {
          const active = searchParams.get('color') === String(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('color', String(opt.id))
                params.delete('variant')
                router.replace(`${pathname}?${params.toString()}`, { scroll: false })
              }}
              className={cn('h-8 w-8 rounded-full border-2', colorMap[opt.value] || 'bg-muted', active ? 'ring-2 ring-white border-white' : 'border-transparent')}
              aria-label={opt.label}
              title={opt.label}
            />
          )
        })}
      </div>
    </div>
  )
}
