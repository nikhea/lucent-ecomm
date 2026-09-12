'use client'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Badge } from '@/components/ui/badge'
import { getCartItemStock } from '@/utilities/stock'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { Lock, Package, ShieldCheck, Truck } from 'lucide-react'

export const OrderSummary: React.FC = () => {
  const { cart } = useCart()
  const subtotal = cart?.subtotal || 0
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-[80px]">
      <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
        <h2 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Order summary</h2>
        <div className="flex flex-col gap-4 max-h-[42vh] overflow-auto pr-1">
          {cart?.items?.map((item, index) => {
            if (typeof item.product === 'object' && item.product) {
              const { product, quantity, variant } = item as any
              if (!quantity) return null
              const { outOfStock } = getCartItemStock(item)
              let image = (product as any).gallery?.[0]?.image || (product as any).meta?.image
              let price = (product as any)?.priceInUSD
              const isVariant = Boolean(variant) && typeof variant === 'object'
              if (isVariant) {
                price = (variant as any)?.priceInUSD
                const imageVariant = (product as any).gallery?.find((g: any) => {
                  if (!g.variantOption) return false
                  const id = typeof g.variantOption === 'object' ? g.variantOption.id : g.variantOption
                  return (variant as any)?.options?.some((o: any) => (typeof o === 'object' ? o.id : o) === id)
                })
                if (imageVariant && typeof imageVariant.image !== 'string') image = imageVariant.image
              }
              return (
                <div className="flex gap-3" key={index}>
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden border relative">
                    {image && typeof image !== 'string' && <Media className="h-full w-full" imgClassName={`h-full w-full object-cover ${outOfStock ? 'opacity-40 grayscale blur-[1px]' : ''}`} resource={image} />}
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-white text-[11px] flex items-center justify-center font-medium">{quantity}</span>
                  </div>
                  <div className={`flex-1 min-w-0 ${outOfStock ? 'opacity-70' : ''}`}>
                    <p className="text-sm font-medium leading-tight truncate">{(product as any).title}</p>
                    {variant && typeof variant === 'object' && (
                      <p className="text-xs font-mono text-muted-foreground truncate">{(variant as any).options?.map((o: any) => (typeof o === 'object' ? o.label : null)).join(' • ')}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">Qty {quantity}</p>
                    {outOfStock && <Badge variant="destructive" className="mt-1">Out of stock</Badge>}
                  </div>
                  {typeof price === 'number' && <Price amount={price * quantity} as="span" className="text-sm font-semibold shrink-0" />}
                </div>
              )
            }
            return null
          })}
        </div>
        <hr />
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><Price as="span" amount={subtotal} className="font-medium" /></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium text-green-600">Free</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-medium">Calculated at next step</span></div>
        </div>
        <hr />
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <Price className="text-xl font-bold" amount={subtotal} />
        </div>
        <p className="text-xs text-muted-foreground text-center">Including VAT, if applicable</p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg py-2 border">
          <Lock className="h-3 w-3" /> Secure payment with SSL encryption
        </div>
      </div>
      <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/30 p-4 flex gap-3">
        <span className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0"><ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" /></span>
        <div><div className="text-sm font-semibold dark:text-white">Buyer Protection</div><div className="text-xs text-muted-foreground dark:text-white/60">30-day returns • Secure checkout • Encrypted data</div></div>
      </div>
      <div className="rounded-xl border bg-card p-4 flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Truck className="h-3.5 w-3.5" /> Estimated delivery: 2–4 business days • Free returns
      </div>
    </div>
  )
}
