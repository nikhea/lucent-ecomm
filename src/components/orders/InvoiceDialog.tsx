'use client'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Order } from '@/payload-types'

function unitPrice(item: any): number {
  const v = item?.variant
  const p = item?.product
  const variant = v && typeof v === 'object' ? v : null
  const product = p && typeof p === 'object' ? p : null
  return variant?.priceInUSD ?? product?.priceInUSD ?? 0
}

function variantLabel(item: any): string | null {
  const v = item?.variant
  if (!v || typeof v !== 'object') return null
  const label = v.options?.map((o: any) => (typeof o === 'object' ? o.label : o)).filter(Boolean).join(' · ')
  return label || null
}

export function InvoiceDialog({ order }: { order: Order }) {
  const orderNum = (order as any).orderNumber || order.id
  const [downloading, setDownloading] = useState(false)

  const downloadPdf = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(String(orderNum))}/invoice`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Could not generate the invoice PDF.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderNum}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate the invoice PDF.')
    } finally {
      setDownloading(false)
    }
  }
  const placed = formatDateTime({ date: order.createdAt, format: 'MMM dd, yyyy' })
  const currency = (order as any).currency as string | undefined
  const items: any[] = ((order as any).items || []).filter(
    (it: any) => it?.product && typeof it.product === 'object',
  )
  const subtotal = items.reduce((s: number, it: any) => s + unitPrice(it) * (it.quantity || 1), 0)
  const total = (order as any).amount ?? subtotal
  const sa: any = (order as any).shippingAddress
  const email = (order as any).customerEmail || ((order as any).customer && typeof (order as any).customer === 'object' ? (order as any).customer?.email : null)
  const name = [sa?.firstName, sa?.lastName].filter(Boolean).join(' ') || '—'
  const addressLines = [sa?.addressLine1, sa?.addressLine2, [sa?.city, sa?.state, sa?.postalCode].filter(Boolean).join(' '), sa?.country].filter(Boolean)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer hover:underline">View invoice</button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="font-mono text-xs uppercase tracking-[0.25em]">Lucent</span>
            <span className="text-sm font-semibold">Invoice</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Invoice #</p>
            <p className="font-semibold">{orderNum}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Order placed</p>
            <p className="font-semibold">{placed}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Billed to</p>
            <p className="mt-1 font-medium">{name}</p>
            {email && <p className="text-muted-foreground">{email}</p>}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Shipped to</p>
            {addressLines.length > 0 ? (
              <div className="mt-1">
                <p className="font-medium">{name}</p>
                {addressLines.map((line: string, i: number) => (
                  <p key={i} className="text-muted-foreground">{line}</p>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <div>
          <div className="hidden grid-cols-[1fr_64px_88px_88px] gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid">
            <span>Item</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Total</span>
          </div>
          <Separator className="my-2 hidden sm:block" />
          <ul className="flex flex-col divide-y">
            {items.map((item: any, idx: number) => {
              const product = item.product
              const img = product?.gallery?.[0]?.image || product?.meta?.image
              const qty = item.quantity || 1
              const unit = unitPrice(item)
              const label = variantLabel(item)
              return (
                <li key={item.id || idx} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {img && typeof img !== 'string' ? (
                      <Media resource={img as any} className="h-full w-full" imgClassName="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product?.title || 'Product'}</p>
                    {label && <p className="text-xs text-muted-foreground">{label}</p>}
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {qty} × <Price amount={unit} as="span" currencyCode={currency} />
                    </p>
                  </div>
                  <p className="hidden w-16 text-right text-sm sm:block">{qty}</p>
                  <p className="hidden w-[88px] text-right text-sm sm:block">
                    <Price amount={unit} as="span" currencyCode={currency} />
                  </p>
                  <p className="w-[88px] shrink-0 text-right text-sm font-semibold">
                    <Price amount={unit * qty} as="span" currencyCode={currency} />
                  </p>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <Price amount={subtotal} as="span" className="font-medium" currencyCode={currency} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">Free</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <Price amount={total} as="span" className="font-bold" currencyCode={currency} />
          </div>
          <p className="text-right text-xs text-muted-foreground">Including VAT, if applicable</p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="inline-flex cursor-pointer items-center gap-1.5 h-8 px-3 rounded-lg border bg-card text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
