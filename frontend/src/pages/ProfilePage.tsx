import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Save, Lock, Shield, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { getInitials } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import type { TwoFactorSetupResponse } from '@/types'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
  })
  const [loading, setLoading] = useState(false)

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Mobile change state
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [mobileStep, setMobileStep] = useState<'input' | 'otp'>('input')
  const [newMobileNumber, setNewMobileNumber] = useState('')
  const [mobileOtp, setMobileOtp] = useState('')
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [mobileLoading, setMobileLoading] = useState(false)

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetupResponse | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Profile update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const updatedUser = await authService.updateProfile({ name: formData.name })
      updateUser(updatedUser)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Password change handlers
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Password changed successfully')
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Mobile change handlers
  const handleRequestMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMobileLoading(true)
    
    try {
      const response = await authService.requestMobileChangeOtp({ newMobileNumber })
      setDevOtp(response.devOtp)
      setMobileStep('otp')
      toast.success('OTP sent to your new mobile number')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setMobileLoading(false)
    }
  }

  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMobileLoading(true)
    
    try {
      const updatedUser = await authService.verifyAndChangeMobile({
        newMobileNumber,
        otp: mobileOtp,
      })
      updateUser(updatedUser)
      toast.success('Mobile number updated successfully')
      setShowMobileModal(false)
      resetMobileState()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setMobileLoading(false)
    }
  }

  const resetMobileState = () => {
    setMobileStep('input')
    setNewMobileNumber('')
    setMobileOtp('')
    setDevOtp(null)
  }

  // 2FA handlers
  const handleSetup2FA = async () => {
    setTwoFactorLoading(true)
    try {
      const setup = await authService.setup2FA()
      setTwoFactorSetup(setup)
      setShow2FAModal(true)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to setup 2FA')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setTwoFactorLoading(true)
    
    try {
      await authService.enable2FA({ code: twoFactorCode })
      updateUser({ twoFactorEnabled: true })
      toast.success('Two-factor authentication enabled!')
      setShow2FAModal(false)
      setTwoFactorSetup(null)
      setTwoFactorCode('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    const code = prompt('Enter your 2FA code to disable:')
    if (!code) return

    setTwoFactorLoading(true)
    try {
      await authService.disable2FA({ code })
      updateUser({ twoFactorEnabled: false })
      toast.success('Two-factor authentication disabled')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom max-w-2xl">
        {/* Back Link */}
        <Link
          to="/account"
          className="inline-flex items-center text-warm-gray hover:text-charcoal mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        <h1 className="heading-2 text-charcoal mb-8">Profile Settings</h1>

        {/* Profile Card */}
        <div className="bg-soft-white rounded-xl shadow-soft overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-rose to-blush p-8 text-center">
            <div className="w-24 h-24 bg-soft-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-rose text-3xl font-serif font-medium">
                {getInitials(user?.name || user?.email)}
              </span>
            </div>
            <h2 className="font-serif text-xl font-medium text-soft-white">
              {user?.name || 'Welcome!'}
            </h2>
            <p className="text-soft-white/80 text-sm mt-1">
              Member since {new Date().getFullYear()}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                placeholder="No email set"
              />
              {user?.email && (
                <p className="text-xs text-warm-gray mt-1">
                  ✓ Email verified
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Mobile Number
              </label>
              <div className="flex gap-2">
                <Input
                  value={user?.mobileNumber || ''}
                  disabled
                  placeholder="No mobile set"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileModal(true)}
                >
                  {user?.mobileNumber ? 'Change' : 'Add'}
                </Button>
              </div>
              {user?.mobileNumber && (
                <p className="text-xs text-warm-gray mt-1">
                  ✓ Mobile verified
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-blush flex gap-4">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: user?.name || '',
                      })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    icon={<Save className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Account Security */}
        <div className="mt-6 bg-soft-white rounded-xl p-6 shadow-soft">
          <h3 className="font-medium text-charcoal mb-4">Account Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-blush">
              <div>
                <p className="text-charcoal flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </p>
                <p className="text-sm text-warm-gray">Secure your account with a strong password</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-charcoal flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-warm-gray">
                  {user?.twoFactorEnabled 
                    ? '✓ Enabled - Your account is extra secure' 
                    : 'Add an extra layer of security'}
                </p>
              </div>
              <Button 
                variant={user?.twoFactorEnabled ? 'outline' : 'primary'}
                size="sm"
                onClick={user?.twoFactorEnabled ? handleDisable2FA : handleSetup2FA}
                loading={twoFactorLoading}
              >
                {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        }}
        title="Change Password"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={passwordLoading} className="flex-1">
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mobile Change Modal */}
      <Modal
        isOpen={showMobileModal}
        onClose={() => {
          setShowMobileModal(false)
          resetMobileState()
        }}
        title={mobileStep === 'input' ? 'Change Mobile Number' : 'Verify OTP'}
      >
        {mobileStep === 'input' ? (
          <form onSubmit={handleRequestMobileOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                New Mobile Number
              </label>
              <Input
                type="tel"
                value={newMobileNumber}
                onChange={(e) => setNewMobileNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
              />
              <p className="text-xs text-warm-gray mt-1">
                We'll send an OTP to verify this number
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMobileModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={mobileLoading} className="flex-1">
                Send OTP
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
            <p className="text-sm text-warm-gray">
              Enter the 6-digit OTP sent to {newMobileNumber}
            </p>
            {devOtp && (
              <div className="bg-blush/50 border border-rose/30 rounded-lg p-3">
                <p className="text-xs text-rose font-medium">Dev Mode - OTP:</p>
                <p className="text-lg font-mono font-bold text-charcoal">{devOtp}</p>
              </div>
            )}
            <div>
              <Input
                type="text"
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
                className="text-center text-xl tracking-widest"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMobileStep('input')}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" loading={mobileLoading} className="flex-1">
                Verify & Update
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => {
          setShow2FAModal(false)
          setTwoFactorSetup(null)
          setTwoFactorCode('')
        }}
        title="Setup Two-Factor Authentication"
      >
        {twoFactorSetup && (
          <form onSubmit={handleEnable2FA} className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-warm-gray mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img 
                  src={twoFactorSetup.qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <div className="bg-blush/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-warm-gray mb-1">Or enter this key manually:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-sm font-mono text-charcoal break-all">
                    {twoFactorSetup.manualEntryKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(twoFactorSetup.manualEntryKey)}
                    className="text-rose hover:text-dusty-rose"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Enter the 6-digit code from your app
              </label>
              <Input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="text-center text-xl tracking-widest"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShow2FAModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={twoFactorLoading} className="flex-1">
                Enable 2FA
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
