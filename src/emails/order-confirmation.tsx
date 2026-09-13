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

function formatFallback(lines?: string[]) {
  return (lines || []).filter(Boolean)
}

export default function OrderConfirmationEmail({
  orderNumber,
  orderUrl,
  companyName = 'Lucent',
  items,
  total,
  customerEmail,
  shippingLines,
}: OrderConfirmationEmailProps) {
  const address = formatFallback(shippingLines)
  return (
    <Html>
      <Head />
      <Preview>
        Your {companyName} order {orderNumber} is confirmed
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Thanks for your order!</Heading>
          <Text style={text}>
            Order {orderNumber} is confirmed{customerEmail ? ` for ${customerEmail}` : ''}. We will
            email you again when it ships.
          </Text>
          <Section style={btnWrap}>
            <Button style={btn} href={orderUrl}>
              View order {orderNumber}
            </Button>
          </Section>
          <Hr style={hr} />
          <Heading as="h2" style={h2}>
            Order summary
          </Heading>
          {items.map((item, i) => (
            <Row key={i} style={row}>
              <Column style={itemCol}>
                <Text style={itemTitle}>{item.title}</Text>
                <Text style={muted}>Qty {item.quantity}</Text>
              </Column>
              <Column style={priceCol}>
                <Text style={itemPrice}>{item.lineTotal}</Text>
                <Text style={muted}>{item.unitPrice} each</Text>
              </Column>
            </Row>
          ))}
          <Hr style={hr} />
          <Row>
            <Column>
              <Text style={totalLabel}>Total</Text>
            </Column>
            <Column style={priceCol}>
              <Text style={totalValue}>{total}</Text>
            </Column>
          </Row>
          {address.length > 0 && (
            <Section>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>
                Shipping to
              </Heading>
              {address.map((line, i) => (
                <Text key={i} style={addressLine}>
                  {line}
                </Text>
              ))}
            </Section>
          )}
          <Hr style={hr} />
          <Text style={muted}>
            Questions? Reply to this email or visit{' '}
            <Link style={link} href={orderUrl}>
              your order page
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

OrderConfirmationEmail.PreviewProps = {
  orderNumber: 'ORD-01001',
  orderUrl: 'http://localhost:3000/orders/123?email=you@example.com&accessToken=demo',
  items: [
    { title: 'Aerial Wireless Headphones', quantity: 1, unitPrice: '$399.00', lineTotal: '$399.00' },
    { title: 'Studio T-Shirt', quantity: 2, unitPrice: '$45.00', lineTotal: '$90.00' },
  ],
  total: '$489.00',
  customerEmail: 'you@example.com',
  shippingLines: ['Jane Doe', '123 Commerce Street', 'New York, NY 10001'],
} satisfies OrderConfirmationEmailProps

const body = {
  backgroundColor: '#f6f6f6',
  fontFamily: 'Arial, Helvetica, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  margin: '40px auto',
  maxWidth: '560px',
  padding: '32px',
}

const h1 = {
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 16px',
}

const h2 = {
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const text = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
}

const muted = {
  color: '#777777',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '4px 0',
}

const btnWrap = {
  margin: '24px 0',
}

const btn = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  padding: '12px 20px',
  textDecoration: 'none',
}

const link = {
  color: '#000000',
  fontSize: '13px',
}

const hr = {
  borderColor: '#eeeeee',
  margin: '24px 0',
}

const row = {
  margin: '12px 0',
}

const itemCol = {
  verticalAlign: 'top' as const,
}

const priceCol = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
}

const itemTitle = {
  color: '#111111',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
}

const itemPrice = {
  color: '#111111',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
}

const totalLabel = {
  color: '#111111',
  fontSize: '15px',
  fontWeight: '700',
}

const totalValue = {
  color: '#111111',
  fontSize: '16px',
  fontWeight: '700',
  textAlign: 'right' as const,
}

const addressLine = {
  color: '#333333',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}
