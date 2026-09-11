import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import Link from 'next/link'
import React from 'react'
import type { Media as MediaType, Product } from '@/payload-types'

export function RelatedDark({ products }: { products: Product[] }) {
  if (!products.length) return null
  return (
    <div className="pt-10 mt-10 border-t border-white/10">
      <div className="text-xs tracking-widest text-white/50 mb-2">YOU MAY ALSO LIKE</div>
      <h2 className="text-2xl font-bold mb-6">Pairs Well With Atlas Pro</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const img = p.meta?.image as MediaType
          return (
            <Link key={p.id} href={`/products/${p.slug}`} className="group">
              <div className="relative overflow-hidden rounded-xl bg-white aspect-square">
                {img && typeof img === 'object' && <Media resource={img} className="h-full w-full" imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform" />}
                <span className="absolute top-2 right-2 text-[10px] bg-white text-black px-2 py-1 rounded-full font-medium">
                  {p.title.includes('Mini') ? 'New' : p.title.includes('Loop') ? '' : p.title.includes('Replacement') ? 'Trending' : ''}
                </span>
              </div>
              <div className="pt-3">
                <div className="text-xs text-white/60">Accessories • {p.title.includes('Mini') ? 'Wireless' : 'Parts'}</div>
                <div className="text-sm font-medium mt-1">{p.title}</div>
                <Price amount={p.priceInUSD || 0} className="text-sm font-bold mt-1" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
