import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'
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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid mobile number (e.g. +919876543210)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>
type Step = 'details' | 'verify'

export default function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { login } = useAuthStore()
  const { guestCart, clearGuestCart } = useCartStore()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<Step>('details')
  const [formData, setFormData] = useState<RegisterForm | null>(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [googleLoading, setGoogleLoading] = useState(false)
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      const idToken = await signInWithGoogle()
      const data = await authService.socialLogin(idToken, 'GOOGLE')
      await signOutFirebase()
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Account created successfully!')
      if (guestCart.length > 0) {
        try {
          await cartService.mergeCart(guestCart)
          clearGuestCart()
          queryClient.invalidateQueries({ queryKey: ['cart'] })
        } catch { /* silent */ }
      }
      navigate('/')
    } catch (error) {
      const msg = getErrorMessage(error)
      if (!msg.includes('popup-closed')) {
        toast.error(msg)
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm & { emailOtp: string }) =>
      authService.register({
        name: data.name,
        email: data.email,
        mobileNumber: data.mobileNumber,
        password: data.password,
        emailOtp: data.emailOtp,
      }),
    onSuccess: async (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Account created successfully!')

      if (guestCart.length > 0) {
        try {
          await cartService.mergeCart(guestCart)
          clearGuestCart()
          queryClient.invalidateQueries({ queryKey: ['cart'] })
        } catch {
          /* silent */
        }
      }

      navigate('/')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
      setStep('verify')
    },
  })

  const handleFormSubmit = async (data: RegisterForm) => {
    const formattedData = {
      ...data,
      mobileNumber: data.mobileNumber.startsWith('+')
        ? data.mobileNumber
        : `+91${data.mobileNumber}`,
    }
    setFormData(formattedData)
    try {
      await authService.requestEmailOtp(formattedData.email)
      toast.success('Verification code sent to your email.')
      setOtp(['', '', '', '', '', ''])
      setOtpError(null)
      setStep('verify')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
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

  const handleCompleteRegistration = () => {
    if (!formData) return
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setOtpError('Please enter the complete 6-digit code')
      return
    }
    registerMutation.mutate({ ...formData, emailOtp: otpString })
  }

  const handleResendOtp = async () => {
    if (!formData) return
    try {
      await authService.requestEmailOtp(formData.email)
      toast.success('New code sent.')
      setOtp(['', '', '', '', '', ''])
      setOtpError(null)
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleBack = () => {
    setStep('details')
    setOtpError(null)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blush via-cream to-champagne py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-soft-white rounded-2xl shadow-soft-xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <Logo size="lg" className="mx-auto" linkTo={false} />
            </Link>
            <h1 className="heading-4 text-charcoal mt-4">
              {step === 'details' ? 'Create Account' : 'Verify your email'}
            </h1>
            <p className="text-warm-gray mt-2">
              {step === 'details'
                ? 'Join the Jaai community'
                : 'Enter the code we sent to your inbox'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-rose' : 'bg-rose/30'}`} />
            <div className="w-8 h-0.5 bg-rose/30" />
            <div className={`w-3 h-3 rounded-full ${step === 'verify' ? 'bg-rose' : 'bg-rose/30'}`} />
          </div>

          {step === 'details' && (
            <>
              <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Your name"
                    required
                    {...form.register('name')}
                    error={form.formState.errors.name?.message}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    {...form.register('email')}
                    error={form.formState.errors.email?.message}
                  />
                  <Input
                    label="Mobile Number"
                    type="tel"
                    placeholder="+919876543210"
                    required
                    {...form.register('mobileNumber')}
                    error={form.formState.errors.mobileNumber?.message}
                  />
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
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
                    required
                    {...form.register('confirmPassword')}
                    error={form.formState.errors.confirmPassword?.message}
                  />
                </div>

                <Button type="submit" className="w-full mt-6">
                  Continue
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-warm-gray/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-soft-white text-warm-gray">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                Sign up with Google
              </button>

              <div className="mt-6 text-center">
                <p className="text-warm-gray">
                  Already have an account?{' '}
                  <Link to="/login" className="text-rose font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === 'verify' && formData && (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-warm-gray hover:text-charcoal mb-4 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to details
              </button>

              <p className="text-sm text-warm-gray text-center mb-6 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                Code sent to <span className="font-medium text-charcoal">{formData.email}</span>
              </p>

              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-xl font-semibold border-2 border-warm-gray/30 rounded-lg focus:border-rose focus:ring-2 focus:ring-rose/20 outline-none transition-all bg-soft-white"
                    disabled={registerMutation.isPending}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-red-500 text-sm text-center mb-4">{otpError}</p>
              )}

              <Button
                type="button"
                onClick={handleCompleteRegistration}
                loading={registerMutation.isPending}
                disabled={otp.join('').length !== 6}
                className="w-full mb-4"
              >
                Create account
              </Button>

              <div className="flex justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => void handleResendOtp()}
                  disabled={registerMutation.isPending}
                  className="text-rose hover:underline"
                >
                  Resend code
                </button>
                <button type="button" onClick={handleBack} className="text-warm-gray hover:underline">
                  Change email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
