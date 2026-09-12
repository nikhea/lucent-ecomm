'use client'
import { Button } from '@/components/ui/button'
import { useCheckout } from '@/components/checkout/CheckoutContext'
import { useTheme } from '@/providers/Theme'
import { cssVariables } from '@/cssVariables'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CreditCard, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const stripe = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`)

export default function PaymentPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { contactDone, addressDone, canGoToPayment, paymentData, setPaymentData, billingAddress, email, setProcessingPayment, initiatePaymentIntent, error } = useCheckout()

  useEffect(() => {
    if (!contactDone) router.replace('/checkout/contact')
    else if (!addressDone || !canGoToPayment) router.replace('/checkout/address')
  }, [contactDone, addressDone, canGoToPayment, router])

  useEffect(() => {
    if (canGoToPayment && !paymentData?.['clientSecret']) {
      void initiatePaymentIntent('stripe')
    }
  }, [])

  if (!contactDone || !addressDone) return null
  if (!stripe) return null

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b">
        <span className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center"><CreditCard className="h-4 w-4" /></span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold leading-none">Payment</h2>
          <p className="text-xs text-muted-foreground mt-1">Secure • encrypted • SSL protected</p>
        </div>
        <ShieldCheck className="h-4 w-4 text-green-600" />
      </div>
      <div className="p-5">
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        {!paymentData?.['clientSecret'] ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-muted border-t-black animate-spin" />
            <p className="text-sm text-muted-foreground">Preparing secure payment...</p>
          </div>
        ) : (
          <Elements
            options={{
              appearance: {
                theme: 'stripe',
                variables: {
                  borderRadius: '10px',
                  colorPrimary: theme === 'dark' ? '#ffffff' : '#111111',
                  gridColumnSpacing: '16px',
                  gridRowSpacing: '16px',
                  colorBackground: theme === 'dark' ? '#09131a' : cssVariables.colors.base0,
                  colorDanger: cssVariables.colors.error500,
                  colorDangerText: cssVariables.colors.error500,
                  colorIcon: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000,
                  colorText: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000,
                  colorTextSecondary: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000,
                  colorTextPlaceholder: theme === 'dark' ? '#a1a1aa' : '#9ca3af',
                  fontFamily: 'Geist, sans-serif',
                  fontSizeBase: '14px',
                  fontWeightBold: '600',
                  fontWeightNormal: '500',
                  spacingUnit: '4px',
                },
                rules: {
                  '.Label': { color: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000 },
                  '.Input': { color: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000, backgroundColor: theme === 'dark' ? '#202a32' : cssVariables.colors.base0, borderColor: theme === 'dark' ? '#202a32' : undefined },
                  '.Tab': { color: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000, backgroundColor: theme === 'dark' ? '#09131a' : undefined },
                  '.Tab--selected': { backgroundColor: theme === 'dark' ? '#202a32' : undefined },
                  '.Text': { color: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000 },
                },
              },
              clientSecret: paymentData['clientSecret'] as string,
            }}
            stripe={stripe}
          >
            <div className="flex flex-col gap-4">
              <CheckoutForm customerEmail={email} billingAddress={billingAddress} setProcessingPayment={setProcessingPayment} />
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full flex-1" onClick={() => router.push('/checkout/address')}>← Back to address</Button>
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setPaymentData(null)}>Reset</Button>
              </div>
            </div>
          </Elements>
        )}
      </div>
    </div>
  )
}
