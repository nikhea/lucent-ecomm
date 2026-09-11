import { ReviewsClient } from './Component.client'
import type { ReviewsBlock as ReviewsBlockType } from '@/payload-types'

type Props = ReviewsBlockType

export function ReviewsBlock(props: Props) {
  return (
    <div className="bg-black text-white py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          {props.eyebrow && <div className="text-xs tracking-[0.2em] text-neutral-400 mb-3">{props.eyebrow}</div>}
          <h2 className="text-2xl md:text-3xl font-bold">{props.title}</h2>
          {props.subtitle && <p className="mt-3 text-sm text-neutral-400">{props.subtitle}</p>}
        </div>
        <div className="mt-10">
          <ReviewsClient items={props.items as any} />
        </div>
      </div>
    </div>
  )
}
