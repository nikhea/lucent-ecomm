import type { Payload, PayloadRequest, File } from 'payload'

type CollectionDef = {
  title: string
  slug: string
  excerpt: string
  description: string
  status: 'active' | 'draft' | 'archived'
  featured: boolean
  productSlugs: string[]
  imageSeed: string
  bannerSeed: string
  startDate?: string
  endDate?: string
}

const collectionDefs: CollectionDef[] = [
  {
    title: 'New Arrivals',
    slug: 'new-arrivals',
    excerpt: 'Just landed — 15 fresh silhouettes for the season. Be first to wear them.',
    description: 'Discover our newest drop: fluid tailoring, soft knits and sculpting dresses designed in-house for Lucent. Updated weekly.',
    status: 'active',
    featured: true,
    productSlugs: ['florence-tailored-jumpsuit', 'evie-silk-cami-top', 'harper-high-waist-jeans', 'maeve-sweater-dress', 'stella-wool-blend-coat'],
    imageSeed: 'collection-new-1',
    bannerSeed: 'collection-new-banner',
  },
  {
    title: 'Summer Essentials',
    slug: 'summer-essentials',
    excerpt: 'Linen, satin and airy knits — your capsule for warm days and late nights.',
    description: 'Curated for heat and ease: breathable linens, luminous satins and ribbed knits that layer without weighing you down.',
    status: 'active',
    featured: true,
    productSlugs: ['isla-linen-blend-shorts', 'sora-ribbed-knit-top', 'celine-pleated-midi-skirt', 'elara-slip-dress', 'liora-satin-wrap-blouse'],
    imageSeed: 'collection-summer-1',
    bannerSeed: 'collection-summer-banner',
  },
  {
    title: 'Workwear Edit',
    slug: 'workwear-edit',
    excerpt: 'Sharp tailoring meets soft drape — desk to dinner, refined.',
    description: 'The 9-to-9 edit: wide-leg trousers, oversized blazers and satin blouses that polish without trying.',
    status: 'active',
    featured: false,
    productSlugs: ['adeline-oversized-blazer', 'mira-wide-leg-trousers', 'liora-satin-wrap-blouse', 'harper-high-waist-jeans', 'celine-pleated-midi-skirt'],
    imageSeed: 'collection-work-1',
    bannerSeed: 'collection-work-banner',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Evening Collection',
    slug: 'evening-collection',
    excerpt: 'Sculpting maxis, puff sleeves and luminous slips — after-dark dressing.',
    description: 'Evening, elevated: bodycon maxis, cowl slips and puff-sleeve minis in luxe jersey and silk.',
    status: 'active',
    featured: true,
    productSlugs: ['nova-bodycon-maxi-dress', 'aurora-puff-sleeve-mini-dress', 'elara-slip-dress', 'florence-tailored-jumpsuit', 'evie-silk-cami-top'],
    imageSeed: 'collection-evening-1',
    bannerSeed: 'collection-evening-banner',
  },
  {
    title: 'Knitwear & Layers',
    slug: 'knitwear-layers',
    excerpt: 'Bouclé, rib and sweater knits — layering made effortless.',
    description: 'Textural knits for transitional weather: cropped cardigans, sweater dresses and soft ribbed tops.',
    status: 'active',
    featured: false,
    productSlugs: ['juniper-cropped-cardigan', 'maeve-sweater-dress', 'sora-ribbed-knit-top', 'stella-wool-blend-coat', 'adeline-oversized-blazer'],
    imageSeed: 'collection-knit-1',
    bannerSeed: 'collection-knit-banner',
  },
  {
    title: 'Sale — Archive',
    slug: 'sale-archive',
    excerpt: 'Past-season favourites, archived but not forgotten.',
    description: 'Archived collection kept for history and SEO — hidden from storefront but linked for reporting.',
    status: 'archived',
    featured: false,
    productSlugs: ['isla-linen-blend-shorts', 'juniper-cropped-cardigan'],
    imageSeed: 'collection-sale-1',
    bannerSeed: 'collection-sale-banner',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }], direction: 'ltr' as const, format: '' as const, indent: 0, version: 1, textFormat: 0, textStyle: '' }],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

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

export const seedShopCollections = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed shop-collections: female marketing collections')

  let created = 0
  let skipped = 0

  for (const def of collectionDefs) {
    const existing = await payload.find({ collection: 'shop-collections', where: { slug: { equals: def.slug } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
    if (existing.docs[0]) {
      payload.logger.info(`  skip existing: ${def.slug}`)
      skipped++
      continue
    }

    payload.logger.info(`  creating: ${def.title}`)

    const [imageFile, bannerFile] = await Promise.all([
      fetchFileByURL(`https://picsum.photos/seed/${def.imageSeed}/600/800`, `${def.slug}-card.jpg`),
      fetchFileByURL(`https://picsum.photos/seed/${def.bannerSeed}/1600/900`, `${def.slug}-banner.jpg`),
    ])

    const imageMedia = await payload.create({
      collection: 'media',
      data: { alt: `${def.title} — card` },
      file: imageFile,
      req,
      overrideAccess: true,
    })

    const bannerMedia = await payload.create({
      collection: 'media',
      data: { alt: `${def.title} — banner` },
      file: bannerFile,
      req,
      overrideAccess: true,
    })

    const productDocs = await Promise.all(
      def.productSlugs.map(async (slug) => {
        const res = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
        return res.docs[0]
      }),
    )
    const productIds = productDocs.filter(Boolean).map((p: any) => p.id)
    if (productIds.length === 0) payload.logger.warn(`  no products found for ${def.slug}: ${def.productSlugs.join(', ')}`)

    await payload.create({
      collection: 'shop-collections',
      data: {
        title: def.title,
        slug: def.slug,
        description: richText(def.description),
        excerpt: def.excerpt,
        image: (imageMedia as any).id,
        banner: (bannerMedia as any).id,
        products: productIds,
        status: def.status,
        featured: def.featured,
        startDate: def.startDate,
        endDate: def.endDate,
      } as any,
      req,
      overrideAccess: true,
      depth: 0,
    })
    created++
  }

  payload.logger.info(`Seed shop-collections done: created ${created}, skipped ${skipped}`)

  // Ensure categories remain sufficient (7 female categories already seeded by seed-15)
  const cats = await payload.find({ collection: 'categories', limit: 0, depth: 0, overrideAccess: true, req } as any)
  payload.logger.info(`Categories total: ${cats.totalDocs} — ${cats.docs.map((c: any) => c.title).join(', ')}`)
}

export default seedShopCollections

if (process.argv[1]?.includes('seed-shop-collections')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  payload.logger.info('Seed shop-collections direct run')
  await seedShopCollections({ payload })
  process.exit(0)
}
