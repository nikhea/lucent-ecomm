import type { ReactNode } from 'react'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RenderParams } from '@/components/RenderParams'
import { AccountNav } from '@/components/AccountNav'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div className="bg-muted/10 min-h-[calc(100vh-200px)]">
      <div className="container">
        <RenderParams className="" />
      </div>

      <div className="container mt-8 sm:mt-12 pb-12 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {user && <AccountNav className="w-full md:w-[240px] md:sticky md:top-24 shrink-0" />}

        <div className="flex flex-col gap-6 grow min-w-0 w-full">{children}</div>
      </div>
    </div>
  )
}
