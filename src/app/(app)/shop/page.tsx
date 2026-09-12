import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ShopProductCard } from '@/components/shop/ProductCard'
import { ProductResultsHeader } from '@/components/shop/ProductResultsHeader'
import { ShopPagination } from '@/components/shop/Pagination'
import { loadShopSearchParams } from '@/lib/searchParams.server'

export const metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, categories: categoriesParam, category: legacyCategory, minPrice, maxPrice, page, sizes: sizesParam } = await loadShopSearchParams(searchParams)
  const limit = 9

  const payload = await getPayload({ config: configPromise })

  const categorySlugs = (categoriesParam as string[]).length ? (categoriesParam as string[]) : legacyCategory ? [String(legacyCategory)] : []

  let categoryIds: string[] = []
  if (categorySlugs.length) {
    const cats = await payload.find({ collection: 'categories', where: { slug: { in: categorySlugs } }, limit: 20, depth: 0, overrideAccess: true })
    categoryIds = cats.docs.map((c) => String((c as any).id))
  }

  const whereAnd: any[] = [{ _status: { equals: 'published' } }]

  if (searchValue) {
    whereAnd.push({
      or: [{ title: { like: searchValue } }, { description: { like: searchValue } }],
    })
  }
  if (categoryIds.length) {
    whereAnd.push({ categories: { in: categoryIds } })
  }
  if (typeof minPrice === 'number' && minPrice > 0) whereAnd.push({ priceInUSD: { greater_than_equal: minPrice * 100 } })
  if (typeof maxPrice === 'number' && maxPrice > 0) whereAnd.push({ priceInUSD: { less_than_equal: maxPrice * 100 } })

  const sizeLabels = (sizesParam as string[]).filter(Boolean)
  if (sizeLabels.length) {
    const sizeTypeRes = await payload.find({ collection: 'variantTypes', where: { name: { equals: 'size' } }, limit: 1, depth: 2, overrideAccess: true })
    const sizeOpts = (((sizeTypeRes.docs[0] as any)?.options?.docs || []) as any[]).filter((o) => typeof o === 'object')
    const matchingOptIds = sizeOpts.filter((o) => sizeLabels.includes(o.label)).map((o) => String(o.id))
    if (matchingOptIds.length) {
      const matchingVariants = await payload.find({
        collection: 'variants',
        where: { options: { in: matchingOptIds } },
        limit: 500,
        depth: 0,
        select: { product: true },
        overrideAccess: true,
      })
      const productIds = [...new Set(matchingVariants.docs.map((v: any) => String(typeof v.product === 'object' ? v.product.id : v.product)))]
      whereAnd.push({ id: { in: productIds.length ? productIds : ['000000000000000000000000'] } })
    } else {
      whereAnd.push({ id: { in: ['000000000000000000000000'] } })
    }
  }

  const totalAll = await payload.count({ collection: 'products', where: { _status: { equals: 'published' } }, overrideAccess: true })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    limit,
    page,
    sort: (sort as any) || 'title',
    depth: 3,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInUSD: true,
      compareAtPriceInUSD: true,
      enableVariants: true,
      variantTypes: true,
      variants: true,
      sku: true,
      brand: true,
    },
    populate: {
      variants: { title: true, priceInUSD: true, inventory: true, options: true },
    },
    where: whereAnd.length > 1 ? { and: whereAnd } : whereAnd[0] ? whereAnd[0] : undefined,
  })

  const badges = ['sale', 'bestseller', 'new', 'limited', 'none', 'sale']
  const totalPages = products.totalPages

  return (
    <div className="flex flex-col gap-4">
      <ProductResultsHeader total={totalAll.totalDocs} filteredCount={products.totalDocs} />

      {products.docs.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No products found. Try different filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.docs.map((product, idx) => {
            const badge = badges[idx % badges.length]!
            const badgeLabel = badge === 'sale' ? 'Sale' : badge === 'bestseller' ? 'Bestseller' : badge === 'new' ? 'New' : badge === 'limited' ? 'Limited' : ''
            return <ShopProductCard key={product.id} product={product as any} badge={badge} badgeLabel={badgeLabel} />
          })}
        </div>
      )}

      <ShopPagination totalPages={totalPages} currentPage={page} />
    </div>
  )
}
