import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingBag, Check } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import type { FeaturedProductsBlock } from '@/payload-types'

const badgeStyles: Record<string, string> = {
  sale: 'bg-red-500 text-white',
  bestseller: 'bg-emerald-500 text-white',
  new: 'bg-white text-black',
  limited: 'bg-amber-400 text-black',
  none: 'hidden',
}

export function FeaturedProductsBlock(props: FeaturedProductsBlock) {
  const items = (props.items || []) as any[]

  return (
    <div className="bg-black text-white py-10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {props.title && <h2 className="text-2xl font-bold mb-6">{props.title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => {
            const product = item.product && typeof item.product === 'object' ? item.product : null
            if (!product) return null
            const badgeKey = item.badge || 'none'
            const badgeLabel = item.badgeLabel || (badgeKey === 'sale' ? 'Sale' : badgeKey === 'bestseller' ? 'Bestseller' : badgeKey === 'new' ? 'New' : badgeKey === 'limited' ? 'Limited' : '')
            const galleryImage = product.gallery?.[0]?.image
            const brand = (product.categories?.[0] && typeof product.categories[0] === 'object' ? (product.categories[0] as any).title : 'HALDEN') as string
            const price = product.priceInUSD || 0
            const comparePrice = badgeKey === 'sale' ? price + 4300 : null

            return (
              <div key={item.id} className="group flex flex-col">
                <div className="relative overflow-hidden rounded-xl bg-neutral-900 aspect-[4/5]">
                  {galleryImage && typeof galleryImage === 'object' ? (
                    <Media resource={galleryImage} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" fill />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-800" />
                  )}
                  {badgeKey !== 'none' && badgeLabel && (
                    <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${badgeStyles[badgeKey]}`}>{badgeLabel}</span>
                  )}
                  <button className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/70 backdrop-blur flex items-center justify-center text-white hover:bg-black">
                    <Heart className="h-4 w-4" />
                  </button>

                  <div className="absolute inset-x-2 bottom-2 bg-black/90 backdrop-blur rounded-xl p-2 flex flex-col gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex gap-1 justify-center">
                      {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                        <span key={size} className="flex-1 text-center text-xs py-1.5 rounded-lg border border-white/20 text-white">
                          {size}
                        </span>
                      ))}
                    </div>
                    <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 text-xs h-8">
                      <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Add to Bag
                    </Button>
                  </div>
                </div>

                <div className="pt-3 flex flex-col gap-1">
                  <div className="text-xs tracking-widest text-neutral-400 uppercase">{String(brand).toUpperCase()}</div>
                  <Link href={`/products/${product.slug}`} className="text-sm font-medium leading-tight hover:underline">
                    {product.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Price amount={price} className="text-sm font-bold" />
                    {comparePrice && <span className="text-xs line-through text-neutral-500"><Price amount={comparePrice} /></span>}
                  </div>
                  <div className="text-xs text-neutral-500">Free shipping · Ships in 2-3 days</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
