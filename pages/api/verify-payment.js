// Verify Paystack payment
import { addSecurityHeaders } from '../../lib/security'

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { reference } = req.query

  if (!reference) {
    return res.status(400).json({ message: 'Reference is required' })
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()

    if (data.status && data.data.status === 'success') {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: data.data
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: data.data
      })
    }
  } catch (err) {
    console.error('Error verifying payment:', err)
    return res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    })
  }
}
