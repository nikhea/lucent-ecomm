import configPromise from '@payload-config'
import { InvoiceDocument, type InvoiceData } from '@/components/orders/InvoiceDocument'
import { formatDateTime } from '@/utilities/formatDateTime'
import { getPayload } from 'payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ id: string }>
}

// GET /api/orders/:id/invoice — owner-only invoice PDF.
// Pure-JS rendering (@react-pdf/renderer, no browser binary), safe for serverless.
export async function GET(req: Request, { params }: Args) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email') || ''
  const accessToken = searchParams.get('accessToken') || ''

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })

  const orders = await payload.find({
    collection: 'orders',
    depth: 2,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      or: [{ orderNumber: { equals: id } }, { id: { equals: id } }],
    },
  })

  const order = orders.docs?.[0] as any
  if (!order) return Response.json({ message: 'Order not found.' }, { status: 404 })

  const customerId =
    order.customer && typeof order.customer === 'object' ? order.customer.id : order.customer
  const canAccessAsUser = !!user && customerId && String(customerId) === String(user.id)
  const canAccessAsGuest =
    !user &&
    !!accessToken &&
    !!order.accessToken &&
    order.accessToken === accessToken &&
    (!email || !order.customerEmail || order.customerEmail === email)

  if (!canAccessAsUser && !canAccessAsGuest) {
    return Response.json({ message: !user ? 'Not authenticated.' : 'Forbidden.' }, { status: !user && !accessToken ? 401 : 403 })
  }

  const lines = ((order.items || []) as any[])
    .filter((it) => it?.product && typeof it.product === 'object')
    .map((it) => {
      const variant = it.variant && typeof it.variant === 'object' ? it.variant : null
      const product = it.product
      const variantLabel =
        variant?.options?.map((o: any) => (typeof o === 'object' ? o.label : o)).filter(Boolean).join(' · ') || null
      return {
        title: product?.title || 'Product',
        variant: variantLabel,
        quantity: it.quantity || 1,
        unitPrice: variant?.priceInUSD ?? product?.priceInUSD ?? 0,
      }
    })

  const sa = order.shippingAddress || {}
  const billedName =
    [sa.firstName, sa.lastName].filter(Boolean).join(' ') ||
    (typeof order.customer === 'object' ? order.customer?.name : null) ||
    'Customer'
  const billedEmail =
    order.customerEmail || (typeof order.customer === 'object' ? order.customer?.email : null) || null

  const placed = formatDateTime({ date: order.createdAt, format: 'MMM dd, yyyy' })

  const invoice: InvoiceData = {
    orderNumber: String(order.orderNumber || order.id),
    placed,
    dueDate: placed,
    status: String(order.status || 'processing'),
    companyLines: ['123 Commerce Street', 'New York, NY 10001', 'United States', 'support@lucent.com'],
    billedName,
    billLines: [
      sa.addressLine1,
      sa.addressLine2,
      [sa.city, sa.state, sa.postalCode].filter(Boolean).join(' '),
      sa.country,
    ].filter(Boolean),
    billedEmail,
    lines,
    subtotal: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    shippingLabel: 'Free',
    total: order.amount ?? 0,
    currency: order.currency || 'USD',
    notes: 'Thanks for shopping with LUCENT. For returns or support contact support@lucent.com within 30 days of delivery.',
  }

  // Dynamic import keeps @react-pdf out of any client-adjacent bundle.
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const pdf = (await renderToBuffer(<InvoiceDocument invoice={invoice} />)) as unknown as Uint8Array

  return new Response(pdf as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.orderNumber}.pdf"`,
      'Cache-Control': 'private, max-age=60',
    },
  })
}
