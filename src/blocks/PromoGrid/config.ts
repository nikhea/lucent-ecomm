import type { Block } from 'payload'

export const PromoGrid: Block = {
  slug: 'promoGrid',
  interfaceName: 'PromoGridBlock',
  labels: { singular: 'Promo Grid', plural: 'Promo Grids' },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 4,
      maxRows: 4,
      admin: { description: '4 items: 3 top row + 1 wide bottom (as per image)' },
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'linkLabel', type: 'text', required: true, defaultValue: 'Read More' },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'link',
          type: 'group',
          fields: [
            { name: 'type', type: 'radio', options: [{ label: 'Custom URL', value: 'custom' }, { label: 'Internal', value: 'internal' }], defaultValue: 'custom', required: true },
            { name: 'url', type: 'text', admin: { condition: (_, s) => s?.type === 'custom' } },
          ],
        },
      ],
    },
  ],
}
