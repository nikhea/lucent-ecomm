import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

export type ShipmentItem = {
  id: string
  title: string
  variantLabel?: string
  qty: number
  sku?: string
  price: number
  currency?: string
  image?: any
  productSlug?: string
}

export type Shipment = {
  id: string
  index: number
  total: number
  carrier: string
  tracking: string
  items: ShipmentItem[]
}

type Props = {
  shipments: Shipment[]
  className?: string
}

const ShipmentBlock: React.FC<{ shipment: Shipment }> = ({ shipment }) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold">
        Shipment {shipment.index} of {shipment.total}
      </h3>
      <span className="text-xs px-2.5 py-1 rounded-full border bg-muted/30 font-medium truncate">
        {shipment.carrier} · {shipment.tracking}
      </span>
    </div>
    <hr className="my-3" />
    <div className="flex flex-col gap-3">
      {shipment.items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="h-14 w-14 shrink-0 rounded-md bg-muted border overflow-hidden flex items-center justify-center">
            {item.image && typeof item.image !== 'string' ? (
              <Media resource={item.image} className="h-full w-full" imgClassName="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight truncate">{item.title}</p>
            {item.variantLabel && <p className="text-xs text-muted-foreground">{item.variantLabel} · Qty {item.qty}</p>}
            {!item.variantLabel && <p className="text-xs text-muted-foreground">Qty {item.qty}</p>}
            {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
          </div>
          <Price amount={item.price} currencyCode={item.currency} className="text-sm font-semibold shrink-0" />
        </div>
      ))}
    </div>
  </div>
)

export const ShipmentsCard: React.FC<Props> = ({ shipments, className }) => {
  return (
    <div className={`rounded-xl border bg-card p-5 ${className || ''}`}>
      <h2 className="text-sm font-semibold">Shipments</h2>
      <div className="mt-4 flex flex-col gap-4">
        {shipments.map((s) => (
          <ShipmentBlock key={s.id} shipment={s} />
        ))}
      </div>
    </div>
  )
}
