import { createMessage } from '../../lib/db'
import { addSecurityHeaders } from '../../lib/security'

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res)
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    if (!email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address' })
    }

    const contactMessage = {
      id: 'MSG-' + Date.now(),
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString()
    }

    await createMessage(contactMessage)

    return res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully!' 
    })

  } catch (err) {
    console.error('Contact form error:', err)
    return res.status(500).json({ success: false, message: 'Failed to send message' })
  }
}
