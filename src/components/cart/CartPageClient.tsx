'use client'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { getCartItemName, getCartItemStock } from '@/utilities/stock'
import { Button } from '@/components/ui/button'
import { Package, ShieldCheck, Store } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import type { Product } from '@/payload-types'
import { useOptimisticCart } from '@/store/cart'

function CartItemCard({ item, idx, onIncrement, onDecrement, onRemove }: { item: any; idx: number; onIncrement: (id: string) => void; onDecrement: (id: string) => void; onRemove: (id: string) => void }) {
  const product = item.product as Product
  const variant = item.variant as any
  const { outOfStock } = getCartItemStock(item)
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
    <div className={`rounded-xl border bg-card overflow-hidden ${outOfStock ? 'border-[#d29e9e]' : ''}`}>
      <div className="flex gap-4 p-4">
        <div className="h-24 w-24 shrink-0 rounded-lg bg-muted overflow-hidden relative">
          {image && typeof image === 'object' && image.url ? (
            <Media resource={image as any} className="h-full w-full" imgClassName={`h-full w-full object-cover ${outOfStock ? 'opacity-40 grayscale blur-[1px]' : ''}`} />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          {outOfStock && (
            <span className="absolute inset-x-1 bottom-1 rounded bg-[#e6bcbc] px-1 py-0.5 text-center text-[10px] font-semibold text-black">
              Out of stock
            </span>
          )}
        </div>
        <div className={`flex-1 min-w-0 ${outOfStock ? 'opacity-70' : ''}`}>
          <div className="flex justify-between gap-2">
            <div>
              <Link href={`/products/${product.slug}`} className="text-sm font-semibold leading-tight hover:underline">
                {product.title}
              </Link>
              {variantLabel && <div className="text-xs text-muted-foreground mt-0.5">{variantLabel}</div>}
              {outOfStock && (
                <Badge variant="destructive" className="mt-1 border-[#d29e9e] bg-[#e6bcbc] text-black hover:bg-[#e6bcbc]">
                  {getCartItemStock(item).reason === 'no-variant' ? 'No size selected — remove to checkout' : 'Out of stock — remove to checkout'}
                </Badge>
              )}
            </div>
            <button onClick={() => onRemove(item.id)} className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted">
              <span className="text-muted-foreground">🗑</span>
            </button>
          </div>
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center rounded-lg border overflow-hidden h-8">
              <button onClick={() => onDecrement(item.id)} className="h-8 w-8 flex items-center justify-center hover:bg-muted">
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button onClick={() => onIncrement(item.id)} className="h-8 w-8 flex items-center justify-center hover:bg-muted">
                +
              </button>
            </div>
            <div className="text-right">
              <Price as="span" amount={price} className="text-sm font-bold" />
              {hasCompare && <div className="text-xs line-through text-muted-foreground"><Price as="span" amount={comparePrice} /></div>}
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

function OrderSummary({ subtotal, itemCount, outOfStockNames }: { subtotal: number; itemCount: number; outOfStockNames: string[] }) {
  const shipping = 0
  const savings = Math.round(subtotal * 0.2)
  const total = subtotal

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <h2 className="font-semibold">Order Summary</h2>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <Price as="span" amount={subtotal} className="font-medium" />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{shipping === 0 ? 'Free' : <Price as="span" amount={shipping} />}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between">
            <span className="font-medium">You Save</span>
            <span className="font-medium">-<Price as="span" amount={savings} /></span>
          </div>
        )}
      </div>
      <hr />
      <div className="flex justify-between items-start">
        <span className="font-semibold">Total</span>
        <div className="text-right">
          <Price as="span" amount={total} className="font-bold text-lg" />
          <div className="text-xs text-muted-foreground">Including VAT, if applicable</div>
        </div>
      </div>
      {outOfStockNames.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Button disabled variant="outline" className="h-11 w-full cursor-not-allowed text-muted-foreground">
            Proceed to Checkout
          </Button>
          <p className="text-xs text-destructive">
            Remove out-of-stock {outOfStockNames.length === 1 ? 'item' : 'items'} to checkout: {outOfStockNames.join(', ')}
          </p>
        </div>
      ) : (
        <Button asChild className="w-full bg-black text-white hover:bg-black/90 h-11 cursor-pointer">
          <Link href="/checkout">
            <span className="flex items-center gap-2"><span className="border border-white/20 rounded p-0.5">◫</span> Proceed to Checkout</span>
          </Link>
        </Button>
      )}
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <span className="border rounded px-1 text-[10px]">—</span> Secure payment with SSL encryption
      </div>
    </div>
  )
}

export function CartPageClient() {
  const { cart, isLoading, incrementItem, decrementItem, removeItem } = useOptimisticCart()

  if (isLoading && !cart) {
    return (
      <div className="container py-12">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  const items = cart?.items || []
  const itemCount = items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0)
  const subtotal = items.reduce((sum: number, it: any) => {
    const p = it.product as any
    const v = it.variant as any
    const price = v?.priceInUSD ?? p?.priceInUSD ?? 0
    return sum + price * (it.quantity || 0)
  }, 0)

  if (!items.length) {
    return (
      <div className="container flex min-h-[60vh] flex-col justify-center py-16">
        <EmptyState preset="cart" title="Your Shopping Cart is empty" />
      </div>
    )
  }

  const outOfStockNames = items.filter((it: any) => getCartItemStock(it).outOfStock).map((it: any) => getCartItemName(it))

  return (
    <div className="container min-h-[60vh] py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
        <div className="text-sm text-muted-foreground mt-1">
          {itemCount} items in your cart • <Price as="span" amount={subtotal} className="font-medium text-foreground" />
        </div>
      </div>

      {outOfStockNames.length > 0 && (
        <div className="mb-6 rounded-xl border border-[#d29e9e] bg-[#e6bcbc] p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-black">Some items can't be checked out</p>
              <p className="mt-1 text-black/70">{outOfStockNames.join(', ')} — {items.some((it: any) => getCartItemStock(it).reason === 'no-variant') ? 're-add with a size selected, or remove' : 'remove'} {outOfStockNames.length === 1 ? 'it' : 'them'} to continue to checkout.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer border-[#c98f8f] bg-white/70 text-black hover:bg-white"
              onClick={() => {
                for (const it of items.filter((it: any) => getCartItemStock(it).outOfStock)) removeItem(it.id)
              }}
            >
              Remove all unavailable
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-6 items-start">
        <div className="flex flex-col gap-4">
          {items.map((item: any, idx: number) => (
            <CartItemCard key={(item as any).id || idx} item={item} idx={idx} onIncrement={incrementItem} onDecrement={decrementItem} onRemove={removeItem} />
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-[80px]">
          <OrderSummary subtotal={subtotal} itemCount={itemCount} outOfStockNames={outOfStockNames} />

          <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/30 p-4 flex gap-3">
            <span className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </span>
            <div>
              <div className="text-sm font-semibold dark:text-white">Secure Checkout</div>
              <div className="text-xs text-muted-foreground dark:text-white/60">Your payment information is encrypted and secure.</div>
            </div>
          </div>

          <Link href="/shop" className="rounded-xl border bg-card py-3 text-center text-sm font-medium hover:bg-muted flex items-center justify-center gap-2">
            <Store className="h-4 w-4" /> Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  )
}
