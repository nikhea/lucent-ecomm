import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: { description: 'Legacy nav - kept for mobile' },
    },
    {
      name: 'quickLinks',
      type: 'array',
      label: 'Quick Links (navbar dropdown, 3 items)',
      maxRows: 3,
      admin: { description: 'Quick Links dropdown — title + description shown in navbar' },
      fields: [
        { name: 'label', type: 'text', required: true, admin: { description: 'e.g. All Products' } },
        { name: 'description', type: 'textarea', required: true, admin: { description: 'e.g. Browse our full catalog.' } },
        link({ appearances: false }),
      ],
    },
  ],
}
