import { getAllMessages } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const messages = await getAllMessages()
    return res.status(200).json({ success: true, messages })
  } catch (err) {
    console.error('Get messages error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' })
  }
}
