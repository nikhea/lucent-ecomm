import type { Payload } from 'payload'
import { RequiredDataFromCollectionSlug } from 'payload'

type LexNode = Record<string, unknown>

const t = (text: string, bold = false): LexNode => ({
  type: 'text',
  detail: 0,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const para = (...runs: LexNode[]): LexNode => ({
  type: 'paragraph',
  children: runs.length ? runs : [t('')],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

const heading = (tag: 'h1' | 'h2' | 'h3', text: string): LexNode => ({
  type: 'heading',
  children: [t(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

const bullets = (items: string[]): LexNode => ({
  type: 'list',
  children: items.map((item) => ({
    type: 'listitem',
    children: [t(item)],
    direction: 'ltr',
    format: '',
    indent: 0,
    value: 1,
    version: 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  version: 1,
})

const doc = (...children: LexNode[]): LexNode => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

const contentBlock = (...nodes: LexNode[]) => ({
  blockType: 'content' as const,
  columns: [
    {
      size: 'full' as const,
      richText: doc(...nodes) as any,
    },
  ],
})

const hero = (title: string, intro: string) => ({
  type: 'lowImpact' as const,
  richText: doc(heading('h1', title), para(t(intro))) as any,
})

type InfoPage = {
  slug: string
  title: string
  description: string
  data: () => RequiredDataFromCollectionSlug<'pages'>
}

const LAST_UPDATED = 'Last updated: September 2026.'

const privacyPolicy: InfoPage = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  description: 'How LUCENT collects, uses, and protects your personal information.',
  data: () => ({
    slug: 'privacy-policy',
    _status: 'published',
    title: 'Privacy Policy',
    hero: hero(
      'Privacy Policy',
      'Your privacy matters. This policy explains what data we collect, how we use it, and the choices you have.',
    ),
    layout: [
      contentBlock(
        para(t(LAST_UPDATED)),
        heading('h2', '1. Information we collect'),
        para(
          t(
            'We collect information you provide directly — such as your name, email address, shipping address, and payment details when you place an order or create an account — as well as information collected automatically, including device data, browsing activity, and cookies that help us operate and improve the store.',
          ),
        ),
        heading('h2', '2. How we use your information'),
        bullets([
          'Process and fulfil orders, including payment, shipping, and returns.',
          'Provide customer support and communicate about your purchases.',
          'Personalise your shopping experience and recommend relevant products.',
          'Send marketing messages where you have consented — you can opt out at any time.',
          'Detect fraud, enforce our terms, and comply with legal obligations.',
        ]),
        heading('h2', '3. Sharing your information'),
        para(
          t(
            'We share data only with trusted service providers who help us run the store — payment processors, delivery carriers, and analytics or email platforms — under strict contractual safeguards. We never sell your personal information.',
          ),
        ),
        heading('h2', '4. Cookies'),
        para(
          t(
            'We use essential cookies to keep your cart and session working, and optional analytics cookies to understand store performance. You can control cookies through your browser settings; disabling essential cookies may affect checkout.',
          ),
        ),
        heading('h2', '5. Data security and retention'),
        para(
          t(
            'We protect your data with encryption in transit, access controls, and secure payment processing (we never store full card numbers). We retain order records as required by tax and accounting law, and account data until you ask us to delete it.',
          ),
        ),
        heading('h2', '6. Your rights'),
        para(
          t(
            'Depending on your location, you may request access, correction, deletion, or portability of your personal data, and object to certain processing. Contact us at the address below and we will respond within 30 days.',
          ),
        ),
        heading('h2', '7. Contact us'),
        para(
          t(
            'For privacy questions or requests, email support@lucent.com or write to LUCENT, 123 Commerce Street, New York, NY 10001.',
          ),
        ),
      ),
    ],
    meta: {
      title: 'Privacy Policy | LUCENT',
      description: 'How LUCENT collects, uses, and protects your personal information.',
    },
  }),
}

const termsOfService: InfoPage = {
  slug: 'terms-of-service',
  title: 'Terms of Service',
  description: 'The terms governing purchases and use of the LUCENT store.',
  data: () => ({
    slug: 'terms-of-service',
    _status: 'published',
    title: 'Terms of Service',
    hero: hero(
      'Terms of Service',
      'Please read these terms carefully — they govern your purchases and use of the LUCENT store.',
    ),
    layout: [
      contentBlock(
        para(t(LAST_UPDATED)),
        heading('h2', '1. About these terms'),
        para(
          t(
            'By accessing this store or placing an order, you agree to these Terms of Service. If you do not agree, please do not use the store. We may update these terms from time to time; continued use after changes take effect constitutes acceptance.',
          ),
        ),
        heading('h2', '2. Products and pricing'),
        para(
          t(
            'We work hard to display products, colours, and prices accurately, but minor variations may occur. Prices are shown in the selected currency and exclude any applicable taxes or duties calculated at checkout. We reserve the right to correct errors and cancel affected orders with a full refund.',
          ),
        ),
        heading('h2', '3. Orders and payment'),
        para(
          t(
            'An order is confirmed once payment is authorised and you receive a confirmation email. We may decline or cancel orders for suspected fraud, stock issues, or pricing errors. Title to goods passes on delivery; risk passes according to the chosen shipping terms.',
          ),
        ),
        heading('h2', '4. Accounts'),
        para(
          t(
            'You are responsible for keeping your account credentials confidential and for all activity under your account. You must be at least 18 years old, or have parental consent, to make a purchase.',
          ),
        ),
        heading('h2', '5. Acceptable use'),
        bullets([
          'Do not misuse the store, interfere with its operation, or attempt unauthorised access.',
          'Do not submit false, misleading, or unlawful content through reviews, forms, or accounts.',
          'Do not infringe our intellectual property or that of any third party.',
        ]),
        heading('h2', '6. Intellectual property'),
        para(
          t(
            'All store content — including branding, imagery, and copy — is owned by LUCENT or its licensors and protected by law. You may not reproduce or exploit it without written permission.',
          ),
        ),
        heading('h2', '7. Limitation of liability'),
        para(
          t(
            'To the maximum extent permitted by law, LUCENT is not liable for indirect or consequential losses arising from use of the store. Our total liability for any claim is limited to the value of the order in question. Nothing in these terms limits rights you have as a consumer that cannot be waived.',
          ),
        ),
        heading('h2', '8. Governing law'),
        para(
          t(
            'These terms are governed by the laws of the State of New York, without regard to conflict-of-law rules. Disputes will be resolved in the courts of New York County where permitted.',
          ),
        ),
      ),
    ],
    meta: {
      title: 'Terms of Service | LUCENT',
      description: 'The terms governing purchases and use of the LUCENT store.',
    },
  }),
}

const returnsPage: InfoPage = {
  slug: 'returns',
  title: 'Returns',
  description: 'Our 30-day return policy: how to return, exchange, or get a refund.',
  data: () => ({
    slug: 'returns',
    _status: 'published',
    title: 'Returns',
    hero: hero(
      'Returns & Refunds',
      'Changed your mind? You have 30 days to return any unworn item for a full refund — no questions asked.',
    ),
    layout: [
      contentBlock(
        heading('h2', 'Our promise'),
        para(
          t(
            'Every order is covered by a 30-day return window starting on the delivery date. Items must be unworn, unwashed, and in original condition with tags attached. Final-sale items are clearly marked and excluded.',
          ),
        ),
        heading('h2', 'How to start a return'),
        bullets([
          'Sign in to your account and open the order you want to return.',
          'Select the items and tell us whether you want a refund or an exchange.',
          'Print the prepaid return label and drop the parcel with the carrier.',
        ]),
        heading('h2', 'Refunds'),
        para(
          t(
            'Once your return arrives and passes inspection, we refund the original payment method within 5–10 business days. Shipping fees are refunded only for faulty or incorrect items. You will receive email updates at every step.',
          ),
        ),
        heading('h2', 'Exchanges'),
        para(
          t(
            'Need a different size or colour? Choose “exchange” when starting your return and we will ship the replacement as soon as the carrier scans your parcel — you will not be charged twice.',
          ),
        ),
        heading('h2', 'Faulty or incorrect items'),
        para(
          t(
            'If your order arrives damaged, defective, or wrong, contact support@lucent.com within 30 days with photos and your order number. We will arrange a free return and send a replacement or full refund immediately.',
          ),
        ),
      ),
    ],
    meta: {
      title: 'Returns & Refunds | LUCENT',
      description: 'Our 30-day return policy: how to return, exchange, or get a refund.',
    },
  }),
}

const aboutPage: InfoPage = {
  slug: 'about-us',
  title: 'About Us',
  description: 'The LUCENT story: considered goods, made to keep.',
  data: () => ({
    slug: 'about-us',
    _status: 'published',
    title: 'About Us',
    hero: hero(
      'Considered goods, made to keep',
      'LUCENT is a modern essentials label built on a simple belief: buy fewer, better things.',
    ),
    layout: [
      contentBlock(
        heading('h2', 'Our story'),
        para(
          t(
            'Founded in 2023, LUCENT began with a single perfect T-shirt and a stubborn obsession with fabric, fit, and finish. Today we design a focused range of wardrobe staples — each piece refined over dozens of prototypes and made to be worn for years, not seasons.',
          ),
        ),
        heading('h2', 'What we stand for'),
        bullets([
          'Quality over quantity — small collections, rigorously tested materials.',
          'Honest pricing — no inflated markups, no perpetual “sales”.',
          'Responsibility — recycled packaging and partners audited for fair labour.',
          'Longevity — free repairs for the first year on every garment.',
        ]),
        heading('h2', 'Our craft'),
        para(
          t(
            'We work directly with family-run mills and workshops, visiting every partner in person. Fabrics are pre-shrunk, seams are reinforced, and every batch is inspected by hand before it ships. If a piece does not meet the standard, it never reaches the shelf.',
          ),
        ),
        heading('h2', 'Visit or talk to us'),
        para(
          t(
            'Our flagship studio is at 123 Commerce Street, New York, open Monday to Saturday, 10am–7pm. Prefer to write? Reach us at hello@lucent.com — a real person replies within one business day.',
          ),
        ),
      ),
    ],
    meta: {
      title: 'About Us | LUCENT',
      description: 'The LUCENT story: considered goods, made to keep.',
    },
  }),
}

const contactPage: InfoPage = {
  slug: 'contact',
  title: 'Contact',
  description: 'Get in touch with the LUCENT team — we reply within one business day.',
  data: () => ({
    slug: 'contact',
    _status: 'published',
    title: 'Contact',
    hero: hero(
      'Talk to us',
      'Questions about an order, a product, or a return? Send a message — we reply within one business day.',
    ),
    layout: [
      contentBlock(
        heading('h2', 'Other ways to reach us'),
        bullets([
          'Email: support@lucent.com (orders, shipping, returns).',
          'Phone: +1 (212) 555-0147, Monday to Friday, 9am–6pm ET.',
          'Studio: 123 Commerce Street, New York, NY 10001.',
        ]),
      ),
    ],
    meta: {
      title: 'Contact | LUCENT',
      description: 'Get in touch with the LUCENT team — we reply within one business day.',
    },
  }),
}

const faqPage: InfoPage = {
  slug: 'faq',
  title: 'FAQ',
  description: 'Answers to the questions our customers ask most.',
  data: () => ({
    slug: 'faq',
    _status: 'published',
    title: 'FAQ',
    hero: hero(
      'Frequently Asked Questions',
      'Quick answers on orders, shipping, returns, sizing, and accounts.',
    ),
    layout: [
      contentBlock(
        heading('h2', 'Orders & payment'),
        heading('h3', 'How do I track my order?'),
        para(
          t(
            'Sign in and open your account to see live tracking for every order. You will also receive tracking emails when your parcel ships and when it is out for delivery.',
          ),
        ),
        heading('h3', 'Which payment methods do you accept?'),
        para(
          t(
            'We accept all major credit and debit cards, Apple Pay, Google Pay, and PayPal — all processed over encrypted connections. We never store full card numbers.',
          ),
        ),
        heading('h3', 'Can I change or cancel my order?'),
        para(
          t(
            'Orders can be changed or cancelled within 12 hours of purchase from your account page. After that the parcel is usually already packed — but our 30-day returns have you covered.',
          ),
        ),
        heading('h2', 'Shipping'),
        heading('h3', 'How long does delivery take?'),
        para(
          t(
            'Standard delivery takes 3–5 business days and is free over $75. Express delivery (1–2 business days) is available at checkout. International delivery times vary by destination — see our Shipping Info page.',
          ),
        ),
        heading('h3', 'Do you ship internationally?'),
        para(
          t(
            'Yes — we ship to over 40 countries. Duties and taxes for international orders are calculated at checkout so there are no surprises on delivery.',
          ),
        ),
        heading('h2', 'Returns & exchanges'),
        heading('h3', 'What is your return policy?'),
        para(
          t(
            'Unworn items can be returned within 30 days of delivery for a full refund, with a free prepaid label. Exchanges for a different size or colour ship as soon as the carrier scans your return.',
          ),
        ),
        heading('h2', 'Sizing & products'),
        heading('h3', 'How do LUCENT clothes fit?'),
        para(
          t(
            'Our fits are true to size with a slightly relaxed cut. Each product page includes detailed measurements — when in doubt, we recommend taking your usual size.',
          ),
        ),
        heading('h3', 'How do I care for my garments?'),
        para(
          t(
            'Machine wash cold with like colours and hang to dry to keep fabrics at their best. Full care instructions are printed on every garment label.',
          ),
        ),
        heading('h2', 'Accounts'),
        heading('h3', 'Do I need an account to order?'),
        para(
          t(
            'No — guest checkout is always available. An account simply gives you faster checkout, order tracking, and a synced wishlist.',
          ),
        ),
      ),
    ],
    meta: {
      title: 'FAQ | LUCENT',
      description: 'Answers to the questions our customers ask most.',
    },
  }),
}

const shippingPage: InfoPage = {
  slug: 'shipping-info',
  title: 'Shipping Info',
  description: 'Delivery options, rates, timeframes, and tracking information.',
  data: () => ({
    slug: 'shipping-info',
    _status: 'published',
    title: 'Shipping Info',
    hero: hero(
      'Shipping Information',
      'Fast, tracked delivery — free standard shipping on all orders over $75.',
    ),
    layout: [
      contentBlock(
        heading('h2', 'Delivery options'),
        bullets([
          'Standard (3–5 business days): $4.95, free on orders over $75.',
          'Express (1–2 business days): $12.95, order by 2pm ET for same-day dispatch.',
          'International (5–12 business days): calculated at checkout by destination.',
        ]),
        heading('h2', 'Processing time'),
        para(
          t(
            'Orders placed before 2pm ET ship the same business day; later orders ship the next business day. During sales or holidays, please allow one extra day for packing.',
          ),
        ),
        heading('h2', 'Tracking'),
        para(
          t(
            'Every parcel is tracked door to door. Find live tracking in your account or in the shipping confirmation email. If tracking stalls for more than 5 days, contact us and we will investigate with the carrier.',
          ),
        ),
        heading('h2', 'International orders'),
        para(
          t(
            'We ship to over 40 countries with duties and taxes calculated at checkout — the price you pay is the final price. Delivery takes 5–12 business days depending on destination and customs clearance.',
          ),
        ),
        heading('h2', 'Delays, lost parcels & wrong addresses'),
        para(
          t(
            'If your parcel is lost, arrives damaged, or you entered the wrong address, email support@lucent.com with your order number within 30 days. Lost parcels are replaced or refunded; address corrections are possible only before dispatch.',
          ),
        ),
      ),
    ],
    meta: {
      title: 'Shipping Info | LUCENT',
      description: 'Delivery options, rates, timeframes, and tracking information.',
    },
  }),
}

const infoPages: InfoPage[] = [
  privacyPolicy,
  termsOfService,
  returnsPage,
  aboutPage,
  contactPage,
  faqPage,
  shippingPage,
]

export type SeedInfoPagesResult = {
  created: string[]
  skipped: string[]
  footerUpdated: boolean
}

export const seedInfoPages = async (payload: Payload): Promise<SeedInfoPagesResult> => {
  const created: string[] = []
  const skipped: string[] = []

  for (const page of infoPages) {
    const existing = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      where: { slug: { equals: page.slug } },
    })

    if (existing.docs.length > 0) {
      skipped.push(page.slug)
      continue
    }

    const data = page.data()

    if (page.slug === 'contact') {
      try {
        const forms = await payload.find({
          collection: 'forms',
          limit: 1,
          pagination: false,
          sort: 'createdAt',
        })
        const form = forms.docs?.[0]
        if (form) {
          ;(data as Record<string, unknown>).layout = [
            ...(data.layout as unknown[]),
            {
              blockType: 'formBlock',
              enableIntro: true,
              form: form.id,
              introContent: doc(heading('h3', 'Send us a message')) as any,
            },
          ]
        }
      } catch {
        // content-only contact page is fine
      }
    }

    await payload.create({
      collection: 'pages',
      data,
      depth: 0,
      context: {
        disableRevalidate: true,
      },
    })
    created.push(page.slug)
  }

  let footerUpdated = false
  try {
    const footer = (await payload.findGlobal({ slug: 'footer', depth: 0 })) as unknown as Record<
      string,
      unknown
    >
    const quickLinks = (footer?.quickLinks as unknown[] | undefined) || []
    const legalLinks = (footer?.legalLinks as unknown[] | undefined) || []

    if (quickLinks.length === 0 || legalLinks.length === 0) {
      const linkOf = (label: string, url: string) => ({
        link: { type: 'custom' as const, label, url },
      })
      await payload.updateGlobal({
        slug: 'footer',
        data: {
          ...(quickLinks.length === 0
            ? {
                quickLinks: [
                  linkOf('About Us', '/about-us'),
                  linkOf('Contact', '/contact'),
                  linkOf('FAQ', '/faq'),
                  linkOf('Shipping Info', '/shipping-info'),
                ],
              }
            : {}),
          ...(legalLinks.length === 0
            ? {
                legalLinks: [
                  linkOf('Privacy Policy', '/privacy-policy'),
                  linkOf('Terms of Service', '/terms-of-service'),
                  linkOf('Returns', '/returns'),
                ],
              }
            : {}),
        } as any,
        depth: 0,
      })
      footerUpdated = true
    }
  } catch {
    // footer stays as-is; component defaults cover the links
  }

  payload.logger.info(
    `Seeded info pages — created: [${created.join(', ')}], skipped: [${skipped.join(', ')}]`,
  )

  return { created, skipped, footerUpdated }
}
