import type { Payload, PayloadRequest } from 'payload'

export const seedFeaturedProducts = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed featuredProducts block (after categoryShowcase)')

  const homeRes = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
  const home = homeRes.docs[0] as any
  if (!home) {
    payload.logger.warn('  home not found')
    return
  }

  const hasFeatured = home.layout?.some((b: any) => b.blockType === 'featuredProducts')
  if (hasFeatured) {
    payload.logger.info('  featuredProducts already exists, skipping')
    return
  }

  const slugs = [
    'elara-slip-dress',
    'sora-ribbed-knit-top',
    'mira-wide-leg-trousers',
    'liora-satin-wrap-blouse',
    'celine-pleated-midi-skirt',
    'adeline-oversized-blazer',
  ]

  const products = await Promise.all(
    slugs.map(async (slug) => {
      const res = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
      return res.docs[0]
    }),
  )

  const validProducts = products.filter(Boolean)
  if (validProducts.length === 0) {
    payload.logger.warn('  no products found for featured')
    return
  }

  const badges: Array<{ badge: string; badgeLabel: string }> = [
    { badge: 'sale', badgeLabel: 'Sale' },
    { badge: 'bestseller', badgeLabel: 'Bestseller' },
    { badge: 'new', badgeLabel: 'New' },
    { badge: 'none', badgeLabel: '' },
    { badge: 'limited', badgeLabel: 'Limited' },
    { badge: 'none', badgeLabel: '' },
  ]

  const items = validProducts.slice(0, 6).map((p: any, i: number) => ({
    product: p.id,
    badge: badges[i]?.badge || 'none',
    badgeLabel: badges[i]?.badgeLabel || '',
  }))

  const block: any = {
    blockType: 'featuredProducts',
    items,
  }

  const layout = home.layout as any[]
  const idxCategory = layout.findIndex((b: any) => b.blockType === 'categoryShowcase')
  const insertIdx = idxCategory !== -1 ? idxCategory + 1 : 1
  const newLayout = [...layout]
  newLayout.splice(insertIdx, 0, block)

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout: newLayout } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { disableRevalidate: true },
  })
  payload.logger.info('  added featuredProducts (6 items, 3x2 grid, hover sizes) after categoryShowcase')
}

export default seedFeaturedProducts

if (process.argv[1]?.includes('seed-featured-products')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  await seedFeaturedProducts({ payload })
  process.exit(0)
}
