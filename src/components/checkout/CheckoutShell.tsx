'use client'
import { Price } from '@/components/Price'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useCheckout } from './CheckoutContext'
import { CheckoutStepper } from './CheckoutStepper'
import { OrderSummary } from './OrderSummary'
import { CreditCard } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { usePathname } from 'next/navigation'

export const CheckoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart } = useCart()
  const { isProcessingPayment } = useCheckout()
  const cartIsEmpty = !cart || !cart.items || !cart.items.length
  const subtotal = cart?.subtotal || 0
  const itemCount = cart?.items?.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0) || 0
  const pathname = usePathname()
  if (pathname?.includes('confirm-order')) return <>{children}</>

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center gap-6">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center animate-pulse">
          <CreditCard className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Processing your payment...</p>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="container flex min-h-[60vh] flex-col justify-center py-16">
        <EmptyState preset="cart" description="Add something to your cart before checking out." />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} • <Price as="span" amount={subtotal} className="font-medium text-foreground" />
        </p>
        <div className="mt-6"><CheckoutStepper /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-6 items-start">
        <div className="flex flex-col gap-4">{children}</div>
        <OrderSummary />
      </div>
    </div>
  )
}
