import { CMSLink } from '@/components/Link'
import type { Header } from '@/payload-types'

type Props = { quickLinks: NonNullable<Header['quickLinks']> }

export function QuickLinksDropdown({ quickLinks }: Props) {
  const items = quickLinks.slice(0, 3)
  return (
    <div className="p-2 w-[320px] flex flex-col">
      {items.map((item) => (
        <div key={item.id} className="p-3 hover:bg-accent/50 rounded-lg transition-colors">
          <CMSLink {...item.link} className="block text-sm font-semibold hover:underline" />
          <div className="text-sm text-muted-foreground leading-tight mt-0.5">{item.description}</div>
        </div>
      ))}
    </div>
  )
}
