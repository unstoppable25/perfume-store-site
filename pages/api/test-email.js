import { sendVerificationEmail, sendPasswordResetEmail } from '../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, type } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    let result
    const testCode = '123456'

    if (type === 'reset') {
      result = await sendPasswordResetEmail(email, testCode)
    } else {
      result = await sendVerificationEmail(email, testCode)
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId
      })
    } else {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to send email'
      })
    }
  } catch (err) {
    console.error('Test email error:', err)
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}
