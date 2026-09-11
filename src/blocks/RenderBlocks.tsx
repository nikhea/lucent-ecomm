import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ThreeItemGridBlock } from '@/blocks/ThreeItemGrid/Component'
import { NewsletterBannerBlock } from '@/blocks/NewsletterBanner/Component'
import { ReviewsBlock } from '@/blocks/Reviews/Component'
import { PromoGridBlock } from '@/blocks/PromoGrid/Component'
import { HeroFashionBlock } from '@/blocks/HeroFashion/Component'
import { CategoryShowcaseBlock } from '@/blocks/CategoryShowcase/Component'
import { toKebabCase } from '@/utilities/toKebabCase'
import React, { Fragment } from 'react'

import type { Page } from '../payload-types'

const blockComponents = {
  archive: ArchiveBlock,
  banner: BannerBlock,
  carousel: CarouselBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  threeItemGrid: ThreeItemGridBlock,
  newsletterBanner: NewsletterBannerBlock,
  reviews: ReviewsBlock,
  promoGrid: PromoGridBlock,
  heroFashion: HeroFashionBlock,
  categoryShowcase: CategoryShowcaseBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              const isFullBleed = blockType === 'newsletterBanner' || blockType === 'reviews' || blockType === 'promoGrid' || blockType === 'heroFashion' || blockType === 'categoryShowcase'
              return (
                <div className={isFullBleed ? '' : 'my-16'} key={index}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore - weird type mismatch here */}
                  <Block id={toKebabCase(blockName!)} {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
