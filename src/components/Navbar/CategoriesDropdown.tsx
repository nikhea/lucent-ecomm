import Link from 'next/link'
import type { Category } from '@/payload-types'

type Props = { categories: Category[] }

export function CategoriesDropdown({ categories }: Props) {
  const items = categories.slice(0, 6)
  return (
    <div className="grid grid-cols-2 gap-1 p-4 w-[520px]">
      {items.map((cat) => (
        <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="block p-3 hover:bg-muted rounded-lg transition-colors">
          <div className="text-sm font-semibold">{cat.title}</div>
          <div className="text-sm text-muted-foreground leading-tight mt-0.5 line-clamp-2">{(cat as any).description || `Shop ${cat.title.toLowerCase()} collection.`}</div>
        </Link>
      ))}
    </div>
  )
}
