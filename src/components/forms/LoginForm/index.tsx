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
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    formState: { errors, isLoading, isSubmitting },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push('/account')
      } catch (_) {
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router],
  )

  const busy = isLoading || isSubmitting

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
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="h-12 rounded-xl bg-background px-4"
          {...register('email', { required: 'Email is required.' })}
        />
        {errors.email && <FormError message={errors.email.message} />}
      </FormItem>

      <FormItem>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="font-sans text-sm font-medium normal-case tracking-normal text-foreground">
            Password
          </Label>
          <Link
            href={`/forgot-password${allParams}`}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-12 rounded-xl bg-background pr-11"
            {...register('password', { required: 'Please provide a password.' })}
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

      <Button
        className="h-12 w-full rounded-xl text-sm font-semibold"
        disabled={busy}
        size="lg"
        type="submit"
        variant="default"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? 'Signing you in…' : 'Sign in'}
      </Button>

      <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        New to Lucent?
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-xl">
        <Link href={`/create-account${allParams}`}>Create an account</Link>
      </Button>
    </form>
  )
}
