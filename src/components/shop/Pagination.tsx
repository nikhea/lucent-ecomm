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

  const items: (number | '…')[] = []
  const window = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  const sorted = [...window].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) items.push('…')
    items.push(p)
  })

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <button
          onClick={() => go(currentPage - 1)}
          className="h-12 cursor-pointer rounded-full border border-border px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Previous
        </button>
      )}
      {items.map((p, i) =>
        p === '…' ? (
          <span key={`e-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'size-12 cursor-pointer rounded-full text-sm font-medium transition-colors',
              p === currentPage
                ? 'bg-foreground text-background'
                : 'border border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {p}
          </button>
        ),
      )}
      {currentPage < totalPages && (
        <button
          onClick={() => go(currentPage + 1)}
          className="h-12 cursor-pointer rounded-full border border-border px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Next
        </button>
      )}
    </div>
  )
}
