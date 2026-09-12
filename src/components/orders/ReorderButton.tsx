'use client'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useOptimisticCart } from '@/store/cart'

export type ReorderLine = {
  productId: string
  variantId: string | null
  quantity: number
  title: string
}

export function ReorderButton({ items }: { items: ReorderLine[] }) {
  const router = useRouter()
  const { addItem } = useOptimisticCart()
  const [busy, setBusy] = useState(false)

  const reorder = async () => {
    if (!items.length || busy) return
    setBusy(true)
    let added = 0
    const skipped: string[] = []
    for (const line of items) {
      try {
        await addItem({
          product: line.productId,
          ...(line.variantId ? { variant: line.variantId } : {}),
          quantity: line.quantity,
        } as any)
        added += 1
      } catch {
        skipped.push(line.title)
      }
    }
    setBusy(false)
    if (added > 0) {
      toast.success(`${added} item${added === 1 ? '' : 's'} added to cart`, {
        action: { label: 'View cart', onClick: () => router.push('/cart') },
      })
    }
    if (skipped.length > 0) {
      toast.warning(
        skipped.length === 1
          ? `${skipped[0]} is unavailable and was skipped`
          : `${skipped.length} items unavailable: ${skipped.join(', ')}`,
      )
    }
    if (added === 0 && skipped.length === 0) {
      toast.error('Could not add items to cart.')
    }
  }

  return (
    <button
      onClick={reorder}
      disabled={busy}
      className="inline-flex cursor-pointer items-center gap-1.5 h-8 px-3 rounded-lg border bg-card text-xs font-medium hover:bg-muted disabled:opacity-50"
    >
      <RefreshCw className="h-3.5 w-3.5" /> {busy ? 'Adding…' : 'Reorder'}
    </button>
  )
}
