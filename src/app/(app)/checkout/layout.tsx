import { CheckoutProvider } from '@/components/checkout/CheckoutContext'
import { CheckoutShell } from '@/components/checkout/CheckoutShell'

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <CheckoutProvider>
      <CheckoutShell>{children}</CheckoutShell>
    </CheckoutProvider>
  )
}
