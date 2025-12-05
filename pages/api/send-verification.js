import { storeVerificationCode } from '../../lib/db'
import { sendVerificationEmail } from '../../lib/email'

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
    // Generate 6-digit code
    const code = generateCode()

    // Store in database
    await storeVerificationCode(email, code, 'email_verification')

    // Send email
    const emailResult = await sendVerificationEmail(email, code)

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Verification code sent to your email'
      })
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      })
    }
  } catch (err) {
    console.error('Send verification code error:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    })
  }
}
