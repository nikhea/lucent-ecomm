import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { WishlistHeartButton } from '@/components/wishlist/WishlistHeartButton'
import Link from 'next/link'
import React from 'react'
import type { Media as MediaType, Product } from '@/payload-types'

export function RelatedDark({ products, currentTitle }: { products: Product[]; currentTitle?: string }) {
  if (!products.length) return null
  return (
    <div className="pt-10 mt-10 border-t">
      <div className="text-xs tracking-widest text-muted-foreground mb-2">YOU MAY ALSO LIKE</div>
      <h2 className="text-2xl font-bold mb-6">{currentTitle ? `Pairs Well With ${currentTitle}` : 'You May Also Like'}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const img = (p.gallery?.[0]?.image as MediaType) || (p.meta?.image as MediaType)
          const category = p.categories?.[0] && typeof p.categories[0] === 'object' ? (p.categories[0] as any).title : null
          const brand = (p as any).brand || 'Lucent'
          const price = p.priceInUSD || 0
          const compare = (p as any).compareAtPriceInUSD
          const isSale = compare && compare > price
          const isNew = !isSale && p.createdAt && Date.now() - new Date(p.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
          const badge = isSale ? 'Sale' : isNew ? 'New' : ''
          return (
            <Link key={p.id} href={`/products/${p.slug}`} className="group">
              <div className="relative overflow-hidden rounded-xl bg-muted aspect-square border">
                {img && typeof img === 'object' && <Media resource={img} className="h-full w-full" imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform" />}
                <WishlistHeartButton productId={String(p.id)} className="absolute top-2 right-2" />
                {badge && (
                  <span className="absolute top-2 left-2 text-[10px] bg-background text-foreground px-2 py-1 rounded-full font-medium border">
                    {badge}
                  </span>
                )}
              </div>
              <div className="pt-3">
                <div className="text-xs text-muted-foreground">{[brand, category].filter(Boolean).join(' • ')}</div>
                <div className="text-sm font-medium mt-1">{p.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Price amount={price} className="text-sm font-bold" />
                  {isSale && <Price amount={compare} className="text-xs line-through text-muted-foreground" />}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
