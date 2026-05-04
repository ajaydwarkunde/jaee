import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cartStore'

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ guestCart: [] })
  })

  it('starts with empty guest cart', () => {
    expect(useCartStore.getState().guestCart).toEqual([])
  })

  it('addToGuestCart adds a new item', () => {
    useCartStore.getState().addToGuestCart(1, 2)

    const cart = useCartStore.getState().guestCart
    expect(cart).toHaveLength(1)
    expect(cart[0]).toEqual({ productId: 1, qty: 2 })
  })

  it('addToGuestCart increments qty for existing product', () => {
    useCartStore.getState().addToGuestCart(1, 2)
    useCartStore.getState().addToGuestCart(1, 3)

    const cart = useCartStore.getState().guestCart
    expect(cart).toHaveLength(1)
    expect(cart[0].qty).toBe(5)
  })

  it('addToGuestCart keeps separate lines for same product different variants', () => {
    useCartStore.getState().addToGuestCart(1, 1, 10)
    useCartStore.getState().addToGuestCart(1, 2, 20)

    const cart = useCartStore.getState().guestCart
    expect(cart).toHaveLength(2)
    expect(cart.find((i) => i.variantId === 10)?.qty).toBe(1)
    expect(cart.find((i) => i.variantId === 20)?.qty).toBe(2)
  })

  it('addToGuestCart handles multiple products', () => {
    useCartStore.getState().addToGuestCart(1, 1)
    useCartStore.getState().addToGuestCart(2, 3)

    const cart = useCartStore.getState().guestCart
    expect(cart).toHaveLength(2)
    expect(cart.find(i => i.productId === 1)?.qty).toBe(1)
    expect(cart.find(i => i.productId === 2)?.qty).toBe(3)
  })

  it('updateGuestCartItem updates quantity', () => {
    useCartStore.getState().addToGuestCart(1, 2)
    useCartStore.getState().updateGuestCartItem(1, 5)

    expect(useCartStore.getState().guestCart[0].qty).toBe(5)
  })

  it('updateGuestCartItem removes item when qty is 0 or negative', () => {
    useCartStore.getState().addToGuestCart(1, 2)
    useCartStore.getState().updateGuestCartItem(1, 0)

    expect(useCartStore.getState().guestCart).toHaveLength(0)
  })

  it('removeFromGuestCart removes the item', () => {
    useCartStore.getState().addToGuestCart(1, 2)
    useCartStore.getState().addToGuestCart(2, 1)
    useCartStore.getState().removeFromGuestCart(1)

    const cart = useCartStore.getState().guestCart
    expect(cart).toHaveLength(1)
    expect(cart[0].productId).toBe(2)
  })

  it('clearGuestCart empties the cart', () => {
    useCartStore.getState().addToGuestCart(1, 2)
    useCartStore.getState().addToGuestCart(2, 1)
    useCartStore.getState().clearGuestCart()

    expect(useCartStore.getState().guestCart).toEqual([])
  })

  it('getGuestCartCount returns total quantity', () => {
    useCartStore.getState().addToGuestCart(1, 2)
    useCartStore.getState().addToGuestCart(2, 3)

    expect(useCartStore.getState().getGuestCartCount()).toBe(5)
  })

  it('getGuestCartCount returns 0 for empty cart', () => {
    expect(useCartStore.getState().getGuestCartCount()).toBe(0)
  })
})
