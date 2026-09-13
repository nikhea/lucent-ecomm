import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import {
  button,
  buttonWrap,
  eyebrow,
  footerLinks,
  footerNote,
  headline,
  palette,
  fonts,
  subcopy,
  wordmark,
} from './theme'

export type OrderConfirmationItem = {
  title: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

type OrderConfirmationEmailProps = {
  orderNumber: string
  orderUrl: string
  companyName?: string
  items: OrderConfirmationItem[]
  total: string
  customerEmail?: string
  shippingLines?: string[]
}

export default function OrderConfirmationEmail({
  orderNumber,
  orderUrl,
  companyName = 'LUCENT',
  items,
  total,
  customerEmail,
  shippingLines,
}: OrderConfirmationEmailProps) {
  const address = (shippingLines || []).filter(Boolean)
  return (
    <Html>
      <Head />
      <Preview>Your {companyName} order {orderNumber} is confirmed</Preview>
      <Body style={body}>
        <Container style={outer}>
          <Section style={hero}>
            <Text style={wordmark}>{companyName}</Text>
            <Text style={heroEyebrow}>Order {orderNumber} · Confirmed</Text>
            <Heading style={headline}>Thank you, it&apos;s on its way to you.</Heading>
            <Text style={subcopy}>
              {customerEmail ? `A receipt is on its way to ${customerEmail}. ` : ''}We&apos;ll email
              you again the moment your pieces ship.
            </Text>
            <Section style={buttonWrap}>
              <Button style={button} href={orderUrl}>
                Track your order
              </Button>
            </Section>
          </Section>
          <Section style={card}>
            <Text style={sectionTitle}>Your pieces</Text>
            {items.map((item, i) => (
              <Section key={i}>
                {i > 0 && <Hr style={hr} />}
                <Row>
                  <Column style={itemCol}>
                    <Text style={itemTitle}>{item.title}</Text>
                    <Text style={muted}>
                      Qty {item.quantity}
                      {item.unitPrice ? ` · ${item.unitPrice} each` : ''}
                    </Text>
                  </Column>
                  <Column style={priceCol}>
                    <Text style={itemPrice}>{item.lineTotal}</Text>
                  </Column>
                </Row>
              </Section>
            ))}
            <Hr style={hrFull} />
            <Row>
              <Column>
                <Text style={totalLabel}>Order total</Text>
              </Column>
              <Column style={priceCol}>
                <Text style={totalValue}>{total}</Text>
              </Column>
            </Row>
            <Text style={shipNote}>Complimentary shipping · Arrives in 2–3 days</Text>
            {address.length > 0 && (
              <Section style={addressBox}>
                <Text style={addressTitle}>Shipping to</Text>
                {address.map((line, i) => (
                  <Text key={i} style={addressLine}>
                    {line}
                  </Text>
                ))}
              </Section>
            )}
          </Section>
          <Section style={foot}>
            <Text style={footerNote}>
              Questions about fit or delivery? Reply to this email or visit{' '}
              <Link style={footerLinks} href={orderUrl}>
                your order page
              </Link>
              .
            </Text>
            <Text style={brand}>© {companyName}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

OrderConfirmationEmail.PreviewProps = {
  orderNumber: 'ORD-01001',
  orderUrl: 'http://localhost:3000/orders/123?email=you@example.com&accessToken=demo',
  items: [
    { title: 'Liora Satin Wrap Blouse', quantity: 1, unitPrice: '$64.99', lineTotal: '$64.99' },
    { title: 'Nova Bodycon Maxi Dress', quantity: 1, unitPrice: '$99.99', lineTotal: '$99.99' },
  ],
  total: '$164.98',
  customerEmail: 'you@example.com',
  shippingLines: ['Jane Doe', '123 Commerce Street', 'New York, NY 10001'],
} satisfies OrderConfirmationEmailProps

const body = {
  backgroundColor: palette.page,
  fontFamily: fonts.sans,
  padding: '32px 0',
}

const outer = {
  margin: '0 auto',
  maxWidth: '580px',
}

const hero = {
  backgroundColor: palette.blush,
  borderRadius: '16px 16px 0 0',
  padding: '40px 40px 36px',
}

const heroEyebrow = {
  ...eyebrow,
  margin: '20px 0 12px',
}

const card = {
  backgroundColor: palette.card,
  borderRadius: '0 0 16px 16px',
  padding: '32px 40px',
}

const sectionTitle = {
  color: palette.taupe,
  fontFamily: fonts.sans,
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.25em',
  margin: '0 0 16px',
  textTransform: 'uppercase' as const,
}

const itemCol = {
  verticalAlign: 'top' as const,
}

const priceCol = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
  width: '110px',
}

const itemTitle = {
  color: palette.ink,
  fontFamily: fonts.serif,
  fontSize: '16px',
  margin: '0 0 4px',
}

const itemPrice = {
  color: palette.ink,
  fontFamily: fonts.sans,
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
}

const muted = {
  color: palette.muted,
  fontFamily: fonts.sans,
  fontSize: '12px',
  margin: '0',
}

const hr = {
  borderColor: palette.hairline,
  margin: '16px 0',
}

const hrFull = {
  borderColor: palette.ink,
  borderWidth: '1px',
  margin: '20px 0 16px',
}

const totalLabel = {
  color: palette.ink,
  fontFamily: fonts.sans,
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
}

const totalValue = {
  color: palette.ink,
  fontFamily: fonts.serif,
  fontSize: '22px',
  margin: '0',
}

const shipNote = {
  color: palette.taupe,
  fontFamily: fonts.sans,
  fontSize: '12px',
  fontStyle: 'italic',
  margin: '12px 0 0',
  textAlign: 'center' as const,
}

const addressBox = {
  backgroundColor: palette.page,
  borderRadius: '12px',
  marginTop: '20px',
  padding: '20px 24px',
}

const addressTitle = {
  color: palette.taupe,
  fontFamily: fonts.sans,
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.25em',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const addressLine = {
  color: palette.body,
  fontFamily: fonts.sans,
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const foot = {
  padding: '24px 40px 8px',
}

const brand = {
  color: palette.taupe,
  fontFamily: fonts.sans,
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.3em',
  margin: '16px 0 0',
  textAlign: 'center' as const,
}
