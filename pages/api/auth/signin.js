import { getUserByEmailOrPhone } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { emailOrPhone, password } = req.body

    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, message: 'Email/phone and password are required' })
    }

    // Find user
    const user = await getUserByEmailOrPhone(emailOrPhone)

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Check password (in production, use bcrypt.compare!)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      user: userWithoutPassword
    })

  } catch (err) {
    console.error('Sign in error:', err)
    return res.status(500).json({ success: false, message: 'Failed to sign in' })
  }
}
