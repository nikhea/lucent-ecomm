import type { CollectionConfig } from 'payload'

import { APIError } from 'payload'

import { checkRole } from '@/access/utilities'

const isAdmin = (user: any) => checkRole(['admin'], user)

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['product', 'rating', 'customer', 'status', 'verifiedPurchase', 'createdAt'],
    description: 'Customer reviews — one per customer per product, auto-verifies purchase',
  },
  access: {
    read: ({ req: { user } }) => {
      if (isAdmin(user)) return true
      return { status: { equals: 'approved' } } as const
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { customer: { equals: user.id } } as const
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { customer: { equals: user.id } } as const
    },
  },
  indexes: [
    { fields: ['product'] },
    { fields: ['customer'] },
    { fields: ['status'] },
    { fields: ['customer', 'product'], unique: true },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data?.customer) data.customer = req.user.id
        if (operation === 'update' && req.user && !isAdmin(req.user)) {
          if (data?.status) delete data.status
          if (typeof data?.verifiedPurchase !== 'undefined') delete data.verifiedPurchase
        }
        return data
      },
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.product && req.user) {
          const productId = typeof data.product === 'object' ? (data.product as any).id : data.product
          const existing = await req.payload.find({
            collection: 'reviews',
            where: { and: [{ customer: { equals: req.user.id } }, { product: { equals: productId } }] },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          if (existing.totalDocs > 0) throw new APIError('You have already reviewed this product', 409)
        }
        return data
      },
    ],
    beforeValidate: [
      async ({ data, req }) => {
        if (data?.product && req.user) {
          try {
            const targetId = String(typeof data.product === 'object' ? (data.product as any).id : data.product)
            const orders = await req.payload.find({
              collection: 'orders',
              where: {
                and: [{ customer: { equals: req.user.id } }, { status: { in: ['completed', 'processing'] } }],
              },
              limit: 50,
              depth: 0,
              overrideAccess: true,
              req,
            })
            const purchased = orders.docs.some((o: any) =>
              (o.items || []).some((it: any) => String(typeof it.product === 'object' ? it.product.id : it.product) === targetId),
            )
            data.verifiedPurchase = purchased
          } catch {
            data.verifiedPurchase = false
          }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, description: 'Auto-set to logged in user' },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: { description: '1-5', step: 1 },
      validate: (val: unknown) => {
        const n = val as number
        if (!Number.isInteger(n)) return 'Rating must be an integer 1-5'
        if (n < 1 || n > 5) return 'Rating must be 1-5'
        return true
      },
    },
    { name: 'title', type: 'text', required: true, maxLength: 100 },
    { name: 'comment', type: 'textarea', required: true, maxLength: 1000 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      access: {
        create: ({ req: { user } }) => isAdmin(user),
        update: ({ req: { user } }) => isAdmin(user),
      },
      admin: { position: 'sidebar', description: 'Admin moderation' },
    },
    {
      name: 'verifiedPurchase',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true, position: 'sidebar', description: 'Auto-set if customer purchased product' },
    },
  ],
  timestamps: true,
}
