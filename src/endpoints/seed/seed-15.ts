import type { Payload, PayloadRequest, File } from 'payload'
import type { VariantOption, VariantType, Media, Category } from '@/payload-types'

const femaleCategories = ['Dresses', 'Tops', 'Bottoms', 'Skirts', 'Outerwear', 'Knitwear', 'Activewear'] as const

const sizeOptions = [
  { label: 'XS', value: 'xs' },
  { label: 'S', value: 's' },
  { label: 'M', value: 'm' },
  { label: 'L', value: 'l' },
  { label: 'XL', value: 'xl' },
] as const

const colorOptions = [
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Beige', value: 'beige' },
  { label: 'Blush', value: 'blush' },
  { label: 'Sage', value: 'sage' },
  { label: 'Navy', value: 'navy' },
] as const

type FemaleProductDef = {
  title: string
  slug: string
  excerpt: string
  price: number
  category: (typeof femaleCategories)[number]
  colors: (typeof colorOptions)[number]['value'][]
  imageSeeds: [string, string]
}

const femaleProducts: FemaleProductDef[] = [
  { title: 'Elara Slip Dress', slug: 'elara-slip-dress', excerpt: 'Silky midi with delicate cowl neckline', price: 8999, category: 'Dresses', colors: ['beige', 'black'], imageSeeds: ['elara-1', 'elara-2'] },
  { title: 'Sora Ribbed Knit Top', slug: 'sora-ribbed-knit-top', excerpt: 'Second-skin ribbed knit, square neckline', price: 4599, category: 'Tops', colors: ['white', 'sage'], imageSeeds: ['sora-1', 'sora-2'] },
  { title: 'Mira Wide-Leg Trousers', slug: 'mira-wide-leg-trousers', excerpt: 'High-waisted drape, fluid wide leg', price: 7999, category: 'Bottoms', colors: ['black', 'beige'], imageSeeds: ['mira-1', 'mira-2'] },
  { title: 'Liora Satin Wrap Blouse', slug: 'liora-satin-wrap-blouse', excerpt: 'Wrap silhouette in luminous satin', price: 6499, category: 'Tops', colors: ['blush', 'white'], imageSeeds: ['liora-1', 'liora-2'] },
  { title: 'Celine Pleated Midi Skirt', slug: 'celine-pleated-midi-skirt', excerpt: 'Sun-pleated, movement in every step', price: 7499, category: 'Skirts', colors: ['navy', 'beige'], imageSeeds: ['celine-1', 'celine-2'] },
  { title: 'Adeline Oversized Blazer', slug: 'adeline-oversized-blazer', excerpt: 'Structured shoulders, soft drape', price: 12999, category: 'Outerwear', colors: ['beige', 'black'], imageSeeds: ['adeline-1', 'adeline-2'] },
  { title: 'Juniper Cropped Cardigan', slug: 'juniper-cropped-cardigan', excerpt: 'Cropped bouclé, pearl buttons', price: 5999, category: 'Knitwear', colors: ['sage', 'white'], imageSeeds: ['juniper-1', 'juniper-2'] },
  { title: 'Isla Linen Blend Shorts', slug: 'isla-linen-blend-shorts', excerpt: 'Tailored linen, relaxed summer cut', price: 4499, category: 'Bottoms', colors: ['white', 'beige'], imageSeeds: ['isla-1', 'isla-2'] },
  { title: 'Nova Bodycon Maxi Dress', slug: 'nova-bodycon-maxi-dress', excerpt: 'Sculpting jersey, floor-length elegance', price: 9999, category: 'Dresses', colors: ['black', 'blush'], imageSeeds: ['nova-1', 'nova-2'] },
  { title: 'Aurora Puff Sleeve Mini Dress', slug: 'aurora-puff-sleeve-mini-dress', excerpt: 'Puff sleeves, smocked bodice', price: 7999, category: 'Dresses', colors: ['blush', 'sage'], imageSeeds: ['aurora-1', 'aurora-2'] },
  { title: 'Stella Wool Blend Coat', slug: 'stella-wool-blend-coat', excerpt: 'Camel wool blend, belted waist', price: 14999, category: 'Outerwear', colors: ['beige', 'navy'], imageSeeds: ['stella-1', 'stella-2'] },
  { title: 'Maeve Sweater Dress', slug: 'maeve-sweater-dress', excerpt: 'Cozy knit, mock neck, midi length', price: 8499, category: 'Knitwear', colors: ['white', 'black'], imageSeeds: ['maeve-1', 'maeve-2'] },
  { title: 'Harper High-Waist Jeans', slug: 'harper-high-waist-jeans', excerpt: 'High rise, straight leg, vintage wash', price: 6999, category: 'Bottoms', colors: ['navy', 'black'], imageSeeds: ['harper-1', 'harper-2'] },
  { title: 'Evie Silk Cami Top', slug: 'evie-silk-cami-top', excerpt: 'Silk charmeuse, bias cut', price: 5499, category: 'Tops', colors: ['black', 'blush'], imageSeeds: ['evie-1', 'evie-2'] },
  { title: 'Florence Tailored Jumpsuit', slug: 'florence-tailored-jumpsuit', excerpt: 'Tailored one-piece, wide leg', price: 11999, category: 'Dresses', colors: ['navy', 'black'], imageSeeds: ['florence-1', 'florence-2'] },
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
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const data = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.split('/')[1]?.split(';')[0] || url.split('.').pop()?.split('?')[0] || 'jpg'
  const name = fallbackName || url.split('/').pop()?.split('?')[0] || `file-${Date.now()}.${ext}`
  const safeName = name.includes('.') ? name : `${name}.${ext}`
  return { name: safeName, data: Buffer.from(data), mimetype: contentType, size: data.byteLength }
}

async function findOrCreateCategory(payload: Payload, title: string, req?: PayloadRequest) {
  const existing = await payload.find({ collection: 'categories', where: { slug: { equals: title.toLowerCase().replace(/\s+/g, '-') } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
  if (existing.docs[0]) return existing.docs[0] as Category
  return (await payload.create({ collection: 'categories', data: { title, slug: title.toLowerCase().replace(/\s+/g, '-') }, req, overrideAccess: true })) as unknown as Category
}

async function findOrCreateVariantType(payload: Payload, name: string, label: string, req?: PayloadRequest) {
  const existing = await payload.find({ collection: 'variantTypes', where: { name: { equals: name } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
  if (existing.docs[0]) return existing.docs[0] as VariantType
  return (await payload.create({ collection: 'variantTypes', data: { name, label }, req, overrideAccess: true })) as unknown as VariantType
}

async function findOrCreateVariantOption(payload: Payload, label: string, value: string, variantTypeId: string, req?: PayloadRequest) {
  const existing = await payload.find({
    collection: 'variantOptions',
    where: { and: [{ value: { equals: value } }, { variantType: { equals: variantTypeId } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  } as any)
  if (existing.docs[0]) return existing.docs[0] as VariantOption
  return (await payload.create({ collection: 'variantOptions', data: { label, value, variantType: variantTypeId }, req, overrideAccess: true })) as unknown as VariantOption
}

export const seed15 = async ({ payload, req }: { payload: Payload; req?: PayloadRequest }) => {
  payload.logger.info('— Seed-15: Female clothing (non-destructive, additive)')

  const categoryMap = new Map<string, Category>()
  for (const cat of femaleCategories) {
    const doc = await findOrCreateCategory(payload, cat, req)
    categoryMap.set(cat, doc)
    payload.logger.info(`  category: ${cat} -> ${doc.id}`)
  }

  const sizeType = await findOrCreateVariantType(payload, 'size', 'Size', req)
  const colorType = await findOrCreateVariantType(payload, 'color', 'Color', req)

  const sizeOptionMap = new Map<string, VariantOption>()
  for (const opt of sizeOptions) {
    const doc = await findOrCreateVariantOption(payload, opt.label, opt.value, sizeType.id, req)
    sizeOptionMap.set(opt.value, doc)
  }
  const colorOptionMap = new Map<string, VariantOption>()
  for (const opt of colorOptions) {
    const doc = await findOrCreateVariantOption(payload, opt.label, opt.value, colorType.id, req)
    colorOptionMap.set(opt.value, doc)
  }

  payload.logger.info(`— Seeding ${femaleProducts.length} female products (Cloudinary: ${process.env.CLOUDINARY_URL ? 'URL' : process.env.CLOUD_NAME ? 'keys' : 'local disabled'})`)

  let createdCount = 0
  let skippedCount = 0

  for (const def of femaleProducts) {
    const existing = await payload.find({ collection: 'products', where: { slug: { equals: def.slug } }, limit: 1, depth: 0, overrideAccess: true, req } as any)
    if (existing.docs[0]) {
      payload.logger.info(`  skip existing: ${def.slug}`)
      skippedCount++
      continue
    }

    payload.logger.info(`  creating: ${def.title} (${def.slug})`)

    const imageFiles = await Promise.all(
      def.imageSeeds.map((seed, idx) =>
        fetchFileByURL(`https://picsum.photos/seed/lucent-female-${seed}/800/1200`, `${def.slug}-${idx + 1}.jpg`).catch(async () => {
          payload.logger.warn(`  fetch failed for ${seed}, using placeholder`)
          return fetchFileByURL(`https://picsum.photos/800/1200?random=${def.slug}-${idx}`, `${def.slug}-${idx + 1}.jpg`)
        }),
      ),
    )

    const mediaDocs: Media[] = []
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]!
      const variantColorValue = def.colors[i % def.colors.length]!
      const colorOpt = colorOptionMap.get(variantColorValue)
      const alt = `${def.title} — ${colorOpt?.label || variantColorValue} — view ${i + 1}`
      const media = (await payload.create({
        collection: 'media',
        data: { alt, caption: undefined },
        file,
        req,
        overrideAccess: true,
      })) as unknown as Media
      mediaDocs.push(media)
    }

    const category = categoryMap.get(def.category)!
    const variantTypes = [sizeType, colorType]

    const gallery = mediaDocs.map((m, idx) => {
      const colorVal = def.colors[idx % def.colors.length]!
      return { image: m.id, variantOption: colorOptionMap.get(colorVal)?.id }
    })

    const metaImage = mediaDocs[0]!

    const product = await payload.create({
      collection: 'products',
      data: {
        title: def.title,
        slug: def.slug,
        description: richText(`${def.excerpt} — Crafted for the modern wardrobe. Premium fabric, flattering cut, designed in-house for Lucent.`),
        gallery,
        priceInUSDEnabled: true,
        priceInUSD: def.price,
        inventory: 0,
        enableVariants: true,
        variantTypes: variantTypes.map((t) => t.id),
        categories: [category.id],
        _status: 'published',
        meta: { title: `${def.title} | Lucent`, description: def.excerpt, image: metaImage.id },
        relatedProducts: [],
      } as any,
      req,
      overrideAccess: true,
      depth: 0,
    })

    const sizeVariants = sizeOptions.map((s) => sizeOptionMap.get(s.value)!)
    const productColors = def.colors.map((c) => colorOptionMap.get(c)!).filter(Boolean) as VariantOption[]

    for (const sizeOpt of sizeVariants) {
      for (const colorOpt of productColors) {
        const isOutOfStockSample = def.slug === 'mira-wide-leg-trousers' && sizeOpt.value === 'xs' && colorOpt.value === 'black'
        await payload.create({
          collection: 'variants',
          data: {
            product: product.id,
            options: [sizeOpt.id, colorOpt.id],
            inventory: isOutOfStockSample ? 0 : Math.floor(30 + Math.random() * 170),
            priceInUSDEnabled: true,
            priceInUSD: def.price + (colorOpt.value === 'beige' ? 0 : colorOpt.value === 'navy' ? 500 : 0),
            _status: 'published',
          } as any,
          req,
          overrideAccess: true,
          depth: 0,
        })
      }
    }

    createdCount++
    payload.logger.info(`  created ${def.slug} with ${sizeVariants.length * productColors.length} variants`)
  }

  payload.logger.info(`Seed-15 done: created ${createdCount}, skipped ${skippedCount}, total ${femaleProducts.length}`)
}

export default seed15

if (process.argv[1]?.includes('seed-15')) {
  const { getPayload } = await import('payload')
  const configPromise = (await import('@/payload.config')).default
  const config = await configPromise
  const payload = await getPayload({ config })
  payload.logger.info('Seed-15 direct run')
  await seed15({ payload })
  process.exit(0)
}
