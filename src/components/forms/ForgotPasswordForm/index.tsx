'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import React, { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
}

export const ForgotPasswordForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(async (data: FormData) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/forgot-password`,
      {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    )

    if (response.ok) {
      setSuccess(true)
      setError('')
    } else {
      setError(
        'There was a problem while attempting to send you a password reset email. Please try again.',
      )
    }
  }, [])

  return (
    <Fragment>
      {!success && (
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
              {...register('email', { required: 'Please provide your email.' })}
              autoComplete="email"
              placeholder="you@example.com"
              className="h-12 rounded-xl bg-background px-4"
              type="email"
            />
            {errors.email && <FormError message={errors.email.message} />}
          </FormItem>

          <Button
            className="h-12 w-full rounded-xl text-sm font-semibold"
            disabled={isSubmitting}
            size="lg"
            type="submit"
            variant="default"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? 'Sending link…' : 'Send reset link'}
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-xl">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </form>
      )}
      {success && (
        <div className="rounded-2xl border bg-muted/40 p-6 text-center">
          <CheckCircle2 className="mx-auto size-10 text-green-600" />
          <h2 className="mt-4 font-serif text-2xl">Check your inbox</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            We sent you a secure link to reset your password. It expires soon, so open it when
            you&rsquo;re ready.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-6 h-11 rounded-xl">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      )}
    </Fragment>
  )
}
