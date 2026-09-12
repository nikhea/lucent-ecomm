import type { Metadata } from 'next'

import { AuthShell } from '@/components/auth/AuthShell'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Reset access"
      title="Forgot your password?"
      description="Enter your account email and we'll send you a secure reset link."
      footer={
        <p>
          Remembered it?{' '}
          <a href="/login" className="font-medium text-foreground underline underline-offset-4">
            Back to sign in
          </a>
          .
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}

export const metadata: Metadata = {
  description: 'Enter your email address to recover your password.',
  openGraph: mergeOpenGraph({
    title: 'Forgot Password',
    url: '/forgot-password',
  }),
  title: 'Forgot Password',
}
