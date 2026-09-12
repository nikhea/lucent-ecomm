'use client'
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { defaultCountries as supportedCountries } from '@payloadcms/plugin-ecommerce/client/react'
import { Address, Config } from '@/payload-types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { titles } from './constants'
import { Button } from '@/components/ui/button'
import { deepMergeSimple } from 'payload/shared'
import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { User, Phone, Building2, MapPin, Home, Map, Hash, Globe, Tag } from 'lucide-react'

type AddressFormValues = {
  title?: string | null
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
}

type Props = {
  addressID?: Config['db']['defaultIDType']
  initialData?: Omit<Address, 'country' | 'id' | 'updatedAt' | 'createdAt'> & { country?: string }
  callback?: (data: Partial<Address>) => void
  skipSubmission?: boolean
}

export const AddressForm: React.FC<Props> = ({ addressID, initialData, callback, skipSubmission }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<AddressFormValues>({ defaultValues: initialData })
  const { createAddress, updateAddress } = useAddresses()
  const onSubmit = useCallback(async (data: AddressFormValues) => {
    const newData = deepMergeSimple(initialData || {}, data)
    if (!skipSubmission) {
      if (addressID) await updateAddress(addressID, newData)
      else await createAddress(newData)
    }
    if (callback) callback(newData)
  }, [initialData, skipSubmission, callback, addressID, updateAddress, createAddress])

  const inputWrap = 'relative'
  const iconCls = 'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none'
  const withIcon = 'pl-9 h-10 bg-card border-muted-foreground/20 focus-visible:ring-black/10 rounded-lg'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0 [&_[data-slot=label]]:text-black dark:[&_[data-slot=label]]:text-white">
      <div className="flex items-center gap-3 px-3.5 py-3 mb-5 rounded-xl bg-muted/30 border border-dashed">
        <span className="h-8 w-8 rounded-lg bg-card border shadow-sm flex items-center justify-center shrink-0"><MapPin className="h-4 w-4 text-muted-foreground" /></span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-foreground leading-none">Delivery details</p>
          <p className="text-xs text-muted-foreground mt-1 leading-none truncate">We’ll use this for shipping and billing</p>
        </div>
        <span className="hidden sm:inline-flex text-[10px] font-medium px-2.5 py-1 rounded-full bg-card border shadow-sm shrink-0">Saved to account</span>
      </div>

      <div className="flex flex-col gap-5 max-h-[52vh] overflow-y-auto pr-1 -mr-1">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3 flex items-center gap-1.5"><User className="h-3 w-3" /> Personal</p>
          <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr_1fr] gap-3">
            <FormItem>
              <Label htmlFor="title" className="text-xs flex items-center gap-1"><Tag className="h-3 w-3" /> Title</Label>
              <Select {...register('title')} onValueChange={(v) => setValue('title', v, { shouldValidate: true })} defaultValue={initialData?.title || ''}>
                <SelectTrigger id="title" className="h-10 bg-card rounded-lg"><SelectValue placeholder="Mr" /></SelectTrigger>
                <SelectContent>{titles.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              {errors.title && <FormError message={errors.title.message} />}
            </FormItem>
            <FormItem>
              <Label htmlFor="firstName" className="text-xs">First name*</Label>
              <div className={inputWrap}><User className={iconCls} /><Input id="firstName" autoComplete="given-name" className={withIcon} placeholder="Jane" {...register('firstName', { required: 'First name is required.' })} /></div>
              {errors.firstName && <FormError message={errors.firstName.message} />}
            </FormItem>
            <FormItem>
              <Label htmlFor="lastName" className="text-xs">Last name*</Label>
              <div className={inputWrap}><User className={iconCls} /><Input id="lastName" autoComplete="family-name" className={withIcon} placeholder="Doe" {...register('lastName', { required: 'Last name is required.' })} /></div>
              {errors.lastName && <FormError message={errors.lastName.message} />}
            </FormItem>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormItem>
            <Label htmlFor="phone" className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
            <div className={inputWrap}><Phone className={iconCls} /><Input type="tel" id="phone" autoComplete="tel" className={withIcon} placeholder="+1 555 000 0000" {...register('phone')} /></div>
            {errors.phone && <FormError message={errors.phone.message} />}
          </FormItem>
          <FormItem>
            <Label htmlFor="company" className="text-xs flex items-center gap-1"><Building2 className="h-3 w-3" /> Company</Label>
            <div className={inputWrap}><Building2 className={iconCls} /><Input id="company" autoComplete="organization" className={withIcon} placeholder="Acme Inc." {...register('company')} /></div>
            {errors.company && <FormError message={errors.company.message} />}
          </FormItem>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3 flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Address</p>
          <div className="flex flex-col gap-3">
            <FormItem>
              <Label htmlFor="addressLine1" className="text-xs flex items-center gap-1"><Home className="h-3 w-3" /> Address line 1*</Label>
              <div className={inputWrap}><Home className={iconCls} /><Input id="addressLine1" autoComplete="address-line1" className={withIcon} placeholder="123 Main St, Apt 4B" {...register('addressLine1', { required: 'Address line 1 is required.' })} /></div>
              {errors.addressLine1 && <FormError message={errors.addressLine1.message} />}
            </FormItem>
            <FormItem>
              <Label htmlFor="addressLine2" className="text-xs flex items-center gap-1"><Map className="h-3 w-3" /> Address line 2</Label>
              <div className={inputWrap}><Map className={iconCls} /><Input id="addressLine2" autoComplete="address-line2" className={withIcon} placeholder="Floor, suite, etc." {...register('addressLine2')} /></div>
              {errors.addressLine2 && <FormError message={errors.addressLine2.message} />}
            </FormItem>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormItem>
                <Label htmlFor="city" className="text-xs">City*</Label>
                <div className={inputWrap}><MapPin className={iconCls} /><Input id="city" autoComplete="address-level2" className={withIcon} placeholder="New York" {...register('city', { required: 'City is required.' })} /></div>
                {errors.city && <FormError message={errors.city.message} />}
              </FormItem>
              <FormItem>
                <Label htmlFor="state" className="text-xs">State / Province</Label>
                <div className={inputWrap}><Map className={iconCls} /><Input id="state" autoComplete="address-level1" className={withIcon} placeholder="NY" {...register('state')} /></div>
                {errors.state && <FormError message={errors.state.message} />}
              </FormItem>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormItem>
                <Label htmlFor="postalCode" className="text-xs flex items-center gap-1"><Hash className="h-3 w-3" /> Zip Code*</Label>
                <div className={inputWrap}><Hash className={iconCls} /><Input id="postalCode" className={withIcon} placeholder="10001" {...register('postalCode', { required: 'Postal code is required.' })} /></div>
                {errors.postalCode && <FormError message={errors.postalCode.message} />}
              </FormItem>
              <FormItem>
                <Label htmlFor="country" className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Country*</Label>
                <Select {...register('country', { required: 'Country is required.' })} onValueChange={(v) => setValue('country', v, { shouldValidate: true })} required defaultValue={initialData?.country || ''}>
                  <SelectTrigger id="country" className="w-full h-10 bg-card rounded-lg"><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>{supportedCountries.map((country) => { const value = typeof country === 'string' ? country : country.value; const label = typeof country === 'string' ? country : typeof country.label === 'string' ? country.label : value; return <SelectItem key={value} value={value}>{label}</SelectItem> })}</SelectContent>
                </Select>
                {errors.country && <FormError message={errors.country.message} />}
              </FormItem>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t bg-card sticky bottom-0">
        <p className="text-[11px] text-muted-foreground hidden sm:block">All fields marked * are required</p>
        <Button type="submit" className="bg-black text-white hover:bg-black/90 rounded-full h-10 px-8 ml-auto">Save address</Button>
      </div>
    </form>
  )
}
