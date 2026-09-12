'use client'

import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Address } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { useState } from 'react'
import { Building2, Globe, Hash, MapPin, Phone, Plus, User } from 'lucide-react'

type Props = {
  selectedAddress?: Address
  setAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  heading?: string
  description?: string
  setSubmit?: React.Dispatch<React.SetStateAction<() => void | Promise<void>>>
}

export const CheckoutAddresses: React.FC<Props> = ({ setAddress, heading = 'Addresses', description = 'Please select or add your shipping and billing addresses.' }) => {
  const { addresses } = useAddresses()
  if (!addresses || addresses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 flex flex-col items-center text-center gap-3">
        <span className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center"><MapPin className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-medium">No saved addresses</p>
          <p className="text-xs text-muted-foreground mt-1">Add a new address to continue</p>
        </div>
        <CreateAddressModal />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold">{heading}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <AddressesModal setAddress={setAddress} />
    </div>
  )
}

const AddressCard: React.FC<{ address: Address }> = ({ address }) => {
  return (
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold shrink-0">
          {(address.firstName?.[0] || 'A').toUpperCase()}
          {(address.lastName?.[0] || '').toUpperCase()}
        </span>
        <p className="text-sm font-semibold truncate">
          {address.firstName} {address.lastName}
        </p>
        {address.title && <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full border bg-card font-medium tracking-widest uppercase">{address.title}</span>}
      </div>

      <div className="grid gap-1 text-xs text-muted-foreground mt-2">
        {address.phone && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0" /> {address.phone}
          </span>
        )}
        {address.company && (
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3 w-3 shrink-0" /> {address.company}
          </span>
        )}
        <span className="flex items-start gap-1.5">
          <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
          <span>
            {address.addressLine1}
            {address.addressLine2 ? `, ${address.addressLine2}` : ''}
            <br />
            {address.city}
            {address.state ? `, ${address.state}` : ''} {address.postalCode}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 shrink-0" /> {address.country} {address.postalCode ? <span className="inline-flex items-center gap-1"><Hash className="h-3 w-3" /> {address.postalCode}</span> : null}
        </span>
      </div>
    </div>
  )
}

const AddressesModal: React.FC<Props> = ({ setAddress }) => {
  const [open, setOpen] = useState(false)
  const { addresses } = useAddresses()
  if (!addresses || addresses.length === 0) return <p className="text-sm text-muted-foreground">No addresses found.</p>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full h-10 w-full border-dashed">
          <Plus className="h-4 w-4" /> Select an address
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] sm:w-[720px] sm:max-w-[720px] lg:w-[42vw] lg:max-w-[720px] max-w-[92vw] max-h-[85vh] overflow-hidden p-0 gap-0 bg-card border shadow-2xl rounded-2xl flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-base">Select an address</DialogTitle>
              <p className="text-xs text-muted-foreground">Choose where to ship — icons reflect your saved details</p>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-auto px-3 sm:px-6 py-4 flex-1">
          <ul className="flex flex-col gap-3">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="rounded-2xl border p-4 sm:p-5 flex items-start justify-between gap-4 bg-card hover:border-foreground/20 transition-colors group"
              >
                <AddressCard address={address as Address} />
                <Button
                  size="sm"
                  className="rounded-full bg-black text-white hover:bg-black/90 h-8 px-5 shrink-0"
                  onClick={() => {
                    setAddress(address)
                    setOpen(false)
                  }}
                >
                  Select
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-4 border-t bg-muted/20 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <User className="h-3 w-3" /> Addresses are saved to your account
          </p>
          <CreateAddressModal buttonText="Add a new address" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
