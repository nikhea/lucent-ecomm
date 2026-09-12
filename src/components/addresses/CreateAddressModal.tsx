'use client'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AddressForm } from '@/components/forms/AddressForm'
import { Address } from '@/payload-types'
import { DefaultDocumentIDType } from 'payload'
import { MapPin } from 'lucide-react'

type Props = {
  addressID?: DefaultDocumentIDType
  initialData?: Partial<Omit<Address, 'country'>> & { country?: string }
  buttonText?: string
  modalTitle?: string
  callback?: (address: Partial<Address>) => void
  skipSubmission?: boolean
  disabled?: boolean
}

export const CreateAddressModal: React.FC<Props> = ({ addressID, initialData, buttonText = 'Add a new address', modalTitle = 'Add a new address', callback, skipSubmission, disabled }) => {
  const [open, setOpen] = useState(false)
  const closeModal = () => setOpen(false)
  const handleCallback = (data: Partial<Address>) => { closeModal(); if (callback) callback(data) }
  const isEdit = Boolean(addressID)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant={isEdit ? 'outline' : 'default'} className={isEdit ? 'rounded-full' : 'rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black shadow-sm'}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] sm:w-[760px] sm:max-w-[760px] lg:w-[46vw] lg:max-w-[760px] max-w-[92vw] max-h-[88vh] overflow-hidden p-0 gap-0 bg-card border shadow-2xl rounded-2xl flex flex-col">
        <DialogHeader className="px-7 pt-7 pb-5 border-b bg-card shrink-0">
          <div className="flex items-center gap-3.5">
            <span className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm"><MapPin className="h-5 w-5" /></span>
            <div>
              <DialogTitle className="text-[17px] font-bold tracking-tight leading-none">{modalTitle}</DialogTitle>
              <DialogDescription className="text-[13px] mt-1">This address will be connected to your account.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-auto px-6 py-6 flex-1">
          <AddressForm addressID={addressID} initialData={initialData} callback={handleCallback} skipSubmission={skipSubmission} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
