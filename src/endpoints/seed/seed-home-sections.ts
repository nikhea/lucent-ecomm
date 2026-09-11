import type { Payload, PayloadRequest } from 'payload'

export const seedHomeSections = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed home sections (newsletter + reviews)')

  const newsletterBlock = {
    blockType: 'newsletterBanner',
    title: 'Stay Updated',
    description: 'Subscribe to our newsletter and be the first to know about new products, exclusive offers, and special promotions.',
    placeholder: 'Enter your email address',
    buttonLabel: 'Subscribe Now',
    disclaimer: 'We respect your privacy. Unsubscribe at any time.',
  }
  const reviewsBlock = {
    blockType: 'reviews',
    eyebrow: 'REVIEWS',
    title: 'Loved By Sound Obsessives',
    subtitle: '1,284 verified buyers on what life with the Halden Wave Pro actually sounds like.',
    items: [
      { quote: 'Holds the low end without smearing the strings. Stage feels wide for a closed-back, not gimmicky.', authorName: 'Aki Okafor', authorRole: 'Composer', rating: 5 },
      { quote: 'Cancellation handled the JFK engine wash without that pressurized ear feeling. Easy to recommend.', authorName: 'Mateo Halberg', authorRole: 'Frequent flier', rating: 5 },
      { quote: 'Codec switching is invisible between phone and laptop. The companion app remembers EQ per source.', authorName: 'Yuki Tanaka', authorRole: 'Product designer', rating: 5 },
      { quote: 'Battery beat the 38 hour claim on heavy ANC use. Fast charge brings them back in twelve minutes.', authorName: 'Priya Iyer', authorRole: 'Researcher', rating: 5 },
    ],
  }

  const homeRes = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
  let home = homeRes.docs[0] as any
  if (!home) {
    payload.logger.info('  home not found, creating new home with blocks')
    home = await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        _status: 'published',
        hero: { type: 'lowImpact', richText: { root: { type: 'root', children: [{ type: 'heading', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Welcome to Lucent', version: 1 }], direction: 'ltr', format: '', indent: 0, tag: 'h1', version: 1 }], direction: 'ltr', format: '', indent: 0, version: 1 } } },
        layout: [newsletterBlock, reviewsBlock],
        meta: { title: 'Lucent - Female Fashion', description: 'Modern womenswear' },
      } as any,
      req,
      overrideAccess: true,
      depth: 0,
      context: { disableRevalidate: true },
    })
    payload.logger.info('  created home with newsletter + reviews')
    return
  }

  const hasNewsletter = home.layout?.some((b: any) => b.blockType === 'newsletterBanner')
  const hasReviews = home.layout?.some((b: any) => b.blockType === 'reviews')

  const newBlocks: any[] = []

  if (!hasNewsletter) {
    newBlocks.push(newsletterBlock)
    payload.logger.info('  adding newsletterBanner block')
  } else payload.logger.info('  newsletterBanner already exists, skipping')

  if (!hasReviews) {
    newBlocks.push(reviewsBlock)
    payload.logger.info('  adding reviews block')
  } else payload.logger.info('  reviews block already exists, skipping')

  if (newBlocks.length === 0) {
    payload.logger.info('  no new blocks to add')
    return
  }

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout: [...(home.layout || []), ...newBlocks] } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { disableRevalidate: true },
  })
  payload.logger.info(`  updated home with ${newBlocks.length} blocks`)
}

export default seedHomeSections

if (process.argv[1]?.includes('seed-home-sections')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  await seedHomeSections({ payload })
  process.exit(0)
}
