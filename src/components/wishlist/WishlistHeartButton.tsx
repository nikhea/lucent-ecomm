'use client'
import { Heart } from 'lucide-react'
import React from 'react'
import { cn } from '@/utilities/cn'
import { useWishlistStore } from '@/store/wishlist'

export function WishlistHeartButton({
  productId,
  variantId = null,
  className,
}: {
  productId: string
  variantId?: string | null
  className?: string
}) {
  const wished = useWishlistStore((s) => s.isWished(productId, variantId))
  return (
    <button
      aria-label="Toggle wishlist"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void useWishlistStore.getState().toggle(productId, variantId)
      }}
      className={cn(
        'h-8 w-8 rounded-lg bg-black/70 backdrop-blur flex items-center justify-center text-white hover:bg-black cursor-pointer',
        className,
      )}
    >
      <Heart className={cn('h-4 w-4', wished && 'fill-white')} />
    </button>
  )
}
