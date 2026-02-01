import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordForm) => authService.forgotPassword(data.email),
    onSuccess: (_, variables) => {
      setEmailSent(true)
      setSentEmail(variables.email)
      toast.success('Password reset email sent!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  if (emailSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blush via-cream to-champagne py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-soft-white rounded-2xl shadow-soft-xl p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="heading-4 text-charcoal mb-2">Check Your Email</h1>
            <p className="text-warm-gray mb-6">
              We've sent a password reset link to<br />
              <span className="font-medium text-charcoal">{sentEmail}</span>
            </p>
            <p className="text-sm text-warm-gray mb-8">
              The link will expire in 15 minutes. If you don't see the email, check your spam folder.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setEmailSent(false)
                  form.reset()
                }}
                variant="outline"
                className="w-full"
              >
                Send Again
              </Button>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
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
            <Link to="/" className="inline-block">
              <img src="/logo.png" alt="Jaee" className="h-12 w-auto mx-auto" />
            </Link>
            <h1 className="heading-4 text-charcoal mt-4">Forgot Password?</h1>
            <p className="text-warm-gray mt-2">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit((data) => forgotPasswordMutation.mutate(data))}>
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
                icon={<Mail className="w-5 h-5" />}
              />
            </div>

            <Button
              type="submit"
              loading={forgotPasswordMutation.isPending}
              className="w-full mt-6"
            >
              Send Reset Link
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="text-rose font-medium hover:underline inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
