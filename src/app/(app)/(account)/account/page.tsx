import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { AccountForm } from '@/components/forms/AccountForm'
import { Order } from '@/payload-types'
import { OrderItem } from '@/components/OrderItem'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Please login to access your account settings.')}`,
    )
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 5,
      user,
      overrideAccess: false,
      pagination: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) {
    // when deploying this template on Payload Cloud, this page needs to build before the APIs are live
    // so swallow the error here and simply render the page with fallback data where necessary
    // in production you may want to redirect to a 404  page or at least log the error somewhere
    // console.error(error)
  }

  return (
    <>
      <div className="border rounded-xl bg-card p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Account settings</h1>
        <p className="text-sm text-muted-foreground mb-8">Manage your personal details, size profile and preferences.</p>
        <AccountForm />
      </div>

      <div className="border rounded-xl bg-card p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Recent Orders</h2>

        <p className="text-sm text-muted-foreground mb-8 max-w-xl">
          These are the most recent orders you have placed. Each order is associated with an
          payment. As you place more orders, they will appear in your orders list.
        </p>

        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <div className="mb-8">
            <EmptyState preset="orders" />
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-4 mb-8">
            {orders?.map((order, index) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="default" className="cursor-pointer">
          <Link href="/orders">View all orders</Link>
        </Button>
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
