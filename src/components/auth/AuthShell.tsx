import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { RenderParams } from '@/components/RenderParams'
import { cn } from '@/utilities/cn'

type AuthShellProps = {
  backHref?: string
  backLabel?: string
  children: React.ReactNode
  description?: React.ReactNode
  eyebrow: string
  footer?: React.ReactNode
  title: string
}

const perks = [
  { title: 'Order history & tracking', body: 'Review past orders and follow deliveries in one place.' },
  { title: 'Faster checkout', body: 'Saved addresses and details for one-tap reordering.' },
  { title: 'Wishlist sync', body: 'Keep saved pieces across devices when you sign in.' },
]

export const AuthShell: React.FC<AuthShellProps> = ({
  backHref = '/',
  backLabel = 'Back to store',
  children,
  description,
  eyebrow,
  footer,
  title,
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.35em]">Lucent</span>
          </Link>
          <Link
            href={backHref}
            className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {backLabel}
          </Link>
        </div>
      </header>

      <section className="container flex flex-1 items-center py-8 lg:py-12">
        <div className="grid w-full overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[1.05fr_1fr]">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-neutral-950 p-10 text-neutral-100 lg:flex xl:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(255,255,255,0.08),transparent_40%)]"
            />
            <div className="relative">
              <p className="mt-2 font-serif text-4xl leading-[1.05] xl:text-5xl">
                Considered goods,
                <br />
                made to keep.
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
                Sign in for faster checkout, order tracking, and a wishlist that follows you.
              </p>
            </div>

            <ul className="relative mt-10 space-y-5">
              {perks.map((perk, i) => (
                <li key={perk.title} className="flex gap-4">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[11px] text-neutral-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-neutral-100">{perk.title}</span>
                    <span className="mt-0.5 block text-sm text-neutral-400">{perk.body}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="relative mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-neutral-500">
              <span className="font-mono uppercase tracking-widest">Secure checkout</span>
              <span className="font-mono uppercase tracking-widest">★ 4.9 · 12k reviews</span>
            </div>
          </div>

          <div className="flex flex-col bg-background p-6 sm:p-10 xl:p-12">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{title}</h1>
              {description && (
                <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</div>
              )}

              <div className={cn('[&_div[class*=my-8]]:my-4')}>
                <RenderParams />
              </div>

              <div className="mt-6">{children}</div>

              {footer && (
                <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">{footer}</div>
              )}
            </div>

            <p className="mx-auto w-full max-w-md text-xs leading-relaxed text-muted-foreground">
              Protected by secure authentication. By continuing you agree to our Terms and Privacy
              Policy.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
