'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Minus, Plus, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export type ReturnLine = {
  productId: string
  variantId: string | null
  title: string
  variantLabel: string | null
  maxQty: number
}

const REASONS = [
  { label: 'Wrong size', value: 'wrong-size' },
  { label: 'Defective / damaged', value: 'defective' },
  { label: 'Wrong item received', value: 'wrong-item' },
  { label: 'Changed my mind', value: 'changed-mind' },
  { label: 'Arrived too late', value: 'late-delivery' },
  { label: 'Other', value: 'other' },
]

export function ReturnDialog({
  orderId,
  email,
  accessToken,
  lines,
}: {
  orderId: string
  email?: string
  accessToken?: string
  lines: ReturnLine[]
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [qty, setQty] = useState<Record<string, number>>({})
  const [reason, setReason] = useState('')
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const keyOf = (l: ReturnLine) => `${l.productId}__${l.variantId || 'base'}`
  const chosen = lines.filter((l) => selected[keyOf(l)])

  const toggle = (l: ReturnLine) => {
    const k = keyOf(l)
    setSelected((p) => ({ ...p, [k]: !p[k] }))
    setQty((p) => ({ ...p, [k]: p[k] || 1 }))
  }

  const bump = (l: ReturnLine, delta: number) => {
    const k = keyOf(l)
    setQty((p) => ({ ...p, [k]: Math.min(l.maxQty, Math.max(1, (p[k] || 1) + delta)) }))
  }

  const submit = async () => {
    if (!chosen.length || !reason || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/returns', {
        body: JSON.stringify({
          orderId,
          email,
          accessToken,
          items: chosen.map((l) => ({
            product: l.productId,
            variant: l.variantId,
            quantity: qty[keyOf(l)] || 1,
          })),
          reason,
          comments,
        }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || 'Could not submit the return request.')
      setDone(true)
    } catch (e: any) {
      toast.error(e?.message || 'Could not submit the return request.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setSelected({})
    setQty({})
    setReason('')
    setComments('')
    setDone(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex cursor-pointer items-center gap-1.5 h-8 px-3 rounded-lg border bg-card text-xs font-medium hover:bg-muted">
          <RotateCcw className="h-3.5 w-3.5" /> Start a return
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-lg dark:bg-card">
        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="size-10 text-green-600" />
            <p className="mt-4 text-base font-semibold">Return requested</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We received your request and will email you the next steps within 1–2 business days.
            </p>
            <Button className="mt-6 cursor-pointer" onClick={() => setOpen(false)} size="sm" variant="outline">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-left text-base">Start a return</DialogTitle>
              <p className="text-left text-sm text-muted-foreground">
                Order {orderId} — select the items and tell us why.
              </p>
            </DialogHeader>

            <ul className="flex flex-col divide-y rounded-lg border">
              {lines.map((l) => {
                const k = keyOf(l)
                const on = !!selected[k]
                return (
                  <li key={k}>
                    <label className="flex cursor-pointer items-center gap-3 p-3">
                      <Checkbox checked={on} onCheckedChange={() => toggle(l)} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{l.title}</span>
                        {l.variantLabel && <span className="block text-xs text-muted-foreground">{l.variantLabel}</span>}
                      </span>
                      <span className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                        <button
                          aria-label="Decrease quantity"
                          className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40"
                          disabled={!on}
                          onClick={() => bump(l, -1)}
                          type="button"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{qty[k] || 1}</span>
                        <button
                          aria-label="Increase quantity"
                          className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40"
                          disabled={!on}
                          onClick={() => bump(l, 1)}
                          type="button"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>

            <div className="flex flex-col gap-3">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                maxLength={1000}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Anything we should know? (optional)"
                rows={3}
                value={comments}
              />
              <Button
                className="w-full cursor-pointer"
                disabled={!chosen.length || !reason || submitting}
                onClick={submit}
              >
                {submitting ? 'Submitting…' : `Request return${chosen.length > 1 ? ` (${chosen.length} items)` : ''}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
