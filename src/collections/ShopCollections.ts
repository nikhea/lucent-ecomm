import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const ShopCollections: CollectionConfig = {
  slug: 'shop-collections',
  labels: { singular: 'Collection', plural: 'Collections' },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'products', 'updatedAt'],
    description: 'Marketing groupings — Summer 2026, Black Friday, New Arrivals. Distinct from Categories (permanent classification).',
  },
  defaultSort: '-createdAt',
  indexes: [
    { fields: ['status'] },
    { fields: ['startDate'] },
    { fields: ['endDate'] },
  ],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g. Spring/Summer 2026, Tech Fleece Collection' },
    },
    slugField({ position: undefined, slugOverrides: { admin: { description: 'Auto-generated from title' } } } as any),
    {
      name: 'description',
      type: 'richText',
      admin: { description: 'Story / campaign copy — "Designed for the city after dark"' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: { description: 'Short teaser for cards (max 300)' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Card / thumbnail image' },
    },
    {
      name: 'banner',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Hero banner for collection page' },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      index: true,
      admin: { description: 'Products in this collection — same product can be in multiple collections', sortOptions: 'title' },
    },
    {
      name: 'productsCount',
      type: 'number',
      admin: { readOnly: true, hidden: true },
      hooks: {
        beforeChange: [
          ({ data }: { data?: any }) => {
            if (!data) return data
            if (Array.isArray(data?.products)) data.productsCount = data.products.length
            else data.productsCount = 0
            return data
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Draft', value: 'draft' },
      ],
      admin: { position: 'sidebar', description: 'Archived = hidden from storefront but kept for history' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show on homepage / featured strip' },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' }, description: 'Campaign start (optional)' },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' }, description: 'Campaign end (optional)' },
      validate: (val: unknown, { data }: any) => {
        if (val && data?.startDate && new Date(val as string) < new Date(data.startDate as string)) return 'End date must be after start date'
        return true
      },
    },
    {
      name: 'collectionProducts',
      type: 'join',
      collection: 'products',
      on: 'shopCollections',
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data?.slug) data.slug = undefined
        return data
      },
    ],
  },
  timestamps: true,
}
