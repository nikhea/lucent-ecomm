import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { CartPageClient } from '@/components/cart/CartPageClient'

export default function CartPage() {
  return <CartPageClient />
}

export const metadata: Metadata = {
  description: 'Your shopping cart.',
  openGraph: mergeOpenGraph({
    title: 'Shopping Cart',
    url: '/cart',
  }),
  title: 'Shopping Cart',
}
