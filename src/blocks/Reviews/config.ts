import type { Block } from 'payload'

export const ReviewsBlock: Block = {
  slug: 'reviews',
  interfaceName: 'ReviewsBlock',
  labels: { singular: 'Reviews Section', plural: 'Reviews Sections' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'REVIEWS' },
    { name: 'title', type: 'text', required: true, defaultValue: 'Loved By Sound Obsessives' },
    {
      name: 'subtitle',
      type: 'textarea',
      defaultValue: '1,284 verified buyers on what life with the Halden Wave Pro actually sounds like.',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      admin: { description: 'Testimonials - same count as image (3-4)' },
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { name: 'authorName', type: 'text', required: true },
        { name: 'authorRole', type: 'text', required: true },
        { name: 'avatar', type: 'upload', relationTo: 'media', required: false },
        { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5, required: true },
      ],
    },
  ],
}
