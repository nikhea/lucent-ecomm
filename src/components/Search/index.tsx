'use client'

import { cn } from '@/utilities/cn'
import { SearchIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useTransition } from 'react'

type Props = {
  className?: string
}

export const Search: React.FC<Props> = ({ className }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [q, setQ] = useQueryState('q', parseAsString.withDefault('').withOptions({ clearOnDefault: true, shallow: false, history: 'push' } as any))

  const [input, setInput] = useState(q)

  useEffect(() => {
    setInput(q)
  }, [q])

  const setValue = (v: string) => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/shop')) {
      startTransition(() => {
        setQ(v || null as any)
      })
    } else {
      if (v) router.push(`/shop?q=${encodeURIComponent(v)}`)
      else router.push('/shop')
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const val = (e.target as HTMLFormElement).search as HTMLInputElement
    setValue(val.value)
  }

  return (
    <form className={cn('relative w-full', className)} onSubmit={onSubmit}>
      <input
        autoComplete="off"
        className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-black dark:text-white dark:placeholder:text-neutral-400"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        name="search"
        placeholder="Search for products..."
        type="text"
      />
      <button type="submit" className="absolute right-0 top-0 mr-3 flex h-full items-center" aria-label="Search">
        <SearchIcon className="h-4" />
      </button>
    </form>
  )
}
