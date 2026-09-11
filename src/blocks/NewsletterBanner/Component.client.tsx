'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { toast } from 'sonner'

export function NewsletterBannerClient({ placeholder, buttonLabel }: { placeholder: string; buttonLabel: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    toast.success('Subscribed! Welcome aboard.')
    setEmail('')
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-white text-black placeholder:text-muted-foreground"
      />
      <Button type="submit" disabled={loading} variant="secondary" className="shrink-0 bg-white text-green-700 hover:bg-neutral-100">
        {buttonLabel}
      </Button>
    </form>
  )
}
