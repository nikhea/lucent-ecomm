import type { Block } from 'payload'

export const NewsletterBanner: Block = {
  slug: 'newsletterBanner',
  interfaceName: 'NewsletterBannerBlock',
  labels: { singular: 'Newsletter Banner', plural: 'Newsletter Banners' },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'Stay Updated' },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue: 'Subscribe to our newsletter and be the first to know about new products, exclusive offers, and special promotions.',
    },
    { name: 'placeholder', type: 'text', required: true, defaultValue: 'Enter your email address' },
    { name: 'buttonLabel', type: 'text', required: true, defaultValue: 'Subscribe Now' },
    {
      name: 'disclaimer',
      type: 'text',
      defaultValue: 'We respect your privacy. Unsubscribe at any time.',
    },
  ],
}
