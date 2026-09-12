'use client'

import { Price } from '@/components/Price'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/providers/Auth'
import { useWishlistStore, type WishlistDoc } from '@/store/wishlist'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { EmptyState } from '@/components/EmptyState'
import { ArrowRight, Bell, Share2, ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

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
  const { docs, isLoading, fetched, fetch, remove } = useWishlistStore()
  const [selected, setSelected] = useState<string[]>([])
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    if (user && !fetched && !isLoading) fetch()
  }, [user, fetched, isLoading, fetch])

  useEffect(() => {
    setSelected((prev) => prev.filter((id) => docs.some((d) => d.id === id)))
  }, [docs])

  type Row = {
    doc: WishlistDoc
    product: any
    variant: any
    variantId: string | null
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
      const variant = doc.variant ? (typeof doc.variant === 'object' ? doc.variant : { id: doc.variant }) : null
      const variantId = variant?.id ? String(variant.id) : null
      const price = variant?.priceInUSD ?? product.priceInUSD ?? 0
      const compare = variant?.compareAtPriceInUSD ?? product.compareAtPriceInUSD ?? null
      const saving = compare && compare > price ? compare - price : 0
      const inventory = variantId
        ? typeof variant?.inventory === 'number'
          ? variant.inventory
          : null
        : product.enableVariants
          ? (() => {
              const variants = (product.variants?.docs || []).filter((v: any) => typeof v === 'object')
              if (!variants.length) return null
              const anyInStock = variants.some((v: any) => (v.inventory ?? 0) > 0)
              return anyInStock ? 1 : 0
            })()
          : (product.inventory ?? null)
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
      out.push({ doc, product, variant, variantId, price, compare, saving, inventory, outOfStock, lowStock, brand, variantLabel, image })
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

  const handleRemove = async (id: string) => {
    await remove(id)
    setSelected((p) => p.filter((x) => x !== id))
  }

  const resolveVariantId = (row: { product: any; variantId: string | null }) => {
    if (row.variantId) return row.variantId
    const variants = (row.product.variants?.docs || []).filter((v: any) => typeof v === 'object')
    if (row.product.enableVariants && variants.length) {
      const inStock = variants.find((v: any) => (v.inventory ?? 0) > 0) || variants[0]
      return inStock?.id ? String(inStock.id) : null
    }
    return null
  }

  const addOne = async (row: { product: any; variant: any; variantId: string | null; doc: WishlistDoc }) => {
    setAddingId(row.doc.id)
    try {
      const productId = String(typeof row.product === 'object' ? row.product.id : row.product)
      let variantId = resolveVariantId(row)
      if (row.product.enableVariants && !variantId) {
        toast.error('Select a size on the product page first')
        return
      }
      await addItem({ product: productId, ...(variantId ? { variant: variantId } : {}), quantity: 1 } as any)
      toast.success('Added to bag')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add to bag')
    } finally {
      setAddingId(null)
    }
  }

  const addSelected = async () => {
    let added = 0
    let needsOptions = 0
    for (const id of inStockSelected) {
      const row = rows.find((r) => r.doc.id === id)
      if (!row) continue
      try {
        const productId = String(typeof row.product === 'object' ? row.product.id : row.product)
        const variantId = resolveVariantId(row)
        if (row.product.enableVariants && !variantId) {
          needsOptions += 1
          continue
        }
        await addItem({ product: productId, ...(variantId ? { variant: variantId } : {}), quantity: 1 } as any)
        added += 1
      } catch {}
    }
    if (added) toast.success(`Added ${added} to bag`)
    if (needsOptions) toast.error(`${needsOptions} item(s) need a size — view product to select`)
    if (!added && !needsOptions) toast.error('Failed to add to bag')
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
      <div className="container flex min-h-[60vh] flex-col justify-center py-16">
        <EmptyState
          preset="wishlist"
          title="Sign in to view your wishlist"
          description="Save items with the heart icon and find them here."
          actionLabel="Sign In"
          actionHref="/login"
        />
      </div>
    )

  if (!rows.length)
    return (
      <div className="container flex min-h-[60vh] flex-col justify-center py-16">
        <EmptyState preset="wishlist" />
      </div>
    )

  return (
    <div className="container min-h-[60vh] py-8">
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
          <Button className="cursor-pointer" onClick={share} size="sm" variant="outline"><Share2 data-icon="inline-start" /> Share List</Button>
          <Button className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed" disabled={!inStockSelected.length} onClick={addSelected} size="sm"><ShoppingBag data-icon="inline-start" /> Add {inStockSelected.length || ''} To Cart</Button>
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
                      <Button aria-label="Notify me when available" disabled size="icon" title="Notify me when available" variant="ghost"><Bell data-icon="inline-start" /></Button>
                    ) : (
                      <Button aria-label="Add to cart" className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed" disabled={addingId === row.doc.id} onClick={() => addOne(row)} size="icon" title="Add to cart" variant="ghost">
                        <ShoppingBag data-icon="inline-start" />
                      </Button>
                    )}
                    <Button aria-label="Remove from wishlist" onClick={() => handleRemove(row.doc.id)} size="icon" title="Remove from wishlist" variant="ghost"><X data-icon="inline-start" /></Button>
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
