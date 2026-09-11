import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import './index.css'
import { HeaderClient } from './index.client'

export async function Header() {
  const header = await getCachedGlobal('header', 1)()
  const payload = await getPayload({ config: configPromise })

  const [categoriesRes, collectionsRes, newArrival] = await Promise.all([
    payload.find({ collection: 'categories', limit: 6, sort: 'title', depth: 0, overrideAccess: true }),
    payload.find({ collection: 'shop-collections', where: { status: { equals: 'active' } }, limit: 4, sort: '-featured', depth: 0, overrideAccess: true }),
    payload
      .find({ collection: 'products', where: { _status: { equals: 'published' } }, sort: '-createdAt', limit: 1, depth: 0, overrideAccess: true })
      .then((r) => r.docs[0] || null),
  ])

  return <HeaderClient header={header} categories={categoriesRes.docs as any} collections={collectionsRes.docs as any} newArrivalProduct={newArrival as any} />
}
