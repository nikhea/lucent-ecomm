import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ShopProductCard } from '@/components/shop/ProductCard'
import { ProductResultsHeader } from '@/components/shop/ProductResultsHeader'
import { ShopPagination } from '@/components/shop/Pagination'

export const metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const searchValue = params.q as string | undefined
  const sort = params.sort as string | undefined
  const category = (params.category as string) || (params.categories as string)
  const categoriesParam = (params.categories as string) || category
  const minPrice = params.minPrice as string | undefined
  const maxPrice = params.maxPrice as string | undefined
  const page = parseInt((params.page as string) || '1', 10)
  const limit = 9

  const payload = await getPayload({ config: configPromise })

  const categorySlugs = categoriesParam ? String(categoriesParam).split(',').filter(Boolean) : []

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
  if (minPrice) whereAnd.push({ priceInUSD: { greater_than_equal: parseInt(String(minPrice), 10) * 100 } })
  if (maxPrice) whereAnd.push({ priceInUSD: { less_than_equal: parseInt(String(maxPrice), 10) * 100 } })

  const totalAll = await payload.count({ collection: 'products', where: { _status: { equals: 'published' } }, overrideAccess: true })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    limit,
    page,
    sort: (sort as any) || 'title',
    depth: 1,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInUSD: true,
      enableVariants: true,
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
