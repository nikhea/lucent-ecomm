'use client'
import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Message } from '@/components/Message'
import { useAuth } from '@/providers/Auth'
import { useCheckout } from '@/components/checkout/CheckoutContext'
import { Check, Lock, MapPin, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AddressPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { contactDone, billingAddress, setBillingAddress, shippingAddress, setShippingAddress, billingAddressSameAsShipping, setBillingAddressSameAsShipping, canGoToPayment, error, initiatePaymentIntent } = useCheckout()

  useEffect(() => { if (!contactDone) router.replace('/checkout/contact') }, [contactDone, router])

  if (!contactDone) return null

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b">
        <span className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center"><MapPin className="h-4 w-4" /></span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold leading-none">Shipping & Billing</h2>
          <p className="text-xs text-muted-foreground mt-1">Where we&apos;ll ship your order</p>
        </div>
        {billingAddress && <span className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-white" /></span>}
      </div>
      <div className="p-5 flex flex-col gap-5">
        {billingAddress ? (
          <div className="rounded-xl border bg-muted/20 p-4 flex items-start justify-between gap-4">
            <div className="flex-1"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Billing address</p><AddressItem address={billingAddress} hideActions /></div>
            <Button variant="outline" size="sm" className="rounded-full h-8" onClick={() => setBillingAddress(undefined)}>Change</Button>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Billing address</p>
            {user ? <CheckoutAddresses heading="Billing address" setAddress={setBillingAddress} /> : (
              <div className="rounded-xl border border-dashed p-4 bg-muted/10">
                <CreateAddressModal disabled={!contactDone} callback={(a) => setBillingAddress(a)} skipSubmission />
                {!contactDone && <p className="text-xs text-muted-foreground mt-2">Enter your email first to add an address.</p>}
              </div>
            )}
          </div>
        )}

        <label className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${billingAddressSameAsShipping ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-card hover:bg-muted/40'}`}>
          <Checkbox id="s" checked={billingAddressSameAsShipping} onCheckedChange={(v) => setBillingAddressSameAsShipping(v as boolean)} className={billingAddressSameAsShipping ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-black' : ''} />
          <span className="flex items-center gap-2 text-sm font-medium"><Truck className="h-4 w-4" /> Shipping same as billing</span>
        </label>

        {!billingAddressSameAsShipping && (
          <div>
            {shippingAddress ? (
              <div className="rounded-xl border bg-muted/20 p-4 flex items-start justify-between gap-4">
                <div className="flex-1"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Shipping address</p><AddressItem address={shippingAddress} hideActions /></div>
                <Button variant="outline" size="sm" className="rounded-full h-8" onClick={() => setShippingAddress(undefined)}>Change</Button>
              </div>
            ) : user ? <CheckoutAddresses heading="Shipping address" description="Please select a shipping address." setAddress={setShippingAddress} /> : (
              <div className="rounded-xl border border-dashed p-4 bg-muted/10">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Shipping address</p>
                <CreateAddressModal callback={(a) => setShippingAddress(a)} skipSubmission />
              </div>
            )}
          </div>
        )}

        {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4"><Message error={error} /></div>}

        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full flex-1 h-11" onClick={() => router.push('/checkout/contact')}>← Back</Button>
          <Button className="bg-black text-white hover:bg-black/90 h-11 rounded-full flex-[1.4]" disabled={!canGoToPayment} onClick={async () => { await initiatePaymentIntent('stripe'); router.push('/checkout/payment') }}>
            <Lock className="h-4 w-4" /> Continue to payment
          </Button>
        </div>
      </div>
    </div>
  )
}
