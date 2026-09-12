'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, MapPin, Package, LogOut } from 'lucide-react'

type Props = {
  className?: string
}

const items = [
  { href: '/account', label: 'Account settings', icon: Settings, match: (p: string) => p === '/account' },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin, match: (p: string) => p === '/account/addresses' },
  { href: '/orders', label: 'Orders', icon: Package, match: (p: string) => p === '/orders' || p.includes('/orders') },
]

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()

  return (
    <div className={clsx('rounded-2xl border bg-card p-2 shadow-sm h-fit', className)}>
      <div className="px-3 py-3 mb-1">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Account</p>
        <p className="text-sm font-medium mt-1">Manage your profile</p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.match(pathname)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="my-3 h-px bg-border" />

      <Link
        href="/logout"
        className={clsx(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          pathname === '/logout'
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Log out
      </Link>
    </div>
  )
}
