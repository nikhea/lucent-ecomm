import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'

import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { Coupons } from '@/collections/Coupons'
import { Media } from '@/collections/Media'
import { Notifications } from '@/collections/Notifications'
import { Pages } from '@/collections/Pages'
import { Reviews } from '@/collections/Reviews'
import { CustomerProfiles } from '@/collections/CustomerProfiles'
import { ShopCollections } from '@/collections/ShopCollections'
import { Users } from '@/collections/Users'
import { Wishlist } from '@/collections/Wishlist'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import {
  cloudinaryAdapter,
  cloudinaryFolder,
  generateCloudinaryURL,
  hasCloudinaryEnv,
  sharp,
} from '@/lib/cloudinary'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
    },
    user: Users.slug,
  },
  collections: [Users, CustomerProfiles, Pages, Categories, Media, ShopCollections, Wishlist, Reviews, Notifications, Coupons],
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
    useJoinAggregations: false,
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  email:
    process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD !== 'your_gmail_app_password'
      ? nodemailerAdapter({
          defaultFromAddress: process.env.EMAIL_ADDRESS || 'homzngauth@gmail.com',
          defaultFromName: process.env.COMPANY_NAME || 'Lucent',
          transportOptions: {
            service: (process.env.EMAIL_SERVICE || 'gmail').toLowerCase(),
            auth: {
              user: process.env.EMAIL_ADDRESS || 'homzngauth@gmail.com',
              pass: process.env.EMAIL_PASSWORD || '',
            },
          },
        })
      : undefined,
  endpoints: [],
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    ...(hasCloudinaryEnv
      ? [
          cloudStoragePlugin({
            collections: {
              media: {
                adapter: cloudinaryAdapter as any,
                disableLocalStorage: true,
                generateFileURL: ({ filename }: any) => generateCloudinaryURL(filename),
              },
            },
          }),
        ]
      : []),
  ],
  secret: (() => {
    const s = process.env.PAYLOAD_SECRET
    if (!s || s.length < 32) {
      if (process.env.NODE_ENV === 'production') throw new Error('PAYLOAD_SECRET must be 32+ chars in production')
      return s || 'dev-secret-replace-in-production-32chars!!'
    }
    return s
  })(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp,
})
