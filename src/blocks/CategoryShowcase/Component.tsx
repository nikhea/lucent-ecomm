import { Media } from '@/components/Media'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { CategoryShowcaseBlock } from '@/payload-types'

export function CategoryShowcaseBlock(props: CategoryShowcaseBlock) {
  const items = (props.items || []) as any[]

  return (
    <div className="bg-white dark:bg-background py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          {props.eyebrow && (
            <div className="inline-flex items-center gap-1 text-xs font-medium border rounded-full px-3 py-1.5 bg-white">
              <span className="opacity-60">✦</span> {props.eyebrow}
            </div>
          )}
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-tight">
            {props.title?.split(' ').slice(0, 3).join(' ')} <br />
            {props.title?.split(' ').slice(3).join(' ')}
          </h2>
          {props.subtitle && <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">{props.subtitle}</p>}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.slice(0, 4).map((item: any) => (
            <Link key={item.id} href={item.link?.url || '/shop'} className="group relative overflow-hidden rounded-xl h-[380px] block bg-muted">
              {item.image && typeof item.image === 'object' && (
                <Media
                  resource={item.image}
                  className="absolute inset-0 h-full w-full"
                  imgClassName="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  fill
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="text-xs text-white/70">{item.count}</div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
