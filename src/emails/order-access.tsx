import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components'

type OrderAccessEmailProps = {
  orderId: string
  orderUrl: string
  companyName?: string
}

export default function OrderAccessEmail({
  orderId,
  orderUrl,
  companyName = 'Lucent',
}: OrderAccessEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        View your {companyName} order #{orderId}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>View your order</Heading>
          <Text style={text}>Click the button below to view order #{orderId}:</Text>
          <Section style={btnWrap}>
            <Button style={btn} href={orderUrl}>
              View order #{orderId}
            </Button>
          </Section>
          <Text style={text}>Or copy and paste this URL into your browser:</Text>
          <Link style={link} href={orderUrl}>
            {orderUrl}
          </Link>
          <Text style={muted}>This link gives you access to view your order details.</Text>
        </Container>
      </Body>
    </Html>
  )
}

OrderAccessEmail.PreviewProps = {
  orderId: '123',
  orderUrl: 'http://localhost:3000/orders/123?email=you@example.com&accessToken=demo',
} satisfies OrderAccessEmailProps

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

const text = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
}

const muted = {
  color: '#777777',
  fontSize: '12px',
  lineHeight: '20px',
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
  overflowWrap: 'break-word' as const,
}
