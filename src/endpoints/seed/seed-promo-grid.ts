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

  // Use exact Unsplash images from user + white background
  const promoUrls = [
    'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=973',
    'https://images.unsplash.com/photo-1661327930345-9c6714b603b3?auto=format&fit=crop&q=80&w=400&h=400',
    'https://images.unsplash.com/photo-1535220459927-c8428851fd45?auto=format&fit=crop&q=80&w=400&h=400',
    'https://images.unsplash.com/photo-1559745482-57bfa9ca5a8a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1481',
  ]
  const files = await Promise.all(promoUrls.map((url, i) => fetchFileByURL(url, `promo-${i + 1}.jpg`)))

  const hasPromo = home.layout?.some((b: any) => b.blockType === 'promoGrid')
  if (hasPromo) {
    payload.logger.info('  promoGrid exists, updating to Unsplash images')
    const idxPromo = home.layout.findIndex((b: any) => b.blockType === 'promoGrid')
    // create new media for update
    const mediasUpdate: any[] = []
    for (let i = 0; i < files.length; i++) {
      const media = await payload.create({ collection: 'media', data: { alt: `Promo ${i + 1} Unsplash` }, file: files[i]!, req, overrideAccess: true })
      mediasUpdate.push(media)
    }
    const updatedPromo: any = {
      ...home.layout[idxPromo],
      items: [
        { eyebrow: 'NEW', title: 'Urban Chick Collection', linkLabel: 'Read More', image: (mediasUpdate[0] as any).id, link: { type: 'custom', url: '/shop?collection=new-arrivals' } },
        { eyebrow: 'SHOP SALES', title: 'Urban Chick Collection', linkLabel: 'Read More', image: (mediasUpdate[1] as any).id, link: { type: 'custom', url: '/shop?collection=sale-archive' } },
        { eyebrow: '50% OFF', title: 'Urban Chick Collection', linkLabel: 'Read More', image: (mediasUpdate[2] as any).id, link: { type: 'custom', url: '/shop?collection=summer-essentials' } },
        { eyebrow: 'UP TO 70%', title: 'Formal Elegance Series', linkLabel: 'Discover', image: (mediasUpdate[3] as any).id, link: { type: 'custom', url: '/shop?collection=evening-collection' } },
      ],
    }
    const newLayout = [...home.layout]
    newLayout[idxPromo] = updatedPromo
    await payload.update({ collection: 'pages', id: home.id, data: { layout: newLayout } as any, req, overrideAccess: true, depth: 0, context: { disableRevalidate: true } })
    payload.logger.info('  updated promoGrid with Unsplash + white bg')
    return
  }

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
