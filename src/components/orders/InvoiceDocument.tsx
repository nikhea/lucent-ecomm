// Server-only: uses Node APIs via @react-pdf/renderer. Never import from client code.
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

export type InvoiceLine = {
  title: string
  variant: string | null
  quantity: number
  unitPrice: number
}

export type InvoiceData = {
  orderNumber: string
  placed: string
  dueDate: string
  status: string
  companyLines: string[]
  billedName: string
  billLines: string[]
  billedEmail: string | null
  lines: InvoiceLine[]
  subtotal: number
  shippingLabel: string
  total: number
  currency: string
  notes: string
}

const RULE = '#d1d5db'
const MUTED = '#4b5563'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#111111' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, letterSpacing: 8, fontFamily: 'Helvetica' },
  titleRule: { flex: 1, height: 1, backgroundColor: RULE, marginLeft: 16 },
  parties: { flexDirection: 'row', gap: 24, marginBottom: 4 },
  companyName: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  partyLine: { fontSize: 10, color: MUTED, marginTop: 2 },
  billToLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginBottom: 4 },
  billName: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginBottom: 4 },
  billLine: { fontSize: 10, color: MUTED, textAlign: 'right', marginTop: 2 },
  metaStrip: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: RULE, borderBottomWidth: 1, borderBottomColor: RULE, marginTop: 16, paddingVertical: 12 },
  metaCell: { flex: 1 },
  metaLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  metaValue: { fontSize: 13, marginTop: 5 },
  dueCell: { flex: 1.2, alignItems: 'flex-end' },
  dueLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  dueValue: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginTop: 5 },
  tableHead: { flexDirection: 'row', marginTop: 18, paddingBottom: 6 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  colItem: { width: '22%' },
  colDesc: { flex: 1, paddingRight: 12 },
  colQty: { width: 60, textAlign: 'right' },
  colPrice: { width: 80, textAlign: 'right' },
  colAmount: { width: 90, textAlign: 'right' },
  headText: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  itemTitle: { fontSize: 11 },
  itemVariant: { fontSize: 10, color: MUTED, marginTop: 1 },
  bottom: { flexDirection: 'row', marginTop: 18, borderTopWidth: 1, borderTopColor: RULE, paddingTop: 14, gap: 24 },
  notesBox: { flex: 1 },
  notesLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 6 },
  notesText: { fontSize: 10, color: MUTED },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  totalRowFirst: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RULE },
  grandLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  grandValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  footnote: { marginTop: 28, fontSize: 8, color: MUTED, textAlign: 'center' },
})

export function InvoiceDocument({ invoice }: { invoice: InvoiceData }) {
  const money = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format((n || 0) / 100)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.titleRule} />
        </View>

        <View style={styles.parties}>
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName}>LUCENT</Text>
            {invoice.companyLines.map((line, i) => (
              <Text key={i} style={styles.partyLine}>
                {line}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.billToLabel}>BILL TO:</Text>
            <Text style={styles.billName}>{invoice.billedName}</Text>
            {invoice.billLines.map((line, i) => (
              <Text key={i} style={styles.billLine}>
                {line}
              </Text>
            ))}
            {invoice.billedEmail ? <Text style={styles.billLine}>{invoice.billedEmail}</Text> : null}
          </View>
        </View>

        <View style={styles.metaStrip}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Invoice No #</Text>
            <Text style={styles.metaValue}>{invoice.orderNumber}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{invoice.placed}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Invoice Due Date</Text>
            <Text style={styles.metaValue}>{invoice.dueDate}</Text>
          </View>
          <View style={styles.dueCell}>
            <Text style={styles.dueLabel}>Amount Due</Text>
            <Text style={styles.dueValue}>{money(invoice.total)}</Text>
          </View>
        </View>

        <View style={styles.tableHead}>
          <Text style={[styles.headText, styles.colItem]}>Items</Text>
          <Text style={[styles.headText, styles.colDesc]}>Description</Text>
          <Text style={[styles.headText, styles.colQty]}>Quantity</Text>
          <Text style={[styles.headText, styles.colPrice]}>Price</Text>
          <Text style={[styles.headText, styles.colAmount]}>Amount</Text>
        </View>
        {invoice.lines.map((line, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <View style={styles.colItem}>
              <Text style={styles.itemTitle}>{line.title}</Text>
            </View>
            <View style={styles.colDesc}>
              <Text style={styles.itemTitle}>{line.variant || '—'}</Text>
            </View>
            <Text style={styles.colQty}>{line.quantity}</Text>
            <Text style={styles.colPrice}>{money(line.unitPrice)}</Text>
            <Text style={styles.colAmount}>{money(line.unitPrice * line.quantity)}</Text>
          </View>
        ))}

        <View style={styles.bottom}>
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
          <View style={styles.totalsBox}>
            <View style={styles.totalRowFirst}>
              <Text style={styles.totalLabel}>Sub-total</Text>
              <Text>{money(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text>{invoice.shippingLabel}</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandValue}>{money(invoice.total)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footnote}>
          Including VAT, if applicable. Thank you for shopping with LUCENT.
        </Text>
      </Page>
    </Document>
  )
}
