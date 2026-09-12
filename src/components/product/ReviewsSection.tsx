import { Star } from 'lucide-react'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Product } from '@/payload-types'
import { OwnReviewStatus } from './OwnReviewStatus'
import { ReviewForm } from './ReviewForm'

type Props = { product: Product }

export async function getReviewStats(productId: string) {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'reviews',
    where: { and: [{ product: { equals: productId } }, { status: { equals: 'approved' } }] },
    depth: 0,
    limit: 0,
    overrideAccess: true,
  })
  const agg = await payload.find({
    collection: 'reviews',
    where: { and: [{ product: { equals: productId } }, { status: { equals: 'approved' } }] },
    depth: 1,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })
  const docs = agg.docs as any[]
  const total = res.totalDocs
  const avg = docs.length ? docs.reduce((s, r) => s + (r.rating || 0), 0) / docs.length : 0
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of docs) {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating]! += 1
  }
  return { total, avg, counts, recent: docs.slice(0, 3) }
}

export async function ReviewsSection({ product }: Props) {
  const payload = await getPayload({ config: configPromise })

  const reviewsRes = await payload.find({
    collection: 'reviews',
    where: { and: [{ product: { equals: product.id } }, { status: { equals: 'approved' } }] },
    depth: 1,
    limit: 10,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const reviews = reviewsRes.docs as any[]
  const total = reviewsRes.totalDocs
  const avg = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating]! += 1
  }
  const maxCount = Math.max(1, ...Object.values(counts))

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days < 1) return 'Today'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <div className="pt-10 mt-10 border-t" id="reviews">
      <div className="text-xs tracking-widest text-muted-foreground mb-2">REVIEWS</div>
      <h2 className="text-2xl font-bold">What Buyers Are Saying</h2>

      <OwnReviewStatus productId={String(product.id)} />
      {total === 0 ? (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product.</p>
          <ReviewForm productId={String(product.id)} />
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-xl border bg-muted/30 p-4 flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start min-w-[120px]">
              <div className="text-3xl font-bold">
                {avg.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 5</span>
              </div>
              <div className="flex text-yellow-400 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(avg) ? 'fill-yellow-400' : ''}`} />
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Based on {total} reviews</div>
            </div>

            <div className="flex-1 flex flex-col gap-1.5 justify-center">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-muted-foreground">{stars}★</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground" style={{ width: `${((counts[stars] || 0) / maxCount) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-muted-foreground">{counts[stars] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 mb-4">
            <div className="text-xs tracking-widest text-muted-foreground">RECENT REVIEWS</div>
            <a href="#write-review" className="text-xs border rounded-full px-3 py-1.5 hover:bg-muted">
              Write A Review
            </a>
          </div>

          <div className="flex flex-col">
            {reviews.slice(0, 3).map((r) => {
              const name = (r.customer && typeof r.customer === 'object' ? (r.customer as any).name : 'Anonymous') || 'Anonymous'
              return (
                <div key={r.id} className="py-6 border-t first:border-t-0">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        <span className="text-xs">{String(name)[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{name}</span>
                          {!!r.verifiedPurchase && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border">Verified</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-yellow-400' : ''}`} />
                            ))}
                          </span>
                          <span className="text-sm font-semibold">{r.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-4">{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8">
            <ReviewForm productId={String(product.id)} />
          </div>
        </>
      )}
    </div>
  )
}
