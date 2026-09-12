'use client'
import { Star } from 'lucide-react'
import React from 'react'
import { cn } from '@/utilities/cn'

type Props = {
  value: string[]
  onToggle: (rating: string) => void
}

const ratings = [
  { label: '5 stars', value: '5', stars: 5 },
  { label: '4 stars & up', value: '4', stars: 4 },
  { label: '3 stars & up', value: '3', stars: 3 },
]

export function RatingFilter({ value, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-semibold">Rating</div>
      <div className="flex flex-col gap-2">
        {ratings.map((r) => {
          const active = value.includes(r.value)
          return (
            <button
              key={r.value}
              onClick={() => onToggle(r.value)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-colors',
                active ? 'bg-foreground text-background border-foreground' : 'bg-background border-border hover:bg-muted',
              )}
            >
              <span className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < r.stars ? 'fill-yellow-400' : 'fill-transparent text-muted-foreground'}`} />
                ))}
              </span>
              <span className={cn('text-xs', active ? 'opacity-80' : 'text-muted-foreground')}>{r.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
