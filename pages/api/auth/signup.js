import { createUser, getUserByEmailOrPhone } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { firstName, lastName, email, phone, password } = req.body

    console.log('Signup request received:', { firstName, lastName, email, phone })

    if (!firstName || !lastName || !email || !phone || !password) {
      console.log('Missing fields')
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    if (password.length < 6) {
      console.log('Password too short')
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = await getUserByEmailOrPhone(email)
    if (existingUser) {
      console.log('Email already exists:', email)
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    const existingPhone = await getUserByEmailOrPhone(phone)
    if (existingPhone) {
      console.log('Phone already exists:', phone)
      return res.status(400).json({ success: false, message: 'Phone number already registered' })
    }

    // Create new user
    const user = {
      id: 'USER-' + Date.now(),
      firstName,
      lastName,
      email,
      phone,
      password,
      createdAt: new Date().toISOString()
    }

    console.log('Creating user:', user.id)
    const savedUser = await createUser(user)
    console.log('User created successfully:', savedUser.id)

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword
    })

  } catch (err) {
    console.error('Sign up error:', err)
    return res.status(500).json({ success: false, message: 'Failed to create account: ' + err.message })
  }
}
