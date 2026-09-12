'use client'
import { Slider } from '@/components/ui/slider'
import React, { useState, useEffect } from 'react'

type Props = {
  minPrice: string
  maxPrice: string
  onChange: (min: string, max: string) => void
  maxLimit?: number
}

const histogram = [40, 18, 22, 28, 14, 8]

export function PriceFilter({ minPrice, maxPrice, onChange, maxLimit = 6450 }: Props) {
  const min = minPrice ? parseInt(minPrice, 10) : 0
  const max = maxPrice ? parseInt(maxPrice, 10) : maxLimit
  const [value, setValue] = useState<[number, number]>([min, max])

  useEffect(() => {
    setValue([minPrice ? parseInt(minPrice, 10) : 0, maxPrice ? parseInt(maxPrice, 10) : maxLimit])
  }, [minPrice, maxPrice, maxLimit])

  const handleChange = (v: number[]) => {
    setValue([v[0] as number, v[1] as number])
  }

  const handleCommit = (v: number[]) => {
    onChange(v[0] === 0 ? '' : String(v[0]), v[1] === maxLimit ? '' : String(v[1]))
  }

  const displayMax = value[1] === maxLimit && !maxPrice ? maxLimit : value[1]

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-semibold">Price</div>
      <div className="flex items-end gap-1 h-8">
        {histogram.map((h, i) => (
          <div key={i} className="flex-1 bg-foreground/15 rounded-sm" style={{ height: `${h}px` }} />
        ))}
      </div>
      <Slider value={value} min={0} max={maxLimit} step={10} onValueChange={handleChange} onValueCommit={handleCommit} className="py-2" />
      <div className="text-xs text-muted-foreground">Up to ${displayMax.toLocaleString()}</div>
    </div>
  )
}
