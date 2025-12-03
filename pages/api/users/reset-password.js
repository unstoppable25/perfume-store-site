import { updateUserPassword } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { userId, newPassword } = req.body

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'User ID and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const result = await updateUserPassword(userId, newPassword)
    
    if (result.success) {
      return res.status(200).json(result)
    } else {
      return res.status(404).json(result)
    }

  } catch (err) {
    console.error('Reset password error:', err)
    return res.status(500).json({ success: false, message: 'Failed to reset password: ' + err.message })
  }
}
