'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

export function ReviewForm({ productId }: { productId: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !comment.trim()) {
      toast.error('Please add a title and comment')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        body: JSON.stringify({ product: productId, rating, title: title.trim(), comment: comment.trim() }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || data?.errors?.[0]?.message || 'Failed to submit review')
      }
      toast.success('Review submitted for moderation')
      setTitle('')
      setComment('')
      setRating(5)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card id="write-review">
      <CardHeader>
        <CardTitle>Write a review</CardTitle>
        <CardDescription>One review per product. Reviews go live after admin approval.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                aria-label={`Rate ${s} stars`}
                className="p-1"
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
          <Button className="w-fit" disabled={isLoading} type="submit">
            {isLoading ? 'Submitting…' : 'Submit review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
