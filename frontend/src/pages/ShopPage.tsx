import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Filter, SlidersHorizontal, X } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { cartService } from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import type { Product, ProductFilters } from '@/types'

export default function ShopPage() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    categoryId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    search: searchParams.get('search') || undefined,
    sortBy: 'newest',
    sortDir: 'desc',
    page: 0,
    size: 12,
  })

  // Get categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  // Get category by slug
  const { data: currentCategory } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => categoryService.getCategoryBySlug(categorySlug!),
    enabled: !!categorySlug,
  })

  // Update filters when category changes
  useEffect(() => {
    if (currentCategory) {
      setFilters((prev) => ({ ...prev, categoryId: currentCategory.id, page: 0 }))
    } else if (!categorySlug) {
      setFilters((prev) => ({ ...prev, categoryId: undefined, page: 0 }))
    }
  }, [currentCategory, categorySlug])

  // Update search from URL
  useEffect(() => {
    const search = searchParams.get('search')
    if (search !== filters.search) {
      setFilters((prev) => ({ ...prev, search: search || undefined, page: 0 }))
    }
  }, [searchParams])

  // Get products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
  })

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (product: Product) => cartService.addToCart(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Added to cart!')
    },
    onError: () => {
      toast.error('Failed to add to cart')
    },
  })

  const handleAddToCart = (product: Product) => {
    if (isAuthenticated) {
      addToCartMutation.mutate(product)
    } else {
      addToGuestCart(product.id, 1)
      toast.success('Added to cart!')
    }
  }

  const handleFilterChange = (key: keyof ProductFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }))
  }

  const handleClearFilters = () => {
    setFilters({
      categoryId: currentCategory?.id,
      sortBy: 'newest',
      sortDir: 'desc',
      page: 0,
      size: 12,
    })
    setSearchParams({})
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sortOptions = [
    { value: 'newest-desc', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A-Z' },
  ]

  const handleSortChange = (value: string) => {
    const [sortBy, sortDir] = value.split('-') as ['newest' | 'price' | 'name', 'asc' | 'desc']
    setFilters((prev) => ({ ...prev, sortBy, sortDir, page: 0 }))
  }

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.search

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-blush to-champagne py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="heading-2 text-charcoal">
            {currentCategory?.name || 'All Products'}
          </h1>
          {currentCategory?.description && (
            <p className="mt-4 text-warm-gray max-w-2xl mx-auto">
              {currentCategory.description}
            </p>
          )}
        </div>
      </div>

      <div className="container-custom py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-soft-white rounded-lg p-6 shadow-soft sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg font-medium text-charcoal">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-rose hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-charcoal mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange('categoryId', undefined)}
                    className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                      !filters.categoryId ? 'bg-rose/10 text-rose' : 'text-warm-gray hover:text-charcoal'
                    }`}
                  >
                    All Products
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleFilterChange('categoryId', cat.id)}
                      className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                        filters.categoryId === cat.id ? 'bg-rose/10 text-rose' : 'text-warm-gray hover:text-charcoal'
                      }`}
                    >
                      {cat.name} ({cat.productCount})
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-charcoal mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile filter button */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-soft-white rounded-lg shadow-soft text-sm font-medium"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                {/* Results count */}
                <p className="text-sm text-warm-gray">
                  {productsData?.totalElements || 0} products
                </p>
              </div>

              {/* Sort */}
              <Select
                options={sortOptions}
                value={`${filters.sortBy}-${filters.sortDir}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-48 text-sm"
              />
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-warm-gray">Active filters:</span>
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose/10 text-rose text-sm rounded-full">
                    Search: {filters.search}
                    <button onClick={() => handleFilterChange('search', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.minPrice && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose/10 text-rose text-sm rounded-full">
                    Min: ₹{filters.minPrice}
                    <button onClick={() => handleFilterChange('minPrice', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose/10 text-rose text-sm rounded-full">
                    Max: ₹{filters.maxPrice}
                    <button onClick={() => handleFilterChange('maxPrice', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid
              products={productsData?.content || []}
              loading={isLoading}
              onAddToCart={handleAddToCart}
              emptyMessage="No products found. Try adjusting your filters."
            />

            {/* Pagination */}
            {productsData && productsData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={productsData.first}
                >
                  Previous
                </Button>
                <span className="px-4 text-sm text-warm-gray">
                  Page {productsData.page + 1} of {productsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={productsData.last}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-charcoal/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-soft-white p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-medium text-charcoal">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X className="w-6 h-6 text-charcoal" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-charcoal mb-3">Category</h4>
              <div className="space-y-2">
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleFilterChange('categoryId', cat.id)
                      setFiltersOpen(false)
                    }}
                    className={`block w-full text-left text-sm py-2 px-3 rounded transition-colors ${
                      filters.categoryId === cat.id ? 'bg-rose/10 text-rose' : 'text-warm-gray hover:bg-blush'
                    }`}
                  >
                    {cat.name} ({cat.productCount})
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-charcoal mb-3">Price Range</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                Clear All
              </Button>
              <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
