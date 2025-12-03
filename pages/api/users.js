import { getAllUsers } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const users = await getAllUsers()
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)
    
    return res.status(200).json({ success: true, users: usersWithoutPasswords })
  } catch (err) {
    console.error('Get users error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch users' })
  }
}
