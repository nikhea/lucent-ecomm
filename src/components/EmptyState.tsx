import Link from 'next/link'
import React from 'react'
import { ArrowRight, Heart, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

const presetMap = {
  wishlist: {
    icon: Heart,
    title: 'Saved For Later is empty',
    description: 'Tap the heart on any product to save it here for later.',
    actionLabel: 'Discover Products',
    actionHref: '/shop',
  },
  cart: {
    icon: ShoppingBag,
    title: 'Your bag is empty',
    description: 'Add items to your bag and they will show up here.',
    actionLabel: 'Continue Shopping',
    actionHref: '/shop',
  },
  orders: {
    icon: Package,
    title: 'No orders yet',
    description: 'When you place orders they will appear here for tracking.',
    actionLabel: 'Start Shopping',
    actionHref: '/shop',
  },
} as const

export type EmptyStatePreset = keyof typeof presetMap

type Props = {
  preset: EmptyStatePreset
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ preset, title, description, actionLabel, actionHref = '/shop', onAction, className }: Props) {
  const defaults = presetMap[preset]
  const Icon = defaults.icon
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon data-icon="inline-start" />
        </EmptyMedia>
        <EmptyTitle>{title || defaults.title}</EmptyTitle>
        <EmptyDescription>{description || defaults.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onAction ? (
          <Button className="cursor-pointer" onClick={onAction}>
            {actionLabel || defaults.actionLabel} <ArrowRight data-icon="inline-end" />
          </Button>
        ) : (
          <Button asChild className="cursor-pointer">
            <Link href={actionHref}>
              {actionLabel || defaults.actionLabel} <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  )
}
