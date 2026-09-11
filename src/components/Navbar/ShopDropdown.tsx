import Link from 'next/link'
import type { Product, ShopCollection } from '@/payload-types'

type Props = {
  collections: ShopCollection[]
  newArrivalProduct?: Product | null
}

export function ShopDropdown({ collections, newArrivalProduct }: Props) {
  const featured = collections.find((c) => c.slug === 'new-arrivals') || collections[0]
  const others = collections.filter((c) => c.id !== featured?.id).slice(0, 3)

  return (
    <div className="flex min-h-[280px]">
      <Link
        href={featured ? `/shop?collection=${featured.slug}` : '/shop'}
        className="w-[200px] bg-muted flex flex-col justify-end p-4 hover:bg-muted/80 transition-colors"
      >
        <div className="text-sm font-semibold">{featured?.title || newArrivalProduct?.title || 'New Arrivals'}</div>
        <div className="text-sm text-muted-foreground mt-1 line-clamp-3">
          {featured?.excerpt || newArrivalProduct?.title ? `Discover the styles in our latest collection.` : 'Discover our latest styles.'}
        </div>
        {newArrivalProduct && (
          <div className="mt-3 text-xs font-medium text-primary">View product →</div>
        )}
      </Link>
      <div className="flex-1 p-4 flex flex-col gap-4 min-w-[340px]">
        {others.length ? (
          others.map((col) => (
            <Link key={col.id} href={`/shop?collection=${col.slug}`} className="block hover:bg-muted rounded-lg p-3 -m-3 transition-colors">
              <div className="text-sm font-semibold">{col.title}</div>
              <div className="text-sm text-muted-foreground leading-tight mt-0.5 line-clamp-2">{col.excerpt || ''}</div>
            </Link>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No collections</div>
        )}
      </div>
    </div>
  )
}
