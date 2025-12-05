import { verifyCode } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and code are required' })
  }

  try {
    // Verify the code
    const result = await verifyCode(email, code, 'email_verification')

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      })
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      })
    }
  } catch (err) {
    console.error('Verify code error:', err)
    return res.status(500).json({
      success: false,
      message: 'Verification failed'
    })
  }
}
