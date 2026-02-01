import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [showPassword, setShowPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordForm) => 
      authService.resetPassword(token!, data.newPassword),
    onSuccess: () => {
      setResetSuccess(true)
      toast.success('Password reset successfully!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password')
    }
  }, [token, navigate])

  if (!token) {
    return null
  }

  if (resetSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blush via-cream to-champagne py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-soft-white rounded-2xl shadow-soft-xl p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="heading-4 text-charcoal mb-2">Password Reset!</h1>
            <p className="text-warm-gray mb-8">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Link to="/login">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blush via-cream to-champagne py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-soft-white rounded-2xl shadow-soft-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-3xl font-semibold text-rose">
              JAEE
            </Link>
            <h1 className="heading-4 text-charcoal mt-4">Reset Password</h1>
            <p className="text-warm-gray mt-2">
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit((data) => resetPasswordMutation.mutate(data))}>
            <div className="space-y-4">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...form.register('newPassword')}
                error={form.formState.errors.newPassword?.message}
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

            {/* Password requirements hint */}
            <div className="mt-4 p-3 bg-blush/50 rounded-lg">
              <p className="text-xs text-warm-gray">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Password must be at least 8 characters long
              </p>
            </div>

            <Button
              type="submit"
              loading={resetPasswordMutation.isPending}
              className="w-full mt-6"
            >
              Reset Password
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-warm-gray text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-rose font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
