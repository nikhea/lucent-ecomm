import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
      defaultValue: 'EcommerceKit',
      admin: { description: 'Logo text' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue: 'Discover premium products with exceptional quality and modern design. Your satisfaction is our priority.',
      admin: { description: 'Left column brand description' },
    },
    {
      name: 'newsletter',
      type: 'group',
      admin: { description: 'Newsletter block' },
      fields: [
        { name: 'title', type: 'text', required: true, defaultValue: 'Subscribe to our newsletter' },
        { name: 'placeholder', type: 'text', required: true, defaultValue: 'Enter your email' },
        { name: 'buttonLabel', type: 'text', required: true, defaultValue: 'Subscribe' },
      ],
    },
    {
      name: 'quickLinksTitle',
      type: 'text',
      required: true,
      defaultValue: 'Quick Links',
    },
    {
      name: 'quickLinks',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Middle column (4 items as per image)' },
      fields: [
        link({
          appearances: false,
        }),
      ],
    },
    {
      name: 'legalTitle',
      type: 'text',
      required: true,
      defaultValue: 'Legal',
    },
    {
      name: 'legalLinks',
      type: 'array',
      maxRows: 3,
      admin: { description: 'Right column (3 items as per image)' },
      fields: [
        link({
          appearances: false,
        }),
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      maxRows: 3,
      label: 'Social Links',
      admin: { description: 'Facebook, Twitter, Instagram' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
          ],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      required: true,
      defaultValue: '© 2025 EcommerceKit. All rights reserved.',
    },
    {
      name: 'navItems',
      type: 'array',
      admin: { hidden: true, description: 'Legacy - kept for backwards compat' },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
