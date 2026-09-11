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

export const seedCategoryShowcase = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed categoryShowcase block (below hero)')

  const homeRes = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
  const home = homeRes.docs[0] as any
  if (!home) {
    payload.logger.warn('  home not found')
    return
  }

  const hasBlock = home.layout?.some((b: any) => b.blockType === 'categoryShowcase')
  if (hasBlock) {
    payload.logger.info('  categoryShowcase already exists, skipping')
    return
  }

  const urls = [
    'https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/elegant-evening-dress.400w.6f3ec4.avif',
    'https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/striped-casual-shirt.400w.f9c739.avif',
    'https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/denim-jeans-collection.400w.a72a24.avif',
    'https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/accessories-2.400w.db680a.avif',
  ]

  const files = await Promise.all(urls.map((url, i) => fetchFileByURL(url, `category-${i + 1}.avif`)))
  const medias = []
  for (let i = 0; i < files.length; i++) {
    const media = await payload.create({ collection: 'media', data: { alt: `Category ${i + 1}` }, file: files[i]!, req, overrideAccess: true })
    medias.push(media)
  }

  const block: any = {
    blockType: 'categoryShowcase',
    eyebrow: 'Discover Your Style',
    title: 'Elevate Your Wardrobe With Premium Fashion',
    subtitle: 'Explore our curated collection of designer pieces and create your perfect look',
    items: [
      { title: 'Dresses', count: '2.5k+ Products', image: (medias[0] as any).id, link: { url: '/shop?category=dresses' } },
      { title: 'Tops', count: '1.8k+ Products', image: (medias[1] as any).id, link: { url: '/shop?category=tops' } },
      { title: 'Pants', count: '1.2k+ Products', image: (medias[2] as any).id, link: { url: '/shop?category=bottoms' } },
      { title: 'Accessories', count: '3k+ Products', image: (medias[3] as any).id, link: { url: '/shop?category=accessories' } },
    ],
  }

  // Insert below heroFashion (as requested: below hero)
  const layout = home.layout as any[]
  const idxHero = layout.findIndex((b: any) => b.blockType === 'heroFashion')
  const insertIdx = idxHero !== -1 ? idxHero + 1 : 0
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
  payload.logger.info('  added categoryShowcase below hero')
}

export default seedCategoryShowcase

if (process.argv[1]?.includes('seed-category-showcase')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  await seedCategoryShowcase({ payload })
  process.exit(0)
}
