import type { Block } from 'payload'

export const CategoryShowcase: Block = {
  slug: 'categoryShowcase',
  interfaceName: 'CategoryShowcaseBlock',
  labels: { singular: 'Category Showcase', plural: 'Category Showcases' },
  fields: [
    { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Discover Your Style' },
    { name: 'title', type: 'text', required: true, defaultValue: 'Elevate Your Wardrobe With Premium Fashion' },
    {
      name: 'subtitle',
      type: 'textarea',
      required: true,
      defaultValue: 'Explore our curated collection of designer pieces and create your perfect look',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 4,
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'count', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'link',
          type: 'group',
          fields: [
            { name: 'url', type: 'text', required: true, defaultValue: '/shop' },
          ],
        },
      ],
    },
  ],
}
