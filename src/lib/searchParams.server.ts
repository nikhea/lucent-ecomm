import { createSearchParamsCache, createLoader, parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs/server'

export const shopSearchParams = {
  q: parseAsString.withDefault(''),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  category: parseAsString.withDefault(''),
  brands: parseAsArrayOf(parseAsString).withDefault([]),
  features: parseAsArrayOf(parseAsString).withDefault([]),
  sizes: parseAsArrayOf(parseAsString).withDefault([]),
  rating: parseAsArrayOf(parseAsString).withDefault([]),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  page: parseAsInteger.withDefault(1),
  sort: parseAsString.withDefault('title'),
}

export const searchParamsCache = createSearchParamsCache(shopSearchParams)
export const loadShopSearchParams = createLoader(shopSearchParams)
