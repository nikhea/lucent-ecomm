import { render } from '@react-email/render'
import type { CollectionAfterChangeHook, TaskConfig } from 'payload'
import OrderConfirmationEmail from '@/emails/order-confirmation'
import { getServerSideURL } from '@/utilities/getURL'

type ConfirmationItem = {
  title: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

function formatMoney(cents: number | null | undefined, currency: string) {
  if (cents === null || cents === undefined) return ''
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

function itemTitle(item: any) {
  const product = item?.product
  if (product && typeof product === 'object' && product.title) return String(product.title)
  const variant = item?.variant
  if (variant && typeof variant === 'object' && variant.title) return String(variant.title)
  return 'Item'
}

function unitPriceCents(item: any) {
  const product = item?.product
  if (product && typeof product === 'object' && typeof product.priceInUSD === 'number')
    return product.priceInUSD
  return null
}

function shippingLines(order: any) {
  const a = order?.shippingAddress
  if (!a) return []
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ')
  const cityLine = [a.city, a.state, a.postalCode].filter(Boolean).join(', ')
  return [name, a.company, a.addressLine1, a.addressLine2, cityLine, a.country].filter(Boolean)
}

export const sendOrderConfirmationTask = {
  slug: 'sendOrderConfirmation',
  inputSchema: [{ name: 'orderID', type: 'text', required: true }],
  outputSchema: [{ name: 'emailSent', type: 'checkbox', required: true }],
  retries: 3,
  handler: async ({ input, req }) => {
    const order: any = await req.payload.findByID({
      collection: 'orders',
      id: input.orderID,
      depth: 2,
    })

    const { docs: transactions } = await req.payload.find({
      collection: 'transactions',
      where: { order: { equals: order.id } },
      limit: 5,
      depth: 0,
    })

    if (!transactions.some((t: any) => t.status === 'succeeded')) {
      throw new Error(`Payment not confirmed yet for order ${order.id}`)
    }

    const customerEmail =
      order.customerEmail ||
      (order.customer && typeof order.customer === 'object' ? order.customer.email : null)

    if (!customerEmail) {
      throw new Error(`No customer email for order ${order.id}`)
    }

    const currency = order.currency || 'USD'
    const items: ConfirmationItem[] = (order.items || []).map((item: any) => {
      const unit = unitPriceCents(item)
      const qty = item.quantity || 1
      return {
        title: itemTitle(item),
        quantity: qty,
        unitPrice: unit === null ? '' : formatMoney(unit, currency),
        lineTotal: unit === null ? '' : formatMoney(unit * qty, currency),
      }
    })

    const serverURL = getServerSideURL()
    const orderUrl = order.accessToken
      ? `${serverURL}/orders/${order.id}?email=${encodeURIComponent(customerEmail)}&accessToken=${order.accessToken}`
      : `${serverURL}/orders/${order.id}`

    const html = await render(
      OrderConfirmationEmail({
        orderNumber: order.orderNumber || String(order.id),
        orderUrl,
        companyName: process.env.COMPANY_NAME || 'Lucent',
        items,
        total: formatMoney(order.amount, currency),
        customerEmail,
        shippingLines: shippingLines(order),
      }),
    )

    await req.payload.sendEmail({
      to: customerEmail,
      subject: `Order confirmation ${order.orderNumber || `#${order.id}`}`,
      html,
    })

    return { output: { emailSent: true } }
  },
} as TaskConfig<'sendOrderConfirmation'>

export const queueOrderConfirmationEmail: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  if (operation !== 'create') return
  try {
    await req.payload.jobs.queue({
      task: 'sendOrderConfirmation',
      queue: 'default',
      input: { orderID: String((doc as any).id) },
    })
  } catch (err) {
    req.payload.logger.error({ msg: 'Failed to queue order confirmation email', err })
  }
}
