'use client'

import React from 'react'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { MapPin, Plus } from 'lucide-react'

export const AddressListing: React.FC = () => {
  const { addresses, isLoading } = useAddresses()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-muted mb-4" />
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-10 flex flex-col items-center text-center gap-4">
        <span className="h-14 w-14 rounded-2xl bg-card border shadow-sm flex items-center justify-center">
          <MapPin className="h-6 w-6 text-muted-foreground" />
        </span>
        <div>
          <p className="font-semibold">No addresses yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">Add your first address to speed up checkout. You can save multiple addresses for home, work and more.</p>
        </div>
        <CreateAddressModal buttonText="Add your first address" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <AddressItem key={address.id} address={address as any} />
      ))}
      <div className="rounded-2xl border border-dashed bg-muted/10 p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[200px] hover:bg-muted/20 transition-colors">
        <span className="h-10 w-10 rounded-xl bg-card border flex items-center justify-center">
          <Plus className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-sm">Add a new address</p>
          <p className="text-xs text-muted-foreground">Home, office or any place</p>
        </div>
        <CreateAddressModal buttonText="Add address" />
      </div>
    </div>
  )
}
