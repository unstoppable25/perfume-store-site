import { getUserByEmailOrPhone } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const user = await getUserByEmailOrPhone(email)
    
    return res.status(200).json({
      exists: !!user
    })
  } catch (err) {
    console.error('Check email error:', err)
    return res.status(500).json({ message: 'Failed to check email' })
  }
}
