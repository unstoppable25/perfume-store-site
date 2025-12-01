export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // If Mailchimp env vars exist, attempt to subscribe the user.
    const apiKey = process.env.MAILCHIMP_API_KEY
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID

    if (!apiKey || !audienceId) {
      // Env not configured — return success message but inform user in logs.
      console.warn('Mailchimp not configured. Set MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID in .env.local')
      return res.status(200).json({ message: 'Thanks for subscribing! (Mailchimp not configured locally)' })
    }

    try {
      // Mailchimp expects the datacenter as the suffix after the '-' in the API key
      const dc = apiKey.split('-')[1]
      if (!dc) throw new Error('Invalid Mailchimp API key format')

      const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`
      const body = { email_address: email, status: 'subscribed' }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `apikey ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (response.status === 200 || response.status === 201) {
        return res.status(200).json({ message: 'Thanks for subscribing! Check your email.' })
      }

      // Mailchimp may return 400 if already subscribed — handle gracefully
      if (data.title === 'Member Exists') {
        return res.status(200).json({ message: 'You are already subscribed.' })
      }

      console.error('Mailchimp error:', data)
      return res.status(500).json({ message: 'Subscription failed' })
    } catch (error) {
      console.error('Subscription error:', error)
      return res.status(500).json({ message: 'Subscription failed' })
    }
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).json({ message: 'Method not allowed' })
}
