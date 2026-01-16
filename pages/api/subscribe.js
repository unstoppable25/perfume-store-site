import { addSubscriber } from '../../lib/db'
import { addSecurityHeaders } from '../../lib/security'

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res)
  if (req.method === 'POST') {
    const { email } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' })
    }

    try {
      // Save to database
      const result = await addSubscriber(email)

      if (result.alreadySubscribed) {
        return res.status(200).json({ message: 'You are already subscribed.' })
      }

      // If Mailchimp env vars exist, also subscribe to Mailchimp
      const apiKey = process.env.MAILCHIMP_API_KEY
      const audienceId = process.env.MAILCHIMP_AUDIENCE_ID

      if (apiKey && audienceId) {
        try {
          const dc = apiKey.split('-')[1]
          if (dc) {
            const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`
            const body = { email_address: email, status: 'subscribed' }

            await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `apikey ${apiKey}`,
              },
              body: JSON.stringify(body),
            })
          }
        } catch (mailchimpError) {
          console.warn('Mailchimp sync failed:', mailchimpError)
        }
      }

      return res.status(200).json({ message: 'Thanks for subscribing! Check your email.' })
    } catch (error) {
      console.error('Subscription error:', error)
      return res.status(500).json({ message: 'Subscription failed' })
    }
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).json({ message: 'Method not allowed' })
}
