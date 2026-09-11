'use client'
import React from 'react'
import { cn } from '@/utilities/cn'

const sizes = [
  { label: 'S', count: 3 },
  { label: 'M', count: 6 },
  { label: 'L', count: 5 },
  { label: 'XL', count: 2 },
]

type Props = {
  value: string[]
  onToggle: (size: string) => void
}

export function FrameSizeFilter({ value, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-semibold">Frame size</div>
      <div className="flex gap-3">
        {sizes.map((s) => {
          const active = value.includes(s.label)
          return (
            <button
              key={s.label}
              onClick={() => onToggle(s.label)}
              className={cn(
                'h-12 w-12 rounded-full border flex items-center justify-center text-sm font-medium gap-1',
                active ? 'bg-black text-white border-black' : 'bg-white hover:bg-muted border',
              )}
            >
              {s.label} <span className={cn('text-xs', active ? 'text-white/70' : 'text-muted-foreground')}>{s.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
