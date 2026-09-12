'use client'
import { create } from 'zustand'
import { useEffect } from 'react'
import { toast } from 'sonner'

export type WishlistDoc = {
  id: string
  product: any
  variant?: any
  createdAt: string
}

type WishlistStore = {
  docs: WishlistDoc[]
  isLoading: boolean
  fetched: boolean
  fetch: () => Promise<void>
  toggle: (productId: string, variantId?: string | null) => Promise<'added' | 'removed' | null>
  remove: (id: string) => Promise<void>
  isWished: (productId: string, variantId?: string | null) => boolean
  reset: () => void
}

const productIdOf = (d: WishlistDoc) => String(typeof d.product === 'object' ? d.product.id : d.product)
const variantIdOf = (d: WishlistDoc) => {
  if (!d.variant) return null
  return String(typeof d.variant === 'object' ? d.variant.id : d.variant)
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  docs: [],
  isLoading: false,
  fetched: false,
  fetch: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/wishlists?depth=2&limit=100&sort=-createdAt', { credentials: 'include' })
      if (res.status === 401) {
        set({ docs: [], isLoading: false, fetched: true })
        return
      }
      if (!res.ok) throw new Error()
      const data = await res.json()
      set({ docs: data.docs || [], isLoading: false, fetched: true })
    } catch {
      set({ isLoading: false, fetched: true })
    }
  },
  toggle: async (productId, variantId = null) => {
    const { docs } = get()
    const existing = docs.find((d) => productIdOf(d) === String(productId) && (variantIdOf(d) || null) === (variantId || null))
    if (existing) {
      const prev = docs
      set({ docs: prev.filter((d) => d.id !== existing.id) })
      try {
        const res = await fetch('/api/wishlists/toggle', {
          body: JSON.stringify({ product: productId, variant: variantId }),
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
        if (!res.ok) throw new Error()
        toast.success('Removed from wishlist')
        return 'removed'
      } catch {
        set({ docs: prev })
        toast.error('Failed to update wishlist')
        return null
      }
    }
    try {
      const res = await fetch('/api/wishlists/toggle', {
        body: JSON.stringify({ product: productId, variant: variantId }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (res.status === 401) {
        toast.error('Sign in to save items')
        return null
      }
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || 'Failed')
      if (data?.doc) {
        set({ docs: [data.doc, ...get().docs] })
      } else {
        get().fetch()
      }
      toast.success('Saved to wishlist')
      return 'added'
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update wishlist')
      return null
    }
  },
  remove: async (id) => {
    const prev = get().docs
    set({ docs: prev.filter((d) => d.id !== id) })
    try {
      const res = await fetch(`/api/wishlists/${id}`, { credentials: 'include', method: 'DELETE' })
      if (!res.ok) throw new Error()
    } catch {
      set({ docs: prev })
      toast.error('Failed to remove item')
    }
  },
  isWished: (productId, variantId = null) => {
    const v = variantId || null
    return get().docs.some((d) => {
      if (productIdOf(d) !== String(productId)) return false
      if (v) return variantIdOf(d) === String(v)
      return true
    })
  },
  reset: () => set({ docs: [], fetched: false, isLoading: false }),
}))

export function useWishlist() {
  const store = useWishlistStore()
  useEffect(() => {
    if (!store.fetched && !store.isLoading) store.fetch()
  }, [store.fetched, store.isLoading, store.fetch])
  return store
}
