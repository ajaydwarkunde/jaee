import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react'
import { authService } from '@/services/authService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'no-token')
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (token) {
      verifyEmail()
    }
  }, [token])

  const verifyEmail = async () => {
    if (!token) return

    try {
      setStatus('loading')
      await authService.verifyEmail(token)
      setStatus('success')
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error?.response?.data?.message || 'Verification failed. The link may be expired or invalid.')
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    try {
      setIsResending(true)
      await authService.resendVerificationEmail(email)
      toast.success('Verification email sent! Please check your inbox.')
      setEmail('')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-soft-white rounded-2xl shadow-soft p-8 text-center">
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" />
              <h1 className="text-xl font-semibold mt-4">Verifying your email...</h1>
              <p className="text-charcoal/60 mt-2">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-xl font-semibold mt-4">Email Verified!</h1>
              <p className="text-charcoal/60 mt-2 mb-6">
                Your email has been successfully verified. You can now enjoy all features of your account.
              </p>
              <Link to="/account">
                <Button className="w-full">Go to My Account</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-error/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-error" />
              </div>
              <h1 className="text-xl font-semibold mt-4">Verification Failed</h1>
              <p className="text-charcoal/60 mt-2 mb-6">{errorMessage}</p>
              
              <div className="border-t pt-6">
                <p className="text-sm text-charcoal/60 mb-4">
                  Request a new verification email:
                </p>
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleResend}
                    disabled={isResending}
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {status === 'no-token' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-rose/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-rose" />
              </div>
              <h1 className="text-xl font-semibold mt-4">Verify Your Email</h1>
              <p className="text-charcoal/60 mt-2 mb-6">
                Enter your email address to receive a verification link.
              </p>
              
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Email
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Link to="/login" className="text-rose hover:underline text-sm">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
