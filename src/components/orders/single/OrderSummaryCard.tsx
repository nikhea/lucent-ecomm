import { Price } from '@/components/Price'
import { DownloadInvoiceButton } from '@/components/orders/DownloadInvoiceButton'
import { ReorderButton, type ReorderLine } from '@/components/orders/ReorderButton'
import { ReturnDialog, type ReturnLine } from '@/components/orders/ReturnDialog'

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
  orderId?: string
  guestEmail?: string
  guestToken?: string
  reorderItems?: ReorderLine[]
  returnLines?: ReturnLine[]
  returnOrderId?: string
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
  orderId,
  guestEmail,
  guestToken,
  reorderItems,
  returnLines,
  returnOrderId,
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
        {orderId ? (
          <DownloadInvoiceButton orderId={orderId} email={guestEmail} accessToken={guestToken} />
        ) : null}
        {returnLines && returnLines.length > 0 && returnOrderId ? (
          <ReturnDialog orderId={returnOrderId} email={guestEmail} accessToken={guestToken} lines={returnLines} />
        ) : null}
        {reorderItems && reorderItems.length > 0 ? <ReorderButton items={reorderItems} /> : null}
      </div>
    </div>
  )
}
