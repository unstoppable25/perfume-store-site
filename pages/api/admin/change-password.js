import requireAdmin from '../../lib/requireAdmin'
import { addSecurityHeaders } from '../../lib/security'

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res)

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  // Require admin authentication
  if (!requireAdmin(req, res)) return

  const { newPassword } = req.body

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' })
  }

  try {
    // In a production environment, you would update the environment variable
    // or store it securely. For now, we'll log the change and provide instructions.
    console.log(`[ADMIN SECURITY] Admin password change requested by admin at ${new Date().toISOString()}`)
    console.log(`[ADMIN SECURITY] New password: ${newPassword.substring(0, 3)}***`)

    // For Vercel deployment, the admin would need to update the ADMIN_SECURITY_ID environment variable
    // For local development, we could potentially update a .env file, but that's not recommended for production

    return res.status(200).json({
      success: true,
      message: 'Password change logged. For security, please update the ADMIN_SECURITY_ID environment variable manually in your deployment platform (Vercel, etc.)',
      note: 'Environment variables cannot be changed programmatically for security reasons.'
    })

  } catch (err) {
    console.error('Failed to change admin password:', err)
    return res.status(500).json({ success: false, message: 'Failed to change admin password', error: err.message })
  }
}