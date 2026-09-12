'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { BadgeCheck, Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type ExistingReview = { id: string; rating: number; title: string; comment: string; status?: string | null } | null

export function ReviewForm({ productId, bare = false }: { productId: string; bare?: boolean }) {
  const { user } = useAuth()
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [purchased, setPurchased] = useState(false)
  const [existing, setExisting] = useState<ExistingReview>(null)

  const load = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch(`/api/review-eligibility?product=${productId}`, { credentials: 'include' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPurchased(!!data.purchased)
      if (data.review) {
        setExisting(data.review)
        setRating(data.review.rating || 5)
        setTitle(data.review.title || '')
        setComment(data.review.comment || '')
      } else {
        setExisting(null)
      }
    } catch {
      setPurchased(false)
    } finally {
      setChecking(false)
    }
  }, [productId])

  useEffect(() => {
    if (user) void load()
    else setChecking(false)
  }, [user, load])

  if (!user) {
    if (bare) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Sign in to share your experience with this product.</p>
          <Button asChild>
            <Link href={`/login?redirect=/products`}>Sign in to review</Link>
          </Button>
        </div>
      )
    }
    return (
      <Card id="write-review">
        <CardHeader>
          <CardTitle>Write a review</CardTitle>
          <CardDescription>Sign in to share your experience with this product.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/login?redirect=/products`}>Sign in to review</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (checking) {
    if (bare) {
      return <div className="h-24 animate-pulse rounded-lg bg-muted" />
    }
    return (
      <Card id="write-review">
        <CardContent className="pt-6">
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (!purchased) {
    if (bare) {
      return (
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold">Write a review</p>
          <p className="text-sm text-muted-foreground">Only customers who purchased this product can leave a review.</p>
        </div>
      )
    }
    return (
      <Card id="write-review">
        <CardHeader>
          <CardTitle>Write a review</CardTitle>
          <CardDescription>Only customers who purchased this product can leave a review.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !comment.trim()) {
      toast.error('Please add a title and comment')
      return
    }
    setIsLoading(true)
    try {
      const url = existing ? `/api/reviews/${existing.id}` : '/api/reviews'
      const method = existing ? 'PATCH' : 'POST'
      const body = existing
        ? { title: title.trim(), comment: comment.trim(), rating }
        : { product: productId, rating, title: title.trim(), comment: comment.trim() }
      const res = await fetch(url, {
        body: JSON.stringify(body),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || data?.errors?.[0]?.message || 'Failed to submit review')
      }
      toast.success(existing ? 'Review updated — pending approval' : 'Review submitted for moderation')
      await load()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setIsLoading(false)
    }
  }

  if (bare) {
    return (
      <div className="flex flex-col gap-4" id="write-review">
        <div className="flex flex-col gap-1.5">
          <p className="flex items-center gap-2 text-base font-semibold">
            {existing ? 'Edit your review' : 'Write a review'}
            {existing?.status === 'approved' && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Live
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {existing ? 'One review per product — updating sends it back for approval.' : 'One review per product. Reviews go live after admin approval.'}
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                aria-label={`Rate ${s} stars`}
                className="cursor-pointer p-1"
                key={s}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                type="button"
              >
                <Star
                  className={cn('h-6 w-6', (hover || rating) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
          </div>
          <Input maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Review title" value={title} />
          <Textarea
            maxLength={1000}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike?"
            rows={4}
            value={comment}
          />
          <Button className="w-full cursor-pointer" disabled={isLoading} type="submit">
            {isLoading ? 'Submitting…' : existing ? 'Update review' : 'Submit review'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <Card id="write-review">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {existing ? 'Edit your review' : 'Write a review'}
          {existing?.status === 'approved' && (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" /> Live
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {existing ? 'One review per product — updating sends it back for approval.' : 'One review per product. Reviews go live after admin approval.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                aria-label={`Rate ${s} stars`}
                className="cursor-pointer p-1"
                key={s}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                type="button"
              >
                <Star
                  className={cn('h-5 w-5', (hover || rating) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
          </div>
          <Input maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Review title" value={title} />
          <Textarea
            maxLength={1000}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike?"
            rows={4}
            value={comment}
          />
          <Button className="w-fit cursor-pointer" disabled={isLoading} type="submit">
            {isLoading ? 'Submitting…' : existing ? 'Update review' : 'Submit review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
