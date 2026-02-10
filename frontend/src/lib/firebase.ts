import { initializeApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'

// Firebase configuration - these are public keys (safe to expose)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Store recaptcha verifier instance
let recaptchaVerifier: RecaptchaVerifier | null = null

// Setup invisible reCAPTCHA
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  // Clear existing verifier if any
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
      console.log('reCAPTCHA verified')
    },
    'expired-callback': () => {
      // Reset reCAPTCHA
      console.log('reCAPTCHA expired')
    },
  })

  return recaptchaVerifier
}

// Send OTP to phone number
export async function sendOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  // Format phone number to E.164 if not already
  const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
  
  return signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier)
}

// Verify OTP and get user credential
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<string> {
  const result = await confirmationResult.confirm(otp)
  // Get the ID token to send to backend
  const idToken = await result.user.getIdToken()
  return idToken
}

// Get current user's ID token (for backend verification)
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

// Sign out from Firebase (after registration is complete)
export async function signOutFirebase(): Promise<void> {
  await auth.signOut()
}

export default app
