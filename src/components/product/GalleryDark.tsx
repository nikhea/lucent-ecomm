'use client'
import type { Media as MediaType, Product } from '@/payload-types'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/cn'
import { useSearchParams } from 'next/navigation'
import React from 'react'

type Props = { gallery: NonNullable<Product['gallery']> }

export function GalleryDark({ gallery }: Props) {
  const searchParams = useSearchParams()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    const values = Array.from(searchParams.values())
    const idx = gallery.findIndex((item) => {
      if (!item.variantOption) return false
      const id = typeof item.variantOption === 'object' ? (item.variantOption as any).id : String(item.variantOption)
      return values.includes(String(id))
    })
    if (idx !== -1) setCurrent(idx)
  }, [searchParams, gallery])

  const mainImage = gallery[current]?.image as MediaType

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
        {mainImage && typeof mainImage === 'object' && (
          <Media resource={mainImage} className="h-full w-full" imgClassName="h-full w-full object-cover" fill />
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {gallery.map((item, i) => {
          const img = item.image as MediaType
          if (typeof img !== 'object') return null
          return (
            <button
              key={`${img.id}-${i}`}
              onClick={() => setCurrent(i)}
              className={cn('relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white', i === current ? 'border-white ring-2 ring-white' : 'border-transparent opacity-70 hover:opacity-100')}
            >
              <Media resource={img} className="h-full w-full" imgClassName="h-full w-full object-cover" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
