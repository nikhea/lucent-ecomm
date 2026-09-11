import { Media } from '@/components/Media'
import Link from 'next/link'
import type { PromoGridBlock } from '@/payload-types'

type Props = PromoGridBlock

export function PromoGridBlock(props: Props) {
  const items = (props.items || []) as any[]
  const top = items.slice(0, 3)
  const bottom = items[3]

  return (
    <div className="bg-[#0a0a0a] py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top.map((item: any) => (
            <Link key={item.id} href={item.link?.url || '/shop'} className="group relative overflow-hidden rounded-xl h-[420px] block">
              {item.image && typeof item.image === 'object' && (
                <Media resource={item.image} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover grayscale group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="text-xs tracking-widest text-white/80 mb-2">{item.eyebrow}</div>
                <div className="text-lg font-semibold text-white leading-tight">{item.title}</div>
                <div className="text-xs text-white/80 mt-3 underline-offset-4 group-hover:underline">{item.linkLabel}</div>
              </div>
            </Link>
          ))}
        </div>
        {bottom && (
          <Link href={bottom.link?.url || '/shop'} className="group relative overflow-hidden rounded-xl h-[420px] md:h-[480px] block mt-4">
            {bottom.image && typeof bottom.image === 'object' && (
              <Media resource={bottom.image} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover grayscale group-hover:scale-105 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="text-xs tracking-widest text-white/80 mb-3">{bottom.eyebrow}</div>
              <div className="text-2xl md:text-3xl font-bold text-white">{bottom.title}</div>
              <div className="text-xs text-white/90 mt-4 underline-offset-4 group-hover:underline">{bottom.linkLabel}</div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
