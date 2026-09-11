import Link from 'next/link'
import React from 'react'

type Props = {
  productTitle: string
  categories?: { title: string; slug: string }[]
}

export function Breadcrumbs({ productTitle, categories }: Props) {
  const cat = categories?.[0]
  return (
    <nav className="text-xs text-muted-foreground flex items-center gap-1.5">
      <Link href="/shop" className="hover:text-foreground">
        Shop
      </Link>
      <span>›</span>
      {cat && (
        <>
          <Link href={`/shop?category=${cat.slug}`} className="hover:text-foreground">
            {cat.title}
          </Link>
          <span>›</span>
        </>
      )}
      <Link href="/shop" className="hover:text-foreground">
        {cat ? cat.title : 'Products'}
      </Link>
      <span>›</span>
      <span className="text-foreground">{productTitle}</span>
    </nav>
  )
}
