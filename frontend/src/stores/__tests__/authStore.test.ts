import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'
import type { User } from '@/types'

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  mobileNumber: '+919876543210',
  role: 'USER',
  twoFactorEnabled: false,
}

const adminUser: User = {
  id: 2,
  name: 'Admin',
  email: 'admin@example.com',
  mobileNumber: null,
  role: 'ADMIN',
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
    })
  })

  it('starts with default unauthenticated state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isAdmin).toBe(false)
  })

  it('login sets user, tokens, and flags', () => {
    useAuthStore.getState().login(mockUser, 'access-123', 'refresh-456')
    const state = useAuthStore.getState()

    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe('access-123')
    expect(state.refreshToken).toBe('refresh-456')
    expect(state.isAuthenticated).toBe(true)
    expect(state.isAdmin).toBe(false)
  })

  it('login with admin user sets isAdmin true', () => {
    useAuthStore.getState().login(adminUser, 'access', 'refresh')
    const state = useAuthStore.getState()

    expect(state.isAdmin).toBe(true)
    expect(state.isAuthenticated).toBe(true)
  })

  it('logout clears all state', () => {
    useAuthStore.getState().login(mockUser, 'access', 'refresh')
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()

    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isAdmin).toBe(false)
  })

  it('setUser updates user and flags', () => {
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().isAdmin).toBe(false)

    useAuthStore.getState().setUser(adminUser)
    expect(useAuthStore.getState().isAdmin).toBe(true)

    useAuthStore.getState().setUser(null)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('updateUser merges partial updates', () => {
    useAuthStore.getState().login(mockUser, 'access', 'refresh')
    useAuthStore.getState().updateUser({ name: 'Updated Name' })

    const user = useAuthStore.getState().user
    expect(user?.name).toBe('Updated Name')
    expect(user?.email).toBe('test@example.com')
  })

  it('updateUser does nothing when no user is set', () => {
    useAuthStore.getState().updateUser({ name: 'Test' })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('setTokens updates tokens', () => {
    useAuthStore.getState().setTokens('new-access', 'new-refresh')
    const state = useAuthStore.getState()

    expect(state.accessToken).toBe('new-access')
    expect(state.refreshToken).toBe('new-refresh')
  })
})
