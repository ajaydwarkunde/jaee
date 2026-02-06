import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, Phone, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/authService'
import { cartService } from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { getErrorMessage } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import Logo from '@/components/ui/Logo'

const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const otpRequestSchema = z.object({
  mobileNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'),
})

const otpVerifySchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

type EmailLoginForm = z.infer<typeof emailLoginSchema>
type OtpRequestForm = z.infer<typeof otpRequestSchema>
type OtpVerifyForm = z.infer<typeof otpVerifySchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { login } = useAuthStore()
  const { guestCart, clearGuestCart } = useCartStore()

  const [authMode, setAuthMode] = useState<'email' | 'mobile'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [mobileNumber, setMobileNumber] = useState('')
  const [devOtp, setDevOtp] = useState<string | null>(null)  // OTP shown in dev mode

  const from = (location.state as { from?: string })?.from || '/'

  // Email login form
  const emailForm = useForm<EmailLoginForm>({
    resolver: zodResolver(emailLoginSchema),
  })

  // OTP request form
  const otpRequestForm = useForm<OtpRequestForm>({
    resolver: zodResolver(otpRequestSchema),
  })

  // OTP verify form
  const otpVerifyForm = useForm<OtpVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
  })

  // Merge cart after login
  const mergeCartAndNavigate = async () => {
    if (guestCart.length > 0) {
      try {
        await cartService.mergeCart(guestCart)
        clearGuestCart()
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      } catch {
        // Cart merge failed silently
      }
    }
    navigate(from, { replace: true })
  }

  // Email login mutation
  const emailLoginMutation = useMutation({
    mutationFn: (data: EmailLoginForm) => authService.login(data),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Welcome back!')
      mergeCartAndNavigate()
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  // OTP request mutation
  const otpRequestMutation = useMutation({
    mutationFn: (data: OtpRequestForm) => authService.requestOtp(data),
    onSuccess: (response) => {
      setOtpSent(true)
      setMobileNumber(otpRequestForm.getValues('mobileNumber'))
      
      // In dev mode, show OTP on screen
      if (response.devOtp) {
        setDevOtp(response.devOtp)
        toast.success('🧪 Dev Mode: OTP shown on screen')
      } else {
        setDevOtp(null)
        toast.success('OTP sent to your mobile!')
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  // OTP verify mutation
  const otpVerifyMutation = useMutation({
    mutationFn: (data: OtpVerifyForm) =>
      authService.verifyOtp({ mobileNumber, otp: data.otp }),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Welcome!')
      mergeCartAndNavigate()
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
            <Logo size="lg" className="mx-auto" />
            <h1 className="heading-4 text-charcoal mt-4">Welcome Back</h1>
            <p className="text-warm-gray mt-2">Sign in to your account</p>
          </div>

          {/* Auth Mode Tabs */}
          <div className="flex mb-6 bg-blush rounded-lg p-1">
            <button
              onClick={() => {
                setAuthMode('email')
                setOtpSent(false)
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                authMode === 'email'
                  ? 'bg-soft-white text-charcoal shadow-soft'
                  : 'text-warm-gray'
              }`}
            >
              <Mail className="w-4 h-4 inline-block mr-2" />
              Email
            </button>
            <button
              onClick={() => {
                setAuthMode('mobile')
                setOtpSent(false)
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                authMode === 'mobile'
                  ? 'bg-soft-white text-charcoal shadow-soft'
                  : 'text-warm-gray'
              }`}
            >
              <Phone className="w-4 h-4 inline-block mr-2" />
              Mobile OTP
            </button>
          </div>

          {/* Email Login Form */}
          {authMode === 'email' && (
            <form onSubmit={emailForm.handleSubmit((data) => emailLoginMutation.mutate(data))}>
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  {...emailForm.register('email')}
                  error={emailForm.formState.errors.email?.message}
                />
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...emailForm.register('password')}
                  error={emailForm.formState.errors.password?.message}
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
              </div>

              <div className="flex justify-end mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-rose hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                loading={emailLoginMutation.isPending}
                className="w-full mt-4"
              >
                Sign In
              </Button>
            </form>
          )}

          {/* Mobile OTP Forms */}
          {authMode === 'mobile' && !otpSent && (
            <form onSubmit={otpRequestForm.handleSubmit((data) => otpRequestMutation.mutate(data))}>
              <div className="space-y-4">
                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...otpRequestForm.register('mobileNumber')}
                  error={otpRequestForm.formState.errors.mobileNumber?.message}
                  icon={<Phone className="w-5 h-5" />}
                />
              </div>

              <Button
                type="submit"
                loading={otpRequestMutation.isPending}
                className="w-full mt-6"
              >
                Send OTP
              </Button>
            </form>
          )}

          {authMode === 'mobile' && otpSent && (
            <form onSubmit={otpVerifyForm.handleSubmit((data) => otpVerifyMutation.mutate(data))}>
              <div className="space-y-4">
                <p className="text-sm text-warm-gray text-center mb-4">
                  OTP sent to <span className="font-medium text-charcoal">{mobileNumber}</span>
                </p>
                
                {/* Dev Mode OTP Display */}
                {devOtp && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-amber-800 text-sm font-medium text-center">
                      🧪 Dev Mode - Your OTP:
                    </p>
                    <p className="text-amber-900 text-3xl font-mono font-bold text-center mt-2 tracking-widest">
                      {devOtp}
                    </p>
                    <p className="text-amber-600 text-xs text-center mt-2">
                      SMS is not configured. In production, OTP will be sent via SMS.
                    </p>
                  </div>
                )}
                
                <Input
                  label="Enter OTP"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  {...otpVerifyForm.register('otp')}
                  error={otpVerifyForm.formState.errors.otp?.message}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                loading={otpVerifyMutation.isPending}
                className="w-full mt-6"
              >
                Verify OTP
              </Button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false)
                  setDevOtp(null)
                  otpVerifyForm.reset()
                }}
                className="w-full mt-3 text-sm text-rose hover:underline"
              >
                Change number
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-warm-gray">
              Don't have an account?{' '}
              <Link to="/register" className="text-rose font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
