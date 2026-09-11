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
        layout: [reviewsBlock, newsletterBlock],
        meta: { title: 'Lucent - Female Fashion', description: 'Modern womenswear' },
      } as any,
      req,
      overrideAccess: true,
      depth: 0,
      context: { disableRevalidate: true },
    })
    payload.logger.info('  created home with reviews + newsletter')
    return
  }

  const hasNewsletter = home.layout?.some((b: any) => b.blockType === 'newsletterBanner')
  const hasReviews = home.layout?.some((b: any) => b.blockType === 'reviews')

  // Fix order if both exist but newsletter is before reviews (should be reviews -> newsletter)
  const hasBoth = hasNewsletter && hasReviews
  if (hasBoth) {
    const layout = home.layout as any[]
    const idxNewsletter = layout.findIndex((b: any) => b.blockType === 'newsletterBanner')
    const idxReviews = layout.findIndex((b: any) => b.blockType === 'reviews')
    if (idxNewsletter !== -1 && idxReviews !== -1 && idxNewsletter < idxReviews) {
      payload.logger.info('  fixing order: reviews should be before newsletter')
      const newsletter = layout[idxNewsletter]
      const reviews = layout[idxReviews]
      const withoutBoth = layout.filter((_: any, i: number) => i !== idxNewsletter && i !== idxReviews)
      // keep other blocks first, then reviews, then newsletter
      const reordered = [...withoutBoth, reviews, newsletter]
      await payload.update({
        collection: 'pages',
        id: home.id,
        data: { layout: reordered } as any,
        req,
        overrideAccess: true,
        depth: 0,
        context: { disableRevalidate: true },
      })
      payload.logger.info('  reordered home: reviews -> newsletter, no gaps')
      return
    }
  }

  // Add missing blocks in correct order (reviews -> newsletter)
  if (!hasNewsletter && !hasReviews) {
    await payload.update({
      collection: 'pages',
      id: home.id,
      data: { layout: [...(home.layout || []), reviewsBlock, newsletterBlock] } as any,
      req,
      overrideAccess: true,
      depth: 0,
      context: { disableRevalidate: true },
    })
    payload.logger.info('  added reviews + newsletter (reviews on top)')
    return
  }

  if (!hasReviews && hasNewsletter) {
    const layout = home.layout as any[]
    const idxNewsletter = layout.findIndex((b: any) => b.blockType === 'newsletterBanner')
    const newLayout = [...layout]
    newLayout.splice(idxNewsletter, 0, reviewsBlock)
    await payload.update({
      collection: 'pages',
      id: home.id,
      data: { layout: newLayout } as any,
      req,
      overrideAccess: true,
      depth: 0,
      context: { disableRevalidate: true },
    })
    payload.logger.info('  inserted reviews before newsletter')
    return
  }

  if (!hasNewsletter && hasReviews) {
    const layout = home.layout as any[]
    const idxReviews = layout.findIndex((b: any) => b.blockType === 'reviews')
    const newLayout = [...layout]
    newLayout.splice(idxReviews + 1, 0, newsletterBlock)
    await payload.update({
      collection: 'pages',
      id: home.id,
      data: { layout: newLayout } as any,
      req,
      overrideAccess: true,
      depth: 0,
      context: { disableRevalidate: true },
    })
    payload.logger.info('  inserted newsletter after reviews')
    return
  }

  payload.logger.info('  no new blocks to add')
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
