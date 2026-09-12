export function isOutOfStockInventory(inventory: number | null | undefined) {
  return inventory !== null && inventory !== undefined && inventory <= 0
}

export type StockReason = 'inventory' | 'no-variant' | null

export function getCartItemStock(item: any): { inventory: number | null; outOfStock: boolean; reason: StockReason } {
  const variant = item?.variant
  const product = item?.product
  const variantInventory =
    variant && typeof variant === 'object' && typeof variant.inventory === 'number' ? variant.inventory : null
  if (variant && typeof variant === 'object') {
    if (typeof variant.inventory === 'number')
      return { inventory: variant.inventory, outOfStock: variant.inventory <= 0, reason: variant.inventory <= 0 ? 'inventory' : null }
    return { inventory: null, outOfStock: false, reason: null }
  }
  if (product && typeof product === 'object' && product.enableVariants) {
    return { inventory: null, outOfStock: true, reason: 'no-variant' }
  }
  const productInventory =
    product && typeof product === 'object' && typeof product.inventory === 'number' ? product.inventory : null
  if (variantInventory !== null)
    return { inventory: variantInventory, outOfStock: variantInventory <= 0, reason: variantInventory <= 0 ? 'inventory' : null }
  if (productInventory !== null)
    return { inventory: productInventory, outOfStock: productInventory <= 0, reason: productInventory <= 0 ? 'inventory' : null }
  return { inventory: null, outOfStock: false, reason: null }
}

export function getCartItemName(item: any): string {
  const product = item?.product
  const variant = item?.variant
  const title =
    (product && typeof product === 'object' && product.title) ||
    (variant && typeof variant === 'object' && variant.title) ||
    'Item'
  const options =
    variant && typeof variant === 'object' && Array.isArray(variant.options)
      ? variant.options.map((o: any) => (typeof o === 'object' ? o.label : null)).filter(Boolean).join(' • ')
      : null
  return options ? `${title} (${options})` : title
}

export function isProductFullyOutOfStock(product: any, variants: any[]): boolean {
  if (product?.enableVariants) {
    if (!variants.length) return false
    return variants.every((v: any) => {
      const inv = typeof v === 'object' ? v.inventory : null
      return inv !== null && inv !== undefined && inv <= 0
    })
  }
  const inv = product?.inventory
  return inv !== null && inv !== undefined && inv <= 0
}
