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

const avatarUrls = [
  'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
  'https://notion-avatars.netlify.app/api/avatar?preset=female-2',
  'https://notion-avatars.netlify.app/api/avatar?preset=female-4',
  'https://notion-avatars.netlify.app/api/avatar?preset=male-3',
  'https://notion-avatars.netlify.app/api/avatar?preset=female-5',
]

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
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
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
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:mx-0">{props.description}</p>

            <div className="flex gap-3">
              <Link
                href={props.primaryLink?.url || '/shop'}
                className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-black text-white hover:bg-black/90 border-black gap-1.5 h-12 cursor-pointer px-4 text-base font-medium"
              >
                {props.primaryLink?.label || 'Shop Now'} <span>›</span>
              </Link>
              <Link
                href={props.secondaryLink?.url || '/shop'}
                className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-clip-padding whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 border-border bg-background hover:bg-muted hover:text-foreground gap-1.5 h-12 cursor-pointer px-4 text-base font-medium"
              >
                {props.secondaryLink?.label || 'View Lookbook'}
              </Link>
            </div>

            <div className="pt-2">
              <div className="text-muted-foreground mb-3 text-sm font-medium">{props.trustText}</div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {avatarUrls.map((url, i) => (
                    <span key={i} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-sky-50 shadow-sm">
                      <img src={url} alt="" className="aspect-square size-full rounded-full object-cover" />
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium">{props.trustRating}</span>
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
