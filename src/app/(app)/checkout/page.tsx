import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default function Checkout() {
  redirect('/checkout/contact')
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({ title: 'Checkout', url: '/checkout' }),
  title: 'Checkout',
}
