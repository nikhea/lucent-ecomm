'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem } from '@/components/forms/FormItem'
import { useAuth } from '@/providers/Auth'
import { useCheckout } from '@/components/checkout/CheckoutContext'
import { Check, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const { user } = useAuth()
  const { email, setEmail, emailEditable, setEmailEditable, contactDone } = useCheckout()
  const router = useRouter()
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b">
        <span className={`h-8 w-8 rounded-full flex items-center justify-center ${contactDone ? 'bg-black text-white' : 'bg-muted text-muted-foreground'}`}>
          <Mail className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold leading-none">Contact</h2>
          <p className="text-xs text-muted-foreground mt-1">Where we&apos;ll send your order confirmation</p>
        </div>
        {contactDone && <span className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-white" /></span>}
      </div>
      <div className="p-5 flex flex-col gap-4">
        {!user ? (
          emailEditable ? (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <User className="h-3.5 w-3.5" /> Already have an account? <Link href="/login" className="font-medium text-foreground underline underline-offset-4">Log in</Link>
                <span className="mx-1">•</span><Link href="/create-account" className="font-medium text-foreground underline underline-offset-4">Create account</Link>
              </div>
              <FormItem>
                <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
                <Input id="email" name="email" defaultValue={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required type="email" className="h-11 bg-muted/20" />
              </FormItem>
              <Button disabled={!email} onClick={() => setEmailEditable(false)} className="bg-black text-white hover:bg-black/90 h-11 w-full sm:w-auto self-start px-8">Continue as guest</Button>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> We&apos;ll only use your email for order updates.</p>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 border px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium shrink-0">{email[0]?.toUpperCase()}</span>
                <div className="min-w-0"><p className="text-sm font-medium truncate">{email}</p><p className="text-xs text-muted-foreground">Guest checkout</p></div>
              </div>
              <Button variant="outline" size="sm" className="h-8 rounded-full shrink-0" onClick={() => setEmailEditable(true)}>Change</Button>
            </div>
          )
        ) : (
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 border px-4 py-3">
            <div className="flex items-center gap-3"><span className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">{user.email?.[0]?.toUpperCase()}</span><div><p className="text-sm font-medium">{user.email}</p><p className="text-xs text-muted-foreground">Signed in</p></div></div>
            <Link href="/logout" className="text-xs font-medium underline underline-offset-4">Log out</Link>
          </div>
        )}
        {contactDone && (
          <Button className="bg-black text-white hover:bg-black/90 h-11 rounded-full w-full mt-2" onClick={() => router.push('/checkout/address')}>Continue to address →</Button>
        )}
      </div>
    </div>
  )
}
