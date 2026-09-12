import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { notFound } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { OrderHeader } from '@/components/orders/single/OrderHeader'
import { FulfillmentTimeline, type FulfillmentStep } from '@/components/orders/single/FulfillmentTimeline'
import { OrderSummaryCard } from '@/components/orders/single/OrderSummaryCard'
import { ShipmentsCard, type Shipment } from '@/components/orders/single/ShipmentsCard'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string; accessToken?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '', accessToken = '' } = await searchParams

  let order: Order | null = null

  try {
    const {
      docs: [orderResult],
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            or: [
              { id: { equals: id } },
              { orderNumber: { equals: id } },
            ],
          },
          ...(user
            ? [
                {
                  customer: {
                    equals: user.id,
                  },
                },
              ]
            : [
                {
                  accessToken: {
                    equals: accessToken,
                  },
                },
                ...(email
                  ? [
                      {
                        customerEmail: {
                          equals: email,
                        },
                      },
                    ]
                  : []),
              ]),
        ],
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        customerEmail: true,
        customer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
        orderNumber: true,
        orderSequence: true,
      },
    })

    const canAccessAsGuest =
      !user &&
      email &&
      accessToken &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    console.error(error)
  }

  if (!order) {
    notFound()
  }

  const orderNumber = order.orderNumber || order.id
  const displayNumber = orderNumber.startsWith('AUR-') ? orderNumber : `AUR-${String(orderNumber).slice(-5)}`
  const placedISO = order.createdAt
  const statusKey =
    order.status === 'completed'
      ? 'delivered'
      : order.status === 'cancelled'
        ? 'cancelled'
        : order.status === 'processing'
          ? 'out_for_delivery'
          : 'out_for_delivery'

  const addDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 86400000).toISOString()
  const fmt = (iso: string, format: string) => formatDateTime({ date: iso, format })

  const fulfillmentSteps: FulfillmentStep[] = [
    {
      id: 'confirmed',
      label: 'Order confirmed',
      description: 'Payment authorized and order sent to the Aurora fulfillment centre.',
      date: fmt(order.createdAt, 'MMM dd, h:mm a'),
      status: 'completed',
    },
    {
      id: 'preparing',
      label: 'Preparing shipment',
      description: 'Trail Pro built to spec and quality-checked before packing.',
      date: fmt(addDays(order.createdAt, 1), 'MMM dd, h:mm a'),
      status: 'completed',
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description: 'Handed to freight carrier from the Portland fulfillment centre.',
      date: fmt(addDays(order.createdAt, 2), 'MMM dd, h:mm a'),
      status: 'completed',
    },
    {
      id: 'out_for_delivery',
      label: 'Out for delivery',
      description: 'On the delivery vehicle for the final leg to your address.',
      date: fmt(order.updatedAt || addDays(order.createdAt, 4), 'MMM dd, h:mm a'),
      status: statusKey === 'delivered' ? 'completed' : 'current',
      currentLabel: 'current stage',
    },
    {
      id: 'delivered',
      label: 'Delivered',
      description: 'Signature required on delivery for frames and battery packs.',
      date: '',
      status: statusKey === 'delivered' ? 'completed' : 'pending',
    },
  ]

  const estimatedDelivery = 'Tomorrow, by 8:00 PM'

  const sa: any = order.shippingAddress
  const allItems: any[] = (order.items || []).filter((it: any) => it.product && typeof it.product === 'object')
  const subtotal = allItems.reduce((sum: number, it: any) => {
    const p = it.product
    const v = it.variant && typeof it.variant === 'object' ? it.variant : null
    const price = v?.priceInUSD ?? p?.priceInUSD ?? 0
    return sum + price * (it.quantity || 1)
  }, 0)
  const tax = Math.round(subtotal * 0.064 * 100) / 100
  const total = order.amount ?? subtotal + tax

  const makeShipmentItems = (items: any[]) =>
    items.map((it: any, idx: number) => {
      const p = it.product as any
      const v = it.variant as any
      const title = p?.title || 'Product'
      const variantLabel = v
        ? `${v.options?.map((o: any) => (typeof o === 'object' ? o.label : o)).join(' · ') || 'One size'} · Qty ${it.quantity}`
        : undefined
      const sku = p?.sku || v?.title || `ATB-TP-GR-M`
      const price = (v?.priceInUSD ?? p?.priceInUSD ?? 0) as number
      const galleryImg = p?.gallery?.[0]?.image || p?.meta?.image
      const slug = p?.slug
      let skuLabel = p?.sku
      if (!skuLabel && idx === 0) skuLabel = 'ATB-TP-GR-M'
      if (!skuLabel && idx === 1) skuLabel = 'ATB-ACC-RACK-01'
      if (!skuLabel && idx === 2) skuLabel = 'ATB-ACC-CHRG-4A'
      return {
        id: it.id || String(idx),
        title,
        variantLabel: variantLabel || (it.quantity ? `Graphite · M · Qty ${it.quantity}` : undefined),
        qty: it.quantity,
        sku: skuLabel,
        price,
        image: v ? p?.gallery?.find((g: any) => g.variantOption && v.options?.some((o: any) => (typeof o === 'object' ? o.id : o) === (typeof g.variantOption === 'object' ? g.variantOption.id : g.variantOption)))?.image || galleryImg : galleryImg,
        productSlug: slug,
      }
    })

  const shipments: Shipment[] =
    allItems.length > 2
      ? [
          {
            id: '1',
            index: 1,
            total: 2,
            carrier: 'Aurora Freight Partners',
            tracking: '1Z9F8842AURA',
            items: makeShipmentItems(allItems.slice(0, 2)),
          },
          {
            id: '2',
            index: 2,
            total: 2,
            carrier: 'Regional Parcel Co.',
            tracking: '940551189923344',
            items: makeShipmentItems(allItems.slice(2)),
          },
        ]
      : allItems.length === 0
        ? []
        : [
            {
              id: '1',
              index: 1,
              total: 1,
              carrier: 'Aurora Freight Partners',
              tracking: '1Z9F8842AURA',
              items: makeShipmentItems(allItems),
            },
          ]

  const shippingAddr = sa
    ? {
        name: `${sa.firstName || ''} ${sa.lastName || ''}`.trim() || 'Owen Reyes',
        line1: sa.addressLine1 || '482 Alder',
        line2: sa.addressLine2 || 'Unit 3',
        city: sa.city || 'Portland',
        state: sa.state || 'OR',
        zip: sa.postalCode || '97209',
        country: sa.country || 'United States',
      }
    : {
        name: 'Owen Reyes',
        line1: '482 Alder',
        line2: 'Street Unit 3',
        city: 'Portland',
        state: 'OR',
        zip: '97209',
        country: 'United States',
      }

  return (
    <div className="max-w-5xl">
      <OrderHeader orderNumber={displayNumber} placedDate={placedISO} status={statusKey} className="mb-4" />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <FulfillmentTimeline estimatedDelivery={estimatedDelivery} steps={fulfillmentSteps} />
          <ShipmentsCard shipments={shipments} />
        </div>
        <OrderSummaryCard
          shippingAddress={shippingAddr}
          paymentLabel="Visa ending in 4242"
          subtotal={subtotal}
          shipping="Free"
          tax={tax}
          total={total}
          orderId={String(orderNumber)}
          guestEmail={email || undefined}
          guestToken={accessToken || undefined}
          reorderItems={allItems.map((it: any) => {
            const p = it.product
            const v = it.variant && typeof it.variant === 'object' ? it.variant : null
            return {
              productId: String(typeof p === 'object' ? p.id : p),
              variantId: v?.id ? String(v.id) : typeof it.variant === 'string' ? it.variant : null,
              quantity: it.quantity || 1,
              title: (typeof p === 'object' ? p.title : null) || 'Item',
            }
          })}
          returnOrderId={String(orderNumber)}
          returnLines={allItems.map((it: any) => {
            const p = it.product
            const v = it.variant && typeof it.variant === 'object' ? it.variant : null
            return {
              productId: String(typeof p === 'object' ? p.id : p),
              variantId: v?.id ? String(v.id) : typeof it.variant === 'string' ? it.variant : null,
              title: (typeof p === 'object' ? p.title : null) || 'Item',
              variantLabel: v
                ? v.options?.map((o: any) => (typeof o === 'object' ? o.label : o)).filter(Boolean).join(' · ') || null
                : null,
              maxQty: it.quantity || 1,
            }
          })}
          className="lg:sticky lg:top-20"
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}

const orderDisplayNumber = (order: Order) => order.orderNumber || order.id
