'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message = response.statusText || 'There was an error creating the account.'
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Account created successfully')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router, searchParams],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <Message
          className="my-0 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm"
          error={error}
        />
      )}

      <FormItem>
        <Label htmlFor="email" className="font-sans text-sm font-medium normal-case tracking-normal text-foreground">
          Email address
        </Label>
        <Input
          id="email"
          {...register('email', { required: 'Email is required.' })}
          autoComplete="email"
          placeholder="you@example.com"
          className="h-12 rounded-xl bg-background px-4"
          type="email"
        />
        {errors.email && <FormError message={errors.email.message} />}
      </FormItem>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormItem>
          <Label htmlFor="password" className="font-sans text-sm font-medium normal-case tracking-normal text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              {...register('password', { required: 'Password is required.' })}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="h-12 rounded-xl bg-background pr-11"
              type={showPassword ? 'text' : 'password'}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="font-sans text-sm font-medium normal-case tracking-normal text-foreground">
            Confirm password
          </Label>
          <Input
            id="passwordConfirm"
            {...register('passwordConfirm', {
              required: 'Please confirm your password.',
              validate: (value) => value === password.current || 'The passwords do not match',
            })}
            autoComplete="new-password"
            placeholder="Repeat password"
            className="h-12 rounded-xl bg-background px-4"
            type={showPassword ? 'text' : 'password'}
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>

      <Button
        className="h-12 w-full rounded-xl text-sm font-semibold"
        disabled={loading}
        size="lg"
        type="submit"
        variant="default"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? 'Creating your account…' : 'Create account'}
      </Button>

      <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Already a member?
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-xl">
        <Link href={`/login${allParams}`}>Back to sign in</Link>
      </Button>
    </form>
  )
}
