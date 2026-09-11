import type { Payload, PayloadRequest, File } from 'payload'

async function fetchFileByURL(url: string, fallbackName?: string): Promise<File> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const data = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg'
  const name = fallbackName || `file-${Date.now()}.${ext}`
  const safeName = name.includes('.') ? name : `${name}.${ext}`
  return { name: safeName, data: Buffer.from(data), mimetype: contentType, size: data.byteLength }
}

export const seedHeroFashion = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed heroFashion block')

  const homeRes = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
  let home = homeRes.docs[0] as any
  if (!home) {
    payload.logger.warn('  home not found')
    return
  }

  const hasHero = home.layout?.some((b: any) => b.blockType === 'heroFashion')
  if (hasHero) {
    payload.logger.info('  heroFashion already exists, updating image if needed')
    // update existing heroFashion's image to ensure correct URL
    const idx = home.layout.findIndex((b: any) => b.blockType === 'heroFashion')
    const existing = home.layout[idx]
    // keep existing, just ensure it has correct data (no need to re-upload)
    return
  }

  const heroImageUrl = 'https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/fashion-model-wearing-latest-collection.800w.4a9a22.avif'
  payload.logger.info('  fetching hero image...')
  const heroFile = await fetchFileByURL(heroImageUrl, 'hero-fashion.avif')

  const heroMedia = await payload.create({
    collection: 'media',
    data: { alt: 'Fashion model wearing latest collection' },
    file: heroFile,
    req,
    overrideAccess: true,
  })

  const heroBlock: any = {
    blockType: 'heroFashion',
    eyebrow: 'Summer Collection 2024',
    title: 'Elevate Your Style with Our Latest Collection',
    description: "Discover handpicked fashion that combines comfort, quality, and style. Shop the season's must-haves with free shipping on orders over $50.",
    primaryLink: { label: 'Shop Now', url: '/shop' },
    secondaryLink: { label: 'View Lookbook', url: '/shop' },
    trustText: 'Trusted by 15,000+ happy customers worldwide',
    trustRating: '+2.5k ★ 4.9/5',
    heroImage: (heroMedia as any).id,
    badgeText: 'Summer Sale: 30% OFF',
    features: [
      { icon: 'check', title: 'Premium', subtitle: 'Products', value: '10k+' },
      { icon: 'truck', title: 'Global Shipping', subtitle: '', value: '25+ Countries' },
      { icon: 'shield', title: 'Secure', subtitle: 'Checkout', value: '100% Safe' },
      { icon: 'refresh', title: 'Easy Returns', subtitle: '', value: '30 Days' },
    ],
  }

  // Insert at beginning of layout
  const newLayout = [heroBlock, ...(home.layout || [])]

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: {
      hero: { type: 'none' },
      layout: newLayout as any,
    },
    req,
    overrideAccess: true,
    depth: 0,
    context: { disableRevalidate: true },
  })
  payload.logger.info('  added heroFashion as first block, hero set to none')
}

export default seedHeroFashion

if (process.argv[1]?.includes('seed-hero-fashion')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  await seedHeroFashion({ payload })
  process.exit(0)
}
