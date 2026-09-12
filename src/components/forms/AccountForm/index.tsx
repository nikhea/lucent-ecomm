'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormData = {
  email: string
  name: User['name']
  password: string
  passwordConfirm: string
  displayName: string
  phone: string
  dateOfBirth: string
  gender: string
  bio: string
  topSize: string
  bottomSize: string
  shoeSize: string
  newsletter: boolean
}

const emptyDefaults: FormData = {
  email: '',
  name: '',
  password: '',
  passwordConfirm: '',
  displayName: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bio: '',
  topSize: '',
  bottomSize: '',
  shoeSize: '',
  newsletter: true,
}

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'

export const AccountForm: React.FC = () => {
  const { setUser, user } = useAuth()
  const [changePassword, setChangePassword] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
  } = useForm<FormData>({ defaultValues: emptyDefaults })

  const password = useRef({})
  password.current = watch('password', '')
  const newsletter = watch('newsletter', true)

  const router = useRouter()

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/customer-profiles/me', { credentials: 'include' })
      if (!res.ok) {
        setProfileId(null)
        return null
      }
      const profile = await res.json()
      setProfileId(profile.id || null)
      return profile
    } catch {
      setProfileId(null)
      return null
    }
  }, [])

  const resetAll = useCallback(
    async (u: User | null | undefined) => {
      const profile = await loadProfile()
      reset({
        name: u?.name || '',
        email: u?.email || '',
        password: '',
        passwordConfirm: '',
        displayName: profile?.displayName || '',
        phone: profile?.phone || '',
        dateOfBirth: profile?.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
        gender: profile?.gender || '',
        bio: profile?.bio || '',
        topSize: profile?.measurements?.topSize || '',
        bottomSize: profile?.measurements?.bottomSize || '',
        shoeSize: profile?.measurements?.shoeSize || '',
        newsletter: profile?.preferences?.newsletter ?? true,
      })
    },
    [loadProfile, reset],
  )

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user) return
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          body: JSON.stringify({ name: data.name, email: data.email }),
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!userRes.ok) throw new Error('account')
        const userJson = await userRes.json()
        setUser(userJson.doc)

        const profilePayload = {
          displayName: data.displayName || null,
          phone: data.phone || null,
          dateOfBirth: data.dateOfBirth || null,
          gender: data.gender || null,
          bio: data.bio || null,
          measurements: { topSize: data.topSize || null, bottomSize: data.bottomSize || null, shoeSize: data.shoeSize || null },
          preferences: { newsletter: !!data.newsletter },
        }
        const profileRes = await fetch(profileId ? `/api/customer-profiles/${profileId}` : '/api/customer-profiles', {
          body: JSON.stringify(profilePayload),
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: profileId ? 'PATCH' : 'POST',
        })
        if (!profileRes.ok) throw new Error('profile')
        const profileJson = await profileRes.json()
        setProfileId(profileJson.doc?.id || profileId)

        toast.success('Successfully updated account.')
        await resetAll(userJson.doc)
      } catch {
        toast.error('There was a problem updating your account.')
      }
    },
    [user, setUser, profileId, resetAll],
  )

  const onPasswordSubmit = useCallback(
    async (data: FormData) => {
      if (!user) return
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
        body: JSON.stringify({ password: data.password, passwordConfirm: data.passwordConfirm }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      if (response.ok) {
        toast.success('Password changed.')
        setChangePassword(false)
        reset({ ...(watch() as FormData), password: '', passwordConfirm: '' })
      } else {
        toast.error('There was a problem changing your password.')
      }
    },
    [user, reset, watch],
  )

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(
          'You must be logged in to view this page.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
    }
    if (user) void resetAll(user)
  }, [user, router, resetAll, changePassword])

  return (
    <form className="max-w-xl [&_[data-slot=label]]:text-black dark:[&_[data-slot=label]]:text-white" onSubmit={handleSubmit(changePassword ? onPasswordSubmit : onSubmit)}>
      {!changePassword ? (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p className="">
              {'Change your account details below, or '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                click here
              </Button>
              {' to change your password.'}
            </p>
          </div>

          <h3 className="text-sm font-semibold tracking-wide mb-4">Personal details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <FormItem className="sm:col-span-1">
              <Label htmlFor="email" className="mb-2">
                Email Address
              </Label>
              <Input id="email" {...register('email', { required: 'Please provide an email.' })} type="email" />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <FormItem className="sm:col-span-1">
              <Label htmlFor="name" className="mb-2">
                Name
              </Label>
              <Input id="name" {...register('name', { required: 'Please provide a name.' })} type="text" />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>

            <FormItem className="sm:col-span-1">
              <Label htmlFor="displayName" className="mb-2">
                Display Name
              </Label>
              <Input id="displayName" {...register('displayName')} type="text" placeholder="Public name on reviews" />
            </FormItem>

            <FormItem className="sm:col-span-1">
              <Label htmlFor="phone" className="mb-2">
                Phone
              </Label>
              <Input id="phone" {...register('phone')} type="tel" placeholder="+1 555 000 1234" />
            </FormItem>

            <FormItem className="sm:col-span-1">
              <Label htmlFor="dateOfBirth" className="mb-2">
                Date of Birth
              </Label>
              <Input id="dateOfBirth" {...register('dateOfBirth')} type="date" />
            </FormItem>

            <FormItem className="sm:col-span-1">
              <Label htmlFor="gender" className="mb-2">
                Gender
              </Label>
              <select id="gender" {...register('gender')} className={selectClass} defaultValue="">
                <option value="">Prefer not to say</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="unisex">Unisex</option>
              </select>
            </FormItem>

            <FormItem className="sm:col-span-2">
              <Label htmlFor="bio" className="mb-2">
                Bio
              </Label>
              <Textarea id="bio" {...register('bio')} rows={3} maxLength={500} placeholder="Tell us a little about your style" />
            </FormItem>
          </div>

          <h3 className="text-sm font-semibold tracking-wide mb-4">Size profile</h3>
          <p className="text-xs text-muted-foreground -mt-2 mb-4">Used for size recommendations.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <FormItem>
              <Label htmlFor="topSize" className="mb-2">
                Top Size
              </Label>
              <select id="topSize" {...register('topSize')} className={selectClass} defaultValue="">
                <option value="">Select</option>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormItem>

            <FormItem>
              <Label htmlFor="bottomSize" className="mb-2">
                Bottom Size
              </Label>
              <select id="bottomSize" {...register('bottomSize')} className={selectClass} defaultValue="">
                <option value="">Select</option>
                {['28', '30', '32', '34', '36', '38'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormItem>

            <FormItem>
              <Label htmlFor="shoeSize" className="mb-2">
                Shoe Size
              </Label>
              <Input id="shoeSize" {...register('shoeSize')} type="text" placeholder="42 / 9" />
            </FormItem>
          </div>

          <h3 className="text-sm font-semibold tracking-wide mb-4">Preferences</h3>
          <label className="flex cursor-pointer items-center gap-3 mb-8">
            <Checkbox checked={!!newsletter} onCheckedChange={(v) => setValue('newsletter', v === true, { shouldDirty: true })} />
            <span className="text-sm">Email me news and offers</span>
          </label>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p>
              {'Change your password below, or '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                cancel
              </Button>
              .
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="password" className="mb-2">
                New password
              </Label>
              <Input
                id="password"
                {...register('password', { required: 'Please provide a new password.' })}
                type="password"
              />
              {errors.password && <FormError message={errors.password.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="passwordConfirm" className="mb-2">
                Confirm password
              </Label>
              <Input
                id="passwordConfirm"
                {...register('passwordConfirm', {
                  required: 'Please confirm your new password.',
                  validate: (value) => value === password.current || 'The passwords do not match',
                })}
                type="password"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <div className={cn(changePassword ? '' : 'flex items-center gap-3')}>
        <Button disabled={isLoading || isSubmitting || !isDirty} type="submit" variant="default" className="cursor-pointer">
          {isLoading || isSubmitting
            ? 'Processing'
            : changePassword
              ? 'Change Password'
              : 'Update Account'}
        </Button>
        {!changePassword && (
          <span className="text-xs text-muted-foreground">Profile details save to your customer profile.</span>
        )}
      </div>
    </form>
  )
}
