'use client'
import React from 'react'
import { cn } from '@/utilities/cn'

export type SizeOptionWithCount = { label: string; value: string; count: number }

type Props = {
  value: string[]
  onToggle: (size: string) => void
  sizes?: SizeOptionWithCount[]
}

const fallbackSizes: SizeOptionWithCount[] = [
  { label: 'S', value: 'S', count: 0 },
  { label: 'M', value: 'M', count: 0 },
  { label: 'L', value: 'L', count: 0 },
  { label: 'XL', value: 'XL', count: 0 },
]

export function FrameSizeFilter({ value, onToggle, sizes = fallbackSizes }: Props) {
  if (!sizes.length) return null
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-semibold">Frame size</div>
      <div className="flex flex-wrap gap-3">
        {sizes.map((s) => {
          const active = value.includes(s.label)
          return (
            <button
              key={s.label}
              onClick={() => onToggle(s.label)}
              className={cn(
                'h-12 w-12 cursor-pointer rounded-full border flex items-center justify-center text-sm font-medium gap-1 transition-colors',
                active ? 'bg-foreground text-background border-foreground' : 'bg-background border-border text-foreground hover:bg-muted',
              )}
            >
              {s.label} <span className={cn('text-xs', active ? 'opacity-70' : 'text-muted-foreground')}>{s.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
