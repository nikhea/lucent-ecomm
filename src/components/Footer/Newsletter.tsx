'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  placeholder: string
  buttonLabel: string
}

export function Newsletter({ placeholder, buttonLabel }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    toast.success('Subscribed! Check your inbox.')
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
        className="flex-1 bg-white dark:bg-black"
      />
      <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white shrink-0">
        {buttonLabel}
      </Button>
    </form>
  )
}
