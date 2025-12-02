// Security gate verification API
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { securityId } = req.body

  // IMPORTANT: Change this to your own secure Security ID
  // Recommended: Use a long random string (at least 16 characters)
  const VALID_SECURITY_ID = process.env.ADMIN_SECURITY_ID || 'ScentLumus2025!SecureAccess#8893'

  if (securityId === VALID_SECURITY_ID) {
    return res.status(200).json({ success: true })
  }

  // Log failed attempt (in production, you might want to log IP addresses)
  console.log('[SECURITY] Failed admin gate attempt at:', new Date().toISOString())

  return res.status(401).json({ success: false, message: 'Invalid Security ID' })
}
