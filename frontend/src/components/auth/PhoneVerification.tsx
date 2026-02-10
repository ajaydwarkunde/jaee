import { useState, useEffect, useRef } from 'react'
import { ConfirmationResult } from 'firebase/auth'
import { Phone, Shield, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { setupRecaptcha, sendOTP, verifyOTP } from '@/lib/firebase'
import Button from '@/components/ui/Button'

interface PhoneVerificationProps {
  phoneNumber: string
  onVerified: (idToken: string) => void
  onCancel?: () => void
}

type Step = 'send' | 'verify' | 'verified'

export default function PhoneVerification({
  phoneNumber,
  onVerified,
  onCancel,
}: PhoneVerificationProps) {
  const [step, setStep] = useState<Step>('send')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Format phone for display
  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 10) {
      const last4 = digits.slice(-4)
      const masked = '*'.repeat(digits.length - 4)
      return `+${masked}${last4}`
    }
    return phone
  }

  // Handle sending OTP
  const handleSendOTP = async () => {
    if (!recaptchaContainerRef.current) return

    setLoading(true)
    setError(null)

    try {
      const verifier = setupRecaptcha('recaptcha-container')
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
      const result = await sendOTP(formattedPhone, verifier)
      setConfirmationResult(result)
      setStep('verify')
      setCountdown(60) // 60 seconds cooldown
      // Focus first OTP input
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      console.error('OTP send error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP'
      if (errorMessage.includes('invalid-phone-number')) {
        setError('Invalid phone number format. Please use format: +91XXXXXXXXXX')
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Too many attempts. Please try again later.')
      } else if (errorMessage.includes('quota-exceeded')) {
        setError('SMS quota exceeded. Please try again later.')
      } else {
        setError('Failed to send OTP. Please check your phone number.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6)
      const newOtp = [...otp]
      digits.split('').forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit
        }
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else {
      const newOtp = [...otp]
      newOtp[index] = value.replace(/\D/g, '')
      setOtp(newOtp)
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!confirmationResult) return

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const idToken = await verifyOTP(confirmationResult, otpString)
      setStep('verified')
      // Small delay to show success state
      setTimeout(() => {
        onVerified(idToken)
      }, 1000)
    } catch (err: unknown) {
      console.error('OTP verify error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      if (errorMessage.includes('invalid-verification-code')) {
        setError('Invalid OTP. Please check and try again.')
      } else if (errorMessage.includes('code-expired')) {
        setError('OTP expired. Please request a new one.')
      } else {
        setError('Verification failed. Please try again.')
      }
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Handle resend
  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    setError(null)
    handleSendOTP()
  }

  return (
    <div className="bg-blush/30 rounded-xl p-6">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} />

      {step === 'send' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-rose" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">Verify Your Phone</h3>
          <p className="text-warm-gray text-sm mb-4">
            We'll send a 6-digit OTP to<br />
            <span className="font-medium text-charcoal">{phoneNumber}</span>
          </p>
          {error && (
            <p className="text-error text-sm mb-4 bg-error/10 p-3 rounded-lg">{error}</p>
          )}
          <div className="flex gap-3 justify-center">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                Change Number
              </Button>
            )}
            <Button onClick={handleSendOTP} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-rose" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">Enter OTP</h3>
          <p className="text-warm-gray text-sm mb-6">
            Enter the 6-digit code sent to<br />
            <span className="font-medium text-charcoal">{formatPhoneDisplay(phoneNumber)}</span>
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-12 text-center text-xl font-semibold border-2 border-warm-gray/30 rounded-lg focus:border-rose focus:ring-2 focus:ring-rose/20 outline-none transition-all"
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <p className="text-error text-sm mb-4 bg-error/10 p-3 rounded-lg">{error}</p>
          )}

          <Button
            onClick={handleVerifyOTP}
            disabled={loading || otp.join('').length !== 6}
            className="w-full mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>

          <div className="text-sm text-warm-gray">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-rose font-medium hover:underline inline-flex items-center gap-1"
                disabled={loading}
              >
                <RefreshCw className="w-3 h-3" />
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'verified' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">Phone Verified!</h3>
          <p className="text-warm-gray text-sm">
            Your phone number has been verified successfully.
          </p>
        </div>
      )}
    </div>
  )
}
