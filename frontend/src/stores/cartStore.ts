import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GuestCartItem } from '@/types'

interface CartState {
  // Guest cart (localStorage)
  guestCart: GuestCartItem[]
  
  // Actions
  addToGuestCart: (
    productId: number,
    qty: number,
    variantId?: number,
    customizationText?: string,
  ) => void
  updateGuestCartItem: (productId: number, qty: number, variantId?: number) => void
  removeFromGuestCart: (productId: number, variantId?: number) => void
  clearGuestCart: () => void
  getGuestCartCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      guestCart: [],

      addToGuestCart: (productId, qty, variantId, customizationText) => {
        set((state) => {
          const custom = customizationText?.trim() || undefined
          const lineKey = (item: GuestCartItem) =>
            item.productId === productId &&
            (item.variantId ?? undefined) === (variantId ?? undefined) &&
            (item.customizationText ?? undefined) === custom

          const existingItem = custom ? undefined : state.guestCart.find(lineKey)
          if (existingItem) {
            return {
              guestCart: state.guestCart.map((item) =>
                lineKey(item) ? { ...item, qty: item.qty + qty } : item,
              ),
            }
          }
          return {
            guestCart: [
              ...state.guestCart,
              {
                productId,
                qty,
                ...(variantId != null ? { variantId } : {}),
                ...(custom ? { customizationText: custom } : {}),
              },
            ],
          }
        })
      },

      updateGuestCartItem: (productId, qty, variantId) => {
        set((state) => {
          const matches = (item: { productId: number; variantId?: number }) =>
            item.productId === productId &&
            (item.variantId ?? undefined) === (variantId ?? undefined)
          if (qty <= 0) {
            return {
              guestCart: state.guestCart.filter((item) => !matches(item)),
            }
          }
          return {
            guestCart: state.guestCart.map((item) => (matches(item) ? { ...item, qty } : item)),
          }
        })
      },

      removeFromGuestCart: (productId, variantId) => {
        set((state) => ({
          guestCart: state.guestCart.filter(
            (item) =>
              !(
                item.productId === productId &&
                (item.variantId ?? undefined) === (variantId ?? undefined)
              )
          ),
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
      name: 'jaai-guest-cart',
    }
  )
)
