import type { CollectionConfig, PayloadRequest } from 'payload'

import { APIError } from 'payload'

import { checkRole } from '@/access/utilities'

type CreateNotificationArgs = {
  recipient: string
  title: string
  message: string
  type?: 'info' | 'order' | 'promotion' | 'system'
  link?: string
}

export const createNotification = async (
  req: PayloadRequest,
  data: CreateNotificationArgs,
) => {
  return req.payload.create({
    collection: 'notifications',
    data: { ...data, type: data.type || 'info', read: false } as any,
    req,
    overrideAccess: true,
  })
}

const ownerOrAdmin: NonNullable<CollectionConfig['access']>['read'] = ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(['admin'], user as any)) return true
  return { recipient: { equals: user.id } } as const
}

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    group: 'Ecommerce',
    useAsTitle: 'title',
    defaultColumns: ['recipient', 'title', 'type', 'read', 'createdAt'],
    description: 'User notifications — use createNotification(req, data) helper',
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: ownerOrAdmin,
    update: ownerOrAdmin,
    delete: ownerOrAdmin,
  },
  indexes: [
    { fields: ['recipient'] },
    { fields: ['read'] },
    { fields: ['recipient', 'read'] },
    { fields: ['type'] },
  ],
  endpoints: [
    {
      path: '/mark-read',
      method: 'patch',
      handler: async (req) => {
        if (!req.user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

        let body: { ids?: string[]; all?: boolean }
        try {
          body = (await (req.json?.() as Promise<typeof body>)) ?? {}
        } catch {
          throw new APIError('Invalid JSON body', 400)
        }

        if (body.all) {
          await req.payload.update({
            collection: 'notifications',
            where: { and: [{ recipient: { equals: req.user.id } }, { read: { equals: false } }] },
            data: { read: true },
            req,
            overrideAccess: true,
          })
          return Response.json({ success: true })
        }

        if (body.ids?.length) {
          const results = await Promise.allSettled(
            body.ids.map((id) =>
              req.payload.update({ collection: 'notifications', id, data: { read: true }, req, overrideAccess: true }),
            ),
          )
          const failed = results.filter((r) => r.status === 'rejected').length
          if (failed) throw new APIError(`Failed to mark ${failed} notification(s)`, 400)
          return Response.json({ success: true })
        }

        return Response.json({ message: 'ids or all required' }, { status: 400 })
      },
    },
    {
      path: '/unread-count',
      method: 'get',
      handler: async (req) => {
        if (!req.user) return Response.json({ message: 'Unauthorized' }, { status: 401 })
        const res = await req.payload.count({
          collection: 'notifications',
          where: { and: [{ recipient: { equals: req.user.id } }, { read: { equals: false } }] },
          req,
          overrideAccess: true,
        })
        return Response.json({ count: res.totalDocs })
      },
    },
  ],
  fields: [
    { name: 'recipient', type: 'relationship', relationTo: 'users', required: true, hasMany: false },
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    { name: 'message', type: 'textarea', required: true, maxLength: 1000 },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Order', value: 'order' },
        { label: 'Promotion', value: 'promotion' },
        { label: 'System', value: 'system' },
      ],
    },
    { name: 'read', type: 'checkbox', defaultValue: false },
    { name: 'link', type: 'text', admin: { description: 'Optional CTA link (e.g. /orders/123)' } },
  ],
  timestamps: true,
}
