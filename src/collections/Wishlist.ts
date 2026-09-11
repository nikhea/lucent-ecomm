import type { CollectionConfig } from 'payload'

import { APIError } from 'payload'

import { checkRole } from '@/access/utilities'

const isOwnerOrAdmin: NonNullable<CollectionConfig['access']>['read'] = ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(['admin'], user as any)) return true
  return { customer: { equals: user.id } } as const
}

export const Wishlist: CollectionConfig = {
  slug: 'wishlists',
  admin: {
    group: 'Ecommerce',
    useAsTitle: 'id',
    defaultColumns: ['customer', 'product', 'variant', 'createdAt'],
    description: 'Customer wishlists — one row per customer/product/variant',
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: isOwnerOrAdmin,
    update: isOwnerOrAdmin,
    delete: isOwnerOrAdmin,
  },
  indexes: [
    { fields: ['product'] },
    { fields: ['variant'] },
    { fields: ['customer', 'product', 'variant'], unique: true },
  ],
  endpoints: [
    {
      path: '/toggle',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        let body: { product?: string; variant?: string | null }
        try {
          body = (await (req.json?.() as Promise<typeof body>)) ?? ({} as typeof body)
        } catch {
          throw new APIError('Invalid JSON body', 400)
        }

        const product = body?.product
        if (!product) {
          return Response.json({ message: 'product required' }, { status: 400 })
        }

        const variant = body?.variant ?? null

        const where: any = {
          and: [
            { customer: { equals: req.user.id } },
            { product: { equals: product } },
            variant ? { variant: { equals: variant } } : { variant: { exists: false } },
          ],
        }

        const existing = await req.payload.find({
          collection: 'wishlists',
          where,
          depth: 0,
          overrideAccess: true,
          limit: 1,
          req,
        })

        if (existing.totalDocs > 0) {
          await req.payload.delete({
            collection: 'wishlists',
            id: existing.docs[0]!.id,
            req,
            overrideAccess: true,
          })
          return Response.json({ action: 'removed' })
        }

        try {
          const doc = await req.payload.create({
            collection: 'wishlists',
            data: {
              customer: req.user.id,
              product,
              variant: variant || null,
            } as any,
            req,
          })
          return Response.json({ action: 'added', doc })
        } catch (err: any) {
          if (err?.message?.includes('Variant does not belong') || err?.message?.includes('already in wishlist')) {
            throw new APIError(err.message, 400)
          }
          if (err?.code === 11000) throw new APIError('Product already in wishlist', 409)
          throw err
        }
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data?.customer) data.customer = req.user.id
        if (data?.variant === '') data.variant = null
        return data
      },
    ],
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (data?.variant && data?.product) {
          const variantId = typeof data.variant === 'object' ? (data.variant as any).id : data.variant
          const variant = await req.payload.findByID({
            collection: 'variants',
            id: variantId,
            depth: 0,
            overrideAccess: true,
            req,
          })
          const vProduct = typeof (variant as any).product === 'object' ? (variant as any).product.id : (variant as any).product
          const pId = typeof data.product === 'object' ? (data.product as any).id : data.product
          if (String(vProduct) !== String(pId)) throw new APIError('Variant does not belong to product', 400)
        }

        if (operation === 'create' && data?.product && req.user) {
          const variantFilter = data.variant
            ? { variant: { equals: typeof data.variant === 'object' ? (data.variant as any).id : data.variant } }
            : { variant: { exists: false } }

          const existing = await req.payload.find({
            collection: 'wishlists',
            where: {
              and: [
                { customer: { equals: req.user.id } },
                { product: { equals: typeof data.product === 'object' ? (data.product as any).id : data.product } },
                variantFilter,
              ],
            },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          if (existing.totalDocs > 0) throw new APIError('Product already in wishlist', 409)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true, description: 'Auto-set to logged in user' },
    },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    {
      name: 'variant',
      type: 'relationship',
      relationTo: 'variants',
      admin: { description: 'Optional variant — must belong to selected product' },
    },
  ],
  timestamps: true,
}
