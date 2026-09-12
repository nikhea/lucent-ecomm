'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

const AUTH_ROUTES = ['/login', '/create-account', '/forgot-password']

export function SiteChrome({
  children,
  footer,
  header,
}: {
  children: React.ReactNode
  footer: React.ReactNode
  header: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  if (isAuthPage) {
    return <main className="flex flex-1 flex-col">{children}</main>
  }

  return (
    <React.Fragment>
      {header}
      <main className="flex flex-1 flex-col pt-[64px]">{children}</main>
      {footer}
    </React.Fragment>
  )
}
