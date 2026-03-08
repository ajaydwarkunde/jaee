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
import { signInWithGoogle, signOutFirebase } from '@/lib/firebase'
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

  // Google sign-in
  const [googleLoading, setGoogleLoading] = useState(false)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const idToken = await signInWithGoogle()
      const data = await authService.socialLogin(idToken, 'GOOGLE')
      await signOutFirebase()
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Welcome!')
      mergeCartAndNavigate()
    } catch (error) {
      const msg = getErrorMessage(error)
      if (!msg.includes('popup-closed')) {
        toast.error(msg)
      }
    } finally {
      setGoogleLoading(false)
    }
  }

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

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-warm-gray/30 rounded-xl bg-soft-white hover:bg-blush/50 transition-colors font-medium text-charcoal disabled:opacity-60 mb-6"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-warm-gray/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-soft-white text-warm-gray">or</span>
            </div>
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
