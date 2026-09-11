'use client'
import { Button } from '@/components/ui/button'
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { Product, Variant } from '@/payload-types'
import { useSearchParams } from 'next/navigation'

export function QuantityAndCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const { addItem, isLoading } = useCart()
  const searchParams = useSearchParams()
  const variants = product.variants?.docs || []
  const selectedVariant = React.useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')
      const v = variants.find((va) => typeof va === 'object' && String((va as any).id) === variantId)
      return v as Variant | undefined
    }
    return undefined
  }, [product.enableVariants, searchParams, variants])

  const onAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      addItem({ product: product.id, variant: selectedVariant?.id, quantity: qty } as any).then(() => toast.success('Added to cart'))
    },
    [addItem, product.id, selectedVariant, qty],
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex items-center rounded-lg border overflow-hidden">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 flex items-center justify-center hover:bg-muted">
            <Minus className="h-4 w-4" />
          </button>
          <span className="h-10 w-10 flex items-center justify-center text-sm bg-muted">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="h-10 w-10 flex items-center justify-center hover:bg-muted">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={onAdd} disabled={!!isLoading || !!(product.enableVariants && !selectedVariant)} className="flex-1 h-10">
          <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
        </Button>
      </div>
      <Button variant="outline" className="w-full h-10">
        <Heart className="h-4 w-4 mr-2" /> Add to Wishlist
      </Button>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="rounded-lg border p-3 text-center">
          <div className="text-xs font-medium">Free Shipping</div>
          <div className="text-[10px] text-muted-foreground">2-day on orders $99+</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-xs font-medium">30-Day Returns</div>
          <div className="text-[10px] text-muted-foreground">Used returns accepted</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-xs font-medium">2-Year Warranty</div>
          <div className="text-[10px] text-muted-foreground">Free repair, free swap</div>
        </div>
      </div>
    </div>
  )
}
