'use client'
import { Search as SearchIcon, Filter, Truck, Zap, Shield, Star } from 'lucide-react'
import React, { useState, useEffect, useTransition } from 'react'
import { useQueryStates, parseAsString, parseAsArrayOf, parseAsInteger, throttle } from 'nuqs'
import { PriceFilter } from './filters/PriceFilter'
import { FrameSizeFilter } from './filters/FrameSizeFilter'
import { RatingFilter } from './filters/RatingFilter'

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

const shopParsers = {
  q: parseAsString.withDefault('').withOptions({ clearOnDefault: true, shallow: false }),
  categories: parseAsArrayOf(parseAsString, ',').withDefault([]).withOptions({ clearOnDefault: true, shallow: false }),
  brands: parseAsArrayOf(parseAsString, ',').withDefault([]).withOptions({ clearOnDefault: true, shallow: false }),
  features: parseAsArrayOf(parseAsString, ',').withDefault([]).withOptions({ clearOnDefault: true, shallow: false }),
  sizes: parseAsArrayOf(parseAsString, ',').withDefault([]).withOptions({ clearOnDefault: true, shallow: false }),
  rating: parseAsArrayOf(parseAsString, ',').withDefault([]).withOptions({ clearOnDefault: true, shallow: false }),
  minPrice: parseAsInteger.withOptions({ clearOnDefault: true, shallow: false }),
  maxPrice: parseAsInteger.withOptions({ clearOnDefault: true, shallow: false }),
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true, shallow: false }),
}

export function ShopFilters({ categories }: { categories: CategoryWithCount[] }) {
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useQueryStates(shopParsers, {
    history: 'push',
    shallow: false,
    limitUrlUpdates: throttle(300),
  })

  const [search, setSearch] = useState(filters.q)

  useEffect(() => {
    setSearch(filters.q)
  }, [filters.q])

  const setFilter = (patch: Partial<typeof filters>) => {
    startTransition(() => {
      setFilters({ ...patch, page: 1 } as any)
    })
  }

  const toggleArray = (key: keyof typeof filters, value: string) => {
    const current = (filters as any)[key] as string[]
    const next = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value]
    setFilter({ [key]: next } as any)
  }

  const totalFilters = [filters.q, filters.categories.length && 'c', filters.brands.length && 'b', filters.features.length && 'f', filters.sizes.length && 's', filters.rating.length && 'r', filters.minPrice, filters.maxPrice].filter(Boolean).length

  const clearAll = () => {
    startTransition(() => {
      setFilters({ q: '', categories: [], brands: [], features: [], sizes: [], rating: [], minPrice: null, maxPrice: null, page: 1 } as any)
    })
  }

  return (
    <div className="w-full rounded-xl border bg-card p-4 flex flex-col gap-6">
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
            setFilter({ q: search })
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
            const active = filters.categories.includes(cat.slug)
            return (
              <button
                key={cat.id}
                onClick={() => toggleArray('categories', cat.slug)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium text-left ${active ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-card hover:bg-muted'}`}
              >
                <span className="truncate">{cat.title}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-muted'}`}>{cat.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <hr />

      <PriceFilter
        minPrice={filters.minPrice ? String(filters.minPrice) : ''}
        maxPrice={filters.maxPrice ? String(filters.maxPrice) : ''}
        onChange={(min, max) => setFilter({ minPrice: min ? parseInt(min, 10) : null, maxPrice: max ? parseInt(max, 10) : null } as any)}
      />

      <hr />

      <FrameSizeFilter value={filters.sizes} onToggle={(s) => toggleArray('sizes', s)} />

      <hr />

      <RatingFilter value={filters.rating} onToggle={(r) => toggleArray('rating', r)} />

      <hr />

      <div>
        <div className="text-sm font-semibold mb-3">Popular Brands</div>
        <div className="flex flex-col gap-2">
          {popularBrands.map((b) => {
            const active = filters.brands.includes(b.name)
            return (
              <button
                key={b.name}
                onClick={() => toggleArray('brands', b.name)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${active ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-card hover:bg-muted'}`}
              >
                <span>{b.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${active ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-muted'}`}>{b.count}</span>
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
            const active = filters.features.includes(f.key)
            const Icon = f.icon
            return (
              <button
                key={f.key}
                onClick={() => toggleArray('features', f.key)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left ${active ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-card hover:bg-muted'}`}
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </button>
            )
          })}
        </div>
      </div>
      {isPending && <div className="text-xs text-muted-foreground">Updating...</div>}
    </div>
  )
}
