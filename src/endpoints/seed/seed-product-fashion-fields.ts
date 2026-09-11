import type { Payload } from 'payload'

export const seedFashionFields = async ({ payload }: { payload: Payload }) => {
  payload.logger.info('— Patch fashion fields for 15 products')

  const res = await payload.find({ collection: 'products', limit: 30, depth: 0, overrideAccess: true })
  let patched = 0
  for (const p of res.docs as any[]) {
    const sku = p.sku || `LUC-${p.slug.slice(0, 3).toUpperCase()}-${String(p.id).slice(-4).toUpperCase()}`
    const brand = p.brand || 'Lucent'
    const compareAtPriceInUSD = p.compareAtPriceInUSD ?? (p.priceInUSD ? p.priceInUSD + 2000 : 7999)
    const shortDescription = p.shortDescription || p.meta?.description || `Premium ${((p.categories?.[0] as any)?.title || 'fashion')} piece — ${p.title}.`
    const overviewTitle = p.overviewTitle || 'Crafted for Everyday Elegance'
    const overviewFeatures = p.overviewFeatures?.length
      ? p.overviewFeatures
      : [
          { title: 'Premium Fabric', description: 'Soft, breathable and sustainably sourced for all-day comfort.' },
          { title: 'Flattering Fit', description: 'Tailored to accentuate silhouette while allowing ease of movement.' },
          { title: 'Versatile Styling', description: 'Dress up or down — from desk to dinner with effortless elegance.' },
          { title: 'Easy Care', description: 'Machine washable, wrinkle-resistant and designed to last season after season.' },
        ]
    const specifications = p.specifications?.length
      ? p.specifications
      : [
          {
            group: 'DETAILS',
            rows: [
              { label: 'Fit', value: 'True to size, model is 178cm wearing size S' },
              { label: 'Length', value: 'Midi / Maxi available, see size guide' },
              { label: 'Care', value: 'Machine wash cold, hang dry' },
            ],
          },
          {
            group: 'FABRIC & CARE',
            rows: [
              { label: 'Fabric', value: 'Premium blend, breathable and soft' },
              { label: 'Weight', value: 'Lightweight, 180 GSM' },
              { label: 'Origin', value: 'Designed in-house, ethically made' },
            ],
          },
          {
            group: 'SHIPPING',
            rows: [
              { label: 'Delivery', value: 'Free shipping over $99, 2-3 business days' },
              { label: 'Returns', value: '30-day free returns, tags attached' },
            ],
          },
        ]

    const needsPatch = !p.sku || !p.brand || !p.compareAtPriceInUSD || !p.shortDescription || !p.overviewFeatures?.length || !p.specifications?.length
    if (!needsPatch) continue

    await payload.update({
      collection: 'products',
      id: p.id,
      data: {
        sku,
        brand,
        compareAtPriceInUSD,
        shortDescription,
        overviewTitle,
        overviewFeatures,
        specifications,
        _status: 'published',
      } as any,
      overrideAccess: true,
      depth: 0,
      context: { disableRevalidate: true },
    })
    patched++
    payload.logger.info(`  patched ${p.slug} -> sku ${sku} brand ${brand} compare ${compareAtPriceInUSD}`)
  }
  payload.logger.info(`Done patched ${patched}/${res.docs.length}`)
}

if (process.argv[1]?.includes('seed-product-fashion-fields')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  await seedFashionFields({ payload })
  process.exit(0)
}
