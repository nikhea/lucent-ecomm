'use client'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAddresses, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useAuth } from '@/providers/Auth'
import { Address } from '@/payload-types'
import { toast } from 'sonner'

type Ctx = {
  email: string
  setEmail: (v: string) => void
  emailEditable: boolean
  setEmailEditable: (v: boolean) => void
  billingAddress?: Partial<Address>
  setBillingAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  shippingAddress?: Partial<Address>
  setShippingAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  billingAddressSameAsShipping: boolean
  setBillingAddressSameAsShipping: (v: boolean) => void
  paymentData: Record<string, unknown> | null
  setPaymentData: (v: Record<string, unknown> | null) => void
  error: string | null
  setError: (v: string | null) => void
  isProcessingPayment: boolean
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
  canGoToPayment: boolean
  contactDone: boolean
  addressDone: boolean
  paymentActive: boolean
  initiatePaymentIntent: (paymentID: string) => Promise<void>
  clearCheckout: () => void
}

const CheckoutContext = createContext<Ctx | null>(null)

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider')
  return ctx
}

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { addresses } = useAddresses()
  const { initiatePayment } = usePayments()
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<Record<string, unknown> | null>(null)
  const [billingAddress, setBillingAddress] = useState<Partial<Address> | undefined>(undefined)
  const [shippingAddress, setShippingAddress] = useState<Partial<Address> | undefined>(undefined)
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const canGoToPayment = Boolean((email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress))
  const contactDone = Boolean(user || (!emailEditable && email))
  const addressDone = Boolean(billingAddress)
  const paymentActive = Boolean(paymentData?.['clientSecret'])

  useEffect(() => {
    if (!billingAddress && addresses && addresses.length > 0) {
      const def = addresses[0]
      if (def) setBillingAddress(def)
    }
  }, [addresses, billingAddress])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lucent:checkout')
      if (raw) {
        const s = JSON.parse(raw)
        if (s.email) setEmail(s.email)
        if (typeof s.emailEditable === 'boolean') setEmailEditable(s.emailEditable)
        if (s.billingAddress) setBillingAddress(s.billingAddress)
        if (s.shippingAddress) setShippingAddress(s.shippingAddress)
        if (typeof s.billingAddressSameAsShipping === 'boolean') setBillingAddressSameAsShipping(s.billingAddressSameAsShipping)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem('lucent:checkout', JSON.stringify({ email, emailEditable, billingAddress, shippingAddress, billingAddressSameAsShipping }))
    } catch {}
  }, [email, emailEditable, billingAddress, shippingAddress, billingAddressSameAsShipping])

  const initiatePaymentIntent = useCallback(async (paymentID: string) => {
    try {
      const data = (await initiatePayment(paymentID, {
        additionalData: {
          ...(email ? { customerEmail: email } : {}),
          billingAddress,
          shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
        },
      })) as Record<string, unknown>
      if (data) setPaymentData(data)
    } catch (e) {
      const errorData = e instanceof Error ? (() => { try { return JSON.parse(e.message) } catch { return {} } })() : {}
      let msg = 'An error occurred while initiating payment.'
      if (errorData?.cause?.code === 'OutOfStock') msg = 'One or more items in your cart are out of stock. Out-of-stock items are marked in your cart — remove them to continue.'
      setError(msg)
      toast.error(msg)
    }
  }, [email, billingAddress, shippingAddress, billingAddressSameAsShipping, initiatePayment])

  const clearCheckout = useCallback(() => {
    setPaymentData(null)
    setError(null)
    setProcessingPayment(false)
    try { sessionStorage.removeItem('lucent:checkout') } catch {}
  }, [])

  const value = useMemo(() => ({
    email, setEmail, emailEditable, setEmailEditable,
    billingAddress, setBillingAddress, shippingAddress, setShippingAddress,
    billingAddressSameAsShipping, setBillingAddressSameAsShipping,
    paymentData, setPaymentData, error, setError, isProcessingPayment, setProcessingPayment,
    canGoToPayment, contactDone, addressDone, paymentActive, initiatePaymentIntent, clearCheckout,
  }), [email, emailEditable, billingAddress, shippingAddress, billingAddressSameAsShipping, paymentData, error, isProcessingPayment, canGoToPayment, contactDone, addressDone, paymentActive, initiatePaymentIntent, clearCheckout])

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}
