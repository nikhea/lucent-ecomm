import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product')
  if (!productId) return Response.json({ message: 'product required' }, { status: 400 })

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return Response.json({ purchased: false, review: null })

  const orders = await payload.find({
    collection: 'orders',
    where: {
      and: [{ customer: { equals: user.id } }, { status: { in: ['completed', 'processing'] } }],
    },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
  const purchased = orders.docs.some((o: any) =>
    (o.items || []).some((it: any) => String(typeof it.product === 'object' ? it.product.id : it.product) === String(productId)),
  )

  const existing = await payload.find({
    collection: 'reviews',
    where: { and: [{ customer: { equals: user.id } }, { product: { equals: productId } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return Response.json({ purchased, review: existing.docs[0] || null })
}
