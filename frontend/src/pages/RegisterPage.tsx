import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/authService'
import { cartService } from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { getErrorMessage } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { login } = useAuthStore()
  const { guestCart, clearGuestCart } = useCartStore()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) => authService.register({
      name: data.name,
      email: data.email,
      password: data.password,
    }),
    onSuccess: async (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Account created successfully!')
      
      // Merge guest cart
      if (guestCart.length > 0) {
        try {
          await cartService.mergeCart(guestCart)
          clearGuestCart()
          queryClient.invalidateQueries({ queryKey: ['cart'] })
        } catch {
          // Cart merge failed silently
        }
      }
      
      navigate('/')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blush via-cream to-champagne py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-soft-white rounded-2xl shadow-soft-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-3xl font-semibold text-rose">
              JAEE
            </Link>
            <h1 className="heading-4 text-charcoal mt-4">Create Account</h1>
            <p className="text-warm-gray mt-2">Join the Jaee community</p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}>
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Your name"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...form.register('password')}
                error={form.formState.errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-warm-gray hover:text-charcoal"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...form.register('confirmPassword')}
                error={form.formState.errors.confirmPassword?.message}
              />
            </div>

            <Button
              type="submit"
              loading={registerMutation.isPending}
              className="w-full mt-6"
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-warm-gray">
              Already have an account?{' '}
              <Link to="/login" className="text-rose font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
