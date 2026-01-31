import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, Tag, ShoppingBag, TrendingUp } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import Card, { CardContent, CardTitle } from '@/components/ui/Card'

export default function AdminDashboard() {
  const { data: products } = useQuery({
    queryKey: ['products', { size: 1 }],
    queryFn: () => productService.getProducts({ size: 1 }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const stats = [
    {
      title: 'Total Products',
      value: products?.totalElements || 0,
      icon: Package,
      link: '/admin/products',
      color: 'bg-rose/10 text-rose',
    },
    {
      title: 'Categories',
      value: categories?.length || 0,
      icon: Tag,
      link: '/admin/categories',
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Active Products',
      value: products?.totalElements || 0,
      icon: ShoppingBag,
      link: '/admin/products',
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Revenue',
      value: '₹0',
      icon: TrendingUp,
      link: '#',
      color: 'bg-charcoal/10 text-charcoal',
    },
  ]

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="heading-2 text-charcoal">Admin Dashboard</h1>
          <p className="text-warm-gray mt-2">Manage your store</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card hover className="h-full">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-gray">{stat.title}</p>
                    <p className="text-2xl font-serif font-semibold text-charcoal">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardTitle>Products</CardTitle>
            <CardContent>
              <p className="mb-4">Manage your product catalog</p>
              <Link to="/admin/products" className="text-rose hover:underline font-medium">
                View All Products →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardTitle>Categories</CardTitle>
            <CardContent>
              <p className="mb-4">Organize products into categories</p>
              <Link to="/admin/categories" className="text-rose hover:underline font-medium">
                Manage Categories →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
