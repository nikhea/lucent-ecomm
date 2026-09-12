import type { Metadata } from 'next'
import { WishlistClient } from '@/components/wishlist/WishlistClient'

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Items you saved for later.',
}

export default function WishlistPage() {
  return <WishlistClient />
}
