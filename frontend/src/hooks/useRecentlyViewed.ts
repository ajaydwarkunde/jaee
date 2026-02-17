import { useState, useEffect, useCallback } from 'react'
import type { Product } from '@/types'

const STORAGE_KEY = 'jaee_recently_viewed'
const MAX_ITEMS = 8

interface RecentlyViewedItem {
  id: number
  slug: string
  name: string
  price: number
  image: string
  viewedAt: number
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedItem[]
        // Sort by viewedAt (most recent first)
        setItems(parsed.sort((a, b) => b.viewedAt - a.viewedAt))
      }
    } catch (e) {
      console.error('Error loading recently viewed:', e)
    }
  }, [])

  // Add a product to recently viewed
  const addProduct = useCallback((product: Product) => {
    setItems((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.id !== product.id)
      
      // Add new item at the beginning
      const newItem: RecentlyViewedItem = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        viewedAt: Date.now(),
      }
      
      // Keep only MAX_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Error saving recently viewed:', e)
      }
      
      return updated
    })
  }, [])

  // Get items excluding a specific product (useful on product page)
  const getItemsExcluding = useCallback(
    (excludeId?: number) => {
      if (!excludeId) return items
      return items.filter((item) => item.id !== excludeId)
    },
    [items]
  )

  // Clear all recently viewed
  const clear = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    items,
    addProduct,
    getItemsExcluding,
    clear,
  }
}
