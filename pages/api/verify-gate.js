// Security gate verification API
import { rateLimit } from '../../lib/rateLimit'
import { sanitizeString } from '../../lib/validation'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  // Rate limiting: 5 attempts per 15 minutes per IP
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
  const rateLimitResult = rateLimit(`gate_${clientIP}`, 5, 15 * 60 * 1000)

  if (!rateLimitResult.allowed) {
    console.log(`[SECURITY AUDIT] Rate limit exceeded for IP: ${clientIP}`)
    return res.status(429).json({
      success: false,
      message: rateLimitResult.message
    })
  }

  const { securityId } = req.body

  // Validate and sanitize input
  if (!securityId || typeof securityId !== 'string') {
    console.log(`[SECURITY AUDIT] Invalid input format from IP: ${clientIP}`)
    return res.status(400).json({ success: false, message: 'Invalid input format' })
  }

  const sanitizedId = sanitizeString(securityId, 100) // Max 100 chars

  if (sanitizedId.length < 8) {
    console.log(`[SECURITY AUDIT] Security ID too short from IP: ${clientIP}`)
    return res.status(400).json({ success: false, message: 'Security ID must be at least 8 characters' })
  }

  // IMPORTANT: Change this to your own secure Security ID
  // Recommended: Use a long random string (at least 16 characters)
  const VALID_SECURITY_ID = process.env.ADMIN_SECURITY_ID

  if (!VALID_SECURITY_ID) {
    console.error('[SECURITY] ADMIN_SECURITY_ID environment variable not set!')
    return res.status(500).json({ success: false, message: 'Server configuration error' })
  }

  if (sanitizedId === VALID_SECURITY_ID) {
    console.log(`[SECURITY AUDIT] Successful admin gate access from IP: ${clientIP} at:`, new Date().toISOString())
    return res.status(200).json({ success: true })
  }

  // Log failed attempt with IP for monitoring
  console.log(`[SECURITY AUDIT] Failed admin gate attempt from IP: ${clientIP} at:`, new Date().toISOString(), 'Input length:', sanitizedId.length)

  return res.status(401).json({ success: false, message: 'Invalid Security ID' })
}
