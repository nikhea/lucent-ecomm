import type { Metadata } from 'next'

import { AuthShell } from '@/components/auth/AuthShell'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { redirect } from 'next/navigation'

export default async function CreateAccount() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <AuthShell
      eyebrow="Join Lucent"
      title="Create your account"
      description="One account for faster checkout, order tracking, and saved favorites."
      footer={
        <p>
          Already have an account?{' '}
          <a href="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </a>
          .
        </p>
      }
    >
      <CreateAccountForm />
    </AuthShell>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
