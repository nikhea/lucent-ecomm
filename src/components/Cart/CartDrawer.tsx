'use client'

import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { getCartItemStock } from '@/utilities/stock'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useOptimisticCart } from '@/store/cart'
import { cn } from '@/utilities/cn'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

export function CartDrawer() {
  const { cart, incrementItem, decrementItem, removeItem } = useOptimisticCart()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const items = cart?.items || []
  const outOfStockCount = useMemo(() => items.filter((it: any) => getCartItemStock(it).outOfStock).length, [items])
  const itemCount = useMemo(
    () => items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0),
    [items],
  )
  const subtotal = useMemo(
    () =>
      items.reduce((sum: number, it: any) => {
        const price = (it.variant as any)?.priceInUSD ?? (it.product as any)?.priceInUSD ?? 0
        return sum + price * (it.quantity || 0)
      }, 0),
    [items],
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button aria-label="Open cart" className="relative" size="icon" variant="ghost">
          <ShoppingCart data-icon="inline-start" />
          {itemCount > 0 && (
            <span
              suppressHydrationWarning
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white"
            >
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col gap-0" side="right">
        <SheetHeader className="text-left">
          <SheetTitle>Your Cart{itemCount > 0 ? ` (${itemCount})` : ''}</SheetTitle>
          <SheetDescription>
            {itemCount > 0 ? 'Review items, update quantity, then checkout.' : 'Your bag is empty.'}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 px-4 py-6">
            <EmptyState preset="cart" onAction={() => setIsOpen(false)} />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <ul className="flex flex-col gap-4 py-4">
                {items.map((item: any, i: number) => {
                  const product = item.product
                  if (typeof product !== 'object' || !product?.slug) return <React.Fragment key={i} />

                  const variant = item.variant
                  const isVariant = Boolean(variant) && typeof variant === 'object'
                  const price = (variant as any)?.priceInUSD ?? (product as any)?.priceInUSD ?? 0
                  const variantLabel = isVariant
                    ? (variant as any).options
                        ?.map((o: any) => (typeof o === 'object' ? o.label : null))
                        .filter(Boolean)
                        .join(', ')
                    : null

                  const image =
                    (typeof product.gallery?.[0]?.image === 'object'
                      ? product.gallery?.[0]?.image
                      : undefined) ||
                    (typeof product.meta?.image === 'object' ? product.meta?.image : undefined)

                  const { outOfStock } = getCartItemStock(item)
                  return (
                    <li className="flex gap-3" key={item.id || i}>
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {image?.url && (
                          <Image
                            alt={image?.alt || product?.title || ''}
                            className={`h-full w-full object-cover ${outOfStock ? 'opacity-40 grayscale blur-[1px]' : ''}`}
                            height={64}
                            src={image.url}
                            width={64}
                          />
                        )}
                      </div>

                      <div className={`flex min-w-0 flex-1 flex-col gap-1 ${outOfStock ? 'opacity-70' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              className="truncate text-sm font-medium hover:underline"
                              href={`/products/${product.slug}`}
                              onClick={() => setIsOpen(false)}
                            >
                              {product.title}
                            </Link>
                            {variantLabel && (
                              <p className="truncate text-xs capitalize text-muted-foreground">{variantLabel}</p>
                            )}
                            {outOfStock && <Badge variant="destructive" className="mt-1">Out of stock</Badge>}
                          </div>
                          <Button
                            aria-label="Remove item"
                            className="shrink-0"
                            onClick={() => removeItem(item.id)}
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 data-icon="inline-start" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-lg border">
                            <Button
                              aria-label="Decrease quantity"
                              className={cn('size-7')}
                              onClick={() => decrementItem(item.id)}
                              size="icon"
                              variant="ghost"
                            >
                              <Minus data-icon="inline-start" />
                            </Button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <Button
                              aria-label="Increase quantity"
                              className={cn('size-7')}
                              onClick={() => incrementItem(item.id)}
                              size="icon"
                              variant="ghost"
                            >
                              <Plus data-icon="inline-start" />
                            </Button>
                          </div>
                          <Price amount={price * (item.quantity || 1)} as="span" className="text-sm font-medium" />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>

            <SheetFooter className="border-t">
              <div className="flex w-full flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <Price amount={subtotal} as="span" className="font-medium" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <Separator className="my-1" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <Price amount={subtotal} as="span" className="text-base font-bold" />
                </div>
                {outOfStockCount > 0 && (
                  <p className="text-xs text-destructive">
                    {outOfStockCount} item{outOfStockCount === 1 ? ' is' : 's are'} out of stock — remove {outOfStockCount === 1 ? 'it' : 'them'} to checkout.
                  </p>
                )}
                <div className="mt-2 flex flex-col gap-2">
                  <Button asChild onClick={() => setIsOpen(false)} variant="outline">
                    <Link href="/cart">View Cart</Link>
                  </Button>
                  {outOfStockCount > 0 ? (
                    <Button disabled variant="outline" className="cursor-not-allowed text-muted-foreground">
                      Proceed to Checkout
                    </Button>
                  ) : (
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
