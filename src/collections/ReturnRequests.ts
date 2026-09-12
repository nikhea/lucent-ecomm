import type { Access, CollectionConfig, Where } from 'payload'

import { checkRole } from '@/access/utilities'

const isAdmin = (user: any) => checkRole(['admin'], user)

export const ReturnRequests: CollectionConfig = {
  slug: 'return-requests',
  admin: {
    group: 'Commerce',
    useAsTitle: 'order',
    defaultColumns: ['order', 'customer', 'reason', 'status', 'createdAt'],
    description: 'Customer return requests — review and approve from here',
  },
  access: {
    read: (({ req }) => {
      const user = (req as { user?: unknown }).user as any
      if (isAdmin(user)) return true
      if (!user) return false
      return { customer: { equals: user.id } } as Where
    }) as Access,
    create: ({ req: { user } }) => !!user || isAdmin(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { customer: { equals: user.id } } as const
    },
    delete: ({ req: { user } }) => isAdmin(user),
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create') {
          if (req.user && !data?.customer) data.customer = req.user.id
          // customers can never set their own status
          if (!isAdmin(req.user)) data.status = 'pending'
        }
        if (operation === 'update' && req.user && !isAdmin(req.user) && data?.status) {
          delete data.status
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, description: 'Auto-set to logged in user (empty for guest requests)' },
    },
    { name: 'customerEmail', type: 'email', admin: { description: 'For guest requests' } },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'variant', type: 'text', admin: { description: 'Variant ID, if any' } },
        { name: 'title', type: 'text', required: true, admin: { description: 'Product snapshot' } },
        { name: 'quantity', type: 'number', required: true, min: 1 },
      ],
    },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Wrong size', value: 'wrong-size' },
        { label: 'Defective / damaged', value: 'defective' },
        { label: 'Wrong item received', value: 'wrong-item' },
        { label: 'Changed my mind', value: 'changed-mind' },
        { label: 'Arrived too late', value: 'late-delivery' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'comments', type: 'textarea', maxLength: 1000 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Completed', value: 'completed' },
      ],
      access: {
        create: ({ req: { user } }) => isAdmin(user),
        update: ({ req: { user } }) => isAdmin(user),
      },
      admin: { position: 'sidebar', description: 'Admin moderation' },
    },
  ],
  timestamps: true,
}
