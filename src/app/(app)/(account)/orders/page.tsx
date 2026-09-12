import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { AmazonOrdersClient } from '@/components/orders/AmazonOrdersClient'

export default async function Orders() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      depth: 2,
      select: {
        orderNumber: true,
        amount: true,
        currency: true,
        items: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
        customerEmail: true,
      },
      sort: '-createdAt',
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = (ordersResult?.docs as unknown as Order[]) || []
  } catch (error) {}

  return <AmazonOrdersClient orders={orders || []} />
}

export const metadata: Metadata = {
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
  title: 'Orders',
}
