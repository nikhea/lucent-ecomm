import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Check, Truck, ShieldCheck, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { HeroFashionBlock } from '@/payload-types'

const iconMap: Record<string, React.ReactNode> = {
  check: <Check className="h-4 w-4" />,
  truck: <Truck className="h-4 w-4" />,
  shield: <ShieldCheck className="h-4 w-4" />,
  refresh: <RefreshCw className="h-4 w-4" />,
}

export function HeroFashionBlock(props: HeroFashionBlock) {
  const features = (props.features || []) as any[]

  return (
    <div className="bg-white dark:bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="flex flex-col gap-6 pt-2">
            {props.eyebrow && (
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-xs font-medium bg-muted px-3 py-1.5 rounded-full w-fit hover:bg-muted/80"
              >
                {props.eyebrow} <span>›</span>
              </Link>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-[48px] font-bold leading-[1.05] tracking-tight">
              {(() => {
                const words = (props.title || '').split(' ')
                const lastTwo = words.slice(-2).join(' ')
                const first = words.slice(0, -2).join(' ')
                return (
                  <>
                    {first} <span className="text-muted-foreground font-bold">{lastTwo}</span>
                  </>
                )
              })()}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-[480px] leading-relaxed">{props.description}</p>

            <div className="flex gap-3">
              <Button asChild className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black">
                <Link href={props.primaryLink?.url || '/shop'}>
                  {props.primaryLink?.label || 'Shop Now'} <span className="ml-1">›</span>
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={props.secondaryLink?.url || '/shop'}>{props.secondaryLink?.label || 'View Lookbook'}</Link>
              </Button>
            </div>

            <div className="pt-2">
              <div className="text-xs text-muted-foreground">{props.trustText}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="h-7 w-7 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[10px] overflow-hidden">
                      <span className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-400" />
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium">{props.trustRating}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden h-[50vh] min-h-[380px] max-h-[520px] bg-muted">
              {props.heroImage && typeof props.heroImage === 'object' && (
                <Media resource={props.heroImage} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" fill />
              )}
              {props.badgeText && (
                <div className="absolute top-4 right-4 bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow">
                  {props.badgeText}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {features.slice(0, 4).map((f: any) => (
                <div key={f.id} className="rounded-xl border bg-white dark:bg-card p-4 flex flex-col gap-2">
                  <span className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    {iconMap[f.icon] || <Check className="h-4 w-4" />}
                  </span>
                  <div className="text-xs leading-tight text-muted-foreground">{f.title}</div>
                  <div className="text-xs text-muted-foreground -mt-1">{f.subtitle}</div>
                  <div className="text-sm font-bold mt-1">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
