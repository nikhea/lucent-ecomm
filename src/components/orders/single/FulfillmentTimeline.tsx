import { Check, Package, Truck, Home } from 'lucide-react'

export type FulfillmentStep = {
  id: string
  label: string
  description: string
  date: string
  status: 'completed' | 'current' | 'pending'
  currentLabel?: string
}

type Props = {
  estimatedDelivery?: string
  steps: FulfillmentStep[]
  className?: string
}

const iconMap: Record<string, React.ReactNode> = {
  confirmed: <Check className="h-3.5 w-3.5" />,
  preparing: <Package className="h-3.5 w-3.5" />,
  shipped: <Truck className="h-3.5 w-3.5" />,
  out_for_delivery: <Truck className="h-3.5 w-3.5" />,
  delivered: <Home className="h-3.5 w-3.5" />,
}

export const FulfillmentTimeline: React.FC<Props> = ({ estimatedDelivery, steps, className }) => {
  return (
    <div className={`rounded-xl border bg-card p-5 ${className || ''}`}>
      <h2 className="text-sm font-semibold">Fulfillment</h2>
      {estimatedDelivery && <p className="text-xs text-muted-foreground mt-1">Estimated delivery: {estimatedDelivery}</p>}

      <div className="mt-5 relative">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          const isPending = step.status === 'pending'
          const isCurrent = step.status === 'current'
          return (
            <div key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-[24px] bottom-0 w-px ${isPending ? 'bg-border border-dashed' : 'bg-foreground'}`}
                  style={isPending ? { background: 'repeating-linear-gradient(to bottom, hsl(var(--border)) 0 4px, transparent 4px 8px)' } : undefined}
                />
              )}
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border text-[11px] ${
                  isPending ? 'bg-card border-border text-muted-foreground' : 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                }`}
              >
                {isPending ? <Home className="h-3 w-3" /> : iconMap[step.id] || <Check className="h-3.5 w-3.5" />}
              </span>

              <div className="flex-1 min-w-0 -mt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium leading-none ${isPending ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {step.label}
                    {isCurrent && step.currentLabel && <span className="font-normal text-muted-foreground"> · {step.currentLabel}</span>}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{step.date}</span>
                </div>
                <p className={`text-xs mt-1 leading-snug ${isPending ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
