'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { useCheckout } from './CheckoutContext'

const steps = [
  { label: 'Contact', href: '/checkout/contact' },
  { label: 'Address', href: '/checkout/address' },
  { label: 'Payment', href: '/checkout/payment' },
]

export const CheckoutStepper: React.FC = () => {
  const pathname = usePathname()
  const { contactDone, addressDone, paymentActive } = useCheckout()
  const activeIndex = pathname?.includes('/payment') ? 2 : pathname?.includes('/address') ? 1 : 0
  const done = [contactDone, addressDone, paymentActive]
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((s, i) => {
        const isDone = done[i]
        const isActive = i === activeIndex || isDone
        const isClickable = i === 0 || (i === 1 && contactDone) || (i === 2 && addressDone)
        const content = (
          <div className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${isDone ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : isActive ? 'bg-card border-foreground text-foreground' : 'bg-muted border-transparent text-muted-foreground'}`}>
              {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`text-xs font-medium hidden sm:block ${isDone || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
          </div>
        )
        return (
          <div key={s.label} className="flex items-center gap-2">
            {isClickable ? <Link href={s.href} className="hover:opacity-80">{content}</Link> : content}
            {i < steps.length - 1 && <div className={`w-8 sm:w-12 h-px mx-1 ${done[i + 1] || i + 1 <= activeIndex ? 'bg-black dark:bg-white' : 'bg-border'}`} />}
          </div>
        )
      })}
    </div>
  )
}
