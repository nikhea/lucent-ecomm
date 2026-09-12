'use client'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Heart, ShoppingBag, Check, Star } from 'lucide-react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import type { FeaturedProductsBlock, Variant } from '@/payload-types'

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
            const variants = ((product as any).variants?.docs || []).filter((v: any) => typeof v === 'object') as Variant[]
            const hasVariants = !!(product as any).enableVariants
            const variantTypes = ((product as any).variantTypes || []).filter((t: any) => typeof t === 'object') as any[]
            const sizeType = variantTypes.find((t: any) => t.name === 'size') || variantTypes[0] as any
            const sizeOptions = (sizeType?.options?.docs || []).filter((o: any) => typeof o === 'object') as any[]
            const sizes = sizeOptions.length
              ? sizeOptions.map((o: any) => ({ label: o.label, value: o.value, id: o.id }))
              : hasVariants
                ? ['XS', 'S', 'M', 'L', 'XL'].map((l: any) => ({ label: l, value: l.toLowerCase(), id: l }))
                : []
            return <ProductCardInner key={item.id} product={product} galleryImage={galleryImage} brand={brand} price={price} comparePrice={comparePrice} badgeKey={badgeKey} badgeLabel={badgeLabel} sizes={sizes} variants={variants} />
          })}
        </div>
      </div>
    </div>
  )
}

function ProductCardInner({ product, galleryImage, brand, price, comparePrice, badgeKey, badgeLabel, sizes, variants }: any) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const { addItem, isLoading } = useCart()
  const hasVariants = !!product.enableVariants
  const selectedVariant = useMemo(() => {
    if (!hasVariants || !sizes.length) return undefined
    if (!selectedSize) return undefined
    const sizeOpt = sizes.find((s: any) => s.label === selectedSize || s.value === selectedSize.toLowerCase() || String(s.id) === selectedSize)
    if (!sizeOpt) return undefined
    const candidates = variants.filter((v: any) =>
      v.options?.some((o: any) => {
        const oid = String(typeof o === 'object' ? o.id : o)
        const label = typeof o === 'object' ? (o as any).label : ''
        const value = typeof o === 'object' ? (o as any).value : ''
        return oid === String(sizeOpt.id) || label === sizeOpt.label || (value && value.toLowerCase() === String(sizeOpt.value).toLowerCase())
      }),
    )
    if (!candidates.length) {
      if (variants.length && hasVariants) return variants.find((v: any) => (v.inventory ?? 0) > 0) || variants[0]
      return undefined
    }
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
      await addItem({ product: product.id, variant: (selectedVariant as any)?.id, quantity: 1 } as any)
      toast.success('Added to bag')
    } catch {
      toast.error('Failed to add to bag')
    }
  }
  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden rounded-xl bg-neutral-900 aspect-[4/5]">
        {galleryImage && typeof galleryImage === 'object' ? (
          <Media resource={galleryImage} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" fill />
        ) : (
          <div className="absolute inset-0 bg-neutral-800" />
        )}
        {badgeKey !== 'none' && badgeLabel && <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${badgeStyles[badgeKey]}`}>{badgeLabel}</span>}
        <button className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/70 backdrop-blur flex items-center justify-center text-white hover:bg-black">
          <Heart className="h-4 w-4" />
        </button>
        {sizes.length > 0 ? (
          <div className="absolute inset-x-2 bottom-2 bg-black/90 backdrop-blur rounded-xl p-2 flex flex-col gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex gap-1 justify-center">
              {sizes.slice(0, 5).map((size: any) => {
                const label = size.label
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
              disabled={!!(hasVariants && !selectedVariant) || !!isLoading || !!(hasVariants && selectedVariant && (selectedVariant as any).inventory !== null && (selectedVariant as any).inventory <= 0)}
              className="w-full bg-white text-black hover:bg-white/90 text-xs h-8 rounded-lg flex items-center justify-center gap-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed not-disabled:cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5 mr-1" /> {hasVariants ? (selectedSize ? 'Add to Bag' : 'Select Size') : 'Add to Bag'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={!!isLoading}
            className="absolute inset-x-2 bottom-2 bg-white text-black hover:bg-white/90 text-xs h-8 rounded-lg flex items-center justify-center gap-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed not-disabled:cursor-pointer translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Add to Bag
          </button>
        )}
      </div>
      <div className="pt-3 flex flex-col gap-1">
        <div className="text-xs tracking-widest text-neutral-400 uppercase">{String(brand).toUpperCase()}</div>
        <div className="flex items-center gap-2">
          <Link href={`/products/${product.slug}`} className="text-sm font-medium leading-tight hover:underline">
            {product.title}
          </Link>
          <span className="flex text-yellow-400 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400" />
            ))}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Price amount={price} className="text-sm font-bold" />
          {comparePrice && <span className="text-xs line-through text-neutral-500"><Price amount={comparePrice} /></span>}
        </div>
        <div className="text-xs text-neutral-500">Free shipping · Ships in 2-3 days</div>
      </div>
    </div>
  )
}
