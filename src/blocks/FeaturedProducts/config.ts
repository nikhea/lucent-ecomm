import type { Block } from 'payload'

export const FeaturedProducts: Block = {
  slug: 'featuredProducts',
  interfaceName: 'FeaturedProductsBlock',
  labels: { singular: 'Featured Products', plural: 'Featured Products' },
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Optional section title, leave empty to hide' } },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 6,
      admin: { description: '6 products as per image (3x2 grid)' },
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        {
          name: 'badge',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Sale', value: 'sale' },
            { label: 'Bestseller', value: 'bestseller' },
            { label: 'New', value: 'new' },
            { label: 'Limited', value: 'limited' },
          ],
          defaultValue: 'none',
        },
        { name: 'badgeLabel', type: 'text', admin: { description: 'Override badge text, e.g. Sale / Bestseller' } },
      ],
    },
  ],
}
