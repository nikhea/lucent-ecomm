'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import React from 'react'
import { createUrl } from '@/utilities/createUrl'
import { cn } from '@/utilities/cn'

export function ShopPagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  if (totalPages <= 1) return null

  const go = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) params.delete('page')
    else params.set('page', String(page))
    router.push(createUrl('/shop', params))
  }

  const pages: (number | string)[] = []
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i)
  if (totalPages > 5) {
    if (!pages.includes(totalPages)) {
      pages.splice(3, 0, '...')
      pages.push(totalPages)
    }
  }

  return (
    <div className="flex justify-center gap-2 mt-8">
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`e-${i}`} className="px-3 py-2 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={cn('h-8 w-8 rounded-lg border text-sm', p === currentPage ? 'bg-white border shadow font-medium' : 'border-transparent hover:bg-muted')}
          >
            {p}
          </button>
        ),
      )}
    </div>
  )
}
