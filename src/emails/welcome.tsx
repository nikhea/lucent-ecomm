import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
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

type WelcomeEmailProps = {
  name?: string
  shopUrl: string
  accountUrl: string
  companyName?: string
}

export default function WelcomeEmail({
  name,
  shopUrl,
  accountUrl,
  companyName = 'LUCENT',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to {companyName}
        {name ? `, ${name}` : ''} — your wardrobe awaits
      </Preview>
      <Body style={body}>
        <Container style={outer}>
          <Section style={hero}>
            <Text style={wordmark}>{companyName}</Text>
            <Text style={heroEyebrow}>New member</Text>
            <Heading style={headline}>Welcome{name ? `, ${name}` : ''}.</Heading>
            <Text style={subcopy}>
              Your account is ready — faster checkout, order tracking, and a wishlist for the
              pieces you love.
            </Text>
            <Section style={buttonWrap}>
              <Button style={button} href={shopUrl}>
                Start shopping
              </Button>
            </Section>
          </Section>
          <Section style={card}>
            <Text style={perkTitle}>Always on the house</Text>
            <Text style={perk}>Complimentary shipping on every order</Text>
            <Hr style={hr} />
            <Text style={perk}>Easy returns within 30 days</Text>
            <Hr style={hr} />
            <Text style={perk}>Early access to new drops</Text>
          </Section>
          <Section style={foot}>
            <Text style={footerNote}>
              Manage your profile in{' '}
              <Link style={footerLinks} href={accountUrl}>
                your account
              </Link>
              . If you did not create this account, please ignore this email.
            </Text>
            <Text style={brand}>© {companyName}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

WelcomeEmail.PreviewProps = {
  name: 'Jane',
  shopUrl: 'http://localhost:3000/shop',
  accountUrl: 'http://localhost:3000/account',
} satisfies WelcomeEmailProps

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

const perkTitle = {
  color: palette.ink,
  fontFamily: fonts.serif,
  fontSize: '18px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const perk = {
  color: palette.body,
  fontFamily: fonts.sans,
  fontSize: '13px',
  letterSpacing: '0.04em',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
}

const hr = {
  borderColor: palette.hairline,
  margin: '14px auto',
  width: '120px',
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
