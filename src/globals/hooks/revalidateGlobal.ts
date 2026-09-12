import { revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateGlobal: GlobalAfterChangeHook = ({ global }) => {
  try {
    revalidateTag(`global_${global.slug}`, 'max')
  } catch {
    // runs outside Next.js runtime (e.g. local scripts) — safe to ignore
  }
  return undefined as never
}
