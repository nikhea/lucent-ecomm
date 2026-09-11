'use client'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Heart, ShoppingBag, Star, Check } from 'lucide-react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import type { Product, Variant } from '@/payload-types'

const badgeStyles: Record<string, string> = {
  sale: 'bg-red-500 text-white',
  bestseller: 'bg-emerald-500 text-white',
  new: 'bg-white text-black',
  limited: 'bg-amber-400 text-black',
}

type Props = {
  product: Partial<Product>
  badge?: string
  badgeLabel?: string
}

export function ShopProductCard({ product, badge = 'none', badgeLabel }: Props) {
  const galleryImage = product.gallery?.[0]?.image
  const brand = (product.categories?.[0] && typeof product.categories[0] === 'object' ? (product.categories[0] as any).title : 'HALDEN') as string
  const price = product.priceInUSD || 0
  const comparePrice = badge === 'sale' ? price + 4300 : null
  const hasVariants = !!product.enableVariants
  const variants = (product.variants?.docs || []).filter((v): v is Variant => typeof v === 'object') as Variant[]
  const sizeType = (product.variantTypes || []).find((t: any) => typeof t === 'object' && t.name === 'size') as any
  const sizeOptions = (sizeType?.options?.docs || []).filter((o: any) => typeof o === 'object') as any[]
  const sizes = sizeOptions.length ? sizeOptions.map((o) => ({ label: o.label, value: o.value, id: o.id })) : ['XS', 'S', 'M', 'L', 'XL'].map((l) => ({ label: l, value: l.toLowerCase(), id: l }))
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const { addItem, isLoading } = useCart()

  const selectedVariant = useMemo(() => {
    if (!hasVariants || !selectedSize) return undefined
    const sizeOpt = sizes.find((s) => s.label === selectedSize || s.value === selectedSize.toLowerCase())
    if (!sizeOpt) return undefined
    const candidates = variants.filter((v) => v.options?.some((o: any) => String(typeof o === 'object' ? o.id : o) === String(sizeOpt.id)))
    return candidates.find((v: any) => (v.inventory ?? 0) > 0) || candidates[0]
  }, [hasVariants, selectedSize, sizes, variants])

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasVariants && !selectedVariant) {
      toast.error('Please select a size')
      return
    }
    try {
      await addItem({ product: product.id!, variant: selectedVariant?.id, quantity: 1 } as any)
      toast.success('Added to bag')
    } catch {
      toast.error('Failed to add to bag')
    }
  }

  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden rounded-xl bg-neutral-900 aspect-[4/5]">
        {galleryImage && typeof galleryImage === 'object' ? (
          <Media resource={galleryImage as any} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" fill />
        ) : (
          <div className="absolute inset-0 bg-neutral-800" />
        )}
        {badge !== 'none' && badgeLabel && (
          <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${badgeStyles[badge] || badgeStyles.sale}`}>{badgeLabel}</span>
        )}
        <button className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/70 backdrop-blur flex items-center justify-center text-white hover:bg-black">
          <Heart className="h-4 w-4" />
        </button>
        <div className="absolute inset-x-2 bottom-2 bg-black/90 backdrop-blur rounded-xl p-2 flex flex-col gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-1 justify-center">
            {sizes.slice(0, 5).map((size) => {
              const label = (size as any).label || size
              const active = selectedSize === label
              return (
                <button
                  key={String(label)}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedSize(active ? null : String(label))
                  }}
                  className={`relative flex-1 text-center text-xs py-1.5 rounded-lg border ${active ? 'bg-white text-black border-white' : 'border-white/20 text-white'}`}
                >
                  {label}
                  {active && <Check className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white text-black border p-0.5" />}
                </button>
              )
            })}
          </div>
          <button
            onClick={handleAdd}
            disabled={!!(hasVariants && !selectedVariant) || !!isLoading}
            className="w-full bg-white text-black hover:bg-white/90 text-xs h-8 rounded-lg flex items-center justify-center gap-1 font-medium disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> {hasVariants ? (selectedSize ? 'Add to Bag' : 'Select Size') : 'Add to Bag'}
          </button>
        </div>
      </div>
      <div className="pt-3 flex flex-col gap-1">
        <div className="text-xs tracking-widest text-neutral-400 uppercase">{String(brand).toUpperCase()}</div>
        <Link href={`/products/${product.slug}`} className="text-sm font-medium leading-tight hover:underline flex items-center gap-2">
          <span>{product.title}</span>
          <span className="flex text-yellow-400 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400" />
            ))}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Price amount={price} className="text-sm font-bold" />
          {comparePrice && <span className="text-xs line-through text-neutral-500"><Price amount={comparePrice} /></span>}
        </div>
        <div className="text-xs text-neutral-500">Free shipping · Ships in 2-3 days</div>
      </div>
    </div>
  )
}
