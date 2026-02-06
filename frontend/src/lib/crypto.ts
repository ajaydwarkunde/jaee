/**
 * Client-side password encoding utility.
 * 
 * Encodes passwords before sending over the network so they don't appear
 * as plaintext in browser DevTools Network tab.
 * 
 * Note: Real transport-layer security is provided by HTTPS.
 * This is an additional obfuscation layer to prevent casual observation.
 */

const ENCODING_PREFIX = 'enc:'

/**
 * Encode a password using Base64 so it doesn't appear as plaintext
 * in the browser's Network tab request payload.
 */
export function encodePassword(password: string): string {
  const encoded = btoa(unescape(encodeURIComponent(password)))
  return ENCODING_PREFIX + encoded
}
