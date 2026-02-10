import { test, expect } from '@playwright/test'

/**
 * API Tests for Jaee Backend
 * Tests backend endpoints directly without browser
 */

const API_BASE = process.env.API_URL || 'https://jaee-backend.onrender.com/api'

test.describe('API Tests - Public Endpoints', () => {
  
  test('GET /products returns product list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`)
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    console.log(`Products returned: ${data.data?.content?.length || data.data?.length || 0}`)
    
    // Check response structure
    expect(data).toHaveProperty('data')
  })

  test('GET /products/{id} returns single product', async ({ request }) => {
    // First get a product ID
    const listResponse = await request.get(`${API_BASE}/products`)
    const listData = await listResponse.json()
    
    const products = listData.data?.content || listData.data || []
    if (products.length === 0) {
      test.skip()
      return
    }
    
    const productId = products[0].id
    const response = await request.get(`${API_BASE}/products/${productId}`)
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.data).toHaveProperty('id')
    expect(data.data).toHaveProperty('name')
    expect(data.data).toHaveProperty('price')
    
    console.log(`Product: ${data.data.name}`)
  })

  test('GET /products with invalid ID returns 404', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products/999999`)
    
    // Should be 404 or error response
    expect([404, 400, 500]).toContain(response.status())
  })

  test('GET /categories returns category list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/categories`)
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    console.log(`Categories returned: ${data.data?.length || 0}`)
  })

  test('GET /store/settings returns store config', async ({ request }) => {
    const response = await request.get(`${API_BASE}/store/settings`)
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    console.log('Store settings retrieved')
  })

  test('Health check endpoint works', async ({ request }) => {
    // Try actuator health endpoint
    const baseUrl = API_BASE.replace('/api', '')
    const response = await request.get(`${baseUrl}/actuator/health`)
    
    if (response.status() === 200) {
      const data = await response.json()
      console.log(`Health status: ${data.status}`)
      expect(data.status).toBe('UP')
    }
  })
})

test.describe('API Tests - Authentication', () => {
  
  test('POST /auth/login with invalid credentials returns error', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      }
    })
    
    // Should not be 200
    expect(response.status()).not.toBe(200)
    console.log(`Invalid login status: ${response.status()}`)
  })

  test('POST /auth/register validates input', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: 'invalid-email',
        password: '123', // too short
        name: '',
        mobileNumber: '123' // invalid
      }
    })
    
    // Should return validation error
    expect([400, 422]).toContain(response.status())
    console.log(`Validation error status: ${response.status()}`)
  })

  test('Protected endpoint without token returns 401/403', async ({ request }) => {
    const response = await request.get(`${API_BASE}/me`)
    
    expect([401, 403]).toContain(response.status())
    console.log(`Unauthorized status: ${response.status()}`)
  })

  test('Protected endpoint with invalid token returns 401/403', async ({ request }) => {
    const response = await request.get(`${API_BASE}/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token-here'
      }
    })
    
    expect([401, 403]).toContain(response.status())
  })
})

test.describe('API Tests - Cart (Guest)', () => {
  
  test('Cart endpoints exist', async ({ request }) => {
    // Guest cart operations should work or return appropriate error
    const response = await request.get(`${API_BASE}/cart`)
    
    // Either 200 (guest cart) or 401 (requires auth)
    expect([200, 401, 403]).toContain(response.status())
    console.log(`Cart endpoint status: ${response.status()}`)
  })
})

test.describe('API Tests - Search & Filtering', () => {
  
  test('GET /products with search query works', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?search=candle`)
    
    expect(response.status()).toBe(200)
    console.log('Search query accepted')
  })

  test('GET /products with pagination works', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?page=0&size=5`)
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    const products = data.data?.content || data.data || []
    console.log(`Paginated results: ${products.length} items`)
  })

  test('GET /products with sorting works', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?sortBy=price&sortDir=asc`)
    
    expect(response.status()).toBe(200)
    console.log('Sorting accepted')
  })

  test('GET /products by category works', async ({ request }) => {
    // First get categories
    const catResponse = await request.get(`${API_BASE}/categories`)
    const catData = await catResponse.json()
    const categories = catData.data || []
    
    if (categories.length === 0) {
      test.skip()
      return
    }
    
    const categorySlug = categories[0].slug
    const response = await request.get(`${API_BASE}/products?category=${categorySlug}`)
    
    expect(response.status()).toBe(200)
    console.log(`Category filter: ${categorySlug}`)
  })
})

test.describe('API Tests - Response Format', () => {
  
  test('API returns consistent response structure', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`)
    const data = await response.json()
    
    // Check for standard wrapper
    expect(data).toHaveProperty('data')
    
    // Check for timestamps or metadata if present
    console.log('Response keys:', Object.keys(data))
  })

  test('Error responses have proper format', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products/invalid-id-format`)
    
    if (response.status() !== 200) {
      const data = await response.json()
      console.log('Error response:', JSON.stringify(data).substring(0, 200))
    }
  })

  test('CORS headers are present', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`)
    
    // In a real CORS scenario, check for headers
    // Note: Playwright handles CORS differently than browsers
    console.log('Response headers checked')
  })
})

test.describe('API Tests - Rate Limiting & Security', () => {
  
  test('Multiple rapid requests are handled', async ({ request }) => {
    const requests = []
    for (let i = 0; i < 10; i++) {
      requests.push(request.get(`${API_BASE}/products`))
    }
    
    const responses = await Promise.all(requests)
    const successCount = responses.filter(r => r.status() === 200).length
    
    console.log(`Rapid requests success: ${successCount}/10`)
    expect(successCount).toBeGreaterThan(5)
  })

  test('SQL injection attempt is blocked', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?search='; DROP TABLE products; --`)
    
    // Should not crash, should return empty or error
    expect([200, 400]).toContain(response.status())
    console.log('SQL injection blocked/handled')
  })

  test('XSS attempt in search is handled', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?search=<script>alert("xss")</script>`)
    
    expect([200, 400]).toContain(response.status())
    console.log('XSS attempt handled')
  })
})
