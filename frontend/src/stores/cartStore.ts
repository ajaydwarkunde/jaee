import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GuestCartItem } from '@/types'

interface CartState {
  // Guest cart (localStorage)
  guestCart: GuestCartItem[]
  
  // Actions
  addToGuestCart: (productId: number, qty: number) => void
  updateGuestCartItem: (productId: number, qty: number) => void
  removeFromGuestCart: (productId: number) => void
  clearGuestCart: () => void
  getGuestCartCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      guestCart: [],

      addToGuestCart: (productId, qty) => {
        set((state) => {
          const existingItem = state.guestCart.find((item) => item.productId === productId)
          if (existingItem) {
            return {
              guestCart: state.guestCart.map((item) =>
                item.productId === productId
                  ? { ...item, qty: item.qty + qty }
                  : item
              ),
            }
          }
          return {
            guestCart: [...state.guestCart, { productId, qty }],
          }
        })
      },

      updateGuestCartItem: (productId, qty) => {
        set((state) => {
          if (qty <= 0) {
            return {
              guestCart: state.guestCart.filter((item) => item.productId !== productId),
            }
          }
          return {
            guestCart: state.guestCart.map((item) =>
              item.productId === productId ? { ...item, qty } : item
            ),
          }
        })
      },

      removeFromGuestCart: (productId) => {
        set((state) => ({
          guestCart: state.guestCart.filter((item) => item.productId !== productId),
        }))
      },

      clearGuestCart: () => {
        set({ guestCart: [] })
      },

      getGuestCartCount: () => {
        return get().guestCart.reduce((total, item) => total + item.qty, 0)
      },
    }),
    {
      name: 'jaee-guest-cart',
    }
  )
)
