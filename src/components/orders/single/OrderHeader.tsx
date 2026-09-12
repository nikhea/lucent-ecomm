import { formatDateTime } from '@/utilities/formatDateTime'

type Props = {
  orderNumber: string
  placedDate: string
  status: 'out_for_delivery' | 'delivered' | 'shipped' | 'processing' | 'cancelled' | string
  className?: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  out_for_delivery: { label: 'Out for delivery', className: 'bg-black text-white dark:bg-white dark:text-black' },
  delivered: { label: 'Delivered', className: 'bg-green-600 text-white' },
  shipped: { label: 'Shipped', className: 'bg-black text-white dark:bg-white dark:text-black' },
  processing: { label: 'Processing', className: 'bg-amber-500 text-white' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive text-destructive-foreground' },
}

export const OrderHeader: React.FC<Props> = ({ orderNumber, placedDate, status, className }) => {
  const badge = statusMap[status] || statusMap.out_for_delivery
  const formatted = formatDateTime({ date: placedDate, format: 'MMMM dd, yyyy' })
  return (
    <div className={`flex items-start justify-between gap-4 ${className || ''}`}>
      <div>
        <p className="text-sm text-muted-foreground">
          Order <span className="font-semibold text-foreground">{orderNumber}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Placed {formatted}</p>
      </div>
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
    </div>
  )
}
