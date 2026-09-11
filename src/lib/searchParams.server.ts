import { createSearchParamsCache, createLoader } from 'nuqs/server'
import { shopSearchParams } from './searchParams'

export const searchParamsCache = createSearchParamsCache(shopSearchParams)
export const loadShopSearchParams = createLoader(shopSearchParams)
