export const palette = {
  page: '#f3efe9',
  card: '#ffffff',
  ink: '#1c1917',
  body: '#44403c',
  muted: '#8a8179',
  hairline: '#e9e1d6',
  blush: '#f6e7e2',
  blushDeep: '#e9c4ba',
  taupe: '#a08b7a',
  button: '#1c1917',
}

export const fonts = {
  serif: "Georgia, 'Times New Roman', Didot, serif",
  sans: "Arial, Helvetica, sans-serif",
}

export const wordmark = {
  color: palette.ink,
  fontFamily: fonts.sans,
  fontSize: '15px',
  fontWeight: '700',
  letterSpacing: '0.35em',
  margin: '0',
  textAlign: 'center' as const,
}

export const eyebrow = {
  color: palette.taupe,
  fontFamily: fonts.sans,
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.25em',
  margin: '0 0 12px',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
}

export const headline = {
  color: palette.ink,
  fontFamily: fonts.serif,
  fontSize: '30px',
  fontWeight: '400',
  lineHeight: '38px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

export const subcopy = {
  color: palette.body,
  fontFamily: fonts.sans,
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
}

export const buttonWrap = {
  margin: '28px 0 8px',
  textAlign: 'center' as const,
}

export const button = {
  backgroundColor: palette.button,
  borderRadius: '999px',
  color: '#ffffff',
  display: 'inline-block',
  fontFamily: fonts.sans,
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.2em',
  padding: '14px 36px',
  textDecoration: 'none',
  textTransform: 'uppercase' as const,
}

export const footerNote = {
  color: palette.muted,
  fontFamily: fonts.sans,
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
}

export const footerLinks = {
  color: palette.ink,
  fontFamily: fonts.sans,
  fontSize: '12px',
  textDecoration: 'underline',
}
