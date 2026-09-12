'use client'

import React from 'react'
import type { Address } from '@/payload-types'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { MapPin, Building2, Phone, Globe } from 'lucide-react'

type Props = {
  address: Partial<Omit<Address, 'country'>> & { country?: string }
  actions?: React.ReactNode
  beforeActions?: React.ReactNode
  afterActions?: React.ReactNode
  hideActions?: boolean
  variant?: 'card' | 'plain'
}

export const AddressItem: React.FC<Props> = ({
  address,
  actions,
  hideActions = false,
  beforeActions,
  afterActions,
  variant = 'card',
}) => {
  if (!address) {
    return null
  }

  const initials = `${address.firstName?.[0] || ''}${address.lastName?.[0] || ''}`.toUpperCase() || 'A'

  if (variant === 'plain') {
    return (
      <div className="text-sm leading-relaxed">
        <p className="font-semibold tracking-tight">
          {address.firstName} {address.lastName}
        </p>
        <p className="text-muted-foreground mt-1">
          {address.addressLine1}
          {address.addressLine2 && <>, {address.addressLine2}</>}
          <br />
          {address.city}, {address.state} {address.postalCode}
          <br />
          {address.country}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </span>
          <div>
            <p className="font-semibold leading-none">
              {address.firstName} {address.lastName}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Globe className="h-3 w-3" /> {address.country} {address.postalCode && `· ${address.postalCode}`}
            </p>
          </div>
        </div>
        {address.title && (
          <span className="shrink-0 inline-flex items-center rounded-full border bg-muted px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase">
            {address.title}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm leading-relaxed">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-foreground">
            {address.addressLine1}
            {address.addressLine2 && <>, {address.addressLine2}</>}
            <br />
            <span className="text-muted-foreground">
              {address.city}, {address.state} {address.postalCode}
            </span>
          </span>
        </div>
        {address.company && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" /> {address.company}
          </div>
        )}
        {address.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" /> {address.phone}
          </div>
        )}
      </div>

      {!hideActions && address.id && (
        <div className="flex items-center gap-2 pt-2 border-t mt-auto">
          {actions ? (
            actions
          ) : (
            <>
              {beforeActions}
              <CreateAddressModal
                addressID={address.id}
                initialData={address}
                buttonText="Edit"
                modalTitle="Edit address"
              />
              {afterActions}
            </>
          )}
        </div>
      )}
    </div>
  )
}
