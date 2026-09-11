import type { CollectionConfig } from 'payload'

import { APIError } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { checkRole } from '@/access/utilities'

type CouponDoc = {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchase?: number | null
  maxDiscount?: number | null
  usageLimit?: number | null
  usedCount: number
  expiresAt?: string | null
  isActive: boolean
  applicableProducts?: (string | { id: string })[]
  applicableCategories?: (string | { id: string })[]
}

export const normalizeCode = (v: unknown) => (typeof v === 'string' ? v.toUpperCase().replace(/\s/g, '') : v)

export const validateCoupon = async (
  coupon: CouponDoc,
  subtotal: number,
  productIds: (string | number)[] = [],
  categoryIds: (string | number)[] = [],
): Promise<true | string> => {
  if (!coupon.isActive) return 'Coupon inactive'
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 'Coupon expired'
  if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return 'Coupon usage limit reached'
  if (coupon.minPurchase && subtotal < coupon.minPurchase) return `Minimum purchase $${coupon.minPurchase} required`
  if (coupon.applicableProducts?.length) {
    const allowed = (coupon.applicableProducts as any[]).map((p) => String(typeof p === 'object' ? p.id : p))
    if (!productIds.map(String).some((id) => allowed.includes(id))) return 'Coupon not applicable to cart products'
  }
  if (coupon.applicableCategories?.length) {
    const allowed = (coupon.applicableCategories as any[]).map((c) => String(typeof c === 'object' ? c.id : c))
    if (!categoryIds.map(String).some((id) => allowed.includes(id))) return 'Coupon not applicable to cart categories'
  }
  return true
}

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    group: 'Ecommerce',
    useAsTitle: 'code',
    defaultColumns: ['code', 'discountType', 'discountValue', 'isActive', 'expiresAt', 'usageLimit', 'usedCount'],
    description: 'Discount codes — upper-cased, validated at checkout',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    update: adminOnly,
    read: ({ req: { user } }) => {
      if (checkRole(['admin'], user as any)) return true
      return { isActive: { equals: true } } as const
    },
  },
  endpoints: [
    {
      path: '/validate',
      method: 'post',
      handler: async (req) => {
        let body: { code?: string; subtotal?: number; productIds?: (string | number)[]; categoryIds?: (string | number)[] }
        try {
          body = (await (req.json?.() as Promise<typeof body>)) ?? {}
        } catch {
          throw new APIError('Invalid JSON body', 400)
        }
        if (!body.code) return Response.json({ valid: false, error: 'code required' }, { status: 400 })

        const code = normalizeCode(body.code) as string
        const res = await req.payload.find({
          collection: 'coupons',
          where: { code: { equals: code } },
          limit: 1,
          depth: 1,
          overrideAccess: true,
          req,
        })
        if (!res.totalDocs) return Response.json({ valid: false, error: 'Invalid coupon' }, { status: 404 })

        const coupon = res.docs[0] as unknown as CouponDoc & { id: string }
        const check = await validateCoupon(coupon, body.subtotal ?? 0, body.productIds ?? [], body.categoryIds ?? [])
        if (check !== true) return Response.json({ valid: false, error: check })

        let discount = 0
        if (coupon.discountType === 'percentage') {
          discount = ((body.subtotal ?? 0) * coupon.discountValue) / 100
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount
        } else {
          discount = coupon.discountValue
        }

        return Response.json({
          valid: true,
          coupon: { id: (coupon as any).id, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
          discount: Math.min(discount, body.subtotal ?? discount),
        })
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.code) data.code = normalizeCode(data.code)
        return data
      },
    ],
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (data?.code && operation === 'create') {
          const code = normalizeCode(data.code) as string
          const existing = await req.payload.find({
            collection: 'coupons',
            where: { code: { equals: code } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          if (existing.totalDocs > 0) throw new APIError('Coupon code already exists', 409)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Uppercase, no spaces (e.g. SAVE20)' },
      hooks: { beforeValidate: [({ value }) => normalizeCode(value)] },
    },
    {
      name: 'discountType',
      type: 'select',
      required: true,
      defaultValue: 'percentage',
      options: [
        { label: 'Percentage (%)', value: 'percentage' },
        { label: 'Fixed (USD)', value: 'fixed' },
      ],
    },
    {
      name: 'discountValue',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'e.g. 20 for 20% or $20' },
      validate: (val: unknown, { data }: any) => {
        const v = val as number
        if (typeof v !== 'number' || Number.isNaN(v)) return 'Required'
        if (v <= 0) return 'Must be greater than 0'
        if (data?.discountType === 'percentage' && v > 100) return 'Percentage cannot exceed 100'
        return true
      },
    },
    { name: 'minPurchase', type: 'number', min: 0, admin: { description: 'Minimum cart subtotal (USD)' } },
    {
      name: 'maxDiscount',
      type: 'number',
      min: 0,
      admin: { description: 'Cap for percentage discounts (USD)', condition: (data) => data?.discountType === 'percentage' },
    },
    { name: 'usageLimit', type: 'number', min: 0, admin: { description: 'Max total uses (0 = unlimited)' } },
    { name: 'usedCount', type: 'number', defaultValue: 0, min: 0, admin: { readOnly: true, description: 'Incremented on order complete' } },
    { name: 'expiresAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'isActive', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'applicableProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { description: 'Empty = all products' },
    },
    {
      name: 'applicableCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { description: 'Empty = all categories' },
    },
  ],
  timestamps: true,
}
