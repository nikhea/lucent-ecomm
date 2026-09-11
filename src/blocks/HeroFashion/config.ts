import type { Block } from 'payload'

export const HeroFashion: Block = {
  slug: 'heroFashion',
  interfaceName: 'HeroFashionBlock',
  labels: { singular: 'Hero Fashion', plural: 'Hero Fashion' },
  fields: [
    { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Summer Collection 2024' },
    { name: 'title', type: 'text', required: true, defaultValue: 'Elevate Your Style with Our Latest Collection' },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        "Discover handpicked fashion that combines comfort, quality, and style. Shop the season's must-haves with free shipping on orders over $50.",
    },
    {
      name: 'primaryLink',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true, defaultValue: 'Shop Now' },
        { name: 'url', type: 'text', required: true, defaultValue: '/shop' },
      ],
    },
    {
      name: 'secondaryLink',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true, defaultValue: 'View Lookbook' },
        { name: 'url', type: 'text', required: true, defaultValue: '/shop' },
      ],
    },
    { name: 'trustText', type: 'text', defaultValue: 'Trusted by 15,000+ happy customers worldwide' },
    { name: 'trustRating', type: 'text', defaultValue: '+2.5k ★ 4.9/5' },
    { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'badgeText', type: 'text', required: true, defaultValue: 'Summer Sale: 30% OFF' },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 4,
      maxRows: 4,
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: [
            { label: 'Check', value: 'check' },
            { label: 'Truck', value: 'truck' },
            { label: 'Shield', value: 'shield' },
            { label: 'Refresh', value: 'refresh' },
          ],
        },
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text', required: false },
        { name: 'value', type: 'text', required: true },
      ],
    },
  ],
}
