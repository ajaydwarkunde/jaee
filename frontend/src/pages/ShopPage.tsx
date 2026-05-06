import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SlidersHorizontal, X } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import type { FilterOptions, ProductFilters } from '@/types'
import type { StoreSettings } from '@/services/settingsService'
import { shopIndexListingFilters } from '@/lib/shopPrefetch'
export default function ShopPage() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const queryClient = useQueryClient()
  const { getValue } = useStoreSettings()

  useEffect(() => {
    void import('./HomePage')
    void queryClient.prefetchQuery({
      queryKey: ['products', 'featured'],
      queryFn: () => productService.getFeaturedProducts(8),
    })
  }, [queryClient])

  // Filter state — base shape must match `shopIndexListingFilters()` for React Query prefetch hits
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...shopIndexListingFilters(),
    search: searchParams.get('search') || undefined,
    color: searchParams.get('color') || undefined,
    size: searchParams.get('size') || undefined,
  }))

  // Categories that currently have active products (same discovery as homepage Shop by Category)
  const { data: categories } = useQuery({
    queryKey: ['categories', 'storefront'],
    queryFn: categoryService.getStorefrontCategories,
  })

  const shopCategories = categories

  useEffect(() => {
    if (!categorySlug || !shopCategories?.length) return
    const exists = shopCategories.some((c) => c.slug === categorySlug)
    if (!exists) {
      navigate('/shop', { replace: true })
    }
  }, [categorySlug, shopCategories, navigate])

  // Get available filter options (colors, sizes)
  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ['filterOptions'],
    queryFn: productService.getFilterOptions,
  })

  // Get category by slug
  const {
    data: currentCategory,
    isFetched: categoryFetched,
    isError: categoryFetchError,
  } = useQuery({
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

  // Get products — avoid fetching “all products” before category route applies categoryId (matches prefetch key)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    enabled:
      !categorySlug ||
      filters.categoryId !== undefined ||
      (categoryFetched && categoryFetchError),
  })

  const gridLoading =
    (Boolean(categorySlug) && !categoryFetched) ||
    (Boolean(categorySlug) &&
      categoryFetched &&
      filters.categoryId === undefined &&
      !categoryFetchError) ||
    productsLoading

  const candlesHeaderImg = getValue('shop_candles_header_image_url' as keyof StoreSettings).trim()
  const candlesHeaderTitle = getValue('shop_candles_header_title' as keyof StoreSettings).trim()
  const shopIndexHeaderImg = getValue('shop_index_header_image_url' as keyof StoreSettings).trim()
  const shopIndexHeaderTitle = getValue('shop_index_header_title' as keyof StoreSettings).trim()

  const isShopIndex = !categorySlug
  const useShopIndexHero = isShopIndex && Boolean(shopIndexHeaderImg)
  const useCandlesHero = categorySlug === 'candles' && Boolean(candlesHeaderImg)
  const shopHeroImageSrc = useShopIndexHero ? shopIndexHeaderImg : candlesHeaderImg
  const hasShopHeroImage = useShopIndexHero || useCandlesHero

  const shopHeaderTitle =
    isShopIndex && shopIndexHeaderTitle
      ? shopIndexHeaderTitle
      : categorySlug === 'candles' && candlesHeaderTitle
        ? candlesHeaderTitle
        : currentCategory?.name || 'All Products'

  const handleFilterChange = (key: keyof ProductFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }))
  }

  const handleClearFilters = () => {
    setFilters({
      categoryId: currentCategory?.id,
      sortBy: 'newest',
      sortDir: 'desc',
      page: 0,
      pageSize: 12,
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

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.search || filters.color || filters.size

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div
        className={`relative py-12 md:py-16 overflow-hidden ${
          hasShopHeroImage ? '' : 'bg-gradient-to-r from-blush to-champagne'
        }`}
      >
        {hasShopHeroImage ? (
          <>
            <img
              src={shopHeroImageSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-charcoal/45" />
          </>
        ) : null}
        <div className="container-custom text-center relative z-10">
          <h1
            className={`heading-2 ${
              hasShopHeroImage ? 'text-soft-white drop-shadow-sm' : 'text-charcoal'
            }`}
          >
            {shopHeaderTitle}
          </h1>
          {currentCategory?.description && (
            <p
              className={`mt-4 max-w-2xl mx-auto ${
                hasShopHeroImage ? 'text-cream/90' : 'text-warm-gray'
              }`}
            >
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
                  {shopCategories?.map((cat) => (
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

              {/* Colors */}
              {filterOptions?.colors && filterOptions.colors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-charcoal mb-3">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleFilterChange('color', filters.color === color ? undefined : color)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          filters.color === color
                            ? 'bg-rose text-soft-white border-rose'
                            : 'bg-cream text-warm-gray border-blush hover:border-rose hover:text-charcoal'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {filterOptions?.sizes && filterOptions.sizes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-charcoal mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => handleFilterChange('size', filters.size === sz ? undefined : sz)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          filters.size === sz
                            ? 'bg-rose text-soft-white border-rose'
                            : 'bg-cream text-warm-gray border-blush hover:border-rose hover:text-charcoal'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                {filters.color && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose/10 text-rose text-sm rounded-full">
                    Color: {filters.color}
                    <button onClick={() => handleFilterChange('color', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.size && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose/10 text-rose text-sm rounded-full">
                    Size: {filters.size}
                    <button onClick={() => handleFilterChange('size', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid
              products={productsData?.content || []}
              loading={gridLoading}
              emptyMessage="No products found. Try adjusting your filters."
              priorityImageCount={12}
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
                {shopCategories?.map((cat) => (
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

            {/* Colors - Mobile */}
            {filterOptions?.colors && filterOptions.colors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-charcoal mb-3">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleFilterChange('color', filters.color === color ? undefined : color)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        filters.color === color
                          ? 'bg-rose text-soft-white border-rose'
                          : 'bg-cream text-warm-gray border-blush hover:border-rose hover:text-charcoal'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes - Mobile */}
            {filterOptions?.sizes && filterOptions.sizes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-charcoal mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleFilterChange('size', filters.size === sz ? undefined : sz)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        filters.size === sz
                          ? 'bg-rose text-soft-white border-rose'
                          : 'bg-cream text-warm-gray border-blush hover:border-rose hover:text-charcoal'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
