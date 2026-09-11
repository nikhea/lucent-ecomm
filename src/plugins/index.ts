import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { abandonedCartPlugin } from 'payload-abandoned-cart'
import { orderNumbersPlugin } from 'payload-order-numbers'
import { salesReportsPlugin } from 'payload-sales-reports'
import { stockReservationPlugin } from 'payload-stock-reservation'

import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  const siteName = process.env.SITE_NAME || process.env.COMPANY_NAME || 'Store'
  return doc?.title ? `${doc.title} | ${siteName}` : siteName
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()
  if (!doc?.slug) return url
  const collection = (doc as any)?.collection || (doc as any)?.product ? 'products' : null
  if (collection === 'products') return `${url}/products/${doc.slug}`
  return `${url}/${doc.slug}`
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...defaultCollection.fields,
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
        ],
      }),
    },
    payments: {
      paymentMethods: [
        stripeAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY!,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
  stockReservationPlugin({
    ttlSeconds: 600,
    defaultCurrency: 'USD',
    releaseSecret: process.env.STOCK_RESERVATION_SECRET || process.env.PAYLOAD_SECRET || '',
    sweepOnCheckout: true,
  }),
  orderNumbersPlugin({
    prefix: 'ORD-',
    padding: 5,
    startAt: 1000,
  }),
  abandonedCartPlugin({
    idleMinutes: 120,
    steps: [{ delayMinutes: 60 }, { delayMinutes: 1440 }],
    sweepSecret: process.env.ABANDONED_CART_SECRET || process.env.PAYLOAD_SECRET || 'dev-abandoned-cart-secret',
    from: process.env.EMAIL_ADDRESS || `no-reply@${(process.env.NEXT_PUBLIC_SERVER_URL || 'localhost').replace(/^https?:\/\//, '')}`,
    serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  }),
  salesReportsPlugin({
    timeZone: (process.env.SALES_REPORTS_TIMEZONE as any) || 'America/New_York',
    isAdmin: isAdmin as any,
  }),
]
