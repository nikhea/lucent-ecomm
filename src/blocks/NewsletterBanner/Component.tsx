import { NewsletterBannerClient } from './Component.client'
import type { NewsletterBannerBlock } from '@/payload-types'

type Props = NewsletterBannerBlock

export function NewsletterBannerBlock(props: Props) {
  return (
    <div className="bg-green-600 dark:bg-green-700">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{props.title}</h2>
        <p className="mt-3 text-sm md:text-base text-green-50 max-w-2xl mx-auto leading-relaxed">{props.description}</p>
        <div className="mt-6 max-w-md mx-auto">
          <NewsletterBannerClient placeholder={props.placeholder || 'Enter your email address'} buttonLabel={props.buttonLabel || 'Subscribe Now'} />
        </div>
        {props.disclaimer && <p className="mt-3 text-xs text-green-200">{props.disclaimer}</p>}
      </div>
    </div>
  )
}
