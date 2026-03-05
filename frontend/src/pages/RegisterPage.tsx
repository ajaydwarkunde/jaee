import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { authService } from '@/services/authService'
import { cartService } from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { getErrorMessage } from '@/lib/api'
import { signOutFirebase } from '@/lib/firebase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PhoneVerification from '@/components/auth/PhoneVerification'
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

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const registerMutation = useMutation({
    mutationFn: (data: { formData: RegisterForm; firebaseToken: string }) => 
      authService.register({
        name: data.formData.name,
        email: data.formData.email,
        mobileNumber: data.formData.mobileNumber,
        password: data.formData.password,
        firebaseToken: data.firebaseToken,
      }),
    onSuccess: async (data) => {
      // Sign out from Firebase (we only used it for phone verification)
      await signOutFirebase()
      
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
      // Go back to details step on error
      setStep('details')
    },
  })

  // Handle form submission - move to verification step
  const handleFormSubmit = (data: RegisterForm) => {
    // Format phone number
    const formattedData = {
      ...data,
      mobileNumber: data.mobileNumber.startsWith('+') 
        ? data.mobileNumber 
        : `+91${data.mobileNumber}`,
    }
    setFormData(formattedData)
    setStep('verify')
  }

  // Handle phone verification complete
  const handlePhoneVerified = (firebaseToken: string) => {
    if (!formData) return
    registerMutation.mutate({ formData, firebaseToken })
  }

  // Go back to details step
  const handleBack = () => {
    setStep('details')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blush via-cream to-champagne py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-soft-white rounded-2xl shadow-soft-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <Logo size="lg" className="mx-auto" linkTo={false} />
            </Link>
            <h1 className="heading-4 text-charcoal mt-4">
              {step === 'details' ? 'Create Account' : 'Verify Phone'}
            </h1>
            <p className="text-warm-gray mt-2">
              {step === 'details' 
                ? 'Join the Jaai community' 
                : 'One last step to secure your account'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-rose' : 'bg-rose/30'}`} />
            <div className="w-8 h-0.5 bg-rose/30" />
            <div className={`w-3 h-3 rounded-full ${step === 'verify' ? 'bg-rose' : 'bg-rose/30'}`} />
          </div>

          {step === 'details' && (
            <>
              {/* Form */}
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

                <Button
                  type="submit"
                  className="w-full mt-6"
                >
                  Continue
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
            </>
          )}

          {step === 'verify' && formData && (
            <>
              {/* Back button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-warm-gray hover:text-charcoal mb-4 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to details
              </button>

              {/* Phone verification */}
              <PhoneVerification
                phoneNumber={formData.mobileNumber}
                onVerified={handlePhoneVerified}
                onCancel={handleBack}
              />

              {registerMutation.isPending && (
                <div className="mt-4 text-center text-sm text-warm-gray">
                  Creating your account...
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
