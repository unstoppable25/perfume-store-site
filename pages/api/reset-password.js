import { verifyCode } from '../../lib/db'
import { getUserByEmailOrPhone, updateUserPassword } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, code, newPassword } = req.body

  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, code, and new password are required' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
  }

  try {
    // Verify the reset code
    const result = await verifyCode(email, code, 'password_reset')

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      })
    }

    // Get user
    const user = await getUserByEmailOrPhone(email)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Update password
    await updateUserPassword(user.id, newPassword)

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (err) {
    console.error('Reset password error:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    })
  }
}
