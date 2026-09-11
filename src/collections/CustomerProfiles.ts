import type { CollectionConfig } from 'payload'

import { APIError } from 'payload'

import { checkRole } from '@/access/utilities'

const isOwnerOrAdmin: NonNullable<CollectionConfig['access']>['read'] = ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(['admin'], user as any)) return true
  return { customer: { equals: user.id } } as const
}

export const CustomerProfiles: CollectionConfig = {
  slug: 'customer-profiles',
  labels: { singular: 'Customer Profile', plural: 'Customer Profiles' },
  admin: {
    group: 'Users',
    useAsTitle: 'displayName',
    defaultColumns: ['customer', 'displayName', 'phone', 'tier', 'createdAt'],
    description: 'Extended fashion profile — measurements, style prefs, loyalty. One per customer.',
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: isOwnerOrAdmin,
    update: isOwnerOrAdmin,
    delete: ({ req: { user } }) => checkRole(['admin'], user as any),
  },
  indexes: [
    { fields: ['phone'] },
    { fields: ['tier'] },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data?.customer) data.customer = req.user.id
        if (data?.displayName) data.displayName = String(data.displayName).trim()
        if (data?.phone) data.phone = String(data.phone).trim()
        return data
      },
    ],
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.customer) {
          const customerId = typeof data.customer === 'object' ? (data.customer as any).id : data.customer
          const existing = await req.payload.find({
            collection: 'customer-profiles',
            where: { customer: { equals: customerId } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          if (existing.totalDocs > 0) throw new APIError('Profile already exists for this customer', 409)
        }
        return data
      },
    ],
  },
  endpoints: [
    {
      path: '/me',
      method: 'get',
      handler: async (req) => {
        if (!req.user) return Response.json({ message: 'Unauthorized' }, { status: 401 })
        const res = await req.payload.find({
          collection: 'customer-profiles',
          where: { customer: { equals: req.user.id } },
          limit: 1,
          depth: 1,
          overrideAccess: true,
          req,
        })
        if (!res.totalDocs) return Response.json({ message: 'Profile not found' }, { status: 404 })
        return Response.json(res.docs[0])
      },
    },
  ],
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      hasMany: false,
      admin: { readOnly: true, description: 'Auto-linked to logged-in user' },
    },
    { name: 'displayName', type: 'text', admin: { description: 'Public name on reviews' } },
    { name: 'avatar', type: 'upload', relationTo: 'media', admin: { description: 'Profile photo' } },
    { name: 'phone', type: 'text', admin: { description: 'E.164 format' } },
    { name: 'dateOfBirth', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Women', value: 'women' },
        { label: 'Men', value: 'men' },
        { label: 'Unisex', value: 'unisex' },
        { label: 'Prefer not to say', value: 'undisclosed' },
      ],
    },
    { name: 'bio', type: 'textarea', maxLength: 500 },
    {
      name: 'stylePreferences',
      type: 'group',
      admin: { description: 'Fashion discovery' },
      fields: [
        {
          name: 'favoriteColors',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Black', value: 'black' },
            { label: 'White', value: 'white' },
            { label: 'Beige', value: 'beige' },
            { label: 'Blue', value: 'blue' },
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
          ],
        },
        {
          name: 'styles',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Streetwear', value: 'streetwear' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Vintage', value: 'vintage' },
            { label: 'Luxury', value: 'luxury' },
            { label: 'Casual', value: 'casual' },
            { label: 'Formal', value: 'formal' },
          ],
        },
        { name: 'favoriteCollections', type: 'relationship', relationTo: 'shop-collections', hasMany: true },
        { name: 'favoriteCategories', type: 'relationship', relationTo: 'categories', hasMany: true },
      ],
    },
    {
      name: 'measurements',
      type: 'group',
      admin: { description: 'For size recommendations' },
      fields: [
        { name: 'heightCm', type: 'number', min: 0 },
        { name: 'weightKg', type: 'number', min: 0 },
        { name: 'chestCm', type: 'number', min: 0 },
        { name: 'waistCm', type: 'number', min: 0 },
        { name: 'hipsCm', type: 'number', min: 0 },
        {
          name: 'shoeSize',
          type: 'text',
          admin: { description: 'EU/US, e.g. 42 / 9' },
        },
        {
          name: 'topSize',
          type: 'select',
          options: [
            { label: 'XS', value: 'XS' },
            { label: 'S', value: 'S' },
            { label: 'M', value: 'M' },
            { label: 'L', value: 'L' },
            { label: 'XL', value: 'XL' },
            { label: 'XXL', value: 'XXL' },
          ],
        },
        {
          name: 'bottomSize',
          type: 'select',
          options: [
            { label: '28', value: '28' },
            { label: '30', value: '30' },
            { label: '32', value: '32' },
            { label: '34', value: '34' },
            { label: '36', value: '36' },
            { label: '38', value: '38' },
          ],
        },
      ],
    },
    {
      name: 'tier',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gold', value: 'gold' },
        { label: 'VIP', value: 'vip' },
      ],
      access: {
        create: ({ req: { user } }) => checkRole(['admin'], user as any),
        update: ({ req: { user } }) => checkRole(['admin'], user as any),
      },
      admin: { position: 'sidebar', description: 'Admin-managed loyalty tier' },
    },
    { name: 'loyaltyPoints', type: 'number', defaultValue: 0, min: 0, admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'preferences',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'newsletter', type: 'checkbox', defaultValue: true },
        { name: 'smsMarketing', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'addresses',
      type: 'join',
      collection: 'addresses',
      on: 'customer',
      admin: { hidden: true },
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'customer',
      admin: { hidden: true },
    },
    {
      name: 'wishlists',
      type: 'join',
      collection: 'wishlists',
      on: 'customer',
      admin: { hidden: true },
    },
  ],
  timestamps: true,
}
