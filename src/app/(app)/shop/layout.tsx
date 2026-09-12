import { ShopFilters } from '@/components/shop/Filters'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

async function ShopFiltersWrapper() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({ collection: 'categories', limit: 20, sort: 'title', depth: 0, overrideAccess: true })
  const counts = await Promise.all(
    categories.docs.map(async (cat) => {
      const res = await payload.count({ collection: 'products', where: { categories: { contains: cat.id }, _status: { equals: 'published' } }, overrideAccess: true })
      return { id: cat.id, title: cat.title, slug: cat.slug, count: res.totalDocs }
    }),
  )
  const sizeTypes = await payload.find({ collection: 'variantTypes', where: { name: { equals: 'size' } }, limit: 1, depth: 2, overrideAccess: true })
  const sizeType = sizeTypes.docs[0] as any
  const sizeOptions = ((sizeType?.options?.docs || []) as any[]).filter((o) => typeof o === 'object')
  const sizes = await Promise.all(
    sizeOptions.map(async (opt) => {
      const res = await payload.count({ collection: 'variants', where: { options: { contains: opt.id } }, overrideAccess: true })
      return { label: opt.label, value: opt.value, count: res.totalDocs }
    }),
  )
  return <ShopFilters categories={counts as any} sizes={sizes} />
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="container flex flex-col gap-6 my-8 pb-4">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="w-full lg:w-[300px] shrink-0">
            <Suspense fallback={<div className="h-[600px] w-full animate-pulse rounded-xl bg-muted" />}>
              <ShopFiltersWrapper />
            </Suspense>
          </div>
          <div className="min-h-screen w-full flex-1">{children}</div>
        </div>
      </div>
    </Suspense>
  )
}
