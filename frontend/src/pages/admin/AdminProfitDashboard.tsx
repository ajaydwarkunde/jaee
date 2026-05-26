import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminProfitDashboard() {
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-profit-orders', page],
    queryFn: () => orderService.getAllOrders({ status: 'SUCCESS', page, size: pageSize }),
  })

  const orders = ordersData?.content ?? []

  const totals = orders.reduce(
    (acc, o) => ({
      revenue: acc.revenue + o.totalAmount,
      expense: acc.expense + (o.totalExpense ?? 0),
      shipping: acc.shipping + (o.shippingAmount ?? 0),
      profit: acc.profit + (o.profit ?? 0),
    }),
    { revenue: 0, expense: 0, shipping: 0, profit: 0 },
  )

  if (isLoading) return <LoadingSpinner fullScreen />

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        <Link
          to="/admin"
          className="inline-flex items-center text-warm-gray hover:text-charcoal mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-rose/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-rose" />
          </div>
          <div>
            <h1 className="heading-2 text-charcoal">Profit Dashboard</h1>
            <p className="text-sm text-warm-gray">
              Revenue, expense and profit for successful orders only (paid, shipped, delivered)
            </p>
          </div>
        </div>

        {/* Summary cards for this page */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-soft-white rounded-xl shadow-soft p-5 text-center">
            <p className="text-xs text-warm-gray mb-1">Page Revenue</p>
            <p className="text-xl font-serif font-bold text-charcoal tabular-nums">{formatPrice(totals.revenue)}</p>
          </div>
          <div className="bg-soft-white rounded-xl shadow-soft p-5 text-center">
            <p className="text-xs text-warm-gray mb-1">Page Expense</p>
            <p className="text-xl font-serif font-bold text-charcoal tabular-nums">{formatPrice(totals.expense)}</p>
          </div>
          <div className="bg-soft-white rounded-xl shadow-soft p-5 text-center">
            <p className="text-xs text-warm-gray mb-1">Page Shipping</p>
            <p className="text-xl font-serif font-bold text-charcoal tabular-nums">{formatPrice(totals.shipping)}</p>
          </div>
          <div className="bg-soft-white rounded-xl shadow-soft p-5 text-center">
            <p className="text-xs text-warm-gray mb-1">Page Profit</p>
            <p className={`text-xl font-serif font-bold tabular-nums ${totals.profit >= 0 ? 'text-success' : 'text-error'}`}>
              {formatPrice(totals.profit)}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-soft-white rounded-xl shadow-soft p-12 text-center">
            <p className="text-warm-gray">No successful orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-blush bg-soft-white">
            <table className="w-full text-sm text-charcoal min-w-[900px]">
              <thead className="bg-blush/35 text-left">
                <tr>
                  <th className="p-3 font-normal text-warm-gray">Order</th>
                  <th className="p-3 font-normal text-warm-gray">Buyer</th>
                  <th className="p-3 font-normal text-warm-gray">Status</th>
                  <th className="p-3 font-normal text-warm-gray">Date</th>
                  <th className="p-3 font-normal text-warm-gray text-right">Order Total</th>
                  <th className="p-3 font-normal text-warm-gray text-right">Expense</th>
                  <th className="p-3 font-normal text-warm-gray text-right">Shipping</th>
                  <th className="p-3 font-normal text-warm-gray text-right">Discount</th>
                  <th className="p-3 font-normal text-warm-gray text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const orderProfit = order.profit
                  return (
                    <tr key={order.id} className="border-t border-blush/80 hover:bg-blush/10">
                      <td className="p-3">
                        <Link
                          to={`/admin/orders?orderId=${order.id}`}
                          className="text-rose hover:underline font-medium"
                        >
                          #{order.id}
                        </Link>
                      </td>
                      <td className="p-3 text-charcoal">{order.userName || order.customerEmail || '—'}</td>
                      <td className="p-3">
                        <Badge variant={order.status === 'FULFILLED' ? 'success' : order.status === 'SHIPPED' ? 'default' : 'success'}>
                          {order.displayStatus || order.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-warm-gray whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="p-3 text-right tabular-nums">{formatPrice(order.totalAmount, order.currency)}</td>
                      <td className="p-3 text-right tabular-nums text-warm-gray">
                        {order.totalExpense != null ? formatPrice(order.totalExpense, order.currency) : '—'}
                      </td>
                      <td className="p-3 text-right tabular-nums text-warm-gray">
                        {formatPrice(order.shippingAmount ?? 0, order.currency)}
                      </td>
                      <td className="p-3 text-right tabular-nums text-warm-gray">
                        {order.discountAmount ? formatPrice(order.discountAmount, order.currency) : '—'}
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        {orderProfit != null ? (
                          <Badge variant={orderProfit >= 0 ? 'success' : 'error'}>
                            {formatPrice(orderProfit, order.currency)}
                          </Badge>
                        ) : (
                          <span className="text-warm-gray">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {ordersData && ordersData.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={ordersData.first}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <span className="text-sm text-warm-gray">
              Page {ordersData.page + 1} of {ordersData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={ordersData.last}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
