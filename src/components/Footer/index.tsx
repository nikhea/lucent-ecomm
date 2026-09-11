import type { Footer } from '@/payload-types'

import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { ShoppingBag, Facebook, Twitter, Instagram } from 'lucide-react'
import { CMSLink } from '@/components/Link'
import { Newsletter } from './Newsletter'

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()

  const brandName = (footer as any).brandName || 'EcommerceKit'
  const description = (footer as any).description || 'Discover premium products with exceptional quality and modern design. Your satisfaction is our priority.'
  const newsletter = (footer as any).newsletter || { title: 'Subscribe to our newsletter', placeholder: 'Enter your email', buttonLabel: 'Subscribe' }
  const quickLinksTitle = (footer as any).quickLinksTitle || 'Quick Links'
  const quickLinks = (footer as any).quickLinks || [
    { id: '1', link: { label: 'About Us', url: '/about' } },
    { id: '2', link: { label: 'Contact', url: '/contact' } },
    { id: '3', link: { label: 'FAQ', url: '/contact' } },
    { id: '4', link: { label: 'Shipping Info', url: '/shop' } },
  ]
  const legalTitle = (footer as any).legalTitle || 'Legal'
  const legalLinks = (footer as any).legalLinks || [
    { id: '1', link: { label: 'Privacy Policy', url: '/privacy' } },
    { id: '2', link: { label: 'Terms of Service', url: '/terms' } },
    { id: '3', link: { label: 'Returns', url: '/returns' } },
  ]
  const socialLinks = (footer as any).socialLinks || [
    { id: '1', platform: 'facebook', url: '#' },
    { id: '2', platform: 'twitter', url: '#' },
    { id: '3', platform: 'instagram', url: '#' },
  ]
  const copyright = (footer as any).copyright || `© ${new Date().getFullYear()} EcommerceKit. All rights reserved.`

  const iconMap: Record<string, React.ReactNode> = {
    facebook: <Facebook className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
  }

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.7fr_0.7fr] gap-10 items-start">
          <div className="flex flex-col gap-4 max-w-[520px]">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">{brandName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

            <div className="mt-2">
              <div className="text-sm font-semibold mb-3">{newsletter.title}</div>
              <Newsletter placeholder={newsletter.placeholder} buttonLabel={newsletter.buttonLabel} />
            </div>

            <div className="flex gap-4 mt-2 text-muted-foreground">
              {socialLinks.map((s: any) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  {iconMap[s.platform] || <Facebook className="h-5 w-5" />}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-4">{quickLinksTitle}</div>
            <ul className="flex flex-col gap-3">
              {quickLinks.slice(0, 4).map((item: any) => (
                <li key={item.id}>
                  <CMSLink {...item.link} className="text-sm text-muted-foreground hover:text-foreground transition-colors" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold mb-4">{legalTitle}</div>
            <ul className="flex flex-col gap-3">
              {legalLinks.slice(0, 3).map((item: any) => (
                <li key={item.id}>
                  <CMSLink {...item.link} className="text-sm text-muted-foreground hover:text-foreground transition-colors" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <p className="text-center text-sm text-muted-foreground">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
