'use client'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { Package, Trash2, ShieldCheck, Store } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { DeleteItemButton } from '@/components/Cart/DeleteItemButton'
import { EditItemQuantityButton } from '@/components/Cart/EditItemQuantityButton'
import type { Product } from '@/payload-types'

function CartItemCard({ item, idx }: { item: any; idx: number }) {
  const product = item.product as Product
  const variant = item.variant as any
  if (typeof product !== 'object' || !product) return null

  const image =
    (variant && typeof variant === 'object'
      ? (product.gallery?.find((g: any) => {
          if (!g.variantOption) return false
          const id = typeof g.variantOption === 'object' ? g.variantOption.id : g.variantOption
          return variant.options?.some((o: any) => (typeof o === 'object' ? o.id : o) === id)
        })?.image as any)
      : null) ||
    (typeof product.gallery?.[0]?.image === 'object' ? product.gallery[0].image : product.meta?.image)

  const price = variant?.priceInUSD ?? product.priceInUSD ?? 0
  const comparePrice = variant?.compareAtPriceInUSD ?? (product as any).compareAtPriceInUSD
  const hasCompare = comparePrice && comparePrice > price
  const variantLabel = variant
    ? variant.options?.map((o: any) => (typeof o === 'object' ? o.label : o)).join(' • ')
    : (product as any).inventory !== undefined
      ? 'One Size'
      : ''

  const deliveryMap = ['Estimated delivery: 2-4 business days', 'Estimated delivery: 3-5 business days', 'Estimated delivery: 1-3 business days']
  const delivery = deliveryMap[idx % deliveryMap.length]

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="h-24 w-24 shrink-0 rounded-lg bg-muted overflow-hidden">
          {image && typeof image === 'object' && image.url ? (
            <Media resource={image as any} className="h-full w-full" imgClassName="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2">
            <div>
              <Link href={`/products/${product.slug}`} className="text-sm font-semibold leading-tight hover:underline">
                {product.title}
              </Link>
              {variantLabel && <div className="text-xs text-muted-foreground mt-0.5">{variantLabel}</div>}
            </div>
            <DeleteItemButton item={item} />
          </div>
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center rounded-lg border overflow-hidden h-8">
              <EditItemQuantityButton item={item} type="minus" />
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <EditItemQuantityButton item={item} type="plus" />
            </div>
            <div className="text-right">
              <Price amount={price} className="text-sm font-bold" />
              {hasCompare && <div className="text-xs line-through text-muted-foreground"><Price amount={comparePrice} /></div>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 bg-muted/30 border-t text-xs text-muted-foreground">
        <Package className="h-3.5 w-3.5" />
        {delivery}
      </div>
    </div>
  )
}

function OrderSummary({ subtotal, itemCount }: { subtotal: number; itemCount: number }) {
  const shipping = 0
  const savings = Math.round(subtotal * 0.2)
  const total = subtotal

  return (
    <div className="rounded-xl border bg-white p-5 flex flex-col gap-4">
      <h2 className="font-semibold">Order Summary</h2>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <Price amount={subtotal} className="font-medium" />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{shipping === 0 ? 'Free' : <Price amount={shipping} />}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between">
            <span className="font-medium">You Save</span>
            <span className="font-medium">-<Price amount={savings} /></span>
          </div>
        )}
      </div>
      <hr />
      <div className="flex justify-between items-start">
        <span className="font-semibold">Total</span>
        <div className="text-right">
          <Price amount={total} className="font-bold text-lg" />
          <div className="text-xs text-muted-foreground">Including VAT, if applicable</div>
        </div>
      </div>
      <Button asChild className="w-full bg-black text-white hover:bg-black/90 h-11">
        <Link href="/checkout">
          <span className="flex items-center gap-2"><span className="border border-white/20 rounded p-0.5">◫</span> Proceed to Checkout</span>
        </Link>
      </Button>
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <span className="border rounded px-1 text-[10px]">—</span> Secure payment with SSL encryption
      </div>
    </div>
  )
}

export function CartPageClient() {
  const { cart, isLoading } = useCart()

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  const items = cart?.items || []
  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0)
  const subtotal = cart?.subtotal || items.reduce((sum, it) => {
    const p = it.product as any
    const v = it.variant as any
    const price = v?.priceInUSD ?? p?.priceInUSD ?? 0
    return sum + price * (it.quantity || 0)
  }, 0)

  if (!items.length) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
        <p className="text-muted-foreground mt-2">Your cart is empty.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Continue Shopping →</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {itemCount} items in your cart • <Price amount={subtotal} className="font-medium text-foreground" />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-6 items-start">
        <div className="flex flex-col gap-4">
          {items.map((item, idx) => (
            <CartItemCard key={(item as any).id || idx} item={item} idx={idx} />
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-[80px]">
          <OrderSummary subtotal={subtotal} itemCount={itemCount} />

          <div className="rounded-xl border bg-amber-50 p-4 flex gap-3">
            <span className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
            </span>
            <div>
              <div className="text-sm font-semibold">Secure Checkout</div>
              <div className="text-xs text-muted-foreground">Your payment information is encrypted and secure.</div>
            </div>
          </div>

          <Link href="/shop" className="rounded-xl border bg-white py-3 text-center text-sm font-medium hover:bg-muted flex items-center justify-center gap-2">
            <Store className="h-4 w-4" /> Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  )
}
