import { updateUser } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { userId, firstName, lastName, email, phone } = req.body

      if (!userId || !firstName || !lastName || !email) {
        return res.status(400).json({ success: false, message: 'Missing required fields' })
      }

      const updatedUser = await updateUser(userId, {
        firstName,
        lastName,
        email,
        phone
      })

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      return res.status(200).json({ success: true, user: updatedUser })
    } catch (err) {
      console.error('Update user error:', err)
      return res.status(500).json({ success: false, message: 'Failed to update user' })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
