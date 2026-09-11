import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import React from 'react'

type DropdownProps = {
  label: string
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  widthClass?: string
  contentClassName?: string
}

export function Dropdown({ label, children, align = 'left', widthClass = 'w-[320px]', contentClassName }: DropdownProps) {
  return (
    <div className="relative group">
      <button
        className={cn('flex items-center gap-1 py-6 text-sm font-medium hover:text-primary transition-colors', 'group-hover:text-primary')}
        aria-haspopup="menu"
      >
        {label}
        <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
      </button>
      <div
        className={cn(
          'absolute top-full z-50 hidden group-hover:block group-focus-within:block',
          align === 'left' && 'left-0',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          align === 'right' && 'right-0',
        )}
      >
        <div className="pt-2">
          <div className={cn('rounded-xl border bg-white shadow-xl overflow-hidden dark:bg-card', widthClass, contentClassName)}>{children}</div>
        </div>
      </div>
    </div>
  )
}

type SimpleItemProps = {
  title: string
  description?: string | null
  href?: string | null
}

export function SimpleItem({ title, description, href }: SimpleItemProps) {
  const content = (
    <div className="p-3 hover:bg-accent/50 transition-colors rounded-lg">
      <div className="text-sm font-semibold">{title}</div>
      {description && <div className="text-sm text-muted-foreground leading-tight mt-0.5 line-clamp-2">{description}</div>}
    </div>
  )
  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }
  return content
}
