'use client'

import { Price } from '@/components/Price'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ArrowRight, Bell, Share2, ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type WishlistDoc = {
  id: string
  product: any
  variant?: any
  createdAt: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1) return 'Saved today'
  if (days === 1) return 'Saved yesterday'
  if (days < 7) return `Saved ${days} days ago`
  if (days < 14) return 'Saved 1 week ago'
  return `Saved ${Math.floor(days / 7)} weeks ago`
}

export function WishlistClient() {
  const { user, status } = useAuth()
  const { addItem } = useCart()
  const [docs, setDocs] = useState<WishlistDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [addingId, setAddingId] = useState<string | null>(null)

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlists?depth=2&limit=100&sort=-createdAt', { credentials: 'include' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDocs(data.docs || [])
      setSelected((prev) => prev.filter((id) => (data.docs || []).some((d: any) => d.id === id)))
    } catch {
      setDocs([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'loggedOut') {
      setIsLoading(false)
      return
    }
    if (user) fetchList()
  }, [user, status, fetchList])

  type Row = {
    doc: WishlistDoc
    product: any
    variant: any
    price: number
    compare: number | null
    saving: number
    inventory: number | null
    outOfStock: boolean
    lowStock: boolean
    brand: string
    variantLabel: string | null
    image: any
  }

  const rows: Row[] = useMemo(() => {
    const out: Row[] = []
    for (const doc of docs) {
      const product = typeof doc.product === 'object' ? doc.product : null
      if (!product) continue
      const variant = doc.variant && typeof doc.variant === 'object' ? doc.variant : null
      const price = variant?.priceInUSD ?? product.priceInUSD ?? 0
      const compare = variant?.compareAtPriceInUSD ?? product.compareAtPriceInUSD ?? null
      const saving = compare && compare > price ? compare - price : 0
      const inventory = variant?.inventory ?? product.inventory ?? null
      const outOfStock = inventory !== null && inventory <= 0
      const lowStock = !outOfStock && inventory !== null && inventory <= 5
      const brand =
        typeof product.brand === 'string'
          ? product.brand
          : product.categories?.[0] && typeof product.categories[0] === 'object'
            ? product.categories[0].title
            : 'Lucent'
      const variantLabel = variant
        ? variant.options?.map((o: any) => (typeof o === 'object' ? o.label : o)).filter(Boolean).join(' · ')
        : null
      const image =
        (typeof product.gallery?.[0]?.image === 'object' ? product.gallery[0].image : undefined) ||
        (typeof product.meta?.image === 'object' ? product.meta.image : undefined)
      out.push({ doc, product, variant, price, compare, saving, inventory, outOfStock, lowStock, brand, variantLabel, image })
    }
    return out
  }, [docs])

  const priceDrops = rows.filter((r) => r.saving > 0).length
  const backInStock = 0
  const almostGone = rows.filter((r) => r.lowStock).length
  const totalSavings = rows.reduce((s, r) => s + r.saving, 0)
  const inStockSelected = selected.filter((id) => {
    const r = rows.find((x) => x.doc.id === id)
    return r && !r.outOfStock
  })

  const toggle = (id: string) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const toggleAll = () => setSelected((p) => (p.length === rows.length ? [] : rows.map((r) => r.doc.id)))

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/wishlists/${id}`, { credentials: 'include', method: 'DELETE' })
      if (!res.ok) throw new Error()
      setDocs((p) => p.filter((d) => d.id !== id))
      setSelected((p) => p.filter((x) => x !== id))
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const addOne = async (row: { product: any; variant: any; doc: WishlistDoc }) => {
    setAddingId(row.doc.id)
    try {
      await addItem({ product: row.product.id, variant: row.variant?.id, quantity: 1 } as any)
      toast.success('Added to bag')
    } catch {
      toast.error('Failed to add to bag')
    } finally {
      setAddingId(null)
    }
  }

  const addSelected = async () => {
    for (const id of inStockSelected) {
      const row = rows.find((r) => r.doc.id === id)
      if (!row) continue
      try {
        await addItem({ product: row.product.id, variant: row.variant?.id, quantity: 1 } as any)
      } catch {}
    }
    toast.success(`Added ${inStockSelected.length} to bag`)
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Wishlist link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  if (isLoading) return <div className="container py-12"><div className="h-32 animate-pulse rounded-xl bg-muted" /></div>

  if (status === 'loggedOut' || !user)
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Saved For Later</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to view your wishlist.</p>
        <Button asChild className="mt-6"><Link href="/login">Sign In</Link></Button>
      </div>
    )

  if (!rows.length)
    return (
      <div className="container py-16 text-center">
        <p className="text-xs tracking-widest text-muted-foreground">Shop &gt; Wishlist</p>
        <h1 className="mt-2 text-2xl font-bold">Saved For Later</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your wishlist is empty.</p>
        <Button asChild className="mt-6"><Link href="/shop">Continue Shopping <ArrowRight data-icon="inline-end" /></Link></Button>
      </div>
    )

  return (
    <div className="container py-8">
      <p className="text-xs text-muted-foreground"><Link className="hover:underline" href="/shop">Shop</Link> <span className="mx-1">›</span> Wishlist</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Saved For Later <span className="text-sm font-normal text-muted-foreground">{rows.length} items</span></h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {priceDrops > 0 && <span>{priceDrops} price drop{priceDrops > 1 ? 's' : ''}</span>}
            {priceDrops > 0 && almostGone > 0 && <span> · </span>}
            {almostGone > 0 && <span>{almostGone} almost gone</span>}
            {totalSavings > 0 && <span> · <span className="font-medium text-emerald-600">Total savings <Price amount={totalSavings} as="span" /></span></span>}
          </p>
        </div>
        <Button asChild variant="ghost"><Link href="/shop">Continue Shopping <ArrowRight data-icon="inline-end" /></Link></Button>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={selected.length === rows.length && rows.length > 0} onCheckedChange={toggleAll} />
          <span className="font-medium">{rows.length} items</span>
        </label>
        <div className="flex items-center gap-2">
          <Button onClick={share} size="sm" variant="outline"><Share2 data-icon="inline-start" /> Share List</Button>
          <Button disabled={!inStockSelected.length} onClick={addSelected} size="sm"><ShoppingBag data-icon="inline-start" /> Add {inStockSelected.length || ''} To Cart</Button>
        </div>
      </div>

      <ul className="mt-2 flex flex-col">
        {rows.map((row) => {
          const checked = selected.includes(row.doc.id)
          return (
            <li className="flex gap-3 border-t py-5 first:border-t-0" key={row.doc.id}>
              <Checkbox checked={checked} className="mt-8" onCheckedChange={() => toggle(row.doc.id)} />
              <Link className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted" href={`/products/${row.product.slug}`}>
                {row.image?.url && <Image alt={row.image.alt || row.product.title} className="h-full w-full object-cover" height={80} src={row.image.url} width={64} />}
              </Link>
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{row.brand}</p>
                  <Link className="truncate text-sm font-semibold hover:underline" href={`/products/${row.product.slug}`}>{row.product.title}</Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                    {row.variantLabel && <span>{row.variantLabel}</span>}
                    {row.variantLabel && <span>·</span>}
                    {row.outOfStock ? <span>Out of stock</span> : row.lowStock ? <span>Only {row.inventory} left</span> : <span>In stock</span>}
                    <span>·</span>
                    <span>{timeAgo(row.doc.createdAt)}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {row.saving > 0 && <Badge variant="secondary">Price Drop Save <Price amount={row.saving} as="span" /></Badge>}
                    {row.lowStock && !row.outOfStock && <Badge variant="outline">Almost Gone</Badge>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    {row.compare && row.compare > row.price && <Price amount={row.compare} as="span" className="text-xs text-muted-foreground line-through" />}
                    <Price amount={row.price} as="span" className="font-semibold" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {row.outOfStock ? (
                      <Button disabled size="sm" variant="outline"><Bell data-icon="inline-start" /> Notify Me</Button>
                    ) : (
                      <Button disabled={addingId === row.doc.id} onClick={() => addOne(row)} size="sm" variant="outline">
                        <ShoppingBag data-icon="inline-start" /> {addingId === row.doc.id ? 'Adding…' : 'Add to Cart'}
                      </Button>
                    )}
                    <Button aria-label="Remove" onClick={() => remove(row.doc.id)} size="icon" variant="ghost"><X data-icon="inline-start" /></Button>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
