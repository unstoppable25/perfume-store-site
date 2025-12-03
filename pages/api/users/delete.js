import { deleteUser } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' })
    }

    const result = await deleteUser(userId)
    
    if (result.success) {
      return res.status(200).json(result)
    } else {
      return res.status(500).json(result)
    }

  } catch (err) {
    console.error('Delete user error:', err)
    return res.status(500).json({ success: false, message: 'Failed to delete user: ' + err.message })
  }
}
