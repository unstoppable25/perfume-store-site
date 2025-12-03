import { createUser, getUserByEmailOrPhone } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { firstName, lastName, email, phone, password } = req.body

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = await getUserByEmailOrPhone(email)
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    const existingPhone = await getUserByEmailOrPhone(phone)
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' })
    }

    // Create new user (in production, hash the password!)
    const user = {
      id: 'USER-' + Date.now(),
      firstName,
      lastName,
      email,
      phone,
      password, // In production, use bcrypt to hash this!
      createdAt: new Date().toISOString()
    }

    await createUser(user)

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword
    })

  } catch (err) {
    console.error('Sign up error:', err)
    return res.status(500).json({ success: false, message: 'Failed to create account' })
  }
}
