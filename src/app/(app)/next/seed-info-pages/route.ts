import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

import { checkRole } from '@/access/utilities'
import { seedInfoPages } from '@/endpoints/seed/info-pages'

export const maxDuration = 120

// POST /next/seed-info-pages — creates the CMS info pages
// (privacy, terms, returns, about, contact, faq, shipping) when missing.
// Existing pages are never overwritten. Admin only.
export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || !checkRole(['admin'], user)) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const payloadReq = await createLocalReq({ user }, payload)
    void payloadReq

    const result = await seedInfoPages(payload)

    return Response.json({ success: true, ...result })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding info pages' })
    return new Response('Error seeding info pages.', { status: 500 })
  }
}
