import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ensureStartsWith } from '@/utilities/ensureStartsWith'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { Space_Grotesk, PT_Serif, Space_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React from 'react'
import './globals.css'

const fontSans = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const fontSerif = PT_Serif({ subsets: ['latin'], variable: '--font-pt-serif', weight: ['400', '700'] })
const fontMono = Space_Mono({ subsets: ['latin'], variable: '--font-space-mono', weight: ['400', '700'] })

/* const { SITE_NAME, TWITTER_CREATOR, TWITTER_SITE } = process.env
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000'
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined
 */
/* export const metadata = {
  metadataBase: new URL(baseUrl),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite,
      },
    }),
} */

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={[fontSans.variable, fontSerif.variable, fontMono.variable].filter(Boolean).join(' ')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning>
        <NuqsAdapter>
          <Providers>
            <AdminBar />
            <LivePreviewListener />

            <Header />
            <main>{children}</main>
            <Footer />
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  )
}
