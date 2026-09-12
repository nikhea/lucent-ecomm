import type { Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { GalleryDark } from '@/components/product/GalleryDark'
import { Breadcrumbs } from '@/components/product/Breadcrumbs'
import { VariantColor } from '@/components/product/VariantColor'
import { VariantPlugType } from '@/components/product/VariantPlugType'
import { QuantityAndCart } from '@/components/product/QuantityAndCart'
import { Overview } from '@/components/product/Overview'
import { Specifications } from '@/components/product/Specifications'
import { RelatedDark } from '@/components/product/RelatedDark'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import { Price } from '@/components/Price'
import { Star } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { Metadata } from 'next'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== 'object') return false
        return variant.inventory && variant?.inventory > 0
      })
    : product.inventory! > 0

  let price = product.priceInUSD

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInUSD && acc && variant?.priceInUSD > acc) {
        return variant.priceInUSD
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: price,
      priceCurrency: 'usd',
    },
  }

  const payload = await getPayload({ config: configPromise })

  const reviewsAgg = await payload.find({
    collection: 'reviews',
    where: { and: [{ product: { equals: product.id } }, { status: { equals: 'approved' } }] },
    depth: 0,
    limit: 100,
    overrideAccess: true,
  })
  const reviewCount = reviewsAgg.totalDocs
  const reviewAvg = reviewsAgg.docs.length
    ? reviewsAgg.docs.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviewsAgg.docs.length
    : 0

  let relatedProducts = product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

  if (!relatedProducts.length) {
    const fallback = await payload.find({ collection: 'products', where: { and: [{ id: { not_equals: product.id } }, { _status: { equals: 'published' } }] }, limit: 4, depth: 1, overrideAccess: true })
    relatedProducts = fallback.docs as any[]
  }

  const categoriesForBreadcrumb = (product.categories || [])
    .filter((c): c is Media | any => typeof c === 'object')
    .map((c: any) => ({ title: c.title, slug: c.slug }))
  const sku = (product as any).sku || `${String((product as any).brand || 'LUCENT').slice(0, 3).toUpperCase()}-${product.slug?.slice(0, 3).toUpperCase()}-${String(product.id).slice(-2).toUpperCase()}`
  const brand = (product as any).brand || 'Lucent'
  const shortDesc = (product as any).shortDescription || (product as any).meta?.description || `Premium ${categoriesForBreadcrumb[0]?.title || 'fashion'} piece, designed in-house for Lucent.`
  const comparePrice = (product as any).compareAtPriceInUSD || (price ? price + Math.round(price * 0.2) : null)
  const discount = comparePrice && price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0

  return (
    <React.Fragment>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} type="application/ld+json" />
      <div className="bg-background text-foreground min-h-screen">
        <div className="container pt-6 pb-12">
          <Breadcrumbs productTitle={product.title} categories={categoriesForBreadcrumb as any} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <div>
              <Suspense fallback={<div className="aspect-square bg-muted rounded-xl" />}>
                {Boolean(gallery?.length) && <GalleryDark gallery={gallery as any} />}
              </Suspense>
            </div>

            <div className="flex flex-col gap-5">
              <div className="text-xs text-muted-foreground">
                {(categoriesForBreadcrumb[0]?.title || 'Women') + ' • ' + (categoriesForBreadcrumb[1]?.title || categoriesForBreadcrumb[0]?.title || 'Fashion')}
              </div>
              <h1 className="text-3xl font-bold leading-tight">{product.title}</h1>
              <div className="inline-flex text-[10px] tracking-widest bg-muted px-2 py-1 rounded">SKU: {sku}</div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">By {brand}</span>
                <span className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(reviewAvg) ? 'fill-yellow-400' : 'fill-muted'}`} />
                  ))}
                </span>
                {reviewCount > 0 ? (
                  <>
                    <span className="text-foreground">{reviewAvg.toFixed(1)}</span>
                    <a className="text-muted-foreground hover:underline" href="#reviews">({reviewCount} reviews)</a>
                  </>
                ) : (
                  <a className="text-muted-foreground hover:underline" href="#reviews">No reviews yet</a>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{shortDesc}</p>

              <div className="flex items-baseline gap-2">
                {price && <span className="text-xl font-bold">${(price / 100).toFixed(2)}</span>}
                {comparePrice && comparePrice !== price && <span className="text-sm line-through text-muted-foreground">${(comparePrice / 100).toFixed(2)}</span>}
                {discount > 0 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{discount}% OFF</span>}
              </div>

              <VariantColor product={product} />
              <VariantPlugType product={product} />
              <QuantityAndCart product={product} />
            </div>
          </div>

          <Overview product={product} />
          <Specifications product={product} />
          <ReviewsSection product={product} />
          {relatedProducts.length ? (
            <RelatedDark products={relatedProducts as Product[]} currentTitle={product.title} />
          ) : (
            <RelatedDark products={[]} />
          )}
        </div>
      </div>

      {product.layout?.length ? (
        <div className="bg-background text-foreground">
          <RenderBlocks blocks={product.layout} />
        </div>
      ) : null}
    </React.Fragment>
  )
}

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 4,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: {
        title: true,
        priceInUSD: true,
        inventory: true,
        options: true,
      },
    },
  })

  return result.docs?.[0] || null
}
