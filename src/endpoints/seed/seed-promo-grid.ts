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

export const seedPromoGrid = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed promoGrid block')

  const homeRes = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
  let home = homeRes.docs[0] as any
  if (!home) {
    payload.logger.warn('  home not found')
    return
  }

  const hasPromo = home.layout?.some((b: any) => b.blockType === 'promoGrid')
  if (hasPromo) {
    payload.logger.info('  promoGrid already exists, skipping')
    return
  }

  // Create 4 media for promo grid (B&W fashion)
  const seeds = ['promo-urban-1', 'promo-urban-2', 'promo-urban-3', 'promo-formal-1']
  const files = await Promise.all(
    seeds.map((seed, i) => fetchFileByURL(`https://picsum.photos/seed/${seed}/800/1000`, `promo-${i + 1}.jpg`)),
  )

  const medias = []
  for (let i = 0; i < files.length; i++) {
    const media = await payload.create({
      collection: 'media',
      data: { alt: `Promo ${i + 1}` },
      file: files[i]!,
      req,
      overrideAccess: true,
    })
    medias.push(media)
  }

  const promoBlock: any = {
    blockType: 'promoGrid',
    items: [
      { eyebrow: 'NEW', title: 'Urban Chick Collection', linkLabel: 'Read More', image: (medias[0] as any).id, link: { type: 'custom', url: '/shop?collection=new-arrivals' } },
      { eyebrow: 'SHOP SALES', title: 'Urban Chick Collection', linkLabel: 'Read More', image: (medias[1] as any).id, link: { type: 'custom', url: '/shop?collection=sale-archive' } },
      { eyebrow: '50% OFF', title: 'Urban Chick Collection', linkLabel: 'Read More', image: (medias[2] as any).id, link: { type: 'custom', url: '/shop?collection=summer-essentials' } },
      { eyebrow: 'UP TO 70%', title: 'Formal Elegance Series', linkLabel: 'Discover', image: (medias[3] as any).id, link: { type: 'custom', url: '/shop?collection=evening-collection' } },
    ],
  }

  // Insert promoGrid at beginning (after hero, before reviews)
  const layout = home.layout as any[]
  const idxReviews = layout.findIndex((b: any) => b.blockType === 'reviews')
  const insertIdx = idxReviews !== -1 ? idxReviews : 0
  const newLayout = [...layout]
  newLayout.splice(insertIdx, 0, promoBlock)

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout: newLayout } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { disableRevalidate: true },
  })
  payload.logger.info('  added promoGrid (4 items) before reviews')
}

export default seedPromoGrid

if (process.argv[1]?.includes('seed-promo-grid')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  await seedPromoGrid({ payload })
  process.exit(0)
}
