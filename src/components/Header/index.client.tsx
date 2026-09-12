'use client'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { Search } from '@/components/Search'
import { Dropdown } from '@/components/Navbar/Dropdown'
import { ShopDropdown } from '@/components/Navbar/ShopDropdown'
import { CategoriesDropdown } from '@/components/Navbar/CategoriesDropdown'
import { QuickLinksDropdown } from '@/components/Navbar/QuickLinksDropdown'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileMenu } from './MobileMenu'
import type { Header, Category, ShopCollection, Product } from 'src/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { ShoppingBag, ShoppingCart } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

type Props = {
  header: Header
  categories: Category[]
  collections: ShopCollection[]
  newArrivalProduct: Product | null
}

export function HeaderClient({ header, categories, collections, newArrivalProduct }: Props) {
  const menu = header.navItems || []
  const quickLinks = (header as any).quickLinks || []
  const { user } = useAuth()

  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-white border-b dark:bg-black">
      <nav className="container flex h-[64px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold hidden sm:block">EcommerceKit</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Dropdown label="Shop" widthClass="w-[560px]">
              <ShopDropdown collections={collections} newArrivalProduct={newArrivalProduct} />
            </Dropdown>
            <Dropdown label="Categories" widthClass="w-[560px]">
              <CategoriesDropdown categories={categories} />
            </Dropdown>
            <Dropdown label="Quick Links" widthClass="w-[340px]">
              {quickLinks.length ? (
                <QuickLinksDropdown quickLinks={quickLinks} />
              ) : (
                <div className="p-2 flex flex-col">
                  <a href="/shop" className="block p-3 hover:bg-muted rounded-lg">
                    <div className="text-sm font-semibold">All Products</div>
                    <div className="text-sm text-muted-foreground">Browse our full product catalog.</div>
                  </a>
                  <a href="/contact" className="block p-3 hover:bg-muted rounded-lg">
                    <div className="text-sm font-semibold">FAQs</div>
                    <div className="text-sm text-muted-foreground">Answers to common questions.</div>
                  </a>
                  <a href="/shop" className="block p-3 hover:bg-muted rounded-lg">
                    <div className="text-sm font-semibold">Blog</div>
                    <div className="text-sm text-muted-foreground">Get inspired by our latest posts.</div>
                  </a>
                </div>
              )}
            </Dropdown>
          </div>

          <div className="lg:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={menu} />
            </Suspense>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-[380px] mx-4 hidden md:flex">
          <div className="relative w-full">
            <Search className="w-full" />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Suspense fallback={<OpenCartButton />}>
            <div className="relative flex items-center gap-2">
              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="h-5 w-5" />
                <CartCount />
              </Link>
            </div>
          </Suspense>
          {user ? (
            <Link href="/account" className="hidden sm:inline-flex rounded-lg border px-4 py-2 text-sm font-medium">
              Account
            </Link>
          ) : (
            <Link href="/login" className="rounded-lg border px-4 py-2 text-sm font-medium">
              Sign In
            </Link>
          )}
        </div>
      </nav>
      <div className="md:hidden px-4 pb-3">
        <Search />
      </div>
    </div>
  )
}

function CartCount() {
  const { cart } = useCart()
  const count = React.useMemo(() => {
    if (!cart?.items?.length) return 0
    return cart.items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0)
  }, [cart])
  if (!count) return null
  return (
    <span suppressHydrationWarning className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
      {count > 9 ? '9+' : count}
    </span>
  )
}
