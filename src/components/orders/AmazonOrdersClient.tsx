'use client'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { formatDateTime } from '@/utilities/formatDateTime'
import type { Order } from '@/payload-types'

function getShippedName(order: Order) {
  const sa: any = (order as any).shippingAddress
  if (sa?.firstName || sa?.lastName) return `${sa.firstName || ''} ${sa.lastName || ''}`.trim()
  if ((order as any).customer && typeof (order as any).customer === 'object') return (order as any).customer?.name || (order as any).customer?.email || '—'
  return (order as any).customerEmail || '—'
}

function deliveredLabel(order: Order) {
  const status = (order as any).status
  if (status === 'cancelled' || status === 'refunded') return `Cancelled`
  const d = (order as any).updatedAt || order.createdAt
  return `Delivered ${formatDateTime({ date: d, format: 'MMM dd, yyyy' })}`
}

export const AmazonOrdersClient: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const [tab, setTab] = useState<'delivered' | 'cancelled'>('delivered')
  const [period, setPeriod] = useState('3m')

  const filtered = useMemo(() => {
    let list = [...orders]
    if (tab === 'delivered') list = list.filter((o) => (o as any).status !== 'cancelled' && (o as any).status !== 'refunded')
    else list = list.filter((o) => (o as any).status === 'cancelled' || (o as any).status === 'refunded')
    if (period !== 'all') {
      const now = Date.now()
      const cutoff =
        period === '30d'
          ? now - 30 * 24 * 3600 * 1000
          : period === '3m'
            ? now - 90 * 24 * 3600 * 1000
            : period === '6m'
              ? now - 180 * 24 * 3600 * 1000
              : now - 365 * 24 * 3600 * 1000
      list = list.filter((o) => new Date(o.createdAt).getTime() >= cutoff)
    }
    return list
  }, [orders, tab, period])

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight">Your Previous Orders</h1>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="inline-flex p-1 rounded-lg bg-muted border text-sm">
          <button
            onClick={() => setTab('delivered')}
            className={`px-4 py-1.5 rounded-md font-medium transition-colors ${tab === 'delivered' ? 'bg-card shadow border dark:bg-card' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Delivered
          </button>
          <button
            onClick={() => setTab('cancelled')}
            className={`px-4 py-1.5 rounded-md font-medium transition-colors ${tab === 'cancelled' ? 'bg-card shadow border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Cancelled Orders
          </button>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Past 30 days</SelectItem>
            <SelectItem value="3m">Past 3 Month</SelectItem>
            <SelectItem value="6m">Past 6 months</SelectItem>
            <SelectItem value="12m">Past year</SelectItem>
            <SelectItem value="all">All orders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 flex min-h-[50vh] flex-col justify-center">
          <EmptyState
            preset="orders"
            title={tab === 'cancelled' ? 'No cancelled orders' : 'No orders found'}
            description={tab === 'cancelled' ? 'You have no cancelled orders.' : undefined}
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {filtered.map((order) => {
            const orderNum = (order as any).orderNumber || order.id
            const placed = formatDateTime({ date: order.createdAt, format: 'MMM dd, yyyy' })
            const shipped = getShippedName(order)
            const total = (order as any).amount ?? 0
            const items: any[] = (order as any).items || []
            return (
              <div key={order.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-muted/40 dark:bg-muted/20 border-b text-sm">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <div className="text-xs text-muted-foreground">Order placed</div>
                      <div className="font-medium">{placed}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Shipped to</div>
                      <div className="font-medium truncate max-w-[140px]">{shipped}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="font-medium">
                        <Price amount={total} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground lg:text-right">Order # {orderNum}</div>
                    <div className="flex gap-2 text-xs font-medium lg:justify-end">
                      <Link href={`/orders/${(order as any).orderNumber || order.id}`} className="hover:underline">
                        View order details
                      </Link>
                      <span className="text-border">|</span>
                      <Link href={`/orders/${(order as any).orderNumber || order.id}`} className="hover:underline">
                        View invoice
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-5">
                  <h3 className="font-semibold text-base">{deliveredLabel(order)}</h3>
                  <div className="mt-4 flex flex-col divide-y">
                    {items.length === 0 && <p className="text-sm text-muted-foreground py-2">No items.</p>}
                    {items.map((item: any, idx: number) => {
                      const product = item.product
                      if (!product || typeof product === 'string') return null
                      const img = (product as any).gallery?.[0]?.image || (product as any).meta?.image
                      const title = (product as any).title || 'Product'
                      const slug = (product as any).slug
                      const eligible = new Date(new Date(order.createdAt).getTime() + 30 * 24 * 3600 * 1000)
                      const eligibleStr = formatDateTime({ date: eligible.toISOString(), format: 'MMM dd, yyyy' })
                      return (
                        <div key={item.id || idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-lg bg-muted border overflow-hidden flex items-center justify-center">
                            {img && typeof img !== 'string' ? (
                              <Media resource={img as any} className="h-full w-full" imgClassName="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={slug ? `/products/${slug}` : '#'} className="text-sm font-medium leading-tight line-clamp-2 hover:underline">
                              {title}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">Return or replace items: Eligible through {eligibleStr}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Link
                                href={slug ? `/products/${slug}` : '#'}
                                className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-medium hover:opacity-90"
                              >
                                Buy it again
                              </Link>
                              <Link
                                href={slug ? `/products/${slug}` : '#'}
                                className="inline-flex items-center justify-center h-8 px-4 rounded-lg border bg-card text-xs font-medium hover:bg-muted"
                              >
                                View your item
                              </Link>
                              <button className="inline-flex items-center justify-center h-8 px-4 rounded-lg border bg-card text-xs font-medium hover:bg-muted">Write a review</button>
                              <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg border bg-card text-xs">⋯</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
