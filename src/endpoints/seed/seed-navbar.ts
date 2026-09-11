import type { Payload, PayloadRequest } from 'payload'

export const seedNavbar = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed navbar CMS data (categories descriptions + quickLinks)')

  const categoryDescriptions: Record<string, string> = {
    Dresses: 'Elegant and stylish dresses for every occasion.',
    Tops: 'Trendy tops and blouses for a chic look.',
    Bottoms: 'Comfortable and stylish bottoms for all-day wear.',
    Skirts: 'Flowing and fitted skirts to match your style.',
    Outerwear: 'Stay warm and stylish with our outerwear collection.',
    Knitwear: 'Cozy knits and sweaters for layering.',
    Activewear: 'Performance meets style for your active life.',
  }

  for (const [title, desc] of Object.entries(categoryDescriptions)) {
    const existing = await payload.find({ collection: 'categories', where: { title: { equals: title } }, limit: 1, overrideAccess: true, req } as any)
    const cat = existing.docs[0] as any
    if (cat && !cat.description) {
      await payload.update({ collection: 'categories', id: cat.id, data: { description: desc }, overrideAccess: true, req })
      payload.logger.info(`  category ${title} -> description set`)
    } else if (cat) {
      payload.logger.info(`  category ${title} already has description`)
    }
  }

  const quickLinks = [
    {
      label: 'All Products',
      description: 'Browse our full product catalog.',
      link: { type: 'custom' as const, url: '/shop', label: 'All Products' },
    },
    {
      label: 'FAQs',
      description: 'Answers to common questions.',
      link: { type: 'custom' as const, url: '/contact', label: 'FAQs' },
    },
    {
      label: 'Blog',
      description: 'Get inspired by our latest posts.',
      link: { type: 'custom' as const, url: '/shop', label: 'Blog' },
    },
  ]

  const header = await payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true, req } as any)
  const existingQuick = (header as any).quickLinks || []
  if (existingQuick.length === 0) {
    await payload.updateGlobal({ slug: 'header', data: { quickLinks }, overrideAccess: true, req } as any)
    payload.logger.info('  header.quickLinks seeded (3 items)')
  } else {
    payload.logger.info(`  header.quickLinks already exists (${existingQuick.length} items), skipping`)
  }

  payload.logger.info('Seed navbar done')
}

export default seedNavbar

if (process.argv[1]?.includes('seed-navbar')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  await seedNavbar({ payload })
  process.exit(0)
}
