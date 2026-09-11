'use client'
import { Search as SearchIcon, Filter, Truck, Zap, Shield, Star } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { createUrl } from '@/utilities/createUrl'

type CategoryWithCount = { id: string; title: string; slug: string; count: number }

const popularBrands = [
  { name: 'Apple', count: 45 },
  { name: 'Samsung', count: 38 },
  { name: 'Nike', count: 52 },
  { name: 'Adidas', count: 31 },
  { name: 'Sony', count: 29 },
]

const featureOptions = [
  { key: 'freeShipping', label: 'Free Shipping', icon: Truck },
  { key: 'fastDelivery', label: 'Fast Delivery', icon: Zap },
  { key: 'warranty', label: 'Warranty Included', icon: Shield },
  { key: 'topRated', label: 'Top Rated (4+ stars)', icon: Star },
]

export function ShopFilters({ categories }: { categories: CategoryWithCount[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setMinPrice(searchParams.get('minPrice') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
  }, [searchParams])

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== '') params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(createUrl('/shop', params))
  }

  const toggleListParam = (key: string, value: string) => {
    const current = searchParams.get(key)?.split(',').filter(Boolean) || []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    updateParam(key, next.length ? next.join(',') : null)
  }

  const toggleFeature = (key: string) => {
    const current = searchParams.get('features')?.split(',').filter(Boolean) || []
    const next = current.includes(key) ? current.filter((v) => v !== key) : [...current, key]
    updateParam('features', next.length ? next.join(',') : null)
  }

  const activeFeatures = searchParams.get('features')?.split(',') || []
  const activeCategories = searchParams.get('categories')?.split(',') || (searchParams.get('category') ? [searchParams.get('category')!] : [])
  const activeBrands = searchParams.get('brands')?.split(',') || []

  const totalFilters = [searchParams.get('q'), searchParams.get('categories') || searchParams.get('category'), searchParams.get('brands'), searchParams.get('features'), searchParams.get('minPrice'), searchParams.get('maxPrice')].filter(Boolean).length

  const clearAll = () => router.push('/shop')

  return (
    <div className="w-full rounded-xl border bg-white p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4" /> Filters <span className="bg-muted px-2 py-0.5 rounded text-xs">{totalFilters}</span>
        </div>
        <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">
          Clear All
        </button>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Search</div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateParam('q', search)
          }}
          className="relative"
        >
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm"
          />
        </form>
      </div>

      <hr />

      <div>
        <div className="text-sm font-semibold mb-3">Categories</div>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => {
            const active = activeCategories.includes(cat.slug)
            return (
              <button
                key={cat.id}
                onClick={() => toggleListParam('categories', cat.slug)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium text-left ${active ? 'bg-black text-white border-black' : 'bg-white hover:bg-muted'}`}
              >
                <span className="truncate">{cat.title}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-white text-black' : 'bg-muted'}`}>{cat.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <hr />

      <div>
        <div className="text-sm font-semibold mb-3">Price Range</div>
        <div className="flex gap-2">
          <input
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => updateParam('minPrice', minPrice)}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('minPrice', minPrice)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            type="number"
          />
          <input
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => updateParam('maxPrice', maxPrice)}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('maxPrice', maxPrice)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            type="number"
          />
        </div>
      </div>

      <hr />

      <div>
        <div className="text-sm font-semibold mb-3">Popular Brands</div>
        <div className="flex flex-col gap-2">
          {popularBrands.map((b) => {
            const active = activeBrands.includes(b.name)
            return (
              <button
                key={b.name}
                onClick={() => toggleListParam('brands', b.name)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${active ? 'bg-black text-white border-black' : 'bg-white hover:bg-muted'}`}
              >
                <span>{b.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${active ? 'bg-white text-black' : 'bg-muted'}`}>{b.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <hr />

      <div>
        <div className="text-sm font-semibold mb-3">Features</div>
        <div className="flex flex-col gap-2">
          {featureOptions.map((f) => {
            const active = activeFeatures.includes(f.key)
            const Icon = f.icon
            return (
              <button
                key={f.key}
                onClick={() => toggleFeature(f.key)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left ${active ? 'bg-black text-white border-black' : 'bg-white hover:bg-muted'}`}
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
