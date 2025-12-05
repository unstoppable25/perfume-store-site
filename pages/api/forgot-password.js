import { storeVerificationCode } from '../../lib/db'
import { sendPasswordResetEmail } from '../../lib/email'
import { getUserByEmailOrPhone } from '../../lib/db'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' })
  }

  try {
    // Check if user exists
    const user = await getUserByEmailOrPhone(email)
    
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset code has been sent'
      })
    }

    // Generate 6-digit code
    const code = generateCode()

    // Store in database
    await storeVerificationCode(email, code, 'password_reset')

    // Send email
    const emailResult = await sendPasswordResetEmail(email, code)

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Password reset code sent to your email'
      })
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email'
      })
    }
  } catch (err) {
    console.error('Forgot password error:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to send reset code'
    })
  }
}
