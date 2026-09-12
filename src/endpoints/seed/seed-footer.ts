import type { Payload, PayloadRequest } from 'payload'

export const seedFooter = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed footer CMS data')

  const data: any = {
    brandName: 'LUCENT',
    description: 'Discover premium products with exceptional quality and modern design. Your satisfaction is our priority.',
    newsletter: {
      title: 'Subscribe to our newsletter',
      placeholder: 'Enter your email',
      buttonLabel: 'Subscribe',
    },
    quickLinksTitle: 'Quick Links',
    quickLinks: [
      { link: { type: 'custom', url: '/about', label: 'About Us' } },
      { link: { type: 'custom', url: '/contact', label: 'Contact' } },
      { link: { type: 'custom', url: '/contact', label: 'FAQ' } },
      { link: { type: 'custom', url: '/shop', label: 'Shipping Info' } },
    ],
    legalTitle: 'Legal',
    legalLinks: [
      { link: { type: 'custom', url: '/privacy', label: 'Privacy Policy' } },
      { link: { type: 'custom', url: '/terms', label: 'Terms of Service' } },
      { link: { type: 'custom', url: '/returns', label: 'Returns' } },
    ],
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'instagram', url: 'https://instagram.com' },
    ],
    copyright: `© ${new Date().getFullYear()} LUCENT. All rights reserved.`,
  }

  await payload.updateGlobal({ slug: 'footer', data, overrideAccess: true, req } as any)
  payload.logger.info('  footer seeded')
}

export default seedFooter

if (process.argv[1]?.includes('seed-footer')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  await seedFooter({ payload })
  process.exit(0)
}
