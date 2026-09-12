import type { Metadata } from 'next'

import { AuthShell } from '@/components/auth/AuthShell'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { LoginForm } from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Lucent"
      description="Access your orders, saved addresses, and wishlist."
      footer={
        <p>
          New here?{' '}
          <a href="/create-account" className="font-medium text-foreground underline underline-offset-4">
            Create an account
          </a>{' '}
          to check out faster next time.
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}

export const metadata: Metadata = {
  description: 'Login or create an account to get started.',
  openGraph: {
    title: 'Login',
    url: '/login',
  },
  title: 'Login',
}
