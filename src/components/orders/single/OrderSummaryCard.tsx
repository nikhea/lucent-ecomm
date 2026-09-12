import { Price } from '@/components/Price'
import { Download, RotateCcw, RefreshCw } from 'lucide-react'

type Address = {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
}

type Props = {
  shippingAddress?: Address
  paymentLabel?: string
  subtotal: number
  shipping: number | string
  tax: number
  total: number
  currency?: string
  onDownloadInvoice?: () => void
  onStartReturn?: () => void
  onReorder?: () => void
  className?: string
}

export const OrderSummaryCard: React.FC<Props> = ({
  shippingAddress,
  paymentLabel = 'Visa ending in 4242',
  subtotal,
  shipping,
  tax,
  total,
  currency = 'USD',
  onDownloadInvoice,
  onStartReturn,
  onReorder,
  className,
}) => {
  return (
    <div className={`rounded-xl border bg-card p-5 ${className || ''}`}>
      <h2 className="text-sm font-semibold">Order summary</h2>

      {shippingAddress && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Shipping address</p>
          <div className="text-sm leading-snug mt-1">
            <p className="font-medium">{shippingAddress.name}</p>
            <p>{shippingAddress.line1}</p>
            {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state}
            </p>
            <p>{shippingAddress.zip}</p>
            <p>{shippingAddress.country}</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Payment</p>
        <p className="text-sm mt-1">{paymentLabel}</p>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <Price amount={subtotal} currencyCode={currency} className="font-medium" />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{typeof shipping === 'number' ? <Price amount={shipping} /> : shipping}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <Price amount={tax} currencyCode={currency} className="font-medium" />
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <Price amount={total} currencyCode={currency} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onDownloadInvoice}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border bg-card text-xs font-medium hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" /> Download invoice
        </button>
        <button
          onClick={onStartReturn}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border bg-card text-xs font-medium hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Start a return
        </button>
        <button
          onClick={onReorder}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border bg-card text-xs font-medium hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reorder
        </button>
      </div>
    </div>
  )
}
