'use client'
import { create } from 'zustand'
import { useCart as usePayloadCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useEffect, useRef } from 'react'

type CartItem = any
type Cart = any

type CartStore = {
  cart: Cart | null
  optimisticItems: CartItem[] | null
  setCart: (cart: Cart | null) => void
  setOptimisticItems: (items: CartItem[] | null) => void
  getDisplayCart: () => Cart | null
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  optimisticItems: null,
  setCart: (cart) => set({ cart, optimisticItems: null }),
  setOptimisticItems: (items) => set({ optimisticItems: items }),
  getDisplayCart: () => {
    const { cart, optimisticItems } = get()
    if (!cart) return null
    if (optimisticItems) return { ...cart, items: optimisticItems }
    return cart
  },
}))

export function useOptimisticCart() {
  const payloadCart = usePayloadCart()
  const { cart, isLoading } = payloadCart
  const { setCart, setOptimisticItems, getDisplayCart } = useCartStore()
  const prevCartRef = useRef<Cart | null>(null)

  useEffect(() => {
    if (cart && cart !== prevCartRef.current) {
      setCart(cart)
      prevCartRef.current = cart
    } else if (!cart && prevCartRef.current) {
      setCart(null)
      prevCartRef.current = null
    }
  }, [cart, setCart])

  const displayCart = getDisplayCart() || cart

  const optimisticUpdate = (updater: (items: CartItem[]) => CartItem[]) => {
    const current = displayCart?.items || []
    const next = updater([...current])
    setOptimisticItems(next)
    return next
  }

  const incrementItem = async (itemId: string) => {
    optimisticUpdate((items) => items.map((it) => (it.id === itemId ? { ...it, quantity: (it.quantity || 0) + 1 } : it)))
    try {
      await payloadCart.incrementItem(itemId)
    } catch {
      setOptimisticItems(null)
    }
  }

  const decrementItem = async (itemId: string) => {
    const current = displayCart?.items?.find((it: any) => it.id === itemId)
    if (current && (current.quantity || 0) <= 1) {
      optimisticUpdate((items) => items.filter((it) => it.id !== itemId))
      try {
        await payloadCart.decrementItem(itemId)
        // decrement to 0 will remove, but if it was 1, it should remove
        // payload's decrementItem may handle removal, but we already optimistically removed
      } catch {
        setOptimisticItems(null)
      }
      return
    }
    optimisticUpdate((items) => items.map((it) => (it.id === itemId ? { ...it, quantity: Math.max(1, (it.quantity || 0) - 1) } : it)))
    try {
      await payloadCart.decrementItem(itemId)
    } catch {
      setOptimisticItems(null)
    }
  }

  const removeItem = async (itemId: string) => {
    optimisticUpdate((items) => items.filter((it) => it.id !== itemId))
    try {
      await payloadCart.removeItem(itemId)
    } catch {
      setOptimisticItems(null)
    }
  }

  return {
    cart: displayCart,
    isLoading: isLoading && !displayCart,
    incrementItem,
    decrementItem,
    removeItem,
    addItem: payloadCart.addItem,
    rawCart: cart,
  }
}
