'use client'

import { useAuth } from '@/providers/Auth'
import React, { useEffect, useState } from 'react'

export function OwnReviewStatus({ productId }: { productId: string }) {
  const { user } = useAuth()
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetch(`/api/reviews?where[product][equals]=${productId}&where[customer][equals]=${(user as any).id}&limit=1&depth=0`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const doc = d?.docs?.[0]
        if (doc) setStatus(doc.status)
      })
      .catch(() => {})
  }, [user, productId])

  if (!user || !status || status === 'approved') return null
  if (status === 'pending')
    return (
      <p className="mt-4 text-sm rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
        Your review was submitted and is awaiting admin approval.
      </p>
    )
  return null
}
