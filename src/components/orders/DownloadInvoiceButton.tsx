'use client'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function DownloadInvoiceButton({
  orderId,
  email,
  accessToken,
}: {
  orderId: string
  email?: string
  accessToken?: string
}) {
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    setDownloading(true)
    try {
      const params = new URLSearchParams()
      if (email) params.set('email', email)
      if (accessToken) params.set('accessToken', accessToken)
      const query = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/invoice${query}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Could not generate the invoice PDF.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate the invoice PDF.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={download}
      disabled={downloading}
      className="inline-flex cursor-pointer items-center gap-1.5 h-8 px-3 rounded-lg border bg-card text-xs font-medium hover:bg-muted disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" /> {downloading ? 'Preparing…' : 'Download invoice'}
    </button>
  )
}
