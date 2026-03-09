import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, Eye, EyeOff } from 'lucide-react'
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

const emailOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type EmailLoginForm = z.infer<typeof emailLoginSchema>
type EmailOtpForm = z.infer<typeof emailOtpSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { login } = useAuthStore()
  const { guestCart, clearGuestCart } = useCartStore()

  const [authMode, setAuthMode] = useState<'password' | 'emailOtp'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const from = (location.state as { from?: string })?.from || '/'

  const emailForm = useForm<EmailLoginForm>({
    resolver: zodResolver(emailLoginSchema),
  })

  const emailOtpForm = useForm<EmailOtpForm>({
    resolver: zodResolver(emailOtpSchema),
  })

  const mergeCartAndNavigate = async () => {
    if (guestCart.length > 0) {
      try {
        await cartService.mergeCart(guestCart)
        clearGuestCart()
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      } catch { /* silent */ }
    }
    navigate(from, { replace: true })
  }

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

  // Request email OTP
  const requestOtpMutation = useMutation({
    mutationFn: (email: string) => authService.requestEmailOtp(email),
    onSuccess: () => {
      setOtpSent(true)
      toast.success('OTP sent to your email!')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  // Verify email OTP
  const verifyOtpMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => authService.verifyEmailOtp(data.email, data.otp),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Welcome!')
      mergeCartAndNavigate()
    },
    onError: (error) => {
      setOtpError(getErrorMessage(error))
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
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

  const handleEmailOtpSubmit = (data: EmailOtpForm) => {
    setOtpEmail(data.email)
    requestOtpMutation.mutate(data.email)
  }

  const handleOtpChange = (index: number, value: string) => {
    setOtpError(null)
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      const newOtp = [...otp]
      digits.split('').forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else {
      const newOtp = [...otp]
      newOtp[index] = value.replace(/\D/g, '')
      setOtp(newOtp)
      if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP')
      return
    }
    verifyOtpMutation.mutate({ email: otpEmail, otp: otpString })
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

          {/* Auth Mode Tabs */}
          <div className="flex mb-6 bg-blush rounded-lg p-1">
            <button
              onClick={() => {
                setAuthMode('password')
                setOtpSent(false)
                setOtpError(null)
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                authMode === 'password'
                  ? 'bg-soft-white text-charcoal shadow-soft'
                  : 'text-warm-gray'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setAuthMode('emailOtp')
                setOtpSent(false)
                setOtpError(null)
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                authMode === 'emailOtp'
                  ? 'bg-soft-white text-charcoal shadow-soft'
                  : 'text-warm-gray'
              }`}
            >
              <Mail className="w-4 h-4 inline-block mr-1" />
              Email OTP
            </button>
          </div>

          {/* Password Login Form */}
          {authMode === 'password' && (
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

          {/* Email OTP - Request */}
          {authMode === 'emailOtp' && !otpSent && (
            <form onSubmit={emailOtpForm.handleSubmit(handleEmailOtpSubmit)}>
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  {...emailOtpForm.register('email')}
                  error={emailOtpForm.formState.errors.email?.message}
                  icon={<Mail className="w-5 h-5" />}
                />
              </div>
              <p className="text-warm-gray text-xs mt-2">
                We'll send a 6-digit code to your email
              </p>

              <Button
                type="submit"
                loading={requestOtpMutation.isPending}
                className="w-full mt-4"
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* Email OTP - Verify */}
          {authMode === 'emailOtp' && otpSent && (
            <div>
              <p className="text-sm text-warm-gray text-center mb-6">
                Enter the 6-digit code sent to<br />
                <span className="font-medium text-charcoal">{otpEmail}</span>
              </p>

              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-xl font-semibold border-2 border-warm-gray/30 rounded-lg focus:border-rose focus:ring-2 focus:ring-rose/20 outline-none transition-all bg-soft-white"
                    disabled={verifyOtpMutation.isPending}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-red-500 text-sm text-center mb-4">{otpError}</p>
              )}

              <Button
                onClick={handleVerifyOtp}
                loading={verifyOtpMutation.isPending}
                disabled={otp.join('').length !== 6}
                className="w-full mb-4"
              >
                Verify & Sign In
              </Button>

              <div className="flex justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setOtp(['', '', '', '', '', ''])
                    setOtpError(null)
                    requestOtpMutation.mutate(otpEmail)
                  }}
                  disabled={requestOtpMutation.isPending}
                  className="text-rose hover:underline"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp(['', '', '', '', '', ''])
                    setOtpError(null)
                  }}
                  className="text-warm-gray hover:underline"
                >
                  Change email
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-warm-gray/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-soft-white text-warm-gray">or</span>
            </div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-warm-gray/30 rounded-xl bg-soft-white hover:bg-blush/50 transition-colors font-medium text-charcoal disabled:opacity-60"
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

          {/* Footer */}
          <div className="mt-6 text-center">
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
