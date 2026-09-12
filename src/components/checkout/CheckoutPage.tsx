'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { getCartItemName, getCartItemStock } from '@/utilities/stock'
import { cssVariables } from '@/cssVariables'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Address } from '@/payload-types'
import { Checkbox } from '@/components/ui/checkbox'
import { AddressItem } from '@/components/addresses/AddressItem'
import { FormItem } from '@/components/forms/FormItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Check, CreditCard, Lock, Mail, MapPin, Package, ShieldCheck, Truck, User } from 'lucide-react'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length
  const outOfStockNames = (cart?.items || []).filter((it: any) => getCartItemStock(it).outOfStock).map((it: any) => getCartItemName(it))

  const canGoToPayment =
    Boolean((email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress)) &&
    outOfStockNames.length === 0

  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
          },
        })) as Record<string, unknown>

        if (paymentData) {
          setPaymentData(paymentData)
        }
      } catch (error) {
        const errorData = error instanceof Error ? JSON.parse(error.message) : {}
        let errorMessage = 'An error occurred while initiating payment.'

        if (errorData?.cause?.code === 'OutOfStock') {
          const names = (cart?.items || []).filter((it: any) => getCartItemStock(it).outOfStock).map((it: any) => getCartItemName(it))
          errorMessage = names.length
            ? `Out of stock: ${names.join(', ')}. Remove them to continue.`
            : 'One or more items in your cart are out of stock.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [billingAddress, billingAddressSameAsShipping, shippingAddress, cart],
  )

  if (!stripe) return null

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

  const subtotal = cart?.subtotal || 0
  const itemCount = cart?.items?.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0) || 0
  const contactDone = Boolean(user || (!emailEditable && email))
  const addressDone = Boolean(billingAddress)
  const paymentActive = Boolean(paymentData?.['clientSecret'])

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} • <Price as="span" amount={subtotal} className="font-medium text-foreground" />
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          {[
            { label: 'Contact', done: contactDone, active: true },
            { label: 'Address', done: addressDone, active: contactDone },
            { label: 'Payment', done: paymentActive, active: addressDone && canGoToPayment },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${s.done ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : s.active ? 'bg-card border-foreground text-foreground' : 'bg-muted border-transparent text-muted-foreground'}`}
                >
                  {s.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`text-xs font-medium hidden sm:block ${s.done || s.active ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className={`w-8 sm:w-12 h-px mx-1 ${arr[i + 1].done || arr[i + 1].active ? 'bg-black' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-6 items-start">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center ${contactDone ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                <Mail className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <h2 className="text-sm font-semibold leading-none">Contact</h2>
                <p className="text-xs text-muted-foreground mt-1">Where we&apos;ll send your order confirmation</p>
              </div>
              {contactDone && <span className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-white" /></span>}
            </div>
            <div className="p-5">
              {!user ? (
                emailEditable ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" /> Already have an account?{' '}
                      <Link href="/login" className="font-medium text-foreground underline underline-offset-4">Log in</Link>
                      <span className="mx-1">•</span>
                      <Link href="/create-account" className="font-medium text-foreground underline underline-offset-4">Create account</Link>
                    </div>
                    <FormItem>
                      <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
                      <Input
                        id="email"
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        type="email"
                        className="h-11 bg-muted/20"
                      />
                    </FormItem>
                    <Button
                      disabled={!email}
                      onClick={(e) => {
                        e.preventDefault()
                        setEmailEditable(false)
                      }}
                      className="bg-black text-white hover:bg-black/90 h-11 w-full sm:w-auto self-start px-8"
                    >
                      Continue as guest
                    </Button>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> We&apos;ll only use your email for order updates.</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 border px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium shrink-0">{email[0]?.toUpperCase()}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{email}</p>
                        <p className="text-xs text-muted-foreground">Guest checkout</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 rounded-full shrink-0" onClick={() => setEmailEditable(true)}>Change</Button>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">{user.email?.[0]?.toUpperCase()}</span>
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                  <Link href="/logout" className="text-xs font-medium underline underline-offset-4">Log out</Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center ${addressDone ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                <MapPin className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <h2 className="text-sm font-semibold leading-none">Shipping & Billing</h2>
                <p className="text-xs text-muted-foreground mt-1">Where we&apos;ll ship your order</p>
              </div>
              {addressDone && <span className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-white" /></span>}
            </div>
            <div className="p-5 flex flex-col gap-5">
              {billingAddress ? (
                <div className="rounded-xl border bg-muted/20 p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Billing address</p>
                    <AddressItem address={billingAddress} hideActions />
                  </div>
                  <Button variant="outline" size="sm" disabled={Boolean(paymentData)} className="rounded-full h-8" onClick={() => setBillingAddress(undefined)}>Change</Button>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Billing address</p>
                  {user ? (
                    <CheckoutAddresses heading="Billing address" setAddress={setBillingAddress} />
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 bg-muted/10">
                      <CreateAddressModal
                        disabled={!contactDone}
                        callback={(address) => setBillingAddress(address)}
                        skipSubmission={true}
                      />
                      {!contactDone && <p className="text-xs text-muted-foreground mt-2">Enter your email first to add an address.</p>}
                    </div>
                  )}
                </div>
              )}

              <label className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${billingAddressSameAsShipping ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-card hover:bg-muted/40'}`}>
                <Checkbox
                  id="shippingTheSameAsBilling"
                  checked={billingAddressSameAsShipping}
                  disabled={Boolean(paymentData || !contactDone)}
                  onCheckedChange={(state) => setBillingAddressSameAsShipping(state as boolean)}
                  className={billingAddressSameAsShipping ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-black' : ''}
                />
                <span className="flex items-center gap-2 text-sm font-medium"><Truck className="h-4 w-4" /> Shipping same as billing</span>
              </label>

              {!billingAddressSameAsShipping && (
                <div className="animate-in fade-in">
                  {shippingAddress ? (
                    <div className="rounded-xl border bg-muted/20 p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Shipping address</p>
                        <AddressItem address={shippingAddress} hideActions />
                      </div>
                      <Button variant="outline" size="sm" disabled={Boolean(paymentData)} className="rounded-full h-8" onClick={() => setShippingAddress(undefined)}>Change</Button>
                    </div>
                  ) : user ? (
                    <CheckoutAddresses heading="Shipping address" description="Please select a shipping address." setAddress={setShippingAddress} />
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 bg-muted/10">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Shipping address</p>
                      <CreateAddressModal callback={(address) => setShippingAddress(address)} disabled={!contactDone} skipSubmission={true} />
                    </div>
                  )}
                </div>
              )}

              {!paymentData && (
                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-black text-white hover:bg-black/90 h-11 rounded-full w-full cursor-pointer disabled:cursor-not-allowed"
                    disabled={!canGoToPayment}
                    onClick={(e) => {
                      e.preventDefault()
                      void initiatePaymentIntent('stripe')
                    }}
                  >
                    <Lock className="h-4 w-4" /> Continue to payment
                  </Button>
                  {outOfStockNames.length > 0 && (
                    <p className="text-xs text-destructive">
                      Out of stock: {outOfStockNames.join(', ')}. Remove {outOfStockNames.length === 1 ? 'it' : 'them'} from your cart to continue.
                    </p>
                  )}
                </div>
              )}

              {!paymentData?.['clientSecret'] && error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex flex-col gap-3">
                  <Message error={error} />
                  <Button onClick={() => router.refresh()} variant="outline" size="sm" className="self-start rounded-full">Try again</Button>
                </div>
              )}
            </div>
          </div>

          <Suspense fallback={null}>
            {!!paymentData?.['clientSecret'] && (
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b">
                  <span className="h-8 w-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold leading-none">Payment</h2>
                    <p className="text-xs text-muted-foreground mt-1">Secure • encrypted • SSL protected</p>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="p-5">
                  {error && <p className="text-sm text-destructive mb-4">{`Error: ${error}`}</p>}
                  <Elements
                    options={{
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          borderRadius: '10px',
                          colorPrimary: theme === 'dark' ? '#ffffff' : '#111111',
                          gridColumnSpacing: '16px',
                          gridRowSpacing: '16px',
                          colorBackground: theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
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
                          '.Input': { color: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000, backgroundColor: theme === 'dark' ? '#1a1a1a' : cssVariables.colors.base0 },
                          '.Tab': { color: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000 },
                          '.Text': { color: theme === 'dark' ? '#ffffff' : cssVariables.colors.base1000 },
                        },
                      },
                      clientSecret: paymentData['clientSecret'] as string,
                    }}
                    stripe={stripe}
                  >
                    <div className="flex flex-col gap-4">
                      <CheckoutForm customerEmail={email} billingAddress={billingAddress} setProcessingPayment={setProcessingPayment} />
                      <Button variant="ghost" size="sm" className="self-start rounded-full" onClick={() => setPaymentData(null)}>← Back to details</Button>
                    </div>
                  </Elements>
                </div>
              </div>
            )}
          </Suspense>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-[80px]">
          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <h2 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Order summary</h2>
            <div className="flex flex-col gap-4 max-h-[42vh] overflow-auto pr-1">
              {cart?.items?.map((item, index) => {
                if (typeof item.product === 'object' && item.product) {
                  const { product, quantity, variant } = item
                  if (!quantity) return null
                  const { outOfStock } = getCartItemStock(item)
                  let image = (product as any).gallery?.[0]?.image || (product as any).meta?.image
                  let price = (product as any)?.priceInUSD
                  const isVariant = Boolean(variant) && typeof variant === 'object'
                  if (isVariant) {
                    price = (variant as any)?.priceInUSD
                    const imageVariant = (product as any).gallery?.find((g: any) => {
                      if (!g.variantOption) return false
                      const variantOptionID = typeof g.variantOption === 'object' ? g.variantOption.id : g.variantOption
                      const hasMatch = (variant as any)?.options?.some((option: any) => {
                        if (typeof option === 'object') return option.id === variantOptionID
                        else return option === variantOptionID
                      })
                      return hasMatch
                    })
                    if (imageVariant && typeof imageVariant.image !== 'string') image = imageVariant.image
                  }
                  return (
                    <div className="flex gap-3" key={index}>
                      <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden border relative">
                        {image && typeof image !== 'string' && <Media className="h-full w-full" imgClassName={`h-full w-full object-cover ${outOfStock ? 'opacity-40 grayscale blur-[1px]' : ''}`} resource={image} />}
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-white text-[11px] flex items-center justify-center font-medium">{quantity}</span>
                      </div>
                      <div className={`flex-1 min-w-0 ${outOfStock ? 'opacity-70' : ''}`}>
                        <p className="text-sm font-medium leading-tight truncate">{(product as any).title}</p>
                        {variant && typeof variant === 'object' && (
                          <p className="text-xs font-mono text-muted-foreground truncate">{(variant as any).options?.map((o: any) => (typeof o === 'object' ? o.label : null)).join(' • ')}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">Qty {quantity}</p>
                        {outOfStock && <Badge variant="destructive" className="mt-1">Out of stock</Badge>}
                      </div>
                      {typeof price === 'number' && <Price amount={price * quantity} as="span" className="text-sm font-semibold shrink-0" />}
                    </div>
                  )
                }
                return null
              })}
            </div>
            <hr />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><Price as="span" amount={subtotal} className="font-medium" /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium text-green-600">Free</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-medium">Calculated at next step</span></div>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <Price className="text-xl font-bold" amount={subtotal} />
            </div>
            <p className="text-xs text-muted-foreground text-center">Including VAT, if applicable</p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg py-2 border">
              <Lock className="h-3 w-3" /> Secure payment with SSL encryption
            </div>
          </div>

          <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/30 p-4 flex gap-3">
            <span className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0"><ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" /></span>
            <div><div className="text-sm font-semibold dark:text-white">Buyer Protection</div><div className="text-xs text-muted-foreground dark:text-white/60">30-day returns • Secure checkout • Encrypted data</div></div>
          </div>

          <div className="rounded-xl border bg-card p-4 flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Truck className="h-3.5 w-3.5" /> Estimated delivery: 2–4 business days • Free returns
          </div>
        </div>
      </div>
    </div>
  )
}
