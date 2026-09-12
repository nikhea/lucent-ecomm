import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REASONS = ['wrong-size', 'defective', 'wrong-item', 'changed-mind', 'late-delivery', 'other']

type Body = {
  orderId: string
  email?: string
  accessToken?: string
  items: { product: string; variant?: string | null; quantity: number }[]
  reason: string
  comments?: string
}

// POST /api/returns — customer/guest return request with 30-day window validation.
export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })

  let body: Body
  try {
    body = await req.json()
  } catch {
    return Response.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const { orderId, email = '', accessToken = '', items = [], reason, comments = '' } = body || ({} as Body)

  if (!orderId) return Response.json({ message: 'Order is required.' }, { status: 400 })
  if (!Array.isArray(items) || items.length === 0)
    return Response.json({ message: 'Select at least one item to return.' }, { status: 400 })
  if (!REASONS.includes(reason)) return Response.json({ message: 'Invalid return reason.' }, { status: 400 })

  const orders = await payload.find({
    collection: 'orders',
    depth: 1,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      or: [{ orderNumber: { equals: orderId } }, { id: { equals: orderId } }],
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
    return Response.json(
      { message: !user && !accessToken ? 'Not authenticated.' : 'Forbidden.' },
      { status: !user && !accessToken ? 401 : 403 },
    )
  }

  const ageDays = (Date.now() - new Date(order.createdAt).getTime()) / 86400000
  if (ageDays > 30) {
    return Response.json(
      { message: 'This order is outside the 30-day return window.' },
      { status: 422 },
    )
  }

  // every requested item must belong to the order, within its purchased quantity
  const orderLines = (order.items || []) as any[]
  const cleanItems: { product: string; variant?: string; quantity: number; title: string }[] = []
  for (const item of items) {
    const line = orderLines.find(
      (l: any) => String(typeof l.product === 'object' ? l.product.id : l.product) === String(item.product),
    )
    if (!line) return Response.json({ message: 'One or more items are not part of this order.' }, { status: 422 })
    const maxQty = line.quantity || 1
    const qty = Math.min(Math.max(1, Math.floor(Number(item.quantity) || 1)), maxQty)
    const product = line.product && typeof line.product === 'object' ? line.product : null
    cleanItems.push({
      product: String(typeof line.product === 'object' ? line.product.id : line.product),
      ...(item.variant ? { variant: String(item.variant) } : {}),
      quantity: qty,
      title: product?.title || 'Item',
    })
  }

  const doc = await payload.create({
    collection: 'return-requests',
    data: {
      order: order.id,
      ...(canAccessAsUser ? { customer: (user as any).id } : {}),
      customerEmail: email || order.customerEmail || (typeof order.customer === 'object' ? order.customer?.email : null) || undefined,
      items: cleanItems,
      reason,
      comments: comments?.slice(0, 1000) || undefined,
      status: 'pending',
    } as any,
    depth: 0,
    overrideAccess: true,
  })

  return Response.json({ success: true, id: (doc as any).id }, { status: 201 })
}
